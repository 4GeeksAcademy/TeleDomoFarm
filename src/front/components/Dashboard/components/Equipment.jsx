import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTools, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({

    name: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    serial_number: '',
    purchase_date: null,
    status: 'Activo',
    last_maintenance: null,
    next_maintenance: null,
    notes: '',
    field_id: null
  });

  const equipmentTypes = ['Tractor', 'Cosechadora', 'Sembradora', 'Pulverizadora', 'Arado', 'Otro'];
  const statusOptions = ['Activo', 'En mantenimiento', 'Inactivo', 'En reparación'];

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Equipment - Obteniendo campos...');
        console.log('Equipment - Token:', token ? 'existe' : 'no existe');
        console.log('Equipment - URL:', `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/fields`);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/fields`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Equipment - Response status:', response.status);

        // Intentar obtener el texto primero para ver qué viene
        const responseText = await response.text();
        console.log('Equipment - Response text (primeros 200 chars):', responseText.substring(0, 200));

        if (!response.ok) {
          console.error('Equipment - Error en respuesta:', responseText);
          setFields([]);
          return;
        }

        // Parsear como JSON solo si parece ser JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Equipment - Error parseando JSON:', e);
          console.log('Equipment - Respuesta completa:', responseText);
          setFields([]);
          return;
        }

        const fieldsData = data.fields || data || [];
        console.log('Equipment - fieldsData:', fieldsData);
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      } catch (error) {
        console.error('Equipment - Error al cargar campos:', error);
        setFields([]);
      }
    };
    fetchFields();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/equipment`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Error al cargar el equipo');
      }

      const data = await response.json();
      console.log('Equipment data:', data);
      // Asegurarse de que cada equipo tenga field_name
      const equipmentWithField = data.map(item => ({
        ...item,
        field_name: item.field ? item.field.name : 'No asignado'
      }));
      setEquipment(equipmentWithField);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error(error.message || 'Error al cargar el equipo');
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Equipment - handleSubmit');
      console.log('Equipment - Token:', token ? 'existe' : 'no existe');

      const url = editingEquipment
        ? `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/equipment/${editingEquipment.id}`
        : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/equipment`;

      console.log('Equipment - URL:', url);
      console.log('Equipment - Method:', editingEquipment ? 'PUT' : 'POST');

      const method = editingEquipment ? 'PUT' : 'POST';

      // Formatear las fechas correctamente
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      };

      const payload = {
        ...formData,
        purchase_date: formatDate(formData.purchase_date),
        last_maintenance: formatDate(formData.last_maintenance),
        next_maintenance: formatDate(formData.next_maintenance)
      };

      console.log('Equipment - Enviando payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Equipment - Response status:', response.status);

      // Intentar obtener el texto primero para ver qué viene
      const responseText = await response.text();
      console.log('Equipment - Response text (primeros 200 chars):', responseText.substring(0, 200));

      // Parsear como JSON solo si parece ser JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Equipment - Error parseando JSON:', e);
        console.log('Equipment - Respuesta completa:', responseText);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(responseData.msg || 'Error al guardar equipo');
      }

      toast.success(editingEquipment ? 'Equipo actualizado' : 'Equipo agregado');
      setShowModal(false);
      fetchEquipment();
      resetForm();
    } catch (error) {
      console.error('Equipment - Error al guardar equipo:', error);
      toast.error(error.message || 'Error al guardar el equipo');
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name || '',
      type: item.type || '',
      brand: item.brand || '',
      model: item.model || '',
      year: item.year || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date ? new Date(item.purchase_date) : null,
      status: item.status || 'Activo',
      last_maintenance: item.last_maintenance ? new Date(item.last_maintenance) : null,
      next_maintenance: item.next_maintenance ? new Date(item.next_maintenance) : null,
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/equipment/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al eliminar');
        toast.success('Equipo eliminado');
        fetchEquipment();
      } catch (error) {
        toast.error('Error al eliminar el equipo');
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      brand: '',
      model: '',
      year: '',
      serial_number: '',
      purchase_date: null,
      status: 'Activo',
      last_maintenance: null,
      next_maintenance: null,
      notes: ''
    });
    setEditingEquipment(null);
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'En mantenimiento': return 'warning';
      case 'En reparación': return 'danger';
      case 'Inactivo': return 'secondary';
      default: return 'primary';
    }
  };

  if (loading) return <div>Cargando equipo...</div>;

  return (
    <div className="equipment-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaTools className="me-2" /> Gestión de Equipo Agrícola
        </h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Agregar Equipo
        </Button>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, tipo, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre/Modelo</th>
              <th>Tipo</th>
              <th>Marca/Serie</th>
              <th>Estado</th>
              <th>Campo Asignado</th>
              <th>Próximo Mantenimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item) => (
              <tr key={item.id}>
                <td>
                  <div><strong>{item.name}</strong></div>
                  <div className="text-muted small">{item.model}</div>
                  {item.year && <div className="text-muted small">Año: {item.year}</div>}
                </td>
                <td>
                  <Badge bg="info">{item.type}</Badge>
                </td>
                <td>
                  <div>{item.brand || 'N/A'}</div>
                  {item.serial_number && (
                    <div className="text-muted small">Serie: {item.serial_number}</div>
                  )}
                </td>
                <td>
                  <Badge bg={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  {item.field_name || 'No asignado'}
                </td>
                <td>
                  {item.next_maintenance ? (
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2" />
                      {new Date(item.next_maintenance).toLocaleDateString()}
                      {new Date(item.next_maintenance) < new Date() && (
                        <Badge bg="danger" className="ms-2">¡Vencido!</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">No programado</span>
                  )}
                </td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(item)}
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Serie</Form.Label>
                  <Form.Control
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Compra</Form.Label>
                  <DatePicker
                    selected={formData.purchase_date}
                    onChange={(date) => handleDateChange(date, 'purchase_date')}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Seleccionar fecha"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={30}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Último Mantenimiento</Form.Label>
                  <DatePicker
                    selected={formData.last_maintenance}
                    onChange={(date) => handleDateChange(date, 'last_maintenance')}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Seleccionar fecha"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Hora"
                    showTimeInput
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Próximo Mantenimiento</Form.Label>
                  <DatePicker
                    selected={formData.next_maintenance}
                    onChange={(date) => handleDateChange(date, 'next_maintenance')}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Seleccionar fecha"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Hora"
                    showTimeInput
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Detalles adicionales sobre el equipo..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Campo Asignado</Form.Label>
              <Form.Select
                name="field_id"
                value={formData.field_id || ''}
                onChange={handleInputChange}
              >
                <option value="">Seleccionar campo...</option>
                {Array.isArray(fields) && fields.length > 0 ? (
                  fields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay campos disponibles</option>
                )}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingEquipment ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Equipment;