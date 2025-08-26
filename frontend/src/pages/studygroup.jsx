import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, InputGroup } from 'react-bootstrap';

const StudyGroups = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Calculus Study Circle',
      subject: 'Mathematics',
      members: 12,
      maxMembers: 15,
      description: 'Weekly sessions focusing on calculus problems and concepts. All skill levels welcome.',
      schedule: 'Wednesdays 7:00 PM EST',
      isJoined: true,
      difficulty: 'Intermediate',
      tags: ['Calculus', 'Problem Solving', 'Homework Help']
    },
    {
      id: 2,
      name: 'CS Algorithm Masters',
      subject: 'Computer Science',
      members: 8,
      maxMembers: 10,
      description: 'Advanced group for competitive programming and algorithm optimization.',
      schedule: 'Saturdays 2:00 PM EST',
      isJoined: false,
      difficulty: 'Advanced',
      tags: ['Algorithms', 'Data Structures', 'Competitive Programming']
    },
    {
      id: 3,
      name: 'Physics Lab Partners',
      subject: 'Physics',
      members: 6,
      maxMembers: 12,
      description: 'Collaborative problem-solving for physics coursework and lab experiments.',
      schedule: 'Tuesdays & Thursdays 6:00 PM EST',
      isJoined: false,
      difficulty: 'Beginner',
      tags: ['Lab Work', 'Problem Sets', 'Conceptual Learning']
    },
    {
      id: 4,
      name: 'Organic Chemistry Hub',
      subject: 'Chemistry',
      members: 15,
      maxMembers: 15,
      description: 'Full group focused on organic chemistry mechanisms and synthesis.',
      schedule: 'Sundays 4:00 PM EST',
      isJoined: true,
      difficulty: 'Advanced',
      tags: ['Mechanisms', 'Synthesis', 'Reactions']
    }
  ]);

  const [newGroup, setNewGroup] = useState({
    name: '',
    subject: '',
    maxMembers: '',
    description: '',
    schedule: '',
    difficulty: 'Beginner',
    tags: ''
  });

  const subjects = ['all', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const group = {
      id: groups.length + 1,
      ...newGroup,
      members: 1,
      isJoined: true,
      maxMembers: parseInt(newGroup.maxMembers),
      tags: newGroup.tags.split(',').map(tag => tag.trim())
    };
    setGroups([...groups, group]);
    setNewGroup({
      name: '',
      subject: '',
      maxMembers: '',
      description: '',
      schedule: '',
      difficulty: 'Beginner',
      tags: ''
    });
    setShowModal(false);
  };

  const toggleJoin = (groupId) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          isJoined: !group.isJoined,
          members: group.isJoined ? group.members - 1 : group.members + 1
        };
      }
      return group;
    }));
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyVariant = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'secondary';
    }
  };

  const getMembershipStatus = (group) => {
    if (group.members >= group.maxMembers) return 'Full';
    if (group.members / group.maxMembers > 0.8) return 'Almost Full';
    return 'Open';
  };

  const getMembershipVariant = (group) => {
    if (group.members >= group.maxMembers) return 'danger';
    if (group.members / group.maxMembers > 0.8) return 'warning';
    return 'success';
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold mb-2">Study Groups</h1>
              <p className="text-muted">Connect with peers and learn together</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowModal(true)}
              className="btn-study-primary"
            >
              + Create Group
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
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Groups Grid */}
      <Row className="g-4">
        {filteredGroups.map(group => (
          <Col lg={6} xl={4} key={group.id}>
            <Card className="border-0 shadow-sm card-hover h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex gap-2">
                    <Badge bg={getDifficultyVariant(group.difficulty)}>
                      {group.difficulty}
                    </Badge>
                    <Badge bg={getMembershipVariant(group)} className="text-dark">
                      {getMembershipStatus(group)}
                    </Badge>
                  </div>
                  {group.isJoined && (
                    <Badge bg="primary">Joined</Badge>
                  )}
                </div>
                
                <Card.Title className="h5 mb-2">{group.name}</Card.Title>
                <div className="text-muted mb-3">
                  <small>{group.subject}</small>
                </div>
                <Card.Text className="text-muted mb-3">{group.description}</Card.Text>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2 text-muted">
                    <small>👥 {group.members}/{group.maxMembers} members</small>
                  </div>
                  <div className="d-flex align-items-center mb-3 text-muted">
                    <small>🕒 {group.schedule}</small>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex flex-wrap gap-1">
                    {group.tags.map((tag, index) => (
                      <Badge key={index} bg="light" text="dark" className="fw-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <Button
                    variant={group.isJoined ? 'outline-danger' : 'primary'}
                    size="sm"
                    onClick={() => toggleJoin(group.id)}
                    disabled={!group.isJoined && group.members >= group.maxMembers}
                    className={group.isJoined ? '' : 'btn-study-primary'}
                  >
                    {group.isJoined ? 'Leave Group' : 
                     group.members >= group.maxMembers ? 'Group Full' : 'Join Group'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredGroups.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <div className="text-muted">
              <div style={{ fontSize: '4rem' }}>👥</div>
              <h4>No study groups found</h4>
              <p>Try adjusting your search or create a new study group.</p>
            </div>
          </Col>
        </Row>
      )}

      {/* Create Group Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Study Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="Enter group name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    value={newGroup.subject}
                    onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.filter(s => s !== 'all').map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Difficulty Level</Form.Label>
                  <Form.Select
                    value={newGroup.difficulty}
                    onChange={(e) => setNewGroup({...newGroup, difficulty: e.target.value})}
                  >
                    {difficulties.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Members</Form.Label>
                  <Form.Control
                    type="number"
                    min="2"
                    max="50"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup({...newGroup, maxMembers: e.target.value})}
                    placeholder="Maximum number of members"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Schedule</Form.Label>
              <Form.Control
                type="text"
                value={newGroup.schedule}
                onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
                placeholder="e.g., Mondays 7:00 PM EST"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                placeholder="Describe the group's focus and goals"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={newGroup.tags}
                onChange={(e) => setNewGroup({...newGroup, tags: e.target.value})}
                placeholder="e.g., Problem Solving, Homework Help, Test Prep"
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
                Create Group
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudyGroups;