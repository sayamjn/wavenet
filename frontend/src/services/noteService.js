import api from './api';

export const getNotes = async (params = {}) => {
  try {
    const response = await api.get('/notes', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch notes');
  }
};

export const getNoteById = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch note');
  }
};

export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create note');
  }
};

export const updateNote = async (id, noteData) => {
  try {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update note');
  }
};

export const deleteNote = async (id) => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete note');
  }
};

export const shareNote = async (id, shareData) => {
  try {
    const response = await api.post(`/notes/${id}/share`, shareData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to share note');
  }
};

export const removeAccess = async (noteId, userId) => {
  try {
    const response = await api.delete(`/notes/${noteId}/share/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to remove access');
  }
};