// src/components/PointCard.jsx

import React from "react";
import {
  Typography,
  List,
  ListItem,
  Avatar,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

// Custom CSS for shining effect
const styles = {
  shiningEffect: {
    background: "linear-gradient(270deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.5) 100%)",
    backgroundSize: "200% 100%",
    animation: "shine 1.5s infinite",
  },
};

const UserItem = ({ user }) => (
  <ListItem className="flex items-center bg-red-900 space-x-3 p-3 rounded-lg shadow-sm mb-2 relative overflow-hidden">
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
      <Typography variant="small" color="gray" className="text-xs">
        {user.phone}
      </Typography>
    </div>
  </ListItem>
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
      <div className={`bg-white shadow-lg rounded-lg p-6 mb-6 border-l-4 ${totalLeaveToday > 0 ? "border-red-500" : "border-green-500"}`}>
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h5" className="font-semibold text-gray-800">
            {place}
          </Typography>
          {totalLeaveToday > 0 ? (
            <XCircleIcon className="h-6 w-6 text-red-500" />
          ) : (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="small" color="gray" className="font-semibold">
              Total Users:
            </Typography>
            <Typography variant="h6" className="font-bold text-gray-800">
              {totalUsers}
            </Typography>
          </div>
          <div>
            <Typography variant="small" color="gray" className="font-semibold">
              Total Leave Today:
            </Typography>
            <Typography
              variant="h6"
              className={`font-bold ${totalLeaveToday > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {totalLeaveToday}
            </Typography>
          </div>
        </div>

        <div>
          <Typography variant="small" color="black" className="font-semibold mb-2">
            Users on Leave Today
          </Typography>
          {totalLeaveToday > 0 ? (
            <List>
              {usersOnLeaveToday.map((user) => (
                <UserItem key={user._id} user={user} />
              ))}
            </List>
          ) : (
            <Typography variant="small" color="gray" className="italic">
              No leave today.
            </Typography>
          )}
        </div>
      </div>
    </>
  );
};

export default PointCard;
