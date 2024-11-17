import React, { useState, useEffect } from 'react';
import { useMaterialTailwindController } from '@/context/index';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Input, Avatar, Chip } from '@material-tailwind/react';
import { BaseUrl } from '@/constants/BaseUrl';
import UserAvatar from '../../../public/img/user.jpg';
import { SearchIcon } from 'lucide-react';

function GlobalSearch() {
  const [controller, dispatch] = useMaterialTailwindController();
  let { searchTerm } = controller;
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Remove slash from search term on mount
  useEffect(() => {
    if (searchTerm.startsWith('/')) {
      searchTerm = searchTerm.slice(1);
      dispatch({ type: 'SET_SEARCH_TERM', value: searchTerm });
    }
  }, []);

  // Fetch users based on search term
  // Inside your useEffect for fetching users
useEffect(() => {
    if (searchTerm.trim() === '') {
      setUsers([]);
      return;
    }
  
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let response;
  
        if (searchTerm.toLowerCase() === 'pending') {
          // Fetch users with paymentStatus 'pending'
          response = await axios.get(`${BaseUrl}/api/paymentStatus/pending`);
        } else {
          // Search users by name or phone
          response = await axios.get(`${BaseUrl}/api/search`, {
            params: { query: searchTerm },
          });
        }
  
        setUsers(response.data);
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Error fetching users.');
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, [searchTerm]);
  

  // Fetch suggestions as user types
 // Inside your useEffect for fetching suggestions
useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
  
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/api/suggestions`, {
          params: { query: searchTerm },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]); // Clear suggestions on error
      }
    };
  
    fetchSuggestions();
  }, [searchTerm]);
  

  return (
    <div className="p-4">
      {/* <div className="relative">
        <Input
          icon={<SearchIcon className="h-5 w-5 text-gray-500" />}
          label="Search"
          value={searchTerm}
          onChange={(e) =>
            dispatch({ type: 'SET_SEARCH_TERM', value: e.target.value })
          }
          placeholder="Search by name or phone..."
        />

        {suggestions.length > 0 && (
          <div className="absolute z-10 bg-white border rounded mt-1 w-full max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  // Set the search term to the selected suggestion
                  dispatch({ type: 'SET_SEARCH_TERM', value: suggestion.name });
                  setSuggestions([]);
                }}
              >
                <Typography>{suggestion.name}</Typography>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <Typography color="red">{error}</Typography>
      ) : users.length === 0 ? (
        <Typography className="mt-4">No users found.</Typography>
      ) : (
        <div className="mt-4">
          {users.map((user) => (
            <Card
              key={user._id}
              className={`mb-4 p-4 ${
                user.isDeleted ? 'bg-red-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center">
                <Avatar
                  src={UserAvatar}
                  alt={user.name}
                  size="md"
                  variant="rounded"
                />
                <div className="ml-4">
                  <Typography variant="h6">
                    {user.name}{' '}
                    {user.isDeleted && (
                      <span className="text-red-500">(Deleted)</span>
                    )}
                  </Typography>
                  <Typography>{user.phone}</Typography>
                  {user.latestOrder && (
                    <div className="mt-2">
                      <Chip
                        variant="gradient"
                        color={
                          user.latestOrder.paymentStatus === 'pending'
                            ? 'yellow'
                            : 'green'
                        }
                        value={`Payment Status: ${user.latestOrder.paymentStatus}`}
                        className="py-0.5 px-2 text-[11px] font-medium w-fit"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
