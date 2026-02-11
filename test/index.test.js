import test from "node:test";
import assert from "node:assert/strict";
import { cleanOrphanUploads } from "../src/index.js";

test("throws when uploadsDir is missing", async () => {
  await assert.rejects(
    () => cleanOrphanUploads(),
    /uploadsDir is required/
  );
});

test("throws for invalid SQL identifiers", async () => {
  await assert.rejects(
    () =>
      cleanOrphanUploads({
        uploadsDir: "public/uploads",
        table: "projects;drop table users",
      }),
    /valid SQL identifiers/
  );
});
