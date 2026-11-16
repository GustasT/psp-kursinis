import { readFileSync } from "node:fs";
import { openDatabase } from "./database.js";
import { seedDatabase } from "./seed.js";

const db = openDatabase();

try {
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

  db.exec(schema);
  seedDatabase(db);

  console.log("Sporto klubai:");
  console.table(db.prepare("SELECT * FROM organizations").all());

  console.log("Nariai:");
  console.table(db.prepare("SELECT * FROM members").all());

  console.log("Treniruokliai:");
  console.table(db.prepare("SELECT * FROM equipment").all());
} finally {
  db.close();
}
