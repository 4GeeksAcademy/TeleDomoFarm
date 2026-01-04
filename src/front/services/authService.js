// src/front/services/authService.js
import { API } from "../js/BackendURL";

// Función auxiliar para construir URLs correctamente
const buildUrl = (endpoint) => {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || API;
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${cleanBaseUrl}/${cleanEndpoint}`.replace(/([^:]\/)\/+/g, "$1");
};

// Almacenar token en localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// Obtener token del localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Iniciar sesión
export const login = async (email, password) => {
  try {
    console.log("URL de login:", buildUrl("api/login"));
    const response = await fetch(buildUrl("api/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: email, // Usar 'correo' en lugar de 'email'
        contraseña: password, // Usar 'contraseña' en lugar de 'password'
      }),
      credentials: "include",
      mode: "cors",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al iniciar sesión");
    }

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    if (error.message === "Failed to fetch") {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución en el puerto 3001."
      );
    }
    throw error;
  }
};

// Registrar nuevo usuario
export const register = async (userData) => {
  try {
    console.log("URL de registro:", buildUrl("api/register"));
    const response = await fetch(buildUrl("api/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: userData.nombre,
        correo: userData.correo,
        contraseña: userData.contraseña,
      }),
      credentials: "include",
      mode: "cors",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al registrar el usuario");
    }

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error("Error en registro:", error);
    if (error.message === "Failed to fetch") {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
      );
    }
    throw error;
  }
};

// Cerrar sesión
export const logout = () => {
  setAuthToken(null);
  // Opcional: Hacer una llamada al backend para invalidar el token
};

// Obtener perfil del usuario
export const getProfile = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(buildUrl("api/profile"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Error al obtener el perfil");
    }

    return data;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    throw error;
  }
};

// Configuración de axios para peticiones autenticadas
export const setupAxiosInterceptors = (navigate) => {
  // Agregar token a las peticiones
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Manejar respuestas no autorizadas
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido
        logout();
        if (navigate) {
          navigate("/login");
        }
      }
      return Promise.reject(error);
    }
  );
};
