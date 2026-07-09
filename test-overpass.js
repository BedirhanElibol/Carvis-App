const query = `[out:json][timeout:25];
(
  node["shop"="car_repair"]["name"~"Bosch|Otopratik|Auto King|RS Servis",i](around:50000,41.0082,28.9784);
  way["shop"="car_repair"]["name"~"Bosch|Otopratik|Auto King|RS Servis",i](around:50000,41.0082,28.9784);
);
out center;`;

fetch('https://overpass-api.de/api/interpreter', { 
  method: 'POST', 
  body: 'data=' + encodeURIComponent(query) 
})
.then(res => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
})
.then(data => console.log(JSON.stringify(data.elements, null, 2)))
.catch(console.error);
