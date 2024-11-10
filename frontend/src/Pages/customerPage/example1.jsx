import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';

// Available Vehicle Icons
const scooterIcon = new L.Icon({
    iconUrl: '/scooter.png',
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'vehicle-icon',
});

const bikeIcon = new L.Icon({
    iconUrl: '/bike.png',
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'vehicle-icon',
});

// Unavailable Vehicle Icons
const unavailableScooterIcon = new L.Icon({
    iconUrl: '/unavailable_scooter.png',
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'vehicle-icon',
});

const unavailableBikeIcon = new L.Icon({
    iconUrl: '/unavailable_bike.png',
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'vehicle-icon',
});
const Header = ({ onMenuClick }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success p-3 shadow">
            <a className="navbar-brand fw-bold fs-4" href="#" onClick={() => onMenuClick('map')}>
            E-Vehicle

            </a>
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                        <a className="nav-link" href="/cus" >Customer Page</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => onMenuClick('map')}>Map</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => onMenuClick('Account')}>Account</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => onMenuClick('Payment')}>Payment</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => onMenuClick('Ride History')}>Ride History</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={() => onMenuClick('Log Out')}>Log Out</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};
// Payment Page Implementation
const PaymentPage = ({ onBack, userProfile, onUpdateProfile, setUser }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [currentDueAmount, setCurrentDueAmount] = useState(userProfile.due_amount);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDueAmount = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${userProfile.user_id}/due_amount/`);
                setCurrentDueAmount(response.data.due_amount);
                onUpdateProfile({
                    ...userProfile,
                    due_amount: response.data.due_amount
                }, true);
            } catch (error) {
                console.error('We had an error fetching due amount:', error);
                setError('Program failed to fetch current due amount!');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDueAmount();
    }, [userProfile.id]);

    const validateAmount = (amount) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return 'Please enter a valid payment amount greater than 0!';
        }
        if (numAmount > currentDueAmount) {
            return 'Payment amount must not exceed due amount';
        }
        return null;
    };

    const handlePayment = async () => {
        setError('');
        setSuccessMessage('');

        const validationError = validateAmount(paymentAmount);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsProcessing(true);
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            message.error('User information not found, please login again');
            return;
        }

        const user = JSON.parse(userStr);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/payments/make_payment/',
                {
                    user_id: userProfile.user_id,
                    amount: parseFloat(paymentAmount).toFixed(2)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            setCurrentDueAmount(response.data.new_due_amount);

            onUpdateProfile({
                ...userProfile,
                due_amount: response.data.new_due_amount
            });
            const updatedUser = {
                ...user,
                amount: response.data.new_balance
            };
         
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setPaymentAmount('');
            setSuccessMessage('Payment processed successfully!');

        } catch (error) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Payment failed. Please try again.';
            setError(errorMessage);

            console.error('Payment error:', {
                data: error.response?.data,
                message: error.message
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-600">Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl ">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6 text-center pt-5">
                    <h2 className="mb-4 text-success fw-bold fs-2">Payment</h2>
                    {successMessage && (
                        <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
                            {successMessage}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="container py-5">
                       
                        <div className="card mb-4 border-danger border-opacity-25">
                            <div className="card-body bg-danger bg-opacity-10">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0 text-secondary">
                                        Current Due Amount
                                    </h5>
                                    <h3 className="mb-0 text-danger fw-bold">
                                        £{currentDueAmount.toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                        </div>

                       
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <label className="form-label fw-semibold mb-3">
                                    Enter Payment Amount
                                </label>
                                <div className="input-group mb-3">
                                    <span className="input-group-text">£</span>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => {
                                            setPaymentAmount(e.target.value);
                                            setError('');
                                        }}
                                        className="form-control form-control-lg"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0.01"
                                        max={currentDueAmount}
                                        disabled={isProcessing}
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        <div>{error}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                      
                        <div className="mt-4">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || !paymentAmount}
                                className={`btn btn-lg w-100 ${isProcessing || !paymentAmount
                                        ? 'btn-secondary'
                                        : 'btn-success'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : 'Pay Now'}
                            </button>
                        </div>

                     
                        {successMessage && (
                            <div className="alert alert-success mt-3" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                {successMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Ride History Page Implementation
const RideHistoryPage = ({ onBack, userId }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRideHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/rentals/history/?user_id=${userId}`);
                console.log('Ride history:', response.data);
                setRides(response.data);
                setLoading(false);
            } catch (error) {
                console.error('We had an error fetching ride history:', error);
                setError('Program failed to load ride history!');
                setLoading(false);
            }
        };

        fetchRideHistory();
    }, [userId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'Incomplete';
        const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60);
        return `${duration.toFixed(2)} mins`;
    };

    const content = loading ? (
        <div className="p-8">
            <p>Hiya! Loading ride history...</p>
        </div>
    ) : error ? (
        <div className="p-8">
            <p className="text-red-500">{error}</p>
        </div>
    ) : rides.length === 0 ? (
        <div className="p-8">
            <p className="text-gray-600">No ride history found.</p>
        </div>
    ) : (
        <div className="space-y-4 px-8 overflow-auto flex-1">
            {rides.map((ride) => (
                <div
                    key={ride.rental_id}
                    className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                >
                    <div>
                        <h3 className="font-bold text-green-800">
                            {ride.vehicle.vehicle_type === 1 ? 'Electric Scooter' : 'Electric Bike'}
                            {` - ${ride.vehicle.vehicle_id}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Start: {ride.start_location.name}
                        </p>
                        <p className="text-sm text-gray-600">
                            End: {ride.end_location ? ride.end_location.name : 'Not completed'}
                        </p>
                        <p className="text-sm text-gray-600">
                            Start Time: {formatDate(ride.rental_start_time)}
                        </p>
                        <p className="text-sm text-gray-600">
                            Duration: {formatDuration(ride.rental_start_time, ride.rental_end_time)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-600">
                            £{ride.cost ? ride.cost.toFixed(2) : '0.00'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-green-100">
            <div className="px-8 pt-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">Ride History</h2>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {content}
            </div>

        </div>
    );
};

// Account Page Implementation
const AccountPage = ({ onBack, userProfile, onUpdateProfile }) => {
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [searchParams] = useSearchParams();

    //
    const handleAddMoney = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/customer/add-balance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: numAmount,
                })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.approval_url;
            } else {
                setError(data.error || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError('Network error, please try again');
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary bg-gradient text-white">
                            <h2 className="mb-0 fs-4">Account Information</h2>
                        </div>

                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Username</label>
                                <div className="form-control bg-light">{userProfile.username}</div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Email</label>
                                <div className="form-control bg-light">{userProfile.email}</div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold">Phone Number</label>
                                <div className="form-control bg-light">{userProfile.phone}</div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Balance</label>
                                <div className="form-control bg-light">£{userProfile.amount.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="card-footer bg-white">
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => setShowAddMoneyModal(true)}
                            >
                                Add Money
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Result Modal */}
            {showResultModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="card" style={{ width: '300px' }}>
                        <div className="card-header bg-primary text-white">
                            <h5 className="card-title mb-0">Payment Status</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-center mb-3">{paymentStatus}</p>
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => {
                                    setShowResultModal(false);
                                    // Clear URL parameters
                                    window.history.replaceState({}, '', '/account');
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Money Modal */}
            {showAddMoneyModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="card" style={{ width: '300px' }}>
                        <div className="card-header bg-primary text-white">
                            <h5 className="card-title mb-0">Add Money</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <div className="input-group">
                                    <span className="input-group-text">£</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                    />
                                </div>
                                {error && (
                                    <div className="text-danger small mt-1">{error}</div>
                                )}
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={handleAddMoney}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="btn btn-secondary flex-grow-1"
                                    onClick={() => {
                                        setShowAddMoneyModal(false);
                                        setAmount('');
                                        setError('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Lab-8, The Glasgow E-Bike App Here!
function App() {
    const [currentPage, setCurrentPage] = useState('map');
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [journeySummary, setJourneySummary] = useState(null);
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            // If no user data, redirect to login page
            window.location.href = '/login';
            return null;
        }
        return JSON.parse(storedUser);
    });

    // If no user data, don't render the main page content
    if (!user) {
        return null;
    }

    useEffect(() => {
        const fetchUserDueAmount = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${user.user_id}/due_amount`);
                setUser((prevUser) => ({
                    ...prevUser,
                    due_amount: response.data.due_amount,
                }));
            } catch (error) {
                console.error('We had an error fetching due amount:', error);
            }
        }; fetchUserDueAmount();
    }, [user.id]);

    const [rentals, setRentals] = useState([]);
    const [currentRental, setCurrentRental] = useState(null);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportComment, setReportComment] = useState('');
    const [reportError, setReportError] = useState('');
    const [reports, setReports] = useState([]);
    const [showReportHistory, setShowReportHistory] = useState(false);
    const [showVehicleDetails, setShowVehicleDetails] = useState(false);
    const [showEndRideDetails, setShowEndRideDetails] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isSuccess = urlParams.get('success');
        const amount = urlParams.get('amount');

        if (isSuccess === 'true' && amount) {
            handlePaymentSuccess(amount);
            // Clear URL parameters and navigate to the correct page
            navigate('/cus', { replace: true });
        } else if (isSuccess === 'false') {
            message.error('Payment cancelled');
            navigate('/cus', { replace: true });
        }
    }, []);

    const handlePaymentSuccess = async (amount) => {
        try {
            // Get user information from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                message.error('User information not found, please login again');
                return;
            }

            const user = JSON.parse(userStr);

            const response = await axios.patch('http://localhost:8000/api/customer/payment/success/', {
                user_id: user.user_id,
                amount: parseFloat(amount)
            });

            if (response.data.status === 'success') {
                message.success(`Payment successful! Added £${amount} to your account`);

                // Update user information directly with the payment amount
                const newAmount = user.amount + parseFloat(amount);
                const updatedUser = {
                    ...user,
                    amount: newAmount
                };

                // Update state and localStorage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            message.error('Payment processing failed, please contact customer service');
        }
    };

    const handleMenuClick = (item) => {
        switch (item) {
            case 'Account':
                setCurrentPage('account');
                break;
            case 'Ride History':
                setCurrentPage('ride-history');
                break;
            case 'Payment':
                setCurrentPage('payment');
                break;
            case 'Log Out':
                localStorage.removeItem('user');
                navigate('/');
                break;
            case 'Map':
            default:
                setCurrentPage('map');
                break;
        }
    };

    const handleUpdateProfile = async (profileData) => {
        try {
            setUser({
                ...user,

                email: profileData.email,
                phone_number: profileData.phone_number,
            });
        } catch (error) {
            console.error('We had an error updating profile:', error);
            alert('An error occured, please try again later!');
        }
    };
    useEffect(() => {
        fetchVehicles();
        fetchRentals();
    }, []);

    useEffect(() => {
        if (selectedVehicle) {
            fetchReports(selectedVehicle.vehicle_id);
        }
    }, [selectedVehicle]);

    const isVehicleAvailable = (vehicle) => {
        return vehicle.status === 1 && parseFloat(vehicle.battery_level) >= 10;
    };

    const getVehicleIconPath = (vehicle) => {
        const isAvailable = isVehicleAvailable(vehicle);

        if (vehicle.vehicle_type === 1) {
            return isAvailable ? '/scooter.png' : '/unavailable_scooter.png';
        } else {
            return isAvailable ? '/bike.png' : '/unavailable_bike.png';
        }
    };

    const getVehicleIcon = (vehicle) => {
        const isAvailable = isVehicleAvailable(vehicle);

        if (vehicle.vehicle_type === 1) {
            return isAvailable ? scooterIcon : unavailableScooterIcon;
        } else {
            return isAvailable ? bikeIcon : unavailableBikeIcon;
        }
    };

    const fetchReports = async (vehicleId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/reports/list/?vehicle_id=${vehicleId}`);
            setReports(response.data);
        } catch (error) {
            console.error('We had an error fetching reports:', error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/vehicles/');
            console.log('Program fetched vehicles:', response.data);
            setVehicles(response.data.results);
        } catch (error) {
            console.error('We had an error fetching vehicles:', error);
        }
    };

    const fetchRentals = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/rental/');
            console.log('Program fetched rentals:', response.data);
            setRentals(response.data);

            const activeRental = response.data.find(
                rental => rental.customer === user.id && rental.status === 'active'
            );

            if (activeRental) {
                console.log('Active rental found:', activeRental);

                const rentalVehicle = vehicles.find(v => v.vehicle_id === activeRental.vehicle);
                console.log('Rental vehicle found:', rentalVehicle);

                if (rentalVehicle) {
                    const rentalWithVehicle = {
                        ...activeRental,
                        vehicle: rentalVehicle.vehicle_id
                    };

                    setCurrentRental(rentalWithVehicle);
                    setJourneySummary({
                        ...rentalWithVehicle,
                        vehicle: rentalVehicle
                    });

                } else {
                    console.error('not found for active rental:', activeRental);
                }
            }
        } catch (error) {
            console.error('Program had an Error fetching rentals:', error);
        }
    };


    const handleLockUnlock = async () => {
        if (selectedVehicle) {
            const newLockStatus = selectedVehicle.is_locked ? 0 : 1;
            try {
                const response = await axios.patch(`http://localhost:8000/api/vehicles/${selectedVehicle.vehicle_id}/`, {
                    is_locked: newLockStatus,
                });

                const updatedVehicle = response.data;

                setVehicles(prevVehicles => prevVehicles.map(v =>
                    v.vehicle_id === selectedVehicle.vehicle_id ? updatedVehicle : v
                ));

                setSelectedVehicle(updatedVehicle);

                await fetchVehicles();

            } catch (error) {
                console.error('Program error locking/unlocking vehicle:', error);
                alert('Failed to lock/unlock vehicle. Please try again later.');
            }
        }
    };

    const handleRent = async () => {
        if (!selectedVehicle) return;

        try {
            if (!isVehicleAvailable(selectedVehicle)) {
                const reason = parseFloat(selectedVehicle.battery_level) < 10
                    ? 'Vehicle battery is too low :('
                    : 'Vehicle is not available for rent currently :(';
                alert(reason);
                return;
            }

            const response = await axios.post('http://localhost:8000/api/rent/', {
                vehicle_id: selectedVehicle.vehicle_id,
                user_id: user.user_id,
            });

            const rentalWithDetails = {
                ...response.data.rental,
                vehicle: selectedVehicle.vehicle_id,
                start_location: response.data.start_location,
                end_location: response.data.end_location,
                duration: response.data.duration,
                cost: response.data.cost
            };

            setCurrentRental(rentalWithDetails);
            setShowEndRideDetails(false);

        } catch (error) {
            console.error('Program had an error renting vehicle:', error);
            alert('Failed to rent vehicle. Please try another vehicle. We are so sorry for the inconvenience.');
        }
    };

    const handleEndRide = async () => {
        try {
            const response = await axios.post(
                `http://localhost:8000/api/rentals/${currentRental.rental_id}/calculate-end/`
            );

            console.log('End ride response:', response.data);

            setJourneySummary({
                ...currentRental,
                end_location: response.data.end_location,
                duration: response.data.duration,
                cost: response.data.cost
            });
            setShowEndRideDetails(true);
            
        } catch (error) {
            console.error('Error calculating ride end:', error.response?.data || error);
            alert('Failed to end ride. Please try again.');
        }
    };

    const handleReport = async () => {
        if (!currentRental) {
            alert('No active rental found');
            return;
        }

        const trimmedComment = reportComment?.trim() || '';

        if (trimmedComment.length < 25) {
            setReportError('Comment must be at least 25 characters long');
            return;
        }

        const rentalId = currentRental.rental_id || currentRental.rental?.rental_id;

        if (!rentalId) {
            setReportError('Rental information is missing. Please try again later.');
            return;
        }

        const reportPayload = {
            vehicle: currentRental.vehicle,
            rental: rentalId,
            issue_reported: trimmedComment
        };

        console.log('Sending report:', reportPayload);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/reports/',
                reportPayload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Report submission response:', response.data);

            setShowReportForm(false);
            setJourneySummary(null);
            setReportComment('');
            setReportError('');

            if (currentRental.vehicle) {
                await fetchReports(currentRental.vehicle);
            }

            alert('Your report submitted successfully. We are sorry for the problem!');

        } catch (error) {
            console.error('Error submitting report:', {
                error,
                response: error.response?.data,
                payload: reportPayload
            });

            const errorMessage = error.response?.data?.issue_reported?.[0] ||
                error.response?.data?.error ||
                'Failed to submit report. Please try again later.';
            setReportError(errorMessage);
        }
    };

    const handleConfirmJourney = async () => {
        if (!currentRental) {
            console.error('No active rental found');
            alert('No active rental found');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/rent/${currentRental.rental_id}/end/`);

            
            if (currentRental.vehicle) {
                setVehicles(prevVehicles => prevVehicles.map(v =>
                    v.vehicle_id === currentRental.vehicle
                        ? {
                            ...v,
                            status: 1,
                            is_locked: 1,
                            location: journeySummary.end_location  
                        }
                        : v
                ));
            }

            setCurrentRental(null);
            setJourneySummary(null);
            setShowVehicleDetails(false);
            setSelectedVehicle(null);

            await fetchVehicles();
            await fetchRentals();

            alert('Journey completed successfully!');

        } catch (error) {
            console.error('Error ending journey:', error.response?.data || error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.error ||
                'Failed to end journey. Please try again.';
            alert(errorMessage);
        }
    };


    const formatBatteryLevel = (level) => {
        const parsed = parseFloat(level);
        return isNaN(parsed) ? 'N/A' : parsed.toFixed(2) + '%';
    };

    const handleMarkerClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowVehicleDetails(true);
        setJourneySummary(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    useEffect(() => {
        fetchVehicles();

        const interval = setInterval(() => {
            fetchVehicles();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Add a function to update user information
    const updateUserInfo = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    return (
        <div className="app-container">
      
            <Header onMenuClick={handleMenuClick} />
            <div className="d-flex flex-column position-relative flex-grow-1">
                {currentPage === 'map' ? (
                    <div className=" card ">
                        <MapContainer
                            center={[55.8642, -4.2518]}
                            zoom={13}
                            style={{ height: '80vh', width: '100%', zIndex: 1 }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {vehicles.map(vehicle => (
                                <Marker
                                    key={vehicle.vehicle_id}
                                    position={[vehicle.location.latitude, vehicle.location.longitude]}
                                    icon={getVehicleIcon(vehicle)}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(vehicle),
                                    }}
                                >
                                    <Popup onClose={() => setSelectedVehicle(null)}>
                                        <div>
                                            {vehicle.location.name}
                                            {!isVehicleAvailable(vehicle) && (
                                                <p className="text-danger">
                                                    {parseFloat(vehicle.battery_level) < 10 ? 'Low Battery' : 'Currently Unavailable'}
                                                </p>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {journeySummary && (
                                <Polyline
                                    positions={[
                                        [journeySummary.start_location.latitude, journeySummary.start_location.longitude],
                                        [journeySummary.end_location.latitude, journeySummary.end_location.longitude]
                                    ]}
                                    color="blue"
                                />
                            )}
                        </MapContainer>
                    </div>
                ) : currentPage === 'account' ? (
                    <AccountPage
                        onBack={() => setCurrentPage('map')}
                        userProfile={user}
                        onUpdateProfile={updateUserInfo}
                    />
                ) : currentPage === 'ride-history' ? (
                    <RideHistoryPage
                        onBack={() => setCurrentPage('map')}
                        userId={user.user_id}
                    />
                ) : currentPage === 'payment' ? (
                    <PaymentPage
                        onBack={() => setCurrentPage('map')}
                        userProfile={user}
                        onUpdateProfile={handleUpdateProfile}
                        setUser={setUser}
                    />
                ) : null}

{selectedVehicle && !showReportForm && showVehicleDetails && (
    <div className="position-absolute top-50 end-50 bg-white rounded shadow p-2"
        style={{ zIndex: 2000, width: '260px', maxWidth: '90%', padding: '8px 12px' }}>
        <img
            src={getVehicleIconPath(selectedVehicle)}
            style={{ width: '65px', height: '65px', marginRight: '8px' }}
            alt="Vehicle"
            className="me-4"
        />
        <div>
            <h3 className="fw-bold">Vehicle ID: {selectedVehicle.vehicle_id}</h3>
            <p className="mb-1" style={{ fontSize: '0.875rem' }}>
                Type: {selectedVehicle.vehicle_type === 1 ? 'Electric Scooter' : 'Electric Bike'}
            </p>
            <p className="mb-1" style={{ fontSize: '0.875rem' }}>
                Location: {selectedVehicle.location.name}
            </p>
            <p className="mb-1" style={{ fontSize: '0.875rem' }}>
                Battery: {formatBatteryLevel(selectedVehicle.battery_level)}
            </p>

            {!currentRental ? (
               
                <div className="d-flex gap-2 mt-2">
                    <button
                        onClick={handleRent}
                        className={`btn ${isVehicleAvailable(selectedVehicle) ? 'btn-primary' : 'btn-secondary disabled'}`}
                        disabled={!isVehicleAvailable(selectedVehicle)}
                    >
                        Rent
                    </button>
                </div>
            ) : !showEndRideDetails ? (
                
                <div className="d-flex gap-2 mt-2">
                    <button
                        onClick={handleEndRide}
                        className="btn btn-warning"
                    >
                        End Rent
                    </button>
                </div>
            ) : null}

            <button
                onClick={() => {
                    setSelectedVehicle(null);
                    setShowVehicleDetails(false);
                }}
                className="position-absolute top-0 end-0 btn-close"
            ></button>
        </div>
    </div>
)}

                {showReportHistory && (
                    <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100">
                        <div className="bg-white rounded shadow p-4 w-50 overflow-auto">
                            <h3 className="fw-bold mb-4">Report History</h3>
                            {reports.length === 0 ? (
                                <p>No reports found for this vehicle.</p>
                            ) : (
                                reports.map(report => (
                                    <div key={report.report_id} className="mb-4 p-4 bg-light rounded">
                                        <p className="text-muted">Report ID: {report.report_id}</p>
                                        <p className="text-muted">Date: {formatDate(report.generated_on)}</p>
                                        <p className="mt-2">{report.issue_reported}</p>
                                    </div>
                                ))
                            )}
                            <button
                                onClick={() => setShowReportHistory(false)}
                                className="mt-4 btn btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {journeySummary && (
                    <div className="position-absolute top-50  end-50 bg-white rounded shadow p-2" style={{ zIndex: 2000, width: '560px', maxWidth: '90%', padding: '8px 12px' }}>
                        <div className="bg-white rounded shadow p-4">
                            <h3 className="fw-bold mb-2">Journey Summary</h3>
                            <p>Start: {journeySummary.start_location.name}</p>
                            <p>End: {journeySummary.end_location.name}</p>
                            <p>Duration: {journeySummary.duration}</p>
                            <p>Cost: {journeySummary.cost}</p>
                            <div className="d-flex gap-2 mt-4">
                                <button
                                    onClick={handleConfirmJourney}
                                    className="btn btn-success"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setShowReportForm(true)}
                                    className="btn btn-warning"
                                >
                                    Report Issue
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showReportForm && (
                    <div className="position-absolute top-50  end-50 bg-white rounded shadow p-2" style={{ zIndex: 2000, width: '560px', maxWidth: '90%', padding: '8px 12px' }}>
                        <div className="bg-white rounded shadow p-4 w-50">
                            <h3 className="fw-bold mb-4">Report an Issue</h3>
                            <textarea
                                value={reportComment || ''}
                                onChange={(e) => setReportComment(e.target.value)}
                                className="form-control mb-2"
                                placeholder="Please describe the issue (minimum 25 characters)"
                                required
                            />
                            {reportError && (
                                <p className="text-danger small mb-2">{reportError}</p>
                            )}
                            <div className="d-flex gap-2">
                                <button
                                    onClick={handleReport}
                                    className="btn btn-warning"
                                >
                                    Send Report
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReportForm(false);
                                        setReportComment('');
                                        setReportError('');
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default App;