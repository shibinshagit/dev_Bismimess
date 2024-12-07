// src/pages/NewOrders.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { BaseUrl } from "@/constants/BaseUrl";
import { useNavigate } from "react-router-dom";

const NewOrders = () => {
  const [newOrders, setNewOrders] = useState([]);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // Adjust as needed

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

  return (
    <div className="bg-gray-50 min-h-screen p-2 mb-20">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">New Orders</h2>
        <p className="text-gray-600">
          Last 3 Days | {newUsersCount} {newUsersCount === 1 ? "User" : "Users"}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        // Skeleton Loader
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-6 text-left text-sm font-medium text-gray-700"
                    >
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ordersPerPage }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b">
                    {Array.from({ length: 12 }).map((_, cellIdx) => (
                      <td key={cellIdx} className="py-4 px-6">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      ) : newOrders.length === 0 ? (
        // No Orders Message
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-lg font-semibold text-gray-700">
            No new orders in the last 3 days.
          </p>
        </div>
      ) : (
        // Orders Table
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    User Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Point Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Phone
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Plan
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Order Start
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Order End
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Payment Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Payment Method
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Payment ID
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Veg
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`border-b hover:bg-gray-50 ${
                      order.paymentStatus === "pending" ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.userName}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.pointName || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.userPhone}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.plan.map((meal, index) => (
                        <span
                          key={index}
                          className={`inline-block px-2 py-1 mr-1 text-xs font-semibold rounded-full ${
                            meal === "B"
                              ? "bg-blue-100 text-blue-800"
                              : meal === "L"
                              ? "bg-green-100 text-green-800"
                              : meal === "D"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {meal}
                        </span>
                      ))}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {new Date(order.orderStart).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {new Date(order.orderEnd).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm flex items-center text-gray-700">
                      {order.status === "expired" ? (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                      )}
                      <span className="capitalize">{order.status || "N/A"}</span>
                    </td>
                    <td className="py-4 px-6 text-sm capitalize text-gray-700">
                      {order.paymentStatus || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 flex items-center">
                      {order.paymentMethod || "N/A"}
                      {order.paymentMethod === "Online" && (
                        <InformationCircleIcon className="w-4 h-4 text-blue-500 ml-1" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.paymentId || "N/A"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {order.isVeg ? "Yes" : "No"}
                    </td>
                    <td className="py-4 px-6 text-sm text-blue-600 hover:underline cursor-pointer">
                      <button
                        onClick={() =>
                          navigate("/dashboard/edit", { state: { user: order } })
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <nav>
              <ul className="flex space-x-2">
                {Array.from(
                  { length: Math.ceil(newOrders.length / ordersPerPage) },
                  (_, i) => (
                    <li key={i}>
                      <button
                        onClick={() => paginate(i + 1)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          currentPage === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default NewOrders;
