import React, { useState, useEffect } from 'react';
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
  Checkbox,
} from "@material-tailwind/react";
import { DeleteIcon, EditIcon } from 'lucide-react';

const LeaveSection = ({
  leaves,
  formatDate,
  handleLeaveSubmit,
  handleEditLeave,
  handleDeleteLeave,
  plan = [],
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);
  const [editMeals, setEditMeals] = useState([]);

  const [leaveFormData, setLeaveFormData] = useState({
    leaveStart: '',
    leaveEnd: '',
    meals: [...plan],
  });

  // Update meals when plan changes
  useEffect(() => {
    setLeaveFormData((prevData) => ({
      ...prevData,
      meals: [...plan],
    }));
  }, [plan]);

  const handleLeaveMealsChange = (value, checked) => {
    setLeaveFormData((prevFormData) => {
      const updatedMeals = checked
        ? [...prevFormData.meals, value]
        : prevFormData.meals.filter((meal) => meal !== value);

      console.log('Updated meals:', updatedMeals);

      return { ...prevFormData, meals: updatedMeals };
    });
  };


  const openEditModal = (leave) => {
    setCurrentLeave({ ...leave });
    setEditMeals([...leave.meals]); // Initialize with existing meals
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentLeave(null);
    setEditMeals([]);
    setEditModalOpen(false);
  };

  const handleEditMealsChange = (value, checked) => {
    setEditMeals((prevMeals) => {
      const updatedMeals = checked
        ? [...prevMeals, value]
        : prevMeals.filter((meal) => meal !== value);
      return updatedMeals;
    });
  };

  const handleEditSubmit = () => {
    const updatedLeave = { ...currentLeave, meals: editMeals };
    handleEditLeave(updatedLeave);
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
            <ListItem key={leave._id} className="mb-3">
              <div>
                <Typography>
                  {`Start: ${formatDate(leave.start)}, End: ${formatDate(
                    leave.end
                  )}, Meals: ${leave.meals?.join(', ')}`}
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
          value={leaveFormData.leaveStart}
          onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveStart: e.target.value })}
          required
        />
      </div>
      <div className="mb-4">
        <Input
          type="date"
          name="leaveEnd"
          label="Leave End Date"
          value={leaveFormData.leaveEnd}
          onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveEnd: e.target.value })}
          required
        />
      </div>
      <div className="mb-4">
        <Typography variant="small" className="font-semibold mb-2">
          Select Meals for Leave
        </Typography>
        <div className="flex flex-col gap-2">
          {console.log('planss',plan)}
          {plan.map((mealCode) => {
            const mealLabel = mealCode === 'B' ? 'Breakfast' : mealCode === 'L' ? 'Lunch' : 'Dinner';
            return (
              <Checkbox
                key={mealCode}
                name="meals"
                label={mealLabel}
                checked={leaveFormData.meals.includes(mealCode)}
                onChange={(e) => handleLeaveMealsChange(mealCode, e.target.checked)}
              />
            );
          })}
        </div>
      </div>
      <Button color="blue" onClick={() => handleLeaveSubmit(leaveFormData)}>
        Submit Leave
      </Button>

      {/* Edit Leave Modal */}
      <Dialog open={editModalOpen} handler={closeEditModal} size="sm">
        <DialogHeader>Edit Leave</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {/* Date Inputs */}
          <Input
            type="date"
            name="leaveStart"
            label="Leave Start Date"
            value={formatDateISO(currentLeave?.start)}
            onChange={(e) =>
              setCurrentLeave({ ...currentLeave, start: e.target.value })
            }
            required
          />
          <Input
            type="date"
            name="leaveEnd"
            label="Leave End Date"
            value={formatDateISO(currentLeave?.end)}
            onChange={(e) =>
              setCurrentLeave({ ...currentLeave, end: e.target.value })
            }
            required
          />

          {/* Meals Selection */}
          <Typography variant="small" className="font-semibold mb-2">
            Select Meals for Leave
          </Typography>
          <div className="flex flex-col gap-2">
            {plan.map((mealCode) => {
              const mealLabel =
                mealCode === 'B'
                  ? 'Breakfast'
                  : mealCode === 'L'
                  ? 'Lunch'
                  : 'Dinner';
              return (
                <Checkbox
                  key={mealCode}
                  name="meals"
                  label={mealLabel}
                  checked={editMeals.includes(mealCode)}
                  onChange={(e) =>
                    handleEditMealsChange(mealCode, e.target.checked)
                  }
                />
              );
            })}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button variant="filled" color="green" onClick={handleEditSubmit}>
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
