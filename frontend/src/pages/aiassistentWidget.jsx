import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hi! I\'m your Study Tracker Assistant. How can I help you with your learning today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user, getConnectionStatus } = useAuth();

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const health = await apiService.healthCheck();
        setIsConnected(!!health);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (error) setError(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    if (!isConnected) {
      setError('No connection to AI assistant. Please check your internet connection.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      console.log('💬 Sending message to AI:', userMessage.text);
      const response = await apiService.chatWithAssistant(userMessage.text);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log('✅ AI response received');
    } catch (error) {
      console.error('❌ Failed to get AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: `Sorry, I'm having trouble right now. ${error.message || 'Please try again later.'}`,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        text: 'Chat cleared! How can I help you?',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="ai-widget-container">
      {/* Floating Action Button */}
      <div
        className={`ai-widget-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleWidget}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {!isConnected && <div className="ai-widget-pulse" />}
        
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </div>

      {/* Chat Window */}
      <div className={`ai-widget-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ai-widget-header">
          <div className="ai-widget-header-info">
            <div className="ai-widget-avatar">
              🤖
            </div>
            <div className="ai-widget-header-text">
              <h3>Study Assistant</h3>
              <div className="ai-widget-status">
                <div className={`status-dot ${isConnected ? '' : 'disconnected'}`}></div>
                {isConnected ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="ai-widget-header-actions">
            <button
              onClick={clearChat}
              className="ai-widget-action-btn"
              title="Clear chat"
              aria-label="Clear chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-widget-messages">
          {messages.map((message) => (
            <div key={message.id} className={`ai-message ${message.type}`}>
              {message.type === 'ai' && (
                <div className="ai-message-avatar">🤖</div>
              )}
              <div className="ai-message-content">
                <div 
                  className="ai-message-text"
                  style={{ 
                    color: message.isError ? 'var(--warning-color)' : 'inherit' 
                  }}
                >
                  {message.text}
                </div>
                <div className="ai-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="ai-message ai">
              <div className="ai-message-avatar">🤖</div>
              <div className="ai-message-content">
                <div className="ai-typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(255, 59, 48, 0.1)',
            borderTop: '1px solid rgba(255, 59, 48, 0.2)',
            color: 'var(--warning-color)',
            fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="ai-widget-input">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Ask me anything about your studies..." : "Reconnecting..."}
            disabled={isTyping || !isConnected}
            maxLength={1000}
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!inputMessage.trim() || isTyping || !isConnected}
            aria-label="Send message"
          >
            {isTyping ? (
              <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" fill="none"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            )}
          </button>
        </form>

        {/* Footer */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            padding: '0.5rem',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Dev Mode: {connectionStatus.isOnline ? '🟢' : '🔴'} | 
            Server: {isConnected ? '🟢' : '🔴'} | 
            User: {user?.name || 'Anonymous'}
          </div>
        )}
      </div>

      {/* Add required CSS animations inline for missing classes */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .ai-widget-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AIAssistantWidget;