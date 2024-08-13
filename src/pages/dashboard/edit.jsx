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
  ListItem
} from "@material-tailwind/react";
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '@/redux/reducers/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

function Edit() {
  const location = useLocation();
  const user = location.state.user || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showLeaveSection, setShowLeaveSection] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestedPlaces = ['Brototype', 'Vytila', 'Infopark'];


  const todays = new Date();
  todays.setHours(0, 0, 0, 0); // Reset time to midnight
  const tomorrows= new Date(todays);
  tomorrows.setDate(todays.getDate() + 2); // Set to tomorrow
  const formattedToday = todays.toISOString().split('T')[0]; // Format today as yyyy-mm-dd
  const formattedTomorrow = tomorrows.toISOString().split('T')[0]; // Format tomorrow as yyyy-mm-dd
  


  const [leaveFormData, setLeaveFormData] = useState({leaveStart: '', leaveEnd: ''});
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    place: '',
    plan: [],
    paymentStatus: false,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    const latestOrder = user.latestOrder || {};
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      place: user.place || '',
      plan: latestOrder.plan || [],
      paymentStatus: user.paymentStatus || false,
      startDate: formatDate(latestOrder.orderStart) || '',
      endDate: formatDate(latestOrder.orderEnd) || '',
    });
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
  }, [user]);
// ========================================================================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'phone' && value.length > 10) {
      return;
    }

    if (name === 'startDate') {
      // const startDate = new Date(value);
      // const endDate = new Date(startDate);
      // endDate.setDate(endDate.getDate() + 29);
      const startDate = new Date(value); 
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      if (endDate.getDate() !== startDate.getDate()) {
      endDate.setDate(0)}
      endDate.setDate(endDate.getDate() - 1);

      setFormData({
        ...formData,
        startDate: value,
        endDate: endDate.toISOString().split('T')[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }

    if (name === 'place') {
      setShowSuggestions(value.length > 0);
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

  const handleSuggestionClick = (place) => {
    setFormData({
      ...formData,
      place,
    });
    setShowSuggestions(false);
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
// update ========================================================================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`${BaseUrl}/api/updateUser/${user._id}`, formData)
      .then(response => {
        if (response.status === 200) {
          dispatch(fetchCustomers());
          alert('User updated successfully');
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
// leave========================================================================================================
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
// delete========================================================================================================
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
  // ========================================================================================================

  const today = new Date();
  const twentyDaysAgo = new Date(today);
  const tommorrow = new Date(today);
  tommorrow.setDate(today.getDate() + 1);
  twentyDaysAgo.setDate(today.getDate() - 29);
  const todayISO = today.toISOString().split('T')[0];
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
            <div className="mb-4">
              <Input
                type="text"
                name="place"
                label="Place"
                value={formData.place}
                onChange={handleChange}
                required
                disabled={!isEditing}
              />
              {showSuggestions && (
                <List className="border rounded shadow-lg mt-2">
                  {suggestedPlaces
                    .filter((place) =>
                      place.toLowerCase().includes(formData.place.toLowerCase())
                    )
                    .map((place, index) => (
                      <ListItem
                        key={index}
                        onClick={() => handleSuggestionClick(place)}
                        className="cursor-pointer"
                      >
                        {place}
                      </ListItem>
                    ))}
                </List>
              )}
            </div>

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
                    min={twentyDaysAgoISO} // restricts start date before today
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
                    readOnly // disables entering the end date manually
                    required
                    disabled
                  />
                </div>
              </>
            )}
            <div className="flex justify-between">
              {isEditing ? (
                <>  <Button type="button" color="red" className="mr-2" onClick={handleDelete}>
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
                { latestOrder.leave?.length > 0 ? (
                  <List>
                 
                 {filteredLeaves.length === 0 ? (
      <Typography>No leave entries found.</Typography>
    ) : (
    <> 
      <Typography variant="h6" color="blue-gray" className="mb-2">
                  Completed Leaves
                </Typography>
    { filteredLeaves.map((leave, index) => (
      <ListItem key={index} className="mb-2 bg-yellow-400">
      <Typography color='black'>{`Leave Start: ${formatDate(leave.start)}, Leave End: ${formatDate(leave.end)}, Leaves: ${leave.numberOfLeaves}`}</Typography>
    </ListItem>
    
      ))}</>
    )}
                  </List>
                ) : (
                  <Typography>No completed Leaves available</Typography>
                )}
                <Typography variant="h6" color="blue-gray" className="mt-4 mb-2">
                  Active Leave
                </Typography>
                <div className="mb-4">
      {console.log('values:', formData.endDate, formattedTomorrow, leaveFormData.leaveStart, leaveFormData.leaveEnd)}
      <Input
        type="date"
        name="leaveStart"
        label="Leave Start Date"
        value={leaveFormData.leaveStart || ''}
        onChange={handleLeaveInputChange}
        min={formattedTomorrow} // Set minimum date to tomorrow
        max={formData.endDate || ''} // Ensure endDate is formatted
        required
        disabled={new Date(leaveFormData.leaveStart) <= new Date(formattedToday) && new Date(leaveFormData.leaveEnd) > new Date(formattedToday)}
      />
    </div>
    <div className="mb-4">
      <Input
        type="date"
        name="leaveEnd"
        label="Leave End Date"
        value={leaveFormData.leaveEnd || ''}
        onChange={handleLeaveInputChange}
        min={leaveFormData.leaveStart || formattedTomorrow} // Set minimum to leaveStart or tomorrow
        max={formData.endDate || ''} // Ensure endDate is formatted
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
