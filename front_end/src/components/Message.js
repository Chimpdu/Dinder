import React, { useState } from 'react';
import UserList from './UserList';
import MessageWindow from './MessageWindow';

function Message() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
   
    <div className="message-container container">
      <UserList onUserSelect={setSelectedUser} />
      {selectedUser && <MessageWindow selectedUser={selectedUser} />}
    </div>

  );
}

export default Message;
