import { NextRequest, NextResponse } from "next/server";
import {
  getUserAddresses,
  addUserAddressDb,
  setDefaultAddressDb,
  deleteUserAddressDb,
} from "@/lib/db";
import {
  getUserProfile,
  addUserAddress as addMongoAddress,
  setDefaultAddress as setMongoDefault,
  deleteUserAddress as deleteMongoAddress,
} from "@/lib/userDb";
import { UserAddressRecord } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : 1;

    // 1. Fetch from SQLite user_addresses table
    let addresses = getUserAddresses(userId);

    // 2. If SQLite has none, check MongoDB user profile
    if (!addresses || addresses.length === 0) {
      const user = await getUserProfile(userId);
      if (user && user.addresses && user.addresses.length > 0) {
        addresses = user.addresses.map((a: any) => ({
          id: a.id,
          user_id: userId,
          name: a.recipient_name || a.name || "Customer",
          phone: a.phone || "+91 98765 43210",
          street_address: a.street || a.street_address || "",
          landmark: a.landmark || "",
          city: a.city || "Bangalore",
          pincode: a.pincode || a.zip_code || "560001",
          type: (a.type || a.label || "Home") as any,
          is_default: Boolean(a.is_default),
        }));
      }
    }

    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

    return NextResponse.json({
      success: true,
      addresses,
      defaultAddressId: defaultAddress ? defaultAddress.id : null,
    });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 1, address } = body;

    const rawName = address?.name || address?.recipient_name;
    const rawPhone = address?.phone || "+91 98765 43210";
    const rawStreet = address?.street_address || address?.street;
    const rawCity = address?.city;
    const rawPincode = address?.pincode || address?.zip_code;
    const rawLandmark = address?.landmark || "";
    const rawType = address?.type || address?.label || "Home";
    const isDefault = Boolean(address?.is_default);

    if (!rawName || !rawStreet || !rawCity) {
      return NextResponse.json(
        { error: "Name, street address, and city are required." },
        { status: 400 }
      );
    }

    const newRecord: Omit<UserAddressRecord, "id"> = {
      user_id: Number(userId),
      name: rawName.trim(),
      phone: rawPhone.trim(),
      street_address: rawStreet.trim(),
      landmark: rawLandmark.trim(),
      city: rawCity.trim(),
      pincode: (rawPincode || "560001").trim(),
      type: rawType as any,
      is_default: isDefault,
    };

    // 1. Insert into SQLite table
    const createdAddress = addUserAddressDb(newRecord);

    // 2. Dual-write to MongoDB if active
    try {
      await addMongoAddress(Number(userId), {
        label: rawType,
        recipient_name: rawName,
        phone: rawPhone,
        street: rawStreet,
        city: rawCity,
        state: "Karnataka",
        zip_code: rawPincode || "560001",
        country: "India",
        is_default: isDefault,
      });
    } catch (e) {
      // Non-fatal
    }

    const allAddresses = getUserAddresses(Number(userId));

    return NextResponse.json({
      success: true,
      address: createdAddress,
      addresses: allAddresses,
    });
  } catch (error) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 1, addressId } = body;

    if (!addressId) {
      return NextResponse.json({ error: "addressId is required." }, { status: 400 });
    }

    // 1. Update SQLite
    setDefaultAddressDb(Number(userId), Number(addressId));

    // 2. Dual-update MongoDB
    try {
      await setMongoDefault(Number(userId), Number(addressId));
    } catch (e) {}

    const allAddresses = getUserAddresses(Number(userId));

    return NextResponse.json({
      success: true,
      addresses: allAddresses,
      defaultAddressId: Number(addressId),
    });
  } catch (error) {
    console.error("Addresses PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const addressIdParam = searchParams.get("addressId");
    const userId = userIdParam ? Number(userIdParam) : 1;
    const addressId = Number(addressIdParam);

    if (!addressId) {
      return NextResponse.json({ error: "addressId is required." }, { status: 400 });
    }

    // 1. Delete from SQLite
    deleteUserAddressDb(userId, addressId);

    // 2. Delete from MongoDB
    try {
      await deleteMongoAddress(userId, addressId);
    } catch (e) {}

    const allAddresses = getUserAddresses(userId);

    return NextResponse.json({ success: true, addresses: allAddresses });
  } catch (error) {
    console.error("Addresses DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
