import { Navigate, useNavigate } from 'react-router-dom';
// The Header of the Website
import React from 'react';


function Header() {
    const navigate = useNavigate();

    return (
        <nav className="navbar fixed-top navbar-expand-lg headerColor">
            <div className="container-fluid">
                <a className="navbar-brand HeaderLogo" href="#">E-Vehicle</a>
                
             
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="headerList navbar-nav me-auto">
                        <li className="nav-item">
                            <button className="nav-link headerList-nav-link" onClick={() => navigate('/')}>Home</button>
                        </li>
                        
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;
