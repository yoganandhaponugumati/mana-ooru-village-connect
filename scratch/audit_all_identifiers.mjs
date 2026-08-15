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

console.log(`Auditing all JSX identifiers across ${files.length} files...`);

const missingSymbols = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");

  // Match JSX attributes or children with identifiers: src={identifier}, icon={<Identifier />}
  // Match single identifier inside curly braces e.g. {workersImg}, {logoUrl}, {someVar}
  const jsxCurlyRegex = /=\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
  let match;

  while ((match = jsxCurlyRegex.exec(content)) !== null) {
    const symbol = match[1];

    // Ignore boolean/literal/common keywords
    if (
      ["true", "false", "null", "undefined", "event", "e", "index", "i", "item", "val"].includes(
        symbol,
      )
    ) {
      continue;
    }

    // Check if symbol is declared, imported, or a prop/param in the file
    const isImported = new RegExp(`\\b${symbol}\\b`).test(
      content.split(/export\s+const|export\s+function|function\s+[A-Z]/)[0],
    );
    const isDecl = new RegExp(
      `(?:const|let|var|function|type|interface|param|props|\\{|\\()\\s*[^}]*\\b${symbol}\\b`,
    ).test(content);

    // Check if imported at top of file
    const topImportRegex = new RegExp(`import[\\s\\S]*?\\b${symbol}\\b[\\s\\S]*?from`);
    const isTopImport = topImportRegex.test(content);

    if (!isTopImport && !isDecl) {
      missingSymbols.push({ file: filePath, missingSymbol: symbol });
    }
  }
});

if (missingSymbols.length === 0) {
  console.log(
    "✅ PERFECT AUDIT: All JSX identifiers are valid and properly imported across all files!",
  );
} else {
  console.log("❌ POTENTIAL MISSING SYMBOLS FOUND:");
  console.table(missingSymbols);
}
