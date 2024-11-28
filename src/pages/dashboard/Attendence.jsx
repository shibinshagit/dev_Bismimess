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
} from '@material-tailwind/react';
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid';

export function Attendance() {
  const [users, setUsers] = useState([]);
  const [pointId] = useState('66c26676b43a45070b24e735'); 
  // const [pointId] = useState('66d165903e98c9eddf35c5aa'); 
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
  }, [selectedDate]);

  useEffect(() => {
    determineCurrentMeal();
    const interval = setInterval(determineCurrentMeal, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const determineCurrentMeal = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 4 && hour < 11) {
      setCurrentMeal('Breakfast');
    } else if (hour >= 11 && hour < 17) {
      setCurrentMeal('Lunch');
    } else {
      setCurrentMeal('Dinner');
    }
  };

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
      if (meal === 'B') {
        return currentHour >= 11; // Breakfast ends at 11 AM
      } else if (meal === 'L') {
        return currentHour >= 17; // Lunch ends at 5 PM
      } else if (meal === 'D') {
        return currentHour < 4; // Dinner ends at 4 AM
      }
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
    <section className="flex flex-col">
      {/* Header Section */}
      <div className="w-full max-w-7xl fixed top-0 left-0 bg-white shadow-lg z-10 py-4 px-6 flex flex-col">
        <div className="flex justify-between items-center">
          <Typography
            variant="h2"
            className="font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl"
          >
            Attendance - {currentMeal}
          </Typography>
          <Button
            color="dark"
            onClick={syncChanges}
            className="rounded-lg shadow-sm flex items-center"
            disabled={pendingChanges.length === 0}
          >
            Sync ({pendingChanges.length})
          </Button>
        </div>
        {/* Search and Counts */}
        <div className="mt-4 flex items-center">
          <div className="relative flex-1">
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
          </div>
          <div className="ml-4 text-sm text-gray-600 flex space-x-4">
            <Typography variant="small" className="font-medium">
              T: {counts.deliveredMeals}/{counts.totalUsers}
            </Typography>
            <Typography variant="small" className="font-medium">
              E: {counts.expiredUsers}
            </Typography>
            <Typography variant="small" className="font-medium">
              L: {counts.leaveUsers}
            </Typography>
          </div>
        </div>
        {/* Date Picker */}
        <div className="mt-4 flex items-center">
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
      </div>
      {/* Table Section */}
      <div className="w-full max-w-7xl mt-48 px-6">
        <Card className="p-0 shadow-xl rounded-lg">
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-[180px] bg-gray-100 z-10">
              <tr className="text-left bg-gray-100 border-b">
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">
                  Name
                </th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">
                  Phone
                </th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">
                  {currentMeal}
                </th>
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
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white-50'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button color="gray" disabled>
                          NIL
                        </Button>
                      </td>
                    </tr>
                  );
                }

                const orderStart = stripTime(
                  new Date(latestOrder.orderStart)
                );
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
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white-50'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button color="black" disabled>
                          Expired
                        </Button>
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
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white-50'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button color="gray" disabled>
                          NIL
                        </Button>
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
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white-50'
                      }`}
                    >
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-4 py-2 text-blue-gray-900 font-medium">
                        {user.phone}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button color="yellow" disabled>
                          Leave
                        </Button>
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

                // Determine if the meal time has passed
                const isMealTimePassed = hasMealTimePassed(mealCode);

                return (
                  <tr
                    key={user._id}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white-50'
                    }`}
                  >
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">
                      {user.name}
                    </td>
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">
                      {user.phone}
                    </td>
                    <td className="px-4 py-2 text-center">
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
                          disabled={isMealTimePassed}
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
