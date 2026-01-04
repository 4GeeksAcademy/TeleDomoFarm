// src/front/components/Dashboard/components/Staff.jsx
import React, { useState } from 'react';
import { Card, Table, Badge, Button, Form, InputGroup, Row, Col, Modal } from 'react-bootstrap';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUserTie, FaUserCog, FaUserShield } from 'react-icons/fa';

const Staff = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Datos de ejemplo del personal
  const staffMembers = [
    { id: 1, name: 'Juan Pérez', role: 'Administrador', email: 'juan@example.com', phone: '+54 9 11 1234-5678', status: 'Activo' },
    { id: 2, name: 'María González', role: 'Gerente de Campo', email: 'maria@example.com', phone: '+54 9 11 2345-6789', status: 'Activo' },
    { id: 3, name: 'Carlos López', role: 'Técnico Agrícola', email: 'carlos@example.com', phone: '+54 9 11 3456-7890', status: 'Vacaciones' },
    { id: 4, name: 'Ana Martínez', role: 'Veterinario', email: 'ana@example.com', phone: '+54 9 11 4567-8901', status: 'Activo' },
    { id: 5, name: 'Luis Rodríguez', role: 'Operario', email: 'luis@example.com', phone: '+54 9 11 5678-9012', status: 'Inactivo' },
  ];

  const roles = ['Todos', 'Administrador', 'Gerente de Campo', 'Técnico Agrícola', 'Veterinario', 'Operario'];

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Administrador': return <FaUserShield className="me-2" />;
      case 'Gerente de Campo': return <FaUserTie className="me-2" />;
      default: return <FaUserCog className="me-2" />;
    }
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case 'Activo': return 'success';
      case 'Vacaciones': return 'warning';
      case 'Inactivo': return 'secondary';
      case 'Baja': return 'danger';
      default: return 'light';
    }
  };

  const filteredStaff = staffMembers
    .filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(member => 
      selectedRole === 'all' || member.role === selectedRole
    );

  return (
    <div className="staff-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Gestión de Personal</h4>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FaUserPlus className="me-2" /> Agregar Personal
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, cargo o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Todos los cargos</option>
                {roles.map(role => (
                  <option key={role} value={role === 'Todos' ? 'all' : role}>
                    {role}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map(member => (
                    <tr key={member.id}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-2">
                            {getRoleIcon(member.role)}
                          </div>
                          <div>
                            <h6 className="mb-0">{member.name}</h6>
                            <small className="text-muted">ID: {member.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {member.role}
                      </td>
                      <td className="align-middle">
                        <div>{member.email}</div>
                        <small className="text-muted">{member.phone}</small>
                      </td>
                      <td className="align-middle">
                        <Badge bg={getStatusVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </td>
                      <td className="text-end align-middle">
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <FaUserCog size={48} className="text-muted mb-3" />
                      <p>No se encontró personal que coincida con la búsqueda</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal para agregar/editar personal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Nuevo Miembro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control type="text" placeholder="Ej: Juan Pérez" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cargo</Form.Label>
              <Form.Select>
                {roles.filter(role => role !== 'Todos').map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="ejemplo@dominio.com" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="tel" placeholder="+54 9 11 1234-5678" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(false)}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Staff;