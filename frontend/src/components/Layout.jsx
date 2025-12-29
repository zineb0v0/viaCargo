import React from 'react';
import Sidebar from './Sidebar'; 
import './Layout.css'; 

const Layout = ({ children, changePage, activePage }) => { 
  return (
    <div className="app-layout">
      <Sidebar 
          changePage={changePage} 
          activePage={activePage} 
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;