import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, InputGroup } from 'react-bootstrap';

const Topics = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: 'Calculus I',
      category: 'Mathematics',
      difficulty: 'Intermediate',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      description: 'Limits, derivatives, and basic integration techniques',
      tags: ['Limits', 'Derivatives', 'Integration']
    },
    {
      id: 2,
      title: 'Data Structures',
      category: 'Computer Science',
      difficulty: 'Advanced',
      progress: 45,
      totalLessons: 16,
      completedLessons: 7,
      description: 'Arrays, linked lists, trees, graphs, and hash tables',
      tags: ['Arrays', 'Trees', 'Graphs', 'Hash Tables']
    },
    {
      id: 3,
      title: 'Classical Physics',
      category: 'Physics',
      difficulty: 'Beginner',
      progress: 90,
      totalLessons: 10,
      completedLessons: 9,
      description: 'Newton\'s laws, energy, momentum, and motion',
      tags: ['Mechanics', 'Energy', 'Motion']
    },
    {
      id: 4,
      title: 'Organic Chemistry',
      category: 'Chemistry',
      difficulty: 'Advanced',
      progress: 20,
      totalLessons: 14,
      completedLessons: 3,
      description: 'Carbon compounds, functional groups, and reactions',
      tags: ['Organic', 'Reactions', 'Compounds']
    }
  ]);

  const [newTopic, setNewTopic] = useState({
    title: '',
    category: '',
    difficulty: 'Beginner',
    description: '',
    tags: '',
    totalLessons: ''
  });

  const categories = ['all', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const topic = {
      id: topics.length + 1,
      ...newTopic,
      progress: 0,
      completedLessons: 0,
      totalLessons: parseInt(newTopic.totalLessons),
      tags: newTopic.tags.split(',').map(tag => tag.trim())
    };
    setTopics([...topics, topic]);
    setNewTopic({
      title: '',
      category: '',
      difficulty: 'Beginner',
      description: '',
      tags: '',
      totalLessons: ''
    });
    setShowModal(false);
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyVariant = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
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
              <h1 className="display-6 fw-bold mb-2">Study Topics</h1>
              <p className="text-muted">Manage your learning subjects and track progress</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowModal(true)}
              className="btn-study-primary"
            >
              + Add Topic
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Topics Grid */}
      <Row className="g-4">
        {filteredTopics.map(topic => (
          <Col lg={6} xl={4} key={topic.id}>
            <Card className="border-0 shadow-sm card-hover h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Badge bg={getDifficultyVariant(topic.difficulty)}>
                    {topic.difficulty}
                  </Badge>
                  <small className="text-muted">{topic.category}</small>
                </div>
                
                <Card.Title className="h5 mb-3">{topic.title}</Card.Title>
                <Card.Text className="text-muted mb-3">{topic.description}</Card.Text>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Progress</small>
                    <small className="fw-semibold">
                      {topic.completedLessons}/{topic.totalLessons} lessons ({topic.progress}%)
                    </small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar bg-${getProgressVariant(topic.progress)}`}
                      role="progressbar" 
                      style={{ width: `${topic.progress}%` }}
                      aria-valuenow={topic.progress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Tags:</small>
                  <div className="d-flex flex-wrap gap-1">
                    {topic.tags.map((tag, index) => (
                      <Badge key={index} bg="light" text="dark" className="fw-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="d-grid gap-2 d-md-flex">
                  <Button variant="primary" size="sm" className="flex-fill">
                    Continue
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredTopics.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <div className="text-muted">
              <div style={{ fontSize: '4rem' }}>📚</div>
              <h4>No topics found</h4>
              <p>Try adjusting your search or add a new topic to get started.</p>
            </div>
          </Col>
        </Row>
      )}

      {/* Add Topic Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Topic Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                    placeholder="Enter topic title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTopic.category}
                    onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                    placeholder="e.g., Mathematics, Physics"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty Level</Form.Label>
                  <Form.Select
                    value={newTopic.difficulty}
                    onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
                  >
                    {difficulties.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Lessons</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={newTopic.totalLessons}
                    onChange={(e) => setNewTopic({...newTopic, totalLessons: e.target.value})}
                    placeholder="Number of lessons"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTopic.description}
                onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                placeholder="Describe what this topic covers"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={newTopic.tags}
                onChange={(e) => setNewTopic({...newTopic, tags: e.target.value})}
                placeholder="e.g., Algebra, Functions, Graphs"
                required
              />
              <Form.Text className="text-muted">
                Separate multiple tags with commas
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="btn-study-primary">
                Add Topic
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Topics;