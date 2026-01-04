// src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import {
  FaHome,
  FaSeedling,
  FaBoxes,
  FaDollarSign,
  FaTools,
  FaUsers,
  FaUserCog,  // Icono de configuración de usuario
  FaSignOutAlt,  // Icono de cerrar sesión
  FaCog,  // Icono de engranaje
  FaUser  // Icono de perfil
} from 'react-icons/fa';
import { NavDropdown } from 'react-bootstrap';  // Importar NavDropdown
import { useAuth } from '../../services/AuthContext';
import FarmOverview from './components/FarmOverview';
import FieldManagement from './components/FieldManagement';
import Inventory from './components/Inventory';
import Financials from './components/Financials';
import Equipment from './components/Equipment';
import Staff from './components/Staff';

const tabs = [
  { id: 'overview', label: 'Resumen', icon: <FaHome className="me-2" /> },
  { id: 'fields', label: 'Campos', icon: <FaSeedling className="me-2" /> },
  { id: 'inventory', label: 'Inventario', icon: <FaBoxes className="me-2" /> },
  { id: 'financials', label: 'Finanzas', icon: <FaDollarSign className="me-2" /> },
  { id: 'equipment', label: 'Equipos', icon: <FaTools className="me-2" /> },
  { id: 'staff', label: 'Personal', icon: <FaUsers className="me-2" /> },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Container fluid className="p-0 d-flex flex-column" style={{ height: '100vh' }}>
      {/* NavBar*/}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand>TeleDomoFarm</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {tabs.map(tab => (
                <Nav.Link
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="d-flex align-items-center"
                >
                  {tab.icon}
                  {tab.label}
                </Nav.Link>
              ))}
            </Nav>

            {/* Menú de usuario */}
            <Nav>
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <FaUserCog className="me-2" />
                    <span>Usuario</span>
                  </div>
                }
                id="basic-nav-dropdown"
                align="end"
                className="text-white"
              >
                <NavDropdown.Item href="#perfil">
                  <FaUser className="me-2" />
                  Perfil
                </NavDropdown.Item>
                <NavDropdown.Item href="#configuracion">
                  <FaCog className="me-2" />
                  Configuración
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() => {
                    // Aquí iría la lógica para cerrar sesión
                    // Por ejemplo: logout();
                    console.log('Cerrando sesión...');
                  }}
                  className="text-danger"
                >
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="dashboard flex-grow-1 overflow-auto p-3">
        <div className="dashboard-content">
          {activeTab === 'overview' && <FarmOverview />}
          {activeTab === 'fields' && <FieldManagement />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'financials' && <Financials />}
          {activeTab === 'equipment' && <Equipment />}
          {activeTab === 'staff' && <Staff />}
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;