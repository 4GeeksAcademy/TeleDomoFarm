// src/front/routes.jsx
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import { Layout } from "./pages/Layout";
import Login from "./components/auth/Login";
import CrearUsuario from "./components/usuarios/CrearUsuario";
import NotFound from "./pages/NotFound";
import Dashboard from "./components/Dashboard/Dashboard";
import PrivateRoute from "./components/auth/PrivateRoute";
import AppLayout from "./components/Navbar/AppLayout";
import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<NotFound />}>
      {/* Redirige la ruta raíz a /app/dashboard */}
      <Route index element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Rutas públicas */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<CrearUsuario />} />
      
      {/* Rutas protegidas con AppLayout */}
      <Route 
        path="app" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        {/* Redirige /app a /app/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* Agrega aquí más rutas protegidas */}
      </Route>
      
      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default router;