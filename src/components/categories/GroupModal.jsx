// components/GroupModal.js

import React from 'react';
import { TrashIcon, EditIcon } from 'lucide-react';

const GroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  groupData,
  handleChange,
  isEdit = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Group" : "Create Group"}>
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
              {/* Map through pointsList */}
            </select>
            {/* Add button to open Point Modal */}
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
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupModal;
