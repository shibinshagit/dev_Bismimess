import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { attREf, updateUserAttendance } from '@/redux/reducers/authSlice';
import { saveAs } from 'file-saver'; // To save the file
import axios from 'axios';
import { BaseUrl } from '@/constants/BaseUrl';

export function Marker() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('NA');
  const dispatch = useDispatch();
  const usersFromRedux = useSelector((state) => state.auth.att);
  const reduxPeriod = useSelector((state) => state.auth.period);
  const zone = 'Brototype';
  const searchInputRef = useRef(null); // Reference to the search input

  const fetchAttendanceList = (zone) => {
    return axios.get(`${BaseUrl}/api/users`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching attendance:', error);
        return [];
      });
  };

  useEffect(() => {
    const updatePeriod = () => {
      const now = new Date();
      const hour = now.getHours();
      let newPeriod = 'upcoming';
      
      if (hour >= 7 && hour < 10) {
        newPeriod = 'morning';
      } else if (hour >= 12 && hour < 15) {
        newPeriod = 'afternoon';
      } else if (hour >= 19 && hour < 22) {
        newPeriod = 'night';
      }

      setPeriod(newPeriod);

      // Check if period has changed and call loadAtt if necessary
      if (newPeriod !== reduxPeriod) {
        loadAtt(newPeriod);
      }
    };

    updatePeriod();
    const intervalId = setInterval(updatePeriod, 60000);
    return () => clearInterval(intervalId);
  }, [reduxPeriod]);

  const loadAtt = async (newPeriod) => {
    const att = await fetchAttendanceList(zone);
    const filteredData = att.map(user => ({
      name: user.name,
      phone: user.phone,
      status: user.latestOrder?.status || 'N/A'
    }));
    dispatch(attREf({ att: filteredData, period: newPeriod }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Ensure search input remains focused
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearSearch = () => {
    setSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleAttendanceClick = (user) => {
    if (period === 'upcoming') return; // Disable action if period is upcoming

    const newAttendance = user.attendance === 'present' ? 'absent' : 'present';
    dispatch(updateUserAttendance({ phone: user.phone, period, status: newAttendance }));
  };

  const handleDownload = () => {
    if (period === 'upcoming') return; // Disable download if period is upcoming

    const fileName = `${period.charAt(0).toUpperCase() + period.slice(1)} Attendance.csv`;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Name,Phone,Attendance"].join(",") + "\n" + 
      usersFromRedux.map(u => `${u.name},${u.phone},${u.attendance}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    saveAs(encodedUri, fileName);
  };

  const filteredAndSortedUsers = usersFromRedux
    .filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase())
    );

  const presentCount = usersFromRedux.filter(user => user.attendance === 'present').length;
  const remainingCount = usersFromRedux.length - presentCount;

  return (
    <section className="p-1 flex flex-col items-center">
      {/* Fixed Header */}
      <div className="w-full max-w-4xl fixed top-0 left-0 bg-white shadow-lg z-10 py-4 px-6">
        <div className="flex justify-between items-center">
          <Typography variant="h2" className="font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl">
            Brototype
          </Typography>
          <Button 
            color="blue" 
            onClick={handleDownload} 
            className="rounded-lg shadow-sm"
            disabled={period === 'upcoming'} // Disable download button if period is upcoming
          >
            Download Attendance
          </Button>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Input
              size="lg"
              placeholder="Search user by name or phone"
              value={search}
              onChange={handleSearchChange}
              className="border-t-blue-500 focus:border-t-blue-900 w-full rounded-lg shadow-sm pl-10 pr-14"
              ref={searchInputRef} // Attach ref to input
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content below fixed header */}
      <div className="w-full max-w-4xl mt-36"> {/* Margin to offset the fixed header */}
        <Card className="p-0 shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">Name</th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">Phone</th>
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">
                  <Clock className="inline h-5 w-5" /> {period}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map(user => {
                const isPresent = user.attendance === 'present';
                const buttonLabel = isPresent ? 'Present' : 'Absent';
                const buttonColor = isPresent ? 'green' : 'red';
    
                return (
                  <tr
                    key={user.phone}
                    className={`border-t transition duration-300 ease-in-out hover:bg-gray-100 ${
                      isPresent ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">{user.name}</td>
                    <td className="px-4 py-2 text-blue-gray-900 font-medium">{user.phone}</td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        color={buttonColor}
                        size="sm"
                        onClick={() => handleAttendanceClick(user)}
                        className="flex items-center justify-center space-x-1 rounded-lg shadow-sm"
                        disabled={period === 'upcoming'} // Disable button if period is upcoming
                      >
                        <CheckBadgeIcon className="h-5 w-5" />
                        <span>{buttonLabel}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}

export default Marker;
