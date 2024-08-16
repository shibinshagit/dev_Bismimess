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

// Hardcoded delivery boys data
const deliveryBoys = [
  {
    name: "Shabeer KM",
    phone: "1234567890",
    points: [
      { name: "Brototype", type: "Cluster", status: "B: Delivered" },
      { name: "Vytila", type: "Single", users: [{ name: "Shah", status: "Delivered" }] },
    ],
  },
  {
    name: "Nishal",
    phone: "0987654321",
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
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDeliveryBoy(index)}
              >
                <Typography variant="h6" color="blue-gray">
                  {boy.name} ({boy.phone})
                </Typography>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${
                    openDeliveryBoy[index] ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Points Details */}
              <Collapse open={openDeliveryBoy[index]}>
                <div className="pl-4 mt-4">
                  {boy.points.map((point, idx) => (
                    <div key={idx} className="flex items-start mb-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-4 mt-1"></div>
                      <div>
                        <Typography variant="small" color="blue-gray">
                          {point.name} ({point.type})
                          {point.type === "Cluster" && ` - ${point.status}`}
                        </Typography>
                        {point.type === "Single" && (
                          <div className="ml-6">
                            {point.users.map((user, userIdx) => (
                              <Typography
                                key={userIdx}
                                variant="small"
                                color="blue-gray"
                              >
                                {user.name} - {user.status}
                              </Typography>
                            ))}
                          </div>
                        )}
                      </div>
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
