import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import "../styles.css";

export default function QuickAnswer() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your AI study assistant. Ask me anything about Data Structures and Algorithms.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const maxInputLength = 280;
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || input.length > maxInputLength) return;
    const newMessage = {
      id: `${Date.now()}`,
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          sender: "ai",
          text: `Of course, here is an explanation for "${newMessage.text}": The Two Pointers technique is a common and efficient method used to solve problems involving sorted arrays or linked lists. It works by using two pointers that iterate through the data structure until they meet or satisfy a certain condition.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        sender: "ai",
        text: "Hello! I'm your AI study assistant. Ask me anything about Data Structures and Algorithms.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <AppLayout pageTitle="Quick Answer AI">
      <div
        className="centered-container"
        style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem", display: "flex", flexDirection: "column", minHeight: "calc(100vh - var(--header-height))" }}
      >
        <div className="card" style={{ flexGrow: 1, padding: "2rem", position: "relative", display: "flex", flexDirection: "column" }}>
          <div className="card-header" style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
              Chat with AI Assistant
            </h2>
            <button
              onClick={handleBack}
              className="btn btn-secondary"
              style={{
                position: "absolute",
                top: "0.5rem",
                left: "0",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "var(--border-radius-sm)",
              }}
              aria-label="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleClearChat}
              style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
          </div>
          <div
            className="chat-messages"
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "1rem",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.sender}`}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "var(--border-radius-sm)",
                  background: msg.sender === "user" ? "var(--accent-secondary)" : "var(--bg-secondary)",
                  maxWidth: "70%",
                  marginLeft: msg.sender === "user" ? "auto" : "0",
                  marginRight: msg.sender === "user" ? "0.5rem" : "auto",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>{msg.text}</p>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginTop: "0.5rem",
                    textAlign: msg.sender === "user" ? "right" : "left",
                  }}
                >
                  {msg.time}
                </span>
              </div>
            ))}
            {isTyping && (
              <div
                className="chat-message ai"
                style={{
                  padding: "1rem",
                  borderRadius: "var(--border-radius-sm)",
                  background: "var(--bg-secondary)",
                  maxWidth: "70%",
                  marginRight: "auto",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                  Typing
                  <span className="typing-indicator" style={{ display: "inline-flex", gap: "4px", marginLeft: "8px" }}>
                    <span style={{ width: "6px", height: "6px", background: "var(--accent-primary)", borderRadius: "50%", animation: "blink 1s infinite" }}></span>
                    <span style={{ width: "6px", height: "6px", background: "var(--accent-primary)", borderRadius: "50%", animation: "blink 1s infinite 0.2s" }}></span>
                    <span style={{ width: "6px", height: "6px", background: "var(--accent-primary)", borderRadius: "50%", animation: "blink 1s infinite 0.4s" }}></span>
                  </span>
                </p>
                <style>
                  {`
                    @keyframes blink {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.3; }
                    }
                  `}
                </style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <form
          className="chat-input-form"
          onSubmit={handleSend}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-color)",
            position: "sticky",
            bottom: "0",
            zIndex: "10",
          }}
        >
          <div className="input-group" style={{ flexGrow: 1, marginRight: "1rem" }}>
            <input
              type="text"
              placeholder="e.g., Explain the Two Pointers technique..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={maxInputLength}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                padding: "0.75rem",
                borderRadius: "var(--border-radius-sm)",
                fontSize: "0.95rem",
              }}
              aria-label="Ask AI a question"
            />
            <div
              style={{
                fontSize: "0.9rem",
                color: input.length > maxInputLength ? "var(--warning-color)" : "var(--text-secondary)",
                textAlign: "right",
                marginTop: "0.5rem",
              }}
            >
              {input.length}/{maxInputLength}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!input.trim() || input.length > maxInputLength}
            style={{ padding: "0.75rem 1.5rem" }}
          >
            Send
          </button>
        </form>
      </div>
    </AppLayout>
  );
}