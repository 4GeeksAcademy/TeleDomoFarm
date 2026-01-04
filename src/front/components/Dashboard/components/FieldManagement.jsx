import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { GiWheat } from 'react-icons/gi';
import { toast } from 'react-toastify';
import WeatherWidget from './WeatherWidget';
import LocationPicker from './LocationPicker';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3001';

const FieldManagement = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    crop: '',
    area: '',
    status: 'Activo',
    next_action: '',
    location: '',
    city: '',
    latitude: null,
    longitude: null
  });

  useEffect(() => {
    // Primero probar si el backend está corriendo
    testBackendConnection();
    fetchFields();
  }, []);

  const testBackendConnection = async () => {
    try {
      console.log('FieldManagement - Probando conexión con backend...');
      const response = await fetch(`${API_URL}/api/ping`);
      console.log('FieldManagement - Ping response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('FieldManagement - Backend está corriendo:', data);
      } else {
        console.error('FieldManagement - Backend no responde correctamente');
      }
    } catch (error) {
      console.error('FieldManagement - Error de conexión con backend:', error);
      console.error('FieldManagement - El backend no está corriendo o hay problema de red');
    }
  };

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('FieldManagement - Obteniendo campos...');
      console.log('FieldManagement - Token:', token ? 'existe' : 'no existe');
      console.log('FieldManagement - URL:', `${API_URL}/api/fields`);
      console.log('FieldManagement - API_URL completo:', API_URL);

      if (!token) {
        console.error('FieldManagement - No hay token disponible');
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/api/fields`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('FieldManagement - Response status:', response.status);
      console.log('FieldManagement - Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FieldManagement - Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('FieldManagement - Datos recibidos:', data);
      console.log('FieldManagement - data.fields:', data.fields);
      console.log('FieldManagement - Array.isArray(data.fields):', Array.isArray(data.fields));

      // CORRECCIÓN: Extraer el array de campos del objeto
      const fieldsArray = data.fields || [];
      console.log('FieldManagement - fieldsArray:', fieldsArray);

      setFields(fieldsArray);
    } catch (error) {
      console.error('FieldManagement - Error al cargar campos:', error);
      console.error('FieldManagement - Error completo:', error.message);
      console.error('FieldManagement - Stack:', error.stack);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location.display_name || `${location.city}, ${location.country}`,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingField
        ? `${API_URL}/api/fields/${editingField.id}`
        : `${API_URL}/api/fields`;

      const method = editingField ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al guardar el campo');
      }

      const result = await response.json();

      if (editingField) {
        setFields(fields.map(f => f.id === result.id ? result : f));
        toast.success('Campo actualizado correctamente');
      } else {
        setFields([...fields, result]);
        toast.success('Campo creado correctamente');
      }

      handleCloseModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      crop: field.crop,
      area: field.area,
      status: field.status,
      next_action: field.next_action || '',
      location: field.location || '',
      city: field.city || '',
      latitude: field.latitude || null,
      longitude: field.longitude || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este campo?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/fields/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Error al eliminar el campo');
        }

        setFields(fields.filter(field => field.id !== id));
        toast.success('Campo eliminado correctamente');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingField(null);
    setFormData({
      name: '',
      crop: '',
      area: '',
      status: 'Activo',
      next_action: ''
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'En siembra': return 'warning';
      case 'En crecimiento': return 'primary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Campos</h5>
          <div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <GiWheat className="me-1" /> Nuevo Campo
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Cultivo</th>
                <th>Área (ha)</th>
                <th>Estado</th>
                <th>Próxima Acción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fields.length > 0 ? (
                fields.map((field) => (
                  <tr key={field.id}>
                    <td>{field.id}</td>
                    <td>{field.name}</td>
                    <td>
                      <small className="text-muted d-block">{field.location || field.city || 'Sin ubicación'}</small>
                      {field.city && <small className="text-muted"> {field.city}</small>}
                    </td>
                    <td>{field.crop}</td>
                    <td>{field.area}</td>
                    <td>
                      <Badge bg={getStatusVariant(field.status)}>
                        {field.status}
                      </Badge>
                    </td>
                    <td>{field.next_action || 'Ninguna'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(field)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(field.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No hay campos registrados</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para crear/editar campo */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingField ? 'Editar Campo' : 'Nuevo Campo'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formName">
                <Form.Label>Nombre del Campo</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            {/* Selector de Ubicación */}
            <Row className="mb-3">
              <Col>
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={editingField ? {
                    city: editingField.city,
                    latitude: editingField.latitude,
                    longitude: editingField.longitude
                  } : null}
                />
              </Col>
            </Row>

            {/* Widget de Clima */}
            {(formData.city || (formData.latitude && formData.longitude)) && (
              <Row className="mb-3">
                <Col>
                  <WeatherWidget
                    city={formData.city}
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                  />
                </Col>
              </Row>
            )}

            <Row className="mb-3">
              <Form.Group as={Col} controlId="formCrop">
                <Form.Label>Cultivo</Form.Label>
                <Form.Control
                  type="text"
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formArea">
                <Form.Label>Área (ha)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formStatus">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Activo">Activo</option>
                  <option value="En siembra">En siembra</option>
                  <option value="En crecimiento">En crecimiento</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="formNextAction">
                <Form.Label>Próxima Acción</Form.Label>
                <Form.Control
                  type="text"
                  name="next_action"
                  value={formData.next_action}
                  onChange={handleInputChange}
                  placeholder="Ej: Riego, Cosecha, etc."
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingField ? 'Guardar Cambios' : 'Crear Campo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default FieldManagement;