import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📅',
      title: 'Study Planning',
      description: 'Create and manage personalized study schedules that adapt to your learning pace.'
    },
    {
      icon: '⏰',
      title: 'Pomodoro Timer',
      description: 'Built-in timer with customizable intervals to boost your productivity and focus.'
    },
    {
      icon: '📚',
      title: 'Topic Management',
      description: 'Organize your subjects and track progress across different areas of study.'
    },
    {
      icon: '👥',
      title: 'Study Groups',
      description: 'Connect with other learners and collaborate on challenging topics.'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-5">
        <Container className="py-5">
          <Row className="align-items-center min-vh-75">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Master Your Studies with Smart Planning
              </h1>
              <p className="lead mb-4">
                Transform your learning experience with our comprehensive study management platform. 
                Plan, track, and achieve your academic goals with intelligent tools designed for success.
              </p>
              <Button 
                size="lg" 
                variant="light"
                className="me-3 px-4 py-2"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline-light"
                className="px-4 py-2"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image p-4">
                <div 
                  className="bg-light rounded-3 shadow-lg p-5"
                  style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div className="text-muted">
                    <h3>📊 Dashboard Preview</h3>
                    <p>Visual representation of your study analytics</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Boost Your Productivity</h2>
              <p className="lead text-muted">
                Everything you need to excel in your studies, all in one powerful platform
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col md={6} lg={3} key={index}>
                <Card className="h-100 border-0 shadow-sm card-hover">
                  <Card.Body className="text-center p-4">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>
                      {feature.icon}
                    </div>
                    <Card.Title className="h5 mb-3">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-light py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="display-5 fw-bold mb-4">
                Ready to Transform Your Study Habits?
              </h2>
              <p className="lead mb-4">
                Join thousands of students who have already improved their academic performance 
                with our study management tools.
              </p>
              <Button 
                size="lg" 
                className="btn-study-primary px-5 py-3"
                onClick={() => navigate('/signup')}
              >
                Let's Get Started
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">&copy; 2025 StudyApp. Built for academic success.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;