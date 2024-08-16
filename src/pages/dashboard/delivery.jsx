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
} from "@material-tailwind/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";

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

  // Toggle form for adding new delivery boy
  const toggleForm = () => setOpenForm(!openForm);

  // Toggle delivery boy's points
  const toggleDeliveryBoy = (index) => {
    setOpenDeliveryBoy((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        {/* Sticky Header Section */}
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4 sticky top-0 bg-white z-10 flex justify-between items-center"
        >
          <Typography variant="h6" color="blue-gray">
            Upcoming Deliveries
          </Typography>
          <Button color="black" onClick={toggleForm}>
            Add New Delivery Boy
          </Button>
        </CardHeader>

        {/* Add New Delivery Boy Form */}
        <Collapse open={openForm}>
          <CardBody className="flex flex-col gap-4 border-b p-4">
            <Input label="Name" />
            <Input label="Phone" />
            <div className="flex gap-2">
              <Select label="Points">
                {pointsList.map((point) => (
                  <Option key={point.id} value={point.id}>
                    {point.name} ({point.mode})
                  </Option>
                ))}
              </Select>
              <Button
                color="green"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => alert("Add Point Form")}
              >
                <PlusIcon className="w-5 h-5" /> Add Point
              </Button>
            </div>
            {/* <Button color="blue">Add Delivery Boy</Button> */}
          </CardBody>
        </Collapse>

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
