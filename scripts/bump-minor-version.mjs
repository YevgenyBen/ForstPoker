import fs from "node:fs";

const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
const parts = String(pkg.version).split(".").map(Number);
if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
  throw new Error(`Invalid semver in package.json: ${pkg.version}`);
}
const [major, minor] = parts;
pkg.version = `${major}.${minor + 1}.0`;
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Bumped version to ${pkg.version}`);
