import { useCallback } from "react";

export const useGeolocation = () => {
  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("UNSUPPORTED"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }, []);

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const city = data.principalSubdivision || data.city;
      const district = data.locality || data.district;
      return { city, district };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("GEOCODING_FAILED");
    }
  }, []);

  const fetchLocationWithGeocode = useCallback(async () => {
    try {
      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;
      const { city, district } = await reverseGeocode(latitude, longitude);
      return { latitude, longitude, city, district };
    } catch (error) {
      if (error.code === 1) { // GeolocationPositionError usually has a code property
        throw new Error("PERMISSION_DENIED");
      }
      if (error.message === "UNSUPPORTED" || error.message === "GEOCODING_FAILED") {
        throw error;
      }
      throw new Error("POSITION_UNAVAILABLE");
    }
  }, [getPosition, reverseGeocode]);

  return { getPosition, reverseGeocode, fetchLocationWithGeocode };
};
