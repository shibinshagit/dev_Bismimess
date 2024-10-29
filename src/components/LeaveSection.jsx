// LeaveSection Component
import React, { useState } from 'react';
import {
  List,
  ListItem,
  Typography,
  Input,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { DeleteIcon, EditIcon } from 'lucide-react';

const LeaveSection = ({
  leaves,
  formatDate,
  handleLeaveInputChange,
  handleLeaveSubmit,
  handleEditLeave,
  handleDeleteLeave,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);

  const openEditModal = (leave) => {
    setCurrentLeave(leave);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentLeave(null);
    setEditModalOpen(false);
  };

  const handleEditSubmit = () => {
    handleEditLeave(currentLeave);
    closeEditModal();
  };

  return (
    <div className="mt-4">
      {/* List of Leaves */}
      <Typography variant="h6" color="blue-gray" className="mb-2">
        All Leaves
      </Typography>
      {leaves.length === 0 ? (
        <Typography>No leave entries found.</Typography>
      ) : (
        <List>
        {leaves.map((leave) => (
          <ListItem
            key={leave._id}
            className="mb-3 bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center border border-gray-200"
          >
            <div>
              <Typography color="gray-800" className="text-sm">
                {`Start: ${formatDate(leave.start)}, End: ${formatDate(leave.end)}, Days: ${leave.numberOfLeaves}`}
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <Button
                color="light-blue"
                variant="text"
                onClick={() => openEditModal(leave)}
                className="p-2 rounded-full"
              >
                <EditIcon className="w-5 h-5 text-light-blue-500" />
              </Button>
              <Button
                color="red-500"
                variant="text"
                onClick={() => handleDeleteLeave(leave._id)}
                className="p-2 rounded-full"
              >
                <DeleteIcon className="w-5 h-5 text-red-500" />
              </Button>
            </div>
          </ListItem>
        ))}
      </List>
      
      )}

      {/* Add Leave Section */}
      <Typography variant="h6" color="blue-gray" className="mt-4 mb-2">
        Add Leave
      </Typography>
      <div className="mb-4">
        <Input
          type="date"
          name="leaveStart"
          label="Leave Start Date"
          value={handleLeaveInputChange.leaveStart || ''}
          onChange={handleLeaveInputChange}
          required
        />
      </div>
      <div className="mb-4">
        <Input
          type="date"
          name="leaveEnd"
          label="Leave End Date"
          value={handleLeaveInputChange.leaveEnd || ''}
          onChange={handleLeaveInputChange}
          required
        />
      </div>
      <Button color="blue" onClick={handleLeaveSubmit}>
        Submit Leave
      </Button>

      {/* Edit Leave Modal */}
      <Dialog open={editModalOpen} handler={closeEditModal} size="sm">
        <DialogHeader>Edit Leave</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input
            type="date"
            name="leaveStart"
            label="Leave Start Date"
            value={currentLeave?.start ? formatDateISO(currentLeave.start) : ''}
            onChange={(e) => setCurrentLeave({ ...currentLeave, start: e.target.value })}
            required
          />
          <Input
            type="date"
            name="leaveEnd"
            label="Leave End Date"
            value={currentLeave?.end ? formatDateISO(currentLeave.end) : ''}
            onChange={(e) => setCurrentLeave({ ...currentLeave, end: e.target.value })}
            required
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={closeEditModal}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="green"
            onClick={handleEditSubmit}
          >
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

// Helper function to format date to YYYY-MM-DD for input fields
const formatDateISO = (date) => {
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
};

export default LeaveSection;
