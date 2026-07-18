import fs from "node:fs";
import path from "node:path";

const files = [
  "supabase/migrations/20260713220000_four_role_auth_system.sql",
  "supabase/migrations/20260713230000_fix_notification_trigger_performance.sql",
];

for (const relPath of files) {
  const fullPath = path.resolve(relPath);
  let content = fs.readFileSync(fullPath, "utf8");

  // We find lines matching: CREATE POLICY "name" ON public.table_name
  // And ensure DROP POLICY IF EXISTS "name" ON public.table_name; exists right before or above it
  const lines = content.split("\n");
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^CREATE POLICY\s+"([^"]+)"\s+ON\s+public\.([a-zA-Z0-9_]+)/i);
    if (match) {
      const policyName = match[1];
      const tableName = match[2];
      const dropStmt = `DROP POLICY IF EXISTS "${policyName}" ON public.${tableName};`;

      // Check if the previous few lines (up to 15 lines back) already contain this drop
      let found = false;
      for (let j = Math.max(0, newLines.length - 15); j < newLines.length; j++) {
        if (newLines[j].trim() === dropStmt) {
          found = true;
          break;
        }
      }

      if (!found) {
        newLines.push(dropStmt);
      }
    }
    newLines.push(line);
  }

  fs.writeFileSync(fullPath, newLines.join("\n"), "utf8");
  console.log(`Processed ${relPath}`);
}
