// components/LeaveForm.js

import React from 'react';

const LeaveForm = ({ isOpen, onClose, onSubmit, leaveData, handleChange }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add/Edit Leave">
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <input
            type="date"
            name="leaveStart"
            value={leaveData.leaveStart}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="date"
            name="leaveEnd"
            value={leaveData.leaveEnd}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="number"
            name="totalBreakfastAbsent"
            placeholder="Total Breakfast Absent"
            value={leaveData.totalBreakfastAbsent}
            onChange={handleChange}
            required
            min="0"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="number"
            name="totalLunchAbsent"
            placeholder="Total Lunch Absent"
            value={leaveData.totalLunchAbsent}
            onChange={handleChange}
            required
            min="0"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="number"
            name="totalDinnerAbsent"
            placeholder="Total Dinner Absent"
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
            Save Leave
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveForm;
