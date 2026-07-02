const fs = require('fs');

const data = fs.readFileSync('egm.html', 'utf-8');

// Find all matches for Aciklama, lat, lng blocks
// The HTML seems to have JS objects like:
// { "Aciklama": '...', "lat": '...', "lng": '...' } or just lat/lng
const regex = /["']lat["']\s*:\s*['"]([^'"]+)['"]\s*,\s*["']lng["']\s*:\s*['"]([^'"]+)['"]/gi;
let match;
let points = [];

while ((match = regex.exec(data)) !== null) {
  points.push({ lat: parseFloat(match[1]), lng: parseFloat(match[2]) });
}

// We can also try to match 'Aciklama' to give them real names
const regexFull = /["']Aciklama["']\s*:\s*['"]([^'"]+)['"].*?["']lat["']\s*:\s*['"]([^'"]+)['"]\s*,\s*["']lng["']\s*:\s*['"]([^'"]+)['"]/gs;
let fullPoints = [];
while ((match = regexFull.exec(data)) !== null) {
  fullPoints.push({
    name: match[1],
    lat: parseFloat(match[2]),
    lng: parseFloat(match[3])
  });
}

console.log('Total coordinates found:', points.length);
console.log('Total full objects with Aciklama found:', fullPoints.length);

if (fullPoints.length > 0) {
    fs.writeFileSync('egm_parsed.json', JSON.stringify(fullPoints, null, 2));
} else {
    // some might not have Aciklama near them. 
    fs.writeFileSync('egm_parsed.json', JSON.stringify(points, null, 2));
}
