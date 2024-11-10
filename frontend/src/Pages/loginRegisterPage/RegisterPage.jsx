
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const RegisterPage = () => {
    const navigate = useNavigate();


    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [alertMessage, setAlertMessage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/register/', data);

            if (response.status === 201) {
                setAlertMessage({ type: 'success', text: 'Registration successful!' });
            } else {
                setAlertMessage({ type: 'danger', text: 'Please sign up again, something went wrong.....' });
            }

            setShowAlert(true);

        } catch (error) {

            if (error.response && error.response.data && error.response.data.error) {
                setAlertMessage({ type: 'danger', text: error.response.data.error });
            } else {
                setAlertMessage({ type: 'danger', text: 'An unexpected error occurred. Please try again later.' });
            }

            setShowAlert(true);
        }
    };


    return (
        <div className='container-fluid containerLogoin col-6'>
            <h2 className='loginHeader text-center'>Sign up</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                {showAlert && alertMessage && (
                    <div className={`alert alert-${alertMessage.type}`} role="alert">
                        {alertMessage.text}
                    </div>
                )}

                <div className="mb-3">
                    <input
                        type="text"
                        className="textfield form-control"
                        placeholder="First Name"
                        {...register('firstName', { required: 'First Name is required' })}
                    />
                    {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName.message}</span>}
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        className="textfield form-control"
                        placeholder="Last Name"
                        {...register('lastName', { required: 'Last Name is required' })}
                    />
                    {errors.lastName && <span style={{ color: 'red' }}>{errors.lastName.message}</span>}
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        className="textfield form-control"
                        placeholder="Email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format'
                            }
                        })}
                    />
                    {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
                </div>
                <div className="mb-3">
                    <input
                        type="text"
                        className="textfield form-control"
                        placeholder="Phone number"
                        {...register('phoneNumber', { required: 'Phone number is required' })}
                    />
                    {errors.phoneNumber && <span style={{ color: 'red' }}>{errors.phoneNumber.message}</span>}
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="textfield form-control"
                        placeholder="Password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            }
                        })}
                    />
                    {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="textfield form-control"
                        placeholder="Confirm Password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === watch('password') || 'Passwords do not match'
                        })}
                    />
                    {errors.confirmPassword && <span style={{ color: 'red' }}>{errors.confirmPassword.message}</span>}
                </div>
                <div><a
                    className="ForgetPsw"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/Login");
                    }}
                >
                    Go to Login..
                </a></div>
                <button type="submit" className="signLoginButton btn btn-dark">Sign up</button>
            </form>
        </div>
    );
};

export default RegisterPage;
