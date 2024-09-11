import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Option,
  Collapse,
  IconButton,
  DialogFooter,
  DialogBody,
  DialogHeader,
  Dialog,
} from "@material-tailwind/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { BaseUrl } from "@/constants/BaseUrl";
import { useMaterialTailwindController } from "@/context";
import { useNavigate } from "react-router-dom"; // For navigation

export function UpcomingDelivery() {
  const [controller] = useMaterialTailwindController();
  const { openDeliveryForm } = controller;
  const [openForm, setOpenForm] = useState(false);
  const [openDeliveryBoy, setOpenDeliveryBoy] = useState({});
  const [openSingleUsers, setOpenSingleUsers] = useState({});
  const [points, setPoints] = useState([{ id: '', name: '', mode: '' }]);
  const [pointsList, setPointsList] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });
  const [newDeliveryBoy, setNewDeliveryBoy] = useState({
    name: "",
    phone: "",
    code: "",
    points: [],
  });
  const navigate = useNavigate();

  // Fetch points from the backend API
  const fetchPoints = useCallback(async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  }, []);

  // Fetch delivery boys from the backend API
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/delivery-boys`);
      setDeliveryBoys(response.data);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  }, []);

  // Fetch points and delivery boys on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchPoints();
      await fetchDeliveryBoys();
      console.log(deliveryBoys)
    };
    fetchData();
  }, [fetchPoints, fetchDeliveryBoys]);

  // Toggle delivery boy details
  const toggleDeliveryBoy = (index) => {
    setOpenDeliveryBoy((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Handle point input change
  const handlePointChange = (index, value) => {
    const updatedPoints = [...points];
    updatedPoints[index].id = value._id; // Use the point's ID
    setPoints(updatedPoints);
  };

  // Add new point field
  const handleAddPoint = () => {
    setPoints([...points, { id: "", name: "", mode: "" }]);
  };

  // Remove point field
  const handleRemovePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  // Handle new point input changes
  const handleNewPointChange = (e) => {
    const { name, value } = e.target;
    setNewPoint((prevPoint) => ({
      ...prevPoint,
      [name]: value,
    }));
  };

  // Handle mode select change for new point
  const handleSelectChange = (value) => {
    setNewPoint((prevPoint) => ({
      ...prevPoint,
      mode: value,
    }));
  };

  // Handle adding new point to the backend
  const handleAddNewPoint = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/api/points`, newPoint);
      setPointsList([...pointsList, response.data]);
      resetNewPoint();
      setOpenPointModal(false);
    } catch (error) {
      console.error("Error adding new point:", error);
    }
  };

  const resetNewPoint = () => setNewPoint({ place: '', mode: 'single' });

  // Handle delivery boy input changes
  const handleDeliveryBoyChange = (e) => {
    const { name, value } = e.target;
    setNewDeliveryBoy({ ...newDeliveryBoy, [name]: value });
  };

  // Handle adding a new delivery boy
  const handleAddDeliveryBoy = async () => {
    try {
      const deliveryBoy = {
        ...newDeliveryBoy,
        points: points.map((point) => point.id),
      };
      await axios.post(`${BaseUrl}/api/delivery-boys`, deliveryBoy);
      fetchDeliveryBoys();  // Refetch instead of manually updating the list
      resetDeliveryBoyForm();
      setOpenForm(false);
    } catch (error) {
      console.error("Error adding delivery boy:", error);
    }
  };

  const resetDeliveryBoyForm = () => {
    setNewDeliveryBoy({ name: "", phone: "", code: "", points: [] });
    setPoints([{ id: "", name: "", mode: "" }]);
  };

  // Handle deleting a delivery boy
  const handleDeleteDeliveryBoy = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/api/delivery-boys/${id}`);
      fetchDeliveryBoys();  // Refetch to update the list
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
    }
  };

  // Handle navigation to view delivery boy details
  const navigateToViewDelivery = (id) => {
    navigate(`/dashboard/viewdelivery/${id}`);  // Navigate to view delivery page
  };

  return (
    <div className="mx-auto my-5 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4 sticky top-0 bg-white z-10 flex justify-between items-center"
        >
          <Collapse open={openDeliveryForm}>
            <CardBody className="flex flex-col gap-4 border-b p-4">
              <Input
                label="Name"
                name="name"
                value={newDeliveryBoy.name}
                onChange={handleDeliveryBoyChange}
              />
              <Input
                label="Phone"
                name="phone"
                value={newDeliveryBoy.phone}
                onChange={handleDeliveryBoyChange}
              />
              <Input
                label="4-Digit Code"
                name="code"
                value={newDeliveryBoy.code}
                onChange={handleDeliveryBoyChange}
              />
              <div className="flex flex-col gap-4">
                {points.map((point, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select
                      label={`Point ${index + 1}`}
                      value={point.id}
                      onChange={(value) => handlePointChange(index, value)}
                    >
                      {pointsList.map((pt) => (
                        <Option key={pt._id} value={pt}>
                          {pt.place} ({pt.mode})
                        </Option>
                      ))}
                    </Select>
                    <IconButton
                      color="red"
                      variant="text"
                      className="w-5 h-5"
                      onClick={() => handleRemovePoint(index)}
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </IconButton>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <Button
                    color="green"
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={handleAddPoint}
                  >
                    <PlusIcon className="w-5 h-5" /> Add more
                  </Button>
                  <Button
                    color="orange"
                    variant="text"
                    className="flex items-center gap-2"
                    onClick={() => setOpenPointModal(true)}
                  >
                    <PlusIcon className="w-5 h-5" /> New Point
                  </Button>
                </div>
                <Button
                  color="red"
                  variant="filled"
                  className="flex items-center gap-2"
                  onClick={handleAddDeliveryBoy}
                >
                  Submit
                </Button>
              </div>
            </CardBody>
          </Collapse>
        </CardHeader>

        {/* Add New Point Modal */}
        <Dialog open={openPointModal} handler={setOpenPointModal} size="sm">
          <DialogHeader>Add New Point</DialogHeader>
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
              onClick={() => setOpenPointModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="green"
              onClick={handleAddNewPoint}
            >
              Add Point
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delivery Boys List */}
        <CardBody>
          <div className="p-4">
            {deliveryBoys.map((boy, index) => (
              <div key={boy.id} className="mb-5">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="h6"
                    onClick={() => navigateToViewDelivery(boy.id)}  // Navigate on click
                    className="cursor-pointer"
                  >
                    {boy.name}
                  </Typography>
                  <IconButton
                    color="gray"
                    variant="text"
                    onClick={() => toggleDeliveryBoy(index)}
                  >
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${
                        openDeliveryBoy[index] ? "rotate-180" : ""
                      }`}
                    />
                  </IconButton>
                </div>
                <Collapse open={openDeliveryBoy[index]}>
                  <Typography variant="small" className="ml-4">
                    Phone: {boy.phone}
                    <br />
                    Code: {boy.code}
                    <br/>
                    {/* points:{boy.points } */}
                  </Typography>
                </Collapse>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
