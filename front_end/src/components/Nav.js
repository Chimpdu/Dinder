import {useEffect, useContext } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import M from 'materialize-css';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../LanguageContext';
import { AuthContext } from '../AuthContext';
//npm i materialize-css@next is needed as we need to initialize the sidenav.
function Nav() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const {t} = useTranslation();
  const { changeLanguage } = useContext(LanguageContext);
  useEffect(()=>{
    // Initialize the sidenav
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
  }, [])

  const handleLogout = async () => {
    try {
      // Use the Fetch API for the POST request
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include', // Needed for HttpOnly cookies to be sent and received
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(false); // Update the authentication state
        navigate('/login'); // Use navigate to redirect
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error (e.g., show a message to the user)
    }
  };
  return (
    <>
      <nav className="nav-bar">
        <div className="nav-wrapper">
          <Link to="#" className="brand-logo">Dinder <span><img src="https://flagcdn.com/w80/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="40" height="20" alt="United Kingdom" onClick={()=>{changeLanguage("en")}}/></span>   <span><img src="https://flagcdn.com/w40/fi.png" srcSet="https://flagcdn.com/w80/fi.png 2x" width="40" height="20" alt="Finland" onClick={()=>{changeLanguage("fi")}}/></span></Link>
          <Link to="#" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></Link>
          <ul className="right hide-on-med-and-down">
            <li><Link to="/">{t('Profile')}</Link></li>
            <li><Link to="/friends">{t('Find your friend')}</Link></li>
            <li><Link to="/message">{t('Message')}</Link></li>
            <li><Link to="/register">{t('Register')}</Link></li>
            <li><Link to="/login">{t('Log in')}</Link></li>
            <li><button className='btn' onClick={handleLogout}>{t('Log out')}</button></li>
          </ul>
        </div>
      </nav>
      <ul className="sidenav" id="mobile-demo">
        <li><Link to="/">{t('Profile')}</Link></li>
        <li><Link to="/friends">{t('Find your friend')}</Link></li>
        <li><Link to="/message">{t('Message')}</Link></li>
        <li><Link to="/register">{t('Register')}</Link></li>
        <li><Link to="/login">{t('Log in')}</Link></li>
        <li><button className='btn' onClick={handleLogout}>{t('Log out')}</button></li>
        <li><Link to="#"><img src="https://flagcdn.com/w80/gb.png" srcSet="https://flagcdn.com/w80/gb.png 2x" width="40" height="20" alt="United Kingdom" onClick={()=>{changeLanguage("en")}}/></Link></li>   
        <li><Link to="#"><img src="https://flagcdn.com/w40/fi.png" srcSet="https://flagcdn.com/w80/fi.png 2x" width="40" height="20" alt="Finland" onClick={()=>{changeLanguage("fi")}}/></Link></li>
      </ul>
    </>
  )
}


export default Nav;