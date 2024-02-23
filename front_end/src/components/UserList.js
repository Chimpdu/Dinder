import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import { useContext } from "react";
import Error from './Error';
function UserList({ onUserSelect }) {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { t, i18n } = useTranslation();
    const { language } = useContext(LanguageContext);
   
    const pageSize = 10;
    useEffect(() => {
      i18n.changeLanguage(language);
    }, [language, i18n]);
    useEffect(() => {
        const fetchUsers = async () => {
          const response = await fetch(`/api/api/messageable-users?page=${currentPage}&pageSize=${pageSize}`, {
            method: 'GET',
            credentials:'include',
            headers: {'Content-Type': 'application/json',
        },
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        
          const data = await response.json();
          setUsers(data.users);
          setTotalPages(data.totalPages);
        };
        
        fetchUsers().catch(error => {
          console.error('Failed to fetch users', error);
        });
    }, [currentPage]);

    const handleSelectUser = (user) => {
        onUserSelect(user); // Changed from onSelectUser to onUserSelect
      };
    
    const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    };


    

  return (
    <div className="user-list user-list-container">
        <div className="title">{t("Message your friends")}</div>
        {users.map(user => (
            <div key={user.id} onClick={() => handleSelectUser(user)} className="user-cell">
                {user.username} ({user.nickname})
            </div>
        ))}
        <div className="pager">
        {Array.from({ length: totalPages }, (_, index) => (
        <button key={index} onClick={() => handlePageChange(index)} disabled={currentPage === index}>
        {index + 1}
        </button>
        ))}
        </div>
    </div>
  );
}

export default UserList;