import "dotenv/config";
import { eq, asc } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function main() {
  const existing = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.role, "super_admin"))
    .limit(1);

  if (existing[0]) {
    console.log(`Super Admin already exists: ${existing[0].email}`);
    return;
  }

  const [candidate] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.role, "admin"))
    .orderBy(asc(users.createdAt))
    .limit(1);

  if (!candidate) {
    throw new Error("No admin account was found to promote. Create an admin account first.");
  }

  await db.update(users).set({ role: "super_admin", active: true }).where(eq(users.id, candidate.id));
  console.log(`Promoted ${candidate.email} to super_admin.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
