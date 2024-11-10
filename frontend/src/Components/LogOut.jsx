import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogOut = ({ userId}) => {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem(`accessToken_${userId}`);
    if (!localStorage.getItem(`accessToken_${userId}`)) {
        console.log('Access token successfully removed');
      } else {
        console.error('Access token was not removed');
      }
    
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Log out
    </button>
  );
};

export default LogOut;