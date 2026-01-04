import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Row, Col, Modal, Alert } from 'react-bootstrap';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUserTie, FaUserCog, FaUserShield, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedField, setSelectedField] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    hire_date: null,
    salary: '',
    status: 'Activo',
    notes: '',
    field_id: ''
  });

  const positions = ['Administrador', 'Gerente de Campo', 'Técnico Agrícola', 'Veterinario', 'Operario', 'Supervisor', 'Mecánico'];
  const statusOptions = ['Activo', 'Inactivo', 'Vacaciones', 'En licencia'];

  // Cargar personal y campos
  useEffect(() => {
    fetchStaff();
    fetchFields();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el personal');
      }

      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar el personal');
      console.error('Error:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/fields`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fieldsData = data.fields || data || [];
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      }
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setFields([]);
    }
  };

  const getRoleIcon = (position) => {
    switch (position) {
      case 'Administrador': return <FaUserShield className="text-primary" />;
      case 'Gerente de Campo': return <FaUserTie className="text-success" />;
      case 'Técnico Agrícola': return <FaUserCog className="text-info" />;
      case 'Veterinario': return <FaUserCog className="text-warning" />;
      default: return <FaUserCog className="text-secondary" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Activo': return 'success';
      case 'Vacaciones': return 'warning';
      case 'En licencia': return 'info';
      case 'Inactivo': return 'secondary';
      default: return 'light';
    }
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(member =>
    selectedStatus === 'all' || member.status === selectedStatus
  ).filter(member =>
    selectedField === 'all' || member.field_id == selectedField
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      hire_date: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingStaff
        ? `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/staff/${editingStaff.id}`
        : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/staff`;

      const method = editingStaff ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        field_id: formData.field_id ? parseInt(formData.field_id) : null,
        hire_date: formData.hire_date ? formData.hire_date.toISOString().split('T')[0] : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al guardar el personal');
      }

      const result = await response.json();
      toast.success(editingStaff ? 'Personal actualizado' : 'Personal agregado');
      setShowModal(false);
      fetchStaff();
      resetForm();

    } catch (error) {
      toast.error(error.message || 'Error al guardar el personal');
      console.error('Error:', error);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      position: member.position || '',
      hire_date: member.hire_date ? new Date(member.hire_date) : null,
      salary: member.salary || '',
      status: member.status || 'Activo',
      notes: member.notes || '',
      field_id: member.field_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este miembro del personal?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      toast.success('Personal eliminado');
      fetchStaff();
    } catch (error) {
      toast.error('Error al eliminar el personal');
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      hire_date: null,
      salary: '',
      status: 'Activo',
      notes: '',
      field_id: ''
    });
    setEditingStaff(null);
  };

  if (loading) return <div className="text-center p-4"><h4>Cargando personal...</h4></div>;

  return (
    <div className="staff-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaUserCog className="me-2" /> Gestión de Personal
        </h2>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaUserPlus className="me-2" /> Nuevo Personal
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre, cargo o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
              >
                <option value="all">Todas las fincas</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>{field.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="text-end">
                <Badge bg="info" className="p-2">
                  {filteredStaff.length} de {staff.length} empleados
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  <th>Contacto</th>
                  <th>Finca Asignada</th>
                  <th>Estado</th>
                  <th>Fecha Contratación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-md bg-light rounded-circle d-flex align-items-center justify-content-center me-3">
                            {getRoleIcon(member.position)}
                          </div>
                          <div>
                            <h6 className="mb-0">{member.name}</h6>
                            <small className="text-muted">ID: {member.id}</small>
                            {member.salary && (
                              <div className="text-success small">
                                Salario: ${member.salary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="mb-1">
                          {member.position}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <div className="d-flex align-items-center mb-1">
                            <FaEnvelope className="text-muted me-2" size={12} />
                            <small>{member.email}</small>
                          </div>
                          {member.phone && (
                            <div className="d-flex align-items-center">
                              <FaPhone className="text-muted me-2" size={12} />
                              <small>{member.phone}</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {member.field_name ? (
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="text-muted me-2" size={12} />
                            <span>{member.field_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </td>
                      <td>
                        {member.hire_date ? (
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="text-muted me-2" size={12} />
                            <small>{new Date(member.hire_date).toLocaleDateString()}</small>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(member)}
                            title="Editar"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaUserCog size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No se encontró personal</h5>
                      <p className="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar personal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingStaff ? 'Editar Personal' : 'Nuevo Personal'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="ejemplo@dominio.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+54 9 11 1234-5678"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Cargo *</Form.Label>
                  <Form.Select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar cargo</option>
                    {positions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fecha de Contratación</Form.Label>
                  <DatePicker
                    selected={formData.hire_date}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    placeholderText="Seleccionar fecha"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={30}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Salario</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
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

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Finca Asignada</Form.Label>
                  <Form.Select
                    name="field_id"
                    value={formData.field_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar finca...</option>
                    {Array.isArray(fields) && fields.length > 0 ? (
                      fields.map(field => (
                        <option key={field.id} value={field.id}>
                          {field.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay fincas disponibles</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Información adicional sobre el empleado..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingStaff ? 'Actualizar' : 'Agregar'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
