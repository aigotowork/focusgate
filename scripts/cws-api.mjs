import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const defaultZip = resolve(root, "artifacts/chrome-web-store", `focusgate-${packageJson.version}.zip`);

const API_ROOT = "https://chromewebstore.googleapis.com";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CWS_SCOPE = "https://www.googleapis.com/auth/chromewebstore";
const DEFAULT_EXTENSION_ID = "hgjbamghlljcjckbcibjgknaidedaibi";
const ALLOWED_PUBLISH_TYPES = new Set(["DEFAULT_PUBLISH", "STAGED_PUBLISH"]);

loadDotEnv();
const args = parseArgs(process.argv.slice(2));
const command = args.positionals[0] ?? "help";

function loadDotEnv() {
  const envFile = resolve(root, ".env");
  if (!existsSync(envFile)) {
    return;
  }

  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(rawArgs) {
  const flags = new Map();
  const positionals = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const value = rawArgs[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }

    const [rawName, inlineValue] = value.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      flags.set(rawName, inlineValue);
      continue;
    }

    const next = rawArgs[index + 1];
    if (!next || next.startsWith("--")) {
      flags.set(rawName, "true");
      continue;
    }

    flags.set(rawName, next);
    index += 1;
  }

  return { flags, positionals };
}

function flag(name, fallback = undefined) {
  return args.flags.get(name) ?? fallback;
}

function boolFlag(name, fallback = false) {
  const value = flag(name);
  if (value === undefined) {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function env(...names) {
  for (const name of names) {
    if (process.env[name]) {
      return process.env[name];
    }
  }
  return undefined;
}

function required(value, label) {
  if (!value) {
    throw new Error(`${label} is required. See project-docs/store/automation.md for setup steps.`);
  }
  return value;
}

function itemName() {
  const publisherId = required(flag("publisher-id") ?? env("CWS_PUBLISHER_ID", "PUBLISHER_ID"), "CWS_PUBLISHER_ID");
  const extensionId = flag("extension-id") ?? env("CWS_EXTENSION_ID", "EXTENSION_ID") ?? DEFAULT_EXTENSION_ID;
  return `publishers/${publisherId}/items/${extensionId}`;
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function accessTokenFromServiceAccount(serviceAccountJson) {
  const credentials = JSON.parse(serviceAccountJson);
  const clientEmail = required(credentials.client_email, "service account client_email");
  const privateKey = required(credentials.private_key, "service account private_key");
  const issuedAt = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: CWS_SCOPE,
    aud: TOKEN_URL,
    exp: issuedAt + 3600,
    iat: issuedAt
  };

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey);
  const assertion = `${unsignedToken}.${base64Url(signature)}`;

  const response = await requestJson(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  return required(response.access_token, "service account access token");
}

async function accessTokenFromRefreshToken() {
  const clientId = required(env("CWS_CLIENT_ID", "CLIENT_ID"), "CWS_CLIENT_ID");
  const refreshToken = required(env("CWS_REFRESH_TOKEN", "REFRESH_TOKEN"), "CWS_REFRESH_TOKEN");
  const clientSecret = env("CWS_CLIENT_SECRET", "CLIENT_SECRET");

  const body = {
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  };
  if (clientSecret) {
    body.client_secret = clientSecret;
  }

  const response = await requestJson(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return required(response.access_token, "OAuth access token");
}

function readServiceAccountJson() {
  const inline = env("CWS_SERVICE_ACCOUNT_JSON");
  if (inline) {
    return inline;
  }

  const base64 = env("CWS_SERVICE_ACCOUNT_JSON_B64");
  if (base64) {
    return Buffer.from(base64, "base64").toString("utf8");
  }

  const file = env("CWS_SERVICE_ACCOUNT_FILE", "GOOGLE_APPLICATION_CREDENTIALS");
  if (file) {
    return readFileSync(resolve(root, file), "utf8");
  }

  return undefined;
}

async function getAccessToken() {
  const directToken = env("CWS_ACCESS_TOKEN");
  if (directToken) {
    return directToken;
  }

  const serviceAccountJson = readServiceAccountJson();
  if (serviceAccountJson) {
    return accessTokenFromServiceAccount(serviceAccountJson);
  }

  if (env("CWS_CLIENT_ID", "CLIENT_ID") || env("CWS_REFRESH_TOKEN", "REFRESH_TOKEN")) {
    return accessTokenFromRefreshToken();
  }

  throw new Error(
    [
      "No Chrome Web Store API authentication was found.",
      "Set one of:",
      "- CWS_SERVICE_ACCOUNT_JSON or CWS_SERVICE_ACCOUNT_FILE",
      "- CWS_ACCESS_TOKEN",
      "- CWS_CLIENT_ID + CWS_CLIENT_SECRET + CWS_REFRESH_TOKEN"
    ].join("\n")
  );
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 1200) };
    }
  }

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${url} failed with ${response.status}: ${JSON.stringify(body, null, 2)}`);
  }

  return body;
}

async function authorizedJson(path, options = {}) {
  const token = await getAccessToken();
  return requestJson(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {})
    }
  });
}

function zipPath() {
  const candidate = resolve(root, flag("zip") ?? env("CWS_ZIP") ?? defaultZip);
  if (!existsSync(candidate)) {
    throw new Error(`${candidate} does not exist. Run npm run package:store first.`);
  }
  return candidate;
}

async function upload() {
  const file = zipPath();
  const token = await getAccessToken();
  const body = readFileSync(file);
  const response = await requestJson(`${API_ROOT}/upload/v2/${itemName()}:upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip",
      "X-Goog-Upload-Protocol": "raw",
      "X-Goog-Upload-File-Name": "extension.zip"
    },
    body
  });

  console.log(JSON.stringify(response, null, 2));
}

