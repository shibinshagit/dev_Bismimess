import React, { useState, useEffect } from "react";
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

export function UpcomingDelivery() {
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

  // Fetch points from the backend API
  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };

  // Fetch delivery boys from the backend API
  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/delivery-boys`);
      setDeliveryBoys(response.data);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

  useEffect(() => {

    fetchPoints();
    fetchDeliveryBoys();
  }, [fetchPoints, fetchDeliveryBoys]);

  const toggleDeliveryBoy = (index) => {
    setOpenDeliveryBoy((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleAddPoint = () => {
    setPoints([...points, { id: "", name: "", mode: "" }]);
  };

  const handleRemovePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handlePointChange = (index, value) => {
    const updatedPoints = [...points];
    updatedPoints[index].id = value;
    console.log('shah2',value)
    setPoints(updatedPoints);
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
      setPointsList([...pointsList, response.data]);
      setOpenPointModal(false);
    } catch (error) {
      console.error("Error adding new point:", error);
    }
  };

  const handleDeliveryBoyChange = (e) => {
    const { name, value } = e.target;
    setNewDeliveryBoy({ ...newDeliveryBoy, [name]: value });
  };

  const handleAddDeliveryBoy = async () => {
    try {
      const deliveryBoy = {
        ...newDeliveryBoy,
        points: points.map((point) => point.id),
      };
      const response = await axios.post(`${BaseUrl}/api/delivery-boys`, deliveryBoy);
      setDeliveryBoys([...deliveryBoys, response.data]);
      setNewDeliveryBoy({ name: "", phone: "", code: "", points: [] });
      setPoints([{ id: "", name: "", mode: "" }]);
      fetchDeliveryBoys()
      setOpenForm(false);
    } catch (error) {
      console.error("Error adding delivery boy:", error);
    }
  };

  // const handleEditDeliveryBoy = async (id) => {
  //   try {
  //     const deliveryBoy = {
  //       ...newDeliveryBoy,
  //       points: points.map((point) => point._id),
  //     };
  //     const response = await axios.put(`${BaseUrl}/api/delivery-boys/${id}`, deliveryBoy);
  //     setDeliveryBoys(
  //       deliveryBoys.map((boy) =>
  //         boy._id === id ? response.data : boy
  //       )
  //     );
  //     setNewDeliveryBoy({ name: "", phone: "", code: "", points: [] });
  //     setPoints([{ id: "", name: "", mode: "" }]);
  //   } catch (error) {
  //     console.error("Error editing delivery boy:", error);
  //   }
  // };

  const handleDeleteDeliveryBoy = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/api/delivery-boys/${id}`);
      setDeliveryBoys(deliveryBoys.filter((boy) => boy.id !== id));
      fetchDeliveryBoys();
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
    }
  };

  const toggleSingleUsers = (index) => {
    setOpenSingleUsers((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="mx-auto my-5 flex max-w-screen-lg flex-col gap-8">
      <Button color="black" onClick={() => setOpenForm(!openForm)}>
        Add Delivery Boy+
      </Button>
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4 sticky top-0 bg-white z-10 flex justify-between items-center"
        >
          <Collapse open={openForm}>
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
      value={point.place}
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
              variant="filled"
              color="green"
              onClick={handleAddNewPoint}
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delivery Boys List */}
        <CardBody className="flex flex-col gap-4">
          {deliveryBoys.map((boy, index) => (
            <div key={boy.id} className="flex flex-col border-b pb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDeliveryBoy(index)}
              >
                <Typography>{boy.name}</Typography>
                <ChevronDownIcon
                  className={`w-5 h-5 transform transition-transform ${
                    openDeliveryBoy[index] ? "rotate-180" : ""
                  }`}
                />
              </div>
              <Collapse open={openDeliveryBoy[index]}>
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {boy.points.map((point, ptIndex) => (
                    <div key={ptIndex}>
                      <Typography>
                        {point.place} ({point.mode})
                      </Typography>
                      {point.mode === "cluster" && (
                        <div className="ml-4">
                          <Typography>B: Delivered</Typography>
                          <Typography>L: Packed</Typography>
                          <Typography>D: Upcoming</Typography>
                        </div>
                      )}
                      {point.mode === "single" && (
                        <div className="ml-4">
                          {/* Show users dropdown */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Button
                    color="blue"
                    variant="text"
                    // onClick={() => handleEditDeliveryBoy(boy._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    variant="text"
                    onClick={() => handleDeleteDeliveryBoy(boy._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Collapse>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default UpcomingDelivery;
