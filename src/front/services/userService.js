// Configuración de la API
const API_BASE_URL = "/api";

// Función para manejar las respuestas de la API
const handleResponse = async (response) => {
  if (!response) {
    throw new Error("No se recibió respuesta del servidor");
  }

  let data;
  try {
    data = await response.json().catch(() => ({}));
  } catch (error) {
    console.error("Error al parsear la respuesta JSON:", error);
    throw new Error("Error al procesar la respuesta del servidor");
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Error en la petición: ${response.statusText}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Función para obtener los headers comunes
const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Función para construir la URL de la API
const buildApiUrl = (endpoint) => {
  // Eliminar barras iniciales dobles
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  // Unir la URL base con el endpoint
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getUsers = async () => {
  try {
    console.log("Obteniendo usuarios...");
    const response = await fetch(buildApiUrl("users"), {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error en getUsers:", error);
    throw new Error(
      "No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo más tarde."
    );
  }
};

export const getUser = async (id) => {
  try {
    console.log(`Obteniendo usuario con ID: ${id}`);
    const response = await fetch(buildApiUrl(`users/${id}`), {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error al obtener el usuario ${id}:`, error);
    throw new Error(`No se pudo cargar el usuario: ${error.message}`);
  }
};

export const createUser = async (userData) => {
  try {
    console.log("Creando nuevo usuario:", userData);
    const response = await fetch(buildApiUrl("users"), {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response) {
      throw new Error("No se recibió respuesta del servidor");
    }

    return await handleResponse(response);
  } catch (error) {
    console.error("Error en createUser:", {
      message: error.message,
      stack: error.stack,
      userData: userData ? "Datos proporcionados" : "Sin datos",
    });

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión a Internet o contacta al administrador."
      );
    }

    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log(`Actualizando usuario con ID: ${id}`, userData);
    const response = await fetch(buildApiUrl(`users/${id}`), {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response) {
      throw new Error("No se recibió respuesta del servidor");
    }

    return await handleResponse(response);
  } catch (error) {
    console.error(`Error al actualizar el usuario ${id}:`, error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión a Internet o contacta al administrador."
      );
    }

    throw new Error(`Error al actualizar el usuario: ${error.message}`);
  }
};

export const deleteUser = async (id) => {
  try {
    console.log(`Eliminando usuario con ID: ${id}`);
    const response = await fetch(buildApiUrl(`users/${id}`), {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response) {
      throw new Error("No se recibió respuesta del servidor");
    }

    await handleResponse(response);
    return true;
  } catch (error) {
    console.error(`Error al eliminar el usuario ${id}:`, error);

    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión a Internet o contacta al administrador."
      );
    }

    throw new Error(`Error al eliminar el usuario: ${error.message}`);
  }
};
