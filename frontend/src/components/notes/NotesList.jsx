import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useNotes from '../../hooks/useNotes';
import NoteCard from './NoteCard';

const NotesList = ({ filter = 'all' }) => {
  const { notes, pagination, getNotes, loading, error } = useNotes();
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        await getNotes({ 
          page: currentPage,
          limit: 10,
          filter,
          archived: false
        });
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };
    
    fetchNotes();
  }, [getNotes, currentPage, filter]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:pointer-events-none"
        >
          &laquo; Previous
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="px-3 py-1 mx-1 rounded bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:pointer-events-none"
        >
          Next &raquo;
        </button>
      </div>
    );
  };
  
  if (loading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p>{error}</p>
      </div>
    );
  }
  
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
        <p className="text-gray-500 mb-6">
          {filter === 'owned' 
            ? "You haven't created any notes yet."
            : filter === 'shared'
              ? "No notes have been shared with you."
              : "No notes found."}
        </p>
        <Link
          to="/notes/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Note
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard key={note._id} note={note} />
        ))}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default NotesList;