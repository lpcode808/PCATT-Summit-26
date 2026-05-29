#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const data = JSON.parse(readFileSync(resolve(root, "scraped/summit26-schedule.json"), "utf8"));

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function extractConst(name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  assert(start !== -1, `${name} constant is missing.`);
  if (start === -1) return null;
  const afterMarker = start + marker.length;
  if (name === "SPEAKERS") {
    const mapStart = html.indexOf("\n    .map", afterMarker);
    assert(mapStart !== -1, "SPEAKERS array map call is missing.");
    if (mapStart === -1) return null;
    return vm.runInNewContext(`(${html.slice(afterMarker, mapStart)})`);
  }
  const end = html.indexOf(";\n", afterMarker);
  assert(end !== -1, `${name} constant is not terminated.`);
  if (end === -1) return null;
  return vm.runInNewContext(`(${html.slice(afterMarker, end)})`);
}

const schedule = extractConst("SCHEDULE") || [];
const speakers = extractConst("SPEAKERS") || [];

assert(html.includes("PCATT Summit 2026"), "PCATT event name is missing.");
assert(html.includes("Ala Moana Hotel"), "Venue copy is missing.");
assert(html.includes("pcatt_summit_2026_notes"), "PCATT notes storage key is missing.");
assert(html.includes("https://pcatt.org/summit26-schedule/"), "Official PCATT schedule link is missing.");
assert(html.includes('id="scheduleList"'), "Schedule list container is missing.");
assert(html.includes('id="speakersList"'), "Speaker list container is missing.");
assert(html.includes('id="strandFilter"'), "Strand filter container is missing.");
assert(html.includes('data-tab="schedule"'), "Schedule tab button is missing.");
assert(html.includes('data-tab="speakers"'), "Speakers tab button is missing.");
assert(html.includes('data-tab="notes"'), "Notes tab button is missing.");

assert(schedule.length === data.sessions.length, `Expected ${data.sessions.length} schedule entries, found ${schedule.length}.`);
assert(schedule.some((item) => item.title === "Bring Impossible Ideas to Life"), "Thursday keynote is missing.");
assert(schedule.some((item) => item.title === "Learning at the Speed of AI with Cisco"), "Friday keynote is missing.");
assert(schedule.some((item) => item.strand === "Trust in AI"), "Trust in AI strand is missing.");
assert(schedule.some((item) => item.strand === "AI and the Future of Work"), "Future of Work strand is missing.");
assert(schedule.some((item) => item.location === "Hibiscus"), "Hibiscus room entries are missing.");
assert(schedule.every((item) => item.sourceUrl === data.sourceUrl), "Schedule entries should retain source URL.");

assert(speakers.length >= 20, "Expected at least 20 extracted speakers.");
assert(speakers.some((speaker) => speaker.name === "Chris Barton"), "Chris Barton speaker record is missing.");
assert(speakers.some((speaker) => speaker.name === "Dave Free"), "Dave Free speaker record is missing.");

if (failures.length > 0) {
  console.error("Static smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Static smoke test passed.");
