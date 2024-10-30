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
// import UserItem from "./UserItem";
const UserItem = ({ user }) => {
    return (
      <ListItem className="flex items-center space-x-3 bg-gray-300 p-2 rounded-md shadow-sm mb-2">
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
  const { place, totalUsers, totalExpiredUsers, usersExpired } = point;

  return (
    <Card className={`shadow-md border-4 ${totalExpiredUsers > 0 ? "border-red-500" : "border-gray-300"} transition-transform transform hover:scale-105 mb-6`}>
      {/* <CardHeader
        color={totalExpiredUsers > 0 ? "red" : "gray"}
        className="text-white flex items-center justify-between p-3"
      >
      
      </CardHeader> */}
      <CardBody className="p-3">
      <Typography className="flex items-center justify-between" variant="h6"> {place}
        {totalExpiredUsers > 0 ? (
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
        ) : (
          <XCircleIcon className="h-5 w-5 text-red-400" />
        )}
       </Typography>
        <div className="mb-2 flex items-center justify-between">
          <Typography variant="small" color="gray" className="font-semibold">
            Total: {totalUsers}
          </Typography>
          <Typography variant="small" color="gray"  className={`font-bold ${totalExpiredUsers > 0 ? "text-red-600" : "text-gray-700"}`}>
            Expired:{totalExpiredUsers}
          </Typography>
        </div>
        <div>
          <Typography variant="small" color="gray" className="font-semibold mb-1">
            Users Expired:
          </Typography>
          {totalExpiredUsers > 0 ? (
            <List>
              {usersExpired.map((user) => (
                <UserItem key={user._id} user={user} />
              ))}
            </List>
          ) : (
            <Typography variant="small" color="gray" className="italic">
              No expired users.
            </Typography>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default PointCard;
