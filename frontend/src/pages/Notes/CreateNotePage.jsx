import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotes from '../../hooks/useNotes';
import Sidebar from '../../components/layout/Sidebar';
import { toast } from 'react-hot-toast';

const CreateNotePage = () => {
  const navigate = useNavigate();
  const { createNote, loading, error } = useNotes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (titleError) setTitleError('');
  };
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const note = await createNote({ title, content });
      toast.success('Note created successfully');
      navigate(`/notes/${note._id}`);
    } catch (err) {
      toast.error(error || 'Failed to create note');
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create New Note
            </h1>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-3 py-2 border ${
                    titleError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Enter note title"
                />
                {titleError && (
                  <p className="mt-1 text-sm text-red-600">{titleError}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  rows="12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Start writing your note here..."
                ></textarea>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNotePage;