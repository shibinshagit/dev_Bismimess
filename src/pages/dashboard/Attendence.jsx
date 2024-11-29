// src/pages/Attendance.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { BaseUrl } from '@/constants/BaseUrl';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from '@material-tailwind/react';
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid';

export function Attendance() {
  const [users, setUsers] = useState([]);
  const [pointId] = useState('66c26676b43a45070b24e735'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingChanges, setPendingChanges] = useState([]);
  const [counts, setCounts] = useState({
    totalUsers: 0,
    expiredUsers: 0,
    leaveUsers: 0,
    deliveredMeals: 0,
  });
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const [currentMeal, setCurrentMeal] = useState('Breakfast');

  const searchInputRef = useRef(null);

  const COMMANDS = ['/expired', '/leave'];

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [selectedDate, currentMeal]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${BaseUrl}/api/points/${pointId}/users`
      );
      setUsers(response.data);
      computeCounts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
    }
  };

  // Function to compute counts
  const computeCounts = (usersData) => {
    let totalUsers = 0;
    let expiredUsers = 0;
    let leaveUsers = 0;
    let deliveredMeals = 0;

    const mealCode = currentMeal.charAt(0); // 'B', 'L', 'D'
    const targetDate = stripTime(new Date(selectedDate));

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

      if (targetDate < orderStart || targetDate > orderEnd) {
        expiredUsers += 1;
      } else {
        totalUsers += 1;

        if (!latestOrder.plan.includes(mealCode)) {
          // User doesn't have this meal in their plan
          return;
        }

        // Check if user is on leave for this meal on targetDate
        const isLeaveForMeal = latestOrder.leave.some((leave) => {
          const leaveStart = stripTime(new Date(leave.start));
          const leaveEnd = stripTime(new Date(leave.end));
          return (
            targetDate >= leaveStart &&
            targetDate <= leaveEnd &&
            leave.meals.includes(mealCode)
          );
        });

        if (isLeaveForMeal) {
          leaveUsers += 1;
        } else {
          // Get attendance status
          const attendanceRecord = latestOrder.attendances.find(
            (att) =>
              stripTime(att.date).getTime() === targetDate.getTime()
          );

          const status = attendanceRecord
            ? attendanceRecord[mealCode]
            : 'packed';

          if (status === 'delivered') {
            deliveredMeals += 1;
          }
        }
      }
    });

    setCounts({
      totalUsers,
      expiredUsers,
      leaveUsers,
      deliveredMeals,
    });
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
            (att) =>
              stripTime(att.date).getTime() === targetDateObj.getTime()
          );

          if (!attendanceRecord) return order;

          return {
            ...order,
            attendances: order.attendances.map((att) => {
              if (
                stripTime(att.date).getTime() === targetDateObj.getTime()
              ) {
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

      alert('All changes have been synced successfully!');
      setPendingChanges([]);
      fetchUsers();
    } catch (err) {
      console.error('Error syncing changes:', err);
      alert('Failed to sync some changes. Please try again.');
    }
  };

  // Auto-sync when pending changes reach 20
  useEffect(() => {
    if (pendingChanges.length >= 20) {
      syncChanges();
    }
    // eslint-disable-next-line
  }, [pendingChanges]);

  // Function to handle marking as delivered
  const handleMarkDelivered = (userId, meal) => {
    handleLocalChange(userId, meal, 'delivered');
  };

  // Function to handle undo (marking as packed)
  const handleUndo = (userId, meal) => {
    handleLocalChange(userId, meal, 'packed');
  };

  // Status labels and color function
  const statusLabels = {
    packed: 'Packed',
    delivered: 'Delivered',
    leave: 'Leave',
    NIL: 'NIL',
    expired: 'Expired',
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'green';
    if (status === 'packed') return 'orange';
    if (status === 'leave') return 'yellow';
    if (status === 'expired') return 'black';
    if (status === 'NIL') return 'gray';
    return 'gray';
  };

  // Parse search query
  const parseSearchQuery = (query) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.startsWith('/')) {
      const command = trimmedQuery;
      if (COMMANDS.includes(command))
        return { type: 'command', value: command };
    }
    return { type: 'search', value: trimmedQuery };
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

      if (parsed.type === 'command') {
        if (parsed.value === '/expired') {
          const orderEnd = stripTime(new Date(latestOrder.orderEnd));
          return targetDate > orderEnd;
        }
        if (parsed.value === '/leave') {
          return latestOrder.leave.some((leave) => {
            const leaveStart = stripTime(new Date(leave.start));
            const leaveEnd = stripTime(new Date(leave.end));
            return (
              targetDate >= leaveStart && targetDate <= leaveEnd
            );
          });
        }
      } else if (parsed.type === 'search') {
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
  }, [filteredUsers, currentMeal]);

  // Handle Search Input Change with Auto-Suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.startsWith('/')) {
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

  // Removed the hasMealTimePassed function since no restrictions are needed

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
    <section className="flex flex-col min-h-screen p-4 sm:p-6">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto bg-white shadow-lg z-10 py-4 px-6 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Typography
            variant="h2"
            className="font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl"
          >
            Attendance
          </Typography>
          <Button
            color="dark"
            onClick={syncChanges}
            className="mt-4 sm:mt-0 rounded-lg shadow-sm flex items-center"
            disabled={pendingChanges.length === 0}
          >
            Sync ({pendingChanges.length})
          </Button>
        </div>
        {/* Meal Selector */}
        <div className="mt-4 flex flex-col sm:flex-row items-center">
          <div className="w-full sm:w-1/3 mb-4 sm:mb-0">
            <Select
              label="Select Meal"
              value={currentMeal}
              onChange={(value) => setCurrentMeal(value)}
              className="w-full"
            >
              <Option value="Breakfast">Breakfast (4 AM - 11 AM)</Option>
              <Option value="Lunch">Lunch (11 AM - 5 PM)</Option>
              <Option value="Dinner">Dinner (5 PM - 4 AM)</Option>
            </Select>
          </div>
          <div className="w-full sm:w-1/3 sm:mx-4 mb-4 sm:mb-0">
            <Input
              type="date"
              size="lg"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg shadow-sm"
              inputProps={{
                className:
                  'border-gray-300 focus:border-blue-900 focus:ring-0 focus:outline-none',
              }}
            />
          </div>
          <div className="w-full sm:w-1/3 relative">
            <Input
              size="lg"
              label="Search user by name or phone"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-lg shadow-sm pl-10 pr-14"
              inputProps={{
                className:
                  'border-gray-300 focus:border-blue-900 focus:ring-0 focus:outline-none',
              }}
              ref={searchInputRef}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md mt-1 z-20">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Counts */}
        <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600 space-x-4">
          <Typography variant="small" className="font-medium">
            Delivered Meals: {counts.deliveredMeals}/{counts.totalUsers}
          </Typography>
          <Typography variant="small" className="font-medium">
            Expired Users: {counts.expiredUsers}
          </Typography>
          <Typography variant="small" className="font-medium">
            Leave Users: {counts.leaveUsers}
          </Typography>
        </div>
      </div>
      {/* Table Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <Card className="p-4 shadow-xl rounded-lg overflow-x-auto">
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="text-left bg-gray-100 border-b">
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">Name</th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">{currentMeal}</th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">Phone</th>
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
                    <tr
                      key={user._id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                     
                      <td className="px-4 py-2 text-center">
                        <Button color="gray" disabled>
                          {statusLabels['NIL']}
                        </Button>
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                    </tr>
                  );
                }

                const orderStart = stripTime(new Date(latestOrder.orderStart));
                const orderEnd = stripTime(new Date(latestOrder.orderEnd));

                if (
                  targetDate < orderStart ||
                  targetDate > orderEnd
                ) {
                  // Order is expired
                  return (
                    <tr
                      key={user._id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                     
                      <td className="px-4 py-2 text-center">
                        <Button color="black" disabled>
                          {statusLabels['expired']}
                        </Button>
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                    </tr>
                  );
                }

                const mealCode = currentMeal.charAt(0); // 'B', 'L', 'D'

                const planMeals = latestOrder.plan; // User's meal plan

                if (!planMeals.includes(mealCode)) {
                  // User doesn't have this meal in their plan
                  return (
                    <tr
                      key={user._id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                     
                      <td className="px-4 py-2 text-center">
                        <Button color="gray" disabled>
                          {statusLabels['NIL']}
                        </Button>
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                    </tr>
                  );
                }

                // Check if user is on leave for this meal on selectedDate
                const isLeaveForMeal = latestOrder.leave.some((leave) => {
                  const leaveStart = stripTime(new Date(leave.start));
                  const leaveEnd = stripTime(new Date(leave.end));
                  return (
                    targetDate >= leaveStart &&
                    targetDate <= leaveEnd &&
                    leave.meals.includes(mealCode)
                  );
                });

                if (isLeaveForMeal) {
                  // User is on leave for this meal
                  return (
                    <tr
                      key={user._id}
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                     
                      <td className="px-4 py-2 text-center">
                        <Button color="yellow" disabled>
                          {statusLabels['leave']}
                        </Button>
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                    </tr>
                  );
                }

                // Else, get the attendance status for this meal
                const attendanceRecord = latestOrder.attendances.find(
                  (att) =>
                    stripTime(att.date).getTime() ===
                    targetDate.getTime()
                );

                const attendanceStatus = attendanceRecord
                  ? attendanceRecord[mealCode]
                  : 'packed'; // Default to "packed"

                // Check for pending changes
                const pendingChange = pendingChanges.find(
                  (change) =>
                    change.userId === user._id && change.meal === mealCode
                );

                // Determine the display status
                const displayStatus = pendingChange
                  ? pendingChange.newStatus
                  : attendanceStatus;

                // Removed the meal time check to allow modifications at any time

                return (
                  <tr
                    key={user._id}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">
                      {user.name}
                    </td>
                 
                    <td className=" px-4 py-2 text-center">
                      {['packed', 'delivered'].includes(displayStatus) ? (
                        <Button
                          color={getStatusColor(displayStatus)}
                          size="sm"
                          onClick={() =>
                            displayStatus === 'packed'
                              ? handleMarkDelivered(
                                  user._id,
                                  mealCode
                                )
                              : handleUndo(user._id, mealCode)
                          }
                          className="flex items-center justify-center space-x-1 rounded-lg shadow-sm"
                        >
                          <CheckBadgeIcon className="h-5 w-5" />
                          <span>{statusLabels[displayStatus]}</span>
                        </Button>
                      ) : (
                        <Button
                          color={getStatusColor(displayStatus)}
                          size="sm"
                          disabled
                          className="flex items-center justify-center space-x-1 rounded-lg shadow-sm"
                        >
                          {statusLabels[displayStatus]}
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">
                      {user.phone}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
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

export default Attendance;
