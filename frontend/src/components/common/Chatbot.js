import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { id: 'welcome', text: 'Hello! How can I help you today?', isUser: false, timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const apiBaseUrl = 'http://localhost:5000';

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchSuggestions();
        await fetchMessageHistory();
      } catch (err) {
        console.error('Error during initialization:', err);
        setFeedbackMessage({
          type: 'error',
          text: 'Failed to connect to the server. Please make sure the backend is running.'
        });
      }
    };
    
    initialize();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/suggestions`);
      setSuggestions(response.data.suggestions.slice(0, 4));
      return response.data.suggestions;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      throw err;
    }
  };
  
  const fetchMessageHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/history?limit=20`);
      
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(prevMessages => {
          const welcomeMessage = prevMessages.find(msg => msg.id === 'welcome');
          
          const formattedMessages = response.data.messages.map(msg => ({
            id: `msg-${msg.id}`,
            text: msg.content,
            isUser: msg.is_user,
            timestamp: new Date(msg.timestamp)
          })).reverse();
          
          return formattedMessages.length > 0 ? formattedMessages : 
                 (welcomeMessage ? [welcomeMessage] : []);
        });
      }
    } catch (err) {
      console.error('Error fetching message history:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to load message history from the server.'
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText('');
    await sendUserMessage(messageContent);
  };

  const sendUserMessage = async (content) => {
    const userMessageId = `user-${Date.now()}`;
    const userMessage = { 
      id: userMessageId, 
      text: content, 
      isUser: true, 
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await axios.post(`${apiBaseUrl}/chatbot`, { message: content });
      const botMessageId = `bot-${Date.now()}`;
      const botMessage = { 
        id: botMessageId, 
        text: response.data.message, 
        isUser: false, 
        timestamp: new Date() 
      };
      
      setMessages((prev) => [...prev, botMessage]);
      await fetchSuggestions();
      setShowSuggestions(true);
      
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { 
          id: `error-${Date.now()}`, 
          text: 'Connection error: Cannot reach the server. Please make sure the backend is running on port 5000.', 
          isUser: false, 
          timestamp: new Date() 
        }
      ]);
      
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to connect to the server.'
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendUserMessage(suggestion);
  };
  
  const clearChat = () => {
    setMessages([
      { id: 'welcome', text: 'Hello! How can I help you today?', isUser: false, timestamp: new Date() }
    ]);
  };

  return (
    <div className="chatbot-container-fullpage">
      <div className="chatbot-header">
        <h2 className="chatbot-title">AI Chat Assistant</h2>
        <div className="chatbot-controls">
          <button 
            className="control-button refresh-button" 
            onClick={fetchMessageHistory} 
            disabled={isHistoryLoading}
          >
            {isHistoryLoading ? 'Loading...' : 'Load History'}
          </button>
          <button 
            className="control-button clear-button" 
            onClick={clearChat}
          >
            Clear Chat
          </button>
        </div>
      </div>
      
      {feedbackMessage && (
        <div className={`feedback-message ${feedbackMessage.type}`}>
          {feedbackMessage.text}
        </div>
      )}
      
      <div className="chatbot-messages">
        {isHistoryLoading ? (
          <div className="loading-message">Loading message history...</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`${msg.isUser ? 'user-message' : 'bot-message'}`}>
              <div className="message-content">{msg.text}</div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="chatbot-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-button"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chatbot-input-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={handleInputChange}
          disabled={isLoading}
          ref={inputRef}
        />
        <button type="submit" disabled={isLoading || !inputText.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;