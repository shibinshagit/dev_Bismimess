import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
} from "@material-tailwind/react";
import { BaseUrl } from "@/constants/BaseUrl";
import { DeliveryBoyList, DeliveryForm } from "@/components/delivery";
import { PointModal } from "@/components/Points";
import { PlusIcon } from "lucide-react";
import { useMaterialTailwindController } from "@/context";


export function UpcomingDelivery() {
  const [openForm, setOpenForm] = useState(false);
  const [openDeliveryBoy, setOpenDeliveryBoy] = useState({});
  const [points, setPoints] = useState([{ id: '', name: '', mode: '' }]);
  const [pointsList, setPointsList] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [openPointModal, setOpenPointModal] = useState(false);
  const [newPoint, setNewPoint] = useState({ place: '', mode: 'single' });
  const [controller] = useMaterialTailwindController();
  const { openDeliveryForm } = controller;
  const [newDeliveryBoy, setNewDeliveryBoy] = useState({
    name: "",
    phone: "",
    code: "",
    points: [],
  });

  useEffect(() => {
    fetchPoints();
    fetchDeliveryBoys();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`);
      setPointsList(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/delivery-boys`);
      setDeliveryBoys(response.data);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

  const toggleDeliveryBoy = (index) => {
    setOpenDeliveryBoy((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleAddPoint = () => {
    setPoints([...points, { id: '', name: '', mode: '' }]);
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  const handleRemovePoint = (index) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  const handleDeliveryBoyChange = (e) => {
    setNewDeliveryBoy({
      ...newDeliveryBoy,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddDeliveryBoy = async () => {
    try {
      const response = await axios.post(
        `${BaseUrl}/api/delivery-boys`,
        newDeliveryBoy
      );
      setDeliveryBoys([...deliveryBoys, response.data]);
      setNewDeliveryBoy({ name: "", phone: "", code: "", points: [] });
      setOpenForm(false);
    } catch (error) {
      console.error("Error adding delivery boy:", error);
    }
  };

  const handleDeleteDeliveryBoy = async (id) => {
    try {
      await axios.delete(`${BaseUrl}/api/delivery-boys/${id}`);
      setDeliveryBoys(deliveryBoys.filter((boy) => boy._id !== id));
    } catch (error) {
      console.error("Error deleting delivery boy:", error);
    }
  };

  const toggleForm = () => setOpenForm(!openForm);
  const togglePointModal = () => setOpenPointModal(!openPointModal);
  const handleNewPointChange = (e) => setNewPoint({ ...newPoint, [e.target.name]: e.target.value });
  const handleSelectChange = (value) => setNewPoint({ ...newPoint, mode: value });
  const handleAddNewPoint = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/api/points`, newPoint);
      setPointsList([...pointsList, response.data]);
      setNewPoint({ place: '', mode: 'single' });
      setOpenPointModal(false);
    } catch (error) {
      console.error("Error adding new point:", error);
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader color="orange" className="flex justify-between items-center">
       
      </CardHeader>
      <CardBody className="px-4">
        <DeliveryForm
          isOpen={openDeliveryForm}
          toggleForm={toggleForm}
          points={points}
          pointsList={pointsList}
          newDeliveryBoy={newDeliveryBoy}
          handleDeliveryBoyChange={handleDeliveryBoyChange}
          handleAddPoint={handleAddPoint}
          handleRemovePoint={handleRemovePoint}
          handlePointChange={handlePointChange}
          handleAddDeliveryBoy={handleAddDeliveryBoy}
          setOpenPointModal={setOpenPointModal}
        />
        <DeliveryBoyList
          deliveryBoys={deliveryBoys}
          openDeliveryBoy={openDeliveryBoy}
          toggleDeliveryBoy={toggleDeliveryBoy}
          handleDeleteDeliveryBoy={handleDeleteDeliveryBoy}
        />
      </CardBody>
      <PointModal
        isOpen={openPointModal}
        toggleModal={togglePointModal}
        newPoint={newPoint}
        handleNewPointChange={handleNewPointChange}
        handleSelectChange={handleSelectChange}
        handleAddNewPoint={handleAddNewPoint}
      />
    </Card>
  );
}

export default UpcomingDelivery;
