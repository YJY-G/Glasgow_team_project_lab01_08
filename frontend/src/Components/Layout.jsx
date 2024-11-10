import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const noHeaderPaths = ['/Manager','/Operator2','/Customer','/cus']; 
  const headerHeight = 120; 

  
  const needsHeader = !noHeaderPaths.includes(location.pathname);

  return (
    <>
      {needsHeader && <Header />}
      <div style={{ paddingTop: needsHeader ? `${headerHeight}px` : '0' }}>
        {children}
      </div>
      {needsHeader && <Footer />}
    </>
  );
};


export default Layout;