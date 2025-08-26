import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Container } from 'react-bootstrap';
import client from './apollo/client';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/landingpage.jsx'
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import Dashboard from './pages/dashboard.jsx';
import StudyPlan from './pages/studyplan.jsx';
import Topics from './pages/topics.jsx';
import StudyGroups from './pages/studygroup.jsx';

function App() {
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }

    // Check for authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
  };

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <Router>
          <div className="App" data-bs-theme={theme}>
            <Navbar 
              theme={theme} 
              toggleTheme={toggleTheme}
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
            <Container fluid className="p-0">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study-plan" element={<StudyPlan />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/study-groups" element={<StudyGroups />} />
              </Routes>
            </Container>
          </div>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
