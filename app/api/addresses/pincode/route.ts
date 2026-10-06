import { NextRequest, NextResponse } from "next/server";

// Fast offline dictionary for common Indian PIN code prefixes
const PINCODE_MAP: Record<string, { city: string; state: string; landmark?: string }> = {
  "560103": { city: "Bangalore", state: "Karnataka", landmark: "Bellandur / Outer Ring Rd" },
  "560001": { city: "Bangalore", state: "Karnataka", landmark: "MG Road / Central" },
  "560034": { city: "Bangalore", state: "Karnataka", landmark: "Koramangala 4th Block" },
  "560066": { city: "Bangalore", state: "Karnataka", landmark: "Whitefield Main Rd" },
  "560076": { city: "Bangalore", state: "Karnataka", landmark: "BTM Layout 2nd Stage" },
  "560029": { city: "Bangalore", state: "Karnataka", landmark: "Tavarekere / SG Palya" },
  "110001": { city: "New Delhi", state: "Delhi", landmark: "Connaught Place" },
  "110016": { city: "New Delhi", state: "Delhi", landmark: "Hauz Khas" },
  "110019": { city: "New Delhi", state: "Delhi", landmark: "Kalkaji / Nehru Place" },
  "400001": { city: "Mumbai", state: "Maharashtra", landmark: "Fort / Nariman Point" },
  "400050": { city: "Mumbai", state: "Maharashtra", landmark: "Bandra West / Hill Rd" },
  "400053": { city: "Mumbai", state: "Maharashtra", landmark: "Andheri West / Lokhandwala" },
  "700001": { city: "Kolkata", state: "West Bengal", landmark: "BBD Bagh / Dalhousie" },
  "700091": { city: "Kolkata", state: "West Bengal", landmark: "Salt Lake Sector V" },
  "700156": { city: "Kolkata", state: "West Bengal", landmark: "New Town Action Area 1" },
  "600001": { city: "Chennai", state: "Tamil Nadu", landmark: "George Town" },
  "600028": { city: "Chennai", state: "Tamil Nadu", landmark: "Raja Annamalai Puram" },
  "500001": { city: "Hyderabad", state: "Telangana", landmark: "Abids / Koti" },
  "500081": { city: "Hyderabad", state: "Telangana", landmark: "HITEC City / Madhapur" },
  "411001": { city: "Pune", state: "Maharashtra", landmark: "Camp / Station" },
  "411057": { city: "Pune", state: "Maharashtra", landmark: "Hinjawadi Phase 1" },
  "380001": { city: "Ahmedabad", state: "Gujarat", landmark: "Lal Darwaja" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin")?.trim();

    if (!pin || pin.length < 3) {
      return NextResponse.json({ error: "Invalid PIN code" }, { status: 400 });
    }

    // 1. Direct hit in offline dictionary
    if (PINCODE_MAP[pin]) {
      return NextResponse.json({
        success: true,
        pincode: pin,
        ...PINCODE_MAP[pin],
        source: "cache",
      });
    }

    // 2. Prefix matching for cities
    const prefix2 = pin.substring(0, 2);
    const prefix3 = pin.substring(0, 3);

    let guessedCity = "";
    let guessedState = "";

    if (prefix3 === "560") {
      guessedCity = "Bangalore";
      guessedState = "Karnataka";
    } else if (prefix2 === "11") {
      guessedCity = "New Delhi";
      guessedState = "Delhi";
    } else if (prefix3 === "400") {
      guessedCity = "Mumbai";
      guessedState = "Maharashtra";
    } else if (prefix3 === "700") {
      guessedCity = "Kolkata";
      guessedState = "West Bengal";
    } else if (prefix3 === "600") {
      guessedCity = "Chennai";
      guessedState = "Tamil Nadu";
    } else if (prefix3 === "500") {
      guessedCity = "Hyderabad";
      guessedState = "Telangana";
    } else if (prefix3 === "411") {
      guessedCity = "Pune";
      guessedState = "Maharashtra";
    }

    // 3. Fallback: Query Indian Postal PIN API with 1.5s timeout
    if (pin.length === 6) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const postalRes = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (postalRes.ok) {
          const postalData = await postalRes.json();
          if (postalData && postalData[0]?.Status === "Success" && postalData[0]?.PostOffice?.length > 0) {
            const po = postalData[0].PostOffice[0];
            return NextResponse.json({
              success: true,
              pincode: pin,
              city: po.District || po.Block || po.Circle,
              state: po.State,
              landmark: po.Name,
              source: "postal_api",
            });
          }
        }
      } catch (e) {
        // Fallback to prefix
      }
    }

    if (guessedCity) {
      return NextResponse.json({
        success: true,
        pincode: pin,
        city: guessedCity,
        state: guessedState,
        source: "prefix_match",
      });
    }

    return NextResponse.json(
      { error: "PIN code not found in directory", pincode: pin },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "PIN lookup error" }, { status: 500 });
  }
}
