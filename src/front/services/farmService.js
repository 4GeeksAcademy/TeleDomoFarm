import { API_URL } from "../config";
import { getAuthToken } from "./authService";

const FARMS_API = `${API_URL}/farms`;

export const getFarms = async () => {
  const response = await fetch(FARMS_API, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las granjas");
  }

  return await response.json();
};

export const getFarmById = async (id) => {
  const response = await fetch(`${FARMS_API}/${id}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener la granja");
  }

  return await response.json();
};

export const createFarm = async (farmData) => {
  const response = await fetch(FARMS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(farmData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear la granja");
  }

  return await response.json();
};

export const updateFarm = async (id, farmData) => {
  const response = await fetch(`${FARMS_API}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(farmData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar la granja");
  }

  return await response.json();
};

export const deleteFarm = async (id) => {
  const response = await fetch(`${FARMS_API}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar la granja");
  }

  return await response.json();
};

export const getUserFarms = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}/farms`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las granjas del usuario");
  }

  return await response.json();
};
