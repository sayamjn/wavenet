import { createContext, useReducer, useCallback } from 'react';
import {
  getNotes as getNotesService,
  getNoteById as getNoteByIdService,
  createNote as createNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
  shareNote as shareNoteService,
  removeAccess as removeAccessService
} from '../services/noteService';

const initialState = {
  notes: [],
  currentNote: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalResults: 0
  },
  loading: false,
  error: null
};

export const NoteContext = createContext(initialState);

const noteReducer = (state, action) => {
  switch (action.type) {
    case 'GET_NOTES_SUCCESS':
      return {
        ...state,
        notes: action.payload.data,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    case 'GET_NOTE_SUCCESS':
      return {
        ...state,
        currentNote: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_CURRENT_NOTE':
      return {
        ...state,
        currentNote: {
          ...state.currentNote,
          ...action.payload
        }
      };
    case 'CREATE_NOTE_SUCCESS':
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        currentNote: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_NOTE_SUCCESS':
      return {
        ...state,
        notes: state.notes.map(note => 
          note._id === action.payload._id ? action.payload : note
        ),
        currentNote: action.payload,
        loading: false,
        error: null
      };
    case 'DELETE_NOTE_SUCCESS':
      return {
        ...state,
        notes: state.notes.filter(note => note._id !== action.payload),
        currentNote: state.currentNote && state.currentNote._id === action.payload ? null : state.currentNote,
        loading: false,
        error: null
      };
    case 'SHARE_NOTE_SUCCESS':
    case 'REMOVE_ACCESS_SUCCESS':
      return {
        ...state,
        currentNote: action.payload,
        notes: state.notes.map(note => 
          note._id === action.payload._id ? action.payload : note
        ),
        loading: false,
        error: null
      };
    case 'NOTE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_CURRENT_NOTE':
      return {
        ...state,
        currentNote: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'LOADING':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

export const NoteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  const getNotes = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await getNotesService(params);
      
      dispatch({
        type: 'GET_NOTES_SUCCESS',
        payload: data
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to fetch notes'
      });
      throw error;
    }
  }, []);

  const getNoteById = useCallback(async (id) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await getNoteByIdService(id);
      
      dispatch({
        type: 'GET_NOTE_SUCCESS',
        payload: data.data
      });
      
      return data.data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to fetch note'
      });
      throw error;
    }
  }, []);

  const updateCurrentNoteContent = useCallback((content) => {
    dispatch({
      type: 'UPDATE_CURRENT_NOTE',
      payload: { content }
    });
  }, []);

  const createNote = useCallback(async (noteData) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await createNoteService(noteData);
      
      dispatch({
        type: 'CREATE_NOTE_SUCCESS',
        payload: data.data
      });
      
      return data.data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to create note'
      });
      throw error;
    }
  }, []);

  const updateNote = useCallback(async (id, noteData) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await updateNoteService(id, noteData);
      
      dispatch({
        type: 'UPDATE_NOTE_SUCCESS',
        payload: data.data
      });
      
      return data.data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to update note'
      });
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id) => {
    try {
      dispatch({ type: 'LOADING' });
      await deleteNoteService(id);
      
      dispatch({
        type: 'DELETE_NOTE_SUCCESS',
        payload: id
      });
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to delete note'
      });
      throw error;
    }
  }, []);

  const shareNote = useCallback(async (id, shareData) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await shareNoteService(id, shareData);
      
      dispatch({
        type: 'SHARE_NOTE_SUCCESS',
        payload: data.data
      });
      
      return data.data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to share note'
      });
      throw error;
    }
  }, []);

  const removeAccess = useCallback(async (noteId, userId) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await removeAccessService(noteId, userId);
      
      dispatch({
        type: 'REMOVE_ACCESS_SUCCESS',
        payload: data.data
      });
      
      return data.data;
    } catch (error) {
      dispatch({
        type: 'NOTE_ERROR',
        payload: error.message || 'Failed to remove access'
      });
      throw error;
    }
  }, []);

  const clearCurrentNote = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_NOTE' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <NoteContext.Provider value={{
      ...state,
      getNotes,
      getNoteById,
      updateCurrentNoteContent,
      createNote,
      updateNote,
      deleteNote,
      shareNote,
      removeAccess,
      clearCurrentNote,
      clearError
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;