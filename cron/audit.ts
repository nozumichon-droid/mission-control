import { runWeeklyAudit } from "../src/lib/auditRunner";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

async function main() {
  console.log("Starting weekly mission-control audit...");
  const results = await runWeeklyAudit({
    supabaseUrl: supabaseUrl!,
    serviceRoleKey: serviceRole!,
    pageSpeedApiKey: process.env.PAGESPEED_API_KEY,
  });
  console.log("Audit complete:", results);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
