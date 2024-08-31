import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Alert } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "@/constants/BaseUrl";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleDelivery = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be 10 digits.");
      return;
    }
    if (!/^\d{4}$/.test(code)) {
      setError("Code must be 4 digits.");
      return;
    }
    try {
      const response = await axios.post(`${BaseUrl}/api/delivery_login`, {
        phone,
        code,
      });
      if (response.status === 200) {
        navigate("/delivery/points");
      }
    } catch (err) {
      setError("Invalid phone number or code.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-semibold mb-4">Delivery Login</h2>
        <div className="mb-4">
          <Input
            label="Phone Number"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength="10"
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Input
            label="4-digit Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="4"
            className="w-full"
          />
        </div>
        {error && (
          <Alert color="red" className="mb-4">
            {error}
          </Alert>
        )}
        <Button
          color="orange"
          fullWidth
          onClick={handleDelivery}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
