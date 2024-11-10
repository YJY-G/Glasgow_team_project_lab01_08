import React from 'react';
import icon1 from '../assets/Icon/wallet-fill.svg';
import icon2 from '../assets/Icon/person-circle.svg';
import icon3 from '../assets/Icon/person-fill-gear.svg';
import iconBike from '../assets/Icon/bicycle.svg';
import iconScooter from '../assets/Icon/scooter.svg';

const OrderStatusCard = ({ icon, value, label }) => (
    <div className="order-status-card">
        <img src={icon} alt="Icon" style={{ width: '50px', height: '50px' }} />
        <div className="order-text">
            <h3>{value}</h3>
            <p>{label}</p>
        </div>
    </div>
);

const OrderStatusContainer = ({ data }) => (
    <div className='order-status-container'>
        <OrderStatusCard icon={icon1} value={`$ ${data.totalPayment}`} label="Total Revenue" />
        <OrderStatusCard icon={icon2} value={data.totalCustomer} label="Number of Users" />
        <OrderStatusCard icon={icon3} value={data.totalOperator} label="Number of Operators" />
        <OrderStatusCard icon={iconBike} value={data.type1Count} label="Number of Bike" />
        <OrderStatusCard icon={iconScooter} value={data.type2Count} label="Number of Scooter" />
    </div>
);

export default OrderStatusContainer;
