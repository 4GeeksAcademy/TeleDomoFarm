import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    supplier: '',
    field_id: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    min_quantity: 0,
    unit: '',
    category: 'general',
    supplier: '',
    notes: '',
    field_id: ''
  });

  // Opciones predefinidas para unidades
  const unitOptions = [
    'kg', 'litros', 'unidades', 'sacos', 'cajas', 'botellas',
    'galones', 'toneladas', 'metros', 'paquetes', 'bolsas', 'tonel'
  ];

  // Cargar inventario y campos
  useEffect(() => {
    fetchInventory();
    fetchFields();
  }, []);

  // Cargar campos cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      fetchFields();
    }
  }, [showModal]);

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Obteniendo campos...');
      console.log('Token:', token ? 'existe' : 'no existe');
      console.log('URL:', `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/fields`);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/fields`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Intentar obtener el texto primero para ver qué viene
      const responseText = await response.text();
      console.log('Response text (primeros 200 chars):', responseText.substring(0, 200));

      if (!response.ok) {
        console.error('Error en respuesta:', responseText);
        setFields([]);
        return;
      }

      // Parsear como JSON solo si parece ser JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parseando JSON:', e);
        console.log('Respuesta completa:', responseText);
        setFields([]);
        return;
      }

      console.log('Datos de campos:', data);
      console.log('Tipo de data:', typeof data);
      console.log('data.fields:', data.fields);
      console.log('Array.isArray(data.fields):', Array.isArray(data.fields));

      // Manejar diferentes formatos de respuesta
      const fieldsData = data.fields || data || [];
      console.log('fieldsData antes de setFields:', fieldsData);
      console.log('Array.isArray(fieldsData):', Array.isArray(fieldsData));

      setFields(Array.isArray(fieldsData) ? fieldsData : []);
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setFields([]);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar inventario');
      }

      const data = await response.json();
      setInventory(data.inventory || []);
    } catch (error) {
      toast.error('Error al cargar el inventario');
      console.error('Error:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      quantity: 0,
      min_quantity: 0,
      unit: '',
      category: 'general',
      supplier: '',
      notes: '',
      field_id: ''
    });
    setEditingItem(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'min_quantity' ? parseFloat(value) || 0 : value
    }));
  };

  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filtrar inventario - CORREGIDO para campo asignado
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !filters.searchTerm ||
      item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesSupplier = !filters.supplier ||
      (item.supplier && item.supplier.toLowerCase().includes(filters.supplier.toLowerCase()));

    // CORRECCIÓN: Manejar correctamente el filtro por campo asignado
    const matchesField = !filters.field_id ||
      (item.field_id && item.field_id.toString() === filters.field_id.toString());

    return matchesSearch && matchesSupplier && matchesField;
  });

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingItem
        ? `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/inventory/${editingItem.id}`
        : `${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/inventory`;

      const method = editingItem ? 'PUT' : 'POST';

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
        throw new Error(errorData.msg || 'Error al guardar');
      }

      const result = await response.json();

      toast.success(editingItem ? 'Artículo actualizado' : 'Artículo agregado');
      setShowModal(false);
      fetchInventory();
      resetForm();

    } catch (error) {
      toast.error('Error al guardar el artículo');
      console.error('Error:', error);

      if (error.message) {
        toast.error(error.message);
      }
    }
  };

  // Editar item
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      supplier: item.supplier || '',
      min_quantity: item.min_quantity,
      notes: item.notes || '',
      field_id: item.field_id || ''
    });
    setShowModal(true);
  };

  // Eliminar item
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      toast.success('Item eliminado');
      fetchInventory();
    } catch (error) {
      toast.error('Error al eliminar');
      console.error('Error:', error);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      supplier: '',
      field_id: ''
    });
  };

  // Función para calcular el porcentaje de stock
  const getStockPercentage = (quantity, minQuantity) => {
    if (minQuantity === 0) return 100;
    const percentage = (quantity / minQuantity) * 100;
    return Math.min(percentage, 100);
  };

  // Función para obtener el color de la barra de progreso
  const getStockColor = (quantity, minQuantity) => {
    const percentage = getStockPercentage(quantity, minQuantity);
    if (percentage <= 25) return 'danger';
    if (percentage <= 50) return 'warning';
    if (percentage <= 75) return 'info';
    return 'success';
  };

  // Función para obtener el mensaje de stock
  const getStockMessage = (quantity, minQuantity) => {
    if (quantity === 0) return '¡Agotado!';
    if (quantity <= minQuantity * 0.25) return '¡Stock crítico!';
    if (quantity <= minQuantity) return '¡Stock bajo!';
    if (quantity <= minQuantity * 1.5) return 'Stock moderado';
    return 'Stock suficiente';
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestión de Inventario</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Buscar:</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o categoría..."
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  name="searchTerm"
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Proveedor:</label>
              <select
                className="form-select"
                value={filters.supplier}
                onChange={handleFilterChange}
                name="supplier"
              >
                <option value="">Todos los proveedores</option>
                {[...new Set(inventory.map(item => item.supplier).filter(Boolean))].map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Campo Asignado:</label>
              <select
                className="form-select"
                value={filters.field_id}
                onChange={handleFilterChange}
                name="field_id"
              >
                <option value="">Todos los campos</option>
                <option value="null">Sin asignar</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>{field.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">{filteredInventory.length}</h5>
              <p className="card-text">Total Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">
                {filteredInventory.filter(item => item.quantity <= item.min_quantity).length}
              </h5>
              <p className="card-text">Stock Bajo</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">
                {filteredInventory.filter(item => item.field_id).length}
              </h5>
              <p className="card-text">Asignados</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-secondary">
                {filteredInventory.filter(item => !item.field_id).length}
              </h5>
              <p className="card-text">Sin Asignar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de inventario */}
      <div className="row">
        {filteredInventory.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron items con los filtros seleccionados
            </div>
          </div>
        ) : (
          filteredInventory.map(item => {
            const stockPercentage = getStockPercentage(item.quantity, item.min_quantity);
            const stockColor = getStockColor(item.quantity, item.min_quantity);
            const stockMessage = getStockMessage(item.quantity, item.min_quantity);

            return (
              <div key={item.id} className="col-lg-4 col-md-6 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">{item.name}</h6>
                    <div className="d-flex align-items-center">
                      <span className={`badge me-2 ${item.quantity <= item.min_quantity ? 'bg-danger' : 'bg-success'
                        }`}>
                        {item.quantity} {item.unit}
                      </span>
                      {item.field_name && (
                        <span className="badge bg-info text-white">
                          <i className="bi bi-geo-alt me-1"></i>
                          {item.field_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">Categoría:</small>
                        <div className="fw-bold">{item.category}</div>
                      </div>
                      <div className="col-6 text-end">
                        <small className="text-muted">Mínimo:</small>
                        <div className="fw-bold">{item.min_quantity} {item.unit}</div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO DE STOCK */}
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Nivel de Stock:</small>
                          <small className={`text-${stockColor} fw-bold`}>{stockMessage}</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar bg-${stockColor}`}
                            role="progressbar"
                            style={{ width: `${stockPercentage}%` }}
                            aria-valuenow={stockPercentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted">0</small>
                          <small className="text-muted">Mín: {item.min_quantity}</small>
                          <small className="text-muted">Actual: {item.quantity}</small>
                        </div>
                      </div>
                    </div>

                    {item.supplier && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted">Proveedor:</small>
                          <div className="fw-bold">{item.supplier}</div>
                        </div>
                      </div>
                    )}

                    {item.field_name && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted">Campo Asignado:</small>
                          <div className="fw-bold">
                            <i className="bi bi-geo-alt text-primary me-1"></i>
                            {item.field_name}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted">Notas:</small>
                          <div className="text-muted small">{item.notes}</div>
                        </div>
                      </div>
                    )}

                    {item.quantity <= item.min_quantity && (
                      <div className={`alert alert-${item.quantity === 0 ? 'danger' : 'warning'} mt-2 mb-0`}>
                        <i className={`bi bi-${item.quantity === 0 ? 'x-circle' : 'exclamation-triangle'} me-2`}></i>
                        <strong>
                          {item.quantity === 0 ? '¡Agotado!' : '¡Stock Bajo!'}
                        </strong>
                        {item.quantity === 0 ? ' Se necesita reabastecer urgentemente' : ' Se necesita reabastecer'}
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="btn-group w-100" role="group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi bi-${editingItem ? 'pencil' : 'plus-circle'} me-2`}></i>
                  {editingItem ? 'Editar Item' : 'Nuevo Item'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-tag me-1"></i>
                          Nombre del Item *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Ej: Fertilizante NPK"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-box me-1"></i>
                          Categoría
                        </label>
                        <select
                          className="form-select"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                        >
                          <option value="general">General</option>
                          <option value="fertilizante">Fertilizante</option>
                          <option value="semillas">Semillas</option>
                          <option value="pesticida">Pesticida</option>
                          <option value="herramientas">Herramientas</option>
                          <option value="combustible">Combustible</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-hash me-1"></i>
                          Cantidad Actual
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Cantidad Mínima
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="min_quantity"
                          value={formData.min_quantity}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-rulers me-1"></i>
                          Unidad
                        </label>
                        <select
                          className="form-select"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar unidad...</option>
                          {unitOptions.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                        <div className="form-text">
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Selecciona una unidad de medida
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-building me-1"></i>
                          Proveedor
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleInputChange}
                          placeholder="Ej: AgroSupplies S.A."
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-geo-alt me-1"></i>
                          Campo Asignado
                        </label>
                        <select
                          className="form-select"
                          name="field_id"
                          value={formData.field_id}
                          onChange={handleInputChange}
                        >
                          <option value="">Seleccionar campo...</option>
                          {(() => {
                            const fieldsToRender = Array.isArray(fields) ? fields : [];
                            if (fieldsToRender.length > 0) {
                              return fieldsToRender.map(field => (
                                <option key={field.id} value={field.id}>
                                  {field.name}
                                </option>
                              ));
                            } else {
                              return <option value="" disabled>No hay campos disponibles</option>;
                            }
                          })()}
                        </select>
                        <div className="form-text">
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            {Array.isArray(fields) && fields.length > 0
                              ? 'Selecciona el campo al que se asignará este item'
                              : 'No hay campos disponibles. Crea campos primero desde la sección de Campos.'
                                ? 'No hay campos disponibles. Crea campos primero desde la sección de Campos.'
                                : 'Selecciona el campo al que se asignará este item'
                            }
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">
                          <i className="bi bi-card-text me-1"></i>
                          Notas Adicionales
                        </label>
                        <textarea
                          className="form-control"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Instrucciones de uso, fechas de vencimiento, etc."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className={`bi bi-${editingItem ? 'check-circle' : 'plus-circle'} me-2`}></i>
                    {editingItem ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;