import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Form, Badge, Alert } from 'react-bootstrap';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState('pomodoro');
  const [customMinutes, setCustomMinutes] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [notification, setNotification] = useState('');
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const presetTimers = {
    pomodoro: { name: 'Pomodoro', time: 25 * 60, emoji: '🍅' },
    shortBreak: { name: 'Short Break', time: 5 * 60, emoji: '☕' },
    longBreak: { name: 'Long Break', time: 15 * 60, emoji: '🛋️' },
    custom: { name: 'Custom', time: 0, emoji: '⚙️' }
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
    setNotification('⏰ Timer completed! Take a moment to reflect on your progress.');
    
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

  return (
    <div className="timer-widget">
      {/* Hidden audio element for notification */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+H0w3IlBSl+zPLaizsIGGS57OGYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg+ltryxnkpBSl9y/LdjDwIF2a56+OYTgwOUarm7bllHgg==" type="audio/wav" />
      </audio>

      {/* Notification Alert */}
      {notification && (
        <Alert variant="success" className="mb-3" dismissible onClose={() => setNotification('')}>
          {notification}
        </Alert>
      )}

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className="timer-display text-primary mb-2">
          {formatTime(timeLeft)}
        </div>
        <div className="progress mb-3" style={{ height: '8px' }}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{ width: `${getProgressPercentage()}%` }}
            aria-valuenow={getProgressPercentage()} 
            aria-valuemin="0" 
            aria-valuemax="100"
          />
        </div>
        <Badge bg={isRunning ? 'success' : 'secondary'} className="mb-3">
          {isRunning ? 'Running' : 'Paused'} • {presetTimers[selectedTimer]?.emoji} {presetTimers[selectedTimer]?.name}
        </Badge>
      </div>

      {/* Control Buttons */}
      <div className="text-center mb-4">
        <div className="btn-group" role="group">
          <Button
            variant={isRunning ? 'warning' : 'success'}
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={timeLeft === 0}
            className="px-4"
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </Button>
          <Button variant="outline-secondary" onClick={resetTimer} className="px-4">
            🔄 Reset
          </Button>
        </div>
      </div>

      {/* Preset Timer Buttons */}
      <div className="mb-4">
        <h6 className="mb-3">Quick Timers</h6>
        <Row className="g-2">
          {Object.entries(presetTimers).filter(([key]) => key !== 'custom').map(([key, timer]) => (
            <Col xs={4} key={key}>
              <Button
                variant={selectedTimer === key && !isCustom ? 'primary' : 'outline-primary'}
                size="sm"
                className="w-100"
                onClick={() => selectPresetTimer(key)}
                disabled={isRunning}
              >
                <div>{timer.emoji}</div>
                <small>{timer.name}</small>
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Custom Timer */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0">Custom Timer</h6>
          <Button
            variant={isCustom ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => selectPresetTimer('custom')}
            disabled={isRunning}
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
              />
              <Form.Text className="text-muted">Hours</Form.Text>
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
              />
              <Form.Text className="text-muted">Minutes</Form.Text>
            </Col>
            <Col xs={4}>
              <Button
                variant="outline-success"
                size="sm"
                className="w-100"
                onClick={setCustomTimer}
                disabled={isRunning || (!customHours && !customMinutes)}
              >
                Set
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default Timer;