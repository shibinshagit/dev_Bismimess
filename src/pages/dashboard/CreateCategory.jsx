// src/components/CreateCategory.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { PlusIcon, TrashIcon, EditIcon, XIcon } from 'lucide-react';
import { BaseUrl } from '../../constants/BaseUrl'; // Ensure BaseUrl is correctly set
import { useNavigate } from 'react-router-dom';

/* Reusable Modal Component */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white rounded-lg w-11/12 max-w-lg p-6 relative max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          title="Close Modal"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

/* Group Modal Component */
const GroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  groupData,
  handleChange,
  pointsList,
  openPointModal,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={groupData._id ? "Edit Group" : "Create Group"}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Group Title"
            value={groupData.title}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={groupData.location}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <div className="relative">
            <select
              name="point"
              value={groupData.point}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded px-3 py-2 pr-10 bg-white focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select a Point</option>
              {pointsList.map(point => (
                <option key={point._id} value={point._id}>
                  {point.place} ({point.mode})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openPointModal}
              className="absolute right-2 top-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
              title="Add New Point"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {groupData._id ? "Update Group" : "Create Group"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* Bulk Modal Component */
const BulkModal = ({
  isOpen,
  onClose,
  onSubmit,
  bulkData,
  handleChange,
  handleOrderChange,
  handleAddOrder,
  handleRemoveOrder,
  pointsList,
  openPointModal,
  handleEditLeave,
  handleDeleteLeave,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={bulkData._id ? "Edit Bulk" : "Create Bulk"}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="title"
            placeholder="Bulk Title"
            value={bulkData.title}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={bulkData.location}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <div className="relative">
            <select
              name="point"
              value={bulkData.point}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded px-3 py-2 pr-10 bg-white focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select a Point</option>
              {pointsList.map(point => (
                <option key={point._id} value={point._id}>
                  {point.place} ({point.mode})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openPointModal}
              className="absolute right-2 top-2 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
              title="Add New Point"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={bulkData.phone}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          
          {/* Orders Section */}
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Orders</h4>
            {bulkData.orders.map((order, index) => (
              <div key={index} className="p-4 border rounded mb-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium">Order {index + 1}</h5>
                  {bulkData.orders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOrder(index)}
                      className="flex items-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      title="Remove Order"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <input
                    type="number"
                    name="totalBreakfast"
                    placeholder="Total Breakfast"
                    value={order.totalBreakfast}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    min="0"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  />
                  <input
                    type="number"
                    name="totalLunch"
                    placeholder="Total Lunch"
                    value={order.totalLunch}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    min="0"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  />
                  <input
                    type="number"
                    name="totalDinner"
                    placeholder="Total Dinner"
                    value={order.totalDinner}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    min="0"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  />
                  <select
                    name="paymentStatus"
                    value={order.paymentStatus}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    className="block w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                  {/* Conditionally render payment details if status is success or failed */}
                  {(order.paymentStatus === 'success' || order.paymentStatus === 'failed') && (
                    <>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={order.amount || ''}
                        onChange={(e) => handleOrderChange(index, e)}
                        required
                        min="0"
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                      <input
                        type="text"
                        name="paymentId"
                        placeholder="Payment ID"
                        value={order.paymentId || ''}
                        onChange={(e) => handleOrderChange(index, e)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                      <input
                        type="text"
                        name="paymentMethod"
                        placeholder="Payment Method"
                        value={order.paymentMethod || ''}
                        onChange={(e) => handleOrderChange(index, e)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                    </>
                  )}
                  <input
                    type="date"
                    name="startDate"
                    placeholder="Start Date"
                    value={order.startDate}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  />
                  <input
                    type="date"
                    name="billDate"
                    placeholder="Bill Date"
                    value={order.billDate}
                    onChange={(e) => handleOrderChange(index, e)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  />
                </div>
                
                {/* Leaves Section */}
                <div className="mt-4">
                  <h6 className="text-sm font-medium">Leaves:</h6>
                  {order.leaves.length === 0 ? (
                    <p className="text-xs text-gray-500 ml-4">No leaves.</p>
                  ) : (
                    order.leaves.map((leave, lIdx) => (
                      <div key={leave._id} className="ml-4 mt-1 p-2 border rounded">
                        <p className="text-xs font-medium">Leave {lIdx + 1}:</p>
                        <p className="text-xs">Start: {new Date(leave.leaveStart).toLocaleDateString()}</p>
                        <p className="text-xs">End: {new Date(leave.leaveEnd).toLocaleDateString()}</p>
                        <p className="text-xs">Breakfast Absent: {leave.totalBreakfastAbsent}</p>
                        <p className="text-xs">Lunch Absent: {leave.totalLunchAbsent}</p>
                        <p className="text-xs">Dinner Absent: {leave.totalDinnerAbsent}</p>
                        <div className="flex space-x-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleEditLeave(leave, bulkData._id, order._id)}
                            className="flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            title="Edit Leave"
                          >
                            <EditIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLeave(leave._id, bulkData._id, order._id)}
                            className="flex items-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                            title="Delete Leave"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddLeave(bulkData._id, order._id)}
                    className="flex items-center px-3 py-1 mt-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                    title="Add Leave"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Leave
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOrder}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Add New Order"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add New Order
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {bulkData._id ? "Update Bulk" : "Create Bulk"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* Leave Modal Component */
const LeaveModal = ({
  isOpen,
  onClose,
  onSubmit,
  leaveData,
  handleChange,
  isEdit = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Leave" : "Add Leave"}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-medium text-gray-700">Leave Start</label>
          <input
            type="date"
            name="leaveStart"
            value={leaveData.leaveStart}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="block text-sm font-medium text-gray-700">Leave End</label>
          <input
            type="date"
            name="leaveEnd"
            value={leaveData.leaveEnd}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="block text-sm font-medium text-gray-700">Total Breakfast Absent</label>
          <input
            type="number"
            name="totalBreakfastAbsent"
            value={leaveData.totalBreakfastAbsent}
            onChange={handleChange}
            required
            min="0"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="block text-sm font-medium text-gray-700">Total Lunch Absent</label>
          <input
            type="number"
            name="totalLunchAbsent"
            value={leaveData.totalLunchAbsent}
            onChange={handleChange}
            required
            min="0"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <label className="block text-sm font-medium text-gray-700">Total Dinner Absent</label>
          <input
            type="number"
            name="totalDinnerAbsent"
            value={leaveData.totalDinnerAbsent}
            onChange={handleChange}
            required
            min="0"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isEdit ? "Update Leave" : "Add Leave"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* Main CreateCategory Component */
function CreateCategory() {
  const navigate = useNavigate();

  // State Variables
  const [pointsList, setPointsList] = useState([]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });

  const [activeTab, setActiveTab] = useState('groups');

  // Group Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isEditModeGroup, setIsEditModeGroup] = useState(false);
  const [editGroupData, setEditGroupData] = useState(null);
  const [groupForm, setGroupForm] = useState({
    title: '',
    location: '',
    point: '',
  });

  // Bulk Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditModeBulk, setIsEditModeBulk] = useState(false);
  const [editBulkData, setEditBulkData] = useState(null);
  const [bulkForm, setBulkForm] = useState({
    title: '',
    location: '',
    point: '',
    phone: '',
    orders: [{
      totalBreakfast: 0,
      totalLunch: 0,
      totalDinner: 0,
      paymentStatus: 'pending',
      amount: '',
      paymentId: '',
      paymentMethod: '',
      startDate: '',
      billDate: '',
      leaves: [],
    }],
  });

  // Leave Modal States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEditLeave, setIsEditLeave] = useState(false);
  const [currentLeave, setCurrentLeave] = useState({
    leaveStart: '',
    leaveEnd: '',
    totalBreakfastAbsent: 0,
    totalLunchAbsent: 0,
    totalDinnerAbsent: 0,
  });
  const [selectedBulkId, setSelectedBulkId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch Points on Mount
  useEffect(() => {
    fetchPoints();
    fetchGroups();
    fetchBulks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Points
  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
      Swal.fire('Error', 'Failed to fetch points.', 'error');
    }
  };

  // Fetch Groups and Bulks
  const [groups, setGroups] = useState([]);
  const [bulks, setBulks] = useState([]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire('Error', 'Failed to fetch groups.', 'error');
    }
  };

  const fetchBulks = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/bulks`);
      setBulks(response.data);
    } catch (error) {
      console.error("Error fetching bulks:", error);
      Swal.fire('Error', 'Failed to fetch bulks.', 'error');
    }
  };

  // Handle New Point Input Change
  const handleNewPointChange = (e) => {
    const { name, value } = e.target;
    setNewPoint(prev => ({ ...prev, [name]: value }));
  };

  // Add New Point
  const handleAddNewPoint = async () => {
    if (!newPoint.place.trim()) {
      Swal.fire('Error', 'Place is required.', 'error');
      return;
    }
    try {
      const response = await axios.post(`${BaseUrl}/api/points`, newPoint);
      const addedPoint = response.data.point;
      setPointsList([...pointsList, addedPoint]);
      setOpenPointModal(false);
      setNewPoint({ place: '', mode: 'single' });
      Swal.fire('Success', 'Point added successfully.', 'success');
    } catch (error) {
      console.error("Error adding new point:", error);
      Swal.fire('Error', 'Failed to add new point.', 'error');
    }
  };

  // Handle Group Form Change
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle Bulk Form Change
  const handleBulkChange = (e) => {
    const { name, value } = e.target;
    setBulkForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle Order Change in Bulk Form
  const handleBulkOrderChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOrders = [...bulkForm.orders];
    updatedOrders[index][name] = value;
    setBulkForm(prev => ({ ...prev, orders: updatedOrders }));
  };

  // Add New Order in Bulk Form
  const handleAddOrder = () => {
    setBulkForm(prev => ({
      ...prev,
      orders: [...prev.orders, {
        totalBreakfast: 0,
        totalLunch: 0,
        totalDinner: 0,
        paymentStatus: 'pending',
        amount: '',
        paymentId: '',
        paymentMethod: '',
        startDate: '',
        billDate: '',
        leaves: [],
      }],
    }));
  };

  // Remove Order from Bulk Form
  const handleRemoveOrder = (index) => {
    const updatedOrders = [...bulkForm.orders];
    updatedOrders.splice(index, 1);
    setBulkForm(prev => ({ ...prev, orders: updatedOrders }));
  };

  // Submit Group Form (Create or Update)
  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.title.trim() || !groupForm.location.trim() || !groupForm.point) {
      Swal.fire('Error', 'All fields are required.', 'error');
      return;
    }
    try {
      if (isEditModeGroup && editGroupData) {
        const response = await axios.put(`${BaseUrl}/api/groups/${editGroupData._id}`, groupForm);
        if (response.status === 200) {
          Swal.fire('Success', 'Group updated successfully.', 'success');
          fetchGroups();
          setGroupForm({ title: '', location: '', point: '' });
          setIsEditModeGroup(false);
          setEditGroupData(null);
          setIsGroupModalOpen(false);
        } else {
          Swal.fire('Error', response.data.message || 'Failed to update group.', 'error');
        }
      } else {
        const response = await axios.post(`${BaseUrl}/api/groups`, groupForm);
        if (response.status === 201) {
          Swal.fire('Success', 'Group created successfully.', 'success');
          fetchGroups();
          setGroupForm({ title: '', location: '', point: '' });
          setIsGroupModalOpen(false);
        } else {
          Swal.fire('Error', response.data.message || 'Failed to create group.', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting group:', error.response || error);
      Swal.fire('Error', 'Failed to submit group.', 'error');
    }
  };

  // Submit Bulk Form (Create or Update)
  const handleSubmitBulk = async (e) => {
    e.preventDefault();
    if (
      !bulkForm.title.trim() ||
      !bulkForm.location.trim() ||
      !bulkForm.point ||
      !bulkForm.phone.trim()
    ) {
      Swal.fire('Error', 'All fields are required.', 'error');
      return;
    }

    // Frontend Validation: Check for overlapping orders
    const checkOrderOverlap = (newStart, newEnd, existingOrders) => {
      const newStartDate = new Date(newStart);
      const newEndDate = new Date(newEnd);

      return existingOrders.some(order => {
        const existingStart = new Date(order.startDate);
        const existingEnd = new Date(order.billDate);
        return (newStartDate <= existingEnd) && (existingStart <= newEndDate);
      });
    };

    const allExistingOrders = bulks.flatMap(bulk => bulk.orders);
    const hasOverlap = bulkForm.orders.some(order => {
      if (!order.startDate || !order.billDate) return false;
      return checkOrderOverlap(order.startDate, order.billDate, allExistingOrders);
    });

    if (hasOverlap) {
      Swal.fire('Error', 'One or more orders have overlapping dates with existing orders.', 'error');
      return;
    }

    try {
      if (isEditModeBulk && editBulkData) {
        const response = await axios.put(`${BaseUrl}/api/bulks/${editBulkData._id}`, bulkForm);
        if (response.status === 200) {
          Swal.fire('Success', 'Bulk updated successfully.', 'success');
          fetchBulks();
          setBulkForm({
            title: '',
            location: '',
            point: '',
            phone: '',
            orders: [{
              totalBreakfast: 0,
              totalLunch: 0,
              totalDinner: 0,
              paymentStatus: 'pending',
              amount: '',
              paymentId: '',
              paymentMethod: '',
              startDate: '',
              billDate: '',
              leaves: [],
            }],
          });
          setIsEditModeBulk(false);
          setEditBulkData(null);
          setIsBulkModalOpen(false);
        } else {
          Swal.fire('Error', response.data.message || 'Failed to update bulk.', 'error');
        }
      } else {
        const response = await axios.post(`${BaseUrl}/api/bulks`, bulkForm);
        if (response.status === 201) {
          Swal.fire('Success', 'Bulk created successfully.', 'success');
          fetchBulks();
          setBulkForm({
            title: '',
            location: '',
            point: '',
            phone: '',
            orders: [{
              totalBreakfast: 0,
              totalLunch: 0,
              totalDinner: 0,
              paymentStatus: 'pending',
              amount: '',
              paymentId: '',
              paymentMethod: '',
              startDate: '',
              billDate: '',
              leaves: [],
            }],
          });
          setIsBulkModalOpen(false);
        } else {
          Swal.fire('Error', response.data.message || 'Failed to create bulk.', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting bulk:', error.response || error);
      Swal.fire('Error', 'Failed to submit bulk.', 'error');
    }
  };

  // Edit Group
  const handleEditGroup = (group) => {
    setEditGroupData(group);
    setGroupForm({
      title: group.title,
      location: group.location,
      point: group.point._id,
    });
    setIsEditModeGroup(true);
    setIsGroupModalOpen(true);
  };

  // Delete Group
  const handleDeleteGroup = async (groupId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this group?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BaseUrl}/api/groups/${groupId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', 'Group has been deleted.', 'success');
            fetchGroups();
          } else {
            Swal.fire('Error!', 'Cannot delete group.', 'error');
          }
        } catch (error) {
          console.error('Error deleting group:', error);
          Swal.fire('Error!', 'An error occurred while deleting the group.', 'error');
        }
      }
    });
  };

  // Edit Bulk
  const handleEditBulk = (bulk) => {
    setEditBulkData(bulk);
    setBulkForm({
      title: bulk.title,
      location: bulk.location,
      point: bulk.point._id,
      phone: bulk.phone,
      orders: bulk.orders.map(order => ({
        totalBreakfast: order.totalBreakfast,
        totalLunch: order.totalLunch,
        totalDinner: order.totalDinner,
        paymentStatus: order.paymentStatus,
        amount: order.amount || '',
        paymentId: order.paymentId || '',
        paymentMethod: order.paymentMethod || '',
        startDate: order.startDate ? order.startDate.slice(0,10) : '',
        billDate: order.billDate ? order.billDate.slice(0,10) : '',
        leaves: order.leaves,
        _id: order._id, // Ensure order has _id
      })),
    });
    setIsEditModeBulk(true);
    setIsBulkModalOpen(true);
  };

  // Delete Bulk
  const handleDeleteBulk = async (bulkId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this bulk?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BaseUrl}/api/bulks/${bulkId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', 'Bulk has been deleted.', 'success');
            fetchBulks();
          } else {
            Swal.fire('Error!', 'Cannot delete bulk.', 'error');
          }
        } catch (error) {
          console.error('Error deleting bulk:', error);
          Swal.fire('Error!', 'An error occurred while deleting the bulk.', 'error');
        }
      }
    });
  };

  // Handle Leave Form Change
  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setCurrentLeave(prev => ({ ...prev, [name]: value }));
  };

  // Open Add Leave Modal
  const handleAddLeave = (bulkId, orderId) => {
    setSelectedBulkId(bulkId);
    setSelectedOrderId(orderId);
    setCurrentLeave({
      leaveStart: '',
      leaveEnd: '',
      totalBreakfastAbsent: 0,
      totalLunchAbsent: 0,
      totalDinnerAbsent: 0,
    });
    setIsEditLeave(false);
    setIsLeaveModalOpen(true);
  };

  // Open Edit Leave Modal
  const handleEditLeave = (leave, bulkId, orderId) => {
    setSelectedBulkId(bulkId);
    setSelectedOrderId(orderId);
    setCurrentLeave(leave);
    setIsEditLeave(true);
    setIsLeaveModalOpen(true);
  };

  // Submit Leave (Add or Update)
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!currentLeave.leaveStart || !currentLeave.leaveEnd) {
      Swal.fire('Error', 'Leave start and end dates are required.', 'error');
      return;
    }

    // Prepare payload
    const payload = {
      leaveStart: currentLeave.leaveStart,
      leaveEnd: currentLeave.leaveEnd,
      totalBreakfastAbsent: currentLeave.totalBreakfastAbsent,
      totalLunchAbsent: currentLeave.totalLunchAbsent,
      totalDinnerAbsent: currentLeave.totalDinnerAbsent,
    };

    try {
      if (isEditLeave && currentLeave._id) {
        // Update Leave
        const response = await axios.put(`${BaseUrl}/api/bulks/${selectedBulkId}/updateLeave`, {
          orderId: selectedOrderId,
          leaveId: currentLeave._id,
          leave: payload,
        });
        if (response.status === 200) {
          Swal.fire('Success', 'Leave updated successfully.', 'success');
          fetchBulks();
          setIsLeaveModalOpen(false);
        }
      } else {
        // Add Leave
        const response = await axios.post(`${BaseUrl}/api/bulks/${selectedBulkId}/addLeave`, {
          orderId: selectedOrderId,
          leave: payload,
        });
        if (response.status === 200) {
          Swal.fire('Success', 'Leave added successfully.', 'success');
          fetchBulks();
          setIsLeaveModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Error submitting leave:', error.response || error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to submit leave.', 'error');
    }
  };

  // Delete Leave
  const handleDeleteLeave = async (leaveId, bulkId, orderId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this leave?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BaseUrl}/api/bulks/${bulkId}/deleteLeave`, {
            data: { orderId, leaveId }
          });
          if (response.status === 200) {
            Swal.fire('Deleted!', 'Leave has been deleted.', 'success');
            fetchBulks();
          } else {
            Swal.fire('Error!', 'Cannot delete leave.', 'error');
          }
        } catch (error) {
          console.error('Error deleting leave:', error);
          Swal.fire('Error!', 'An error occurred while deleting the leave.', 'error');
        }
      }
    });
  };

  return (
    <div className="flex justify-center my-12 px-4">
      <div className="w-full max-w-6xl p-6 bg-white shadow rounded">

        {/* Create Category Button */}
        <button
          onClick={() => {
            Swal.fire({
              title: 'Select Category Type',
              showDenyButton: true,
              showCancelButton: true,
              confirmButtonText: 'Create Group',
              denyButtonText: `Create Bulk`,
            }).then((result) => {
              if (result.isConfirmed) {
                setIsGroupModalOpen(true);
              } else if (result.isDenied) {
                setIsBulkModalOpen(true);
              }
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Create Category"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Create Category
        </button>

        {/* Tabs for Groups and Bulks */}
        <div className="mt-6">
          {/* Tab List */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-2 px-4 -mb-px border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('bulks')}
              className={`ml-4 py-2 px-4 -mb-px border-b-2 font-medium text-sm ${
                activeTab === 'bulks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulks
            </button>
          </div>

          {/* Tab Panels */}
          {activeTab === 'groups' && (
            <div className="mt-4">
              {/* List of Groups */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Existing Groups</h3>
                {groups.length === 0 ? (
                  <p className="text-gray-500">No groups found.</p>
                ) : (
                  <div className="space-y-4">
                    {groups.map(group => (
                      <div key={group._id} className="p-4 border rounded">
                        <h4 className="text-md font-semibold">{group.title}</h4>
                        <p className="text-sm text-gray-600">Location: {group.location}</p>
                        <p className="text-sm text-gray-600">Point: {group.point.place} ({group.point.mode})</p>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            title="Edit Group"
                          >
                            <EditIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group._id)}
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            title="Delete Group"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bulks' && (
            <div className="mt-4">
              {/* List of Bulks */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Existing Bulks</h3>
                {bulks.length === 0 ? (
                  <p className="text-gray-500">No bulks found.</p>
                ) : (
                  <div className="space-y-4">
                    {bulks.map(bulk => (
                      <div key={bulk._id} className="p-4 border rounded">
                        <h4 className="text-md font-semibold">{bulk.title}</h4>
                        <p className="text-sm text-gray-600">Location: {bulk.location}</p>
                        <p className="text-sm text-gray-600">Point: {bulk.point.place} ({bulk.point.mode})</p>
                        <p className="text-sm text-gray-600">Phone: {bulk.phone}</p>
                        {/* Orders Summary */}
                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Orders:</h5>
                          {bulk.orders.map((order, idx) => (
                            <div key={order._id} className="ml-4 mt-2">
                              <p className="text-sm font-medium">Order {idx + 1}:</p>
                              <p className="text-sm text-gray-600">Total Breakfast: {order.totalBreakfast}</p>
                              <p className="text-sm text-gray-600">Total Lunch: {order.totalLunch}</p>
                              <p className="text-sm text-gray-600">Total Dinner: {order.totalDinner}</p>
                              <p className="text-sm text-gray-600">Payment Status: {order.paymentStatus}</p>
                              {/* Conditionally render payment details */}
                              {(order.paymentStatus === 'success' || order.paymentStatus === 'failed') && (
                                <>
                                  <p className="text-sm text-gray-600">Amount: {order.amount}</p>
                                  <p className="text-sm text-gray-600">Payment ID: {order.paymentId}</p>
                                  <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod}</p>
                                </>
                              )}
                              <p className="text-sm text-gray-600">Start Date: {order.startDate ? new Date(order.startDate).toLocaleDateString() : 'N/A'}</p>
                              <p className="text-sm text-gray-600">Bill Date: {order.billDate ? new Date(order.billDate).toLocaleDateString() : 'N/A'}</p>
                              {/* Leaves */}
                              <div className="mt-2">
                                <h6 className="text-xs font-medium">Leaves:</h6>
                                {order.leaves.length === 0 ? (
                                  <p className="text-xs text-gray-500 ml-4">No leaves.</p>
                                ) : (
                                  order.leaves.map((leave, lIdx) => (
                                    <div key={leave._id} className="ml-4 mt-1 p-2 border rounded">
                                      <p className="text-xs font-medium">Leave {lIdx + 1}:</p>
                                      <p className="text-xs">Start: {new Date(leave.leaveStart).toLocaleDateString()}</p>
                                      <p className="text-xs">End: {new Date(leave.leaveEnd).toLocaleDateString()}</p>
                                      <p className="text-xs">Breakfast Absent: {leave.totalBreakfastAbsent}</p>
                                      <p className="text-xs">Lunch Absent: {leave.totalLunchAbsent}</p>
                                      <p className="text-xs">Dinner Absent: {leave.totalDinnerAbsent}</p>
                                      <div className="flex space-x-2 mt-1">
                                        <button
                                          type="button"
                                          onClick={() => handleEditLeave(leave, bulk._id, order._id)}
                                          className="flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                          title="Edit Leave"
                                        >
                                          <EditIcon className="w-4 h-4 mr-1" /> Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteLeave(leave._id, bulk._id, order._id)}
                                          className="flex items-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                          title="Delete Leave"
                                        >
                                          <TrashIcon className="w-4 h-4 mr-1" /> Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Bulk Actions */}
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleEditBulk(bulk)}
                            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            title="Edit Bulk"
                          >
                            <EditIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBulk(bulk._id)}
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            title="Delete Bulk"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Group Modal */}
        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => {
            setIsGroupModalOpen(false);
            setIsEditModeGroup(false);
            setEditGroupData(null);
            setGroupForm({ title: '', location: '', point: '' });
          }}
          onSubmit={handleSubmitGroup}
          groupData={isEditModeGroup && editGroupData ? {
            ...groupForm,
            _id: editGroupData._id,
          } : groupForm}
          handleChange={handleGroupChange}
          pointsList={pointsList}
          openPointModal={() => setOpenPointModal(true)}
        />

        {/* Bulk Modal */}
        <BulkModal
          isOpen={isBulkModalOpen}
          onClose={() => {
            setIsBulkModalOpen(false);
            setIsEditModeBulk(false);
            setEditBulkData(null);
            setBulkForm({
              title: '',
              location: '',
              point: '',
              phone: '',
              orders: [{
                totalBreakfast: 0,
                totalLunch: 0,
                totalDinner: 0,
                paymentStatus: 'pending',
                amount: '',
                paymentId: '',
                paymentMethod: '',
                startDate: '',
                billDate: '',
                leaves: [],
              }],
            });
          }}
          onSubmit={handleSubmitBulk}
          bulkData={isEditModeBulk && editBulkData ? {
            ...bulkForm,
            _id: editBulkData._id,
          } : bulkForm}
          handleChange={handleBulkChange}
          handleOrderChange={handleBulkOrderChange}
          handleAddOrder={handleAddOrder}
          handleRemoveOrder={handleRemoveOrder}
          pointsList={pointsList}
          openPointModal={() => setOpenPointModal(true)}
          handleEditLeave={handleEditLeave}
          handleDeleteLeave={handleDeleteLeave}
        />

        {/* Leave Modal */}
        <LeaveModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onSubmit={handleSubmitLeave}
          leaveData={currentLeave}
          handleChange={handleLeaveChange}
          isEdit={isEditLeave}
        />

        {/* Add New Point Modal */}
        {openPointModal && (
          <Modal isOpen={openPointModal} onClose={() => setOpenPointModal(false)} title="Add New Point">
            <form onSubmit={(e) => { e.preventDefault(); handleAddNewPoint(); }}>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="place"
                  placeholder="Place"
                  value={newPoint.place}
                  onChange={handleNewPointChange}
                  required
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
                <select
                  name="mode"
                  value={newPoint.mode}
                  onChange={(e) => setNewPoint(prev => ({ ...prev, mode: e.target.value }))}
                  required
                  className="block w-full border border-gray-300 rounded px-3 py-2 pr-10 bg-white focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="single">Single</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setOpenPointModal(false)}
                  className="px-4 py-2 mr-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default CreateCategory;
