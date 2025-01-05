// src/components/Add.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../constants/BaseUrl';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Checkbox,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Option,
  Select,
  Switch,
} from "@material-tailwind/react";
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '@/redux/reducers/authSlice';
import { PlusIcon } from 'lucide-react';
import Swal from 'sweetalert2';

function Add() {
  const [images, setImages] = useState([]); // Store selected images
  const [imagePreviews, setImagePreviews] = useState([]); // Store image previews
  const [pointsList, setPointsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]); // Store all groups
  const [filteredGroups, setFilteredGroups] = useState([]); // Groups filtered by selected point
  const [selectedGroup, setSelectedGroup] = useState(''); // Selected group ID
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalHeader, setModalHeader] = useState('Add New Point');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    point: null,
    plan: [],
    paymentStatus: 'pending', // Default to 'pending'
    startDate: '',
    endDate: '',
    amount: '',
    paymentMethod: '',
    paymentId: '',
    isVeg: false,
  });
  const [pointInputValue, setPointInputValue] = useState(''); // New state for point input value
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [error, setError] = useState(null); // State for error handling
  const [userType, setUserType] = useState('individual'); // 'individual' or 'group'

  const dispatch = useDispatch();

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

  // Fetch Groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/groups`);
      setGroupsList(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire('Error', 'Failed to fetch groups.', 'error');
    }
  };

  useEffect(() => {
    fetchPoints();
    fetchGroups(); // Fetch groups on component mount
  }, []);

  // Handle New Point Input Change
  const handleNewPointChange = (e) => {
    const { name, value } = e.target;
    setNewPoint((prevPoint) => ({
      ...prevPoint,
      [name]: value,
    }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      Swal.fire('Error', 'You can only upload a maximum of 3 images.', 'error');
      return;
    }

    setImages(files);

    // Generate image previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle User Type Change
  const handleUserTypeChange = (value) => {
    setUserType(value);
    if (value === 'individual') {
      setSelectedGroup('');
    }
  };

  // Handle Select Change for Point
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
      const filtered = pointsList.filter((point) =>
        point.place.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredPoints(filtered);
      setShowSuggestions(inputValue.length > 0 && filtered.length > 0);

      // Reset formData.point if input doesn't match any point exactly
      const exactMatch = pointsList.find(
        (point) => point.place.toLowerCase() === inputValue.toLowerCase()
      );
      const selectedPointId = exactMatch ? exactMatch._id : null;
      setFormData({
        ...formData,
        point: selectedPointId,
      });
      // Filter groups based on the selected point
      if (selectedPointId) {
        const relevantGroups = groupsList.filter(group => group.point._id === selectedPointId);
        setFilteredGroups(relevantGroups);
      } else {
        setFilteredGroups([]);
      }

      // If userType is group, reset selectedGroup
      if (userType === 'group') {
        setSelectedGroup('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  // Handle Plan Change
  const handlePlanChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevFormData) => {
      const updatedPlan = checked
        ? [...prevFormData.plan, value]
        : prevFormData.plan.filter((plan) => plan !== value);
      return { ...prevFormData, plan: updatedPlan };
    });
  };

  // Handle Submit New Point
  const handleAddNewPoint = async () => {
    if (!newPoint.place.trim()) {
      Swal.fire('Error', 'Place is required.', 'error');
      return;
    }
    try {
      const response = await axios.post(`${BaseUrl}/api/points`, newPoint);
      const addedPoint = response.data.point;
      setPointsList([...pointsList, addedPoint]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        point: addedPoint._id,
      }));
      setPointInputValue(addedPoint.place);
      setOpenPointModal(false);
      setModalHeader('Add New Point');
      setNewPoint({ place: '', mode: 'single' });

      // Update filtered groups if userType is group
      if (userType === 'group') {
        const relevantGroups = groupsList.filter(group => group.point._id === addedPoint._id);
        setFilteredGroups(relevantGroups);
      }
    } catch (error) {
      console.error("Error adding new point:", error);
      Swal.fire('Error', 'Failed to add new point.', 'error');
    }
  };

  // Handle Form Submission
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
      data.append('userType', userType); // New field
      if (userType === 'group') {
        data.append('group', selectedGroup); // New field
      }

      // Append plan array
      formData.plan.forEach((item) => data.append('plan[]', item));

      // Append images
      images.forEach((image) => {
        data.append('images', image);
      });

      const response = await axios.post(`${BaseUrl}/api/postOrder`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Swal.fire('Success', 'User added successfully', 'success');
        // Reset form data
        setFormData({
          name: '',
          phone: '',
          point: null,
          plan: [],
          paymentStatus: 'pending',
          startDate: '',
          endDate: '',
          amount: '',
          paymentMethod: '',
          paymentId: '',
          isVeg: false,
        });
        setPointInputValue('');
        setSelectedGroup('');
        setImages([]);
        setImagePreviews([]);
        setUserType('individual'); // Reset to default
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      console.error('There was an error adding the user:', error);
      if (error.response && error.response.data) {
        setError(error.response.data);
      } else {
        setError({ message: 'An unexpected error occurred' });
      }
    }
  };

  // Handle Suggestion Click
  const handleSuggestionClick = (point) => {
    setFormData({
      ...formData,
      point: point._id,
    });
    setPointInputValue(point.place);
    setShowSuggestions(false);

    // Filter groups based on the selected point
    const relevantGroups = groupsList.filter(group => group.point._id === point._id);
    setFilteredGroups(relevantGroups);

    // If userType is group, reset selectedGroup
    if (userType === 'group') {
      setSelectedGroup('');
    }
  };

  // Handle Add/Edit/Delete Group Actions (Not modified)

  const today = new Date();
  const twentyDaysAgo = new Date(today);
  twentyDaysAgo.setDate(today.getDate() - 29);
  const twentyDaysAgoISO = twentyDaysAgo.toISOString().split('T')[0];

  return (
    <div className="flex justify-center my-12">
      <Card className="w-full max-w-lg">
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Add User
          </Typography>
        </CardHeader>
        {/* Add New Point Modal */}
        <Dialog open={openPointModal} handler={setOpenPointModal} size="sm">
          <DialogHeader
            className={modalHeader.includes('not existing') ? 'text-red-500' : ''}
          >
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
              onChange={(value) => handleSelectChange(value)}
            >
              <Option value="single">Single</Option>
              <Option value="bulk">Bulk</Option>
            </Select>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={() => {
                setOpenPointModal(false);
                setModalHeader('Add New Point');
                setNewPoint({ place: '', mode: 'single' });
              }}
            >
              Cancel
            </Button>
            <Button variant="filled" color="green" onClick={handleAddNewPoint}>
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Error Modal */}
        {error && (
          <Dialog open={!!error} handler={() => setError(null)} size="sm">
            <DialogHeader className="text-red-500">Error</DialogHeader>
            <DialogBody>
              <Typography>{error.message}</Typography>
              {error.user && (
                <div>
                  <Typography>Name: {error.user.name}</Typography>
                  <Typography>Phone: {error.user.phone}</Typography>
                  <Typography>
                    Deleted: {error.user.isDeleted ? 'Yes' : 'No'}
                  </Typography>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="text" color="red" onClick={() => setError(null)}>
                Close
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        <form onSubmit={handleSubmit}>
          <CardBody className="p-6">
            {/* User Type Selection */}
            <div className="mb-4">
              <Select
                label="User Type"
                value={userType}
                onChange={(value) => handleUserTypeChange(value)}
                required
              >
                <Option value="individual">Individual</Option>
                <Option value="group">Group</Option>
              </Select>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <Input
                type="text"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Input */}
            <div className="mb-4">
              <Input
                type="number"
                name="phone"
                label="Phone Number"
                value={formData.phone}
                pattern="\d{10}"
                maxLength="10"
                onChange={handleChange}
                required
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
                required
              />
              {showSuggestions && (
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

            {/* Group Selection (Conditional) */}
            {userType === 'group' && (
  <div className="mb-4">
    {console.log('j', selectedGroup)}
    <label className="block text-sm font-medium mb-1">Select Group</label>
    <div 
      className={`relative ${!formData.point ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        if (formData.point) {
          setDropdownOpen(!dropdownOpen);
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
                  setSelectedGroup(group._id);
                  setDropdownOpen(false);
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

            <div className="flex justify-between items-center mb-4">
              <Button
                color="orange"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setOpenPointModal(true)}
              >
                <PlusIcon className="w-5 h-5" /> New Point
              </Button>
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <Typography variant="small" className="font-semibold mb-2">
                Upload Drop-off Area Images (Maximum 3)
              </Typography>
              <Input
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {/* Image Previews */}
              <div className="flex mt-2 space-x-2">
                {imagePreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>

            {/* Payment Status Select */}
            <div className="mb-4">
              <Select
                name="paymentStatus"
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={(value) =>
                  setFormData({ ...formData, paymentStatus: value })
                }
                required
              >
                <Option value="success">Success</Option>
                <Option value="failed">Failed</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </div>

            {/* Plan Selection (Always Displayed) */}
            <div className="mb-4">
              <Typography variant="small" className="font-semibold mb-2">
                Plan
              </Typography>
              <div className="flex flex-col gap-2">
                <Checkbox
                  name="plan"
                  label="Breakfast"
                  value="B"
                  checked={formData.plan.includes('B')}
                  onChange={handlePlanChange}
                />
                <Checkbox
                  name="plan"
                  label="Lunch"
                  value="L"
                  checked={formData.plan.includes('L')}
                  onChange={handlePlanChange}
                />
                <Checkbox
                  name="plan"
                  label="Dinner"
                  value="D"
                  checked={formData.plan.includes('D')}
                  onChange={handlePlanChange}
                />
              </div>
            </div>

            {/* Start Date (Always Displayed) */}
            <div className="mb-4">
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                value={formData.startDate}
                min={twentyDaysAgoISO}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Date (Always Displayed) */}
            <div className="mb-4">
              <Input
                type="date"
                name="endDate"
                label="End Date"
                value={formData.endDate}
                readOnly
                required
              />
            </div>

            {/* Veg Toggle (Always Displayed) */}
            <div className="flex items-center mb-4">
              <Typography variant="small" className="mr-2">
                Veg
              </Typography>
              <Switch
                checked={formData.isVeg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isVeg: e.target.checked,
                  })
                }
              />
            </div>

            {/* Conditionally render payment-related fields */}
            {formData.paymentStatus !== 'pending' && (
              <>
                {/* Amount */}
                <div className="mb-4">
                  <Input
                    type="number"
                    name="amount"
                    label="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                {/* Payment Method Select */}
                <div className="mb-4">
                  <Select
                    name="paymentMethod"
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        paymentMethod: value,
                        paymentId: '', // Reset paymentId when paymentMethod changes
                      })
                    }
                    required
                  >
                    <Option value="Cash">Cash</Option>
                    <Option value="Bank">Bank</Option>
                    <Option value="Online">Online</Option>
                  </Select>
                </div>

                {/* Payment ID Input */}
                <div className="mb-4">
                  <Input
                    type="text"
                    name="paymentId"
                    label="Payment ID"
                    value={formData.paymentId}
                    onChange={handleChange}
                    required={formData.paymentMethod !== 'Cash'}
                    disabled={formData.paymentMethod === 'Cash'}
                  />
                </div>
              </>
            )}
          </CardBody>
          <div className="flex justify-end p-6">
            <Button
              type="button"
              color="red"
              className="mr-2"
              onClick={() => {
                setFormData({
                  name: '',
                  phone: '',
                  point: null,
                  plan: [],
                  paymentStatus: 'pending',
                  startDate: '',
                  endDate: '',
                  amount: '',
                  paymentMethod: '',
                  paymentId: '',
                  isVeg: false,
                });
                setPointInputValue('');
                setSelectedGroup('');
                setImages([]);
                setImagePreviews([]);
                setUserType('individual'); // Reset to default
              }}
            >
              Clear
            </Button>
            <Button type="submit" color="green">
              Submit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default Add;