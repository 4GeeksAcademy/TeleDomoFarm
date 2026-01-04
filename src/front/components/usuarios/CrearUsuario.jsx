import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService.js";

export default function CrearUsuario() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        contraseña: "",
        rol: "usuario"
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const result = await register(form);
            if (result) {
                alert("Usuario registrado exitosamente");
                navigate("/login"); // Redirigir al login o al dashboard
            }
        } catch (err) {
            setError(err.message || "Error al registrar el usuario");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold text-primary mb-4">Credasdadar nuevo usuario</h2>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} className="card p-4 shadow">
                <div className="mb-3">
                    <label className="form-label fw-bold">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        className="form-control"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Correo electrónico</label>
                    <input
                        type="email"
                        name="correo"
                        className="form-control"
                        value={form.correo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Contraseña</label>
                    <input
                        type="password"
                        name="contraseña"
                        className="form-control"
                        value={form.contraseña}
                        onChange={handleChange}
                        required
                        minLength="6"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Rol</label>
                    <select
                        name="rol"
                        className="form-select"
                        value={form.rol}
                        onChange={handleChange}
                    >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Registrarse
                </button>

                <div className="text-center mt-3">
                    ¿Ya tienes una cuenta?{" "}
                    <a href="/login" className="text-primary">
                        Inicia sesión
                    </a>
                </div>
            </form>
        </div>
    );
}