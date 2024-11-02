import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { BaseUrl } from '../../constants/BaseUrl';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function AccountPage() {
  // State Hooks
  const [totalPayments, setTotalPayments] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Financial Data
  const fetchFinancialData = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    try {
      const [totalRes, pendingRes, transactionsRes, revenueRes] = await Promise.all([
        axios.get(`${BaseUrl}/api/finance/total-payments`),
        axios.get(`${BaseUrl}/api/finance/pending-payments`),
        axios.get(`${BaseUrl}/api/finance/transactions`, {
          params: { page, limit: transactionsPerPage, search },
        }),
        // axios.get(`${BaseUrl}/api/finance/revenue-over-time`),
      ]);
// Logging the results to the console
console.log('Total Payments Response:', totalRes);
console.log('Pending Payments Response:', pendingRes);
console.log('Transactions Response:', transactionsRes);
console.log('Revenue Over Time Response:', revenueRes);
      setTotalPayments(totalRes.data.totalAmount);
      setPendingPayments(pendingRes.data.pendingAmount);
      setTransactions(transactionsRes.data.transactions);
      setTotalPages(transactionsRes.data.totalPages);
      setRevenueData(revenueRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setLoading(false);
    }
  }, []);

  // Effect Hook for Fetching Data
  useEffect(() => {
    fetchFinancialData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchFinancialData]);

  // Memoized Chart Data and Options
  const chartData = useMemo(() => ({
    labels: revenueData.map((item) => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map((item) => item.totalAmount),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue fill
        borderColor: 'rgba(59, 130, 246, 1)', // Blue border
        tension: 0.4, // Smooth curves
      },
    ],
  }), [revenueData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 15,
        },
      },
      title: {
        display: false,
        text: 'Revenue Over Time',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Month/Year',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          callback: function(value) {
            return `₹ ${value}`;
          },
        },
        grid: {
          borderDash: [5, 5],
        },
      },
    },
  }), []);

  // Early Loading State Rendering
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Main Render
  return (
    <div className=" sm:p-6 lg:p-8 bg-gray-100 min-h-screen mb-16">
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total Payments Card */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-600">Total Payments Received</h3>
              <p className="mt-2 text-2xl font-bold text-gray-800">₹ {totalPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-600">Pending Payments</h3>
              <p className="mt-2 text-2xl font-bold text-gray-800">₹ {pendingPayments.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
     

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-blue-600 mb-2 sm:mb-0">Transaction History</h3>
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by user name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 111 7a7 7 0 0115.65 9.65z" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>    
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-100 transition-colors duration-200">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.userId?.name || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">₹ {transaction.amount ? transaction.amount.toFixed(2) : 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.paymentMethod? transaction.paymentMethod : 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.paymentId || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {transaction.status === 'expired' ? (
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                       Pending
                     </span>
                      ) : (
                       
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{ new Date(transaction.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
})}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.userId?.phone || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{transactionsPerPage * (currentPage - 1) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(transactionsPerPage * currentPage, totalPages * transactionsPerPage)}</span> of{' '}
            <span className="font-medium">{totalPages * transactionsPerPage}</span> results
          </div>
          <div className="inline-flex items-center -space-x-px">
            <button
              className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 ${
                currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold text-blue-600 mb-4">Revenue Over Time</h3>
        <div className="w-full h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
