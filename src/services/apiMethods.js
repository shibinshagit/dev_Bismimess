import { apiCall } from "./apiCalls";

// admin side api calls================================================================

export const login = async (email, password) => {
  return await apiCall('post', '/login', { email, password });
};

export const fetchUserData = async () => {
  return await apiCall('get', '/user');
};


