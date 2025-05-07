import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useNotes from '../../hooks/useNotes';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import ShareModal from './ShareModal';
import { toast } from 'react-hot-toast';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentNote, 
    getNoteById, 
    updateNote, 
    updateCurrentNoteContent, 
    loading, 
    error,
    clearError 
  } = useNotes();
  
  const { 
    isConnected, 
    joinNote, 
    leaveNote, 
    updateNoteContent, 
    subscribe 
  } = useSocket();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const saveTimeoutRef = useRef(null);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        await getNoteById(id);
      } catch (err) {
        toast.error('Failed to load note');
        navigate('/dashboard');
      }
    };
    
    if (id) {
      fetchNote();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, getNoteById, navigate]);
  
  useEffect(() => {
    if (currentNote && isConnected) {
      joinNote(currentNote._id);
      
      const unsubscribe = subscribe('note-content-updated', (data) => {
        if (data.noteId === currentNote._id && data.updatedBy._id !== user._id) {
          updateCurrentNoteContent(data.content);
          toast.success(`${data.updatedBy.name} updated this note`);
        }
      });
      
      return () => {
        leaveNote(currentNote._id);
        unsubscribe();
      };
    }
  }, [currentNote, isConnected, joinNote, leaveNote, subscribe, updateCurrentNoteContent, user._id]);
  
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      
      const isOwner = currentNote.createdBy._id === user._id;
      const collaborator = currentNote.collaborators.find(
        collab => collab.userId._id === user._id
      );
      
      setIsEditable(isOwner || (collaborator && collaborator.permission === 'write'));
    }
  }, [currentNote, user._id]);
  
  useEffect(() => {
    const autoSave = async () => {
      if (!id || !isEditable || !title || title === currentNote.title && content === currentNote.content) {
        return;
      }
      
      try {
        setIsSaving(true);
        await updateNote(id, { title, content });
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (err) {
        toast.error('Failed to save note');
        setIsSaving(false);
      }
    };
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(autoSave, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [id, title, content, isEditable, updateNote, currentNote]);
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (isConnected && currentNote) {
      updateNoteContent(currentNote._id, newContent, {
        start: e.target.selectionStart,
        end: e.target.selectionEnd
      });
    }
  };
  
  const handleSave = async () => {
    try {
      if (!title.trim()) {
        toast.error('Title cannot be empty');
        return;
      }
      
      setIsSaving(true);
      await updateNote(id, { title, content });
      setLastSaved(new Date());
      toast.success('Note saved successfully');
      setIsSaving(false);
    } catch (err) {
      toast.error('Failed to save note');
      setIsSaving(false);
    }
  };
  
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(lastSaved);
  };
  
  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };
  
  if (loading && !currentNote) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>{error}</p>
        <button 
          onClick={clearError}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  if (!currentNote) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p>Note not found</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-2 text-sm text-yellow-600 hover:text-yellow-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          disabled={!isEditable}
          className={`text-3xl font-bold w-full focus:outline-none ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          placeholder="Note Title"
        />
        
        <div className="flex items-center space-x-4">
          {currentNote.createdBy._id === user._id && (
            <button
              onClick={toggleShareModal}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Share
            </button>
          )}
          
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <span>
          Owner: {currentNote.createdBy.name} 
          {currentNote.createdBy._id === user._id ? ' (you)' : ''}
        </span>
        
        {currentNote.createdBy._id !== user._id && (
          <span className="ml-4">
            Your access: {isEditable ? 'Can edit' : 'Read only'}
          </span>
        )}
        
        {lastSaved && (
          <span className="ml-auto">
            Last saved: {formatLastSaved()}
          </span>
        )}
      </div>
      
      {currentNote.collaborators.length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">Collaborators: </span>
          <div className="flex flex-wrap mt-1">
            {currentNote.collaborators.map(collab => (
              <div key={collab.userId._id} className="mr-2 mb-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                {collab.userId.name} ({collab.permission})
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          disabled={!isEditable}
          className={`w-full h-96 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          placeholder="Start writing here..."
        ></textarea>
      </div>
      
      <div className="mt-2 flex items-center text-sm">
        <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-gray-500">
          {isConnected ? 'Connected for real-time collaboration' : 'Disconnected'}
        </span>
      </div>
      
      {isShareModalOpen && (
        <ShareModal
          note={currentNote}
          onClose={toggleShareModal}
        />
      )}
    </div>
  );
};

export default NoteEditor;