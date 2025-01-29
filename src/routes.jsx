import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Home, Pendings, Tables } from "@/pages/dashboard";
import { SignIn } from "@/pages/auth";
import Add from "./pages/dashboard/add";
import Edit from "./pages/dashboard/edit";
import { Notebook, PenBox, Send } from "lucide-react";
import { TodaysLeave } from "./pages/dashboard/TodaysLeave";
import { ExpiredUsers } from "./pages/dashboard/ExpiredUsers";
import DeletedUsers from "./components/settings/DeletedUsers";
import AccountPage from "./components/settings/Accounts";
import CreateCategory from "./pages/dashboard/CreateCategory";
import GlobalSearch from "./pages/dashboard/GlobalSearch";
import OrdersList from "./components/user/UserOrderPage";
import NewOrders from "./components/settings/NewOrders";
import Notify from "./pages/dashboard/Notify";

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
        icon: <Send {...icon} />,
        name: "Expiry",
        path: "/Expiry",
        element: <ExpiredUsers />,
      }, {
        icon: <PenBox {...icon} />,
        name: "Pendings",
        path: "/Pendings",
        element: <Pendings/>,
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
        element: <Notify />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "NewOrders",
        path: "/NewOrders",
        element: <NewOrders/>,
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
    ],
  },                       
                                       
];

export default routes;
