import { api } from "./api";
import { store } from "@/redux/store";
import { logout } from "@/redux/reducers/authSlice";

export const apiCall = async (method, url, data = null) => {
  try {
    let response;

    switch (method) {
      case "post":
        response = await api.post(url, data);
        break;
      case "get":
        response = await api.get(url);
        break;
      case "patch":
        response = await api.patch(url, data);
        break;
      case "delete":
        response = await api.delete(url);
        break;
      case "put":
        response = await api.put(url, data);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        alert("User is blocked");
        store.dispatch(logout());
      }
      throw error.response.data || new Error('An error occurred');
    }
    throw error.message || 'An error occurred';
  }
};
