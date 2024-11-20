// src/pages/Attendance.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";
import { useNavigate } from "react-router-dom";

export function Attendance() {
  const [users, setUsers] = useState([]);
  const [pointId] = useState("66d165903e98c9eddf35c5aa"); // Adjust as needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingChanges, setPendingChanges] = useState([]);
  const [counts, setCounts] = useState({
    totalUsers: 0,
    expiredUsers: 0,
    totalMeals: 0,
    leaveMeals: 0,
    deliveredMeals: 0,
  });
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const COMMANDS = ["/expired", "/leave"];

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [selectedDate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/points/${pointId}/users`
      );
      setUsers(response.data);
      computeCounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
      setLoading(false);
    }
  };

  // Function to compute counts
  const computeCounts = (usersData) => {
    let totalUsers = usersData.length;
    let totalMeals = 0;
    let expiredUsers = 0;
    let leaveMeals = 0;
    let deliveredMeals = 0;

    usersData.forEach((user) => {
      const sortedOrders = user.orders.sort(
        (a, b) => new Date(b.orderStart) - new Date(a.orderStart)
      );

      const latestOrder = sortedOrders[0];

      if (!latestOrder) {
        // User has no orders
        return;
      }

      const orderEnd = stripTime(new Date(latestOrder.orderEnd));
      const orderStart = stripTime(new Date(latestOrder.orderStart));
      const targetDate = stripTime(new Date(selectedDate));

      if (targetDate < orderStart || targetDate > orderEnd) {
        expiredUsers += 1;
      } else {
        latestOrder.plan.forEach((meal) => {
          totalMeals += 1;

          // Check if user is on leave for this meal on targetDate
          const isLeaveForMeal = latestOrder.leave.some((leave) => {
            const leaveStart = stripTime(new Date(leave.start));
            const leaveEnd = stripTime(new Date(leave.end));
            return (
              targetDate >= leaveStart &&
              targetDate <= leaveEnd &&
              leave.meals.includes(meal)
            );
          });

          if (isLeaveForMeal) {
            leaveMeals += 1;
          } else {
            // Get attendance status
            const attendanceRecord = latestOrder.attendances.find(
              (att) => stripTime(att.date).getTime() === targetDate.getTime()
            );

            const status = attendanceRecord ? attendanceRecord[meal] : "packed";

            if (status === "delivered") {
              deliveredMeals += 1;
            }
          }
        });
      }
    });

    setCounts({
      totalUsers,
      expiredUsers,
      totalMeals,
      leaveMeals,
      deliveredMeals,
    });
  };

  // Helper function to check if meal time has passed
  const hasMealTimePassed = (meal) => {
    const now = new Date();
    const currentDate = stripTime(now);
    const selectedDateObj = stripTime(new Date(selectedDate));

    if (selectedDateObj < currentDate) {
      // Selected date is in the past
      return true;
    } else if (selectedDateObj > currentDate) {
      // Selected date is in the future
      return false;
    } else {
      // Selected date is today, compare time
      const currentHour = now.getHours();
      if (meal === "B") {
        return currentHour >= 10; // Breakfast ends at 10 AM
      } else if (meal === "L") {
        return currentHour >= 15; // Lunch ends at 3 PM
      } else if (meal === "D") {
        return currentHour >= 22; // Dinner ends at 10 PM
      }
    }
  };

  
  // Function to handle local changes (marking as delivered or undo)
  const handleLocalChange = (userId, meal, newStatus) => {
    setPendingChanges((prev) => {
      // Check if there's already a pending change for this user and meal
      const existingIndex = prev.findIndex(
        (change) => change.userId === userId && change.meal === meal
      );

      if (existingIndex !== -1) {
        const existingChange = prev[existingIndex];
        if (existingChange.newStatus === newStatus) {
          // If the new status is same as pending, remove the change
          const updatedChanges = [...prev];
          updatedChanges.splice(existingIndex, 1);
          return updatedChanges;
        } else {
          // Update the existing change
          const updatedChanges = [...prev];
          updatedChanges[existingIndex].newStatus = newStatus;
          return updatedChanges;
        }
      } else {
        // Add a new change
        return [...prev, { userId, meal, newStatus }];
      }
    });

    // Optimistically update the users state
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user._id !== userId) return user;
        const updatedOrders = user.orders.map((order) => {
          const targetDateObj = stripTime(new Date(selectedDate));
          const orderStart = stripTime(new Date(order.orderStart));
          const orderEnd = stripTime(new Date(order.orderEnd));

          if (targetDateObj < orderStart || targetDateObj > orderEnd) {
            return order;
          }

          const attendanceRecord = order.attendances.find(
            (att) => stripTime(att.date).getTime() === targetDateObj.getTime()
          );

          if (!attendanceRecord) return order;

          return {
            ...order,
            attendances: order.attendances.map((att) => {
              if (stripTime(att.date).getTime() === targetDateObj.getTime()) {
                return {
                  ...att,
                  [meal]: newStatus,
                };
              }
              return att;
            }),
          };
        });

        return { ...user, orders: updatedOrders };
      })
    );
  };

  // Function to synchronize pending changes with the backend
  const syncChanges = async () => {
    if (pendingChanges.length === 0) return;

    try {
      const payload = {
        date: selectedDate,
        changes: pendingChanges.map(({ userId, meal, newStatus }) => ({
          userId,
          meal,
          newStatus,
        })),
      };

      await axios.put(`${BaseUrl}/api/users/attendance/batch`, payload);

      alert("All changes have been synced successfully!");
      setPendingChanges([]);
      fetchUsers();
    } catch (err) {
      console.error("Error syncing changes:", err);
      alert("Failed to sync some changes. Please try again.");
    }
  };

  // Function to handle marking as delivered
  const handleMarkDelivered = (userId, meal) => {
    handleLocalChange(userId, meal, "delivered");
  };

  // Function to handle undo (marking as packed)
  const handleUndo = (userId, meal) => {
    handleLocalChange(userId, meal, "packed");
  };

  // Status labels and color function
  const statusLabels = {
    packed: "Packed",
    delivered: "Delivered",
    leave: "Leave",
    NIL: "NIL",
  };

  const getStatusColor = (status) => {
    if (status === "delivered") return "text-green-600";
    if (status === "leave") return "text-red-500";
    return "text-gray-500";
  };

  // Parse search query
  const parseSearchQuery = (query) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.startsWith("/")) {
      const command = trimmedQuery;
      if (COMMANDS.includes(command)) return { type: "command", value: command };
    }
    return { type: "search", value: trimmedQuery };
  };

  // Filtered Users based on search and commands
  const filteredUsers = useMemo(() => {
    const parsed = parseSearchQuery(searchQuery);
    const targetDate = stripTime(new Date(selectedDate));

    return users.filter((user) => {
      const sortedOrders = user.orders.sort(
        (a, b) => new Date(b.orderStart) - new Date(a.orderStart)
      );

      const latestOrder = sortedOrders[0];

      if (!latestOrder) return false;

      if (parsed.type === "command") {
        if (parsed.value === "/expired") {
          const orderEnd = stripTime(new Date(latestOrder.orderEnd));
          return targetDate > orderEnd;
        }
        if (parsed.value === "/leave") {
          return latestOrder.leave.some((leave) => {
            const leaveStart = stripTime(new Date(leave.start));
            const leaveEnd = stripTime(new Date(leave.end));
            return targetDate >= leaveStart && targetDate <= leaveEnd;
          });
        }
      } else if (parsed.type === "search") {
        const searchValue = parsed.value;
        if (!searchValue) return true;
        return (
          user.name.toLowerCase().includes(searchValue) ||
          user.phone.includes(searchValue)
        );
      }
      return true;
    });
  }, [users, searchQuery, selectedDate]);

  // Compute counts based on filtered users
  useEffect(() => {
    computeCounts(filteredUsers);
    // eslint-disable-next-line
  }, [filteredUsers]);

  // Handle Search Input Change with Auto-Suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.startsWith("/")) {
      const query = value.toLowerCase();
      const matchedCommands = COMMANDS.filter((cmd) =>
        cmd.startsWith(query)
      );
      setSuggestions(matchedCommands);
    } else {
      setSuggestions([]);
    }
  };

  // Handle Suggestion Click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
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
    <div className="p-4 bg-white min-h-screen">
      <h2 className="text-2xl font-semibold text-center mb-4">Attendance</h2>

      {/* Counts Section */}
      <div className="flex flex-wrap justify-center mb-6 space-x-4">
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md m-1">
          <span className="font-medium">Total Users:</span> {counts.totalUsers}
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md m-1">
          <span className="font-medium">Expired Users:</span> {counts.expiredUsers}
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md m-1">
          <span className="font-medium">Total Meals:</span> {counts.totalMeals}
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md m-1">
          <span className="font-medium">Leave Meals:</span> {counts.leaveMeals}
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md m-1">
          <span className="font-medium">Delivered Meals:</span> {counts.deliveredMeals}
        </div>
      </div>

      {/* Search and Date Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by Name or Phone, or enter /expired /leave"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 z-10">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center">
          <label htmlFor="date" className="mr-2 font-medium">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Breakfast</th>
              <th className="py-2 px-4 border-b text-left">Lunch</th>
              <th className="py-2 px-4 border-b text-left">Dinner</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => {
              const sortedOrders = user.orders.sort(
                (a, b) => new Date(b.orderStart) - new Date(a.orderStart)
              );

              const latestOrder = sortedOrders[0];

              const targetDate = stripTime(new Date(selectedDate));

              if (!latestOrder) {
                // User has no orders
                return (
                  <tr key={user._id} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.phone}</td>
                    <td className="py-2 px-4 border-b" colSpan={3}>
                      No Orders Found
                    </td>
                  </tr>
                );
              }

              const orderStart = stripTime(new Date(latestOrder.orderStart));
              const orderEnd = stripTime(new Date(latestOrder.orderEnd));

              if (targetDate < orderStart || targetDate > orderEnd) {
                // Order is expired
                return (
                  <tr key={user._id} className="bg-blue-100">
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.phone}</td>
                    <td className="py-2 px-4 border-b" colSpan={3}>
                      Expired
                    </td>
                  </tr>
                );
              }

              const planMeals = latestOrder.plan; // User's meal plan, e.g., ['B', 'L']

              // Get attendanceRecord for the targetDate
              const attendanceRecord = latestOrder.attendances.find(
                (att) => stripTime(att.date).getTime() === targetDate.getTime()
              );

              return (
                <tr key={user._id} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.phone}</td>
                  {["B", "L", "D"].map((meal) => {
                    const mealFull =
                      meal === "B" ? "Breakfast" : meal === "L" ? "Lunch" : "Dinner";

                    // Check if the meal is in the user's plan
                    if (!planMeals.includes(meal)) {
                      // User doesn't have this meal in their plan
                      return (
                        <td key={meal} className="py-2 px-4 border-b">
                          <span className="text-gray-500">NIL</span>
                        </td>
                      );
                    }

                    // Check if user is on leave for this meal on selectedDate
                    const isLeaveForMeal = latestOrder.leave.some((leave) => {
                      const leaveStart = stripTime(new Date(leave.start));
                      const leaveEnd = stripTime(new Date(leave.end));
                      return (
                        targetDate >= leaveStart &&
                        targetDate <= leaveEnd &&
                        leave.meals.includes(meal)
                      );
                    });

                    if (isLeaveForMeal) {
                      // User is on leave for this meal
                      return (
                        <td key={meal} className="py-2 px-4 border-b">
                          <span className="text-red-500 font-medium">Leave</span>
                        </td>
                      );
                    }

                    // Else, get the attendance status for this meal
                    const attendanceStatus = attendanceRecord
                      ? attendanceRecord[meal]
                      : "packed"; // Default to "packed"

                    // Check for pending changes
                    const pendingChange = pendingChanges.find(
                      (change) => change.userId === user._id && change.meal === meal
                    );

                    // Determine the display status
                    const displayStatus = pendingChange
                      ? pendingChange.newStatus
                      : attendanceStatus;

                    // Determine if the meal time has passed
                    const isMealTimePassed = hasMealTimePassed(meal);

                    // Render the cell
                    return (
                      <td key={meal} className="py-2 px-4 border-b">
                        {["packed", "delivered"].includes(displayStatus) ? (
                          <button
                            type="button"
                            onClick={() =>
                              displayStatus === "packed"
                                ? handleMarkDelivered(user._id, meal)
                                : handleUndo(user._id, meal)
                            }
                            className={`text-sm underline font-medium ${
                              isMealTimePassed
                                ? "text-gray-400 cursor-not-allowed"
                                : displayStatus === "packed"
                                ? "text-blue-600 hover:text-blue-800"
                                : "text-red-600 hover:text-red-800"
                            }`}
                            disabled={isMealTimePassed}
                          >
                            {statusLabels[displayStatus]}
                          </button>
                        ) : (
                          <span
                            className={`${getStatusColor(displayStatus)} font-medium`}
                          >
                            {statusLabels[displayStatus]}
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

      {/* Sync Button */}
      {pendingChanges.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <button
            type="button"
            onClick={syncChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700"
          >
            Sync ({pendingChanges.length})
          </button>
        </div>
      )}
    </div>
  );
}

const stripTime = (date) => {
  const validDate = date instanceof Date ? date : new Date(date);
  return new Date(
    validDate.getFullYear(),
    validDate.getMonth(),
    validDate.getDate()
  );
};
