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
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "users",
        path: "/tables",
        element: <Tables />,
      },{
        icon: <TruckIcon {...icon} />,
        name: "Supply",
        path: "/delivery",
        element: <UpcomingDelivery />,
      },{
        icon: <HomeModernIcon {...icon} />,
        name: "Kitchen",
        path: "/kitchen",
        element: <Kitchen />,
      },{
        icon: <UserCircleIcon {...icon} />,
        name: "add",
        path: "/add",
        element: <Add />,
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
];

export default routes;
