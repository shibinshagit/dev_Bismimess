// UpcomingDelivery.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { XMarkIcon, PlusIcon, TrashIcon, PencilIcon, EyeIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { BaseUrl } from "@/constants/BaseUrl"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";

export function UpcomingDelivery() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [pointsList, setPointsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEditBoy, setCurrentEditBoy] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalPoint, setUserModalPoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newDeliveryBoy, setNewDeliveryBoy] = useState({
    name: "",
    phone: "",
    code: "",
    points: [],
  });
  const [editDeliveryBoy, setEditDeliveryBoy] = useState({
    name: "",
    phone: "",
    code: "",
    points: [],
  });

  const navigate = useNavigate();

  // Fetch points and delivery boys from the backend API
  const fetchPoints = useCallback(async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
      setError("Failed to fetch points.");
    }
  }, []);

  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/replace/delivery-boys`);
      setDeliveryBoys(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
      setError("Failed to fetch delivery boys.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchPoints();
      await fetchDeliveryBoys();
    };
    fetchData();
  }, [fetchPoints, fetchDeliveryBoys]);

  // Handle form input changes for adding a new delivery boy
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeliveryBoy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form input changes for editing a delivery boy
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDeliveryBoy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new point to the delivery boy's points array
  const handleAddPoint = () => {
    setNewDeliveryBoy((prev) => ({
      ...prev,
      points: [
        ...prev.points,
        {
          point: "",
          relatedTo: "all",
          details: {
            times: ["B", "L", "D"],
            location: "home",
            users: [],
          },
        },
      ],
    }));
  };

  // Remove a point from the delivery boy's points array
  const handleRemovePoint = (index) => {
    setNewDeliveryBoy((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  // Similarly, handle remove point in edit form
  const handleEditRemovePoint = (index) => {
    setEditDeliveryBoy((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  // Handle point selection change
  const handlePointChange = (index, selectedPoint) => {
    const updatedPoints = [...newDeliveryBoy.points];
    updatedPoints[index].point = selectedPoint._id;
    updatedPoints[index].relatedTo = "all"; // Reset to 'all' when point changes
    updatedPoints[index].details = {
      times: selectedPoint.plan, // Assuming 'plan' is an array like ['B', 'L', 'D']
      location: "home",
      users: [],
    };
    setNewDeliveryBoy((prev) => ({
      ...prev,
      points: updatedPoints,
    }));
  };

  // Similarly, handle point change in edit form
  const handleEditPointChange = (index, selectedPoint) => {
    const updatedPoints = [...editDeliveryBoy.points];
    updatedPoints[index].point = selectedPoint._id;
    updatedPoints[index].relatedTo = "all"; // Reset to 'all' when point changes
    updatedPoints[index].details = {
      times: selectedPoint.plan,
      location: "home",
      users: [],
    };
    setEditDeliveryBoy((prev) => ({
      ...prev,
      points: updatedPoints,
    }));
  };

  // Handle relatedTo change
  const handleRelatedToChange = (index, value, isEdit = false) => {
    if (isEdit) {
      const updatedPoints = [...editDeliveryBoy.points];
      updatedPoints[index].relatedTo = value;
      if (value === "all") {
        updatedPoints[index].details = {
          times: editDeliveryBoy.points[index].details.times,
          location: editDeliveryBoy.points[index].details.location,
          users: [],
        };
      }
      setEditDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    } else {
      const updatedPoints = [...newDeliveryBoy.points];
      updatedPoints[index].relatedTo = value;
      if (value === "all") {
        updatedPoints[index].details = {
          times: newDeliveryBoy.points[index].details.times,
          location: newDeliveryBoy.points[index].details.location,
          users: [],
        };
      }
      setNewDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    }
  };

  // Open User Selection Modal
  const openUserSelection = (pointIndex, isEdit = false) => {
    const point = isEdit ? editDeliveryBoy.points[pointIndex] : newDeliveryBoy.points[pointIndex];
    if (!point.point) {
      alert("Please select a point first.");
      return;
    }
    setUserModalPoint({ pointIndex, isEdit });
    setSearchQuery("");
    fetchUsersForPoint(point.point);
    setShowUserModal(true);
  };

  // Fetch users for a specific point
  const fetchUsersForPoint = async (pointId) => {
    try {
      const response = await axios.get(`${BaseUrl}/api/replace/users`, {
        params: { pointId },
      });
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users for point:", error);
      setFilteredUsers([]);
    }
  };

  // Handle search query change in user modal
  const handleUserSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      // Re-fetch all users if search query is empty
      fetchUsersForPoint(userModalPoint.pointIndex.point);
    } else {
      const filtered = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  };

  // Handle user selection in modal
  const handleUserSelect = (userId) => {
    const { pointIndex, isEdit } = userModalPoint;
    if (isEdit) {
      const updatedPoints = [...editDeliveryBoy.points];
      const userIndex = updatedPoints[pointIndex].details.users.findIndex((u) => u.user === userId);
      if (userIndex !== -1) {
        // User already selected, remove it
        updatedPoints[pointIndex].details.users.splice(userIndex, 1);
      } else {
        // Add user with default times and location
        updatedPoints[pointIndex].details.users.push({
          user: userId,
          times: ["B", "L", "D"],
          location: "home",
        });
      }
      setEditDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    } else {
      const updatedPoints = [...newDeliveryBoy.points];
      const userIndex = updatedPoints[pointIndex].details.users.findIndex((u) => u.user === userId);
      if (userIndex !== -1) {
        // User already selected, remove it
        updatedPoints[pointIndex].details.users.splice(userIndex, 1);
      } else {
        // Add user with default times and location
        updatedPoints[pointIndex].details.users.push({
          user: userId,
          times: ["B", "L", "D"],
          location: "home",
        });
      }
      setNewDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    }
  };

  // Handle updating user's times and location
  const handleUserDetailsChange = (pointIndex, userIndex, field, value, isEdit = false) => {
    if (isEdit) {
      const updatedPoints = [...editDeliveryBoy.points];
      updatedPoints[pointIndex].details.users[userIndex][field] = value;
      setEditDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    } else {
      const updatedPoints = [...newDeliveryBoy.points];
      updatedPoints[pointIndex].details.users[userIndex][field] = value;
      setNewDeliveryBoy((prev) => ({
        ...prev,
        points: updatedPoints,
      }));
    }
  };

  // Handle adding a delivery boy
  const handleAddDeliveryBoy = async () => {
    // Basic validation
    if (!newDeliveryBoy.name || !newDeliveryBoy.phone || !newDeliveryBoy.code) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate each point
    for (let i = 0; i < newDeliveryBoy.points.length; i++) {
      const point = newDeliveryBoy.points[i];
      if (!point.point) {
        alert(`Please select a point for Point ${i + 1}.`);
        return;
      }
      if (point.relatedTo === "user" && point.details.users.length === 0) {
        alert(`Please select at least one user for Point ${i + 1}.`);
        return;
      }
    }

    try {
      await axios.post(`${BaseUrl}/api/replace/delivery-boys`, newDeliveryBoy);
      alert("Delivery Boy added successfully.");
      fetchDeliveryBoys();
      setNewDeliveryBoy({
        name: "",
        phone: "",
        code: "",
        points: [],
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding delivery boy:", error);
      alert("Failed to add delivery boy.");
    }
  };

  // Handle editing a delivery boy
  const handleEditDeliveryBoy = async () => {
    // Basic validation
    if (!editDeliveryBoy.name || !editDeliveryBoy.phone || !editDeliveryBoy.code) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate each point
    for (let i = 0; i < editDeliveryBoy.points.length; i++) {
      const point = editDeliveryBoy.points[i];
      if (!point.point) {
        alert(`Please select a point for Point ${i + 1}.`);
        return;
      }
      if (point.relatedTo === "user" && point.details.users.length === 0) {
        alert(`Please select at least one user for Point ${i + 1}.`);
        return;
      }
    }

    try {
      await axios.put(`${BaseUrl}/api/replace/delivery-boys/${currentEditBoy._id}`, editDeliveryBoy);
      alert("Delivery Boy updated successfully.");
      fetchDeliveryBoys();
      setEditDeliveryBoy({
        name: "",
        phone: "",
        code: "",
        points: [],
      });
      setShowEditForm(false);
      setCurrentEditBoy(null);
    } catch (error) {
      console.error("Error updating delivery boy:", error);
      alert("Failed to update delivery boy.");
    }
  };

  // Handle deleting a delivery boy
  const handleDeleteDeliveryBoy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery boy?")) return;

    try {
      await axios.delete(`${BaseUrl}/api/replace/delivery-boys/${id}`);
      alert("Delivery Boy deleted successfully.");
      fetchDeliveryBoys();
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
      alert("Failed to delete delivery boy.");
    }
  };

  // Open edit form with existing data
  const openEditFormHandler = (deliveryBoy) => {
    setCurrentEditBoy(deliveryBoy);
    setEditDeliveryBoy({
      name: deliveryBoy.name,
      phone: deliveryBoy.phone,
      code: deliveryBoy.code,
      points: deliveryBoy.points.map((p) => ({
        point: p.point._id,
        relatedTo: p.relatedTo,
        details: {
          times: p.details.times,
          location: p.details.location,
          users: p.details.users || [],
        },
      })),
    });
    setShowEditForm(true);
  };

  // Render Loading or Error
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Delivery Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Delivery Boy
        </button>
      </div>

      {/* Add Delivery Boy Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-white rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Add Delivery Boy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newDeliveryBoy.name}
                onChange={handleAddInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={newDeliveryBoy.phone}
                onChange={handleAddInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 4-Digit Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                4-Digit Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={newDeliveryBoy.code}
                onChange={handleAddInputChange}
                maxLength={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Points Selection */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Assign Points</h3>
            {newDeliveryBoy.points.map((point, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Point {index + 1}</h4>
                  <button
                    onClick={() => handleRemovePoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Point */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Point<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.point}
                      onChange={(e) => {
                        const selectedPoint = pointsList.find((p) => p._id === e.target.value);
                        handlePointChange(index, selectedPoint);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Select Point --</option>
                      {pointsList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.place} ({p.mode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Related To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related To<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.relatedTo}
                      onChange={(e) => handleRelatedToChange(index, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">ALL</option>
                      <option value="user">USERS</option>
                    </select>
                  </div>
                </div>

                {/* If Related To is USERS, show button to select users */}
                {point.relatedTo === "user" && (
                  <div className="mt-4">
                    <button
                      onClick={() => openUserSelection(index)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Select Users
                    </button>

                    {/* Display Selected Users */}
                    {point.details.users.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-md font-medium mb-2">Selected Users:</h5>
                        <ul className="max-h-40 overflow-y-auto">
                          {point.details.users.map((userItem, userIndex) => {
                            const userDetails = pointsList.find((p) => p._id === point.point)?.users?.find((u) => u._id === userItem.user);
                            return (
                              <li key={userItem.user} className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2">
                                <span>{userDetails ? `${userDetails.name} (${userDetails.phone})` : "User Info Missing"}</span>
                                <button
                                  onClick={() => {
                                    // Remove user from selection
                                    const updatedPoints = [...newDeliveryBoy.points];
                                    updatedPoints[index].details.users.splice(userIndex, 1);
                                    setNewDeliveryBoy((prev) => ({
                                      ...prev,
                                      points: updatedPoints,
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {/* Show more if more than 10 users */}
                        {point.details.users.length > 10 && (
                          <button className="mt-2 text-blue-600 hover:underline">
                            Show More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Times and Location */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Times */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Meals<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      {point.details.times.map((meal) => (
                        <label key={meal} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={point.details.times.includes(meal)}
                            onChange={(e) => {
                              const updatedPoints = [...newDeliveryBoy.points];
                              if (e.target.checked) {
                                updatedPoints[index].details.times.push(meal);
                              } else {
                                updatedPoints[index].details.times = updatedPoints[index].details.times.filter((m) => m !== meal);
                              }
                              setNewDeliveryBoy((prev) => ({
                                ...prev,
                                points: updatedPoints,
                              }));
                            }}
                            className="form-checkbox h-4 w-4 text-blue-600"
                            disabled
                          />
                          <span className="ml-2">{meal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Drop Off At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drop Off At<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.details.location}
                      onChange={(e) =>
                        handleUserDetailsChange(index, null, "location", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleAddPoint}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Point
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddDeliveryBoy}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
          </div>
        )}

      {/* Edit Delivery Boy Form */}
      {showEditForm && currentEditBoy && (
        <div className="mb-8 p-6 bg-white rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Edit Delivery Boy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editDeliveryBoy.name}
                onChange={handleEditInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={editDeliveryBoy.phone}
                onChange={handleEditInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 4-Digit Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                4-Digit Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={editDeliveryBoy.code}
                onChange={handleEditInputChange}
                maxLength={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Points Selection */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Assign Points</h3>
            {editDeliveryBoy.points.map((point, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Point {index + 1}</h4>
                  <button
                    onClick={() => handleEditRemovePoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Point */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Point<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.point}
                      onChange={(e) => {
                        const selectedPoint = pointsList.find((p) => p._id === e.target.value);
                        handleEditPointChange(index, selectedPoint);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Select Point --</option>
                      {pointsList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.place} ({p.mode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Related To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related To<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.relatedTo}
                      onChange={(e) => handleRelatedToChange(index, e.target.value, true)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">ALL</option>
                      <option value="user">USERS</option>
                    </select>
                  </div>
                </div>

                {/* If Related To is USERS, show button to select users */}
                {point.relatedTo === "user" && (
                  <div className="mt-4">
                    <button
                      onClick={() => openUserSelection(index, true)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Select Users
                    </button>

                    {/* Display Selected Users */}
                    {point.details.users.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-md font-medium mb-2">Selected Users:</h5>
                        <ul className="max-h-40 overflow-y-auto">
                          {point.details.users.map((userItem, userIndex) => {
                            const userDetails = pointsList.find((p) => p._id === point.point)?.users?.find((u) => u._id === userItem.user);
                            return (
                              <li key={userItem.user} className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2">
                                <div>
                                  <span>{userDetails ? `${userDetails.name} (${userDetails.phone})` : "User Info Missing"}</span>
                                  <div className="mt-1 flex items-center space-x-2">
                                    {/* Meal Checkboxes */}
                                    {point.details.times.map((meal) => (
                                      <label key={meal} className="flex items-center text-sm">
                                        <input
                                          type="checkbox"
                                          checked={userItem.times.includes(meal)}
                                          onChange={(e) => {
                                            const updatedPoints = [...editDeliveryBoy.points];
                                            const updatedTimes = userItem.times.includes(meal)
                                              ? userItem.times.filter((m) => m !== meal)
                                              : [...userItem.times, meal];
                                            updatedPoints[index].details.users[userIndex].times = updatedTimes;
                                            setEditDeliveryBoy((prev) => ({
                                              ...prev,
                                              points: updatedPoints,
                                            }));
                                          }}
                                          className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-1">{meal}</span>
                                      </label>
                                    ))}
                                  </div>
                                  {/* Drop Off At */}
                                  <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Drop Off At<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={userItem.location}
                                      onChange={(e) =>
                                        handleUserDetailsChange(index, userIndex, "location", e.target.value, true)
                                      }
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      required
                                    >
                                      <option value="home">Home</option>
                                      <option value="work">Work</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    // Remove user from selection
                                    const updatedPoints = [...editDeliveryBoy.points];
                                    updatedPoints[index].details.users.splice(userIndex, 1);
                                    setEditDeliveryBoy((prev) => ({
                                      ...prev,
                                      points: updatedPoints,
                                    }));
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {/* Show more if more than 10 users */}
                        {point.details.users.length > 10 && (
                          <button className="mt-2 text-blue-600 hover:underline">
                            Show More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Times and Location */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Times */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Meals<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      {point.details.times.map((meal) => (
                        <label key={meal} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={point.details.times.includes(meal)}
                            onChange={(e) => {
                              const updatedPoints = [...editDeliveryBoy.points];
                              if (e.target.checked) {
                                updatedPoints[index].details.times.push(meal);
                              } else {
                                updatedPoints[index].details.times = updatedPoints[index].details.times.filter((m) => m !== meal);
                              }
                              setEditDeliveryBoy((prev) => ({
                                ...prev,
                                points: updatedPoints,
                              }));
                            }}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">{meal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Drop Off At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drop Off At<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={point.details.location}
                      onChange={(e) =>
                        handleUserDetailsChange(index, null, "location", e.target.value, true)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleAddPoint}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Point
              </button>
              <button
                onClick={() => setShowEditForm(false)}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            <div className="mt-6">
              <button
                onClick={handleEditDeliveryBoy}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Update Delivery Boy
              </button>
            </div>
          </div>
          </div>
        )}

      {/* Delivery Boys List */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Delivery Boys</h2>
        {deliveryBoys.length === 0 ? (
          <p className="text-gray-500">No delivery boys found.</p>
        ) : (
          <div className="space-y-4">
            {deliveryBoys.map((boy) => (
              <div key={boy._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-md">
                <div>
                  <h3 className="text-xl font-medium">{boy.name}</h3>
                  <p className="text-gray-600">{boy.phone}</p>
                  <p className="text-gray-600">Code: {boy.code}</p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => openEditFormHandler(boy)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <PencilIcon className="w-5 h-5 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/viewdelivery/${boy._id}`)}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    <EyeIcon className="w-5 h-5 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteDeliveryBoy(boy._id)}
                    className="flex items-center text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Selection Modal */}
      {showUserModal && userModalPoint && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md w-11/12 md:w-1/2 lg:w-1/3 p-6 relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Select Users</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or phone"
                value={searchQuery}
                onChange={handleUserSearch}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mb-4">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500">No users found.</p>
              ) : (
                <ul className="space-y-2">
                  {filteredUsers.map((user) => (
                    <li key={user._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          userModalPoint.isEdit
                            ? editDeliveryBoy.points[userModalPoint.pointIndex].details.users.some((u) => u.user === user._id)
                            : newDeliveryBoy.points[userModalPoint.pointIndex].details.users.some((u) => u.user === user._id)
                        }
                        onChange={() => handleUserSelect(user._id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span>{`${user.name} (${user.phone})`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpcomingDelivery;
