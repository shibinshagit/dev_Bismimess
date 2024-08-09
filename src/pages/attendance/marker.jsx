import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Clock } from 'lucide-react';
import { BaseUrl } from '@/constants/BaseUrl';
import axios from 'axios';

const fetchAttendanceList = (zone) => {
  return axios.get(`${BaseUrl}/api/users`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching attendance:', error);
      return [];
    });
};

const markAtt = async (id, period) => {
  try {
    const response = await axios.post(`${BaseUrl}/api/att/markAtt/`, {
      id,
      period
    });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    return null;
  }
};

export function Marker() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('NA');
  const zone = 'Brototype';
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getAttendance = async () => {
      const response = await fetchAttendanceList(zone);
      setUsers(response);
    };

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

    getAttendance();
    updatePeriod();

    const intervalId = setInterval(updatePeriod, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [zone]);

  const handleSearchChange = (e) => setSearch(e.target.value);

  // Filter and sort users: Present first, then others
  const filteredAndSortedUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const statusA = a.latestOrder?.status === 'active' ? 1 : 0;
      const statusB = b.latestOrder?.status === 'active' ? 1 : 0;
      return statusB - statusA;
    });

  return (
    <section className="m-8 flex justify-center">
      <div className="w-full lg:w-4/5">
        <div className="text-center mb-8">
          <Typography variant="h2" className="font-bold mb-4 text-blue-800">Attendance Marker</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Search for a user and mark their attendance.
          </Typography>
        </div>
        <div className="mb-6">
          <Input
            size="lg"
            placeholder="Search user by name or email"
            value={search}
            onChange={handleSearchChange}
            className="border-t-blue-500 focus:border-t-blue-900 w-full"
            labelProps={{ className: "before:content-none after:content-none" }}
          />
        </div>
        <Card className="p-4 shadow-lg">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 text-left text-blue-gray-700">Total: {filteredAndSortedUsers.length}</th>
                <th className="py-2 text-left text-blue-gray-700">Remaining:</th>
                <th className="py-2 text-left text-blue-gray-700">
                  <Clock className="inline h-5 w-5" /> {period}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map(user => {
                const status = user.latestOrder?.status || 'N/A';
                const isPresent = status === 'active';
                const buttonLabel = isPresent ? 'Present' : (status === 'leave' ? 'Leave' : status);
                const buttonColor = isPresent ? 'green' : 'yellow';
                const rowColor = isPresent ? 'bg-white' : 'bg-yellow-100';
                const buttonDisabled = !isPresent || period === 'upcoming';

                return (
                  <tr key={user.email} className={`border-t ${rowColor} transition duration-300 ease-in-out hover:bg-green-100`}>
                    <td className="py-2 text-blue-gray-900 font-medium">{user.name}</td>
                    <td className="py-2 text-blue-gray-900 font-medium">{user.phone}</td>
                    <td className="py-2 text-center">
                      <Button
                        color={buttonColor}
                        size="sm"
                        onClick={() => markAtt(user._id, period)}
                        disabled={buttonDisabled}
                        className={`flex items-center justify-center space-x-1 ${buttonDisabled ? 'cursor-not-allowed' : ''}`}
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
