import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, ProgressBar } from 'react-bootstrap';

const StudyPlan = () => {
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([
    {
      id: 1,
      title: 'Mathematics Mastery',
      description: 'Complete calculus and linear algebra fundamentals',
      progress: 65,
      dueDate: '2025-09-15',
      status: 'active',
      topics: ['Calculus', 'Linear Algebra', 'Statistics']
    },
    {
      id: 2,
      title: 'Computer Science Fundamentals',
      description: 'Data structures, algorithms, and programming concepts',
      progress: 30,
      dueDate: '2025-10-30',
      status: 'active',
      topics: ['Data Structures', 'Algorithms', 'Programming']
    },
    {
      id: 3,
      title: 'Physics Review',
      description: 'Classical mechanics and thermodynamics review',
      progress: 100,
      dueDate: '2025-08-20',
      status: 'completed',
      topics: ['Mechanics', 'Thermodynamics']
    }
  ]);

  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    dueDate: '',
    topics: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const plan = {
      id: plans.length + 1,
      ...newPlan,
      progress: 0,
      status: 'active',
      topics: newPlan.topics.split(',').map(topic => topic.trim())
    };
    setPlans([...plans, plan]);
    setNewPlan({ title: '', description: '', dueDate: '', topics: '' });
    setShowModal(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'overdue': return 'danger';
      default: return 'secondary';
    }
  };

  const getProgressVariant = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-2">Study Plans</h1>
              <p className="text-muted">Organize and track your learning goals</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowModal(true)}
              className="btn-study-primary"
            >
              + New Plan
            </Button>
          </div>
        </Col>
      </Row>

      {/* Plans Grid */}
      <Row className="g-4">
        {plans.map(plan => (
          <Col lg={4} md={6} key={plan.id}>
            <Card className="border-0 shadow-sm card-hover h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Badge bg={getStatusVariant(plan.status)} className="text-capitalize">
                    {plan.status}
                  </Badge>
                  <small className="text-muted">
                    Due: {new Date(plan.dueDate).toLocaleDateString()}
                  </small>
                </div>
                
                <Card.Title className="h5 mb-3">{plan.title}</Card.Title>
                <Card.Text className="text-muted mb-3">{plan.description}</Card.Text>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Progress</small>
                    <small className="fw-semibold">{plan.progress}%</small>
                  </div>
                  <ProgressBar 
                    now={plan.progress} 
                    variant={getProgressVariant(plan.progress)}
                    className="mb-3"
                  />
                </div>
                
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Topics:</small>
                  <div className="d-flex flex-wrap gap-1">
                    {plan.topics.map((topic, index) => (
                      <Badge key={index} bg="light" text="dark" className="fw-normal">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" size="sm">
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* New Plan Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Study Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Plan Title</Form.Label>
              <Form.Control
                type="text"
                value={newPlan.title}
                onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                placeholder="Enter study plan title"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                placeholder="Describe your study goals and objectives"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newPlan.dueDate}
                onChange={(e) => setNewPlan({...newPlan, dueDate: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Topics (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={newPlan.topics}
                onChange={(e) => setNewPlan({...newPlan, topics: e.target.value})}
                placeholder="e.g., Algebra, Calculus, Statistics"
                required
              />
              <Form.Text className="text-muted">
                Separate multiple topics with commas
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn-study-primary">
                Create Plan
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudyPlan;