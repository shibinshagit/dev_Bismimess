import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { 
  Card, CardHeader, CardBody, Typography, Input, Button, Checkbox, 
  List, ListItem, Dialog, DialogHeader, DialogBody, DialogFooter, 
  Option, Select ,Switch, Menu, MenuHandler, MenuList, MenuItem, IconButton,
  Avatar
} from "@material-tailwind/react";
import { fetchCustomers } from '@/redux/reducers/authSlice';
import { BaseUrl } from '../../constants/BaseUrl';
import './swal.css';
import LeaveSection from '@/components/LeaveSection';


/* Reusable Components */

// AddNewPointModal Component
const AddNewPointModal = ({
  open,
  handleClose,
  newPoint,
  handleNewPointChange,
  handleSelectChange,
  handleAddNewPoint,
  modalHeader
}) => (
  <Dialog open={open} handler={handleClose} size="sm">
    <DialogHeader className={modalHeader.includes('not existing') ? 'text-red-500' : ''}>
      {modalHeader}
    </DialogHeader>
    <DialogBody className="flex flex-col gap-4">
      <Input
        label="Place"
        name="place"
        value={newPoint.place}
        onChange={handleNewPointChange}
      />
      <Select
        label="Mode"
        value={newPoint.mode}
        onChange={handleSelectChange}
      >
        <Option value="single">Single</Option>
        <Option value="cluster">Cluster</Option>
      </Select>
    </DialogBody>
    <DialogFooter>
      <Button
        variant="text"
        color="red"
        onClick={handleClose}
      >
        Cancel
      </Button>
      <Button
        variant="filled"
        color="green"
        onClick={handleAddNewPoint}
      >
        Save
      </Button>
    </DialogFooter>
  </Dialog>
);

