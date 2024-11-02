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
              <Link to="/dashboard/deleted-users" className="text-blue-500 hover:underline">
                Deleted Users
              </Link>
            </li>
            <li>
              <Link to="/dashboard/accounts" className="text-blue-500 hover:underline">
                Accounts
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
