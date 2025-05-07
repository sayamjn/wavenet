import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useNotes from '../../hooks/useNotes';
import NoteEditor from '../../components/notes/NoteEditor';
import Sidebar from '../../components/layout/Sidebar';
import { toast } from 'react-hot-toast';

const EditNotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNoteById, currentNote, loading, error } = useNotes();
  
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
  }, [id, getNoteById, navigate]);
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          
          {loading && !currentNote ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <NoteEditor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditNotePage;