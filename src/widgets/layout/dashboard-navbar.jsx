import { useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Input,
  Menu,
  MenuHandler,
  IconButton,
  MenuList,
  Switch,
} from "@material-tailwind/react";
import {
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { Bell, MenuIcon, SettingsIcon } from "lucide-react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSearchTerm,
  setOpenDeliveryForm,
  setShowConnections,
} from "@/context";
import { useState } from "react";

export function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, showConnections } = controller;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

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
    tables: { title: "Customer Data", showSearch: true, addButton: true ,toggle: true},
    home: { showSearch: true, notifications: true, addButton: true },
    settings: { showSearch: true },
    Global: { showSearch: true },
    accounts: { title: "Transactions" },
    "deleted-users": { title: "Deleted Users" },
    Expiry: { title: "Expired Customers", showSearch: true },
    leave: { title: "Leaves Today", showSearch: true },
    delivery:{ addButton: true },
    notify: {title:" ", addButton: true },
  };

  const { title, showSearch, addButton, notifications, toggle } = pageConfig[page] || {};

  return (
    <Navbar
      color=""
      className={`bg-white text-white rounded transition-all ${
        fixedNavbar
          ? "sticky top-0 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "sticky top-0 px-0 py-1 z-40 p-3"
      }
       ${
    // Styles for larger screens
    "lg:border-2 border-gray-300 lg:m-2 lg:rounded-xl"
  }`}
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
  <div className="hidden lg:block"> {/* Hidden by default, visible only on lg screens and up */}
    <Menu>
      <MenuHandler>
        <IconButton
          variant="text"
          color="blue-gray"
        
        >
          <PlusCircleIcon   onClick={() => navigate("add")} className="h-7 w-7 text-blue-gray-500" />
        </IconButton>
      </MenuHandler>
    </Menu>
  </div>
)}

          {notifications && (
            <Menu>
              <MenuHandler>
                <IconButton
                  variant="text"
                  color="blue-gray"
                  
                >
                  <Bell onClick={() => navigate("notify")}  className="h-6 w-6 text-blue-gray-500" />
                </IconButton>
              </MenuHandler>
             
            </Menu>
          )}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <SettingsIcon className="h-6 w-6  text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
