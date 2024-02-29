import React, { useState, useEffect, useRef } from 'react';
import Error from './Error';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import { useContext } from "react";

function MessageWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [senderId, setSenderId] = useState(null);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();
  const { language } = useContext(LanguageContext);
  const ws = useRef(null);
  // Function to handle search term input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter messages based on the search term
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Fetch user information and set senderId
  useEffect(() => {
    const fetchSenderInfo = async () => {
      try {
        const response = await fetch('/api/api/profile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setSenderId(data._id);
      } catch (error) {
        console.error(error);
        setError('Failed to fetch sender information');
      }
    };

    fetchSenderInfo();
  }, []);

  // Initialize WebSocket connection when senderId is set
  useEffect(() => {
    if (senderId) {
      ws.current = new WebSocket(`ws://localhost:8000/?id=${senderId}`);
    
      ws.current.onmessage = (e) => {
        const message = JSON.parse(e.data);
        if (message.sender === selectedUser.id || message.receiver === selectedUser.id) {
          setMessages(prev => [...prev, message]);
        }
      };

      return () => {
        ws.current.close();
      };
    }
  }, [senderId, selectedUser.id]);

  // Fetch messages for the selected user
  useEffect(() => {
    if (senderId && selectedUser) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/message/${senderId}/${selectedUser.id}`, {
            credentials: 'include',
            method: 'GET',
          });
          if (!response.ok) throw new Error('Failed to fetch messages');
          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error(error);
          setError(error.message);
        }
      };

      fetchMessages();
    }
  }, [selectedUser, senderId]);

  // Function to send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const message = { sender: senderId, receiver: selectedUser.id, content: newMessage, createdAt: new Date().toISOString() };

    try {
      // Save message to the database
      const response = await fetch('/api/message', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const savedMessage = await response.json();

      // Add the new message to the messages array immediately for instant UI update
      setMessages(prevMessages => [...prevMessages, savedMessage]);

      // Send message over WebSocket for real-time communication
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      }

      setNewMessage('');
    } catch (error) {
      console.error(error);
      setError('Failed to send message');
    }
  };

  return (
    <div className="chat-container">
      <h4>{t("Messaging to ")}{selectedUser.username}</h4>
      <Error error={error} />
      
      {/* Search input */}
      <div className="row">
        <div className="input-field col s12">
          <input
            id="search"
            type="text"
            className="validate"
            placeholder={t("Search messages...")}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <label htmlFor="search" className="active">{t("Search messages...")}</label>
        </div>
      </div>

      {/* Render filtered messages */}
      {searchTerm && (
        <>
          {filteredMessages.map((message, index) => (
            <div key={index} className={`message-row ${message.sender === senderId ? 'sender' : 'receiver'}`}>
              <div className="card-content black-text">
                <p>{message.content}</p>
                <div className="message-time">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div className="divider" ></div>
        </>
      )}

      {/* Render all messages */}
      {messages.map((message, index) => (
        <div key={index} className={`message-row ${message.sender === senderId ? 'sender' : 'receiver'}`}>
          <div className="card-content black-text">
            <p>{message.content}</p>
            <div className="message-time" style={{fontSize: '0.8rem'}}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      <div className="row">
        <div className="input-field col s12">
          <textarea
            id="new_message"
            className="materialize-textarea"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          ></textarea>
          <label htmlFor="new_message">{t("Type your message here...")}</label>
        </div>
        <button className="btn waves-effect waves-light blue" onClick={sendMessage}>
          {t("Send")}
          <i className="material-icons right">send</i>
        </button>
      </div>
    </div>
  );
}

export default MessageWindow;
