/**
 * Open-Meteo Weather Service (Free / Unlimited / No Auth)
 * Provides real-time weather, rain precipitation, and temperature warnings for driving & carwash advice.
 */

const CITY_COORDINATES = {
  istanbul: { lat: 41.0082, lng: 28.9784, name: "İstanbul" },
  ankara: { lat: 39.9334, lng: 32.8597, name: "Ankara" },
  izmir: { lat: 38.4237, lng: 27.1428, name: "İzmir" },
  bursa: { lat: 40.1885, lng: 29.0610, name: "Bursa" },
  antalya: { lat: 36.8969, lng: 30.7133, name: "Antalya" },
  adana: { lat: 37.0000, lng: 35.3213, name: "Adana" }
};

export async function fetchCityWeather(cityKey = "istanbul") {
  const city = CITY_COORDINATES[cityKey.toLowerCase()] || CITY_COORDINATES.istanbul;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Hava durumu servisine ulaşılamadı.");

    const data = await res.json();
    const current = data.current_weather || {};
    const daily = data.daily || {};

    const temp = current.temperature || 15;
    const isFreezing = temp <= 2;
    const todayPrecipitation = daily.precipitation_sum?.[0] || 0;
    const tomorrowPrecipitation = daily.precipitation_sum?.[1] || 0;
    const isRainyToday = todayPrecipitation > 1.0;
    const isRainyTomorrow = tomorrowPrecipitation > 1.0;

    let advice = "Hava sürüş için elverişli. Güvenli sürüşler!";
    let adviceType = "normal"; // normal, rain_warning, freeze_warning, wash_delay

    if (isFreezing) {
      advice = "⚠️ DİKKAT: Gizli buzlanma riski ve düşük sıcaklık! Antifriz seviyenizi ve kış lastiklerinizi kontrol edin.";
      adviceType = "freeze_warning";
    } else if (isRainyToday) {
      advice = "🌧️ YAĞMURLU HAVA: Takip mesafesini artırın. Oto yıkama yaptırmak için yarını beklemek isteyebilirsiniz.";
      adviceType = "rain_warning";
    } else if (isRainyTomorrow) {
      advice = "☔ YARIN YAĞMUR BEKLENİYOR: Oto yıkama yaptırmak istiyorsanız cilalı koruma paketlerini tercih edin.";
      adviceType = "wash_delay";
    }

    return {
      cityName: city.name,
      temperature: temp,
      windSpeed: current.windspeed || 0,
      weatherCode: current.weathercode || 0,
      todayPrecipitation,
      tomorrowPrecipitation,
      isFreezing,
      isRainyToday,
      isRainyTomorrow,
      advice,
      adviceType
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return {
      cityName: city.name,
      temperature: 18,
      windSpeed: 10,
      weatherCode: 0,
      todayPrecipitation: 0,
      tomorrowPrecipitation: 0,
      isFreezing: false,
      isRainyToday: false,
      isRainyTomorrow: false,
      advice: "İyi yolculuklar! Aracınızın bakımlarını zamanında yaptırmayı unutmayın.",
      adviceType: "normal"
    };
  }
}
