const https = require('https');
const fs = require('fs');

https.get('https://onlineislemler.egm.gov.tr/trafik/Sayfalar/EDSHarita.aspx', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('egm.html', data);
    console.log('Saved to egm.html, length:', data.length);
    
    // Attempt to find markers in JSON-like structures
    let lines = data.split('\n');
    let found = [];
    lines.forEach(line => {
      if (line.includes('EDS') || line.includes('lat') || line.includes('lng')) {
        found.push(line.trim());
      }
    });
    fs.writeFileSync('egm_lines.txt', found.join('\n'));
    console.log('Saved lines to egm_lines.txt');
  });
}).on('error', console.error);
