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
  // Match <a> tags
  const aTags = content.match(/<a[\s\S]*?>/gi);
  if (aTags) {
    aTags.forEach(tag => {
      if (tag.includes('target="_blank"') && !tag.includes('noopener')) {
        console.log(`Found in ${file}: ${tag}`);
      }
    });
  }
});
