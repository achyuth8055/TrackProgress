import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Form, Badge, Alert, Card } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext';

const Timer = () => {
  const { isGradientTheme } = useTheme();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState('pomodoro');
  const [customMinutes, setCustomMinutes] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [notification, setNotification] = useState('');
  const [sessions, setSessions] = useState(0);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const presetTimers = {
    pomodoro: { 
      name: 'Pomodoro', 
      time: 25 * 60, 
      icon: '🍅',
      color: isGradientTheme ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : '#e53e3e'
    },
    shortBreak: { 
      name: 'Short Break', 
      time: 5 * 60, 
      icon: '☕',
      color: isGradientTheme ? 'linear-gradient(135deg, #4ecdc4, #38a169)' : '#38a169'
    },
    longBreak: { 
      name: 'Long Break', 
      time: 15 * 60, 
      icon: '🛋️',
      color: isGradientTheme ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#5a67d8'
    },
    custom: { 
      name: 'Custom', 
      time: 0, 
      icon: '⚙️',
      color: isGradientTheme ? 'linear-gradient(135deg, #f093fb, #f5576c)' : '#ed64a6'
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setSessions(prev => prev + 1);
    setNotification('🎉 Great work! Timer completed successfully. Take a moment to celebrate your progress.');
    
    // Play notification sound (optional)
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(''), 5000);
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (isCustom) {
      const totalSeconds = (parseInt(customHours) || 0) * 3600 + (parseInt(customMinutes) || 0) * 60;
      setTimeLeft(totalSeconds);
    } else {
      setTimeLeft(presetTimers[selectedTimer].time);
    }
  };

  const selectPresetTimer = (timerType) => {
    if (timerType === 'custom') {
      setIsCustom(true);
      setSelectedTimer(timerType);
    } else {
      setIsCustom(false);
      setSelectedTimer(timerType);
      setTimeLeft(presetTimers[timerType].time);
      setIsRunning(false);
    }
  };

  const setCustomTimer = () => {
    const totalSeconds = (parseInt(customHours) || 0) * 3600 + (parseInt(customMinutes) || 0) * 60;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = isCustom 
      ? (parseInt(customHours) || 0) * 3600 + (parseInt(customMinutes) || 0) * 60
      : presetTimers[selectedTimer].time;
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  };

  const currentTimer = presetTimers[selectedTimer];

  return (
    <Card className="timer-widget h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        {/* Hidden audio element for notification */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H0w3IlBSl+zPLaizsIGGS57OGYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg=" type="audio/wav" />
        </audio>

        {/* Timer Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Focus Timer</h5>
          <Badge 
            style={{ 
              background: currentTimer.color,
              color: 'white',
              fontSize: '0.85rem',
              padding: '0.5rem 1rem'
            }}
          >
            {sessions} sessions completed
          </Badge>
        </div>

        {/* Notification Alert */}
        {notification && (
          <Alert variant="success" className="mb-3" dismissible onClose={() => setNotification('')}>
            {notification}
          </Alert>
        )}

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div 
            className="timer-display mb-3"
            style={{
              background: isGradientTheme ? currentTimer.color : currentTimer.color,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: isGradientTheme ? 'transparent' : currentTimer.color,
              fontSize: '3.5rem',
              fontWeight: '800',
              fontFamily: 'monospace'
            }}
          >
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress Ring */}
          <div className="position-relative d-inline-block mb-3">
            <svg width="120" height="120" className="progress-ring">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={isGradientTheme ? '#e2e8f0' : '#4a5568'}
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - getProgressPercentage() / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            <div 
              className="position-absolute top-50 start-50 translate-middle"
              style={{ fontSize: '1.5rem' }}
            >
              {currentTimer.icon}
            </div>
          </div>
          
          <div>
            <Badge 
              className="px-3 py-2"
              style={{ 
                background: isRunning ? 'var(--success-gradient)' : 'var(--secondary-gradient)',
                color: 'white',
                fontSize: '0.9rem'
              }}
            >
              {isRunning ? '⏸️ Running' : '▶️ Paused'} • {currentTimer.name}
            </Badge>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Button
            size="lg"
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={timeLeft === 0}
            style={{
              background: isRunning ? 'var(--warning-gradient)' : 'var(--primary-gradient)',
              border: 'none',
              color: 'white',
              borderRadius: '15px',
              padding: '0.75rem 2rem',
              fontWeight: '600'
            }}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </Button>
          <Button
            variant="outline-secondary"
            size="lg"
            onClick={resetTimer}
            style={{
              borderRadius: '15px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            🔄 Reset
          </Button>
        </div>

        {/* Preset Timer Buttons */}
        <div className="mb-4">
          <h6 className="mb-3 fw-semibold">Quick Timers</h6>
          <Row className="g-2">
            {Object.entries(presetTimers).filter(([key]) => key !== 'custom').map(([key, timer]) => (
              <Col xs={4} key={key}>
                <Button
                  variant={selectedTimer === key && !isCustom ? 'primary' : 'outline-primary'}
                  size="sm"
                  className="w-100 py-2"
                  onClick={() => selectPresetTimer(key)}
                  disabled={isRunning}
                  style={{
                    background: selectedTimer === key && !isCustom ? timer.color : 'transparent',
                    border: selectedTimer === key && !isCustom ? 'none' : `2px solid ${timer.color}`,
                    color: selectedTimer === key && !isCustom ? 'white' : timer.color,
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  <div>{timer.icon}</div>
                  <div>{timer.name}</div>
                  <small>{Math.floor(timer.time / 60)}m</small>
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        {/* Custom Timer */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0 fw-semibold">Custom Timer</h6>
            <Button
              size="sm"
              onClick={() => selectPresetTimer('custom')}
              disabled={isRunning}
              style={{
                background: isCustom ? presetTimers.custom.color : 'transparent',
                border: `2px solid ${presetTimers.custom.color}`,
                color: isCustom ? 'white' : presetTimers.custom.color,
                borderRadius: '10px',
                fontWeight: '600'
              }}
            >
              ⚙️
            </Button>
          </div>
          
          {isCustom && (
            <Row className="g-2">
              <Col xs={4}>
                <Form.Control
                  type="number"
                  placeholder="Hours"
                  min="0"
                  max="23"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  disabled={isRunning}
                  size="sm"
                  className="text-center"
                  style={{ borderRadius: '10px' }}
                />
                <Form.Text className="d-block text-center mt-1">Hours</Form.Text>
              </Col>
              <Col xs={4}>
                <Form.Control
                  type="number"
                  placeholder="Minutes"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  disabled={isRunning}
                  size="sm"
                  className="text-center"
                  style={{ borderRadius: '10px' }}
                />
                <Form.Text className="d-block text-center mt-1">Minutes</Form.Text>
              </Col>
              <Col xs={4}>
                <Button
                  size="sm"
                  className="w-100"
                  onClick={setCustomTimer}
                  disabled={isRunning || (!customHours && !customMinutes)}
                  style={{
                    background: 'var(--success-gradient)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '600'
                  }}
                >
                  Set
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Timer;