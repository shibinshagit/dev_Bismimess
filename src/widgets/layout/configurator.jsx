import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Switch,
  Typography,
  Chip,
} from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";
import { useDispatch, useSelector } from "react-redux";
import { attREf, logout } from "@/redux/reducers/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "@/constants/BaseUrl";


function formatNumber(number, decPlaces) {
  decPlaces = Math.pow(10, decPlaces);

  const abbrev = ["K", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);

    if (size <= number) {
      number = Math.round((number * decPlaces) / size) / decPlaces;

      if (number == 1000 && i < abbrev.length - 1) {
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
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } = controller;
  const navigate = useNavigate();
  const [stars, setStars] = React.useState(0);
  const dispatch = useDispatch()
  const handleLogout = () => {
dispatch(logout())
  }

  const sidenavColors = {
    white: "from-gray-100 to-gray-100 border-gray-200",
    dark: "from-black to-black border-gray-200",
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-400 to-pink-600",
  };

  React.useEffect(() => {
    const stars = fetch(
      "https://api.github.com/repos/creativetimofficial/material-tailwind-dashboard-react"
    )
      .then((response) => response.json())
      .then((data) => setStars(formatNumber(data.stargazers_count, 1)));
  }, []);
const zone ='Brototype'
  const fetchAttendanceList = (zone) => {
    return axios.get(`${BaseUrl}/api/users`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching attendance:', error);
        return [];
      });
  };
  const handleAttendance = async () => {
    // const att = await fetchAttendanceList(zone);
    // const filteredData = att.map(user => ({
    //   name: user.name,
    //   phone: user.phone,
    //   status: user.latestOrder?.status || 'N/A'
    // }));
    // dispatch(attREf({ att: filteredData }));
    navigate('/attendance/live');
  };
  const handleAttendanceLive = async () => {
    // const att = await fetchAttendanceList(zone);
    // const filteredData = att.map(user => ({
    //   name: user.name,
    //   phone: user.phone,
    //   status: user.latestOrder?.status || 'N/A'
    // }));
    // dispatch(attREf({ att: filteredData }));
    navigate('/attendance/marker');
  };

  const handleDelivery = async () => {
    window.location.href = 'https://dev-delivery-beta.vercel.app/';
  };
  



  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-2.5 shadow-lg transition-transform duration-300 ${
        openConfigurator ? "translate-x-0" : "translate-x-96"
      }`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div>
          <Typography variant="h5" color="blue-gray">
            Dashboard Configurator
          </Typography>
          <Typography className="font-normal text-blue-gray-600">
            Bismimess OMS.
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
      <div className="py-4 px-6">
       
        <div className="mb-12">
          <Typography variant="h6" color="blue-gray">
           Attendence Login 
          </Typography>
          <Typography variant="small" color="gray">
            Add/Mark daily attendence
          </Typography>
          <div className="mt-3 flex items-center gap-2">
         
            <Button
              variant={sidenavType === "transparent" ? "gradient" : "outlined"}
              onClick={handleAttendanceLive}
            >
             Live
            </Button>
            <Button
  variant={sidenavType === "white" ? "gradient" : "outlined"}
  onClick={handleAttendance}
>
  attendance
</Button>

          </div>
        </div>
        <div className="mb-12">
          <Typography variant="h6" color="blue-gray">
           Delivery Manager 
          </Typography>
          <Typography variant="small" color="gray">
            Add/manage  Delivery
          </Typography>
          <div className="mt-3 flex items-center gap-2">
            {/* <Button
              variant={sidenavType === "dark" ? "gradient" : "outlined"}
              onClick={() => setSidenavType(dispatcher, "dark")}
            >
              Dark
            </Button> */}
            <Button
              variant={sidenavType === "transparent" ? "gradient" : "outlined"}
              onClick={() => setSidenavType(dispatcher, "transparent")}
            >
             Add Delivery
            </Button>
            <Button
  variant={sidenavType === "white" ? "gradient" : "outlined"}
  onClick={handleDelivery}
>
  Delivery
</Button>

          </div>
        </div>
       
        <div className="mb-12">
          <hr />
          <div className="flex items-center justify-between py-5">
            <Typography variant="h6" color="blue-gray">
              Navbar Fixed
            </Typography>
            <Switch
              id="navbar-fixed"
              value={fixedNavbar}
              onChange={() => setFixedNavbar(dispatcher, !fixedNavbar)}
            />
          </div>
          <hr />
        </div>
        <div className="text-center">
          <Typography variant="h6" color="blue-gray">
         
          </Typography>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={handleLogout}
              variant="gradient"
              className="flex items-center gap-2"
            >
              <i className="text-white" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
