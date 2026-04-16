import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FeatureProvider } from './context/FeatureContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import './App.css';
import Header from './components/Header';
import { ToastProvider } from './components/ToastProvider';

// Code splitting: lazy-load heavy pages
const Admin = React.lazy(() => import('./pages/Admin'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Assessments = React.lazy(() => import('./pages/Assessments'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <FeatureProvider>
        <AuthProvider>
          <ToastProvider>
          <Router>
            <a href="#main-content" className="skip-link">Saltar al contenido</a>
            <Header />
            <main id="main-content">
              <Suspense fallback={<div className="loading">Cargando...</div>}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/course/:id" element={<CourseDetail />} />
                  <Route path="/lesson/:id" element={<Lesson />} />
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute>
                        <Admin />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/assessments" element={<Assessments />} />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
          </Router>
          </ToastProvider>
        </AuthProvider>
      </FeatureProvider>
    </ThemeProvider>
  );
}

export default App;
