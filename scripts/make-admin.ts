import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
db.user
  .update({ where: { email }, data: { role: "ADMIN" } })
  .then(() => console.log(`${email} is now an admin`))
  .catch(() => {
    console.error(`No user with email ${email}. Register on the site first.`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
