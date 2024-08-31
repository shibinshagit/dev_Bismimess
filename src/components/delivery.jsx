import React from "react";
import { Typography, Button, Collapse, Input } from "@material-tailwind/react";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PointSelector } from "./Points";


export const DeliveryBoyList = ({
  deliveryBoys,
  openDeliveryBoy,
  toggleDeliveryBoy,
  handleDeleteDeliveryBoy,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {deliveryBoys.length === 0 ? (<><Typography className="py-4 text-center">No Delivery Boys</Typography></>) :
      (deliveryBoys.map((boy, index) => (
        <div key={boy.id} className="flex flex-col border-b p-4">
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
      )))}
    </div>
  );
};


export const DeliveryForm = ({
  isOpen,
  toggleForm,
  points,
  pointsList,
  newDeliveryBoy,
  handleDeliveryBoyChange,
  handleAddPoint,
  handleRemovePoint,
  handlePointChange,
  handleAddDeliveryBoy,
  setOpenPointModal,
}) => {
  return (
    <Collapse open={isOpen}>
      <div className="flex flex-col gap-4 border-b p-4">
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
        <PointSelector
          points={points}
          pointsList={pointsList}
          handlePointChange={handlePointChange}
          handleRemovePoint={handleRemovePoint}
        />
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
    </Collapse>
  );
};

