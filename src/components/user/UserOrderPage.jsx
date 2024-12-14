import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardHeader, CardBody, Typography, Button,
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Input, Checkbox, Select, Option,
  Switch,
} from '@material-tailwind/react';
import { useParams, useNavigate } from 'react-router-dom';
import { BaseUrl } from '../../constants/BaseUrl';
import Swal from 'sweetalert2';
import { Edit, Trash } from 'lucide-react';

function OrdersList() {
  const { userId } = useParams(); // Get userId from the route parameters
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [userName, setUserName] = useState('');
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);

  // For adding/editing orders
  const [orderFormData, setOrderFormData] = useState({
    plan: [],
    startDate: '',
    endDate: '',
    paymentStatus: 'pending',
    amount: '',
    paymentMethod: undefined,
    paymentId: '',
    isVeg: false,
  });
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    console.log('helloo')
    fetchOrders();
    fetchUserName();
  }, []);

  const fetchOrders = async () => {
    console.log('jdhjh')
    try {
      const response = await axios.get(`${BaseUrl}/api/${userId}/orders`);
      setOrders(response.data.orders);
      setActiveOrderId(response.data.activeOrderId);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  const fetchUserName = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/user/${userId}`);
      setUserName(response.data.name);
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const handleAddOrderClick = () => {
    setOrderFormData({
      plan: [],
      startDate: '',
      endDate: '',
      paymentStatus: 'pending',
      amount: '',
      paymentMethod: undefined,
      paymentId: '',
      isVeg: false,
    });
    setIsEditingOrder(false);
    setShowAddOrderModal(true);
  };

  const handleEditOrderClick = (order) => {
    setOrderFormData({
      plan: order.plan,
      startDate: order.orderStart.split('T')[0],
      endDate: order.orderEnd.split('T')[0],
      paymentStatus: order.paymentStatus,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      isVeg: order.isVeg,
    });
    setEditingOrderId(order._id);
    setIsEditingOrder(true);
    setShowAddOrderModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
      });

      if (confirm.isConfirmed) {
        await axios.delete(`${BaseUrl}/api/orders/${orderId}`);
        Swal.fire('Deleted!', 'Order has been deleted.', 'success');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      Swal.fire('Error', 'Failed to delete order.', 'error');
    }
  };

  // const handleOrderFormChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setOrderFormData((prevData) => ({
  //     ...prevData,
  //     [name]: type === 'checkbox' ? checked : value,
  //   }));
  // };

  const handlePlanChange = (e) => {
    const { value, checked } = e.target;
    setOrderFormData((prevData) => {
      const updatedPlan = checked
        ? [...prevData.plan, value]
        : prevData.plan.filter((plan) => plan !== value);
      return { ...prevData, plan: updatedPlan };
    });
  };

  const handleOrderFormSubmit = async () => {
    try {
      const url = isEditingOrder
        ? `${BaseUrl}/api/orders/${editingOrderId}`
        : `${BaseUrl}/api/user/${userId}/orders`;
      const method = isEditingOrder ? 'put' : 'post';

      await axios({
        method,
        url,
        data: orderFormData,
      });

      Swal.fire('Success', 'Order saved successfully.', 'success');
      setShowAddOrderModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      Swal.fire('Error', 'Failed to save order.', 'error');
    }
  };



  const handleOrderFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for start date to automatically set end date
    if (name === 'startDate') {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      
      // Set to the next month and subtract one day
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      
      // Format the end date to YYYY-MM-DD for input
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      setOrderFormData((prevData) => ({
        ...prevData,
        [name]: value,
        endDate: formattedEndDate
      }));
    } else {
      setOrderFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  
  // Calculate days between start and end dates
  const calculateDaysBetween = () => {
    if (orderFormData.startDate && orderFormData.endDate) {
      const start = new Date(orderFormData.startDate);
      const end = new Date(orderFormData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
      return daysDiff;
    }
    return 0;
  };
  

  return (
    <div className="p-4 mb-12">
  <div className="flex justify-between items-center">
  <Typography variant="h4" className="mb-4">
        {userName}
      </Typography>

      <Button onClick={handleAddOrderClick} className="bg-gradient-to-r from-gray-700 to-teal-900 hover:bg-teal-900 mb-4">
        Add New Order
      </Button>
  </div>
{console.log('or',orders)}
      {orders.map((order) => (
        <Card
          key={order._id}
          className={`mb-4 ${order._id === activeOrderId ? 'border-2 border-teal-500' : ''}`}
          style={
            order._id === activeOrderId
              ? {}
              : {
                backgroundImage:
                  "repeating-linear-gradient(30deg, #6b7280 0, #6b7280 1px, transparent 1px, transparent 5px)",
              }
          }
       >
          <CardBody>
           <div className='flex justify-between items-center'>
           <Typography variant="h6">Order ID: {order._id.slice(2,5)}</Typography>
            <Typography variant="small" className='font-semibold bg-gradient-to-r  from-teal-900 to-gray-300 w-20 rounded h-6 capitalize text-white ' align="center" >{order.status}</Typography>
           
           </div>
            <Typography>Plan: {order.plan.join(', ')}</Typography>
            <Typography>
              Duration: {order.orderStart.split('T')[0]} to {order.orderEnd.split('T')[0]}
            </Typography>
            <Typography>Payment Status: {order.paymentStatus}</Typography>
            {/* Add more fields as necessary */}
            {order._id === activeOrderId ? 
            <div className="flex space-x-3 mt-4">
            <Edit
              name="Edit"
              size={20}
              className="text-blue-600 cursor-pointer"
              onClick={() => handleEditOrderClick(order)}
            />
            <Trash
              name="Delete"
              size={20}
              className="text-red-600 cursor-pointer"
              onClick={() => handleDeleteOrder(order._id)}
            />
          </div>
            :''}
           
          </CardBody>
        </Card>
      ))}

      {/* Add/Edit Order Modal */}
      <Dialog
        open={showAddOrderModal}
        handler={() => setShowAddOrderModal(false)}
        size="md"
        className="overflow-visible"
      >
        <DialogHeader className="sticky top-0 z-10 bg-white rounded-full">{isEditingOrder ? 'Edit Order' : 'Add New Order'}</DialogHeader>
        <DialogBody style={{ overflowY: 'auto', maxHeight: '70vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Order Form */}
          <div className="mb-4">
            <Typography variant="small" className="font-semibold mb-2">
              Plan
            </Typography>
            <div className="flex flex-row items-center gap-2">
              {['B', 'L', 'D'].map((meal, index) => {
                const value = meal.charAt(0).toUpperCase(); // 'B', 'L', 'D'
                return (
                  <Checkbox
                    key={index}
                    name="plan"
                    label={meal}
                    value={value}
                    checked={orderFormData.plan.includes(value)}
                    onChange={handlePlanChange}
                  />
                );
              })}
               <div className="w-auto h-6 px-4 py-0 text-center text-teal-900 ml-auto mb-1">
    Days: {calculateDaysBetween()}
  </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
  <Input
    type="date"
    name="startDate"
    label="Start Date"
    value={orderFormData.startDate}
    onChange={handleOrderFormChange}
    required
  />
 
</div>

<div className="mb-4">
  <Input
    type="date"
    name="endDate"
    label="End Date"
    value={orderFormData.endDate}
    onChange={handleOrderFormChange}
    required
  />
</div>

          <div className="mb-4">
            <Select
              name="paymentStatus"
              label="Payment Status"
              value={orderFormData.paymentStatus}
              onChange={(value) =>
                setOrderFormData({ ...orderFormData, paymentStatus: value })
              }
              required
            >
              <Option value="success">Success</Option>
              <Option value="failed">Failed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </div>

          {/* Conditionally render payment-related fields */}
          {orderFormData.paymentStatus !== 'pending' && (
            <>
              <div className="mb-4">
                <Input
                  type="number"
                  name="amount"
                  label="Amount"
                  value={orderFormData.amount}
                  onChange={handleOrderFormChange}
                  required
                />
              </div>

              <div className="mb-4">
                <Select
                  name="paymentMethod"
                  label="Payment Method"
                  value={orderFormData.paymentMethod}
                  onChange={(value) =>
                    setOrderFormData({
                      ...orderFormData,
                      paymentMethod: value,
                      paymentId: '',
                    })
                  }
                  required
                >
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank">Bank</Option>
                  <Option value="Online">Online</Option>
                </Select>
              </div>

              <div className="mb-4">
                <Input
                  type="text"
                  name="paymentId"
                  label="Payment ID"
                  value={orderFormData.paymentId}
                  onChange={handleOrderFormChange}
                  required={orderFormData.paymentMethod !== 'Cash'}
                  disabled={orderFormData.paymentMethod === 'Cash'}
                />
              </div>
            </>
          )}

          {/* Veg Toggle */}
          <div className="flex items-center mb-4">
            <Typography variant="small" className="mr-2">
              Veg
            </Typography>
            <Switch
              checked={orderFormData.isVeg}
              onChange={(e) =>
                setOrderFormData({
                  ...orderFormData,
                  isVeg: e.target.checked,
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter className="sticky bottom-0 z-10 bg-white">
          <Button
            variant="text"
            color="red"
            onClick={() => setShowAddOrderModal(false)}
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleOrderFormSubmit}>
            {isEditingOrder ? 'Update Order' : 'Add Order'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default OrdersList;
