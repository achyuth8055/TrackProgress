import React, { useState, useRef, useEffect } from "react";

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "👋 Hi! I'm your Study Tracker AI Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Send message to backend
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // ✅ Call backend (running on port 3001)
    fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.content }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Clean reply so it always sounds like Study Tracker Assistant
        let cleanReply = (data.reply || "🤔 I'm not sure, can you try asking differently?")
          .replace(/Gemini/gi, "Study Tracker Assistant")
          .replace(/AI model/gi, "Study Tracker Assistant");

        const aiMessage = {
          id: Date.now(),
          type: "ai",
          content: cleanReply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      })
      .catch(() => {
        const aiMessage = {
          id: Date.now(),
          type: "ai",
          content: "❌ Sorry, I couldn’t connect to your Study Tracker brain right now.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: "ai",
        content: "🧹 Chat cleared! I'm your Study Tracker AI — what would you like to ask?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const toggleWidget = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="ai-widget-container">
        {/* Floating Button */}
        <div
          className={`ai-widget-trigger ${isOpen ? "open" : ""}`}
          onClick={toggleWidget}
        >
          {isOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10 9 9s9-4.03 9-9V7l-8-5z" />
              <path d="M12 22s8-4 8-10V7l-8-5-8 5v5c0 6 8 10 8 10z" />
            </svg>
          )}
          {!isOpen && (
            <>
              <div className="ai-widget-pulse"></div>
              <div className="ai-widget-notification">1</div>
            </>
          )}
        </div>

        {/* Chat Window */}
        <div className={`ai-widget-window ${isOpen ? "open" : ""}`}>
          {/* Header */}
          <div className="ai-widget-header">
            <div className="ai-widget-header-info">
              <div className="ai-widget-avatar">🤖</div>
              <div className="ai-widget-header-text">
                <h3>Study Assistant</h3>
                <div className="ai-widget-status">
                  <div className="status-dot"></div>
                  Online
                </div>
              </div>
            </div>
            <div className="ai-widget-header-actions">
              <button
                onClick={handleClearChat}
                className="ai-widget-action-btn"
                title="Clear chat"
              >
                🧹
              </button>
              <button
                onClick={toggleWidget}
                className="ai-widget-action-btn"
                title="Close"
              >
                ❌
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-widget-messages">
            {messages.map((message) => (
              <div key={message.id} className={`ai-message ${message.type}`}>
                {message.type === "ai" && (
                  <div className="ai-message-avatar">🤖</div>
                )}
                <div className="ai-message-content">
                  <div className="ai-message-text">{message.content}</div>
                  <div className="ai-message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}

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

          {/* Input */}
          <div className="ai-widget-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              maxLength={280}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="ai-send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistantWidget;
