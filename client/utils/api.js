import axios from 'axios';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const getNearbySpots = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/spots`, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching spots:", error.message);
    return [];
  }
};

export const addSpot = async (spotData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spots`, spotData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error adding spot:", error.response?.data || error.message);
    throw error;
  }
};

export const getSpotById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/spots/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching spot by ID:", error.message);
    return null;
  }
};

export const addRating = async (spotId, rating) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spots/${spotId}/ratings`, rating);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding rating:", error.response?.data || error.message);
    throw error;
  }
};

export const addComment = async (spotId, comment) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spots/${spotId}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding comment:", error.response?.data || error.message);
    throw error;
  }
};

export const getFeedSpots = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/spots/top`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching feed spots:", error.message);
    return [];
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const flagSpot = async (id, reason, user = 'anonymous') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/spots/${id}/flag`, { reason, user });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

