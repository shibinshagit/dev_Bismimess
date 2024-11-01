import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  Select,
  DialogFooter,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
  setSearchTerm,
  setOpenDeliveryForm,
} from "@/context";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

export function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar } = controller;
  const navigate = useNavigate();
  const { pathname, searchTerm } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");


  const handleSearch = (event) => {
    setSearchTerm(dispatch, event.target.value);
  };





  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-0 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      } `}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Typography variant="h6" color="blue-gray">
            {page === 'tables' ? 'costomer data' : page === 'add' ? '' : page === 'edit' ? '' :page === 'Expiry' ? '':page === 'leave' ? '': page  === 'delivery' ? '' : page}
          </Typography>
        </div>
        <div className="flex items-center">
        <div className="mr-auto md:mr-4 md:w-56"> 
          <Typography variant="h6" color="blue-gray">
            {page === 'tables' ? '' : page === 'add' ? '': page === 'home' ? '' : page === 'edit' ? '' :page === 'Expiry' ? 'Expired Customers':page === 'leave' ? 'Leaves Today': page  === 'delivery' ? '' : page}
          </Typography>{page === 'tables' ? 
            <Input
      type="text"
      label="Search" 
      value={searchTerm}
      onChange={handleSearch}
      className="bg-white"
    />
          : page === "home" ? <DatePicker
          // selected={date}
          // onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="form-control px-3 py-2 border border-blue-gray-300 rounded-md"
          wrapperClassName=""
        /> : ''}</div> 
          {page === 'tables' ? <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <PlusCircleIcon className="h-7 w-7 text-blue-gray-500" onClick={() => navigate('add')}/>
              </IconButton>
            </MenuHandler>
          </Menu>:page === 'Expiry' ? '':page === 'leave' ? ''
           : page === 'add' ? '' : page === 'edit' ? '' : page === 'home' ?  <Menu>
           <MenuHandler>
             <IconButton variant="text" color="blue-gray">
               <PlusCircleIcon className="h-7 w-7 text-blue-gray-500" onClick={() => navigate('add')}/>
             </IconButton>
           </MenuHandler>
         </Menu> : page  === 'delivery' ? 
           <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <PlusCircleIcon className="h-7 w-7 text-blue-gray-500"  onClick={() => {
        setIsOpen(!isOpen);
        setOpenDeliveryForm(dispatch, !isOpen);
      }}/>
              </IconButton>
            </MenuHandler>
          </Menu>
           : page}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-7 w-7 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
      <Dialog open={false} handler={false} size="sm">
          <DialogHeader>Add New Point</DialogHeader>
          <DialogBody className="flex flex-col gap-4">
    <Input
      label="Place"
      name="place"
     
    />
    <Select
      label="Mode"
     
    >
      <Option value="single">Single</Option>
      <Option value="cluster">Cluster</Option>
    </Select>
  </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="green"
           
            >
              Save
            </Button>
          </DialogFooter>
        </Dialog>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
