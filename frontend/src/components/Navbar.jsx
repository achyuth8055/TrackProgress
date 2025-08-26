// src/components/Navbar.jsx
import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ theme, toggleTheme, isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <BootstrapNavbar bg={theme === 'dark' ? 'dark' : 'light'} variant={theme} expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={NavLink} to="/" className="fw-bold">
          📚 StudyApp
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={NavLink} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/study-plan">
                  Study Plan
                </Nav.Link>
                <Nav.Link as={NavLink} to="/topics">
                  Topics
                </Nav.Link>
                <Nav.Link as={NavLink} to="/study-groups">
                  Study Groups
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              className="me-2"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>

            {isAuthenticated ? (
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="me-2">
                  Login
                </Nav.Link>
                <Button as={NavLink} to="/signup" variant="study-primary" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;