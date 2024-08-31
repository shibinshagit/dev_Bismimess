import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { ArrowLeft, Bike, Clock, MapPin } from "lucide-react";
import { Button } from "@material-tailwind/react";
import "leaflet/dist/leaflet.css";

// Custom icon for the points
const bikeIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Use any bike icon URL or local path
  iconSize: [25, 25],
});

const points = [
  { name: "Brotype", type: "single", status: "Delivered" },
  { name: "Vytila", type: "cluster", status: "Packed" },
  { name: "Maradu", type: "single", status: "Upcoming" },
  { name: "Nettoor", type: "cluster", status: "Delivered" },
  { name: "Bismi mess", type: "single", status: "Packed" },
];

export default function Points() {
  const [currentPosition, setCurrentPosition] = useState(2);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-blue-700 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
          <h1 className="text-lg font-semibold">Delivery Route</h1>
        </div>
        <Button variant="gradient" color="light-blue" className="rounded-full px-6">
          Report
        </Button>
      </header>

      <div className="p-4 bg-gray-900 text-white shadow-md">
        <div className="flex justify-between">
          <span className="font-medium">Aug 26, Mon</span>
          <span className="font-medium flex items-center">
            <Clock className="mr-2 w-5 h-5" />
            Lunch
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 relative bg-white shadow-inner">
        <div className="relative flex flex-col space-y-8">
          {points.map((point, index) => (
            <div key={index} className="relative flex items-center">
              {index > 0 && (
                <div
                  className={`absolute left-4 top-0 h-full w-1 transform -translate-y-1/2 ${
                    index <= currentPosition ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg z-10 ${
                  index === currentPosition
                    ? "bg-orange-500 text-white"
                    : index < currentPosition
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                <Bike className="w-6 h-6" />
              </div>
              <div className="ml-5 flex flex-col">
                <span
                  className={`text-base ${
                    index === currentPosition ? "font-bold text-orange-600" : "font-semibold"
                  }`}
                >
                  {point.name} ({point.type})
                </span>
                <span className="text-sm text-gray-600">{point.status}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${point.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline mt-1 flex items-center space-x-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-4 bg-blue-50 text-blue-700 text-right">
        <Button variant="gradient" color="green" className="rounded-full px-6">
          Completed
        </Button>
      </footer>
    </div>
  );
}
