const path = require("path");
const fsSync = require("fs");
const fs = require("fs/promises");
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { authenticator } = require("otplib");

require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

const DEFAULT_CONTACT_EMAIL_TO = "nagamonishmunagala@gmail.com";
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const ADMIN_DIR = path.join(PUBLIC_DIR, "admin");
const DATA_DIR = path.join(__dirname, "data");
const SITE_CONTENT_PATH = path.join(DATA_DIR, "site-content.json");
const ADMIN_AUTH_PATH = path.join(DATA_DIR, "admin-auth.json");
const SESSION_COOKIE_NAME = "cep_admin_session";
const SESSION_TTL_MS = Math.max(
  60 * 60 * 1000,
  (Number(process.env.ADMIN_SESSION_TTL_HOURS) || 12) * 60 * 60 * 1000
);
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;
const MIN_ADMIN_PASSWORD_LENGTH = 12;
const ADMIN_TOTP_ISSUER = "Charlotte Event Planners";
const REQUIRED_CONTENT_KEYS = [
  "seo",
  "brand",
  "hero",
  "proof",
  "services",
  "portfolio",
  "about",
  "benefits",
  "testimonials",
  "process",
  "ctaBanner",
  "contact",
  "social",
];

const adminSessions = new Map();
const loginAttempts = new Map();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(PUBLIC_DIR, { index: false, dotfiles: "ignore", redirect: false }));
app.use(
  "/admin",
  express.static(ADMIN_DIR, {
    index: false,
    redirect: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store");
    },
  })
);

const getEnvBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === "true";
};

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatMultiline = (value = "") => escapeHtml(value).replace(/\n/g, "<br />");

const escapeXml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const submittedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/New_York",
});

const getFieldValue = (body, key) => {
  const value = body?.[key];
  return typeof value === "string" ? value.trim() : "";
};

const normalizeSiteUrl = (value = "") => {
  const trimmed = String(value).trim();

  if (!trimmed) {
    return "https://www.charlotteeventplanners.com";
  }

  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const readSiteContent = async () => {
  const rawContent = await fs.readFile(SITE_CONTENT_PATH, "utf8");
  return JSON.parse(rawContent);
};

const writeSiteContent = async (nextContent) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    SITE_CONTENT_PATH,
    `${JSON.stringify(nextContent, null, 2)}\n`,
    "utf8"
  );
};

const validateSiteContent = (content) =>
  isPlainObject(content) &&
  REQUIRED_CONTENT_KEYS.every((key) => Object.hasOwn(content, key));

const getContentWithTimestamp = async () => {
  const [content, stats] = await Promise.all([
    readSiteContent(),
    fs.stat(SITE_CONTENT_PATH),
  ]);

  return {
    content,
    savedAt: stats.mtime.toISOString(),
  };
};

