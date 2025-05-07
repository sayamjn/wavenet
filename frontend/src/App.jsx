import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NoteProvider } from './context/NoteContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Header from './components/layout/Header';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateNotePage from './pages/Notes/CreateNotePage';
import EditNotePage from './pages/Notes/EditNotePage';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NoteProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard/:filter" 
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/notes/new" 
                  element={
                    <PrivateRoute>
                      <CreateNotePage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/notes/:id" 
                  element={
                    <PrivateRoute>
                      <EditNotePage />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/" 
                  element={<Navigate to="/dashboard" replace />} 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#fff',
                  color: '#333',
                },
              }}
            />
          </div>
        </NoteProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;