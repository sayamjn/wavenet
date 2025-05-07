import { createContext, useEffect, useReducer } from 'react';
import { getCurrentUser, login as loginService, register as registerService, logout as logoutService } from '../services/authService';

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

export const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const user = getCurrentUser();
      
      if (user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: user
        });
      } else {
        dispatch({
          type: 'AUTH_ERROR',
          payload: null
        });
      }
    };
    
    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await registerService(userData);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: data.user
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: error.message || 'Registration failed'
      });
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOADING' });
      const data = await loginService(credentials);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data.user
      });
      
      return data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.message || 'Login failed'
      });
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      register,
      login,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;