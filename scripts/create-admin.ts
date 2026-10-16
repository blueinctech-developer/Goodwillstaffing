// Creates (or resets) an owner account so you can sign in to /admin the first
// time. Later admins are invited from /admin/admins/.
//
//   npm run admin:create
//   npm run admin:create -- --email you@goodwillstaffing.ca --name "Your Name"
//
// The password is always asked for interactively (never as an argument, so it
// stays out of shell history). Re-running for an existing email resets that
// account's password, reactivates it and makes it an owner.

import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { eq } from "drizzle-orm";
import { hashPassword, newPasswordSchema } from "../src/lib/auth/password";
import { connect, schema } from "./lib/db";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

/** Prompt without echoing what's typed. */
async function askHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, done) {
      if (!muted) process.stdout.write(chunk);
      done();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  const pending = rl.question(question);
  muted = true;
  const answer = await pending;
  rl.close();
  process.stdout.write("\n");
  return answer;
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function main() {
  const email = (arg("email") ?? (await ask("Email: "))).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That doesn't look like an email address.");
  const name = (arg("name") ?? (await ask("Name: "))).trim() || email.split("@")[0];

  // Allow a non-interactive run (CI) through an env var; never via argv.
  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await askHidden("Password (12+ characters): ");
    const confirm = await askHidden("Confirm password: ");
    if (password !== confirm) throw new Error("Passwords don't match.");
  }
  const check = newPasswordSchema.safeParse(password);
  if (!check.success) throw new Error(check.error.issues[0]?.message ?? "Password rejected.");

  const { db, close } = connect();
  try {
    const passwordHash = await hashPassword(password);
    const [existing] = await db
      .select({ id: schema.admins.id })
      .from(schema.admins)
      .where(eq(schema.admins.email, email));
    if (existing) {
      await db
        .update(schema.admins)
        .set({
          name,
          role: "owner",
          isActive: true,
          passwordHash,
          passwordUpdatedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(schema.admins.id, existing.id));
      console.log(`Updated ${email}: owner, password reset.`);
    } else {
      await db
        .insert(schema.admins)
        .values({ email, name, role: "owner", passwordHash, passwordUpdatedAt: new Date() });
      console.log(`Created owner ${email}. Sign in at /admin/login/.`);
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
