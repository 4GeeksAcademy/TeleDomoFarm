// src/front/components/farms/FarmList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFarms, deleteFarm } from '../../services/farmService';
import { toast } from 'react-toastify';

const FarmList = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFarms = async () => {
    try {
      const data = await getFarms();
      setFarms(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Error al cargar las granjas');
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta granja?')) {
      try {
        await deleteFarm(id);
        toast.success('Granja eliminada correctamente');
        loadFarms();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (loading) return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Granjas</h2>
        <Link to="/farms/new" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Nueva Granja
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {farms.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">No hay granjas registradas</td>
              </tr>
            ) : (
              farms.map((farm) => (
                <tr key={farm.id}>
                  <td>{farm.nombre}</td>
                  <td>{farm.direccion}</td>
                  <td>
                    <span className={`badge ${farm.activa ? 'bg-success' : 'bg-secondary'}`}>
                      {farm.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link to={`/farms/${farm.id}`} className="btn btn-sm btn-info text-white me-2">
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link to={`/farms/${farm.id}/edit`} className="btn btn-sm btn-warning me-2">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button 
                        onClick={() => handleDelete(farm.id)} 
                        className="btn btn-sm btn-danger"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FarmList;