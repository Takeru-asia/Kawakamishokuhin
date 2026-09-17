// Runs once when the Next.js server starts.
// Vercel functions run in UTC and TZ is a reserved env var there, so pin the
// process timezone here: date boundaries (今日/今月) must follow JST.
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.env.TZ = "Asia/Tokyo";
  }
}
