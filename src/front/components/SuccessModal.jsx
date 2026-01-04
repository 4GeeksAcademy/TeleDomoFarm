import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // Asegúrate de tener react-bootstrap instalado

const SuccessModal = ({ show, onHide, message }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>¡Registro Exitoso!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '4rem' }}></i>
          <p className="h4">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="success" onClick={onHide}>
          Aceptar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessModal;