import React, { useState } from "react";
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
import { Phone, PhoneCallIcon } from "lucide-react";

// Hardcoded delivery boys data
const deliveryBoys = [
  {
    name: "Shabeer KM",
    phone: "7012975494",
    points: [
      { name: "Brototype", type: "Cluster", status: "Delivered" },
      { name: "Vytila", type: "Single", users: [{ name: "Shah", status: "Delivered" },{ name: "Shah", status: "Out" },{ name: "Shah", status: "Out" }] },
    ],
  },
  {
    name: "Nishal",
    phone: "9876543212",
    points: [
      { name: "Forum Mall", type: "Cluster", status: "L: Packed" },
      { name: "Maradu", type: "Single", users: [{ name: "Murshid", status: "Upcoming" }] },
    ],
  },
];

// Hardcoded points list
const pointsList = [
  { id: 1, name: "Brototype", mode: "Cluster" },
  { id: 2, name: "Vytila", mode: "Single" },
  { id: 3, name: "Forum Mall", mode: "Cluster" },
  { id: 4, name: "Maradu", mode: "Single" },
];

export function UpcomingDelivery() {
  const [openForm, setOpenForm] = useState(false);
  const [openDeliveryBoy, setOpenDeliveryBoy] = useState({});

  // Toggle delivery boy's points
  const toggleDeliveryBoy = (index) => {
    setOpenDeliveryBoy((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };


  const [points, setPoints] = useState([{ id: '', name: '', mode: '' }]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });

  const toggleForm = () => setOpenForm(!openForm);

  const handleAddPoint = () => {
    setPoints([...points, { id: '', name: '', mode: '' }]);
  };

  const handleRemovePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const handlePointChange = (index, value) => {
    const updatedPoints = [...points];
    updatedPoints[index].id = value;
    setPoints(updatedPoints);
  };

  const handleNewPointChange = (e) => {
    const { name, value } = e.target;
    setNewPoint({ ...newPoint, [name]: value });
  };

  const handleAddNewPoint = () => {
    onAddPoint(newPoint);
    setOpenPointModal(false);
  };
  const toggleSingleUsers = (index) => {
    setOpenSingleUsers((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  const [openSingleUsers, setOpenSingleUsers] = useState({});

  return (
    <div className="mx-auto my-5 flex max-w-screen-lg flex-col gap-8">
        <Button color="black" onClick={toggleForm}>
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
            <Input label="Name" />
            <Input label="Phone" />
            <div className="flex flex-col gap-4">
              {points.map((point, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    label={`Point ${index + 1}`}
                    value={point.id}
                    onChange={(e) => handlePointChange(index, e.target.value)}
                  >
                    {pointsList.map((pt) => (
                      <Option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.mode})
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
        <PlusIcon className="w-5 h-5" />  New Point
        
      </Button>

               
              </div>
              <Button
                  color="red"
                  variant="filled"
                  className="flex items-center gap-2"
                  onClick={() => alert('Add Delivery Boy')}
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
            name="mode"
            value={newPoint.mode}
            onChange={(e) =>
              setNewPoint({ ...newPoint, mode: e.target.value })
            }
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
          <Button variant="filled" color="black" onClick={handleAddNewPoint}>
            Add Point
          </Button>
        </DialogFooter>
      </Dialog>

     
    
      










        {/* Delivery Boys List */}
        <CardBody className="flex flex-col gap-4 p-4">
        {deliveryBoys.map((boy, index) => (
    <div key={index} className="border-b pb-4 mb-4">
      {/* Header Section */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleDeliveryBoy(index)}
      >
        {/* Delivery Boy Information */}
        <div className="flex flex-col">
          <Typography variant="h6" color="blue-gray">
            {boy.name}
            <a href={`tel:${boy.phone}`} className="text-green-500 hover:underline mx-3">
            {boy.phone}
          </a>
          </Typography>
          
          {/* Phone Number */}
         
          
          {/* Points Information */}
          <div className={`text-gray-500 mt-2 flex ${openDeliveryBoy[index] ? "hidden" : ""}`}>
            {boy.points.map((point, id) => (
              <div key={id} className="mr-2">
                {`${point.name}.`}
              </div>
            ))}
          </div>
        </div>

        {/* Toggle Icon */}
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            openDeliveryBoy[index] ? "rotate-180" : ""
          }`}
        />
      </div>

        {/* Map Component */}
<Collapse open={openDeliveryBoy[index]}>
  <div className="pl-4 mt-4">
    {boy.points.map((point, idx) => (
      <div key={idx} className="relative mb-4">
        {/* Connection Line - Only if previous point is "Delivered" */}
        {idx !== 0 && boy.points[idx - 1].status === "Delivered" && (
          <div className="absolute left-2 top-0 w-px h-full bg-gray-300 z-0"></div>
        )}
        
        {/* Point Marker */}
        <div className="flex items-center z-10 relative">
          <div
            className={`w-4 h-4 rounded-full mr-4 ${
              point.status === "Delivered"
                ? "bg-green-500"
                : point.status === "Out"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          ></div>
          <Typography
            variant="small"
            color="blue-gray"
            onClick={() => toggleSingleUsers(idx)}
            className="cursor-pointer hover:text-blue-700"
          >
            {point.name} ({point.type} {point.type === "Single" && `- ${point.users.length}`})
            {point.type === "Cluster" && ` - ${point.status}`}
          </Typography>
        </div>

        {/* Single Users Dropdown */}
        {point.type === "Single" && openSingleUsers[idx] && (
          <div className="ml-8 mt-2 pl-4 border-l-2 border-blue-200">
            {point.users.map((user, userIdx) => (
              <div key={userIdx} className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <Typography
                  variant="small"
                  color="gray"
                >
                  {user.name} - {user.status}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
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
