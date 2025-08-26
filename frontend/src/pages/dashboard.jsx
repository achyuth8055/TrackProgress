import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import Timer from '../components/Timer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalStudyTime: '12h 34m',
    completedSessions: 28,
    activeTopics: 5,
    weeklyGoal: 75
  });

  useEffect(() => {
    // Mock user data - replace with actual API call
    const userData = {
      username: 'Student',
      email: 'student@example.com'
    };
    setUser(userData);
  }, []);

  const quickActions = [
    { title: 'Start Quick Session', icon: '▶️', action: () => console.log('Quick session') },
    { title: 'Review Topics', icon: '📚', action: () => console.log('Review topics') },
    { title: 'Join Study Group', icon: '👥', action: () => console.log('Join group') },
    { title: 'Update Plan', icon: '📅', action: () => console.log('Update plan') }
  ];

  const recentActivity = [
    { action: 'Completed Math session', time: '2 hours ago', type: 'success' },
    { action: 'Joined Physics study group', time: '1 day ago', type: 'info' },
    { action: 'Updated study plan', time: '2 days ago', type: 'warning' },
    { action: 'Achieved weekly goal', time: '3 days ago', type: 'success' }
  ];

  return (
    <Container className="py-4">
      {/* Welcome Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6 fw-bold mb-2">
            Welcome back, {user?.username || 'Student'}! 👋
          </h1>
          <p className="text-muted">Here's your study progress overview</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="text-center">
              <div className="mb-2 text-primary" style={{ fontSize: '2rem' }}>⏱️</div>
              <Card.Title className="h4">{stats.totalStudyTime}</Card.Title>
              <Card.Text className="text-muted">Total Study Time</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="text-center">
              <div className="mb-2 text-success" style={{ fontSize: '2rem' }}>✅</div>
              <Card.Title className="h4">{stats.completedSessions}</Card.Title>
              <Card.Text className="text-muted">Completed Sessions</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="text-center">
              <div className="mb-2 text-info" style={{ fontSize: '2rem' }}>📚</div>
              <Card.Title className="h4">{stats.activeTopics}</Card.Title>
              <Card.Text className="text-muted">Active Topics</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm card-hover">
            <Card.Body className="text-center">
              <div className="mb-2 text-warning" style={{ fontSize: '2rem' }}>🎯</div>
              <Card.Title className="h4">{stats.weeklyGoal}%</Card.Title>
              <Card.Text className="text-muted">Weekly Goal</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Timer Widget */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 pb-0">
              <Card.Title className="h4 mb-0">Study Timer</Card.Title>
            </Card.Header>
            <Card.Body>
              <Timer />
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 pb-0">
              <Card.Title className="h4 mb-0">Quick Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {quickActions.map((action, index) => (
                  <Col sm={6} key={index}>
                    <Button
                      variant="outline-primary"
                      className="w-100 d-flex align-items-center justify-content-center p-3"
                      onClick={action.action}
                    >
                      <span className="me-2" style={{ fontSize: '1.2rem' }}>
                        {action.icon}
                      </span>
                      {action.title}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 pb-0">
              <Card.Title className="h4 mb-0">Recent Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="list-group-item border-0 px-0">
                    <div className="d-flex align-items-center">
                      <Badge 
                        bg={activity.type} 
                        className="rounded-circle p-2 me-3"
                        style={{ width: '8px', height: '8px' }}
                      />
                      <div className="flex-grow-1">
                        <p className="mb-1">{activity.action}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Progress Chart Placeholder */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 pb-0">
              <Card.Title className="h4 mb-0">Weekly Progress</Card.Title>
            </Card.Header>
            <Card.Body className="text-center">
              <div 
                className="bg-light rounded-3 d-flex align-items-center justify-content-center"
                style={{ height: '200px' }}
              >
                <div className="text-muted">
                  <div style={{ fontSize: '3rem' }}>📊</div>
                  <p>Progress Chart</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;