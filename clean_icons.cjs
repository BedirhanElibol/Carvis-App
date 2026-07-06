const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

let modifiedCount = 0;

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import * as Icons from "lucide-react"') && !content.includes("import * as Icons from 'lucide-react'")) return;

  // Find all used icons
  const iconRegex = /Icons\.([A-Z][a-zA-Z0-9_]*)/g;
  let match;
  const usedIcons = new Set();
  
  while ((match = iconRegex.exec(content)) !== null) {
    usedIcons.add(match[1]);
  }
  
  const iconList = Array.from(usedIcons).sort();
  
  if (iconList.length > 0) {
    const newImport = `import { ${iconList.join(', ')} } from "lucide-react";`;
    content = content.replace(/import \* as Icons from ["']lucide-react["'];?/, newImport);
    
    // Replace usages
    iconList.forEach(icon => {
      const regex = new RegExp(`Icons\\.${icon}`, 'g');
      content = content.replace(regex, icon);
    });
  } else {
    // No icons used, just remove import
    content = content.replace(/import \* as Icons from ["']lucide-react["'];?\n?/, '');
  }
  
  fs.writeFileSync(filePath, content);
  modifiedCount++;
});

console.log('Modified files:', modifiedCount);
