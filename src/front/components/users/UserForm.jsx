import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../../services/userService';

const UserForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        contraseña: '',
        confirmPassword: '',
        rol: 'user',
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            setLoading(true);
            const user = await getUser(id);
            setFormData({
                ...user,
                contraseña: '',
                confirmPassword: ''
            });
        } catch (err) {
            setError('Error al cargar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.nombre || !formData.correo) {
            setError('Nombre y correo son campos obligatorios');
            return false;
        }

        if (!isEdit && !formData.contraseña) {
            setError('La contraseña es obligatoria');
            return false;
        }

        if (formData.contraseña !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            const userData = { ...formData };
            delete userData.confirmPassword;

            if (isEdit) {
                await updateUser(id, userData);
            } else {
                await createUser(userData);
            }

            navigate('/users');
        } catch (err) {
            setError(err.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <div className="container mt-4">
            <h2>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
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

                <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="rol" className="form-label">Rol</label>
                    <select
                        className="form-select"
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                    >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="is_active">
                            Usuario activo
                        </label>
                    </div>
                </div>

                {!isEdit && (
                    <>
                        <div className="mb-3">
                            <label htmlFor="contraseña" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="contraseña"
                                name="contraseña"
                                value={formData.contraseña}
                                onChange={handleChange}
                                required={!isEdit}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={!isEdit}
                            />
                        </div>
                    </>
                )}

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/users')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
