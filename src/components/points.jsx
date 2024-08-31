import React from "react";
import { Select, IconButton,Dialog, DialogFooter, DialogBody, DialogHeader, Button, Input, Option } from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/solid";


export const PointModal = ({
  isOpen,
  toggleModal,
  newPoint,
  handleNewPointChange,
  handleSelectChange,
  handleAddNewPoint,
}) => {
  return (
    <Dialog open={isOpen} handler={toggleModal} size="sm">
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
          onClick={toggleModal}
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
  );
};



export const PointSelector = ({
  points,
  pointsList,
  handlePointChange,
  handleRemovePoint,
}) => {
  return (
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
    </div>
  );
};