async function submit() {
  const publishType = flag("publish-type") ?? env("CWS_PUBLISH_TYPE") ?? "DEFAULT_PUBLISH";
  if (publishType === "TRUSTED_TESTERS") {
    throw new Error(
      "Chrome Web Store API v2 does not use TRUSTED_TESTERS as publishType. Set Distribution visibility to Private/trusted testers in the Dashboard, then submit with DEFAULT_PUBLISH."
    );
  }
  if (!ALLOWED_PUBLISH_TYPES.has(publishType)) {
    throw new Error(`Unsupported publishType "${publishType}". Use DEFAULT_PUBLISH or STAGED_PUBLISH.`);
  }

  const deployPercentage = flag("deploy-percentage") ?? env("CWS_DEPLOY_PERCENTAGE");
  const body = {
    publishType,
    skipReview: boolFlag("skip-review", env("CWS_SKIP_REVIEW") === "true"),
    blockOnWarnings: boolFlag("block-on-warnings", env("CWS_BLOCK_ON_WARNINGS") === "true")
  };

  if (deployPercentage !== undefined) {
    body.deployInfos = [{ deployPercentage: parseDeployPercentage(deployPercentage) }];
  }

  const response = await authorizedJson(`/v2/${itemName()}:publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  console.log(JSON.stringify(response, null, 2));
}

async function status() {
  const response = await authorizedJson(`/v2/${itemName()}:fetchStatus`, {
    method: "GET"
  });
  console.log(JSON.stringify(response, null, 2));
}

async function setPercentage() {
  const deployPercentage = required(flag("deploy-percentage") ?? env("CWS_DEPLOY_PERCENTAGE"), "--deploy-percentage");
  const response = await authorizedJson(`/v2/${itemName()}:setPublishedDeployPercentage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deployPercentage: parseDeployPercentage(deployPercentage) })
  });

  console.log(JSON.stringify(response, null, 2));
}

function parseDeployPercentage(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid deploy percentage "${value}". Use an integer from 0 to 100.`);
  }
  return parsed;
}

function printHelp() {
  console.log(`
Chrome Web Store API helper

Commands:
  upload          Upload artifacts/chrome-web-store/focusgate-${packageJson.version}.zip
  submit          Submit the latest uploaded package for review
  release         Upload, then submit for review
  status          Fetch current item/upload/submission status
  set-percentage  Update deploy percentage for an already published release

Useful flags:
  --zip <path>
  --extension-id <id>      Defaults to ${DEFAULT_EXTENSION_ID}
  --publisher-id <id>
  --publish-type <type>    DEFAULT_PUBLISH or STAGED_PUBLISH
  --deploy-percentage <0-100>
  --skip-review
  --block-on-warnings

Required auth:
  Prefer CWS_SERVICE_ACCOUNT_JSON or CWS_SERVICE_ACCOUNT_FILE.
  OAuth fallback: CWS_CLIENT_ID + CWS_CLIENT_SECRET + CWS_REFRESH_TOKEN.
`);
}

try {
  if (command === "upload") {
    await upload();
  } else if (command === "submit" || command === "publish") {
    await submit();
  } else if (command === "release") {
    await upload();
    await submit();
  } else if (command === "status") {
    await status();
  } else if (command === "set-percentage") {
    await setPercentage();
  } else {
    printHelp();
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
