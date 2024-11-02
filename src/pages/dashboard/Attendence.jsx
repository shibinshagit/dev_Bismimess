// src/pages/Attendance.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";
import { useNavigate } from "react-router-dom";

export function Attendance() {
  const [users, setUsers] = useState([]);
  const [pointId] = useState("66c26676b43a45070b24e735");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [selectedDate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/points/${pointId}/users`
      );
      setUsers(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (userId, meal) => {
    const confirmAction = window.confirm(
      `Are you sure you want to mark this meal as delivered?`
    );
    if (!confirmAction) return;

    try {
      const payload = {
        date: selectedDate,
        meal: meal,
      };

      await axios.put(`${BaseUrl}/api/users/${userId}/attendance`, payload);
      alert("Attendance marked as delivered successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-3xl font-semibold text-center mb-6">Attendance</h2>

      <div className="flex justify-end mb-6">
        <label htmlFor="date" className="mr-2 font-medium">
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
           <tr className="bg-gray-100">
  <th className="py-2 px-4 border-b text-left">Name</th>
  {/* <th className="py-2 px-4 border-b text-left">Phone</th> */}
  <th className="py-2 px-4 border-b text-left">Breakfast</th>
  <th className="py-2 px-4 border-b text-left">Lunch</th>
  <th className="py-2 px-4 border-b text-left">Dinner</th>
</tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const latestOrder = user.orders.sort(
                (a, b) => new Date(b.orderStart) - new Date(a.orderStart)
              )[0];

              if (!latestOrder) {
                return (
                  <tr key={user._id}>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.phone}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td colSpan={3} className="text-center py-2 px-4 border-b">
                      No Orders Found
                    </td>
                  </tr>
                );
              }

              const orderStart = stripTime(new Date(latestOrder.orderStart));
              const orderEnd = stripTime(new Date(latestOrder.orderEnd));
              const targetDate = stripTime(new Date(selectedDate));

              if (targetDate < orderStart || targetDate > orderEnd) {
                return (
                  <tr key={user._id} className="bg-gray-400">
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    {/* <td className="py-2 px-4 border-b">{user.phone}</td> */}
                    {/* <td className="py-2 px-4 border-b">{user.email}</td> */}
                    <td colSpan={3} className="text-center py-2 px-4 border-b">
                      expired
                    </td>
                  </tr>
                );
              }

              const isLeaveDay = latestOrder.leave.some((leave) => {
                const leaveStart = stripTime(new Date(leave.start));
                const leaveEnd = stripTime(new Date(leave.end));
                return targetDate >= leaveStart && targetDate <= leaveEnd;
              });

              const attendanceRecord = latestOrder.attendances.find(
                (att) => stripTime(att.date).getTime() === targetDate.getTime()
              );

              const statusLabels = {
                packed: "Packed",
                leave: "Leave",
                delivered: "Delivered",
              };

              const getStatusColor = (status) => {
                return status === "delivered"
                  ? "text-green-600"
                  : status === "leave"
                  ? "text-red-500"
                  : "text-gray-500";
              };

              return (
                <tr key={user._id}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  {/* <td className="py-2 px-4 border-b">{user.phone}</td> */}
                  {/* <td className="py-2 px-4 border-b">{user.email}</td> */}
                  {["B", "L", "D"].map((meal) => {
                    const mealStatus =
                      attendanceRecord && attendanceRecord[meal]
                        ? attendanceRecord[meal]
                        : isLeaveDay
                        ? "leave"
                        : "packed";
                    return (
                      <td key={meal} className="py-2 px-4 border-b">
                      {console.log('data:', latestOrder.attendances)}
                      {mealStatus === "packed" ? (
                        <button
                          onClick={() => handleMarkDelivered(user._id, meal)}
                          className="text-sm text-blue-600 underline hover:text-blue-800 font-medium"
                        >
                          {statusLabels[mealStatus]}
                        </button>
                      ) : (
                        <span className={`${getStatusColor(mealStatus)} font-medium`}>
                          {statusLabels[mealStatus]}
                        </span>
                      )}
                    </td>
                    
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const stripTime = (date) => {
    const validDate = date instanceof Date ? date : new Date(date);
    return new Date(validDate.getFullYear(), validDate.getMonth(), validDate.getDate());
  };
  

  