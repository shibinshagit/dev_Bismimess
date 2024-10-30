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
import { Home, Profile, Tables, UpcomingDelivery } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Add from "./pages/dashboard/add";
import Edit from "./pages/dashboard/edit";
import LeaveForm from "./pages/dashboard/leave";
import Kitchen from "./pages/dashboard/kitchen";
import Marker from "./pages/attendance/marker";
import Delivery from "./layouts/delivery";
import Points from "./pages/delivery/points";
import DeliveryLogin from "./pages/delivery/deliveryLogin";
import { Notebook, Send } from "lucide-react";
import { TodaysLeave } from "./pages/dashboard/TodaysLeave";
import { ExpiredUsers } from "./pages/dashboard/ExpiredUsers";

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
      // {
      //   icon: <Notebook {...icon} />,
      //   name: "Leave",
      //   path: "/delivery",
      //   element: <UpcomingDelivery />,
      // },
      {
        icon: <Send {...icon} />,
        name: "Expiry",
        path: "/Expiry",
        element: <ExpiredUsers />,
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
        name: "login",
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
