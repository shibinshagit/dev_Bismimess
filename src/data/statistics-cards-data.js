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
      color: "text-green-500",
      value: "+55%",
      label: "last Month",
    },
  },
  {
    color: "green",
    icon: CookingPot,
    title: "Breakfast",
    value: "0",
    footer: {
      color: "text-red-500",
      value: "-1%",
      label: "last Month",
    },
  },
  {
    color: "orange",
    icon: CookingPot,
    title: "Lunch",
    value: "0",
    footer: {
      color: "text-green-500",
      value: "+55%",
      label: "last Month",
    },
  },
  {
    color: "red",
    icon: CookingPot,
    title: "Dinner",
    value: "0",
    footer: {
      color: "text-green-500",
      value: "+50%",
      label: "last Month",
    },
  },
];

export const placeStatisticsData = [
  { place: "Brototype", total: 250, breakfast: 80, lunch: 100, dinner: 70 },
  { place: "Vytila", total: 150, breakfast: 50, lunch: 60, dinner: 40 },
  { place: "Forum Mall", total: 180, breakfast: 60, lunch: 70, dinner: 50 },
  { place: "Nucleus Mall", total: 120, breakfast: 40, lunch: 50, dinner: 30 },
  { place: "Kakkanad", total: 200, breakfast: 70, lunch: 80, dinner: 50 },
  { place: "Lakshya", total: 90, breakfast: 30, lunch: 40, dinner: 20 },
];
export const kitchenStatisticsData = [
  { place: "Kakanadu", total: 250, breakfast: 80, lunch: 100, dinner: 70 },
  { place: "Cusat", total: 150, breakfast: 50, lunch: 60, dinner: 40 },
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



