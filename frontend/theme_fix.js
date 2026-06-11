const fs = require('fs');
const path = require('path');

function replaceColorsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace bright blues with navy blues
  // Tailwind blue-600 to navy-800
  content = content.replace(/#2563eb/gi, '#1e3a8a');
  content = content.replace(/#3b82f6/gi, '#1e3a8a');
  content = content.replace(/#1d4ed8/gi, '#172554');
  content = content.replace(/#1e40af/gi, '#172554');
  content = content.replace(/#60a5fa/gi, '#1e3a8a');
  // keep light blues for text contrast if needed, or change them to lighter navy slate
  content = content.replace(/#bfdbfe/gi, '#e2e8f0'); // slate-200
  content = content.replace(/#dbeafe/gi, '#f8fafc'); // slate-50
  
  // Also RGB versions if any
  content = content.replace(/rgba\(59,\s*130,\s*246/gi, 'rgba(30, 58, 138'); // blue-500 to navy-800
  content = content.replace(/rgba\(29,\s*78,\s*216/gi, 'rgba(23, 37, 84'); // blue-700 to navy-950

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated colors in', filePath);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceColorsInFile(fullPath);
    }
  }
}

processDirectory('c:\\gestion_tecnologica_fisei\\frontend\\app');
processDirectory('c:\\gestion_tecnologica_fisei\\frontend\\components');

// Add scrollbar to globals.css
const globalsPath = 'c:\\gestion_tecnologica_fisei\\frontend\\app\\styles\\globals.css';
if (fs.existsSync(globalsPath)) {
  let globals = fs.readFileSync(globalsPath, 'utf8');
  if (!globals.includes('::-webkit-scrollbar')) {
    globals += `\n
/* ====================================================
   SCROLLBAR GENERAL
   ==================================================== */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  background: #1e3a8a;
  border-radius: 8px;
  border: 2px solid #f1f5f9;
}
::-webkit-scrollbar-thumb:hover {
  background: #172554;
}
html { scroll-behavior: smooth; }
`;
    fs.writeFileSync(globalsPath, globals, 'utf8');
    console.log('Added scrollbar to globals.css');
  }
}
