const fs = require('fs');
const path = require('path');

function replaceColorsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace bg-[#030712] with bg-slate-50 dark:bg-[#030712] (but only if not already dark:)
    content = content.replace(/(?<!dark:)bg-\[#030712\]/g, 'bg-slate-50 dark:bg-[#030712]');
    content = content.replace(/(?<!dark:)bg-\[#0a0f24\]/g, 'bg-white dark:bg-[#0a0f24]');
    content = content.replace(/(?<!dark:)bg-\[#0f172a\]/g, 'bg-white dark:bg-[#0f172a]');
    content = content.replace(/(?<!dark:)bg-\[#050814\]/g, 'bg-slate-50 dark:bg-[#050814]');
    content = content.replace(/(?<!dark:)bg-\[#060a12\]/g, 'bg-slate-50 dark:bg-[#060a12]');
    content = content.replace(/(?<!dark:)bg-\[#0a0f1d\]/g, 'bg-white dark:bg-[#0a0f1d]');
    
    fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceColorsInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Colors fixed in all files.');
