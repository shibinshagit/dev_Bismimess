// src/components/PointCard.jsx

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  List,ListItem, Avatar,
} from "@material-tailwind/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";


const UserItem = ({ user }) => {
  return (
    <ListItem className="flex items-center space-x-3 bg-yellow-600 p-2 rounded-md shadow-sm mb-2">
      <Avatar
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
        alt={user.name}
        size="sm"
      />
      <div>
        <Typography variant="small" color="blue-gray" className="font-medium">
          {user.name}
        </Typography>
        <Typography variant="small" color="gray">
          {user.phone}
        </Typography>
      </div>
    </ListItem>
  );
};




const PointCard = ({ point }) => {
  const { place, totalUsers, totalLeaveToday, usersOnLeaveToday } = point;

  return (
    <Card className={`shadow-md mb-6 border-l-4 ${totalLeaveToday > 0 ? "border-red-500" : "border-white"} `}>
      <CardHeader
        color={totalLeaveToday > 0 ? "red" : "gray"}
        className="text-white flex items-center justify-between p-3"
      >
        <Typography variant="h6">{place}</Typography>
        {totalLeaveToday > 0 ? (
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
        ) : (
          <XCircleIcon className="h-5 w-5 text-red-400" />
        )}
      </CardHeader>
      <CardBody className="p-3">
        <div className="mb-2">
          <Typography variant="small" color="gray" className="font-semibold">
            Total Users: {totalUsers}
          </Typography>
        </div>
        <div className="mb-2">
          <Typography variant="small" color="gray"  className={`font-bold ${totalLeaveToday > 0 ? "text-red-600" : "text-gray-700"}`}>
            Total Leave Today:{totalLeaveToday}
          </Typography>
        
        </div>
        <div>
          <Typography variant="small" color="black" className="font-semibold mb-1">
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
      </CardBody>
    </Card>
  );
};

export default PointCard;
