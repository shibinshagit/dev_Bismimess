import { useLocation, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Input,
  Menu,
  MenuHandler,
  IconButton,
  MenuList,
} from "@material-tailwind/react";
import {
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { Bell, MenuIcon } from "lucide-react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSearchTerm,
  setOpenDeliveryForm,
} from "@/context";
import { useState } from "react";

export function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar } = controller;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(dispatch, value);

    if (value.startsWith("/") && !pathname.includes("globalSearch")) {
      navigate("Global");
    }
  };

  const pageConfig = {
    tables: { title: "Customer Data", showSearch: true, addButton: true },
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

  const { title, showSearch, addButton, notifications } = pageConfig[page] || {};

  return (
    <Navbar
      color=""
      className={`bg-white text-white rounded transition-all ${
        fixedNavbar
          ? "sticky top-0 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "sticky top-0 px-0 py-1 z-40 p-3"
      }`}
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <Typography variant="h6" color="blue-gray" className="capitalize">
          {title || page}
        </Typography>

        <div className="flex items-center">
          {showSearch && (
            <Input
              type="text"
              label="Search"
              onChange={handleSearch}
              className="md:mr-4 md:w-56"
            />
          )}
          {addButton && (
            <Menu>
              <MenuHandler>
                <IconButton
                  variant="text"
                  color="blue-gray"
                  onClick={() => navigate("add")}
                >
                  <PlusCircleIcon  onClick={() => navigate("add")} className="h-7 w-7 text-blue-gray-500" />
                </IconButton>
              </MenuHandler>
            </Menu>
          )}
          {notifications && (
            <Menu>
              <MenuHandler>
                <IconButton
                  variant="text"
                  color="blue-gray"
                  onClick={() => navigate("/add")}
                >
                  <Bell className="h-6 w-6 text-blue-gray-500" />
                </IconButton>
              </MenuHandler>
              <MenuList>
                {/* Add dropdown menu items here if necessary */}
              </MenuList>
            </Menu>
          )}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <MenuIcon className="h-7 w-7 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
