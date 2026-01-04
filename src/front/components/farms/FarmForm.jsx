// src/front/components/farms/FarmForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFarm, updateFarm, getFarmById } from '../../services/farmService';
import { toast } from 'react-toastify';

const FarmForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    activa: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadFarm = async () => {
        try {
          setLoading(true);
          const farm = await getFarmById(id);
          setFormData({
            nombre: farm.nombre,
            direccion: farm.direccion,
            descripcion: farm.descripcion || '',
            latitud: farm.latitud || '',
            longitud: farm.longitud || '',
            activa: farm.activa
          });
        } catch (err) {
          setError('Error al cargar la granja');
          toast.error('No se pudo cargar la granja');
        } finally {
          setLoading(false);
        }
      };
      loadFarm();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditMode) {
        await updateFarm(id, formData);
        toast.success('Granja actualizada correctamente');
      } else {
        await createFarm(formData);
        toast.success('Granja creada correctamente');
      }
      navigate('/farms');
    } catch (err) {
      setError(err.message || 'Error al guardar la granja');
      toast.error('Error al guardar la granja');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center my-5"><div className="spinner-border" role="status"></div></div>;
  }

  return (
    <div className="container mt-4">
      <h2>{isEditMode ? 'Editar Granja' : 'Nueva Granja'}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label">Nombre *</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="direccion" className="form-label">Dirección *</label>
            <input
              type="text"
              className="form-control"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            className="form-control"
            id="descripcion"
            name="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="latitud" className="form-label">Latitud</label>
            <input
              type="number"
              step="any"
              className="form-control"
              id="latitud"
              name="latitud"
              value={formData.latitud}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="longitud" className="form-label">Longitud</label>
            <input
              type="number"
              step="any"
              className="form-control"
              id="longitud"
              name="longitud"
              value={formData.longitud}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="activa"
            name="activa"
            checked={formData.activa}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="activa">
            Granja activa
          </label>
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/farms')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmForm;