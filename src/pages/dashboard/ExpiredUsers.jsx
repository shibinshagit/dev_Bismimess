// src/pages/ExpiredUsers.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Spinner,
} from "@material-tailwind/react";
import { BaseUrl } from "@/constants/BaseUrl"; // Ensure this points to your backend
import PointCard from "@/components/PointsCardExpiry";

export function ExpiredUsers ()  {
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Points with Expired Users Data
  const fetchPointsWithExpiredUsers = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/pointsWithExpiredUsers`); // Ensure correct endpoint
      console.log("Fetched Points Data:", response.data);
      setPointsData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching points with expired users:", err);
      setError("Failed to fetch data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsWithExpiredUsers();
  }, []);

  // Frontend Sorting Safeguard (Optional)
  const sortedPoints = [...pointsData].sort((a, b) => {
    if (a.totalExpiredUsers > 0 && b.totalExpiredUsers === 0) return -1;
    if (a.totalExpiredUsers === 0 && b.totalExpiredUsers > 0) return 1;
    return a.place.localeCompare(b.place);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Spinner color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Typography color="red" variant="h6">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {sortedPoints.map((point) => (
          <PointCard key={point.place} point={point} />
        ))}
      </div>
    </div>
  );
};


