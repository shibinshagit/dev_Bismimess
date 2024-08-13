import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import axios from 'axios';
import { BaseUrl } from '../constants/BaseUrl';
import { CookingPot } from "lucide-react";
export const statisticsCardsData = [
  {
    color: "gray",
    icon: UsersIcon,
    title: "Total",
    value: "0",
    footer: {
      color: "",
      value: "",
      label: "",
    },
  },
  {
    color: "green",
    icon: CookingPot,
    title: "Breakfast",
    value: "0",
    footer: {
      color: "",
      value: "",
      label: "",
    },
  },
  {
    color: "orange",
    icon: CookingPot,
    title: "Lunch",
    value: "0",
    footer: {
      color: "",
      value: "",
      label: "",
    },
  },
  {
    color: "red",
    icon: CookingPot,
    title: "Dinner",
    value: "0",
    footer: {
      color: "",
      value: "",
      label: "",
    },
  },
];


export const fetchStatistics = async (date, customers) => {
  try {

    const filteredCustomers = customers.filter(customer => customer.latestOrder);
    const countOrdersByPlan = (planType) => {
      return filteredCustomers.filter(customer =>
        customer.latestOrder.orderEnd >= date &&
        customer.latestOrder.status === 'active' &&
        customer.latestOrder.plan.includes(planType)
      ).length;
    };


    const statistics = {
      totalOrders: filteredCustomers.filter(customer =>
        customer.latestOrder.orderEnd >= date &&
        customer.latestOrder.status === 'active'
      ).length,
      breakfastOrders: countOrdersByPlan('B'),
      lunchOrders: countOrdersByPlan('L'),
      dinnerOrders: countOrdersByPlan('D')
    };

    statisticsCardsData[0].value = statistics.totalOrders;
    statisticsCardsData[1].value = statistics.breakfastOrders;
    statisticsCardsData[2].value = statistics.lunchOrders;
    statisticsCardsData[3].value = statistics.dinnerOrders;

  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};



