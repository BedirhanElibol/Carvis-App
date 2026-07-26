/**
 * NHTSA vPIC VIN Decoder Service (Free / Unlimited / No Auth)
 * Decodes 17-character VINs to retrieve vehicle specs: Make, Model, Model Year, Displacement, Fuel Type, Cylinders, Body Class.
 */
export async function decodeVin(vin) {
  if (!vin || vin.length < 11) {
    throw new Error("Geçerli bir şase numarası (VIN) giriniz.");
  }

  const cleanVin = vin.trim().toUpperCase();
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${cleanVin}?format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`VIN servisine ulaşılamadı (${res.status})`);
    }

    const data = await res.json();
    const result = data.Results?.[0];

    if (!result) {
      throw new Error("Şase numarası çözümlenemedi.");
    }

    return {
      vin: cleanVin,
      make: result.Make || "",
      model: result.Model || "",
      year: result.ModelYear || "",
      bodyClass: result.BodyClass || "",
      engineDisplacementCc: result.DisplacementCC ? Math.round(parseFloat(result.DisplacementCC)) : null,
      engineCylinders: result.EngineCylinders || "",
      fuelType: result.FuelTypePrimary || "",
      driveType: result.DriveType || "",
      plantCountry: result.PlantCountry || "",
      errorCode: result.ErrorCode || "0",
      errorText: result.ErrorText || ""
    };
  } catch (error) {
    console.error("VIN decode error:", error);
    throw error;
  }
}
