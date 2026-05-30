import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("scraped/summit26-schedule.json", "utf8"));
const appPaths = ["index.html"];

function isoDate(session) {
  return session.dayName === "Thursday" ? "2026-06-04" : "2026-06-05";
}

function jsConst(name, value) {
  return `const ${name} = ${JSON.stringify(value, null, 2)};`;
}

const schedule = data.sessions.map((session) => ({
  id: session.id,
  date: isoDate(session),
  day: `${session.dayName}, ${session.date}`,
  time: session.time,
  timeEnd: "TBD",
  title: session.title,
  type: session.type || "breakout",
  speaker: session.speaker,
  location: session.room,
  description: session.description || "Description TBD.",
  strand: session.strand,
  track: session.track,
  sourceUrl: session.sourceUrl,
  studentSummary: "",
  subItems: [],
}));

function speakerRole(type) {
  if (/keynote/i.test(type)) return "Keynote Speaker";
  if (/panel/i.test(type)) return "Panelist";
  return "Presenter";
}

// Presenter affiliations as published on https://pcatt.org/summit26-schedule/.
// Keyed by the exact name produced by the speaker-name split below. Speakers
// the official page lists without an org fall back to the generic placeholder.
const AFFILIATIONS = {
  "Chris Barton": "Founder & Creator of Shazam",
  "Mericia Palma Elmore": "UH System & HPU",
  "Monir Hodges": "PCATT",
  "Paul Sakamoto": "UHCC",
  "Dr. Kimberly Scott": "NSF",
  "Sarah Dunton": "NSF",
  "Dr. Nasser Alaraje": "NSF",
  "Nicole Cacal": "TRUE Initiative",
  "Wayne Lewis": "PCATT",
  "Darsh Davé": "Kapiʻolani Community College",
  "Hunter Kirihara": "Kapiʻolani Community College",
  "Dr. Gloria Niles": "University of Hawaiʻi System",
  "Lionel Derrick Roxas": "eWorld Enterprise",
  "Nani Daniels": "Apple Education Hawaiʻi & Alaska",
  "Scott Brems": "Apple",
  "Dave Free": "Cisco Networking Academy",
  "Victoria Rivett": "AI in Education",
  "Apple Presenter": "Apple Education",
  "Debasis Bhattacharya": "UH Maui College",
  "Mahdi Belcaid": "UH Mānoa",
  "Noah Pomeroy": "Mindfulness Catalyst",
  "Sadie Flick": "UH System",
  "Sujit Ghosh": "HPE",
  "Nicole Bentley": "SAFAL",
  "Katie Adams": "SAFAL",
  "Seiichi Nagai": "Civic Nexus",
  // Lunch-panel participants.
  "Ian Kitajima": "PICHTR",
  "Kim Siegenthaler": "UH System",
  "Brett Tanaka": "HIDOE",
  "Branden Baker": "Intech Hawaii",
  "Ben Mendes": "Hawaii State Federal Credit Union",
};

const speakerMap = new Map();
for (const session of schedule) {
  // Meals, registration, and all-day blocks carry no presenter.
  if (["meal", "break", "background", "networking", "welcome"].includes(session.type)) continue;
  for (const rawName of session.speaker.split(/\s+(?:and|&)\s+|,\s*/)) {
    const name = rawName.trim();
    if (!name || /^TBD$/i.test(name)) continue;
    const existing = speakerMap.get(name) || {
      name,
      role: speakerRole(session.type),
      company: AFFILIATIONS[name] || "PCATT Summit 2026",
      sessions: [],
    };
    existing.sessions.push(session.id);
    speakerMap.set(name, existing);
  }
}
const speakers = [...speakerMap.values()].sort((a, b) => a.name.localeCompare(b.name));

function replaceBlock(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start === -1 || end === -1) throw new Error(`Could not find block markers: ${startMarker}`);
  return `${html.slice(0, start)}${replacement}\n\n  ${html.slice(end)}`;
}

for (const appPath of appPaths) {
  let html = fs.readFileSync(appPath, "utf8");
  html = html
    .replace(/CONNECT26 — Conference Guide/g, "PCATT Summit 2026 — Conference Guide")
    .replace(/Kamehameha Schools Education Technology Conference/g, "PCATT Summit 2026")
    .replace(/Schedule, featured presenters, and personal notes for the Kamehameha Schools Education Technology Conference\./g, "Schedule, presenters, rooms, and personal notes for PCATT Summit 2026.")
    .replace(/CONNECT26/g, "PCATT Summit 2026")
    .replace(/connect26/g, "pcatt_summit_2026")
    .replace(/Kamehameha Schools Kūkulu Kaiāulu/g, "Pacific Center for Advanced Technology Training")
    .replace(/Neal S\. Blaisdell Center/g, "Ala Moana Hotel")
    .replace(/June 1-3/g, "June 4-5")
    .replace(/lpcode808\.github\.io\/KSEDTECH-26/g, "lpcode808.github.io/PCATT-Summit-26")
    .replace(/https%3A%2F%2Flpcode808\.github\.io%2FKSEDTECH-26%2F/g, "https%3A%2F%2Flpcode808.github.io%2FPCATT-Summit-26%2F")
    .replace(/https%3A%2F%2Fblogs\.ksbe\.edu%2Fedtechconference%2F/g, "https%3A%2F%2Fpcatt.org%2Fsummit26-schedule%2F")
    .replace(/blogs\.ksbe\.edu\/edtechconference/g, "pcatt.org/summit26-schedule")
    .replace(/https:\/\/blogs\.ksbe\.edu\/edtechconference\//g, "https://pcatt.org/summit26-schedule/")
    .replace(/Visit the official KS Ed Tech Conference site/g, "Visit the official PCATT Summit 2026 site")
    .replace(/>KS ↗<\/a>/g, ">PCATT ↗</a>");

  html = replaceBlock(
    html,
    "  // ──────────────────────────────────────────────────────────\n  //  SCHEDULE DATA",
    "  const SESSION_RESEARCH = {};",
    `  // ──────────────────────────────────────────────────────────\n  //  SCHEDULE DATA — PCATT Summit 2026, extracted from ${data.sourceUrl}\n  // ──────────────────────────────────────────────────────────\n  ${jsConst("SCHEDULE", schedule)}`
  );

  html = replaceBlock(
    html,
    "  // ──────────────────────────────────────────────────────────\n  //  SPEAKERS DATA",
    "  let speakersShowStarredFirst = false;",
    `  // ──────────────────────────────────────────────────────────\n  //  SPEAKERS DATA — PCATT Summit 2026 extracted presenters\n  // ──────────────────────────────────────────────────────────\n  const SPEAKERS = ${JSON.stringify(speakers, null, 2)}\n    .map(speaker => ({ ...speaker, id: slugify(speaker.name) }))\n    .sort((a, b) => a.name.localeCompare(b.name));`
  );

  fs.writeFileSync(appPath, html);
  console.log(`Updated ${appPath} with ${schedule.length} sessions and ${speakers.length} speakers.`);
}
