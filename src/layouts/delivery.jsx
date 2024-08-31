import { Routes, Route } from "react-router-dom";
import {
  ChartPieIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Navbar, Footer } from "@/widgets/layout";
import routes from "@/routes";

export function Delivery() {
  const navbarRoutes = [
    {
      name: "Delivery",
      path: "/Delivery/login",
      icon: ChartPieIcon,
    },
    {
      name: "Delivery",
      path: "/Delivery/points",
      icon: ChartPieIcon,
    },
  ];

  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === "delivery" &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </div>
  );
}

Delivery.displayName = "/src/layout/Delivery.jsx";

export default Delivery;
