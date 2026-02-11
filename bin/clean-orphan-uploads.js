#!/usr/bin/env node

import { cleanOrphanUploads } from "../src/index.js";

const args = process.argv.slice(2);

const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
};

const hasFlag = (flag) => args.includes(flag);

const uploadsDir = getArgValue("--uploads-dir") || "public/uploads";
const dbUrl = getArgValue("--db-url") || process.env.DATABASE_URL;
const table = getArgValue("--table") || "projects";
const column = getArgValue("--column") || "image";
const pathPrefix = getArgValue("--path-prefix") || "/uploads/";
const dryRun = hasFlag("--dry-run");

const run = async () => {
  const result = await cleanOrphanUploads({
    uploadsDir,
    dryRun,
    dbUrl,
    table,
    column,
    pathPrefix,
  });

  if (result.skipped) {
    console.log(`No uploads directory found at: ${uploadsDir}`);
    process.exit(0);
  }

  if (dryRun) {
    console.log(
      `Dry-run complete. ${result.removed} file(s) would be removed from ${result.scanned} file(s).`
    );
  } else {
    console.log(
      `Removed ${result.removed} orphaned file(s) from ${result.scanned} file(s).`
    );
  }
};

run().catch((error) => {
  console.error("Failed to clean uploads:", error.message);
  process.exit(1);
});
