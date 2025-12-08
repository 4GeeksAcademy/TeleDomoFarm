import React, { useState } from "react";
import { API } from "../js/BackendURL";
import { useNavigate } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        correo: "",
        contraseña: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const iniciarSesion = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error al iniciar sesión");
                return;
            }

            alert("Bienvenido " + data.usuario.nombre);

            // Guardar en localStorage si necesitas sesión
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            navigate("/dashboard");

        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="fw-bold text-primary mb-4">Iniciar sesión</h2>

            <form onSubmit={iniciarSesion} className="card p-4 shadow">

                <label className="fw-bold">Correo</label>
                <input
                    type="email"
                    name="correo"
                    className="form-control mb-3"
                    value={form.correo}
                    onChange={handleChange}
                    required
                />

                <label className="fw-bold">Contraseña</label>
                <input
                    type="password"
                    name="contraseña"
                    className="form-control mb-3"
                    value={form.contraseña}
                    onChange={handleChange}
                    required
                />

                <button className="btn btn-primary w-100">Ingresar</button>

                <button
                    type="button"
                    className="btn btn-secondary w-100 mt-2"
                    onClick={() => navigate("/")}
                >
                    Cancelar
                </button>

            </form>
        </div>
    );
}
