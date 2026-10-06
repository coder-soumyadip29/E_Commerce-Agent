import { test, expect, describe } from "vitest";
import {
  getUserAddresses,
  addUserAddressDb,
  setDefaultAddressDb,
  deleteUserAddressDb,
  getUserAddressById,
} from "../lib/db";
import { DELIVERY_SLOTS } from "../lib/deliverySlots";

describe("Dynamic Address & Delivery Slot Logistics", () => {
  test("Loads seed addresses from SQLite for user_id = 1", () => {
    const addresses = getUserAddresses(1);
    expect(addresses.length).toBeGreaterThanOrEqual(1);

    const defaultAddr = addresses.find((a) => a.is_default);
    expect(defaultAddr).toBeDefined();
    expect(defaultAddr?.name).toContain("Maya Sterling");
    expect(defaultAddr?.pincode).toBe("560103");
    expect(defaultAddr?.type).toBe("Home");
  });

  test("Inserts a new user address with all required logistics fields into SQLite", () => {
    const newAddress = addUserAddressDb({
      user_id: 1,
      name: "Suman Kuity",
      phone: "+91 98765 01234",
      street_address: "Flat 302, Eco Palms Residency, Sarjapur Main Rd",
      landmark: "Near Wipro Corporate Office",
      city: "Bangalore",
      pincode: "560035",
      type: "Work",
      is_default: false,
    });

    expect(newAddress.id).toBeDefined();
    expect(newAddress.name).toBe("Suman Kuity");
    expect(newAddress.type).toBe("Work");
    expect(newAddress.landmark).toBe("Near Wipro Corporate Office");
    expect(newAddress.is_default).toBe(false);

    // Verify retrieval
    const retrieved = getUserAddressById(newAddress.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.street_address).toContain("Eco Palms");
  });

  test("Sets a newly added address as default and toggles previous defaults", () => {
    const defaultAddr = addUserAddressDb({
      user_id: 1,
      name: "Suman Home Residence",
      phone: "+91 98765 01234",
      street_address: "Bungalow 7, Green Glen Layout",
      city: "Bangalore",
      pincode: "560103",
      type: "Home",
      is_default: true,
    });

    expect(defaultAddr.is_default).toBe(true);

    const allAddrs = getUserAddresses(1);
    const defaults = allAddrs.filter((a) => a.is_default);
    expect(defaults.length).toBe(1);
    expect(defaults[0].id).toBe(defaultAddr.id);
  });

  test("Can toggle default address using setDefaultAddressDb", () => {
    const all = getUserAddresses(1);
    expect(all.length).toBeGreaterThan(1);
    const target = all[all.length - 1];

    const success = setDefaultAddressDb(1, target.id);
    expect(success).toBe(true);

    const updated = getUserAddresses(1);
    const currentDefault = updated.find((a) => a.is_default);
    expect(currentDefault?.id).toBe(target.id);
  });

  test("Deletes an address successfully", () => {
    const addr = addUserAddressDb({
      user_id: 1,
      name: "Temporary Transit Spot",
      phone: "+91 99999 88888",
      street_address: "Hotel Pavilion Room 401",
      city: "Bangalore",
      pincode: "560001",
      type: "Other",
      is_default: false,
    });

    const beforeDelete = getUserAddresses(1);
    expect(beforeDelete.some((a) => a.id === addr.id)).toBe(true);

    deleteUserAddressDb(1, addr.id);

    const afterDelete = getUserAddresses(1);
    expect(afterDelete.some((a) => a.id === addr.id)).toBe(false);
  });

  test("Verifies all three required delivery slots are properly configured", () => {
    expect(DELIVERY_SLOTS.length).toBe(3);

    const expressSlot = DELIVERY_SLOTS.find((s) => s.id === "express_30min");
    expect(expressSlot).toBeDefined();
    expect(expressSlot?.title).toBe("Instant 30-Min Fast Delivery");
    expect(expressSlot?.subtitle).toContain("Grocery Express");

    const morningSlot = DELIVERY_SLOTS.find((s) => s.id === "morning_slot");
    expect(morningSlot).toBeDefined();
    expect(morningSlot?.title).toBe("Morning Slot");
    expect(morningSlot?.timeWindow).toBe("7:00 AM – 10:00 AM");

    const eveningSlot = DELIVERY_SLOTS.find((s) => s.id === "evening_slot");
    expect(eveningSlot).toBeDefined();
    expect(eveningSlot?.title).toBe("Evening Slot");
    expect(eveningSlot?.timeWindow).toBe("6:00 PM – 9:00 PM");
  });
});
