const { performance } = require('perf_hooks');

const TURKEY_CITIES = {
  1: { city: "Adana", districts: ["Aladağ", "Ceyhan"] },
  2: { city: "Adıyaman", districts: ["Besni", "Çelikhan"] },
  // ... adding 81 items
};
for(let i = 3; i <= 81; i++) {
    TURKEY_CITIES[i] = { city: "City" + i, districts: ["D1", "D2", "D3", "D4"] };
}

function before(city) {
  const cityOptions = Object.values(TURKEY_CITIES)
    .map((c) => c.city)
    .sort((a, b) => a.localeCompare(b, "tr"));

  const selectedCityKey = Object.keys(TURKEY_CITIES).find(
    (key) => TURKEY_CITIES[key].city === city,
  );

  const districtOptions = selectedCityKey
    ? TURKEY_CITIES[selectedCityKey].districts.sort((a, b) =>
        a.localeCompare(b, "tr"),
      )
    : [];

  return districtOptions;
}


const CITY_OPTIONS = Object.values(TURKEY_CITIES)
  .map((c) => c.city)
  .sort((a, b) => a.localeCompare(b, "tr"));

const CITY_TO_DISTRICTS = Object.values(TURKEY_CITIES).reduce((acc, curr) => {
  acc[curr.city] = [...curr.districts].sort((a, b) => a.localeCompare(b, "tr"));
  return acc;
}, {});

function after(city) {
  const cityOptions = CITY_OPTIONS;
  const districtOptions = city ? CITY_TO_DISTRICTS[city] : [];
  return districtOptions;
}

const N = 10000;
const startBefore = performance.now();
for(let i=0; i<N; i++) {
    before("City50");
}
const endBefore = performance.now();

const startAfter = performance.now();
for(let i=0; i<N; i++) {
    after("City50");
}
const endAfter = performance.now();

console.log("Before: " + (endBefore - startBefore) + " ms");
console.log("After: " + (endAfter - startAfter) + " ms");
