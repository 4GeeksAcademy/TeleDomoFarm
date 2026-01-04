import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, deleteUser } from '../../services/userService';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUser();
    }, [id]);

    const loadUser = async () => {
        try {
            const data = await getUser(id);
            setUser(data);
        } catch (err) {
            setError('Error al cargar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await deleteUser(id);
                navigate('/users');
            } catch (err) {
                setError('Error al eliminar el usuario');
            }
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!user) return <div className="alert alert-warning">Usuario no encontrado</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Detalles del Usuario</h2>
                <div>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate(`/users/${id}/edit`)}
                    >
                        Editar
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                    >
                        Eliminar
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{user.nombre}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{user.correo}</h6>

                    <div className="mt-3">
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Rol:</strong> {user.rol === 'admin' ? 'Administrador' : 'Usuario'}</p>
                        <p>
                            <strong>Estado:</strong>{' '}
                            <span className={`badge ${user.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </p>
                    </div>

                    <button
                        className="btn btn-secondary mt-3"
                        onClick={() => navigate('/users')}
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
