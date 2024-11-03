import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { EllipsisVertical, RefreshCwIcon } from "lucide-react";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import { BaseUrl } from "@/constants/BaseUrl";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardBody,
  List,
  Typography,
  ListItem,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Checkbox,
  Button,
  Switch,
  Select,
  Option,
} from "@material-tailwind/react";


const UserItem = ({ user, onUserDeleted, onOrderRenewed }) => {
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for Renew Order Dialog
  const [openRenewDialog, setOpenRenewDialog] = useState(false);
  const [renewFormData, setRenewFormData] = useState({
    plan: [],
    paymentStatus: false,
    startDate: "",
    endDate: "",
    amount: "",
    paymentMethod: "",
    paymentId: "",
    isVeg: false,
    totalLeaves: 0, // Added totalLeaves to state
  });

  const toggleActions = () => setShowActions((prev) => !prev);

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      const response = await axios.delete(`${BaseUrl}/api/users/${user._id}`);
      if (response.status === 200) {
        alert("User deleted successfully.");
        if (onUserDeleted) onUserDeleted(user._id);
      } else {
        alert(`Error deleting user: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewOrderClick = () => {
    // Prepare form data with default values from the user's latest order
    const latestOrder = user.latestOrder;
    if (!latestOrder) {
      alert("No previous order found to renew.");
      return;
    }

    // Calculate the new start date as the day after the latest order's end date
    const latestOrderEndDate = new Date(latestOrder.orderEnd);
    const newStartDate = new Date(latestOrderEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newStartDateISO = newStartDate.toISOString().split("T")[0];

    // Calculate the new end date (assuming 1 month duration)
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    if (newEndDate.getDate() !== newStartDate.getDate()) {
      newEndDate.setDate(0);
    }
    newEndDate.setDate(newEndDate.getDate() - 1);
    const newEndDateISO = newEndDate.toISOString().split("T")[0];

    // Calculate the amount based on the pending payment calculation logic

    // Get total number of leaves from the previous order by summing numberOfLeaves
    let totalLeaves = 0;
    if (latestOrder.leave && Array.isArray(latestOrder.leave)) {
      totalLeaves = latestOrder.leave.reduce((sum, leavePeriod) => {
        return sum + (leavePeriod.numberOfLeaves || 0);
      }, 0);
    }

    const planLength = latestOrder.plan.length;
    let baseAmount = 0;

    if (planLength === 3) {
      baseAmount = 3200;
    } else if (planLength === 2) {
      baseAmount = 2750;
    } else if (planLength === 1) {
      baseAmount = 1500;
    }

    // Deduct leaves
    let deduction = 0;
    if (planLength === 3) {
      deduction = totalLeaves * 100;
    } else if (planLength === 2) {
      deduction = totalLeaves * 80;
    }
    // For planLength ===1, no deduction

    const calculatedAmount = baseAmount - deduction;

    // Set the form data with previous order's details and calculated amount
    setRenewFormData({
      plan: latestOrder.plan || [],
      paymentStatus: latestOrder.paymentStatus || false,
      startDate: newStartDateISO,
      endDate: newEndDateISO,
      amount: calculatedAmount > 0 ? calculatedAmount.toString() : "0",
      paymentMethod: latestOrder.paymentMethod || "",
      paymentId: latestOrder.paymentId || "",
      isVeg: latestOrder.isVeg || false,
      totalLeaves: totalLeaves, // Set totalLeaves in state
    });

    // Open the renew order dialog
    setOpenRenewDialog(true);
  };

  const handleRenewFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "startDate") {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      if (endDate.getDate() !== startDate.getDate()) {
        endDate.setDate(0);
      }
      endDate.setDate(endDate.getDate() - 1);

      setRenewFormData({
        ...renewFormData,
        startDate: value,
        endDate: endDate.toISOString().split("T")[0],
      });
    } else if (name === "plan") {
      const { value: planValue, checked: planChecked } = e.target;
      setRenewFormData((prevData) => {
        const updatedPlan = planChecked
          ? [...prevData.plan, planValue]
          : prevData.plan.filter((plan) => plan !== planValue);

        // Recalculate the amount when the plan changes
        const updatedPlanLength = updatedPlan.length;
        let baseAmount = 0;

        if (updatedPlanLength === 3) {
          baseAmount = 3200;
        } else if (updatedPlanLength === 2) {
          baseAmount = 2750;
        } else if (updatedPlanLength === 1) {
          baseAmount = 1500;
        } else {
          baseAmount = 0;
        }

        // Recalculate deduction based on totalLeaves from previous order
        let deduction = 0;
        const totalLeaves = prevData.totalLeaves || 0;
        if (updatedPlanLength === 3) {
          deduction = totalLeaves * 100;
        } else if (updatedPlanLength === 2) {
          deduction = totalLeaves * 80;
        }
        // For planLength ===1 or 0, no deduction

        const calculatedAmount = baseAmount - deduction;

        return {
          ...prevData,
          plan: updatedPlan,
          amount: calculatedAmount > 0 ? calculatedAmount.toString() : "0",
        };
      });
    } else {
      setRenewFormData({
        ...renewFormData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleRenewOrderSubmit = async () => {
    // Validate required fields
    if (!renewFormData.plan.length) {
      alert("Please select at least one meal in the plan.");
      return;
    }
    if (!renewFormData.amount) {
      alert("Please enter the amount.");
      return;
    }
    if (!renewFormData.paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (
      renewFormData.paymentMethod !== "Cash" &&
      !renewFormData.paymentId.trim()
    ) {
      alert("Please enter the payment ID.");
      return;
    }

    // Prepare the data to send to the server
    const dataToSend = {
      userId: user._id,
      plan: renewFormData.plan,
      paymentStatus: renewFormData.paymentStatus,
      startDate: renewFormData.startDate,
      endDate: renewFormData.endDate,
      amount: parseFloat(renewFormData.amount),
      paymentMethod: renewFormData.paymentMethod,
      paymentId:
        renewFormData.paymentMethod !== "Cash" ? renewFormData.paymentId : "",
      isVeg: renewFormData.isVeg,
    };

    try {
      setIsProcessing(true);
      const response = await axios.post(
        `${BaseUrl}/api/users/${user._id}/renew`,
        dataToSend
      );
      if (response.status === 200) {
        alert("Order renewed successfully.");
        if (onOrderRenewed) onOrderRenewed(user._id);
        setOpenRenewDialog(false);
      } else {
        alert(`Error renewing order: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error renewing order:", error);
      alert(error.response.data.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <ListItem className="flex items-center justify-between space-x-3 bg-gray-300 p-2 rounded-md shadow-sm mb-2 relative">
        {/* Avatar and User Info */}
        <div className="flex items-center space-x-3">
          <Avatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name
            )}&background=random`}
            alt={user.name}
            size="sm"
          />
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-medium truncate"
            >
              {user.name}
            </Typography>
            <Typography variant="small" color="gray" className="truncate">
              {user.phone}
            </Typography>
          </div>
        </div>

        {/* Vertical three-dot menu */}
        <div className="relative">
          <button
            onClick={toggleActions}
            className="text-gray-500 hover:text-gray-700"
          >
            <EllipsisVertical color="black" className="h-5 w-5" />
          </button>

          {/* Slide-in actions */}
          <div
            className={`absolute top-0 right-7 flex space-x-3 transform transition-transform duration-200 ${
              showActions
                ? "translate-x-0 opacity-100"
                : "translate-x-5 opacity-0 pointer-events-none"
            }`}
          >
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={handleRenewOrderClick}
              disabled={isProcessing}
            >
              <RefreshCwIcon className="h-5 w-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={handleDeleteUser}
              disabled={isProcessing}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </ListItem>

      {/* Renew Order Dialog */}
      <Dialog open={openRenewDialog} handler={setOpenRenewDialog} size="lg">
    <DialogHeader>Renew Order for {user.name}</DialogHeader>
    <DialogBody divider className="overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Checkbox
                name="paymentStatus"
                label="Paid"
                checked={renewFormData.paymentStatus}
                onChange={handleRenewFormChange}
              />
            </div>
            <div>
              <Typography variant="small" className="font-semibold mb-2">
                Plan
              </Typography>
              <div className="flex gap-1">
                <Checkbox
                  name="plan"
                  label="Breakfast"
                  value="B"
                  checked={renewFormData.plan.includes("B")}
                  onChange={handleRenewFormChange}
                />
                <Checkbox
                  name="plan"
                  label="Lunch"
                  value="L"
                  checked={renewFormData.plan.includes("L")}
                  onChange={handleRenewFormChange}
                />
                <Checkbox
                  name="plan"
                  label="Dinner"
                  value="D"
                  checked={renewFormData.plan.includes("D")}
                  onChange={handleRenewFormChange}
                />
              </div>
            </div>
            <div>
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                value={renewFormData.startDate}
                min={renewFormData.startDate}
                onChange={handleRenewFormChange}
                required
              />
            </div>
            <div>
              <Input
                type="date"
                name="endDate"
                label="End Date"
                value={renewFormData.endDate}
                readOnly
                required
              />
            </div>
            <div>
              <Input
                type="number"
                name="amount"
                label="Amount"
                value={renewFormData.amount}
                onChange={handleRenewFormChange}
                required
              />
            </div>
            <div>
              <Typography variant="small" className="mb-2">
                Total Leaves from Previous Order: {renewFormData.totalLeaves}
              </Typography>
            </div>
            <div>
              <Select
                name="paymentMethod"
                label="Payment Method"
                value={renewFormData.paymentMethod}
                onChange={(value) =>
                  setRenewFormData({
                    ...renewFormData,
                    paymentMethod: value,
                    paymentId: "", // Reset paymentId when paymentMethod changes
                  })
                }
                required
              >
                <Option value="Cash">Cash</Option>
                <Option value="Bank">Bank</Option>
                <Option value="Online">Online</Option>
              </Select>
            </div>
            <div>
              <Input
                type="text"
                name="paymentId"
                label="Payment ID"
                value={renewFormData.paymentId}
                onChange={handleRenewFormChange}
                required={renewFormData.paymentMethod !== "Cash"}
                disabled={renewFormData.paymentMethod === "Cash"}
              />
            </div>
            <div className="flex items-center">
              <Typography variant="small" className="mr-2">
                Veg
              </Typography>
              <Switch
                checked={renewFormData.isVeg}
                onChange={(e) =>
                  setRenewFormData({
                    ...renewFormData,
                    isVeg: e.target.checked,
                  })
                }
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setOpenRenewDialog(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="green"
            onClick={handleRenewOrderSubmit}
            disabled={isProcessing}
          >
            Renew Order
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
};
const PointCard = ({ point }) => {
  const { place, totalUsers, totalExpiredUsers, usersExpired } = point;

  return (
    <Card className={`shadow-md border-4 ${totalExpiredUsers > 0 ? "border-red-500" : "border-gray-300"} transition-transform transform hover:scale-105 mb-6`}>
      <CardBody className="p-3 relative">
        <div className="flex items-center justify-between">
          <Typography variant="h6">{place}</Typography>
          {totalExpiredUsers > 0 ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="mb-2 flex items-center justify-between">
          <Typography variant="small" color="gray" className="font-semibold">
            Total: {totalUsers}
          </Typography>
          <Typography variant="small" color="gray" className={`font-bold ${totalExpiredUsers > 0 ? "text-red-600" : "text-gray-700"}`}>
            Expired: {totalExpiredUsers}
          </Typography>
        </div>
        <div>
          <Typography variant="small" color="gray" className="font-semibold mb-1">
            Users Expired:
          </Typography>
          {totalExpiredUsers > 0 ? (
            <List>
              {usersExpired.map((user) => (
                <UserItem key={user._id} user={user} />
              ))}
            </List>
          ) : (
            <Typography variant="small" color="gray" className="italic">
              No expired users.
            </Typography>
          )}
        </div>
       
      </CardBody>
    </Card>
  );
};

export default PointCard;
