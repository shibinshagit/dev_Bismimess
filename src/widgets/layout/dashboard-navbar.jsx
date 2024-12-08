import { useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Input,
  Menu,
  MenuHandler,
  IconButton,
  Switch,
} from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Bell, Settings as SettingsIcon } from "lucide-react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSearchTerm,
  setShowConnections,
} from "@/context";
import { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl"; // If your BaseUrl is defined here
import io from 'socket.io-client';
const socket = io("wss://admin.bismimess.online", {
  transports: ["websocket", "polling"], // Ensure fallback support for polling
  secure: true,
});



export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, showConnections } = controller;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // Replace with your actual endpoint
        const response = await axios.get(`${BaseUrl}/api/countNotify`);
        if (response.data && typeof response.data.count === "number") {
          setUnreadCount(response.data.count);
        } else {
          console.error("Invalid response for unread count:", response.data);
        }
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };

    fetchUnreadCount();

    socket.on('newNote', () => {
      fetchUnreadCount();
      setNotificationMessage("New message is received");
      setShowNotification(true);

      // Auto-hide the notification after 3 seconds
      setTimeout(() => setShowNotification(false), 9000);

    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.off('newNote');
    };

  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(dispatch, value);
  };

  const handleFocus = () => {
    if (!pathname.includes("globalSearch")) {
      navigate("Global");
    }
  };

  const pageConfig = {
    tables: { title: "Customer Data", showSearch: true, addButton: true, toggle: true },
    home: { showSearch: true, notifications: true, addButton: true },
    settings: { showSearch: true },
    Global: { showSearch: true },
    accounts: { title: "Transactions" },
    "deleted-users": { title: "Deleted Users" },
    Expiry: { title: "Expired Customers", showSearch: true },
    leave: { title: "Leaves Today", showSearch: true },
    delivery: { addButton: true },
    notify: { title: " ", addButton: true },
  };

  const { title, showSearch, addButton, notifications, toggle } = pageConfig[page] || {};

  return (
    <Navbar
      color=""
      className={`bg-white text-white rounded transition-all ${
        fixedNavbar ? "sticky top-0 z-40 py-3 shadow-md shadow-blue-gray-500/5" : "sticky top-0 px-0 py-1 z-40 p-3"
      } lg:border-2 border-gray-300 lg:m-2 lg:rounded-xl`}
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <Typography
          variant="h6"
          color="blue-gray"
          className="capitalize flex items-center justify-between"
        >
          <span>{title || page}</span>
          {toggle && (
            <div className="flex items-center space-x-2">
              <Typography variant="h6" color="blue-gray">
                Connections
              </Typography>
              <Switch
                id="show-connections"
                checked={showConnections}
                onChange={() => setShowConnections(dispatch, !showConnections)}
              />
            </div>
          )}
        </Typography>

        <div className="flex items-center">
          {showSearch && (
            <Input
              type="text"
              label="Search"
              onChange={handleSearch}
              onFocus={handleFocus}
              className="md:mr-4 md:w-56"
            />
          )}

          {addButton && (
            <div className="hidden lg:block">
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => navigate("add")}
              >
                <PlusCircleIcon className="h-7 w-7 text-blue-gray-500" />
              </IconButton>
            </div>
          )}

          {notifications && (
            <div className="relative">
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => navigate("notify")}
              >
                <Bell className="h-6 w-6 text-blue-gray-500" />
              </IconButton>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          )}

          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <SettingsIcon className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
      {showNotification && (
        <div
  className="fixed top-10 left-1/2 transform -translate-x-1/2 
             bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg w-80
             flex items-center gap-4 animate-fade-in-down transition-transform"
>
    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-inner">
      <Bell className="text-blue-500 w-4 h-4" />
    </div>
    <div>
      <p className="font-semibold text-md">New Notification</p>
      <p className="text-sm opacity-90">{notificationMessage}</p>
    </div>
  </div>
)}

    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
