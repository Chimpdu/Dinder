
import './App.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useState, useEffect } from 'react';
import i18n from './i18n';
import { LanguageProvider } from './LanguageContext';
import { Suspense } from 'react';
import Nav from './components/Nav';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './components/PrivateRoute'; 
import GuestRoute from './components/GuestRoute';
import Message from './components/Message';
import FindFriends from './components/FindFriends';
function App() {
  return (
    <div className="App">
      <LanguageProvider>
      
      
        <Suspense fallback="loading">
          <Router>
            <AuthProvider>
              <div className="App">
                <Nav/> 
                <Routes>
                  <Route path='/' element= {<PrivateRoute><Profile/></PrivateRoute>}></Route>
                  <Route path='/message' element= {<PrivateRoute><Message/></PrivateRoute>}></Route>
                  <Route path='/friends' element= {<PrivateRoute><FindFriends/></PrivateRoute>}></Route>
                  <Route path='/login' element= {<GuestRoute><Login/></GuestRoute>}></Route>
                  <Route path='/register' element= {<GuestRoute><Register/></GuestRoute>}></Route>
                </Routes>
              </div>
            </AuthProvider>
          </Router>
        </Suspense>
      
    </LanguageProvider>
    </div>
  );
}

export default App;
