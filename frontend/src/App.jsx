// src/App.jsx

import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import StockPage from './pages/StockPage'; 
import TruckPage from './pages/TruckPage'; 
import TruckLoadingPage from './pages/TruckLoadingPage'; 
import RouteOptimizerMap from './components/map';
import './App.css';

const PAGES = {
  DASHBOARD: 'dashboard',
  STOCK: 'stock',
  TRUCKS: 'trucks',
  LOAD_TRUCKS: 'load_trucks',
  LOGOUT: 'logout',
};

function App() {
  // Démarre l'application sur la LoginPage par défaut (isLoggedIn: false)
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  // Définit le DASHBOARD comme page par défaut après connexion
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD); 

  // Fonction passée à la Sidebar pour changer de page
  const changePage = (pageKey) => {
    setCurrentPage(pageKey);
    // Logique de déconnexion
    if (pageKey === PAGES.LOGOUT) {
        setIsLoggedIn(false);
    }
  };
  
  // Fonction de rendu du composant de page actif
  const renderCurrentPage = () => {
    switch (currentPage) {
      case PAGES.DASHBOARD:
        return <DashboardPage />;
      case PAGES.STOCK:
        return <StockPage />;
      case PAGES.TRUCKS:
        return <TruckPage />;
      case PAGES.LOAD_TRUCKS:
        return <TruckLoadingPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Rendu principal conditionnel
  if (!isLoggedIn) {
    // Si l'utilisateur n'est PAS connecté, afficher la page de connexion
    // onLoginSuccess est appelé par LoginPage.jsx en cas de succès (admin/admin)
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
  
  // Si l'utilisateur est connecté, afficher le Layout (avec la Sidebar)
  return (
    <Layout changePage={changePage} activePage={currentPage}>
        {renderCurrentPage()}
    </Layout>
  );
}

export default App;