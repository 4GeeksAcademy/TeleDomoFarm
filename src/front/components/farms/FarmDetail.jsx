// src/front/components/farms/FarmDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFarmById, deleteFarm } from '../../services/farmService';
import { toast } from 'react-toastify';

const FarmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFarm = async () => {
      try {
        const data = await getFarmById(id);
        setFarm(data);
      } catch (err) {
        setError('Error al cargar la granja');
        toast.error('No se pudo cargar la granja');
      } finally {
        setLoading(false);
      }
    };
    loadFarm();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta granja?')) {
      try {
        await deleteFarm(id);
        toast.success('Granja eliminada correctamente');
        navigate('/farms');
      } catch (err) {
        toast.error(err.message || 'Error al eliminar la granja');
      }
    }
  };

  if (loading) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!farm) {
    return <div className="alert alert-warning">Granja no encontrada</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Detalles de la Granja</h2>
          <div>
            <Link to={`/farms/${id}/edit`} className="btn btn-warning me-2">
              <i className="fas fa-edit me-2"></i>Editar
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <i className="fas fa-trash me-2"></i>Eliminar
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <h5>Información Básica</h5>
              <p><strong>Nombre:</strong> {farm.nombre}</p>
              <p><strong>Dirección:</strong> {farm.direccion}</p>
              <p><strong>Estado:</strong> 
                <span className={`badge ${farm.activa ? 'bg-success' : 'bg-secondary'}`}>
                  {farm.activa ? 'Activa' : 'Inactiva'}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <h5>Ubicación</h5>
              {farm.latitud && farm.longitud ? (
                <div>
                  <p><strong>Latitud:</strong> {farm.latitud}</p>
                  <p><strong>Longitud:</strong> {farm.longitud}</p>
                  <a 
                    href={`https://www.google.com/maps?q=${farm.latitud},${farm.longitud}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-map-marker-alt me-2"></i>Ver en Mapa
                  </a>
                </div>
              ) : (
                <p>No se ha especificado la ubicación</p>
              )}
            </div>
          </div>
          
          {farm.descripcion && (
            <div className="mb-3">
              <h5>Descripción</h5>
              <p className="text-muted">{farm.descripcion}</p>
            </div>
          )}

          <div className="mt-4">
            <h5>Propietario</h5>
            {farm.owner ? (
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{farm.owner.nombre}</h6>
                  <p className="card-text text-muted mb-1">{farm.owner.correo}</p>
                  <Link to={`/users/${farm.owner.id}`} className="btn btn-sm btn-outline-primary">
                    Ver perfil
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-muted">No se ha especificado el propietario</p>
            )}
          </div>
        </div>
        <div className="card-footer">
          <Link to="/farms" className="btn btn-secondary">
            <i className="fas fa-arrow-left me-2"></i>Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FarmDetail;