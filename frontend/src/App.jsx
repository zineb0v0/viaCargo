import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import StockPage from './pages/StockPage'; 
import TruckPage from './pages/TruckPage'; 
import TruckLoadingPage from './pages/TruckLoadingPage'; 
import RouteOptimizerMap from './components/map';
import OptimisationChemin from './pages/OptimisationChemin';
import './App.css';

const PAGES = {
  DASHBOARD: 'dashboard',
  STOCK: 'stock',
  TRUCKS: 'trucks',
  LOAD_TRUCKS: 'load_trucks',
  RECUIT_SIMULE: 'recuit_simule',
  LOGOUT: 'logout',
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD); 

  const changePage = (pageKey) => {
    setCurrentPage(pageKey);
    if (pageKey === PAGES.LOGOUT) setIsLoggedIn(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case PAGES.DASHBOARD: return <DashboardPage />;
      case PAGES.STOCK: return <StockPage />;
      case PAGES.TRUCKS: return <TruckPage />;
      case PAGES.LOAD_TRUCKS: return <TruckLoadingPage />;
      case PAGES.RECUIT_SIMULE: return <OptimisationChemin />;
      default: return <DashboardPage />;
    }
  };

  if (!isLoggedIn) return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;

  return (
    <Layout changePage={changePage} activePage={currentPage}>
        {renderCurrentPage()}
    </Layout>
  );
}

export default App;
