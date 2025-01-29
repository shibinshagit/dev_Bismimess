import { apiCall } from "./apiMethods";

// admin side api calls---------------------------------------------------------------------------------------

export const login = async (email, password) => {
  return await apiCall('post', '/login', { email, password });
};

export const fetchUserData = async () => {
  return await apiCall('get', '/user');
};

export const pointsWithStatistics = async () => {
  return await apiCall('get', '/pointsWithStatistics');
};

export const LeavesToday = async () => {
  return await apiCall('get', '/pointsWithLeaveToday');
};

export const ExpiresToday = async () => {
  return await apiCall('get', '/pointsWithExpiredUsers');
};

export const PendingPayment = async () => {
  return await apiCall('get', '/paymentStatus/pending');
};

// Notify------------------------------------------------------------------------------------------------
export const Notes = async () => {
  return await apiCall('get', '/notes');
};

export const markAsRead = (id, updatedNote) => {
  return apiCall("put", `/notes/${id}`, updatedNote);
};

export const deleteNote = (id) => {
  return apiCall("delete", `/notes/${id}`);
};
// points------------------------------------------------------------------------------------------------
export const Points = async () => {
  return await apiCall('get', '/points');
};

export const AddPoints = (newPoint) => {
  return apiCall("post", `/points`, newPoint);
};
// Delivery Boy------------------------------------------------------------------------------------------------
export const deliveryBoys = async () => {
  return await apiCall('get', '/deliveryBoys');
};

export const AddDeliveryBoy = (deliveryBoy) => {
  return apiCall("post", `/deliveryBoy`, deliveryBoy);
};

// User------------------------------------------------------------------------------------------------
export const CreatUser = async (data, headers) => {
  return await apiCall('post', '/postOrder', data, headers);
};

export const getUser = async (id) => {
  return await apiCall('get', `/user/${id}`);
};

export const updateUser = async (id, data, headers) => {
  return await apiCall('put', `/updateUser/${id}`, data, headers);
};

// Groups------------------------------------------------------------------------------------------------
export const addLeave = async (id,data) => {
  return await apiCall('post', `/addLeave/${id}`, data);
};

export const editLeave = async (orderId, id, data) => {
  return await apiCall('put', `/editLeave/${orderId}/${id}`, data);
};
// Groups------------------------------------------------------------------------------------------------
export const getGroups = async () => {
  return await apiCall('get', '/groups');
};