const createEmailMarkup = ({ name, email, eventType, message, submittedAt, replyTo }) => {
  const messageHtml = formatMultiline(message);

  return `
    <div style="margin:0;padding:24px;background:#f6f1ea;font-family:Georgia,'Times New Roman',serif;color:#2d221c;">
      <div style="max-width:680px;margin:0 auto;background:#fffdf9;border:1px solid #e5d5c4;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(66,45,28,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#3d2b1f 0%,#8a6748 100%);color:#fffaf3;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.82;">New Consultation Request</p>
          <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;">Charlotte Event Planners</h1>
          <p style="margin:12px 0 0;font-size:16px;line-height:1.6;opacity:0.9;">A new inquiry came in through the website contact form.</p>
        </div>

        <div style="padding:28px 32px 12px;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 14px;width:170px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6748;">Client Name</td>
              <td style="padding:0 0 14px;font-size:16px;line-height:1.5;color:#2d221c;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:0 0 14px;width:170px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6748;">Email</td>
              <td style="padding:0 0 14px;font-size:16px;line-height:1.5;color:#2d221c;"><a href="mailto:${escapeHtml(
                replyTo
              )}" style="color:#7b4f2d;text-decoration:none;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding:0 0 14px;width:170px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6748;">Event Type</td>
              <td style="padding:0 0 14px;font-size:16px;line-height:1.5;color:#2d221c;">${escapeHtml(eventType)}</td>
            </tr>
            <tr>
              <td style="padding:0 0 14px;width:170px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6748;">Submitted</td>
              <td style="padding:0 0 14px;font-size:16px;line-height:1.5;color:#2d221c;">${escapeHtml(submittedAt)}</td>
            </tr>
          </table>
        </div>

        <div style="padding:0 32px 32px;">
          <div style="border:1px solid #eadccf;border-radius:18px;background:#fdf8f2;padding:22px 24px;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6748;">Inquiry Details</p>
            <p style="margin:0;font-size:16px;line-height:1.8;color:#2d221c;">${messageHtml}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const createPlainTextEmail = ({ name, email, eventType, message, submittedAt }) => `
New consultation request from the Charlotte Event Planners website

Client Name: ${name}
Email: ${email}
Event Type: ${eventType}
Submitted: ${submittedAt}

Inquiry Details:
${message}
`.trim();

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: getEnvBoolean(SMTP_SECURE, Number(SMTP_PORT) === 465),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const readAdminAuthFile = () => {
  if (!fsSync.existsSync(ADMIN_AUTH_PATH)) {
    return null;
  }

  try {
    const rawContent = fsSync.readFileSync(ADMIN_AUTH_PATH, "utf8");
    const parsedContent = JSON.parse(rawContent);

    if (!isPlainObject(parsedContent)) {
      return null;
    }

    const username = String(parsedContent.username || "").trim();
    const passwordHash = String(parsedContent.passwordHash || "").trim();
    const totpSecret = String(parsedContent.totpSecret || "").trim();

    if (!username || !passwordHash) {
      return null;
    }

    return {
      username,
      passwordHash,
      totpSecret,
    };
  } catch (error) {
    console.error("Failed to read admin auth config:", error);
    return null;
  }
};

const writeAdminAuthFile = async ({ username, passwordHash, totpSecret }) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    ADMIN_AUTH_PATH,
    `${JSON.stringify(
      {
        username,
        passwordHash,
        totpSecret,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )}\n`,
    "utf8"
  );
};

const getAdminAuthConfig = () => {
  const envUsername = String(process.env.ADMIN_USERNAME || "owner").trim();
  const envPasswordHash = String(process.env.ADMIN_PASSWORD_HASH || "").trim();
  const envTotpSecret = String(process.env.ADMIN_TOTP_SECRET || "").trim();

  if (envPasswordHash) {
    return {
      username: envUsername,
      passwordHash: envPasswordHash,
      totpSecret: envTotpSecret,
      configured: true,
      mfaEnabled: Boolean(envTotpSecret),
      source: "env",
    };
  }

  const fileConfig = readAdminAuthFile();

  if (fileConfig) {
    return {
      ...fileConfig,
      configured: true,
      mfaEnabled: Boolean(fileConfig.totpSecret),
      source: "file",
    };
  }

  return {
    username: envUsername,
    passwordHash: "",
    totpSecret: "",
    configured: false,
    mfaEnabled: false,
    source: "none",
  };
};

const isLocalRequest = (req) => {
  const valuesToCheck = [
    req.hostname,
    String(req.get("host") || "").split(":")[0],
    req.ip,
    req.socket?.remoteAddress,
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
  ];

  return valuesToCheck.some((value) => {
    const normalizedValue = String(value || "").trim().toLowerCase();

    return (
      normalizedValue === "localhost" ||
      normalizedValue === "127.0.0.1" ||
      normalizedValue === "::1" ||
      normalizedValue === "::ffff:127.0.0.1" ||
      normalizedValue === "[::1]"
    );
  });
};

const isValidAdminUsername = (value) => /^[A-Za-z0-9._-]{3,64}$/.test(value);

const parseCookies = (cookieHeader = "") =>
  String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, cookiePart) => {
      const separatorIndex = cookiePart.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = cookiePart.slice(0, separatorIndex).trim();
      const value = cookiePart.slice(separatorIndex + 1).trim();

      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

const getCookieValue = (req, cookieName) =>
  parseCookies(req.headers.cookie)[cookieName] || "";

const shouldUseSecureCookies = (req) =>
  process.env.NODE_ENV === "production" ||
  req.secure ||
  req.headers["x-forwarded-proto"] === "https";

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAgeMs !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeMs / 1000))}`);
  }

  parts.push(`Path=${options.path || "/"}`);
  parts.push(`SameSite=${options.sameSite || "Strict"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const setSessionCookie = (req, res, sessionToken) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, sessionToken, {
      maxAgeMs: SESSION_TTL_MS,
      secure: shouldUseSecureCookies(req),
    })
  );
};

const clearSessionCookie = (req, res) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, "", {
      maxAgeMs: 0,
      secure: shouldUseSecureCookies(req),
    })
  );
};

const cleanupExpiredSessions = () => {
  const now = Date.now();

  for (const [sessionToken, session] of adminSessions.entries()) {
    if (session.expiresAt <= now) {
      adminSessions.delete(sessionToken);
    }
  }
};

const createAdminSession = (username) => {
  cleanupExpiredSessions();

  const sessionToken = crypto.randomBytes(48).toString("base64url");
  adminSessions.set(sessionToken, {
    username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  return sessionToken;
};

const getAuthenticatedSession = (req) => {
  cleanupExpiredSessions();

  const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return null;
  }

  const session = adminSessions.get(sessionToken);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    adminSessions.delete(sessionToken);
    return null;
  }

  return {
    token: sessionToken,
    ...session,
  };
};

const destroyAdminSession = (req, res) => {
  const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);

  if (sessionToken) {
    adminSessions.delete(sessionToken);
  }

  clearSessionCookie(req, res);
};

const getRequesterKey = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
};

const getLoginAttemptRecord = (requesterKey) => {
  const currentRecord = loginAttempts.get(requesterKey);

  if (!currentRecord) {
    return null;
  }

  if (currentRecord.resetAt <= Date.now()) {
    loginAttempts.delete(requesterKey);
    return null;
  }

  return currentRecord;
};

const recordFailedLogin = (requesterKey) => {
  const currentRecord = getLoginAttemptRecord(requesterKey);

  if (!currentRecord) {
    loginAttempts.set(requesterKey, {
      count: 1,
      resetAt: Date.now() + LOGIN_WINDOW_MS,
    });
    return;
  }

  currentRecord.count += 1;
  loginAttempts.set(requesterKey, currentRecord);
};

const clearFailedLogins = (requesterKey) => {
  loginAttempts.delete(requesterKey);
};

const cleanupExpiredLoginAttempts = () => {
  const now = Date.now();

  for (const [requesterKey, record] of loginAttempts.entries()) {
    if (record.resetAt <= now) {
      loginAttempts.delete(requesterKey);
    }
  }
};

const getLoginRateLimitState = (req) => {
  const requesterKey = getRequesterKey(req);
  const currentRecord = getLoginAttemptRecord(requesterKey);

  if (!currentRecord) {
    return {
      requesterKey,
      limited: false,
      retryAfterSeconds: 0,
    };
  }

  const limited = currentRecord.count >= MAX_LOGIN_ATTEMPTS;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((currentRecord.resetAt - Date.now()) / 1000)
  );

  return {
    requesterKey,
    limited,
    retryAfterSeconds,
  };
};

const getRequestOrigin = (req) =>
  `${req.protocol}://${req.get("host")}`;

const getAuthStatusPayload = (req, overrides = {}) => {
  const adminConfig = getAdminAuthConfig();
  const authenticatedSession = getAuthenticatedSession(req);

  return {
    ok: true,
    configured: adminConfig.configured,
    authenticated: Boolean(authenticatedSession),
    username: overrides.username ?? authenticatedSession?.username ?? null,
    mfaEnabled: adminConfig.mfaEnabled,
    setupAllowed: !adminConfig.configured && isLocalRequest(req),
    ...overrides,
  };
};

const ensureSameOrigin = (req, res, next) => {
  const originHeader = req.get("origin");

  if (!originHeader || originHeader === getRequestOrigin(req)) {
    return next();
  }

  return res.status(403).json({
    ok: false,
    error: "This request origin is not allowed.",
  });
};

const ensureAdminSession = (req, res, next) => {
  const adminConfig = getAdminAuthConfig();
  const setupAllowed = !adminConfig.configured && isLocalRequest(req);

  if (!adminConfig.configured) {
    return res.status(503).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed,
      error:
        setupAllowed
          ? "Admin authentication is not configured yet. Create the owner login from this page first."
          : "Admin authentication is not configured yet. Open the admin from localhost to create the owner login, or configure credentials on the server first.",
    });
  }

  const authenticatedSession = getAuthenticatedSession(req);

  if (!authenticatedSession) {
    return res.status(401).json({
      ok: false,
      configured: true,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed: false,
      error: "Sign in to continue.",
    });
  }

  req.adminSession = authenticatedSession;
  return next();
};

