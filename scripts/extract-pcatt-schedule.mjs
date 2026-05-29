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
    .replace(/&nbsp;| /g, " ")
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

// Strip a trailing "— Affiliation" / "– Affiliation" so a presenter line
// like "Ian Kitajima — PICHTR" becomes just the person's name.
function nameOnly(value) {
  return decode(value).split(/\s+[—–-]\s+/)[0].trim();
}

// ──────────────────────────────────────────────────────────
//  TOKEN SCAN
//  The official page is Elementor markup. Two kinds of content appear under
//  each time marker: `.topic-tooltip` session cards (keynotes + breakouts) and
//  plain text-editor blocks (registration, opening remarks, lunch, lunch
//  panels, pau hana, all-day gallery). We scan both and walk them in document
//  order, which is already chronological.
// ──────────────────────────────────────────────────────────

const tokens = [];
const cardSpans = [];

const tokenPattern =
  /<h2 class="elementor-heading-title[^"]*"><br>(Thursday|Friday),\s+([^<]+)<br><\/h2>|<p style="text-align:\s*right;"><strong>(\d{2}:\d{2}\s+[AP]M)<\/strong><\/p>|<div class="elementor-element[^"]*topic-tooltip[^"]*"[\s\S]*?(?=<div class="elementor-element[^"]*topic-tooltip|<p style="text-align:\s*right;"><strong>\d{2}:\d{2}\s+[AP]M<\/strong><\/p>|<h2 class="elementor-heading-title|<div id="chatbot-toggle"|<\/body>)/g;

let match;
while ((match = tokenPattern.exec(html))) {
  if (match[1]) {
    tokens.push({ pos: match.index, type: "date", dayName: match[1], date: decode(match[2]) });
  } else if (match[3]) {
    tokens.push({ pos: match.index, type: "time", time: match[3] });
  } else {
    tokens.push({ pos: match.index, type: "card", html: match[0] });
    cardSpans.push([match.index, match.index + match[0].length]);
  }
}

// Limit non-tooltip block capture to the schedule region so page chrome
// (menus, footers, course catalog) is never mistaken for agenda content.
const regionStart = html.search(/<h2 class="elementor-heading-title[^"]*"><br>Thursday/);
let regionEnd = html.indexOf("ADVANCED TECHNOLOGY COURSES");
if (regionEnd === -1) regionEnd = html.indexOf('<div id="chatbot-toggle"');
if (regionEnd === -1) regionEnd = html.length;

const insideCard = (pos) => cardSpans.some(([s, e]) => pos >= s && pos < e);

// Capture stops at the next Elementor element/widget boundary so nested
// content divs (Topic/Moderator/Panelists) are kept while the markup of the
// following widget is excluded.
const blockPattern =
  /widget_type="text-editor\.default">\s*<div class="elementor-widget-container">([\s\S]*?)(?=<div class="elementor-element|<h2 class="elementor-heading-title|ADVANCED TECHNOLOGY COURSES)/g;

let block;
while ((block = blockPattern.exec(html))) {
  const pos = block.index;
  if (pos < regionStart || pos >= regionEnd) continue;
  if (insideCard(pos)) continue;
  const text = textFromHtml(block[1]);
  if (!text) continue;
  if (/^\d{1,2}:\d{2}\s*[AP]M$/.test(text)) continue; // bare time marker
  tokens.push({ pos, type: "block", text });
}

tokens.sort((a, b) => a.pos - b.pos);

// ──────────────────────────────────────────────────────────
//  BLOCK PARSING (non-tooltip agenda items)
// ──────────────────────────────────────────────────────────

// Collect the value(s) for a "Label:" field. Handles both inline
// ("Topic: X") and stacked ("Topic:\nX\nY") layouts.
function fieldLines(lines, label) {
  const idx = lines.findIndex((l) => new RegExp(`^${label}:`, "i").test(l));
  if (idx === -1) return [];
  const out = [];
  const inline = lines[idx].replace(new RegExp(`^${label}:\\s*`, "i"), "").trim();
  if (inline) out.push(inline);
  const stop = /^(Room|Topic|Moderator|Panelists):/i;
  for (let i = idx + 1; i < lines.length; i++) {
    if (stop.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}

function parseBlock(text, dayName, date, time) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const base = { dayName, date, time, track: "", strand: "", room: "", speaker: "", description: "", sourceUrl };
  const make = (extra) => ({
    id: `${slugify(dayName)}-${slugify(extra.time || time)}-${slugify(extra.title)}`,
    ...base,
    ...extra,
  });

  if (/Registration/i.test(text)) {
    return make({ type: "networking", title: "Registration / Breakfast / Networking" });
  }
  if (/Time Capsule/i.test(text)) {
    return make({
      type: "background",
      time: "All Day",
      title: "PCATT 25 years Time Capsule Gallery",
      room: firstMatch(text, /Room:\s*([^\n]+)/),
    });
  }
  if (/Opening Remarks/i.test(text)) {
    const description = lines
      .slice(1)
      .filter((l) => !/^Room:/i.test(l))
      .join("\n");
    return make({
      type: "welcome",
      title: "Opening Remarks",
      room: firstMatch(text, /Room:\s*([^\n]+)/),
      description,
    });
  }
  if (/Lunch Panel/i.test(text)) {
    const topic = fieldLines(lines, "Topic").join(" ");
    const moderator = fieldLines(lines, "Moderator").join(" ");
    const panelists = fieldLines(lines, "Panelists");
    const names = [];
    if (moderator && !/^TBA$/i.test(moderator)) names.push(nameOnly(moderator));
    for (const p of panelists) names.push(nameOnly(p));
    const descParts = [];
    if (moderator) descParts.push(`Moderator: ${moderator}`);
    if (panelists.length) descParts.push(`Panelists: ${panelists.join(", ")}`);
    return make({
      type: "panel",
      title: topic ? `Lunch Panel — ${topic}` : "Lunch Panel",
      room: firstMatch(text, /Room:\s*([^\n]+)/),
      speaker: names.join(", "),
      description: descParts.join("\n"),
    });
  }
  if (/Lunch/i.test(text)) {
    return make({ type: "meal", title: "Lunch", room: lines.slice(1).find(Boolean) || "" });
  }
  if (/Pau Hana/i.test(text)) {
    return make({ type: "networking", title: lines[0] });
  }
  return null; // unknown block — skip rather than invent
}

// ──────────────────────────────────────────────────────────
//  WALK
// ──────────────────────────────────────────────────────────

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

  if (token.type === "block") {
    const entry = parseBlock(token.text, currentDayName, currentDate, currentTime);
    if (entry) sessions.push(entry);
    continue;
  }

  // token.type === "card"
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
    type: /keynote/i.test(track) ? "keynote" : "breakout",
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
const blockCount = sessions.filter((s) => !["keynote", "breakout"].includes(s.type)).length;
console.log(`Wrote ${sessions.length} sessions (${blockCount} agenda blocks) to ${outputPath}`);
