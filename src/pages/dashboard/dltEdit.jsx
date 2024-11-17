import React, { useState, useEffect } from 'react';
import { useMaterialTailwindController } from '@/context/index';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Switch, Typography, Avatar, Chip, Menu, MenuHandler, MenuList, MenuItem, select} from "@material-tailwind/react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button } from "@material-tailwind/react";
import axios from 'axios';  // Import axios for making API calls
import * as XLSX from 'xlsx';
import { Download, PlusCircleIcon } from 'lucide-react';
import { BaseUrl } from '@/constants/BaseUrl';
import UserAvatar from '../../../public/img/user.jpg';
import dayjs from 'dayjs';
// location fetching temporary=============================================
const handleAddLocation = (userId) => {
  if (!window.confirm("Do you want to update your location?")) {
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.put(`${BaseUrl}/api/user/${userId}`, {
            latitude,
            longitude,
          });

          if (response.status === 200) {
            alert("Location updated successfully!");
            window.location.reload(); // Reloads the page
          } else {
            alert("Failed to update location.");
          }
        } catch (error) {
          console.error("Error updating location:", error);
          alert("An error occurred while updating the location.");
        }
      },
      (error) => {
        alert("Error getting location: " + error.message);
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};




// ====================================================================


export function Tables() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialTailwindController();
  const { searchTerm } = controller;
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showLeaves, setShowLeaves] = useState(false);

  const toggleShowLeaves = () => setShowLeaves(prev => !prev);

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalLeave, setTotalLeave] = useState(0);
  const [reduce, setReduce] = useState(0);
  const [bill, setBill] = useState(0);

  const handleInvoiceDialog = (user) => {
    const totalLeaveDays = user.latestOrder?.leave.reduce((acc, leave) => acc + leave.numberOfLeaves, 0);
    setTotalLeave(totalLeaveDays);
    setSelectedUser(user);

    const planLength = user?.latestOrder?.plan?.length;

    switch (planLength) {
      case 3:
        setBill(3200);
        setReduce(100);
        break;
      case 2:
        setBill(2750);
        setReduce(70);
        break;
      default:
        setBill(1500);
        setReduce(0);
    }

    setOpen(true);
};

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setTotalLeave(totalLeaveDays); // Reset leave input
  };

  const handleSendInvoice = () => {
    const orderEnd = new Date(selectedUser.latestOrder?.orderEnd);
    const orderEndDate = `${orderEnd.getDate().toString().padStart(2, '0')}-${(orderEnd.getMonth() + 1).toString().padStart(2, '0')}-${orderEnd.getFullYear()}`;
    
    const invoiceAmount = bill - totalLeave * reduce; // Calculate invoice amount
    const message = `
    ${selectedUser.name}, your food bill till ${orderEndDate} is as follows:
    
    Total leaves: ${totalLeave}
    Total amount: ₹${bill} 
    Leave deduction: ${totalLeave} x ₹${reduce} = ₹${totalLeave * reduce}
    ------------------------------------
    Amount to pay: ₹${invoiceAmount} 👍
  
    Bismi Mess Payment Method:
  
    Pay to - 9847952414 (Shebeer km)
    (GPay, PhonePe, Paytm, other UPI)
  
    (Send the screenshot after payment)
  `;
  
    const whatsappUrl = `https://wa.me/91${selectedUser.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  const [showConnections, setShowConnections] = useState(false);


  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/users/${id}`);
      setUsers(response.data);
      console.log('res Data:',response.data);
    } catch (err) {
      setError('Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupsOfPoint = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/api/groupByID/`,{
        params: {id}
      });
      setGroups(response.data);
      console.log('res groups:',response.data);
    } catch (err) {
      setError('Error fetching groups.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Fetch users from API
   
  
    fetchUsers();
    fetchGroupsOfPoint();
  }, [id]);  // Make sure to include `id` as a dependency if it's changing
  
  const handleUpdate = (user) => {
    navigate(`/dashboard/edit`, { state: { user } });
  };

  const printData = (filteredUsers) => {
    // Prepare the data to be written into the Excel file
    const data = filteredUsers.map(user => ({
      Name: user.name,
      Phone: user.phone,
      Plan: user.latestOrder?.plan?.join(', ') || '---', // Join array elements into a comma-separated string
      Status: user.latestOrder?.status || 'N/A',
      Expire: user.latestOrder?.orderEnd 
        ? new Intl.DateTimeFormat('en-GB').format(new Date(user.latestOrder.orderEnd)) 
        : 'N/A'
    }));
    

    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate and download the Excel file
    XLSX.writeFile(workbook, `Users ${filteredUsers[0].location}.xlsx`);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const filteredUsers = users
  .filter(user => {
    if (filter === 'All') {
      return true;
    } else {
      return user.latestOrder && user.latestOrder.status.toLowerCase() === filter.toLowerCase();
    }
  })
  .filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )
  .sort((a, b) => {
    // Handle cases where latestOrder is undefined
    const dateA = a.latestOrder ? new Date(a.latestOrder.orderEnd) : new Date();
    const dateB = b.latestOrder ? new Date(b.latestOrder.orderEnd) : new Date();
    return dateA - dateB;
  });

  
  const filteredUserss = users
    .filter(user => user.latestOrder?.orderEnd)
    .sort((a, b) => new Date(a.latestOrder.orderEnd) - new Date(b.latestOrder.orderEnd));

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Process users into groups and individuals
  let groupedData = [];

  if (showConnections) {
    // Build a mapping from group ID to group data
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group._id] = {
        groupName: group.title,
        users: []
      };
    });

    // Prepare individual users array
    const individualUsers = [];

    // Iterate over filteredUsers
    filteredUsers.forEach(user => {
      if (user.group && groupMap[user.group]) {
        // User is in a group
        groupMap[user.group].users.push(user);
      } else {
        // User is individual
        individualUsers.push(user);
      }
    });

    // Build groupedData array
    groupedData = Object.values(groupMap).filter(groupData => groupData.users.length > 0);

    // Add individual users as a group
    groupedData.push({
      groupName: 'Individual Users',
      users: individualUsers
    });
  }

  // Helper function to render user row
  const renderUserRow = (user, key) => {
    // ... existing code to render a user row ...
  };

  // ... existing return statement ...

  return (
    <div className="mt-3 mb-8 flex flex-col gap-12">
      {/* Toggle Switch */}
      <div className="flex justify-between items-center">
        <Typography variant="h6">Users</Typography>
        <div className="flex items-center">
          <Typography variant="small" className="mr-2">
            Show Connections
          </Typography>
          <Switch checked={showConnections} onChange={(e) => setShowConnections(e.target.checked)} />
        </div>
      </div>

      {/* Table */}
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <table className="w-full min-w-[640px] table-auto">
          {/* ... existing table headers ... */}
          <tbody>
            {showConnections ? (
              groupedData.map((groupData, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {/* Group Name Row */}
                  <tr>
                    <td colSpan="7" className="bg-gray-200 font-semibold py-2 px-5">
                      {groupData.groupName}
                    </td>
                  </tr>
                  {/* Users in Group */}
                  {groupData.users.map((user, userIndex) => renderUserRow(user, userIndex))}
                </React.Fragment>
              ))
            ) : (
              filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user, key) => renderUserRow(user, key))
              )
            )}
          </tbody>
        </table>
        {/* ... existing Dialog component ... */}
      </CardBody>
    </div>
  );
}

export default Tables;