const verifyTotpToken = (totpSecret, token) => {
  const normalizedToken = String(token ?? "").replace(/\s+/g, "").replaceAll("-", "");

  if (!normalizedToken) {
    return false;
  }

  return authenticator.check(normalizedToken, totpSecret);
};

setInterval(() => {
  cleanupExpiredSessions();
  cleanupExpiredLoginAttempts();
}, 5 * 60 * 1000).unref();

app.get("/api/content", async (_req, res) => {
  try {
    const { content, savedAt } = await getContentWithTimestamp();
    return res.status(200).json({
      ok: true,
      content,
      savedAt,
    });
  } catch (error) {
    console.error("Failed to read site content:", error);
    return res.status(500).json({
      ok: false,
      error: "The site content could not be loaded.",
    });
  }
});

app.get("/api/admin/auth/session", (req, res) => {
  return res.status(200).json(getAuthStatusPayload(req));
});

app.post("/api/admin/auth/setup", ensureSameOrigin, async (req, res) => {
  const adminConfig = getAdminAuthConfig();

  if (adminConfig.configured) {
    return res.status(409).json({
      ok: false,
      configured: true,
      authenticated: Boolean(getAuthenticatedSession(req)),
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed: false,
      error: "Admin authentication is already configured. Sign in instead.",
    });
  }

  if (!isLocalRequest(req)) {
    return res.status(403).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: false,
      setupAllowed: false,
      error:
        "Initial owner setup is only allowed from localhost. Open this site locally to create the first admin account.",
    });
  }

  const username = getFieldValue(req.body, "username");
  const password = getFieldValue(req.body, "password");
  const confirmPassword = getFieldValue(req.body, "confirmPassword");
  const enableMfa = req.body?.enableMfa !== false;

  if (!isValidAdminUsername(username)) {
    return res.status(400).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: false,
      setupAllowed: true,
      error:
        "Choose an owner username with 3 to 64 letters, numbers, dots, hyphens, or underscores.",
    });
  }

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: false,
      setupAllowed: true,
      error: `Choose a password with at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: false,
      setupAllowed: true,
      error: "The password confirmation did not match.",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const totpSecret = enableMfa ? authenticator.generateSecret() : "";
    const otpauthUrl = totpSecret
      ? authenticator.keyuri(username, ADMIN_TOTP_ISSUER, totpSecret)
      : "";

    await writeAdminAuthFile({
      username,
      passwordHash,
      totpSecret,
    });

    destroyAdminSession(req, res);
    const sessionToken = createAdminSession(username);
    setSessionCookie(req, res, sessionToken);

    return res.status(201).json({
      ok: true,
      configured: true,
      authenticated: true,
      username,
      mfaEnabled: Boolean(totpSecret),
      setupAllowed: false,
      totpSecret: totpSecret || null,
      otpauthUrl: otpauthUrl || null,
    });
  } catch (error) {
    console.error("Failed to create initial admin credentials:", error);
    return res.status(500).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: false,
      setupAllowed: true,
      error: "The initial owner account could not be created.",
    });
  }
});

app.post("/api/admin/auth/login", ensureSameOrigin, async (req, res) => {
  const adminConfig = getAdminAuthConfig();
  const setupAllowed = !adminConfig.configured && isLocalRequest(req);

  if (!adminConfig.configured) {
    return res.status(503).json({
      ok: false,
      configured: false,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed,
      error:
        setupAllowed
          ? "Create the owner login first, then sign in."
          : "Admin authentication is not configured yet. Open the admin from localhost to create the owner login, or configure credentials on the server first.",
    });
  }

  const { requesterKey, limited, retryAfterSeconds } = getLoginRateLimitState(req);

  if (limited) {
    return res.status(429).json({
      ok: false,
      configured: true,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed: false,
      error: `Too many login attempts. Try again in about ${retryAfterSeconds} seconds.`,
    });
  }

  const username = getFieldValue(req.body, "username");
  const password = getFieldValue(req.body, "password");
  const totpCode = getFieldValue(req.body, "totpCode");

  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      configured: true,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed: false,
      error: "Username and password are required.",
    });
  }

  const usernameMatches = username === adminConfig.username;
  const passwordMatches = usernameMatches
    ? await bcrypt.compare(password, adminConfig.passwordHash).catch(() => false)
    : false;

  if (!usernameMatches || !passwordMatches) {
    recordFailedLogin(requesterKey);
    return res.status(401).json({
      ok: false,
      configured: true,
      authenticated: false,
      mfaEnabled: adminConfig.mfaEnabled,
      setupAllowed: false,
      error: "The username or password was incorrect.",
    });
  }

  if (adminConfig.mfaEnabled && !verifyTotpToken(adminConfig.totpSecret, totpCode)) {
    recordFailedLogin(requesterKey);
    return res.status(401).json({
      ok: false,
      configured: true,
      authenticated: false,
      mfaEnabled: true,
      setupAllowed: false,
      error: "The one-time verification code was incorrect.",
    });
  }

  clearFailedLogins(requesterKey);
  destroyAdminSession(req, res);

  const sessionToken = createAdminSession(adminConfig.username);
  setSessionCookie(req, res, sessionToken);

  return res.status(200).json({
    ok: true,
    configured: true,
    authenticated: true,
    username: adminConfig.username,
    mfaEnabled: adminConfig.mfaEnabled,
    setupAllowed: false,
  });
});

app.post("/api/admin/auth/logout", ensureSameOrigin, (req, res) => {
  destroyAdminSession(req, res);

  return res.status(200).json(
    getAuthStatusPayload(req, {
      authenticated: false,
      username: null,
    })
  );
});

app.get("/api/admin/content", ensureAdminSession, async (req, res) => {
  try {
    const { content, savedAt } = await getContentWithTimestamp();
    return res.status(200).json({
      ok: true,
      configured: true,
      authenticated: true,
      username: req.adminSession.username,
      mfaEnabled: getAdminAuthConfig().mfaEnabled,
      content,
      savedAt,
    });
  } catch (error) {
    console.error("Failed to load CMS content:", error);
    return res.status(500).json({
      ok: false,
      error: "The CMS could not load the current site content.",
    });
  }
});

app.put("/api/admin/content", ensureSameOrigin, ensureAdminSession, async (req, res) => {
  const nextContent = isPlainObject(req.body?.content) ? req.body.content : req.body;

  if (!validateSiteContent(nextContent)) {
    return res.status(400).json({
      ok: false,
      error:
        "The updated content is missing required sections. Reload the CMS and try again.",
    });
  }

  try {
    await writeSiteContent(nextContent);
    const { savedAt } = await getContentWithTimestamp();

    return res.status(200).json({
      ok: true,
      content: nextContent,
      savedAt,
    });
  } catch (error) {
    console.error("Failed to save CMS content:", error);
    return res.status(500).json({
      ok: false,
      error: "The updated content could not be saved.",
    });
  }
});

app.post("/api/contact", async (req, res) => {
  const name = getFieldValue(req.body, "name");
  const email = getFieldValue(req.body, "email");
  const eventType = getFieldValue(req.body, "event-type");
  const message = getFieldValue(req.body, "message");
  const honeypot = getFieldValue(req.body, "bot-field");

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !eventType || !message) {
    return res.status(400).json({
      ok: false,
      error: "Please complete all required fields before submitting.",
    });
  }

  const transporter = createTransporter();

  if (!transporter) {
    return res.status(500).json({
      ok: false,
      error:
        "Email delivery is not configured yet. Add the SMTP settings in the .env file and restart the server.",
    });
  }

  const submittedAt = submittedAtFormatter.format(new Date());
  const destinationEmail = process.env.CONTACT_EMAIL_TO || DEFAULT_CONTACT_EMAIL_TO;
  const senderAddress = process.env.SMTP_USER;
  const senderName =
    process.env.CONTACT_EMAIL_FROM_NAME || "Charlotte Event Planners";

  try {
    await transporter.sendMail({
      to: destinationEmail,
      from: `"${senderName}" <${senderAddress}>`,
      replyTo: email,
      subject: `New inquiry from ${name} (${eventType})`,
      text: createPlainTextEmail({
        name,
        email,
        eventType,
        message,
        submittedAt,
      }),
      html: createEmailMarkup({
        name,
        email,
        eventType,
        message,
        submittedAt,
        replyTo: email,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact form email failed:", error);
    return res.status(500).json({
      ok: false,
      error: "We couldn't send your inquiry right now. Please try again shortly.",
    });
  }
});

app.get("/robots.txt", async (_req, res) => {
  try {
    const content = await readSiteContent();
    const siteUrl = normalizeSiteUrl(content?.seo?.siteUrl);

    return res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    );
  } catch (error) {
    console.error("Failed to generate robots.txt:", error);
    return res
      .type("text/plain")
      .send("User-agent: *\nAllow: /\nDisallow: /admin\n");
  }
});

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const content = await readSiteContent();
    const siteUrl = normalizeSiteUrl(content?.seo?.siteUrl);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(siteUrl)}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Failed to generate sitemap.xml:", error);
    return res.status(500).type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(
        "Unable to generate sitemap."
      )}</error>`
    );
  }
});

app.get(/^\/admin\/?$/, (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.sendFile(path.join(ADMIN_DIR, "index.html"));
});

app.get(/^(?!\/(?:api|admin)(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Charlotte Event Planners is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
