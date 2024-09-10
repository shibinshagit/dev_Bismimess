import React, { useState, useEffect } from 'react';
import { useMaterialTailwindController } from '@/context/index';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Typography, Avatar, Chip, Menu, MenuHandler, MenuList, MenuItem, select} from "@material-tailwind/react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button } from "@material-tailwind/react";
import axios from 'axios';  // Import axios for making API calls
import * as XLSX from 'xlsx';
import { Download, PlusCircleIcon } from 'lucide-react';
import { BaseUrl } from '@/constants/BaseUrl';
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
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  


  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalLeave, setTotalLeave] = useState(0);
  const [reduce, setReduce] = useState(0);
  const [bill, setBill] = useState(0);

  const handleInvoiceDialog = (user) => {
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
    setTotalLeave(0); // Reset leave input
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
    `;
    
    const whatsappUrl = `https://wa.me/91${selectedUser.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  
  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/api/users/${id}`);
        setUsers(response.data);
      } catch (err) {
        setError('Error fetching users.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
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

  return (
    <div className="mt-3 mb-8 flex flex-col gap-12">
      <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
        <table className="w-full min-w-[640px] table-auto">
          <thead>
            <tr>
              {[
                "Name",
                "Location",
               
                <Menu key="menu">
                  <MenuHandler>
                    <span>Status</span>
                  </MenuHandler>
                  <MenuList>
                    <MenuItem onClick={() => handleFilterChange('All')}>All</MenuItem>
                    <MenuItem onClick={() => handleFilterChange('Active')}>Active</MenuItem>
                    <MenuItem onClick={() => handleFilterChange('Leave')}>Leave</MenuItem>
                    <MenuItem onClick={() => handleFilterChange('Expired')}>Expired</MenuItem>
                    <MenuItem onClick={() => handleFilterChange('Soon')}>Soon</MenuItem>
                  </MenuList>
                </Menu>,
                 "Plan",
                "Expire",
                "Edit",
                 <Typography as="a" className="text-xs font-semibold text-red-600 flex" onClick={() => printData(filteredUsers)}>
                  <Download/>{filteredUsers.length}
              </Typography>,
              ].map((el) => (
                <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                  <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                    {el}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
  {filteredUsers.length === 0 ? (
    <tr>
      <td colSpan="" className="text-center py-4">
        No users found.
      </td>
    </tr>
  ) : (
    filteredUsers.map((user, key) => {
      const className = `py-3 px-5 ${key === users.length - 1 ? "" : "border-b border-blue-gray-50"}`;
      const { latestOrder = {} } = user;
      const { status, orderEnd } = latestOrder;
      const formattedDate = orderEnd ? new Intl.DateTimeFormat('en-GB').format(new Date(orderEnd)) : '';

      return (
        <tr key={user._id} className="even:bg-blue-gray-50/50">
          <td className={className}>
            <div className="flex items-center gap-4">
              <Avatar
                src="https://static.vecteezy.com/system/resources/previews/026/530/210/original/modern-person-icon-user-and-anonymous-icon-vector.jpg"
                alt={user.name}
                size="sm"
                variant="rounded"
              />
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  {user.name}
                </Typography>
                <Typography className="text-xs font-normal text-blue-gray-500">
                  {user.phone}
                </Typography>
              </div>
            </div>
          </td>
          <td className={className}>
            <div className="flex items-center gap-4">
          
              <div>
              <Typography variant="small" color="blue-gray" className="font-semibold">
  {user.location && typeof user.location === 'object' ? (
    <>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${user.location.latitude},${user.location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2"
        >
          <img src='https://cdn-icons-png.flaticon.com/512/2875/2875433.png' alt="Google Maps" className="w-4 h-4" />
          <Typography>View</Typography>
        </a>
    </>
  ) : (
   <PlusCircleIcon  onClick={() => handleAddLocation(user._id)}/>
  )}
  {/* <img src='https://cdn-icons-png.flaticon.com/512/2875/2875433.png' alt="Google Maps" className="w-4 h-4" /> */}
</Typography>


               
              </div>
            </div>
          </td>
        


          <td className={className}>
            <Chip
              variant="gradient"
              color={
                status === 'expired'
                  ? 'blue-gray'
                  : status === 'leave'
                  ? 'yellow'
                  : new Date(orderEnd).getTime() - new Date().getTime() <= 3 * 24 * 60 * 60 * 1000
                  ? 'red'
                  : status === 'active'
                  ? 'green'
                  : status === 'soon'
                  ? 'blue'
                  : 'orange'
              }
              value={status || 'Unpaid'}
              className="py-0.5 px-2 text-[11px] font-medium w-fit"
            />
          </td>

          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600 flex gap-1">
              {user.latestOrder?.plan?.length ? (
                user.latestOrder.plan.map((item, index) => (
                  <div key={index} className="">{item}</div>
                ))
              ) : (
                <div>---</div>
              )}
            </Typography>
          </td>

          <td className={className}>
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {formattedDate || '---'}
            </Typography>
          </td>

          {/* Share Invoice Button */}
         

          <td className={className}>
            <Typography as="a" className="text-xs font-semibold text-blue-gray-600" onClick={() => handleUpdate(user)}>
              Edit
            </Typography>
          </td>

          <td className={className}>
          {new Date(latestOrder.orderEnd).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 && (
  <button
    className="text-xs font-semibold text-blue-600"
    onClick={() => handleInvoiceDialog(user)}
  >
    Share Invoice
  </button>
)}

          </td>
        </tr>
      );
    })
  )}
</tbody>

        </table>


        <Dialog open={open} handler={handleClose}>
  <DialogHeader>Send Invoice</DialogHeader>
  <DialogBody>
    <Typography variant="h6" className="mb-3"> {selectedUser?.name} </Typography>
      <Input
        type="number"
        value={totalLeave}
        onChange={(e) => setTotalLeave(Number(e.target.value))}
        label='Total Leave'
       
      />
   
    <Typography variant="h6" className="mt-2">
      Bill Amount = {bill - totalLeave * reduce}
    </Typography>
  </DialogBody>
  <DialogFooter>
    <Button variant="text" color="red" onClick={handleClose} className="mr-2">
      Cancel
    </Button>
    <Button variant="gradient" color="dark" onClick={handleSendInvoice}>
      Send 
    </Button>
  </DialogFooter>
</Dialog>


      </CardBody>
    </div>
  );
}

export default Tables;
