import React from 'react';
import { FaBox, FaTruck, FaSignOutAlt, FaTachometerAlt, FaListUl } from 'react-icons/fa';
import { GiCardboardBox } from 'react-icons/gi';
import './Sidebar.css';

const PAGES = {
  DASHBOARD: 'dashboard',
  STOCK: 'stock',
  TRUCKS: 'trucks',
  LOAD_TRUCKS: 'load_trucks',
  RECUIT_SIMULE: 'recuit_simule',
  LOGOUT: 'logout',
};

const Sidebar = ({ changePage, activePage }) => {
    const SidebarLink = ({ keyId, Icon, label }) => (
        <a
            className={`sidebar-link ${activePage === keyId ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); changePage(keyId); }}
            href={`#${keyId}`}
        >
            <Icon className="link-icon" />
            <span className="link-text">{label}</span>
        </a>
    );

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <GiCardboardBox size={30} color="#f0ebf5" /> 
                </div>
                <div className="app-info">
                    <p className="app-name">viaCargo</p>
                </div>
            </div>

            <nav className="sidebar-nav-main">
                <SidebarLink keyId={PAGES.DASHBOARD} Icon={FaTachometerAlt} label="Tableau de bord" />
                <SidebarLink keyId={PAGES.STOCK} Icon={FaBox} label="Gestion de stock" />
                <SidebarLink keyId={PAGES.TRUCKS} Icon={FaTruck} label="Gestion de camion" />
                <SidebarLink keyId={PAGES.LOAD_TRUCKS} Icon={FaListUl} label="Chargement de camion" />
                <SidebarLink keyId={PAGES.RECUIT_SIMULE} Icon={FaListUl} label="Optimisation chemin" />
            </nav>

            <div className="sidebar-nav-bottom">
                <SidebarLink keyId={PAGES.LOGOUT} Icon={FaSignOutAlt} label="Déconnexion" />
            </div>
        </div>
    );
};

export default Sidebar;
