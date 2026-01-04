import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="container text-center mt-5">
            <h1 className="display-1">404</h1>
            <h2 className="mb-4">Página no encontrada</h2>
            <p>Lo sentimos, la página que estás buscando no existe.</p>
            <Link to="/" className="btn btn-primary">
                Volver al inicio
            </Link>
        </div>
    );
}
