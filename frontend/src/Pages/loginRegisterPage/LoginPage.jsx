import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import passwordValidation from "../../Components/passwordValidation";


const LoginPage = () => {
  const [passwordError, setPasswordError] = useState('');
  const [errorRes, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const redirectPage = (userId, role) => {
    if (role === 1) {
      navigate('/cus', { state: { Id: userId ,} });
    }
    else if (role === 2) {
      navigate('/Operator2', { state: { Id: userId } });
    }
    else {
      navigate('/Manager', { state: { Id: userId } });
    }
  }

  const onSubmit = async (data) => {
    setError('');
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/login/", 
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.status === 200) {
        console.log('Login successful:', response.data);
        const userId = response.data.user_id;
        const is_2fa_enable = response.data.is_2fa_enable;
        const userRole = response.data.role;
  
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        if (is_2fa_enable) {
          navigate(`/login-verification/${userId}`, { state: { userRole } });
        } else {
          redirectPage(userId, userRole);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.status === 401) {
        setError("Incorrect username or password");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="container-fluid containerLogoin col-6">
      <h2 className="loginHeader text-center">Log in</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorRes && (
          <div className="alert alert-danger mt-3" role="alert">
            {errorRes}
          </div>
        )}
        <div className="mb-3">
          <input
            type="text"
            className="textfield form-control"
            id="username"
            placeholder="Email"
            {...register("username", { required: "Username or Email is required" })}
          />
          {errors.username && <span style={{ color: 'red' }}>{errors.username.message}</span>}
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="textfield form-control"
            id="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            onChange={(e) => {
              const password = e.target.value;
              const errorMessage = passwordValidation(password);
              setPasswordError(errorMessage);
            }}
          />
          {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
          {passwordError && (
            <div style={{ color: 'red', marginTop: '5px' }}>
              {passwordError}
            </div>
          )}
        </div>

        <div className="mb-3">
          <a
            className="registerPage"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
          >
            No account? Register
          </a>
          &nbsp;|&nbsp;
          <a
            className="ForgetPsw"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/recovery");
            }}
          >
            Forget Password?
          </a>
        </div>

        <button type="submit" className="signLoginButton btn btn-dark">Log in</button>
      </form>
    </div>
  );
};

export default LoginPage;