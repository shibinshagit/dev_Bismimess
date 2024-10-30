// src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Typography,
  Spinner,
} from "@material-tailwind/react";
import {
  StatisticsChart,
} from "@/widgets/charts";
import {
  fetchStatistics, // Update this if necessary
} from "@/data";
import { CheckCircleIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon,  } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "@/redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";
import { useMaterialTailwindController } from "@/context";
import { BaseUrl } from "@/constants/BaseUrl";
import axios from "axios";



import { Card, CardHeader, CardBody } from "@material-tailwind/react";
import {  XCircleIcon } from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";


const PointStatisticsCard  = ({ point }) => {
  const navigate = useNavigate();
  const {
    place,
    mode,
    totalCustomers,
    todaysActiveCustomers,
    todaysLeave,
    totalBreakfast,
    totalLunch,
    totalDinner,
  } = point;

  return (
    <div
      className={`p-4 shadow-sm rounded-md border ${
        todaysLeave > 0 ? "border-red-500" : "border-gray-500"
      } transition-transform transform hover:scale-105 cursor-pointer`}
      onClick={() => navigate(`/dashboard/tables/${point._id}`)}
      aria-label={`View details for ${place}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') navigate(`/dashboard/tables/${point._id}`);
      }}
    >
      <header className="flex justify-between items-center mb-2">
        <Typography variant="h6" className="text-gray-800 font-bold">
          {place} ({mode === "cluster" ? "C" : "S"})
        </Typography>
        {todaysLeave > 0 ? (
          <XCircleIcon className="w-4 h-4 text-red-500" />
        ) : (
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
        )}
      </header>
      <section className="space-y-2">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Total:</span> {totalCustomers} |{" "}
          <span className="font-semibold">Active:</span> {todaysActiveCustomers} |{" "}
          <span className="font-semibold">Leave:</span> 
          <span className={`${todaysLeave > 0 ? "text-red-600" : "text-gray-700"}`}>
            {todaysLeave}
          </span>
        </div>
        <div className="flex space-x-2 mt-2">
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
            B: {totalBreakfast}
          </span>
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">
            L: {totalLunch}
          </span>
          <span className="bg-yellow-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold">
            D: {totalDinner}
          </span>
        </div>
      </section>
    </div>
  );
};


export function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customers = useSelector((state) => state.auth.customers);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [controller] = useMaterialTailwindController();
  const [users, setUsers] = useState(customers);
  const [points, setPoints] = useState([]);

  // Fetch Points with Statistics
  const fetchPointsWithStatistics = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/pointsWithStatistics`);
      setPoints(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching points with statistics:", error);
      setError("Error fetching points. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateStatistics = async () => {
      setLoading(true);
      setError("");
      try {
        await fetchStatistics(date.toISOString().split("T")[0]);
        await fetchPointsWithStatistics();
      } catch (err) {
        setError("Error fetching statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    updateStatistics();
    // Optionally, you can dispatch(fetchCustomers()) here if needed
  }, [date]);

  const handleUpdate = (user) => {
    navigate(`/dashboard/edit`, { state: { user } });
  };

  const handleDateChange = (date) => {
    setDate(date);
  };

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
    <div className="mt-3 p-2 bg-gray-100 min-h-screen">
      {/* Overall Statistics Cards */}
      <div className="mb-5 grid gap-y-3 gap-x-3 grid-cols-3">
        <StatisticsCard
          title="Total"
          value={points.reduce((acc, point) => acc + point.totalCustomers, 0)}
          icon={<UserGroupIcon />}
          color="blue"
        />
        <StatisticsCard
          title="Active"
          value={points.reduce((acc, point) => acc + point.todaysActiveCustomers, 0)}
          icon={<CheckCircleIcon />}
          color="green"
        />
        <StatisticsCard
          title="Leave"
          value={points.reduce((acc, point) => acc + point.todaysLeave, 0)}
          icon={<ClockIcon />}
          color="red"
        />
        <StatisticsCard
          title="Breakfast"
          value={points.reduce((acc, point) => acc + point.totalBreakfast, 0)}
          icon={<ClockIcon />}
          color="orange"
        />
        <StatisticsCard
          title="Lunch"
          value={points.reduce((acc, point) => acc + point.totalLunch, 0)}
          icon={<ClockIcon />}
          color="green"
        />
        <StatisticsCard
          title="Dinner"
          value={points.reduce((acc, point) => acc + point.totalDinner, 0)}
          icon={<ClockIcon />}
          color="blue"
        />
      </div>

      {/* Date Picker (Optional) */}
      {/* <div className="flex justify-center  w-full">
        <DatePicker
          selected={date}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="px-4 py-2 border border-blue-gray-300 rounded-md"
        />
      </div> */}

      {/* Points with Statistics */}
      <Typography className="font-bold text-dark-600 text-center">
        <strong>Active Locations</strong>
      </Typography>

      <div className="mt-3 mb-16 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <PointStatisticsCard key={point._id} point={point} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

export default Home;
