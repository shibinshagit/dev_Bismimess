import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BaseUrl } from '../../constants/BaseUrl';
import './swal.css';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Checkbox,
  List,
  ListItem,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Option,
  Select
} from "@material-tailwind/react";
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '@/redux/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

function Edit() {
  const location = useLocation();
  const user = location.state.user || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLeaveSection, setShowLeaveSection] = useState(false);

  const [pointsList, setPointsList] = useState([]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });
  const [modalHeader, setModalHeader] = useState('Add New Point');
  const [pointInputValue, setPointInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPoints, setFilteredPoints] = useState([]);

  const [leaveFormData, setLeaveFormData] = useState({ leaveStart: '', leaveEnd: '' });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    point: null, // Store point ID
    plan: [],
    paymentStatus: false,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPoints();
  }, []);

  useEffect(() => {
    if (pointsList.length > 0) {
      initializeFormData();
    }
  }, [user, pointsList]); // Runs when either user or pointsList changes and pointsList is populated

  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };

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
      paymentStatus: user.paymentStatus || false,
      startDate: formatDate(latestOrder.orderStart) || '',
      endDate: formatDate(latestOrder.orderEnd) || '',
    });
    setPointInputValue(userPoint ? userPoint.place : '');
    if (latestOrder.leave) {
      const activeLeave = latestOrder.leave.find(
        (leave) => new Date(leave.end) > new Date()
      );
      if (activeLeave) {
        setLeaveFormData({
          leaveStart: formatDate(activeLeave.start),
          leaveEnd: formatDate(activeLeave.end)
        });
      }
    }
  };

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
    }
  };

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

  const handlePlanChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevFormData) => {
      const updatedPlan = checked
        ? [...prevFormData.plan, value]
        : prevFormData.plan.filter((plan) => plan !== value);
      return { ...prevFormData, plan: updatedPlan };
    });
  };

  const handleSuggestionClick = (point) => {
    setFormData({
      ...formData,
      point: point._id,
    });
    setPointInputValue(point.place);
    setShowSuggestions(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    initializeFormData();
  };

  const handleLeaveClick = () => {
    setShowLeaveSection(!showLeaveSection);
  };

  const handleLeaveInputChange = (e) => {
    const { name, value } = e.target;

    setLeaveFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.point) {
      setModalHeader('The entered point is not existing, you can add now');
      setNewPoint({ ...newPoint, place: pointInputValue });
      setOpenPointModal(true);
      return;
    }

    axios.put(`${BaseUrl}/api/updateUser/${user._id}`, formData)
      .then(response => {
        if (response.status === 200) {
          dispatch(fetchCustomers());
          alert('User updated successfully');
          window.history.back(); // This will take the user to the previous page
        }
        else if (response.status === 204) {
          alert('Fill all order data');
        }
        else {
          alert(response.data.message);
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          alert('Phone number already exists');
        }
        else {
          console.error('There was an error updating the user:', error);
          alert('Error updating user');
        }
      });
  };

  const handleLeaveSubmit = () => {
    const { leaveStart, leaveEnd } = leaveFormData;

    axios.post(`${BaseUrl}/api/addLeave/${user.latestOrder._id}`, {
      leaveStart,
      leaveEnd
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(fetchCustomers());
          alert('Leave updated successfully');
        } else {
          alert('Error updating leave');
        }
      })
      .catch(error => {
        console.error('Error updating leave:', error);
        alert('Error updating leave');
      });
  };

  const handleDelete = (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Select an option',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: 'Block',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${BaseUrl}/api/deleteUser/${user._id}`)
          .then(response => {
            if (response.status === 200) {
              dispatch(fetchCustomers());
              Swal.fire('Deleted!', 'User has been deleted.', 'success');
              navigate('/dashboard/home');
            } else {
              Swal.fire('Error!', 'Cannot delete user.', 'error');
            }
          })
          .catch(error => {
            console.error('Error deleting user:', error);
            Swal.fire('Error!', 'An error occurred while deleting the user.', 'error');
          });
      } else if (result.isDenied) {
        axios.put(`${BaseUrl}/api/trashUser/${user._id}`)
          .then(response => {
            if (response.status === 200) {
              setIsEditing(false);
            } else {
              Swal.fire('Error!', 'Cannot trash user.', 'error');
            }
          })
          .catch(error => {
            console.error('Error trashing user:', error);
            Swal.fire('Error!', 'An error occurred while trashing the user.', 'error');
          });
      }
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
    <div className="flex justify-center my-12">
      <Card className="w-full max-w-lg">
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Edit User
          </Typography>
        </CardHeader>

        {/* Add New Point Modal */}
        <Dialog open={openPointModal} handler={setOpenPointModal} size="sm">
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
              onChange={(value) => handleSelectChange(value)}
            >
              <Option value="single">Single</Option>
              <Option value="cluster">Cluster</Option>
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
            <Button
              variant="filled"
              color="green"
              onClick={handleAddNewPoint}
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        <form onSubmit={handleSubmit}>
          <CardBody className="p-6">
            <div className="mb-4">
              <Input
                type="text"
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={!isEditing}
              />
            </div>
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
                disabled={!isEditing}
              />
            </div>

            <div className="mb-4 relative">
              <Input
                type="text"
                name="point"
                label="Point"
                value={pointInputValue}
                onChange={handleChange}
                required
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

            {isEditing && (
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
            )}

            <div className="mb-4">
              <Checkbox
                name="paymentStatus"
                label="Paid"
                checked={formData.paymentStatus}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            {formData.paymentStatus && (
              <>
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
                      disabled={!isEditing}
                    />
                    <Checkbox
                      name="plan"
                      label="Lunch"
                      value="L"
                      checked={formData.plan.includes('L')}
                      onChange={handlePlanChange}
                      disabled={!isEditing}
                    />
                    <Checkbox
                      name="plan"
                      label="Dinner"
                      value="D"
                      checked={formData.plan.includes('D')}
                      onChange={handlePlanChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Input
                    type="date"
                    name="startDate"
                    label="Start Date"
                    value={formData.startDate}
                    min={twentyDaysAgoISO}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-4">
                  <Input
                    type="date"
                    name="endDate"
                    label="End Date"
                    value={formData.endDate}
                    readOnly
                    required
                    disabled
                  />
                </div>
              </>
            )}
            <div className="flex justify-between">
              {isEditing ? (
                <>
                  <Button type="button" color="red" className="mr-2" onClick={handleDelete}>
                    Delete
                  </Button>
                  <Button type="submit" color="green">
                    Save
                  </Button>

                  <Button color="red" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEditClick}>Edit</Button>
                  {(latestOrder.status === 'active' || latestOrder.status === 'leave') && (
                    <Button onClick={handleLeaveClick}>Leave</Button>
                  )}
                </>
              )}
            </div>
            {showLeaveSection && (
              <div className="mt-4">
                {latestOrder.leave?.length > 0 ? (
                  <List>
                    {filteredLeaves.length === 0 ? (
                      <Typography>No leave entries found.</Typography>
                    ) : (
                      <>
                        <Typography variant="h6" color="blue-gray" className="mb-2">
                          Completed Leaves
                        </Typography>
                        {filteredLeaves.map((leave, index) => (
                          <ListItem key={index} className="mb-2 bg-yellow-400">
                            <Typography color='black'>{`Leave Start: ${formatDate(leave.start)}, Leave End: ${formatDate(leave.end)}, Leaves: ${leave.numberOfLeaves}`}</Typography>
                          </ListItem>
                        ))}
                      </>
                    )}
                  </List>
                ) : (
                  <Typography>No completed Leaves available</Typography>
                )}
                <Typography variant="h6" color="blue-gray" className="mt-4 mb-2">
                  Add Leave
                </Typography>
                <div className="mb-4">
                  <Input
                    type="date"
                    name="leaveStart"
                    label="Leave Start Date"
                    value={leaveFormData.leaveStart || ''}
                    onChange={handleLeaveInputChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    type="date"
                    name="leaveEnd"
                    label="Leave End Date"
                    value={leaveFormData.leaveEnd || ''}
                    onChange={handleLeaveInputChange}
                    required
                  />
                </div>
                <Button color="blue" onClick={handleLeaveSubmit}>
                  Submit Leave
                </Button>
                <Typography variant="body2" color="blue-gray" className="mt-4">
                  Total Leaves: {latestOrder.leave?.reduce((sum, leave) => sum + leave.numberOfLeaves, 0) || 0}
                </Typography>
              </div>
            )}
          </CardBody>
        </form>
      </Card>
    </div>
  );
}

export default Edit;
