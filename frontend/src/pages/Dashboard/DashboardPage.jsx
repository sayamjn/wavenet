import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useNotes from '../../hooks/useNotes';
import Sidebar from '../../components/layout/Sidebar';
import NotesList from '../../components/notes/NotesList';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const { filter } = useParams();
  const navigate = useNavigate();
  const { subscribe } = useSocket();
  const { getNoteById } = useNotes();
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    if (filter === 'my-notes') {
      setActiveFilter('owned');
    } else if (filter === 'shared') {
      setActiveFilter('shared');
    } else {
      setActiveFilter('all');
    }
  }, [filter]);
  
  useEffect(() => {
    const unsubscribe = subscribe('note-updated', async (data) => {
      if (data.updatedBy._id !== JSON.parse(localStorage.getItem('user'))?._id) {
        toast(
          (t) => (
            <div className="flex items-start">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {data.updatedBy.name} updated a note
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {data.note.title}
                </p>
                <div className="mt-2 flex">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(`/notes/${data.note._id}`);
                    }}
                    className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    View note
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            duration: 5000,
          }
        );
      }
    });
    
    return unsubscribe;
  }, [subscribe, navigate, getNoteById]);
  
  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'owned':
        return 'My Notes';
      case 'shared':
        return 'Shared with Me';
      default:
        return 'All Notes';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getFilterTitle()}
            </h1>
          </div>
          
          <NotesList filter={activeFilter} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;