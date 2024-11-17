// src/pages/NewOrders.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { BaseUrl } from "@/constants/BaseUrl";
import { useNavigate } from "react-router-dom";

const NewOrders = () => {
  const [newOrders, setNewOrders] = useState([]);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10); // Adjust as needed

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BaseUrl}/api/orders/new`);
        setNewOrders(response.data.newOrders);
        setNewUsersCount(response.data.newUsersCount);
      } catch (err) {
        console.error("Error fetching new orders:", err);
        setError("Failed to fetch new orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewOrders();
  }, []);

  // Calculate the current orders to display
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = newOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen mb-16">
      {/* Header */}
      <h2 className="text-xl text-white font-semibold text-center p-2">New Orders - Last 3 Days</h2>
      <h3 className="text-md text-white font-semibold text-center p-2">{newUsersCount} users</h3>

      

      {/* Orders Table */}
      {newOrders.length === 0 ? (
        <p className="text-center text-lg font-semibold">No new orders in the last 3 days.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg mb-6 text-white">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                <th className="py-3 px-6 text-left">User Name</th>
                  <th className="py-3 px-6 text-left">Point Name</th>
                  <th className="py-3 px-6 text-left">Phone</th>
                  <th className="py-3 px-6 text-left">Plan</th>
                  <th className="py-3 px-6 text-left">Order Start</th>
                  <th className="py-3 px-6 text-left">Order End</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Payment Status</th>
                  <th className="py-3 px-6 text-left">Payment Method</th>
                  <th className="py-3 px-6 text-left">Payment ID</th>
                  <th className="py-3 px-6 text-left">Veg</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {currentOrders.map((order) => (
                  <tr key={order._id} className={`border-b bg-gray-50 even:bg-gray-100 ${order.paymentStatus === 'pending' ? 'bg-red-500 text-white' : ''}`}>
                    <td className="py-4 px-6">{order.userName}</td>
                    <td className="py-4 px-6">{order.pointName || 'N/A'}</td>
                    <td className="py-4 px-6">{order.userPhone}</td>
                    <td className="py-4 px-6">
                    {console.log('order:',order)}  {order.plan.map((meal, index) => (
                        <span
                          key={index}
                          className={` px-2 py-1 rounded-full text-xs font-semibold ${
                            meal === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : meal === 'L'
                              ? 'bg-green-100 text-green-800'
                              : meal === 'D'
                              ? 'bg-orange-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                          } mr-1`}
                        >
                          {meal}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 px-6">{new Date(order.orderStart).toLocaleDateString()}</td>
                    <td className="py-4 px-6">{new Date(order.orderEnd).toLocaleDateString()}</td>
                    <td className="py-4 px-6 flex items-center">
                      {order.status === 'expired' ? (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      <span className="py-8 capitalize">{order.status || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6 capitalize">{order.paymentStatus || 'N/A'}</td>
                    <td className="py-4 px-6">
                      {order.paymentMethod || 'N/A'}
                      {order.paymentMethod === 'Online' && (
                        <InformationCircleIcon className="w-4 h-4 text-blue-500 inline-block ml-1" />
                      )}
                    </td>
                    <td className="py-4 px-6">{order.paymentId || 'N/A'}</td>
                    <td className="py-4 px-6">{order.isVeg ? 'Yes' : 'No'}</td>
                    <td className="py-4 px-6">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => navigate('/dashboard/edit', { state: { user: order } })}
                      >{console.log(order)}
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center">
            <nav>
              <ul className="inline-flex -space-x-px">
                {Array.from({ length: Math.ceil(newOrders.length / ordersPerPage) }, (_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 ml-0 leading-tight border ${
                        currentPage === i + 1
                          ? 'text-blue-600 bg-blue-50 border-blue-300'
                          : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default NewOrders;
