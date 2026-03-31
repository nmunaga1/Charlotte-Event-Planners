const bcrypt = require("bcryptjs");
const { authenticator } = require("otplib");

const args = process.argv.slice(2);

const getArgumentValue = (flagName) => {
  const flagIndex = args.indexOf(flagName);

  if (flagIndex === -1 || flagIndex === args.length - 1) {
    return "";
  }

  return String(args[flagIndex + 1]).trim();
};

const password = getArgumentValue("--password");
const username = getArgumentValue("--username") || "owner";
const issuer = getArgumentValue("--issuer") || "Charlotte Event Planners";
const disableMfa = args.includes("--no-mfa");

if (!password) {
  console.error(
    [
      "Usage:",
      "  npm run admin:credentials -- --password \"your-strong-password\"",
      "  npm run admin:credentials -- --password \"your-strong-password\" --username owner --issuer \"Charlotte Event Planners\"",
      "  Add --no-mfa if you do not want to generate a TOTP secret.",
    ].join("\n")
  );
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12);
const sessionTtlHours = 12;

console.log("\nAdd these values to your .env file:\n");
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_SESSION_TTL_HOURS=${sessionTtlHours}`);

if (!disableMfa) {
  const totpSecret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(username, issuer, totpSecret);

  console.log(`ADMIN_TOTP_SECRET=${totpSecret}`);
  console.log("\nScan this TOTP URL in Google Authenticator, 1Password, or another authenticator app:\n");
  console.log(otpauthUrl);
} else {
  console.log("ADMIN_TOTP_SECRET=");
}
