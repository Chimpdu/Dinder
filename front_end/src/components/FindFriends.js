import { useEffect, useState } from "react";
import Error from "./Error";
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import { useContext } from "react";
function FindFriends() {
    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [errors, setErrors] = useState([]);
    const { t, i18n } = useTranslation();
    const { language } = useContext(LanguageContext);
    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);
    // Fetch a new user
    const fetchNewUser = async () => {
        try {
            const response = await fetch('/api/api/find_friend', { credentials: 'include' });
            if (response.status === 404) {
                // No more users to display, set an appropriate message
                setErrors(['No more users to display.']);
                return; // Exit the function early
            }
            if (!response.ok) throw new Error('Failed to fetch');
            const newUser = await response.json();
            setUsers(prevUsers => [...prevUsers, newUser]);
            setCurrentIndex(prevIndex => prevIndex + 1); // Update the current index to the new user
            setErrors([]);
        } catch (error) {
            console.error('Error fetching new user:', error);
            setErrors([error.message]);
        }
    };

    // Fetch the first user when the component mounts
    useEffect(() => {
        fetchNewUser();
    }, []);

    const handleNext = () => {
        if (currentIndex === users.length - 1) {
            fetchNewUser();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    const handleLike = async () => {
        if (users[currentIndex]) {
            try {
                const response = await fetch('/api/api/like_user', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ likedUserId: users[currentIndex]._id })
                });
                if (!response.ok) throw new Error('Failed to like user');
                handleNext(); // Move to the next user after liking
            } catch (error) {
                console.error('Error liking user:', error);
                setErrors([error.message]);
            }
        }
    };

    return (
        <>
            {errors.length > 0 && errors.map((error, index) => <Error key={index} error={error} />)}
            <div>
                {users[currentIndex] ? (
                    <div>
                        <h2>{t("Meet")} {users[currentIndex].nickname}</h2>
                        <div className="container">
                            
                            <div className="card hoverable" style={{ backgroundColor: '#F78FA7' }}>
                                <div className="card-content"style={{ fontSize: '18px', lineHeight: '2.5', color: 'white'}}>
                                    <span className="card-title deep-purple-text text-darken-2"><strong>{users[currentIndex].intro}</strong></span>
                                    <div className="divider"></div>
                                    <div className="row">
                                        <p><strong>{t("About")} {users[currentIndex].nickname}:</strong></p>
                                        <p>{users[currentIndex].description}</p>
                                        <p>{t("My gender is ")}{users[currentIndex].gender}</p>
                                        <p>{t("I was born on ")}{new Date(users[currentIndex].birthday).toLocaleDateString()}</p>
                                        <p>{t("My hobby is ")}{users[currentIndex].hobby}</p>
                                        <button className="btn red heart-btn" onClick={handleLike}>
                                            <i className="material-icons">favorite</i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>No user to display</p>
                )}
                <button className="btn" onClick={handlePrevious} disabled={currentIndex <= 0} style={{ marginRight: '10px' }}>{t("Previous")}</button>
                <button className="btn" onClick={handleNext}>{t("Next")}</button>

            </div>
        </>
    );
}

export default FindFriends;
