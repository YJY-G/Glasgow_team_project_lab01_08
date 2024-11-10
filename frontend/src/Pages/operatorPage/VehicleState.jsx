import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Modal from 'react-modal';
import LogOut from '../../Components/LogOut';

const scooterIcon = new L.Icon({
  iconUrl: '/scooter.png',
  iconSize: [40, 40],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const bikeIcon = new L.Icon({
  iconUrl: '/bike.png',
  iconSize: [40, 40],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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

const chargingStationIcon = new L.Icon({
  iconUrl: '/charge_station.png',
  iconSize: [25, 25],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function VehicleState() {
  const [vehicles, setVehicles] = useState([]);
  const [chargeStation, setChargeStation] = useState([]);
  const [vehiclesReport, setVehiclesReport] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    nextPage: null,
    previousPage: null,
    currentPageReport: 1,
    nextPageReport: null,
    previousPageReport: null,
  });
  const [modal, setModal] = useState({
    isOpen: false,
    vehicleId: '',
    type: '',
    newStatus: '',
    batteryLevel: 0,
    locationId: 0,
  });
  const [activeTab, setActiveTab] = useState('trackLocation');
  const userId = location.state?.userId;

  useEffect(() => {
    fetchVehicles();
    fetchChargeStation();
  }, []);

  useEffect(() => {
    if (activeTab === 'chargeRepair') fetchPagedVehicles(pagination.currentPage);
  }, [pagination.currentPage, activeTab]);

  useEffect(() => {
    if (activeTab === 'report') fetchVehicleReports(pagination.currentPageReport);
  }, [pagination.currentPageReport, activeTab]);
  useEffect(() => {
    if (activeTab === 'report') fetchVehicleReports(pagination.currentPageReport);
  }, [pagination.currentPageReport, activeTab]);


  const fetchChargeStation = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/vehicle/chargepointList');
      setChargeStation(response.data)

    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  }
  const fetchVehicles = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/vehicles/');
      setVehicles(data.results);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchPagedVehicles = async (page) => {
    try {
      const { data } = await axios.get(`http://localhost:8000/api/vehiclesListPage/?page=${page}`);
      setVehicles(data.results);
      setPagination((prev) => ({
        ...prev,
        nextPage: data.next,
        previousPage: data.previous,
      }));
    } catch (error) {
      console.error('Error fetching vehicle list', error);
    }
  };

  const fetchVehicleReports = async (page) => {
    try {
      const { data } = await axios.get(`http://localhost:8000/api/reportsListPage/?page=${page}`);
      setVehiclesReport(data.results);
      setPagination((prev) => ({
        ...prev,
        nextPageReport: data.next,
        previousPageReport: data.previous,
      }));
    } catch (error) {
      console.error('Error fetching vehicle reports', error);
    }
  };

  const handleModalOpen = async (vehicleId, type, status = '') => {
    try {
      const response = await axios.get('http://localhost:8000/api/vehicles/');
      const vehicle = response.data.results.find((v) => v.vehicle_id === vehicleId); 
  
      if (vehicle) {
        setModal({
          isOpen: true,
          vehicleId,
          type,
          newStatus: status,
          batteryLevel: vehicle.battery_level, 
          locationId: 0,
        });
      } else {
        console.error('Vehicle not found');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };


  const handleModalClose = () => {
    setModal({ isOpen: false, vehicleId: '', type: '', newStatus: '' });
  };

  const handleBatteryUpdate = async (locationId) => {
    try {
      const chargeResponse = await axios.put('http://localhost:8000/api/vehicle/charge/', {
        vehicle_id: modal.vehicleId,
        battery_level: modal.batteryLevel,
      });
      if (chargeResponse.status === 200) {
        // Now move the vehicle to the selected location
        const moveResponse = await axios.put('http://127.0.0.1:8000/api/vehicle/move/', {
          vehicle_id: modal.vehicleId,
          location_id: locationId,

        });
        if (moveResponse.status === 200) {
          alert('Battery and location updated successfully');
          handleModalClose();
          fetchVehicles(); // Refresh the vehicle list
        } else {
          alert('Battery updated, but failed to update location');
        }
      }
    } catch (error) {
      console.error('Failed to update battery and location', error);
      alert('Failed to update battery and location');
    }
    console.log(modal.batteryLevel)
  };


  const handleRepairStatusUpdate = async (event) => {
    event.preventDefault();
    try {
      const { status } = await axios.put('http://localhost:8000/api/vehicle/maintain/', {
        vehicle_id: modal.vehicleId,
        status: modal.newStatus,
      });
      if (status === 200) {
        alert('Repair successful');
        handleModalClose();
        fetchPagedVehicles(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to repair', error);
      alert('Failed to repair');
    }
  };

  return (
    <div id="vehicle-state">
      <Header userId={userId} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ padding: '20px' }}>
        {activeTab === 'trackLocation' && <LocationTab vehicles={vehicles} chargeStation={chargeStation} />}


        {activeTab === 'chargeRepair' && (
          <VehicleList
            vehicles={vehicles}
            pagination={pagination}
            setPagination={setPagination}
            openModal={handleModalOpen}
          />
        )}
        {activeTab === 'report' && (
          <ReportList
            reports={vehiclesReport}
            pagination={pagination}
            setPagination={setPagination}
          />
        )}
      </div>
      <VehicleModal
        modal={modal}
        closeModal={handleModalClose}
        handleBatteryUpdate={handleBatteryUpdate}
        handleRepairStatusUpdate={handleRepairStatusUpdate}
        chargeStation={chargeStation}
      />
    </div>
  );
}

const Header = ({ userId }) => (
  <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', fontSize: '20px', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h1 style={{ margin: 0 }}>Operator Page</h1>
    <LogOut userId={userId} />
  </header>
);

const Tabs = ({ activeTab, setActiveTab }) => (
  <ul className="nav nav-tabs" style={{ marginTop: '80px' }}>
    <Tab title="Track Location" activeTab={activeTab} setActiveTab={setActiveTab} tabName="trackLocation" />
    <Tab title="Vehicle Charge and Repair" activeTab={activeTab} setActiveTab={setActiveTab} tabName="chargeRepair" />
    <Tab title="Report Problems" activeTab={activeTab} setActiveTab={setActiveTab} tabName="report" />
  </ul>
);

const Tab = ({ title, activeTab, setActiveTab, tabName }) => (
  <li className="nav-item">
    <button className={`nav-link ${activeTab === tabName ? 'active' : ''}`} onClick={() => setActiveTab(tabName)}>
      {title}
    </button>
  </li>
);


const LocationTab = ({ vehicles, chargeStation }) => {
  
  const getVehicleIcon = (vehicle) => {
    const isAvailable = vehicle.status === 1 && parseFloat(vehicle.battery_level) >= 10;
    return vehicle.vehicle_type === 1
      ? (isAvailable ? scooterIcon : unavailableScooterIcon)
      : (isAvailable ? bikeIcon : unavailableBikeIcon);
  };

  // 获取车辆状态消息
  const getVehicleStatusMessage = (vehicle) => {
    if (parseFloat(vehicle.battery_level) < 10) {
      return 'Battery Low';
    }
    if (vehicle.status !== 1) {
      return 'In Use';
    }
    return 'Available';
  };

  return (
    <div className="card">
      <MapContainer center={[55.8642, -4.2518]} zoom={13} style={{ height: '80vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.vehicle_id}
            position={[vehicle.location.latitude, vehicle.location.longitude]}
            icon={getVehicleIcon(vehicle)} 
          >
            <Popup minWidth={150} maxWidth={440}>
              <div style={{ fontSize: '12px', maxHeight: '220px', overflowY: 'auto' }}>
                <h4 className="font-bold">Vehicle ID: {vehicle.vehicle_id}</h4>
                <p>Type: {vehicle.vehicle_type === 1 ? 'Electric Scooter' : 'Electric Bike'}</p>
                <p>Location: {vehicle.location.name}</p>
                <p>Battery: {vehicle.battery_level}%</p>
                <p className="text-danger">{getVehicleStatusMessage(vehicle)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {chargeStation.map(station => (
          <Marker key={station.charging_point_id} position={[station.location.latitude, station.location.longitude]} icon={chargingStationIcon}>
            <Popup>
              <div>
                <h4>{station.location.name}</h4>
                <p>Charging Station ID: {station.location.location_id}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
const VehicleList = ({ vehicles, pagination, setPagination, openModal }) => (
  <div>
    <table>
      <thead>
        <tr>
          <th>Vehicle ID</th>
          <th>Location</th>
          <th>Status</th>
          <th>Battery Level</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map((item) => (
          <tr key={item.vehicle_id}>
            <td>{item.vehicle_id}</td>
            <td>{item.location.name}</td>
            <td>{item.status === 1 ? 'Available' : 'Unavailable'}</td>
            <td>{item.battery_level !== '0' ? item.battery_level : 'Empty'}</td>
            <td>
              <button className='btn btn-primary' onClick={() => openModal(item.vehicle_id, 'charge')}>Charge</button>
              <button className='btn btn-primary reportRepairButton' onClick={() => openModal(item.vehicle_id, 'repair', item.status)}>Repair</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <Pagination pagination={pagination} setPagination={setPagination} pageType="vehicles" />
  </div>
);

const ReportList = ({ reports, pagination, setPagination }) => (
  <div>
    <table>
      <thead>
        <tr>
          <th>Report ID</th>
          <th>Issue Reported</th>
          <th>Vehicle ID</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((item) => (
          <tr key={item.report_id}>
            <td>{item.report_id}</td>
            <td>{item.issue_reported}</td>
            <td>{item.vehicle}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <Pagination pagination={pagination} setPagination={setPagination} pageType="reports" />
  </div>
);

const Pagination = ({ pagination, setPagination, pageType }) => (
  <nav aria-label="Page navigation">
    <ul className="pagination justify-content-center">
      <li className="page-item">
        <button
          className='btn btn-primary'
          onClick={() => setPagination((prev) => ({
            ...prev,
            currentPageReport: pageType === 'reports' ? prev.currentPageReport - 1 : prev.currentPage,
          }))}
          disabled={!pagination[pageType === 'reports' ? 'previousPageReport' : 'previousPage']}
        >
          Previous
        </button>
      </li>
      <span> Page {pagination[pageType === 'reports' ? 'currentPageReport' : 'currentPage']} </span>
      <li className="page-item">
        <button
          className='btn btn-primary'
          onClick={() => setPagination((prev) => ({
            ...prev,
            currentPageReport: pageType === 'reports' ? prev.currentPageReport + 1 : prev.currentPage,
          }))}
          disabled={!pagination[pageType === 'reports' ? 'nextPageReport' : 'nextPage']}
        >
          Next
        </button>
      </li>
    </ul>
  </nav>
);


const VehicleModal = ({ modal, closeModal, handleBatteryUpdate, handleRepairStatusUpdate, chargeStation }) => {
  const [locationId, setLocationId] = useState(modal.locationId || '');

  const handleBatterySubmit = (event) => {
    event.preventDefault();
    handleBatteryUpdate(locationId);
  };

  return (
    <Modal
      isOpen={modal.isOpen}
      onRequestClose={closeModal}
      contentLabel="Edit Vehicle"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">
        {modal.type === 'charge' ? 'Charge Vehicle' : 'Repair Vehicle'}
      </h2>
      <form onSubmit={modal.type === 'charge' ? handleBatterySubmit : handleRepairStatusUpdate}
            className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Vehicle ID:
            <input 
              type="text" 
              value={modal.vehicleId} 
              readOnly 
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
            />
          </label>
        </div>
        
        {modal.type === 'charge' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Charging Station:
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a station</option>
                {chargeStation.map(station => (
                  <option
                    key={station.charging_point_id}
                    value={station.location.location_id}
                    disabled={station.status === 0}
                    className={station.status === 0 ? 'text-gray-400' : ''}
                  >
                    {station.location.location_id} ({station.status === 1 ? "Working" : "Under Repair"})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {modal.type === 'charge' ? 'Charge' : 'Repair'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleState;

