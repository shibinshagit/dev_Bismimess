// components/BulkModal.js

import React, { useState } from 'react';
import LeaveForm from './LeaveForm';

const BulkModal = ({
  isOpen,
  onClose,
  onSubmit,
  bulkData,
  handleChange,
  handleOrderChange,
  handleAddOrder,
  handleRemoveOrder,
  isEdit = false,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveStart: '',
    leaveEnd: '',
    totalBreakfastAbsent: 0,
    totalLunchAbsent: 0,
    totalDinnerAbsent: 0,
  });

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLeave = (orderId) => {
    setSelectedOrderId(orderId);
    setIsLeaveModalOpen(true);
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    // Implement leave submission logic
    // e.g., call API to add leave
    // After success:
    setIsLeaveModalOpen(false);
    setLeaveFormData({
      leaveStart: '',
      leaveEnd: '',
      totalBreakfastAbsent: 0,
      totalLunchAbsent: 0,
      totalDinnerAbsent: 0,
    });
    // Refresh bulks
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Bulk" : "Create Bulk"}>
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
                {/* Map through pointsList */}
              </select>
              {/* Add button to open Point Modal */}
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
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    />
                    <input
                      type="number"
                      name="totalLunch"
                      placeholder="Total Lunch"
                      value={order.totalLunch}
                      onChange={(e) => handleOrderChange(index, e)}
                      required
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    />
                    <input
                      type="number"
                      name="totalDinner"
                      placeholder="Total Dinner"
                      value={order.totalDinner}
                      onChange={(e) => handleOrderChange(index, e)}
                      required
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
                    {order.leaves.map((leave, lIdx) => (
                      <div key={lIdx} className="ml-4 mt-1 p-2 border rounded">
                        <p className="text-xs font-medium">Leave {lIdx + 1}:</p>
                        <p className="text-xs">Start: {new Date(leave.leaveStart).toLocaleDateString()}</p>
                        <p className="text-xs">End: {new Date(leave.leaveEnd).toLocaleDateString()}</p>
                        <p className="text-xs">Breakfast Absent: {leave.totalBreakfastAbsent}</p>
                        <p className="text-xs">Lunch Absent: {leave.totalLunchAbsent}</p>
                        <p className="text-xs">Dinner Absent: {leave.totalDinnerAbsent}</p>
                        <div className="flex space-x-2 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Open Edit Leave Modal
                            }}
                            className="flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                          >
                            <EditIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Handle Delete Leave
                            }}
                            className="flex items-center px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddLeave(bulkData._id, order._id)}
                      className="flex items-center px-3 py-1 mt-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
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
              {isEdit ? "Update Bulk" : "Create Bulk"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Modal */}
      <LeaveForm
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveData={leaveFormData}
        handleChange={handleLeaveChange}
        onSubmit={submitLeave}
      />
    </>
  );
};

export default BulkModal;
