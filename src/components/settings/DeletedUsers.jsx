import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../constants/BaseUrl';
import {
  Card,
  CardBody,
  Typography,
  List,
  ListItem,
  Avatar,
  Button,
  Input,
} from "@material-tailwind/react";
import { TrashIcon, SearchIcon } from 'lucide-react';

const DeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDeletedUsers = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/deleted-users`);
      setDeletedUsers(response.data);
    } catch (error) {
      console.error('Error fetching deleted users:', error);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const handlePermanentDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${BaseUrl}/api/users/${userId}/permanent`);
      if (response.status === 200) {
        alert('User permanently deleted');
        setDeletedUsers(deletedUsers.filter((user) => user._id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      const response = await axios.post(`${BaseUrl}/api/users/${userId}/restore`);
      if (response.status === 200) {
        alert('User restored successfully');
        setDeletedUsers(deletedUsers.filter((user) => user._id !== userId));
      } else {
        alert('Failed to restore user');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      alert('An error occurred while restoring the user');
    }
  };

  // Filtered users based on search term
  const filteredUsers = deletedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.point.place.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <Card className="overflow-hidden shadow-lg">
        <CardBody>
          {/* Search and Count Container */}
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between">
            {/* Total Count */}
            <Typography variant="h6" className="mb-2 sm:mb-0">
              Total Deleted Users: {deletedUsers.length}
            </Typography>
            {/* Search Input */}
            <div className="w-full sm:w-1/3">
              <Input
                icon={<SearchIcon className="w-5 h-5 text-gray-500" />}
                placeholder="Search by name, phone, or place"
                variant="static"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <Typography className="text-center text-lg">No deleted users found.</Typography>
          ) : (
            <List>
              {filteredUsers.map((user) => (
                <ListItem key={user._id} className="flex flex-col sm:flex-row items-center justify-between border-b last:border-b-0 py-2">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0 w-full sm:w-auto">
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                      alt={user.name}
                      size="sm"
                    />
                    <div className="flex flex-col">
                      <Typography variant="small" className="font-medium text-base sm:text-lg">
                        {user.name}
                      </Typography>
                      <Typography variant="small" className="text-gray-600 text-sm">
                        {user.phone}
                      </Typography>
                      <Typography variant="small" className="text-gray-600 text-sm">
                        Point: {user.point.place}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto justify-end">
                    <Button
                      color="green"
                      size="sm"
                      onClick={() => handleRestoreUser(user._id)}
                      className="w-full sm:w-auto"
                    >
                      Restore
                    </Button>
                    <Button
                      color="red"
                      size="sm"
                      onClick={() => handlePermanentDeleteUser(user._id)}
                      className="w-full sm:w-auto"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DeletedUsers;
