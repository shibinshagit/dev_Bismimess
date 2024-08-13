import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAttendance } from '@/redux/reducers/authSlice';
import { saveAs } from 'file-saver'; // To save the file

export function Marker() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('NA');
  const dispatch = useDispatch();
  const usersFromRedux = useSelector((state) => state.auth.att);

  useEffect(() => {
    const updatePeriod = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 7 && hour < 10) {
        setPeriod('morning');
      } else if (hour >= 12 && hour < 15) {
        setPeriod('afternoon');
      } else if (hour >= 19 && hour < 22) {
        setPeriod('night');
      } else {
        setPeriod('upcoming');
      }
    };
    updatePeriod();
    const intervalId = setInterval(updatePeriod, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleAttendanceClick = (user) => {
    const newAttendance = user.attendance === 'present' ? 'absent' : 'present';
    dispatch(updateUserAttendance({ phone: user.phone, period, status: newAttendance }));
  };

  const handleDownload = () => {
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
    <section className="p-6 flex justify-center">
      <div className="w-full lg:w-4/5">
        <div className="text-center mb-12">
          <Typography variant="h2" className="font-bold mb-6 text-gray-800">
            Brototype
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            {/* Search for a user and mark their attendance. */}
          </Typography>
        </div>
        <div className="mb-8">
          <Input
            size="lg"
            placeholder="Search user by name or phone"
            value={search}
            onChange={handleSearchChange}
            className="border-t-blue-500 focus:border-t-blue-900 w-full rounded-lg shadow-sm"
          />
        </div>
        <Card className="p-0 shadow-xl rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr>
                <th className="px-4 text-left text-blue-gray-700 font-semibold">T: {filteredAndSortedUsers.length}</th>
                <th className="py-4 text-left text-blue-gray-700 font-semibold">R: {remainingCount}</th>
                <th className="px-4 text-left text-blue-gray-700 font-semibold">
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
                    <td className="px-4 text-blue-gray-900 font-medium">{user.name}</td>
                    <td className="py-4 text-blue-gray-900 font-medium">{user.phone}</td>
                    <td className="px-4 py-2text-center">
                      <Button
                        color={buttonColor}
                        size="sm"
                        onClick={() => handleAttendanceClick(user)}
                        className="flex items-center justify-center space-x-1 rounded-lg shadow-sm"
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
          <div className="flex justify-end mt-8">
            <Button color="blue" onClick={handleDownload} className="rounded-lg shadow-sm">
              Download Attendance
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default Marker;
