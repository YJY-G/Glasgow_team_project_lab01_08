import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const LoginVerification = () => {
  const { userId } = useParams();
  const [qrCode, setQrCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const userRole = location.state?.userRole;
  const navigate = useNavigate();

  
  useEffect(() => {
    axios.get(
      `http://127.0.0.1:8000/api/users/otp-verification/${userId}/`,
      { withCredentials: true }  
    )
      .then(response => {
        setQrCode(response.data.qr_code);
      })
      .catch(error => {
        console.error('Error fetching QR code:', error);
        setMessage('Error fetching QR code');
      });
  }, [userId]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/users/otp-verification/${userId}/`,
        { otp_code: otpCode },
        { withCredentials: true }  
      );

      setMessage(response.data.message);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
  
   
      if (userRole === 1) {
        navigate('/cus', { state: { Id: userId } });
      } else if (userRole === 2) {
        navigate('/Operator', { state: { Id: userId } });
      } else if (userRole === 3) {
        navigate('/Manager', { state: { Id: userId } });
      } else {
        console.error("Invalid role");
        setMessage("Invalid user role");
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage(error.response?.data?.error || 'An error occurred during verification');
    }
  };

  return (
    <div className='container'>
      <h1 className='qr_text'>Two-factor authentication</h1>
      {qrCode && (
        <img 
          className="qrcode" 
          src={`data:image/png;base64,${qrCode}`} 
          alt="QR Code"
        />
      )}
      <form onSubmit={handleOtpSubmit}>
        <input
          className='textfield form-control'
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Enter OTP code"
          required
        />
        <button 
          className='signLoginButton btn btn-dark' 
          type="submit"
        >
          Submit OTP
        </button>
      </form>
      {message && (
        <p className="alert alert-info mt-3" role="alert">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginVerification;