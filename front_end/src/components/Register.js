import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import Error from './Error';
import M from "materialize-css"
function Register() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState([]);
    const { t, i18n } = useTranslation();
    const { language } = useContext(LanguageContext);
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        nickname: '',
        birthday: '',
        gender: '',
        hobby: '',
        intro: '',
        description: '',
    });

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);
    /* Initialize materialize */
    useEffect(() => {
        var elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
    }, []);
    function submitForm(event) {
        event.preventDefault();
        fetch("/api/users/register", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userData),
            mode: "cors"
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(obj => {
            if (obj.status !== 200) {
                setErrors(obj.body.errors ? obj.body.errors : [{ msg: 'An unexpected error occurred' }]);
            } else {
                setErrors([]);
                navigate('/login');
            }
        })
        .catch(error => {
            setErrors([{ msg: error.message }]);
        })
        .finally(() => {
            setUserData({ username: '', password: '', nickname: '', birthday: '', hobby: '', intro: '', description: '', gender: userData.gender });
        });
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    }

    return (
        <>
            {errors.length > 0 && errors.map((error, index) => (
                <Error key={index} error={typeof error === 'string' ? error : error.msg || "Unknown error"} />
            ))}

            <div className="valign-wrapper login-box">
                <div className="reg-login-card reg-card card hoverable">
                    <div className="card-content">
                        <span className="card-title"><strong>{t("Register")}</strong></span>
                        <div className="row">
                            <form className="col s12" onSubmit={submitForm}>
                                {/* Username and Password on the same line */}
                                <div className="row">
                                    <div className="input-field col s6">
                                        <input id="username" type="text" name="username" className="validate" required onChange={handleChange} value={userData.username || ''}/>
                                        <label htmlFor="username">{t('Username*')}</label>
                                    </div>
                                    <div className="input-field col s6">
                                        <input id="password" type="password" name="password" className="validate" required onChange={handleChange} value={userData.password || ''}/>
                                        <label htmlFor="password">{t('Password*')}</label>
                                    </div>
                                     {/* Nickname and Birthday on the same line */}
                                    <div className="row">
                                        <div className="input-field col s6">
                                            <input id="nickname" type="text" name="nickname" className="validate" required onChange={handleChange} value={userData.nickname || ''}/>
                                            <label htmlFor="nickname">{t('Nickname*')}</label>
                                        </div>
                                        <div className="input-field col s6">
                                            <input id="birthday" type="date" name="birthday" className="validate" required onChange={handleChange} value={userData.birthday || ''}/>
                                            <label htmlFor="birthday">{t('Birthday*')}</label>
                                        </div>
                                    </div>
                                    <div className="input-field col s6">
                                        <input id="hobby" type="text" name="hobby" className="validate"  onChange={handleChange} value={userData.hobby || ''}/>
                                        <label htmlFor="hobby">{t('Hobby')}</label>
                                    </div>
                                    <div className="input-field col s12">
                                        <input id="intro" type="text" name="intro" className="validate"  onChange={handleChange} value={userData.intro || ''}/>
                                        <label htmlFor="intro">{t("Short intro to catch others' eyes")}</label>
                                    </div>
                                    <div className="input-field col s12">
                                        <input id="description" type="text" name="description" className="validate"  onChange={handleChange} value={userData.description || ''}/>
                                        <label htmlFor="description">{t('Descript yourself briefly')}</label>
                                    </div>
                                </div>
                               
                                {/* Gender field */}
                                <div className="row">
                                    <div className="input-field col s12">
                                        <select name="gender" onChange={handleChange} required value={userData.gender || ''} defaultValue="">
                                            <option value="" disabled>{t('Choose your gender')}</option>
                                            <option value="male">{t('Male')}</option>
                                            <option value="female">{t('Female')}</option>
                                            <option value="other">{t('Other')}</option>
                                        </select>
                                        <label>{t('Gender*')}</label>
                                    </div>
                                </div>
                                {/* Submit button */}
                                <div className="row">
                                    <div className="col s12 center-align">
                                        <button type="submit" className="btn">{t('Submit')}</button>
                                    </div>
                                </div>
                                <div className="row"><p>Already have an account? <Link to="/login">{t('Login now')}</Link></p></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
