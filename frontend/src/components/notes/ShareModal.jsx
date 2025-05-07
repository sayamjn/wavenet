import { useState } from 'react';
import useNotes from '../../hooks/useNotes';
import { toast } from 'react-hot-toast';

const ShareModal = ({ note, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { shareNote, removeAccess } = useNotes();
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormError('');
  };
  
  const handlePermissionChange = (e) => {
    setPermission(e.target.value);
  };
  
  const validateForm = () => {
    if (!email) {
      setFormError('Email is required');
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await shareNote(note._id, {
        email,
        permission
      });
      
      toast.success(`Note shared with ${email}`);
      setEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to share note');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveAccess = async (userId) => {
    try {
      setLoading(true);
      
      await removeAccess(note._id, userId);
      
      toast.success('Access removed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to remove access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Note</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">
            Share "{note.title}" with others
          </p>
        </div>
        
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-3 py-2 border ${formError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="user@example.com"
            />
            {formError && (
              <p className="mt-1 text-sm text-red-600">{formError}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="permission" className="block text-sm font-medium text-gray-700 mb-1">
              Permission
            </label>
            <select
              id="permission"
              value={permission}
              onChange={handlePermissionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="read">Read only</option>
              <option value="write">Can edit</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </form>
        
        {note.collaborators && note.collaborators.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              People with access
            </h3>
            <ul className="space-y-2">
              {note.collaborators.map((collab) => (
                <li key={collab.userId._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{collab.userId.name}</p>
                    <p className="text-xs text-gray-500">{collab.userId.email}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs mr-3 text-gray-500">
                      {collab.permission === 'write' ? 'Can edit' : 'Read only'}
                    </span>
                    <button
                      onClick={() => handleRemoveAccess(collab.userId._id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700"
                      title="Remove access"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;