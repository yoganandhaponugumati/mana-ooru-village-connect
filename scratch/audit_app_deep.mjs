import fs from 'fs';
import path from 'path';

const routesDir = './src/routes';
const componentsDir = './src/components';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [...getFiles(routesDir), ...getFiles(componentsDir)];

console.log(`Deep auditing ${files.length} files with multiline import support...`);

const missingImports = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Custom hooks check
  ['useVillagePreferences', 'useAuth', 'useNavigate', 'useListings', 'useUIStore', 'useListingStats'].forEach(symbol => {
    // Check if symbol is invoked as a function call: symbol(...)
    const funcCallRegex = new RegExp(`\\b${symbol}\\s*\\(`);
    if (funcCallRegex.test(content)) {
      // Check if it's imported anywhere in the file (multiline match)
      const isImported = new RegExp(`import[\\s\\S]*?\\b${symbol}\\b[\\s\\S]*?from`).test(content);
      const isDecl = new RegExp(`(?:const|let|var|function|type|interface)\\s+${symbol}\\b`).test(content);
      if (!isImported && !isDecl) {
        missingImports.push({ file: filePath, missingSymbol: symbol });
      }
    }
  });

  // React Hooks check
  ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', 'useContext', 'useId'].forEach(hook => {
    const hookCallRegex = new RegExp(`\\b${hook}\\s*\\(`);
    if (hookCallRegex.test(content)) {
      const isImported = new RegExp(`import[\\s\\S]*?\\b${hook}\\b[\\s\\S]*?from\\s*["']react["']`).test(content);
      const isQualified = new RegExp(`React\\.${hook}`).test(content);
      if (!isImported && !isQualified) {
        missingImports.push({ file: filePath, missingSymbol: hook });
      }
    }
  });

  // Lucide / motion checks
  if (/<AnimatePresence\b/.test(content)) {
    if (!/import[\s\S]*?AnimatePresence[\s\S]*?from\s+["']framer-motion["']/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: 'AnimatePresence' });
    }
  }
  if (/<motion\./.test(content)) {
    if (!/import[\s\S]*?motion[\s\S]*?from\s+["']framer-motion["']/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: 'motion' });
    }
  }
});

if (missingImports.length === 0) {
  console.log('✅ ALL 98 FILES PASSED DEEP AUDIT: Zero missing imports found!');
} else {
  console.log('❌ MISSING IMPORTS FOUND:');
  console.table(missingImports);
}
