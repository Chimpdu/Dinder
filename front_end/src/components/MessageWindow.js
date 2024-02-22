import React, { useState, useEffect, useRef } from 'react';
import Error from './Error';

function MessageWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderId, setSenderId] = useState(null);
  const [error, setError] = useState('');
  const ws = useRef(null);

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

  // Initialize WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000');
  
    ws.current.onmessage = (e) => {
      if (typeof e.data === "string") {
        // Data is a string, parse it as JSON
        const message = JSON.parse(e.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      } else if (e.data instanceof Blob) {
        // Data is a Blob, read and then parse it
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const message = JSON.parse(reader.result);
            setMessages((prevMessages) => [...prevMessages, message]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };
        reader.readAsText(e.data); // Read the Blob as text
      }
    };
  
    return () => {
      ws.current.close();
    };
  }, []);
  

  // Fetch messages for the selected user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!senderId || !selectedUser) return;

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
  }, [selectedUser, senderId]);

  // Function to send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
  
    try {
      const message = { sender: senderId, receiver: selectedUser.id, content: newMessage };
  
      // Save message to the database
      const response = await fetch('/api/message', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const savedMessage = await response.json();
  
      // Add the new message to the messages array immediately for the sender
      setMessages((prevMessages) => [...prevMessages, savedMessage]);
  
      // Send message over WebSocket
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(savedMessage));
      }
  
      setNewMessage('');
    } catch (error) {
      console.error(error);
      setError('Failed to send message');
    }
  };
  

  return (
    <div className="message-window">
      <div className="message-title">
        <h4>Messaging to {selectedUser.username}</h4>
      </div>
      <Error error={error} />
      <div className="message-display">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === senderId ? 'sent' : 'received'}`}>
            {message.content}
            <div className="message-time">{new Date(message.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default MessageWindow;
