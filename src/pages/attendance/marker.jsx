import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Clock, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { attREf, updateUserAttendance } from '@/redux/reducers/authSlice';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { BaseUrl } from '@/constants/BaseUrl';

export function Marker() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('NA');
  const dispatch = useDispatch();
  const usersFromRedux = useSelector((state) => state.auth.att);
  const reduxPeriod = useSelector((state) => state.auth.period);
  const zone = 'Brototype';
  const searchInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  // const toggleDropdown = () => setIsOpen(!isOpen);


  const fetchAttendanceList = (zone) => {
    return axios.get(`${BaseUrl}/api/users/66c26676b43a45070b24e735`)
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

      if (hour >= 6 && hour < 12) {
        newPeriod = 'morning';
      } else if (hour >= 12 && hour < 16) {
        newPeriod = 'afternoon';
      } else if (hour >= 18 && hour < 23) {
        newPeriod = 'night';
      }

      setPeriod(newPeriod);

      if (newPeriod !== reduxPeriod) {
        loadAtt(newPeriod);
      }


      if(usersFromRedux.length === 0){
        console.log('hello')
        loadAtt(newPeriod)
      }
    };

    updatePeriod();
    const intervalId = setInterval(updatePeriod, 60000);
    return () => clearInterval(intervalId);
  }, [reduxPeriod]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        event.preventDefault();
        searchInputRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

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
    if (period === 'upcoming') return;

    const newAttendance = user.attendance === 'present' ? 'absent' : 'present';
    dispatch(updateUserAttendance({ phone: user.phone, period, status: newAttendance }));
  };

  const handleDownload = () => {
    if (period === 'upcoming') return;

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
    <section className="flex flex-col">
      <div className="w-full max-w-7xl fixed top-0 left-0 bg-white shadow-lg z-10 py-4 px-6 flex flex-col">
        <div className="flex justify-between items-center">
          <Typography variant="h2" className="font-bold text-gray-800 text-2xl sm:text-3xl lg:text-4xl">
            Brototype
          </Typography>
          <Button 
            color="dark" 
            onClick={handleDownload} 
            className="rounded-lg shadow-sm flex"
            disabled={period === 'upcoming'} 
          >
          <Download/>  {usersFromRedux.length-remainingCount}
          </Button>
        </div>
        <div className="mt-4 flex items-center">
          <div className="relative flex-1">
          <Input
  size="lg"
  label="Search user by name or phone"
  value={search}
  onChange={handleSearchChange}
  className="w-full rounded-lg shadow-sm pl-10 pr-14"
  inputProps={{
    className: "border-gray-300 focus:border-blue-900 focus:ring-0 focus:outline-none",
  }}
  ref={searchInputRef}
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
          <div className="ml-4 text-sm text-gray-600">
            <Typography variant="small" className="font-medium">
              T: {usersFromRedux.length}
            </Typography>
            <Typography variant="small" className="font-medium">
              R: {remainingCount}
            </Typography>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl mt-36">
        <Card className="p-0 shadow-xl rounded-lg">
          <table className="w-full bg-white rounded-lg">
            <thead className="sticky top-[140px] bg-gray-100 z-10">
              <tr className="text-left bg-gray-100 border-b">
                <th className="px-4 py-2 text-blue-gray-700 font-semibold">Name</th>
                {/* <th className="px-4 py-2 text-blue-gray-700 font-semibold">status</th> */}
                {/* <th className="px-4 py-2 text-blue-gray-700 font-semibold">Phone</th> */}
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
                      isPresent ? 'bg-green-50' : 'bg-white-50'
                    }`}
                  >
                  <td
        className="px-4 py-2 text-blue-gray-900 font-medium cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user.name}
        {/* Conditionally render content instantly */}
        {isOpen && (
          <div className="mt-2 text-sm text-blue-gray-700 space-y-1">
            <div>Status: {user.status}</div>
            <div>Phone: {user.phone}</div>
          </div>
        )}
      </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        color={buttonColor}
                        size="sm"
                        onClick={() => handleAttendanceClick(user)}
                        className="flex items-center justify-center space-x-1 rounded-lg shadow-sm"
                        disabled={period === 'upcoming'}
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
