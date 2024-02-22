import React, { useState, useEffect } from 'react';
import Error from './Error';
function MessageWindow({ selectedUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [senderId, setSenderId] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchSenderInfo = async () => {
          try {
            const response = await fetch('/api/api/profile', {
              method: 'GET',
              credentials:'include',
              headers: {
                'Content-Type': 'application/json',
              },
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
      }, []); // This effect runs only once after the initial render, we need to fetch info about current user
      /* fetch messages */
      
        useEffect(() => {
            const fetchMessages = async () => {
              try {
                if (!senderId || !selectedUser) throw new Error('Missing user information');
                const response = await fetch(`/api/message/${senderId}/${selectedUser.id}`, {
                    credentials:'include',
                    method:'GET'
                });
                if (!response.ok) throw new Error('Failed to fetch messages');
                const data = await response.json();
                setMessages(data);
              } catch (error) {
                console.error(error);
                setError(error.message);
              }
            };
          
            if (selectedUser) {
              fetchMessages();
            }
          }, [selectedUser, senderId]);
          const sendMessage = async () => {
            if (!newMessage.trim()) return; // Prevent sending empty messages
            try {
                
              const message = { sender: senderId, receiver: selectedUser.id, content: newMessage };
              const response = await fetch('/api/message', {
                method: 'POST',
                credentials:'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message),
              });
              if (!response.ok) throw new Error('Failed to send message');
              const savedMessage = await response.json(); // Get the saved message from the response
              setMessages([...messages, savedMessage]); // Add the new message to the messages array
              setNewMessage('');
            } catch (error) {
              console.error(error);
              setError('Failed to send message');
            }
          };

  return (
    <div className="message-window">
      {/* Add a title at the top of the message window */}
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