import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Dropdown } from 'react-bootstrap';
import Timer from '../components/Timer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats] = useState({
    totalStudyTime: 754, // in minutes
    completedSessions: 28,
    activeTopics: 5,
    weeklyGoal: 75,
    currentStreak: 7,
    totalPoints: 2840
  });

  useEffect(() => {
    // Mock user data - replace with actual API call
    const userData = {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };
    setUser(userData);
  }, []);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const quickActions = [
    { 
      title: 'Start Focus Session', 
      icon: '🎯', 
      color: 'primary',
      description: 'Begin a focused study session',
      action: () => console.log('Focus session') 
    },
    { 
      title: 'Review Flashcards', 
      icon: '🃏', 
      color: 'success',
      description: 'Practice with your flashcards',
      action: () => console.log('Review flashcards') 
    },
    { 
      title: 'Join Study Room', 
      icon: '👥', 
      color: 'info',
      description: 'Collaborate with peers',
      action: () => console.log('Join room') 
    },
    { 
      title: 'AI Assistant', 
      icon: '🤖', 
      color: 'warning',
      description: 'Get help from AI tutor',
      action: () => console.log('AI assistant') 
    }
  ];

  const recentActivity = [
    { 
      action: 'Completed Advanced Calculus session', 
      time: '2 hours ago', 
      type: 'success',
      icon: '✅',
      points: '+50 XP'
    },
    { 
      action: 'Joined Physics Study Group', 
      time: '1 day ago', 
      type: 'info',
      icon: '👥',
      points: '+25 XP'
    },
    { 
      action: 'Achieved 7-day study streak', 
      time: '2 days ago', 
      type: 'warning',
      icon: '🔥',
      points: '+100 XP'
    },
    { 
      action: 'Mastered Organic Chemistry topic', 
      time: '3 days ago', 
      type: 'success',
      icon: '🏆',
      points: '+75 XP'
    }
  ];

  const upcomingTasks = [
    { task: 'Physics Quiz Review', due: 'Today, 3:00 PM', priority: 'high' },
    { task: 'Math Assignment Chapter 5', due: 'Tomorrow, 11:59 PM', priority: 'medium' },
    { task: 'Chemistry Lab Report', due: 'Friday, 5:00 PM', priority: 'low' },
    { task: 'Literature Essay Draft', due: 'Next Monday', priority: 'medium' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container fluid className="py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <img 
                    src={user?.avatar || 'https://via.placeholder.com/60'} 
                    alt="Profile" 
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <h1 className="h3 mb-1 fw-bold">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'Student'}! 👋
                  </h1>
                  <p className="text-muted mb-0">Ready to continue your learning journey?</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="primary" className="me-2 px-3 py-2">
                  🔥 {stats.currentStreak} day streak
                </Badge>
                <Badge bg="warning" className="px-3 py-2">
                  ⭐ {stats.totalPoints.toLocaleString()} XP
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4 g-4">
          <Col xl={3} lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Card.Body className="text-white text-center">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>⏱️</div>
                <h3 className="fw-bold mb-1">{formatTime(stats.totalStudyTime)}</h3>
                <p className="mb-0 opacity-75">Total Study Time</p>
                <div className="mt-3">
                  <small className="opacity-75">+2h 15m this week</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Card.Body className="text-white text-center">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>✅</div>
                <h3 className="fw-bold mb-1">{stats.completedSessions}</h3>
                <p className="mb-0 opacity-75">Completed Sessions</p>
                <div className="mt-3">
                  <small className="opacity-75">+5 this week</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Card.Body className="text-white text-center">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>📚</div>
                <h3 className="fw-bold mb-1">{stats.activeTopics}</h3>
                <p className="mb-0 opacity-75">Active Topics</p>
                <div className="mt-3">
                  <small className="opacity-75">2 mastered this month</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6}>
            <Card className="border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <Card.Body className="text-white text-center">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>🎯</div>
                <h3 className="fw-bold mb-1">{stats.weeklyGoal}%</h3>
                <p className="mb-0 opacity-75">Weekly Goal</p>
                <div className="mt-3">
                  <ProgressBar 
                    now={stats.weeklyGoal} 
                    className="bg-white bg-opacity-25"
                    style={{ height: '6px' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Timer Widget */}
          <Col xl={4} lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold">🎯 Focus Timer</h5>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm" className="border-0">
                      ⚙️
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>Pomodoro (25 min)</Dropdown.Item>
                      <Dropdown.Item>Short Break (5 min)</Dropdown.Item>
                      <Dropdown.Item>Long Break (15 min)</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>Custom Timer</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Header>
              <Card.Body>
                <Timer />
                <div className="mt-4 p-3 bg-light rounded-3">
                  <small className="text-muted d-block mb-1">💡 Pro Tip</small>
                  <small>Take a 5-minute break every 25 minutes to maintain focus and productivity.</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xl={4} lg={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-bold">⚡ Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {quickActions.map((action, index) => (
                    <Col sm={6} key={index}>
                      <Card 
                        className={`border-0 bg-${action.color} bg-opacity-10 card-hover cursor-pointer`}
                        onClick={action.action}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        <Card.Body className="text-center p-3">
                          <div className="mb-2" style={{ fontSize: '1.5rem' }}>
                            {action.icon}
                          </div>
                          <h6 className="mb-1 fw-bold">{action.title}</h6>
                          <small className="text-muted">{action.description}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Upcoming Tasks */}
          <Col xl={4} lg={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold">📋 Upcoming Tasks</h5>
                  <Button variant="outline-primary" size="sm">View All</Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="list-group list-group-flush">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{task.task}</h6>
                          <small className="text-muted">{task.due}</small>
                        </div>
                        <Badge bg={getPriorityColor(task.priority)} className="ms-2">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Activity */}
          <Col xl={6} lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold">📈 Recent Activity</h5>
                  <Button variant="outline-primary" size="sm">View History</Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="list-group list-group-flush">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center me-3 bg-${activity.type} bg-opacity-10`}
                          style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                        >
                          {activity.icon}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 fw-medium">{activity.action}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <Badge bg="light" text="dark" className="ms-2">
                          {activity.points}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Progress Chart */}
          <Col xl={6} lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold">📊 Weekly Progress</h5>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                      This Week
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>This Week</Dropdown.Item>
                      <Dropdown.Item>Last Week</Dropdown.Item>
                      <Dropdown.Item>This Month</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Daily Goal Progress</span>
                    <span className="text-muted">75%</span>
                  </div>
                  <ProgressBar now={75} className="mb-3" style={{ height: '8px' }} />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Weekly Target</span>
                    <span className="text-muted">60%</span>
                  </div>
                  <ProgressBar now={60} variant="success" className="mb-3" style={{ height: '8px' }} />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium">Monthly Goal</span>
                    <span className="text-muted">45%</span>
                  </div>
                  <ProgressBar now={45} variant="info" style={{ height: '8px' }} />
                </div>
                
                <div className="text-center p-4 bg-light rounded-3">
                  <div style={{ fontSize: '3rem' }}>📈</div>
                  <p className="mb-2 fw-medium">Great Progress!</p>
                  <small className="text-muted">You're on track to meet your weekly goal. Keep it up!</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
