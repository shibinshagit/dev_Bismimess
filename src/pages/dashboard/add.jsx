import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../constants/BaseUrl';
import { io } from 'socket.io-client';
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

function Add() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    place: '',
    plan: [],
    paymentStatus: false,
    startDate: '',
    endDate: '',
  });

  // socket=======================================================================================================================
  const socket = io(`${BaseUrl}`);

  useEffect(() => {
    // Listen for updates from the server
    socket.on('dataUpdated', (newData) => {
      console.log('Received data update:', newData);
      // Dispatch an action to update the state
      dispatch(fetchCustomers()); // Replace with your actual action to refresh data
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);






  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestedPlaces = ['Brototype', 'Vytila', 'Infopark'];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${BaseUrl}/api/postorder`, formData)
      .then(response => {
        if (response.status === 200) {
          dispatch(fetchCustomers());
          alert('User added successfully');
          setFormData({
            name: '',
            phone: '',
            place: '',
            plan: [],
            paymentStatus: false,
            startDate: '',
            endDate: ''
          })
        } else {
          alert(response.data.message);
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          alert('Phone number already exists');
        } else if (error.response && error.response.status === 204) {
          alert('Fill all order data');
        }
        else {
          console.error('There was an error adding the user:', error);
          alert('Error adding user');
        }
      });
  };

  const handleSuggestionClick = (place) => {
    setFormData({
      ...formData,
      place,
    });
    setShowSuggestions(false);
  };

  // const today = new Date().toISOString().split('T')[0]; 
// ============================================================================================Date change
  const today = new Date();
const twentyDaysAgo = new Date(today);
twentyDaysAgo.setDate(today.getDate() - 29);
const todayISO = today.toISOString().split('T')[0];
const twentyDaysAgoISO = twentyDaysAgo.toISOString().split('T')[0];
// =============================================================================================
  return (
    <div className="flex justify-center my-12">
      <Card className="w-full max-w-lg">
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Add User
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
                <div className="mb-4">
                  <Input
                    type="date"
                    name="startDate"
                    label="Start Date"
                    value={formData.startDate}
                    // min={today} 
                    min={twentyDaysAgoISO} 
                    onChange={handleChange}
                    required
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
              onClick={() => setFormData({
                name: '',
                phone: '',
                place: '',
                plan: [],
                paymentStatus: false,
                startDate: '',
                endDate: ''
              })}
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
