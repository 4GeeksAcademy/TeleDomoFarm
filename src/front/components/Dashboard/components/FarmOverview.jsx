// src/front/components/Dashboard/components/FarmOverview.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { GiWheat, GiCow } from "react-icons/gi";
import { FaTractor } from "react-icons/fa";
import { FaDollarSign } from 'react-icons/fa';

const FarmOverview = () => {
  // Mock data - replace with actual data from your API
  const stats = [
    { 
      title: 'Hectáreas Activas', 
      value: '45.5', 
      icon: <GiWheat size={24} />,
      trend: '+5%',
      trendType: 'up'
    },
    { 
      title: 'Animales', 
      value: '870', 
      icon: <GiCow size={24} />,
      trend: '+12%',
      trendType: 'up'
    },
    { 
      title: 'Ingresos Mensuales', 
      value: '$48,500', 
      icon: <FaDollarSign size={24} />,
      trend: '+8%',
      trendType: 'up'
    },
    { 
      title: 'Maquinaria Activa', 
      value: '12/15', 
      icon: <FaTractor size={24} />,
      trend: '-2%',
      trendType: 'down'
    },
  ];

  return (
    <div className="farm-overview">
      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col md={3} key={index}>
            <Card className="h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                    <span className={`trend ${stat.trendType}`}>
                      {stat.trend} {stat.trendType === 'up' ? '↑' : '↓'}
                    </span>
                  </div>
                  <div className="stat-icon">
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Actividad Reciente</h5>
            </Card.Header>
            <Card.Body>
              {/* Activity timeline component will go here */}
              <div className="text-center py-4 text-muted">
                Gráfico de actividad reciente
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Próximas Tareas</h5>
            </Card.Header>
            <Card.Body>
              {/* Upcoming tasks component will go here */}
              <div className="text-center py-4 text-muted">
                Lista de tareas pendientes
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FarmOverview;