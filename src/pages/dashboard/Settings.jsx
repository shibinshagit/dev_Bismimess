import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Typography } from "@material-tailwind/react";

export function Settings() {
  return (
    <div className="container mx-auto mt-8">
      <Card className="w-full max-w-md mx-auto">
        <CardBody>
          <ul className="space-y-4">
          <li>
              <Link to="/dashboard/notify" className="text-red-500 hover:underline">
                New users*
              </Link>
            </li>
            <li>
              <Link to="/dashboard/deleted-users" className="text-blue-500 hover:underline">
                Deleted Users
              </Link>
            </li>
            <li>
              <Link to="/dashboard/accounts" className="text-blue-500 hover:underline">
                Accounts
              </Link>
            </li>
            <li>
              <Link to="/dashboard/CreateCategory" className="text-blue-500 hover:underline">
                Connections and Bulk
              </Link>
            </li>
            <li>
              <Link to="/dashboard/accounts" className="text-blue-500 hover:underline">
                Transaction & Payment
              </Link>
            </li>
          
            {/* Add more settings options as needed */}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

export default Settings;
