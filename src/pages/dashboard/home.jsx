// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, ClockIcon, UserGroupIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { LeafIcon } from "lucide-react";
import { Card, Typography } from "@material-tailwind/react";
import PropTypes from "prop-types";
import { pointsWithStatistics } from "@/services/apiCalls";

// --- StatisticsCard (inline) ---
const shineKeyframes = `
@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;
const styles = {
  shiningEffect: {
    background: "linear-gradient(270deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.5) 100%)",
    backgroundSize: "200% 100%",
    animation: "shine 1.5s infinite",
  },
};

export function StatisticsCard({ icon, title, value, veg }) {
  return (
    <>
      <style>{shineKeyframes}</style>
      <Card className="border bg-gray-400 border-blue-gray-100 shadow-sm p-3 relative overflow-hidden">
        <div className="absolute inset-0" style={styles.shiningEffect}></div>
        <div className="relative z-10 flex flex-col items-center gap-1">
          <Typography variant="small" className="font-medium text-blue-gray-700">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray" className="font-semibold">
            {value}
          </Typography>
        </div>
        <div className="mt-2">
          <span className="flex items-center text-xs font-semibold text-green-800">
            <LeafIcon className="w-4 h-4 mr-1" />
            Veg: {veg || "0"}
          </span>
        </div>
      </Card>
    </>
  );
}
StatisticsCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  veg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// --- PointStatisticsCard (inline) ---
function PointStatisticsCard({ point }) {
  const navigate = useNavigate();
  const {
    _id,
    place,
    mode,
    todaysLeave,
    totalCustomers,
    todaysActiveCustomers,
    totalExpired,
    totalBreakfast,
    totalLunch,
    totalDinner,
    totalVegNeededToday,
    totalVeg,
    vegBreakfastToday,
    vegLunchToday,
    vegDinnerToday,
  } = point;

  return (
    <div
      className={`p-4 shadow-sm rounded-md border ${
        todaysLeave > 0 ? "border-red-500" : "border-gray-500"
      } hover:scale-105 transition-transform cursor-pointer`}
      onClick={() => navigate(`/dashboard/tables/${_id}`)}
      onKeyPress={(e) => e.key === "Enter" && navigate(`/dashboard/tables/${_id}`)}
      tabIndex={0}
      aria-label={`View details for ${place}`}
    >
      <header className="flex justify-between items-center mb-2">
        <Typography variant="h6" className="font-bold text-gray-800">
          {place} ({mode === "cluster" ? "C" : "S"})
        </Typography>
        {todaysLeave > 0 ? (
          <XCircleIcon className="w-4 h-4 text-red-500" />
        ) : (
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
        )}
      </header>

      <section className="space-y-2 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Total:</span> {totalCustomers} |{" "}
          <span className="font-semibold">Active:</span> {todaysActiveCustomers} |{" "}
          <span className="font-semibold">Expired:</span> {totalExpired} |{" "}
          <span className="font-semibold">Leave:</span>{" "}
          <span className={todaysLeave > 0 ? "text-red-600" : "text-gray-700"}>
            {todaysLeave}
          </span>
        </div>

        <div className="flex space-x-2">
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

        <div className="flex items-center text-sm">
          <LeafIcon className="w-4 h-4 mr-1 text-green-800" />
          Veg: {totalVegNeededToday || "0"}/{totalVeg || "0"}
          <span className="ml-3 text-green-800 text-xs font-semibold">
            (B: {vegBreakfastToday || "0"}, L: {vegLunchToday || "0"}, D: {vegDinnerToday || "0"})
          </span>
        </div>
      </section>
    </div>
  );
}

// --- Main Home Component ---
export function Home() {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        setError("");
        const  data  = await pointsWithStatistics()
        setPoints(data);
      } catch {
        setError("Error fetching data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Typography color="red" variant="h6">
          {error}
        </Typography>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  // Aggregate totals
  const total = points.reduce((acc, p) => acc + p.totalCustomers, 0);
  const active = points.reduce((acc, p) => acc + p.todaysActiveCustomers, 0);
  const leave = points.reduce((acc, p) => acc + p.todaysLeave, 0);
  const breakfast = points.reduce((acc, p) => acc + p.totalBreakfast, 0);
  const lunch = points.reduce((acc, p) => acc + p.totalLunch, 0);
  const dinner = points.reduce((acc, p) => acc + p.totalDinner, 0);
  const totalVeg = points.reduce((acc, p) => acc + (p.totalVeg || 0), 0);
  const neededVeg = points.reduce((acc, p) => acc + (p.totalVegNeededToday || 0), 0);
  const leaveVeg = points.reduce((acc, p) => acc + (p.vegOnLeaveToday || 0), 0);
  const breakfastVeg = points.reduce((acc, p) => acc + (p.vegBreakfastToday || 0), 0);
  const lunchVeg = points.reduce((acc, p) => acc + (p.vegLunchToday || 0), 0);
  const dinnerVeg = points.reduce((acc, p) => acc + (p.vegDinnerToday || 0), 0);

  return (
    <div className="mt-3 p-2 bg-gray-100 min-h-screen">
      {/* Overall Statistics */}
      <div className="grid gap-3 grid-cols-3 mb-5">
        <StatisticsCard icon={<UserGroupIcon />} title="Total" value={total} veg={totalVeg} />
        <StatisticsCard icon={<CheckCircleIcon />} title="Active" value={active} veg={neededVeg} />
        <StatisticsCard icon={<ClockIcon />} title="Leave" value={leave} veg={leaveVeg} />
        <StatisticsCard icon={<ClockIcon />} title="Breakfast" value={breakfast} veg={breakfastVeg} />
        <StatisticsCard icon={<ClockIcon />} title="Lunch" value={lunch} veg={lunchVeg} />
        <StatisticsCard icon={<ClockIcon />} title="Dinner" value={dinner} veg={dinnerVeg} />
      </div>

      <Typography className="font-bold text-center mb-3">Active Locations</Typography>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <PointStatisticsCard key={point._id} point={point} />
        ))}
      </div>
    </div>
  );
}
export default Home;