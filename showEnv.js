// log-env.js
// Usage:
//   node log-env.js
//   node log-env.js --out env.pretty.json
//   node log-env.js --no-mask

"use strict";

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outFile = outIdx !== -1 ? args[outIdx + 1] : null;
const noMask = args.includes("--no-mask");

const SENSITIVE_KEYWORDS = [
  "TOKEN",
  "SECRET",
  "PASSWORD",
  "PASS",
  "KEY",
  "PRIVATE",
  "AUTH",
  "BEARER",
  "COOKIE",
  "SESSION",
  "API_KEY",
  "ACCESS_KEY",
  "REFRESH",
  "SIGNATURE",
  "CREDENTIAL",
];

function isSensitiveKey(k) {
  const up = String(k).toUpperCase();
  return SENSITIVE_KEYWORDS.some((kw) => up.includes(kw));
}

function maskValue(v) {
  if (v == null) return v;
  const s = String(v);
  if (s.length <= 4) return "****";
  // Giữ 2 ký tự đầu + 2 ký tự cuối cho dễ debug
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function buildEnvSnapshot() {
  const keys = Object.keys(process.env).sort((a, b) => a.localeCompare(b));
  const obj = {};
  for (const k of keys) {
    const v = process.env[k];
    obj[k] = (!noMask && isSensitiveKey(k)) ? maskValue(v) : v;
  }
  return {
    meta: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      cwd: process.cwd(),
      timestamp: new Date().toISOString(),
      masked: !noMask,
    },
    env: obj,
  };
}

const snapshot = buildEnvSnapshot();
const pretty = JSON.stringify(snapshot, null, 2);

if (outFile) {
  const p = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(p, pretty, "utf8");
  console.log(`✅ Wrote env JSON to: ${p}`);
} else {
  console.log(pretty);
}