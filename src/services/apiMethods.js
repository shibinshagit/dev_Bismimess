// // src/components/CustomerList.js
// import React, { useEffect, useState } from "react";
// import { apiCall } from "@/api/apimethods";

// const CustomerList = () => {
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const data = await apiCall("get", "/customers");
//         setCustomers(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <ul>
//       {customers.map((customer) => (
//         <li key={customer.id}>{customer.name}</li>
//       ))}
//     </ul>
//   );
// };

// export default CustomerList;
