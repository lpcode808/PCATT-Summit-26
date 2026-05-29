import fs from "node:fs";

const sourcePath = "scraped/summit26-schedule.html";
const outputPath = "scraped/summit26-schedule.json";
const sourceUrl = "https://pcatt.org/summit26-schedule/";

const html = fs.readFileSync(sourcePath, "utf8");

function decode(value = "") {
  return value
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromHtml(fragment = "") {
  const withBreaks = fragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return withBreaks
    .split("\n")
    .map((line) => decode(line))
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function slugify(value) {
  return decode(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? decode(match[1]) : "";
}

function rawMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : "";
}

const tokens = [];
const tokenPattern =
  /<h2 class="elementor-heading-title[^"]*"><br>(Thursday|Friday),\s+([^<]+)<br><\/h2>|<p style="text-align:\s*right;"><strong>(\d{2}:\d{2}\s+[AP]M)<\/strong><\/p>|<div class="elementor-element[^"]*topic-tooltip[^"]*"[\s\S]*?(?=<div class="elementor-element[^"]*topic-tooltip|<p style="text-align:\s*right;"><strong>\d{2}:\d{2}\s+[AP]M<\/strong><\/p>|<h2 class="elementor-heading-title|<div id="chatbot-toggle"|<\/body>)/g;

let match;
while ((match = tokenPattern.exec(html))) {
  if (match[1]) {
    tokens.push({ type: "date", dayName: match[1], date: decode(match[2]) });
  } else if (match[3]) {
    tokens.push({ type: "time", time: match[3] });
  } else {
    tokens.push({ type: "card", html: match[0] });
  }
}

const sessions = [];
let currentDate = "";
let currentDayName = "";
let currentTime = "";

for (const token of tokens) {
  if (token.type === "date") {
    currentDayName = token.dayName;
    currentDate = token.date;
    continue;
  }
  if (token.type === "time") {
    currentTime = token.time;
    continue;
  }
  if (!currentDate || !currentTime) continue;

  const triggerHtml = rawMatch(token.html, /topic-trigger[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/);
  const detailHtml = rawMatch(token.html, /topic-box[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/);
  const triggerText = textFromHtml(triggerHtml);
  const detailText = textFromHtml(detailHtml);
  const combined = `${triggerText}\n${detailText}`;

  const track = firstMatch(triggerText, /(Track\s+[IVX]+)\s+[—-]\s+([^\n]+)/) || firstMatch(triggerText, /(Keynote Speaker)/) || "General";
  const trackTitle = firstMatch(triggerText, /Track\s+[IVX]+\s+[—-]\s+([^\n]+)/);
  const title =
    firstMatch(triggerText, /Session\s+[—-]\s+([^\n]+)/) ||
    firstMatch(triggerText, /Topic\s+[—-]\s+([^\n]+)/) ||
    firstMatch(triggerText, /Keynote Speaker\s+([^\n]+)/) ||
    firstMatch(triggerText, /Lunch Panel\s*([^\n]*)/) ||
    triggerText.split("\n").find(Boolean) ||
    "Untitled session";
  const room = firstMatch(combined, /Room:\s*([^\n]+)/) || "TBD";
  const presenter = firstMatch(detailText, /Presenter(?:s)?:\s*([^\n]+)/) || firstMatch(triggerText, /Keynote Speaker\s+([^-]+)/) || "TBD";
  const description = firstMatch(detailText, /Description:\s*([\s\S]*?)(?:Takeaway:|$)/) || detailText;

  sessions.push({
    id: `${slugify(currentDayName)}-${slugify(currentTime)}-${slugify(title)}`,
    dayName: currentDayName,
    date: currentDate,
    time: currentTime,
    track,
    strand: trackTitle || track,
    title,
    room,
    speaker: presenter,
    description,
    sourceUrl,
  });
}

const payload = {
  sourceUrl,
  fetchedAt: new Date().toISOString(),
  event: {
    name: "PCATT Summit 2026",
    dates: "Thursday June 4 and Friday June 5, 2026",
    location: "Ala Moana Hotel",
    audience: "HIDOE teachers and educational specialists, UH Faculty and IT Staff, Industry partners",
  },
  sessions,
};

if (sessions.length < 12) {
  throw new Error(`Expected at least 12 PCATT sessions, found ${sessions.length}`);
}

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${sessions.length} sessions to ${outputPath}`);
