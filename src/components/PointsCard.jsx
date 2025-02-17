// src/components/PointCard.jsx

import React from "react";
import {
  Typography,
  List,
  ListItem,
  Avatar,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";

// Custom CSS for shining effect
const styles = {
  shiningEffect: {
    background: "linear-gradient(270deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.5) 100%)",
    backgroundSize: "200% 100%",
    animation: "shine 1.5s infinite",
  },
};
const handleUpdate = (user) => {
 
};
const UserItem = ({ user }) => (
  <Link 
  to="/dashboard/edit" 
  state={{ user }}
>
  <ListItem className="flex items-center bg-red-900 space-x-3 p-1 rounded-lg shadow-sm mb-2 relative overflow-hidden" onClick={() => handleUpdate(user)}>
    
    <div className="absolute inset-0" style={styles.shiningEffect}></div>
    <Avatar
      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
      alt={user.name}
      size="sm"
    />
    <div className="relative z-10">
      <Typography variant="small" color="blue-gray" className="font-medium">
        {user.name}
      </Typography>
      <div>
        <h3>Meal Plan:</h3>
        {user.latestOrder?.plan && user.latestOrder.plan.length > 0 ? (
          <ul>
            {user.latestOrder.plan.map((element, index) => (
              <li key={index} className="bg-blue-100 text-blue-800 p-2 rounded mb-2">
                {element}
              </li>
            ))}
          </ul>
        ) : (
          <p>No plan available for the latest order.</p>
        )}
      </div>
      <Typography variant="small" color="gray" className="text-xs">
        {user.phone}
      </Typography>
    </div>
  </ListItem>
  </Link>
);

// Adding keyframes for the shine effect
const shineKeyframes = `
@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const PointCard = ({ point }) => {
  const { place, totalUsers, totalLeaveToday, usersOnLeaveToday } = point;

  return (
    <>
      <style>{shineKeyframes}</style>
      <div className={`bg-white shadow-lg rounded-lg mb-6 border-l-4 ${totalLeaveToday > 0 ? "border-red-500" : "border-green-500"}`}>
        <div className="flex items-center justify-between p-2 mb-1">
          <Typography variant="h5" className="font-semibold text-gray-800">
            {place}  <Typography variant="small" color="gray" className={`font-bold ${totalLeaveToday > 0 ? "text-red-600" : "text-green-600"}`}>
               Leave : {totalLeaveToday}/{totalUsers}
            </Typography>
          </Typography>
          
          {totalLeaveToday > 0 ? (
            <XCircleIcon className="h-6 w-6 text-red-500" />
          ) : (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          )}
        </div>

      

        <div>
          
          {totalLeaveToday > 0 ? (
            <List>
              {usersOnLeaveToday.map((user) => (
                <UserItem key={user._id} user={user} />
              ))}
            </List>
          ) : (
            <Typography variant="small" color="gray" className="italic p-2">
              No leave today.
            </Typography>
          )}
        </div>
      </div>
    </>
  );
};

export default PointCard;
