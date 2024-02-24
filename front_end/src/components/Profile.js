import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import Error from './Error';
import { Link } from 'react-router-dom';
import M from "materialize-css";


function Profile() {
    const { t, i18n } = useTranslation();
    const { language } = useContext(LanguageContext);
    // State to toggle edit mode
    const [isEditMode, setIsEditMode] = useState(false);
    const [friendEditMode, setFriendEditMode] = useState(false);
     /* Initialize materialize */
     useEffect(() => {
        var elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
    }, [isEditMode]);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);

    const [userData, setUserData] = useState({});
    const [errors, setErrors] = useState([]);
    function fetchUserInfo() {
        fetch("/api/api/profile", {
            credentials: 'include'
        }).then(response => response.json())
        .then(data => {
            setUserData(data);
            // Update formValues with fetched data, ensuring all fields have defined values
            setFormValues({
                nickname: data.nickname || '',
                gender: data.gender || '',
                hobby: data.hobby || '',
                intro: data.intro || '',
                description: data.description || '',
                birthday: data.birthday ? new Date(data.birthday).toLocaleDateString() : '',
            });
        })
        .catch(error => setErrors([...errors, error.toString()]));
    }
    /* Deletion method for "likes" friends */
    const handleDeleteFriend = async (friendId) => {
        try {
            const response = await fetch(`/api/api/delete_friend/${friendId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                // If the deletion was successful, refetch the user info to update the UI
                fetchUserInfo();
            } else {
                // Handle any errors, such as friend not found or server errors
                setErrors([...errors, "Failed to delete friend"]);
            }
        } catch (error) {
            setErrors([...errors, error.message]);
        }
    };
    useEffect(fetchUserInfo, []);
    
    const { username, nickname, gender, birthday, hobby, intro, description } = userData;
    let likes = Array.isArray(userData.likes) ? userData.likes : [];
    let likedBy = Array.isArray(userData.likedBy) ? userData.likedBy.map(element => element.username).join(', ') : '';

    // Format birthday to a readable format if it's defined
    const formattedBirthday = birthday ? new Date(birthday).toLocaleDateString() : '';

    

    // State to hold and update form values
    const [formValues, setFormValues] = useState({
        nickname: '',
        gender: '',
        birthday: '',
        hobby: '',
        intro: '',
        description: '' 
    });
    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        fetch("/api/users/edit_profile", {
            method:"post",
            credentials: "include",
            headers: {
                "Content-Type": "Application/json"
            },
            body: JSON.stringify(formValues)
        }).then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(obj => {
            if (obj.status !== 200) {
                setErrors(obj.body.errors ? obj.body.errors : [{ msg: 'An unexpected error occurred' }]);
            } else {
                setErrors([]);;
            }
        })
        .catch(error => {
            const errorMessage = error.msg ? error.msg : error.toString();
            setErrors(prevErrors => [...prevErrors, errorMessage]);
        });
        await fetchUserInfo(); //Update user info
        setIsEditMode(false); // Exit edit mode after submit
    };
    // Handle cancle
    const handleCancle = (e) => {
        e.preventDefault();
        setIsEditMode(false); // Exit edit mode after submit
    };
    /* Define how to conditionally render likes" */
    const renderLikesContent = likes.length > 0 ? (
        <div>
            <p><strong>{t("You like")}:</strong></p>
            {likes.map((like, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <span style={{ flexGrow: 1, textAlign: 'center' }}>{like.username}</span>
                    {friendEditMode && (
                        <button
                            id='friend-delete-btn'
                            onClick={() => handleDeleteFriend(like.userId)}
                        >
                            &times;
                        </button>
                    )}
                </div>
            ))}
        </div>
    ) : (
        <p><strong>{t("You like")}:</strong> <span>{t('Nothing specified, ')}</span><Link to="/friends">{t('search your friends now')}</Link></p>
    );
    
    
    
    return (
        <>
            {errors.length > 0 && errors.map((error, index) => (
                <Error key={index} error={error} />
            ))}
            <div className='profile' style={{ fontSize: '18px', lineHeight: '2.5'}}>
                <div className="container">
                    <h4 className="center-align ">{nickname}'s Profile</h4>
                    <div className="card hoverable">
                    <div className="card-content">
                        <span className="card-title deep-purple-text text-darken-2"><strong>{t("Personal info")}</strong><i className="small material-icons edit-icon" onClick={() => setIsEditMode(true)}>border_color</i></span>
                        <div className="divider"></div>
                        {isEditMode ? (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="input-field col s6">
                                        <input id="edit_nickname" type="text" name="nickname" className="validate" required value={formValues.nickname} onChange={handleInputChange} />
                                        <label htmlFor="edit_nickname" className={formValues.nickname ? 'active' : ''}>{t("Nickname")}</label>
                                    </div>
                                    <div className="input-field col s6">
                                        <input id="edit_birthday" type="date" name="birthday" className="validate" required value={formValues.birthday} onChange={handleInputChange} />
                                        <label htmlFor="edit_birthday" className={formValues.birthday ? 'active' : ''}>{t("Birthday")}</label>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="input-field col s6">
                                            <input id="edit_hobby" type="text" name="hobby" className="validate" value={formValues.hobby} onChange={handleInputChange} />
                                            <label htmlFor="edit_hobby" className={formValues.hobby ? 'active' : ''}>{t("Hobby")}</label>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="input-field col s12">
                                                <input id="edit_intro" type="text" name="intro" className="validate" value={formValues.intro} onChange={handleInputChange} />
                                                <label htmlFor="edit_intro" className={formValues.intro ? 'active' : ''}>{t("Intro")}</label>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className="input-field col s12">
                                                <input id="edit_description" type="text" name="description" className="validate" value={formValues.description} onChange={handleInputChange} />
                                                <label htmlFor="edit_description" className={formValues.description ? 'active' : ''}>{t("Description")}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="input-field col s12">
                                        <select id="edit_gender" name="gender" className="validate" required value={formValues.gender} onChange={handleInputChange}>
                                            <option value="" disabled>{t("Choose your gender")}</option>
                                            <option value="male">{t("Male")}</option>
                                            <option value="female">{t("Female")}</option>
                                            <option value="other">{t("Other")}</option>
                                        </select>
                                        <label htmlFor="edit_gender">{t("Gender")}</label>
                                    </div>
                                </div>
                                <button  className="btn" onClick={(event)=>{handleCancle(event)}} style={{ marginRight: '10px' }}>{t("Cancel")}</button>
                                <button type="submit" className="btn">{t("Submit")}</button>
                            </form>
                        ) : (
                            <>
                                <p><strong>{t("Nickname")}:</strong> {nickname}</p>
                                <p><strong>{t("Gender")}:</strong> {gender}</p>
                                <p><strong>{t("Birthday")}:</strong> {formattedBirthday}</p>
                                <p><strong>{t("Hobby")}:</strong> {hobby}</p>
                                <p><strong>{t("Intro")}:</strong> {intro}</p>
                                <p><strong>{t("Description")}:</strong> {description}</p>
                            </>
                        )}
                    </div>
                    </div>
                    <div className="card hoverable">
                    <div className="card-content">
                        <span className="card-title deep-purple-text text-darken-2"><strong>{t("Friends info")}</strong><i className="small material-icons edit-icon" onClick={() => setFriendEditMode(!friendEditMode)}>border_color</i></span>
                        <div className="divider"></div>
                        {/* <p><strong>{t("You like")}:</strong> {likes || <><span>{t('Nothing specified, ')}</span> <Link to="/friends">search your friends now</Link></>}</p> */}
                        {renderLikesContent}
                        <p><strong>{t("You are liked by")}:</strong> {likedBy || t('No one yet')}</p>
                    </div>
                    </div>
                </div>
                
               
            </div>

            
        </>
    );

}
export default Profile;
