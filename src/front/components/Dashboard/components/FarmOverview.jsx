// src/front/components/Dashboard/components/FarmOverview.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { GiWheat } from "react-icons/gi";
import { FaDollarSign, FaExclamationTriangle, FaCheckCircle, FaClock, FaBox, FaTractor, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import WeatherWidget from './WeatherWidget';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3001';

const FarmOverview = () => {
  const [stats, setStats] = useState({
    fields: { total: 0, active: 0, totalArea: 0 },
    staff: { total: 0, active: 0 },
    equipment: { total: 0, active: 0 },
    inventory: { totalItems: 0, lowStock: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Obtener datos de campos
      const fieldsResponse = await fetch(`${API_URL}/api/fields`, { headers });
      const fieldsData = fieldsResponse.ok ? await fieldsResponse.json() : { fields: [] };

      // Obtener datos de personal
      const staffResponse = await fetch(`${API_URL}/api/staff`, { headers });
      const staffData = staffResponse.ok ? await staffResponse.json() : [];

      // Obtener datos de equipos
      const equipmentResponse = await fetch(`${API_URL}/api/equipment`, { headers });
      const equipmentData = equipmentResponse.ok ? await equipmentResponse.json() : [];

      // Obtener datos de inventario
      const inventoryResponse = await fetch(`${API_URL}/api/inventory`, { headers });
      const inventoryData = inventoryResponse.ok ? await inventoryResponse.json() : [];
      const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];

      // Procesar estadísticas
      const processedStats = {
        fields: {
          total: fieldsData.fields?.length || 0,
          active: fieldsData.fields?.filter(f => f.status === 'Activo').length || 0,
          totalArea: fieldsData.fields?.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0) || 0
        },
        staff: {
          total: staffData.length || 0,
          active: staffData.filter(s => s.status === 'Activo').length || 0
        },
        equipment: {
          total: equipmentData.length || 0,
          active: equipmentData.filter(e => e.status === 'Activo').length || 0
        },
        inventory: {
          totalItems: inventoryArray.length || 0,
          lowStock: inventoryArray.filter(item =>
            item.min_quantity && parseFloat(item.quantity) <= parseFloat(item.min_quantity)
          ).length || 0
        }
      };

      // Procesar actividades recientes (basado en next_action de campos)
      const activities = fieldsData.fields?.map(field => ({
        id: field.id,
        type: 'field_action',
        title: `Campo: ${field.name}`,
        description: field.next_action || 'Sin acción programada',
        status: field.status,
        crop: field.crop,
        date: field.updated_at
      })) || [];

      // Procesar tareas próximas (acciones pendientes y stock bajo)
      const tasks = [
        ...fieldsData.fields?.filter(f => f.next_action).map(field => ({
          id: `field_${field.id}`,
          type: 'field',
          priority: 'medium',
          title: field.name,
          description: field.next_action,
          dueDate: 'Próximamente'
        })) || [],
        ...inventoryArray.filter(item =>
          item.min_quantity && parseFloat(item.quantity) <= parseFloat(item.min_quantity)
        ).map(item => ({
          id: `inventory_${item.id}`,
          type: 'inventory',
          priority: 'high',
          title: `Stock bajo: ${item.name}`,
          description: `Actual: ${item.quantity} ${item.unit} | Mínimo: ${item.min_quantity} ${item.unit}`,
          dueDate: 'Urgente'
        })) || []
      ].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }).slice(0, 5);

      setStats(processedStats);
      setRecentActivities(activities.slice(0, 5));
      setUpcomingTasks(tasks);
      setFields(fieldsData.fields || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
      toast.error('Error al cargar información del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FaExclamationTriangle className="text-danger" />;
      case 'medium':
        return <FaClock className="text-warning" />;
      case 'low':
        return <FaCheckCircle className="text-success" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'success'
    };
    return variants[priority] || 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando información del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchDashboardData}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Campos Activos',
      value: `${stats.fields.active}/${stats.fields.total}`,
      subtitle: `${stats.fields.totalArea.toFixed(1)} ha totales`,
      icon: <GiWheat size={24} />,
      color: 'success'
    },
    {
      title: 'Personal',
      value: `${stats.staff.active}/${stats.staff.total}`,
      subtitle: 'Empleados activos',
      icon: <FaUsers size={24} />,
      color: 'info'
    },
    {
      title: 'Equipos',
      value: `${stats.equipment.active}/${stats.equipment.total}`,
      subtitle: 'Maquinaria operativa',
      icon: <FaTractor size={24} />,
      color: 'warning'
    },
    {
      title: 'Inventario',
      value: stats.inventory.totalItems,
      subtitle: `${stats.inventory.lowStock} con stock bajo`,
      icon: <FaBox size={24} />,
      color: stats.inventory.lowStock > 0 ? 'danger' : 'success'
    },
  ];

  return (
    <div className="farm-overview">
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col md={3} key={index}>
            <Card className={`h-100 stat-card border-${stat.color}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-1 text-{stat.color}">{stat.value}</h3>
                    <small className="text-muted">{stat.subtitle}</small>
                  </div>
                  <div className={`stat-icon text-${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Clima de Todos los Campos */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FaClock className="me-2 text-primary" />
                Clima de Todos los Campos
              </h5>
            </Card.Header>
            <Card.Body className="p-3">
              {fields.length > 0 ? (
                <Row className="g-3">
                  {fields.map((field) => (
                    <Col md={6} lg={4} key={field.id}>
                      <div className="mb-2">
                        <h6 className="text-muted mb-2 small">
                          <GiWheat className="me-1" />
                          {field.name}
                        </h6>
                        <WeatherWidget
                          city={field.location}
                          compact={true}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-4 text-muted">
                  <GiWheat size={48} className="mb-3 opacity-50" />
                  <p>No hay campos registrados para mostrar el clima</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Actividad Reciente</h5>
            </Card.Header>
            <Card.Body>
              {recentActivities.length > 0 ? (
                <div className="activity-timeline">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="activity-item d-flex align-items-start mb-3">
                      <div className="activity-icon me-3">
                        <GiWheat className="text-primary" size={20} />
                      </div>
                      <div className="activity-content flex-grow-1">
                        <h6 className="mb-1">{activity.title}</h6>
                        <p className="mb-1 text-muted">{activity.description}</p>
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg={activity.status === 'Activo' ? 'success' : 'secondary'}>
                            {activity.status}
                          </Badge>
                          <small className="text-muted">{activity.crop}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <GiWheat size={48} className="mb-3 opacity-50" />
                  <p>No hay actividades recientes</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Próximas Tareas</h5>
            </Card.Header>
            <Card.Body>
              {upcomingTasks.length > 0 ? (
                <div className="tasks-list">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="task-item mb-3 p-2 border rounded">
                      <div className="d-flex align-items-start">
                        <div className="me-2">
                          {getPriorityIcon(task.priority)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{task.title}</h6>
                          <p className="mb-1 small text-muted">{task.description}</p>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={getPriorityBadge(task.priority)} className="small">
                              {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                            <small className="text-muted">{task.dueDate}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FaCheckCircle size={48} className="mb-3 opacity-50" />
                  <p>No hay tareas pendientes</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FarmOverview;