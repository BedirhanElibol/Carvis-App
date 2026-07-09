const fs = require('fs');
const file = 'c:/Users/Bedirhan/Desktop/Carvis-App/Carvis/src/components/layout/PartnerLayout.jsx';
let text = fs.readFileSync(file, 'utf8');

// 1. Add Shield to lucide-react imports if not present
if (!text.includes(', Shield ')) {
  text = text.replace(
    'CheckCircle, Ban, Droplet } from "lucide-react";',
    'CheckCircle, Ban, Droplet, Shield } from "lucide-react";'
  );
}

// 2. Add 'insurance' to allowedRoles
text = text.replace(
  'const allowedRoles = ["parking", "valet", "mechanic", "parts", "provider", "tow_truck", "carwash"];',
  'const allowedRoles = ["parking", "valet", "mechanic", "parts", "provider", "tow_truck", "carwash", "insurance"];'
);

// 3. Add insurance condition in navItems
const carwashBlock = `  } else if (role === "carwash") {
    navItems.splice(1, 0, {
      key: "carwash",
      label: "Yıkama Talepleri",
      icon: Droplet,
      path: "/partner/carwash/requests",
    });
  }`;

const insuranceBlock = `  } else if (role === "carwash") {
    navItems.splice(1, 0, {
      key: "carwash",
      label: "Yıkama Talepleri",
      icon: Droplet,
      path: "/partner/carwash/requests",
    });
  } else if (role === "insurance") {
    navItems.splice(1, 0, {
      key: "insurance",
      label: "Poliçe Teklifleri",
      icon: Shield,
      path: "/partner/dashboard",
    });
  }`;

text = text.replace(carwashBlock, insuranceBlock);

// 4. Add Insurance button to Dev switcher grid
const devSwitcher = `<button
              onClick={() => setRole("mechanic")}
              className={\`p-2 rounded-lg text-xs font-bold \${
                role === "mechanic"
                  ? "bg-orange-500 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }\`}
            >
              Usta
            </button>`;

const devSwitcherWithInsurance = `<button
              onClick={() => setRole("mechanic")}
              className={\`p-2 rounded-lg text-xs font-bold \${
                role === "mechanic"
                  ? "bg-orange-500 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }\`}
            >
              Usta
            </button>
            <button
              onClick={() => setRole("insurance")}
              className={\`p-2 rounded-lg text-xs font-bold \${
                role === "insurance"
                  ? "bg-blue-500 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }\`}
            >
              Sigorta
            </button>`;

text = text.replace(devSwitcher, devSwitcherWithInsurance);

fs.writeFileSync(file, text, 'utf8');
console.log('Successfully updated PartnerLayout!');
