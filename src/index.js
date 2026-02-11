import fs from "fs";
import path from "path";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const isValidIdentifier = (value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);

const normalizeDbPath = (value, prefix) => {
  if (!value || typeof value !== "string") return "";
  if (!value.startsWith(prefix)) return "";
  return value.replace(/^\/+/, "");
};

const buildDbConfig = (dbUrl) => {
  if (dbUrl) {
    return { connectionString: dbUrl };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
};

export const cleanOrphanUploads = async ({
  uploadsDir,
  dryRun = false,
  dbUrl,
  table = "projects",
  column = "image",
  pathPrefix = "/uploads/",
} = {}) => {
  if (!uploadsDir) {
    throw new Error("uploadsDir is required");
  }
  if (!isValidIdentifier(table) || !isValidIdentifier(column)) {
    throw new Error("table and column must be valid SQL identifiers");
  }

  const absoluteUploadsDir = path.resolve(uploadsDir);
  if (!fs.existsSync(absoluteUploadsDir)) {
    return { removed: 0, scanned: 0, skipped: true };
  }

  const pool = new Pool(buildDbConfig(dbUrl));
  try {
    const query = `SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL`;
    const result = await pool.query(query);

    const used = new Set(
      result.rows
        .map((row) => normalizeDbPath(row[column], pathPrefix))
        .filter(Boolean)
    );

    const files = fs.readdirSync(absoluteUploadsDir);
    let removed = 0;

    for (const file of files) {
      const relPath = path.join("uploads", file).replace(/\\/g, "/");
      if (used.has(relPath)) continue;

      if (!dryRun) {
        fs.unlinkSync(path.join(absoluteUploadsDir, file));
      }
      removed += 1;
    }

    return {
      removed,
      scanned: files.length,
      skipped: false,
    };
  } finally {
    await pool.end();
  }
};
