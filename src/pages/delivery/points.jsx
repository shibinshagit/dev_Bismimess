import React, { useState } from "react";
import { Icon } from "leaflet";
import { ArrowLeft, Bike, Clock, Locate } from "lucide-react";
import { Button, Typography } from "@material-tailwind/react";
import "leaflet/dist/leaflet.css";

// Custom icon for the points
const bikeIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Use any bike icon URL or local path
  iconSize: [25, 25],
});

const googleMapsIconUrl = "https://cdn-icons-png.flaticon.com/512/2875/2875433.png"; // Google Maps logo URL

const pointsData = [
  { name: "Brotype", type: "single", status: "Delivered", users: ["sha", "shamal"] },
  { name: "Vytila", type: "cluster", status: "Packed", users: ["murshid", "najaf"] },
  { name: "Maradu", type: "single", status: "Upcoming", users: ["anwer"] },
  { name: "Nettoor", type: "cluster", status: "Delivered", users: ["ashik", "suhaib"] },
  { name: "Bismi mess", type: "single", status: "Packed", users: ["ansar", "ramees"] },
];

export default function Points() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showUsers, setShowUsers] = useState(null);

  const handlePointClick = (index) => {
    setCurrentPosition(index);
    setShowUsers(index === showUsers ? null : index); // Toggle dropdown
  };

  const handleAddLocation = () => {
    // Logic to add current location
    alert("Current location added!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="sticky top-0 z-40 py-3 shadow-md flex items-center justify-between p-4 bg-orange-700 text-white">
        <div className="flex items-center space-x-3">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
          <h1 className="text-lg font-semibold">Delivery Route</h1>
        </div>
        <Button variant="gradient" color="light-yellow" className="rounded-full px-6">
          Call
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

      <div className="flex-1 p-6 bg-gray-200 shadow-inner">
        <div className="relative flex flex-col space-y-8">
          {pointsData.map((point, index) => (
            <div key={index} className="relative flex flex-col">
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
                onClick={() => handlePointClick(index)}
              >
                <Bike className="w-6 h-6" />
              </div>
              <div className="ml-12 flex flex-col">
                <div className="flex items-center space-x-4">
                  <span
                    className={`text-base ${
                      index === currentPosition ? "font-bold text-orange-600" : "font-semibold"
                    }`}
                  >
                    {point.name} ({point.type})
                  </span>
                
                </div>
                <span className="text-sm text-gray-600">
                  {point.status} - {point.users.length} Users
                </span>
              
                {index === showUsers && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-300">
                    <a
  href={`https://www.google.com/maps/dir/?api=1&destination=${point.name}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center space-x-2 bg-white text-dark px-4 py-2 w-2/5 max-w-[150px] rounded-full shadow-xl hover:bg-orange-200 transition"
>
  <img src={googleMapsIconUrl} alt="Google Maps" className="w-4 h-4" />
  {/* <span>Direction</span> */}
  <Typography>View</Typography>
</a>

                    {point.users.map((user, userIndex) => (
                      <div key={userIndex} className="flex justify-between items-center space-y-4 mb-2">
                        <span className="text-sm text-gray-700">{user}</span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outlined" color="green" className="text-sm">
                            Delivered
                          </Button>
                          <Button variant="outlined" color="red" className="text-sm" onClick={handleAddLocation}>
                            <Locate className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-4 bg-orange-50 text-blue-700 text-right">
        <Button variant="gradient" color="gray" className="rounded-full px-6">
          Completed
        </Button>
      </footer>
    </div>
  );
}
