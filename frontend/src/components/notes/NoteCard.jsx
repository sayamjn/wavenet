import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useNotes from '../../hooks/useNotes';
import { toast } from 'react-hot-toast';

const NoteCard = ({ note }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const isOwner = note.createdBy._id === user._id;
  
  const userCollaboration = note.collaborators.find(
    collab => collab.userId._id === user._id
  );
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  const handleOpenNote = () => {
    navigate(`/notes/${note._id}`);
  };
  
  const handleDeleteNote = async (e) => {
    e.stopPropagation();
    
    if (!isOwner) {
      toast.error('Only the owner can delete this note');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        setIsDeleting(true);
        await deleteNote(note._id);
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error('Failed to delete note');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer transition hover:shadow-lg relative"
      onClick={handleOpenNote}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-800 truncate" title={note.title}>
          {note.title}
        </h3>
        
        <div className="relative">
          <button 
            onClick={toggleOptions}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Note options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                {isOwner && (
                  <button
                    onClick={handleDeleteNote}
                    disabled={isDeleting}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Note'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          {truncateContent(note.content)}
        </p>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="mr-2">
            {isOwner ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Owner</span>
            ) : (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {userCollaboration?.permission === 'write' ? 'Can edit' : 'Read only'}
              </span>
            )}
          </span>
          
          {note.collaborators.length > 0 && (
            <span className="flex items-center" title="Shared with">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {note.collaborators.length}
            </span>
          )}
        </div>
        
        <span title={`Last updated: ${formatDate(note.lastUpdated)}`}>
          {formatDate(note.lastUpdated)}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;