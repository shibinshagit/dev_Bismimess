import React, { useState, useEffect } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PendingPayment } from '@/services/apiCalls';

export function Pendings() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending orders on mount
  useEffect(() => {
    const fetchPendingOrders = async () => {
      setLoading(true);
      setError("");
      try {
        // Adjust the endpoint as needed
        const response = await PendingPayment();
        setPendingOrders(response || []);
        setFilteredOrders(response || []);
      } catch (err) {
        console.error("Error fetching pending orders:", err);
        setError("Failed to fetch pending orders");
      } finally {
        setLoading(false);
      }
    };
    fetchPendingOrders();
  }, []);

  // Filter logic whenever searchTerm or pendingOrders change
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = pendingOrders.filter((user) =>
      user.name.toLowerCase().includes(lowerSearch) ||
      user.phone.toLowerCase().includes(lowerSearch)
    );
    setFilteredOrders(filtered);
  }, [searchTerm, pendingOrders]);

  // Handler for toggling search bar
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center">
      <div className="w-full max-w-md ">
        {/* Header */}
        <div className="flex items-center justify-end mb-2">
     
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle Search"
          >
            {isSearchOpen ? (
              <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        )}

        {/* Content */}
        {loading ? (
          // Skeleton Loaders
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                {/* Avatar Skeleton */}
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                {/* Text Skeleton */}
                <div className="ml-3 flex-1 space-y-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                {/* Status Skeleton */}
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error Message
          <div className="text-center text-red-500 dark:text-red-400">{error}</div>
        ) : filteredOrders.length === 0 ? (
          // Empty State
          <div className="text-center text-gray-600 dark:text-gray-400">No pending orders found.</div>
        ) : (
          // Orders List
        
          <div className="space-y-2 mb-20">
            {filteredOrders.map((user) => {
              const latestOrder = user.latestOrder || {};
              return (
                <Link
                to="/dashboard/edit" 
                state={{ user }}
              >
                <div
                  key={user._id}
                  className="flex items-center mb-2 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                      alt={user.name}
                    />
                  </div>
                  {/* Content */}
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.name}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          latestOrder.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {latestOrder.paymentStatus || "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{user.phone}</p>
                    <div className="mt-1 text-xs text-gray-700 dark:text-gray-400">
                      <p><span className="font-medium">Plan:</span> {latestOrder.plan && latestOrder.plan.length > 0 ? latestOrder.plan.join(", ") : "N/A"}</p>
                      <p><span className="font-medium">End:</span> {latestOrder.orderEnd ? new Date(latestOrder.orderEnd).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
       
        )}
      </div>
    </div>
  );
}

export default Pendings;
