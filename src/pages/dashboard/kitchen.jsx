import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { kitchenStatisticsData} from "@/data";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export function Kitchen() {
  return (
    <div className="mx-auto my-10 flex max-w-screen-lg flex-col gap-8">
    
      <div className="mt-6 mb-16">
        {kitchenStatisticsData.map(({ place, total, breakfast, lunch, dinner }) => (
          <Card key={place} className="mb-4 shadow-md">
            <Menu>
              <MenuHandler>
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <Typography variant="h6" color="blue-gray">
                    {place}
                  </Typography>
                  <ChevronDownIcon className="w-5 h-5 text-blue-gray-600" />
                </div>
              </MenuHandler>
              <MenuList className="p-4">
                <MenuItem>
                  <Typography variant="small" className="font-medium">
                    Total Orders: {total}
                  </Typography>
                </MenuItem>
                <MenuItem>
                  <Typography variant="small" className="font-medium">
                    Breakfast: {breakfast}
                  </Typography>
                </MenuItem>
                <MenuItem>
                  <Typography variant="small" className="font-medium">
                    Lunch: {lunch}
                  </Typography>
                </MenuItem>
                <MenuItem>
                  <Typography variant="small" className="font-medium">
                    Dinner: {dinner}
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Kitchen;
