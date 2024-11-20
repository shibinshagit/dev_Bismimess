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

function OrdersList() {
    console.log('jhdjhfj')
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

  const handleOrderFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrderFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-4">
        {userName}'s Orders
      </Typography>

      <Button color="green" onClick={handleAddOrderClick} className="mb-4">
        Add New Order
      </Button>

      {orders.map((order) => (
        <Card
          key={order._id}
          className={`mb-4 ${order._id === activeOrderId ? 'border-2 border-green-500' : ''}`}
        >
          <CardBody>
            <Typography variant="h6">Order ID: {order._id}</Typography>
            <Typography>Plan: {order.plan.join(', ')}</Typography>
            <Typography>
              Duration: {order.orderStart.split('T')[0]} to {order.orderEnd.split('T')[0]}
            </Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography>Payment Status: {order.paymentStatus}</Typography>
            {/* Add more fields as necessary */}
            <div className="flex space-x-2 mt-4">
              <Button color="blue" onClick={() => handleEditOrderClick(order)}>
                Edit
              </Button>
              <Button color="red" onClick={() => handleDeleteOrder(order._id)}>
                Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}

      {/* Add/Edit Order Modal */}
      <Dialog
        open={showAddOrderModal}
        handler={() => setShowAddOrderModal(false)}
        size="sm"
      >
        <DialogHeader>{isEditingOrder ? 'Edit Order' : 'Add New Order'}</DialogHeader>
        <DialogBody>
          {/* Order Form */}
          <div className="mb-4">
            <Typography variant="small" className="font-semibold mb-2">
              Plan
            </Typography>
            <div className="flex flex-col gap-2">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => {
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
            </div>
          </div>

          <div className="mb-4">
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
        <DialogFooter>
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
