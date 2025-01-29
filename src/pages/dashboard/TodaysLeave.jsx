// src/pages/TodaysLeave.jsx

import React, { useState, useEffect } from "react";
import {
  Typography,
  Spinner,
} from "@material-tailwind/react";
import PointCard from "@/components/PointsCard";
import { LeavesToday } from "@/services/apiCalls";

export function TodaysLeave () {
  const [pointsData, setPointsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Points with Leave Today Data
  const fetchPointsWithLeaveToday = async () => {
    try {
      const response = await LeavesToday()
      console.log("Fetched Points Data:", response);
      setPointsData(response || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching points with leave today:", err);
      setError("Failed to fetch data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsWithLeaveToday();
  }, []);

  // Frontend Sorting Safeguard (Optional)
  const sortedPoints = [...pointsData].sort((a, b) => {
    if (a.totalLeaveToday > 0 && b.totalLeaveToday === 0) return -1;
    if (a.totalLeaveToday === 0 && b.totalLeaveToday > 0) return 1;
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
  
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3 mb-8">
        {sortedPoints.map((point) => (
          <PointCard key={point.place} point={point} />
        ))}
      </div>
    </div>
  );
};




