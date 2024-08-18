import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Chip,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  fetchStatistics,
  placeStatisticsData, // Add this to fetch place-based statistics
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "@/redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";
import { useMaterialTailwindController } from "@/context";
import { BaseUrl } from "@/constants/BaseUrl";
import axios from "axios";

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
  
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const filteredUsers = users;

  const fetchPoints = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/points`); // Adjust the endpoint accordingly
      setPoints(response.data);
    } catch (error) {
      console.error("Error fetching points:", error);
      setError("Error fetching points. Please try again later.");
    }
  };


  // useEffect(() => {
  //   const updateStatistics = async () => {
  //     setLoading(true);
  //     setError("");
  //     try {
  //       await fetchStatistics(date.toISOString().split("T")[0], customers);
  //     } catch (err) {
  //       setError("Error fetching statistics. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   updateStatistics();
  // }, [date]);
  
  useEffect(() => {
    console.log('here',statisticsCardsData)
    const updateStatistics = async () => {
      setLoading(true);
      setError("");
      try {
        await fetchStatistics(date.toISOString().split("T")[0]);
      } catch (err) {
        setError("Error fetching statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    updateStatistics();
    fetchPoints();
  }, [date]);


  const handleUpdate = (user) => {
    navigate(`/dashboard/edit`, { state: { user } });
  };


  const handleDateChange = (date) => {
    setDate(date);
  };


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="mt-9">
      <div className="mb-12 grid gap-y-3 gap-x-3 grid-cols-2">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>
<div className="flex">
<Typography className="font-bold text-dark-600">
           
              
              </Typography>
<DatePicker
          selected={date}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="form-control px-3 py-2 border border-blue-gray-300 rounded-md"
          wrapperClassName=""
        />
</div><Typography className="font-bold text-dark-600 mt-3 text-center">
                <strong>Active Locations</strong>
              
              </Typography>

<div className="mt-6 mb-16">
        {points.map(({ place, mode }) => (
          <Card key={place} className="mb-4 shadow-md">
            <Menu>
              <MenuHandler>
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <Typography variant="h6" color="blue-gray">
                    {place} ({mode === "cluster" ? "Cluster" : "Single"})
                  </Typography>
                  <ChevronDownIcon className="w-5 h-5 text-blue-gray-600" />
                </div>
              </MenuHandler>
              <MenuList className="p-4">
                <MenuItem>
                  <Typography variant="small" className="font-medium">
                    Mode: {mode}
                  </Typography>
                </MenuItem>
                {/* Add more MenuItems if there's additional data to show */}
              </MenuList>
            </Menu>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Home;
