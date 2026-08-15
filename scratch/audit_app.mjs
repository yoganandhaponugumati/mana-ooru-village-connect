import fs from "fs";
import path from "path";

const routesDir = "./src/routes";
const componentsDir = "./src/components";

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [...getFiles(routesDir), ...getFiles(componentsDir)];

console.log(`Auditing ${files.length} TypeScript/React files...`);

const commonHooks = [
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useContext",
  "useId",
  "useLayoutEffect",
];

const missingImports = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");

  // Check React hooks
  commonHooks.forEach((hook) => {
    // regex matches hook as word, e.g. useState(
    const hookRegex = new RegExp(`\\b${hook}\\s*\\(`, "g");
    if (hookRegex.test(content)) {
      // Check if hook is imported or qualified (React.useState)
      const importRegex = new RegExp(
        `import\\s*\\{[^}]*\\b${hook}\\b[^}]*\\}\\s*from\\s*["']react["']`,
      );
      const isQualified = new RegExp(`React\\.${hook}`).test(content);
      if (!importRegex.test(content) && !isQualified) {
        missingImports.push({ file: filePath, missingSymbol: hook });
      }
    }
  });

  // Check useVillagePreferences
  if (/\buseVillagePreferences\s*\([^)]*\)/.test(content)) {
    if (!/import\s*\{[^}]*\buseVillagePreferences\b[^}]*\}\s*from/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: "useVillagePreferences" });
    }
  }

  // Check useAuth
  if (/\buseAuth\s*\([^)]*\)/.test(content)) {
    if (!/import\s*\{[^}]*\buseAuth\b[^}]*\}\s*from/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: "useAuth" });
    }
  }

  // Check useNavigate
  if (/\buseNavigate\s*\([^)]*\)/.test(content)) {
    if (!/import\s*\{[^}]*\buseNavigate\b[^}]*\}\s*from/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: "useNavigate" });
    }
  }

  // Check AnimatePresence
  if (/<AnimatePresence\b/.test(content)) {
    if (!/import\s*\{[^}]*\bAnimatePresence\b[^}]*\}\s*from/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: "AnimatePresence" });
    }
  }

  // Check motion
  if (/<motion\./.test(content)) {
    if (!/import\s*\{[^}]*\bmotion\b[^}]*\}\s*from/.test(content)) {
      missingImports.push({ file: filePath, missingSymbol: "motion" });
    }
  }
});

if (missingImports.length === 0) {
  console.log(
    "✅ AUDIT PASSED: No missing imports or undefined hooks found in any route or component!",
  );
} else {
  console.log("❌ MISSING IMPORTS FOUND:");
  console.table(missingImports);
}