// Reusable PlanCheckboxes Component
const PlanCheckboxes = ({ plan, handlePlanChange, isEditing }) => (
  <div className="mb-4">
    <Typography variant="small" className="font-semibold mb-2">
      Plan
    </Typography>
    <div className="flex flex-col gap-2">
      {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => {
        const value = meal.charAt(0).toUpperCase(); // 'B', 'L', 'D'
        console.log('plan:',plan)
        return (
          <Checkbox
            key={index}
            name="plan"
            label={meal}
            value={value}
            checked={plan.includes(value)}
            onChange={handlePlanChange}
            disabled={!isEditing}
          />
        );
      })}
    </div>
  </div>
);
/* Main Edit Component */
function Edit() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State Variables
  const [images, setImages] = useState([]); // For new images selected by the user
  const [imagePreviews, setImagePreviews] = useState([]); // Previews of new images
  const [existingImages, setExistingImages] = useState([]); // URLs of existing images
  const [imagesToRemove, setImagesToRemove] = useState([]); // Images marked for removal
  const [user, setUser] = useState(location.state.user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [showLeaveSection, setShowLeaveSection] = useState(false);

const [userType, setUserType] = useState('individual'); // 'individual' or 'group'
const [groupsList, setGroupsList] = useState([]); // All groups fetched from the backend
const [filteredGroups, setFilteredGroups] = useState([]); // Groups filtered by selected point
const [selectedGroup, setSelectedGroup] = useState(''); // Selected group ID
const [dropdownOpen, setDropdownOpen] = useState(false);


  const [pointsList, setPointsList] = useState([]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });
  const [modalHeader, setModalHeader] = useState('Add New Point');
  const [pointInputValue, setPointInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPoints, setFilteredPoints] = useState([]);
  

  const [leaveFormData, setLeaveFormData] = useState({ leaveStart: '', leaveEnd: '', meals: [] });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    point: null, // Store point ID
    plan: [],
    paymentStatus: 'pending', // Default to 'pending'
    startDate: '',
    endDate: '',
    amount: '',
    paymentMethod: '',
    paymentId: '',
    isVeg: false,
  });

  // Effects
  useEffect(() => {
    fetchPoints();
    fetchGroups();
    if (user._id) {
      fetchUserById(user._id);
    }
  }, []);

  useEffect(() => {
    if (pointsList.length > 0 && user) {
      initializeFormData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pointsList]); // Runs when either user or pointsList changes and pointsList is populated

  // Fetch Points
  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };
  // Fetch groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/groups`);
      setGroupsList(response.data);
      console.log('f',response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire('Error', 'Failed to fetch groups.', 'error');
    }
  };
  

  // Fetch User by ID
  const fetchUserById = async (userId) => {
    try {
      const response = await axios.get(`${BaseUrl}/api/user/${userId}`);
      setUser(response.data);
      console.log(response.data);
      // Set existing images
      setExistingImages(response.data.images || []);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  // Initialize Form Data
  const initializeFormData = () => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  const latestOrder = user.latestOrder || {};

  // Find the user's point from pointsList
  const userPoint = pointsList.find(point => point._id === user.point);

  setFormData({
    name: user.name || '',
    phone: user.phone || '',
    point: user.point || null,
    plan: latestOrder.plan || [],
    paymentStatus: latestOrder.paymentStatus || 'pending',
    startDate: formatDate(latestOrder.orderStart) || '',
    endDate: formatDate(latestOrder.orderEnd) || '',
    amount: latestOrder.amount || '',
    paymentMethod: latestOrder.paymentMethod || '',
    paymentId: latestOrder.paymentId || '',
    isVeg: latestOrder.isVeg || false,
  });
  setPointInputValue(userPoint ? userPoint.place : '');

  // Initialize userType based on user.group
  if (user.group) {
    setUserType('group');
    setSelectedGroup(user.group); // Set selected group to user's existing group
  } else {
    setUserType('individual');
    setSelectedGroup('');
  }

  // Filter groups based on the selected point
  if (user.point) {
    const relevantGroups = groupsList.filter(group => group.point._id === user.point);
    setFilteredGroups(relevantGroups);
  }
};

const handleGroupOnPoints = (point) => {
  console.log('here',groupsList, 'and :',point._id)
  const relevantGroups = groupsList.filter(group => group.point._id === point._id);
  setFilteredGroups(relevantGroups);
}

  // Handlers
  const handleRemoveExistingImage = (src) => {
    setImagesToRemove([...imagesToRemove, src]);
    setExistingImages(existingImages.filter((image) => image !== src));
  };  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    if (files.length + existingImages.length > 3) {
      alert('You can only have a maximum of 3 images.');
      return;
    }
  
    setImages(files);
  
    // Generate image previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  
  const handleRemoveNewImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };
  
  // Handle changes in the Add New Point form
  const handleNewPointChange = (e) => {
    const { name, value } = e.target;
    setNewPoint((prevPoint) => ({
      ...prevPoint,
      [name]: value
    }));
  };

  const handleSelectChange = (value) => {
    setNewPoint((prevPoint) => ({
      ...prevPoint,
      mode: value
    }));
  };

  // Add a new point
  const handleAddNewPoint = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/api/points`, newPoint);
      const addedPoint = response.data;
      setPointsList([...pointsList, addedPoint]);
      setFormData(prevFormData => ({
        ...prevFormData,
        point: addedPoint._id
      }));
      setPointInputValue(addedPoint.place);
      setOpenPointModal(false);
      setModalHeader('Add New Point');
      setNewPoint({ place: '', mode: 'single' });
    } catch (error) {
      console.error("Error adding new point:", error);
      Swal.fire('Error', 'Failed to add new point.', 'error');
    }
  };

  // Handle changes in the main form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone' && value.length > 10) {
      return;
    }

    if (name === 'startDate') {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0);
      }
      endDate.setDate(endDate.getDate() - 1);

      setFormData({
        ...formData,
        startDate: value,
        endDate: endDate.toISOString().split('T')[0],
      });
    } else if (name === 'point') {
      const inputValue = value;
      setPointInputValue(inputValue);
      const filtered = pointsList.filter(point =>
        point.place.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredPoints(filtered);
      setShowSuggestions(inputValue.length > 0 && filtered.length > 0);

      // Reset formData.point if input doesn't match any point exactly
      const exactMatch = pointsList.find(point => point.place.toLowerCase() === inputValue.toLowerCase());
      setFormData({
        ...formData,
        point: exactMatch ? exactMatch._id : null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Handle changes in the plan checkboxes
  const handlePlanChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevFormData) => {
      const updatedPlan = checked
        ? [...prevFormData.plan, value]
        : prevFormData.plan.filter((plan) => plan !== value);
      return { ...prevFormData, plan: updatedPlan };
    });
  };

  // Handle suggestion click for points
  const handleSuggestionClick = (point) => {
    handleGroupOnPoints(point);
    setFormData({
      ...formData,
      point: point._id,
    });
    setPointInputValue(point.place);
    setShowSuggestions(false);
  };

  // Edit button click
  const handleEditClick = () => {
    setShowLeaveSection(false);
    setIsEditing(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    initializeFormData();
  };

  // Toggle leave section
  const handleLeaveClick = () => {
    setShowLeaveSection(!showLeaveSection);
  };

  // Handle changes in the leave form
  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;

    setLeaveFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Submit main form
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.point) {
      setModalHeader('The entered point does not exist. You can add it now.');
      setNewPoint({ ...newPoint, place: pointInputValue });
      setOpenPointModal(true);
      return;
    }
  
    if (userType === 'group' && !selectedGroup) {
      Swal.fire('Error', 'Please select a group.', 'error');
      return;
    }
  
    try {
      const data = new FormData();
  
      // Append form data
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('point', formData.point);
      data.append('paymentStatus', formData.paymentStatus);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('amount', formData.amount);
      data.append('paymentMethod', formData.paymentMethod);
      data.append('paymentId', formData.paymentId);
      data.append('isVeg', formData.isVeg);
  
      // Append userType and group if applicable
      if (userType === 'group') {
        data.append('group', selectedGroup);
      } else {
        data.append('group', ''); // Send an empty string or omit if not grouping
      }
  
      // Append plan array
      formData.plan.forEach((item) => data.append('plan[]', item));
  
      // Append images to remove
      imagesToRemove.forEach((url) => {
        if (url) {
          data.append('imagesToRemove', url);
        }
      });
  
      // Append new images
      images.forEach((image) => {
        data.append('images', image);
      });
  
      const response = await axios.put(`${BaseUrl}/api/updateUser/${user._id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        // Handle success
        Swal.fire('Success', 'User updated successfully', 'success');
        navigate(-1); // Go back to the previous page
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status === 400) {
        Swal.fire('Error', error.response.data.message, 'error');
      } else {
        Swal.fire('Error', 'Error updating user', 'error');
      }
    }
  };
  


  // Submit leave form
  const handleLeaveSubmit = async (leaveFormData) => {
    const { leaveStart, leaveEnd, meals } = leaveFormData;
  console.log('dd',leaveFormData)
    if (!meals || meals.length === 0) {
      Swal.fire('Error', 'Please select at least one meal.', 'error');
      return;
    }
  
    try {
      const response = await axios.post(`${BaseUrl}/api/addLeave/${user.latestOrder._id}`, {
        leaveStart,
        leaveEnd,
        meals,
      });
      if (response.status === 200) {
        dispatch(fetchCustomers());
        Swal.fire('Success', 'Leave added successfully', 'success');
        fetchUserById(user._id);
        setLeaveFormData({ leaveStart: '', leaveEnd: '', meals: [] }); // Reset form data
      } else {
        Swal.fire('Error', response.data.message || 'Error adding leave', 'error');
      }
    } catch (error) {
      console.error('Error adding leave:', error.response?.data?.message || error.message);
      if (error.response && error.response.status === 400) {
        Swal.fire('Error', error.response.data.message, 'error');
      } else {
        Swal.fire('Error', 'An error occurred while adding leave.', 'error');
      }
    }
  };

  // Handle Edit Leave
  const handleEditLeave = async (leave) => {
    try {
      const response = await axios.put(
        `${BaseUrl}/api/editLeave/${user.latestOrder._id}/${leave._id}`,
        {
          leaveStart: leave.start,
          leaveEnd: leave.end,
          meals: leave.meals,
        });
      if (response.status === 200) {
        dispatch(fetchCustomers());
        Swal.fire('Success', 'Leave updated successfully', 'success');
        fetchUserById(user._id);
      } else {
        Swal.fire('Error', response.data.message || 'Error updating leave', 'error');
      }
    } catch (error) {
      console.error('Error updating leave:', error.response?.data?.message || error.message);
      Swal.fire('Error', 'An error occurred while updating leave.', 'error');
    }
  };

  // Handle Delete Leave
  const handleDeleteLeave = async (leaveId) => {
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
          const response = await axios.delete(`${BaseUrl}/api/deleteLeave/${user.latestOrder._id}/${leaveId}`);
          if (response.status === 200) {
            dispatch(fetchCustomers());
            Swal.fire('Deleted!', 'Leave has been deleted.', 'success');
            fetchUserById(user._id);
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


  // Handle Delete or Block
  const handleDelete = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Trash user',
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: 'Block',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BaseUrl}/api/users/${user._id}`);
          if (response.status === 200) {
            dispatch(fetchCustomers());
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            navigate('/dashboard/home');
          } else {
            Swal.fire('Error!', 'Cannot delete user.', 'error');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire('Error!', 'An error occurred while deleting the user.', 'error');
        }
      } else if (result.isDenied) {
        try {
          const response = await axios.put(`${BaseUrl}/api/trashUser/${user._id}`);
          if (response.status === 200) {
            setIsEditing(false);
            Swal.fire('Blocked!', 'User has been blocked.', 'success');
          } else {
            Swal.fire('Error!', 'Cannot trash user.', 'error');
          }
        } catch (error) {
          console.error('Error trashing user:', error);
          Swal.fire('Error!', 'An error occurred while trashing the user.', 'error');
        }
      }
    });
  };

  // Format Date
  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Date Constraints
  const today = new Date();
  const twentyDaysAgo = new Date(today);
  twentyDaysAgo.setDate(today.getDate() - 29);
  const twentyDaysAgoISO = twentyDaysAgo.toISOString().split('T')[0];

  if (!user) {
    return <div>Loading...</div>;
  }

  const latestOrder = user.latestOrder || {};
  const filteredLeaves = (latestOrder.leave || []).filter(leave => new Date(leave.end) <= new Date());

  return (
    <div className="flex justify-center mb-12">
      <Card className="w-full">
      
   {/* Add New Point Modal */}
   <AddNewPointModal
          open={openPointModal}
          handleClose={() => {
            setOpenPointModal(false);
            setModalHeader('Add New Point');
            setNewPoint({ place: '', mode: 'single' });
          }}
          newPoint={newPoint}
          handleNewPointChange={handleNewPointChange}
          handleSelectChange={handleSelectChange}
          handleAddNewPoint={handleAddNewPoint}
          modalHeader={modalHeader}
        />

        <form onSubmit={handleSubmit}>
          <CardBody className="">





          
              {isEditing ? (
                <>
                 <div className="flex justify-end items-center mb-4">
                <Button
                  color="orange"
                  variant="text"
                  className="flex items-center gap-2"
                  onClick={() => setOpenPointModal(true)}
                >
                  <PlusIcon className="w-5 h-5" /> New Point
                </Button>
              </div>
                </>
              ) : (
                <>
                 <div className="items-center mb-4">
                   <Menu>
      {/* Hamburger Icon */}
      <div className="flex justify-between items-center">
        
      <Typography variant="small" className='font-semibold bg-gradient-to-r  from-gray-200 to-teal-900 w-20 rounded h-6 capitalize text-white ' align="center" >{latestOrder?.status}</Typography>
      <MenuHandler>
        <IconButton className="bg-teal-900 hover:bg-gray-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 7.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </IconButton>
      </MenuHandler>
      </div>
      {/* Dropdown Menu */}
      <MenuList className="bg-white shadow-md rounded-lg border border-teal-100">
        <MenuItem onClick={handleEditClick} className="bg-gradient-to-r from-white mb-1 hover:bg-teal-200">
          Edit
        </MenuItem>
        {(latestOrder.status === "active" || latestOrder.status === "leave") && (
          <MenuItem onClick={handleLeaveClick} className="bg-gradient-to-r from-white mb-1 hover:bg-teal-200">
            Leave
          </MenuItem>
        )}
        <MenuItem
          onClick={() => navigate(`/dashboard/userOrder/${user._id}`, {})}
          className="bg-gradient-to-r from-white mb-1 hover:bg-teal-200"
        >
          Orders
        </MenuItem>
        <MenuItem
         onClick={handleDelete}
          className="bg-gradient-to-r from-white hover:bg-teal-200"
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu></div>
                </>
              )}
           






{!showLeaveSection && (
  <>
    {/* Profile Picture */}
    <div className="mb-4 flex items-center justify-center">
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "bold",
          marginRight: "10px",
        }}
      >
        {formData.name
          ? formData.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : "NN"}
      </div>
  
    </div>



          
{/* Existing Images */}
{existingImages.length > 0 && (
  <div className="mb-4 flex justify-center">

    <div className="flex mt-2 space-x-2">
  
      {existingImages.map((src, index) => (
        <div key={index} className="relative">
          <img
            src={src}
            alt={`Existing Image ${index + 1}`}
            className="w-24 h-24 object-cover rounded"
          />
          {isEditing && (
            <button
              type="button"
              className="absolute top-0 right-0 text-white rounded-full p-1"
              onClick={() => handleRemoveExistingImage(src)}
            >
              &times;
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)}




    {/* Name Input */}
    <div className="mb-4">
      <Input
        type="text"
        name="name"
        label="Name"
        // variant="standard"
        value={formData.name}
        onChange={handleChange}
        required={isEditing ? true : undefined}
        disabled={!isEditing}
      />
    </div>

    {/* Phone Number Input */}
    <div className="mb-4">
      <Input
        type="number"
        name="phone"
        label="Phone Number"
        value={formData.phone}
        pattern="\d{10}"
        maxLength="10"
        onChange={handleChange}
        required={isEditing ? true : undefined}
        disabled={!isEditing}
      />
    </div>

    {/* Point Input with Suggestions */}
    <div className="mb-4 relative">
      <Input
        type="text"
        name="point"
        label="Point"
        value={pointInputValue}
        onChange={handleChange}
        required={isEditing ? true : undefined}
        disabled={!isEditing}
      />
      {showSuggestions && isEditing && (
        <ul className="absolute bg-white border border-gray-300 w-full mt-1 max-h-40 overflow-y-auto z-10">
          {filteredPoints.map((pt) => (
            <li
              key={pt._id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSuggestionClick(pt)}
            >
              {pt.place} ({pt.mode})
            </li>
          ))}
        </ul>
      )}
    </div>
  </>
)}

         
            



{/* Image Upload */}
{isEditing && (
             <div className="mb-4">
           
           <Input
  type="file"
  label={existingImages.length > 0 ? 'Add More Images' : 'Upload Images (Maximum 3)'}
  name="images"
  multiple
  accept="image/*"
  onChange={handleImageChange}
  disabled={!isEditing}
  className="
    file:border-none
    file:bg-gray-200 
    file:text-gray-700 
    file:rounded-md 
    file:focus:outline-none 
    text-gray-800 
    border border-gray-300 
    rounded-md 
    p-2 
    w-full 
    disabled:cursor-not-allowed 
    disabled:bg-gray-100 
    disabled:border-gray-300
  "
/>


           
             {/* Image Previews */}
             <div className="flex mt-2 space-x-2">
               {imagePreviews.map((src, index) => (
                 <div key={index} className="relative">
                   <img
                     src={src}
                     alt={`New Image Preview ${index + 1}`}
                     className="w-24 h-24 object-cover rounded"
                   />
                   <button
                     type="button"
                     className="absolute top-0 right-0 text-white rounded-full p-1"
                     onClick={() => handleRemoveNewImage(index)}
                   >
                     &times;
                   </button>
                 </div>
               ))}
             </div>
           </div>
            )}



{/* User Type Selection */}
{isEditing && (
  <div className="mb-4">
    <Select
      label="User Type"
      value={userType}
      onChange={(value) => {
        setUserType(value);
        if (value === 'individual') {
          setSelectedGroup('');
        }
      }}
      required
      disabled={!isEditing}
    >
      <Option value="individual">Individual</Option>
      <Option value="group">Group</Option>
    </Select>
  </div>
)}

{/* Group Selection (Conditional) */}
{userType === 'group' && isEditing && (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">Select Group</label>
    <div 
      className={`relative ${!formData.point ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        if (formData.point) {
          setDropdownOpen(!dropdownOpen); // Toggle dropdown
        }
      }}
    >
      {/* Selected Value */}
      <div 
        className={`bg-white border border-gray-300 rounded px-3 py-2 cursor-pointer ${
          !formData.point ? 'pointer-events-none' : ''
        }`}
      >
        {selectedGroup
          ? filteredGroups.find((group) => group._id === selectedGroup)?.title || 'Select a Group'
          : 'Select a Group'}
      </div>

      {/* Dropdown Options */}
      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group._id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedGroup(group._id); // Set selected group
                  setDropdownOpen(false); // Close dropdown
                }}
              >
                {group.title} - {group.location}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No Groups Available</div>
          )}
        </div>
      )}
    </div>
  </div>
)}

            


            

          




       

          {/* Action Buttons */}
          <div className="flex justify-between">
              {isEditing ? (
                <>
                  
                  <Button type="submit" color="green">
                    Save
                  </Button>

                  <Button color="red" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                
                </>
              )}
            </div>

            {/* Leave Section */}
            {showLeaveSection && (
              <LeaveSection
                leaves={latestOrder.leave || []}
                formatDate={formatDate}
                handleLeaveSubmit={handleLeaveSubmit}
                handleEditLeave={handleEditLeave}
                handleDeleteLeave={handleDeleteLeave}
                plan={formData.plan}
            
              />
            )}
          </CardBody>
        </form>
      </Card>
    </div>
  );
}

export default Edit;
