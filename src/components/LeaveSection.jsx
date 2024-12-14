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
import {  EditIcon, Trash } from 'lucide-react';

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

        {/* Add Leave Section */}
    
        <div className="my-4">
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
      
      <div className="flex flex-row items-center gap-2">
  {console.log('planss', plan)}
  {plan.map((mealCode) => {
    const mealLabel = mealCode === 'B' ? 'B' : mealCode === 'L' ? 'L' : 'D';
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
  <Button 
    color="teal" 
    className="w-auto h-6 px-4 py-0 text-center ml-auto" 
    onClick={() => handleLeaveSubmit(leaveFormData)}
  >
    Save
  </Button>
</div>

      </div>
  


      {/* List of Leaves */}
      <Typography variant="h6" color="blue-gray" className="mb-2">
        Leaves
      </Typography>
      {leaves.length === 0 ? (
        <Typography>No leaves</Typography>
      ) : (
        <List>
          {leaves.map((leave) => (
           <ListItem
  key={leave._id}
  className="flex justify-between items-center p-4 mb-3 rounded-lg shadow-md bg-gradient-to-r from-teal-900 to-teal-200 hover:shadow-lg transition-shadow"
>
  <div className="text-white">
    <Typography className="text-sm font-medium">
      {`Start: ${formatDate(leave.start)} - End: ${formatDate(leave.end)}`}
    </Typography>
    <Typography className="text-xs text-gray-400">
      {`Meals: ${leave.meals?.join(', ')}`}
    </Typography>
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={() => openEditModal(leave)}
      className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label="Edit"
    >
      <EditIcon className="w-5 h-5" />
    </button>
    <button
      onClick={() => handleDeleteLeave(leave._id)}
      className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
      aria-label="Delete"
    >
      <Trash className="w-5 h-5" />
    </button>
  </div>
</ListItem>
          ))}
        </List>
      )}

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
