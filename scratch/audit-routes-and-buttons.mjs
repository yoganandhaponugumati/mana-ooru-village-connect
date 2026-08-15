import fs from "fs";
import path from "path";

const srcDir = path.resolve("./src");

function getAllFiles(dir, exts = [".ts", ".tsx"]) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  return results;
}

const files = getAllFiles(srcDir);
console.log(`Found ${files.length} source files to inspect.`);

// 1. Gather all registered routes
const routesDir = path.join(srcDir, "routes");
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith(".tsx"));
const registeredRoutes = new Set();

for (const rf of routeFiles) {
  if (rf === "__root.tsx" || rf === "README.md") continue;
  let routeName = "/" + rf.replace(/\.tsx$/, "").replace(/\$/g, ":");
  if (routeName === "/index") routeName = "/";
  registeredRoutes.add(routeName);
}

console.log("Registered routes count:", registeredRoutes.size);
console.log("Registered routes:", Array.from(registeredRoutes).sort());

// 2. Scan all files for <Link to="...", <AppLinkButton to="...", navigate({ to: "..." })
const issues = [];
const buttonStats = { totalButtons: 0, withOnClickOrType: 0, emptyHandlers: 0 };
const linkStats = { totalLinks: 0, validLinks: 0, invalidLinks: 0 };

for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);

  // Check Link / AppLinkButton to
  const linkRegex = /(?:<Link|<AppLinkButton|navigate\(\{)\s+(?:[^>]*?to=["']([^"']+)["']|to:\s*["']([^"']+)["'])/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    linkStats.totalLinks++;
    const target = match[1] || match[2];
    if (target.startsWith("http") || target.startsWith("#") || target.startsWith("tel:") || target.startsWith("mailto:")) {
      linkStats.validLinks++;
      continue;
    }
    const cleanTarget = target.split("?")[0].split("#")[0];
    if (!registeredRoutes.has(cleanTarget) && cleanTarget !== "/") {
      linkStats.invalidLinks++;
      issues.push({
        file: relPath,
        type: "BROKEN_ROUTE_LINK",
        detail: `Link target "${target}" (cleaned: "${cleanTarget}") does not match any registered route in src/routes!`,
      });
    } else {
      linkStats.validLinks++;
    }
  }

  // Check empty button click handlers
  const emptyClickRegex = /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g;
  while ((match = emptyClickRegex.exec(content)) !== null) {
    buttonStats.emptyHandlers++;
    issues.push({
      file: relPath,
      type: "EMPTY_ONCLICK_STUB",
      detail: `Found empty onClick handler stub: onClick={() => {}}`,
    });
  }

  // Check buttons without onClick or type="submit" or disabled
  const buttonRegex = /<(?:button|AppButton)\b([^>]*?)>/g;
  while ((match = buttonRegex.exec(content)) !== null) {
    buttonStats.totalButtons++;
    const props = match[1];
    const hasOnClick = /onClick\s*=/.test(props);
    const hasTypeSubmit = /type\s*=\s*["']submit["']/.test(props);
    const isFormChild = props.includes("form");
    const hasSpread = /\{\.\.\./.test(props);
    const hasAsChild = /asChild/.test(props);

    if (hasOnClick || hasTypeSubmit || isFormChild || hasSpread || hasAsChild) {
      buttonStats.withOnClickOrType++;
    } else {
      issues.push({
        file: relPath,
        type: "INERT_BUTTON_NO_ACTION",
        detail: `Button has no onClick and no type="submit": <button ${props.slice(0, 60)}...>`,
      });
    }
  }
}

console.log("\n=== AUDIT RESULTS ===");
console.log(`Total Links Checked: ${linkStats.totalLinks} (Valid: ${linkStats.validLinks}, Broken: ${linkStats.invalidLinks})`);
console.log(`Total Buttons Checked: ${buttonStats.totalButtons} (Valid Action: ${buttonStats.withOnClickOrType}, Empty Stubs: ${buttonStats.emptyHandlers})`);
console.log(`Total Potential Issues Found: ${issues.length}\n`);

for (const issue of issues) {
  console.log(`[${issue.type}] ${issue.file}: ${issue.detail}`);
}
