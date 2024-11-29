import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HomeModernIcon,
  TruckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Home, Settings, Tables, UpcomingDelivery } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Add from "./pages/dashboard/add";
import Edit from "./pages/dashboard/edit";
import LeaveForm from "./pages/dashboard/leave";
import Kitchen from "./pages/dashboard/kitchen";
import Marker from "./pages/attendance/marker";
import Delivery from "./layouts/delivery";
import Points from "./pages/delivery/points";
import DeliveryLogin from "./pages/delivery/deliveryLogin";
import { Notebook, Send, SettingsIcon } from "lucide-react";
import { TodaysLeave } from "./pages/dashboard/TodaysLeave";
import { ExpiredUsers } from "./pages/dashboard/ExpiredUsers";
import { Attendance } from "./pages/dashboard/Attendence";
import DeletedUsers from "./components/settings/DeletedUsers";
import AccountPage from "./components/settings/Accounts";
import NewOrders from "./pages/dashboard/Notify";
import CreateCategory from "./pages/dashboard/CreateCategory";
import GlobalSearch from "./pages/dashboard/GlobalSearch";
import OrdersList from "./components/user/UserOrderPage";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dash",
        path: "/home",
        element: <Home />,
      },{
        icon: <Notebook {...icon} />,
        name: "Leaves",
        path: "/leave",
        element: <TodaysLeave />,
      },
      {
        icon: <Notebook {...icon} />,
        name: "Leave",
        path: "/delivery",
        element: <UpcomingDelivery />,
      },
      {
        icon: <Send {...icon} />,
        name: "Expiry",
        path: "/Expiry",
        element: <ExpiredUsers />,
      }, {
        icon: <SettingsIcon {...icon} />,
        name: "settings",
        path: "/settings",
        element: <Settings/>,
      }, {
        icon: <ServerStackIcon {...icon} />,
        name: "deletedUsers",
        path: "/deleted-users",
        element: <DeletedUsers />,
      }, {
        icon: <ServerStackIcon {...icon} />,
        name: "Accounts",
        path: "/accounts",
        element: <AccountPage />,
      },
      // {
      //   icon: <HomeModernIcon {...icon} />,
      //   name: "Kitchen",
      //   path: "/kitchen",
      //   element: <Kitchen />,
      // },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "add",
        path: "/add",
        element: <Add />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "CreateCategory",
        path: "/CreateCategory",
        element: <CreateCategory />,
      },{
        icon: <UserCircleIcon {...icon} />,
        name: "Notify",
        path: "/notify",
        element: <NewOrders />,
      },
     { icon: <UserCircleIcon {...icon} />,
        name: "Search",
        path: "/Global",
        element: <GlobalSearch />,
      },
      { icon: <UserCircleIcon {...icon} />,
        name: "userOrder",
        path: "/userOrder/:userId",
        element: <OrdersList />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "users",
        path: "/tables/:id",
        element: <Tables />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "users",
        path: "/viewdelivery/:id",
        element: <Tables />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "update",
        path: "/edit",
        element: <Edit />,
      },{
        icon: <UserCircleIcon {...icon} />,
        name: "leave",
        path: "/leave",
        element: <LeaveForm />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },                       
  {
    title: "attendance pages",
    layout: "attendance",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "marker",
        path: "/marker",
        element: <Attendance />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "live",
        path: "/live",
        element: <Marker />,
      }
    ],
  },                   
  {
    title: "delivery pages",
    layout: "delivery",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: " ",
        path: "/login",
        element: <DeliveryLogin/>,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "location",
        path: "/points",
        element: <Points />,
      }
    ],
  },                       
];

export default routes;
