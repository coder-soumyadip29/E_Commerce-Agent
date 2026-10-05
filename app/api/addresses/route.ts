import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, addUserAddress, setDefaultAddress, deleteUserAddress } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : 1;

    const user = getUserProfile(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, addresses: user.addresses, defaultAddressId: user.default_address_id });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 1, address } = body;

    if (!address || !address.street || !address.city || !address.recipient_name) {
      return NextResponse.json({ error: "Recipient name, street, and city are required." }, { status: 400 });
    }

    const result = addUserAddress(userId, address);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to add address" }, { status: 400 });
    }

    const updatedUser = getUserProfile(userId);
    return NextResponse.json({ success: true, address: result.address, addresses: updatedUser?.addresses });
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

    const result = setDefaultAddress(userId, Number(addressId));
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to set default address" }, { status: 400 });
    }

    const updatedUser = getUserProfile(userId);
    return NextResponse.json({ success: true, addresses: updatedUser?.addresses, defaultAddressId: updatedUser?.default_address_id });
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

    const result = deleteUserAddress(userId, addressId);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to delete address" }, { status: 400 });
    }

    const updatedUser = getUserProfile(userId);
    return NextResponse.json({ success: true, addresses: updatedUser?.addresses });
  } catch (error) {
    console.error("Addresses DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
