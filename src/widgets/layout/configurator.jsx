import React, { useEffect, useState } from "react";
import { 
  XMarkIcon, 
  Cog6ToothIcon, 
  UserPlusIcon, 
  TrashIcon, 
  BanknotesIcon, 
  CubeIcon, 
  CreditCardIcon 
} from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
  Card,
  CardBody,
  List,
  ListItem,
  ListIcon,
  Tooltip,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
  setShowConnections,
} from "@/context";
import { useDispatch, useSelector } from "react-redux";
import { attREf, logout } from "@/redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";

function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number === 1000 && i < abbrev.length - 1) {
        number = 1;
        i++;
      }

      number += abbrev[i];
      break;
    }
  }

  return number;
}

export function Configurator() {
  const [controller, dispatcher] = useMaterialTailwindController();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar, showConnections } = controller;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stars, setStars] = useState(0);

  const handleLogout = () => {
    dispatch(logout());
    // Optionally, navigate to login page after logout
    navigate('/login');
  };

  const sidenavColors = {
    white: "from-gray-100 to-gray-100 border-gray-200",
    dark: "from-black to-black border-gray-200",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-400 to-pink-600",
  };

  useEffect(() => {
    fetch(
      "https://api.github.com/repos/creativetimofficial/material-tailwind-dashboard-react"
    )
      .then((response) => response.json())
      .then((data) => setStars(formatNumber(data.stargazers_count, 1)))
      .catch((error) => console.error("Error fetching GitHub stars:", error));
  }, []);

  const zone = 'Brototype';

  const fetchAttendanceList = (zone) => {
    return axios.get(`${BaseUrl}/api/users`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching attendance:', error);
        return [];
      });
  };

  const handleAttendance = async () => {
    // Implement attendance fetching logic if needed
    navigate('/attendance/live');
    setOpenConfigurator(dispatcher, false); // Close configurator
  };

  const handleAttendanceLive = async () => {
    // Implement attendance live fetching logic if needed
    navigate('/attendance/marker');
    setOpenConfigurator(dispatcher, false); // Close configurator
  };

  const handleDelivery = () => {
    window.location.href = 'https://dev-delivery-beta.vercel.app/';
    setOpenConfigurator(dispatcher, false); // Close configurator
  };

  const handleLinkClick = () => {
    setOpenConfigurator(dispatcher, false);
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-full bg-white dark:bg-gray-800 px-2 py-6 shadow-lg transition-transform duration-300 ${
        openConfigurator ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div>
          <Typography className="font-normal text-blue-gray-600">
            Settings
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => setOpenConfigurator(dispatcher, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      {/* Configuration Sections */}
      <div 
        className="space-y-6 overflow-y-auto h-full"
        style={{
          scrollbarWidth: 'none', // For Firefox
          msOverflowStyle: 'none', // For Internet Explorer
        }}
      >
        {/* Additional Settings Section */}
        <Card className="bg-gray-50 dark:bg-gray-700">
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5" />
              Settings
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              Manage your account settings.
            </Typography>
            <List>
              <ListItem>
                <Link 
                  to="/dashboard/NewOrders" 
                  className="flex items-center gap-2 text-red-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  <UserPlusIcon className="h-5 w-5" />
                  New Users
                </Link>
              </ListItem>
              <ListItem>
                <Link 
                  to="/dashboard/deleted-users" 
                  className="flex items-center gap-2 text-blue-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  <TrashIcon className="h-5 w-5" />
                  Deleted Users
                </Link>
              </ListItem>
              <ListItem>
                <Link 
                  to="/dashboard/accounts" 
                  className="flex items-center gap-2 text-blue-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Accounts
                </Link>
              </ListItem>
              <ListItem>
                <Link 
                  to="/dashboard/CreateCategory" 
                  className="flex items-center gap-2 text-blue-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  <CubeIcon className="h-5 w-5" />
                  Connections and Bulk
                </Link>
              </ListItem>
              <ListItem>
                <Link 
                  to="/dashboard/transactions" 
                  className="flex items-center gap-2 text-blue-500 hover:underline"
                  onClick={handleLinkClick}
                >
                  <BanknotesIcon className="h-5 w-5" />
                  Transaction & Payment
                </Link>
              </ListItem>
              {/* Add more settings links as needed */}
            </List>
          </CardBody>
        </Card>

        {/* Attendance Section */}
        <Card className="bg-gray-50 dark:bg-gray-700">
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5" />
              Attendance Management
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              Add or mark daily attendance.
            </Typography>
            <div className="flex flex-col gap-2">
              <Button
                variant={sidenavType === "transparent" ? "gradient" : "outlined"}
                onClick={handleAttendanceLive}
                className="flex items-center justify-center"
              >
                Live Attendance
              </Button>
              <Button
                variant={sidenavType === "white" ? "gradient" : "outlined"}
                onClick={handleAttendance}
                className="flex items-center justify-center"
              >
                Mark Attendance
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Delivery Manager Section */}
        <Card className="bg-gray-50 dark:bg-gray-700">
          <CardBody>
            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
              <CubeIcon className="h-5 w-5" />
              Delivery Manager
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              Add or manage deliveries.
            </Typography>
            <div className="flex flex-col gap-2">
              <Button
                variant={sidenavType === "transparent" ? "gradient" : "outlined"}
                onClick={() => {
                  setSidenavType(dispatcher, "transparent");
                  setOpenConfigurator(dispatcher, false); // Close configurator
                }}
                className="flex items-center justify-center"
              >
                Add Delivery
              </Button>
              <Button
                variant={sidenavType === "white" ? "gradient" : "outlined"}
                onClick={handleDelivery}
                className="flex items-center justify-center"
              >
                Manage Delivery
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Logout Section */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="gradient"
            color="red"
            fullWidth
            className="flex items-center justify-center gap-2 mb-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
