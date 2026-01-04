import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService.js";
import { login } from '../../services/authService';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        correo: "",
        contraseña: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const result = await login(form.correo, form.contraseña);
            if (result) {
                // Guardar el token en localStorage o en el estado global (dependiendo de tu gestión de estado)
                localStorage.setItem("token", result.access_token);
                // Redirigir al dashboard o a la página principal
                navigate("/app/dashboard");

            }
        } catch (err) {
            setError(err.message || "Error al iniciar sesión");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">Iniciar sesión</h2>
                            
                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Correo electrónico</label>
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
                                    <label className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        name="contraseña"
                                        className="form-control"
                                        value={form.contraseña}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Iniciar sesión
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                ¿No tienes una cuenta?{" "}
                                <a href="/register" className="text-primary">
                                    Regístrate
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}