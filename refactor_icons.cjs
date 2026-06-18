const fs = require('fs');
const path = require('path');

function refactorFile(filepath) {
    let content;
    try {
        content = fs.readFileSync(filepath, 'utf8');
    } catch (e) {
        console.error(`Error reading ${filepath}: ${e}`);
        return false;
    }

    // Match import { Icon1, Icon2 } from 'lucide-react'
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/g;
    let anyChange = false;
    let iconsToReplace = new Set();
    let newContent = content;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const iconsText = match[1];
        const icons = iconsText.split(',').map(i => i.trim()).filter(i => i);
        icons.forEach(i => iconsToReplace.add(i));
        
        newContent = newContent.replace(fullMatch, "import * as Icons from 'lucide-react';");
        anyChange = true;
    }

    if (!anyChange) return false;

    // Replace usages
    iconsToReplace.forEach(icon => {
        // Case 1: <IconName
        newContent = newContent.replace(new RegExp(`<${icon}\\b`, 'g'), `<Icons.${icon}`);
        // Case 2: Icon={IconName}
        newContent = newContent.replace(new RegExp(`=\\s*\\{${icon}\\s*\\}`, 'g'), `={Icons.${icon}}`);
        // Case 3: icon: IconName
        newContent = newContent.replace(new RegExp(`\\bicon\\s*:\\s*${icon}\\b`, 'g'), `icon: Icons.${icon}`);
        // Case 4: {IconName} (inside JSX)
        newContent = newContent.replace(new RegExp(`\\{${icon}\\s*\\}`, 'g'), `{Icons.${icon}}`);
        // Case 5: as={IconName}
        newContent = newContent.replace(new RegExp(`\\b(\\w+)=\\s*\\{${icon}\\s*\\}`, 'g'), `$1={Icons.${icon}}`);
    });

    if (newContent !== content) {
        try {
            fs.writeFileSync(filepath, newContent, 'utf8');
            return true;
        } catch (e) {
            console.error(`Error writing ${filepath}: ${e}`);
        }
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                count += walkDir(fullPath);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            if (refactorFile(fullPath)) {
                console.log(`Refactored: ${fullPath}`);
                count++;
            }
        }
    });
    return count;
}

const srcDir = path.join(__dirname, 'src');
console.log(`Starting refactor in ${srcDir}...`);
const total = walkDir(srcDir);
console.log(`Total files refactored: ${total}`);
