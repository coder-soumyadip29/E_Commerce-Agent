import { DeliverySlot } from "./types";

export const DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: "express_30min",
    title: "Instant 30-Min Fast Delivery",
    subtitle: "Grocery Express • Hyperlocal Store Dispatch",
    timeWindow: "Within 30 Mins",
    badge: "⚡ 30-MIN EXPRESS",
    price: 0,
    estimatedTime: "Today in ~25-30 mins",
  },
  {
    id: "morning_slot",
    title: "Morning Slot",
    subtitle: "Fresh Harvest Scheduled Batch",
    timeWindow: "7:00 AM – 10:00 AM",
    badge: "🌅 MORNING SLOT",
    price: 0,
    estimatedTime: "Tomorrow, 7:00 AM – 10:00 AM",
  },
  {
    id: "evening_slot",
    title: "Evening Slot",
    subtitle: "Pantry Prime Convenient Drop",
    timeWindow: "6:00 PM – 9:00 PM",
    badge: "🌆 EVENING SLOT",
    price: 0,
    estimatedTime: "Today, 6:00 PM – 9:00 PM",
  },
];
