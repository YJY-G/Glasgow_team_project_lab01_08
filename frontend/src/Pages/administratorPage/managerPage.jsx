import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import React, { useEffect, useState, useRef } from 'react';
import DateRangePicker from 'rsuite/DateRangePicker';
import LogOut from '../../Components/LogOut';
import { useLocation } from 'react-router-dom';
import OrderStatusContainer from '../../Components/OrderStatusCard';
import { Dropdown } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js';
import axios from 'axios';
import { chartColors } from '../../Components/chartColor';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
);

const managerPage2 = () => {
    const pageRef = useRef();

    const [data, setData] = useState({
        mostRentedVehicleTypes: [],
        reportCount: [],
        TimePeriod: [],
        totalPayment: 0,
        totalOperator: 0,
        totalCustomer: 0,
        type1Count: 0,
        type2Count: 0
    });

    const [rentalDurationDateRange, setRentalDurationDateRange] = useState([null, null]);
    const [rentalDurationData, setRentalDurationData] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [location_Cost, setLocationCost] = useState([]);
    const [location_Count, setLocationCount] = useState([]);
    // const [payment,setPaymentDurationData] =useState([]);
    const location = useLocation();
    const userId = location.state?.userId;

    const fetchRentalDurationData = async (start = null, end = null) => {
        try {
            const rentalResponse = await axios.get('http://127.0.0.1:8000/api/manager/rental');
            const pay = await axios.get('http://127.0.0.1:8000/api/manager/PaymentSum', {
                params: { start_date: start, end_date: end }
            });
            const reportResponse = await axios.get('http://127.0.0.1:8000/api/manager/vehicleReportCount', {
                params: { start_date: start, end_date: end }
            });
            const locationCostResponse = await axios.get('http://127.0.0.1:8000/api/manager/locationCostSum', {
                params: { start_date: start, end_date: end }
            });
            const locationVehicleCountResponse = await axios.get('http://127.0.0.1:8000/api/manager/locationVehicleCount', {
                params: { start_date: start, end_date: end }
            });

            const rentalData = rentalResponse.data.filter(rental => {
                const startTime = new Date(rental.rental_start_time);
                const endTime = new Date(rental.rental_end_time);
                return (!start || startTime >= new Date(start)) && (!end || endTime <= new Date(end));
            }).map(rental => {
                const startTime = new Date(rental.rental_start_time);
                const endTime = new Date(rental.rental_end_time);
                const periodTime = (endTime - startTime) / (1000 * 60);
                return { ...rental, periodTime };
            });

            const groupedByVehicle = rentalData.reduce((acc, rental) => {
                const vehicleId = rental.vehicle.vehicle_id;
                if (!acc[vehicleId]) acc[vehicleId] = { vehicleId, totalPeriodTime: 0 };
                acc[vehicleId].totalPeriodTime += rental.periodTime;
                return acc;
            }, {});
            // Report broken  bike or scooter data
            const groupbyReport = Object.values(
                reportResponse.data.reduce((acc, report) => {
                    const vehicleIdReport = report.vehicle_id;
                    if (!acc[vehicleIdReport]) acc[vehicleIdReport] = { vehicleIdReport, totalReportTime: 0 };
                    acc[vehicleIdReport].totalReportTime += report.report_count;
                    return acc;
                }, {})
            );
            // Total cost in each location 
            const groupbyLocationCost = Object.values(
                locationCostResponse.data.reduce((acc, locationCost) => {
                    const locationName = locationCost.name;
                    if (!acc[locationName]) acc[locationName] = { locationName, total_cost: 0 };
                    acc[locationName].total_cost += locationCost.total_cost
                    return acc
                })
            );

            const groupbyLocationBikeCount = Object.values(
                locationVehicleCountResponse.data.reduce((acc, locationCount) => {
                    const locationName = locationCount.name;
                    if (!acc[locationName]) acc[locationName] = { locationName, vehicle_count: 0 };
                    acc[locationName].vehicle_count += locationCount.vehicle_count

                    return acc
                })
            );
            // Calculate the total payment
            const totalPayment = pay.data.reduce((acc, user) => acc + parseInt(user.total), 0);

            setData(prevData => ({
                ...prevData,
                totalPayment,
            }));

            setRentalDurationData(Object.values(groupedByVehicle));
            setReportData(Object.values(groupbyReport));
            setLocationCost(Object.values(groupbyLocationCost));
            setLocationCount(Object.values(groupbyLocationBikeCount));
        } catch (error) {
            console.error('Error fetching rental duration data:', error);
        }
    };

    const fetchData = async () => {
        try {
            const [numberResponse, roleCountResponse] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/manager/vehicle'),
                axios.get('http://127.0.0.1:8000/api/manager/roleCount'),

            ]);
            let type1 = 0;
            let type2 = 0;

            numberResponse.data.forEach((vehicle) => {
                if (vehicle.vehicle_type === 1) {
                    type1 += 1;
                } else if (vehicle.vehicle_type === 2) {
                    type2 += 1;
                }
            });

            setData(prevData => ({
                ...prevData,
                totalOperator: roleCountResponse.data.operator_count,
                totalCustomer: roleCountResponse.data.customer_count,
                type1Count:type1,
                type2Count:type2

            }));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchRentalDurationData();

    }, []);

    const handleDateRangeChange = (value) => {
        setRentalDurationDateRange(value);
        const [start, end] = value || [];
        fetchRentalDurationData(start, end);
    };
    const exportToPDF = () => {
        const input = pageRef.current;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("dashboard.pdf");
        });
    };

    const rentalDurationChartData = {
        labels: rentalDurationData.map(item => item.vehicleId),
        datasets: [{
            label: 'Vehicle Rental Duration (mins)',
            data: rentalDurationData.map(item => item.totalPeriodTime),
            backgroundColor: chartColors,
            hoverBorderColor: 'rgb(0, 0, 0)',
            hoverBorderWidth: 4,
            hoverOffset: 6
        }],


    };

    const moneyEarnedPerLocation = {
        labels: data.mostRentedVehicleTypes.map(item => item.vehicle.location.name),
        datasets: [{
            label: 'Most rented vehicle types',
            data: data.mostRentedVehicleTypes.map(item => item.vehicle.rent_count || 0),
            backgroundColor: chartColors,
            hoverOffset: 6
        }]
    };

    const eachBikeReportCount = {
        labels: reportData.map(item => item.vehicleIdReport),
        datasets: [{
            label: 'Most used rental location',
            data: reportData.map(item => item.totalReportTime),
            backgroundColor: chartColors,
            hoverOffset: 6
        }]
    };
    const eachLocationCost = {
        labels: location_Cost
            .filter(item => item.total_cost > 0)
            .map(item => item.locationName),
        datasets: [{
            label: 'money earned per rental location',
            data: location_Cost
                .filter(item => item.total_cost > 0)
                .map(item => item.total_cost),
            backgroundColor: chartColors,
            hoverOffset: 6
        }]
    };
    const eachLocationBikeCount = {
        labels: location_Count.map(item => item.locationName),
        datasets: [{
            label: 'Number of bikes per locations',
            data: location_Count.map(item => item.vehicle_count),
            backgroundColor: chartColors,
            hoverOffset: 6
        }]
    };
    const eachLocationCostOptions = {
        scales: {
            x: {
                ticks: {
                    maxRotation: 90,
                    minRotation: 55
                }
            }
        }
    };

    return (
        <div className="container-fluid">
            <div className="">
                <div
                    className="col-md-3 col-lg-2 bg-dark text-white p-3 sidebar"
                    style={{ position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 1000 }}
                >
                    <a href="#" className="text-decoration-none text-white mb-3 d-block">
                        <span className="fs-4">E-vehicle Administrator</span>
                    </a>
                    <hr />
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item">
                            <a href="#Pie1" className="nav-link text-white">Total Rental Time Distribution</a>
                        </li>
                        <li className="nav-item">
                            <a href="#Pie2" className="nav-link text-white">Report Brokens Per Vehicle</a>
                        </li>
                        <li className="nav-item">
                            <a href="#Bar2" className="nav-link text-white">Number of cars per locations</a>
                        </li>
                        <li className="nav-item">
                            <a href="#Bar4" className="nav-link text-white">Money Earned per Location</a>
                        </li>

                    </ul>
                    <hr />

                    <Dropdown>
                        <Dropdown.Toggle
                            variant="secondary"
                            id="dropdownMenuButton"
                            className="d-flex align-items-center text-white text-decoration-none"
                        >
                            <img
                                src="https://via.placeholder.com/40"
                                alt=""
                                width="40"
                                height="40"
                                className="rounded-circle me-2"
                            />
                            <strong>Username</strong>
                        </Dropdown.Toggle>

                        <Dropdown.Menu variant="dark" className="text-small shadow">
                            <Dropdown.Item href="#">Profile</Dropdown.Item>
                            <Dropdown.Item href="#">Settings</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="#">
                                <LogOut userId={userId} />
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <button onClick={exportToPDF} className="btn btn-primary mb-3">
                        Export as PDF
                    </button>
                </div>
                <div ref={pageRef} className="col-md-9 col-lg-10 offset-md-3 offset-lg-2 p-4">
                    <DateRangePicker size="lg" placeholder="Choose date" onChange={handleDateRangeChange} />
                    <OrderStatusContainer data={data} />
                    <div className="row mb-4">
                        <div className="col-md-7 d-flex flex-column">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-primary text-white">
                                    <h4 id='Pie1' className="mb-0">Total Rental Time Distribution</h4>
                                </div>
                                <div className="card-body">
                                    <Doughnut data={rentalDurationChartData} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5 d-flex flex-column" style={{ gap: '10px' }}>
                            <div className="card shadow border-0 flex-grow-1">
                                <div className="card-header bg-secondary text-white">
                                    <h5 id="Pie2" className="mb-0">Report Brokens Per Vehicle</h5>
                                </div>
                                <div className="card-body">
                                    <Pie data={eachBikeReportCount} />
                                </div>
                            </div>
                            <div className="card shadow border-0 flex-grow-1">
                                <div className="card-header bg-secondary text-white">
                                    <h5 id="Bar2" className="mb-0">Number of cars per locations</h5>
                                </div>
                                <div className="card-body">
                                    <Bar data={eachLocationBikeCount} options={eachLocationCostOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 d-flex flex-column">
                            <div className="card shadow border-0 h-100">
                                <div className="card-header bg-primary text-white">
                                    <h4 id="Bar4" className="mb-0">Money Earned per Location</h4>
                                </div>
                                <div className="card-body">
                                    <Bar data={eachLocationCost} options={eachLocationCostOptions} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default managerPage2;
