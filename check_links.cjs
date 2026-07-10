const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (!filepath.includes('node_modules')) {
        filelist = walk(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.jsx') || filepath.endsWith('.js') || filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
        filelist.push(filepath);
      }
    }
  });
  return filelist;
}

const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/<a[^>]+target=["']_blank["'][^>]*>/gi);
  if (matches) {
    matches.forEach(match => {
      if (!match.includes('noopener')) {
        console.log(`Found missing noopener in ${file}: ${match}`);
      }
    });
  }
});
