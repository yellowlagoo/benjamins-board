/**
 * Daily Image Feature — Forward-looking simulation test
 *
 * Replays the artwork selection logic for the next 30 days against the live
 * Met Museum API to verify that every day will resolve to a valid, non-placeholder
 * artwork image.
 *
 * Run:  node src/tests/daily-image.test.js
 */

const SEARCH_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting';
const OBJECT_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
const MAX_RETRIES = 10;
const RETRY_STRIDE = 7919;
const DAYS_TO_TEST = 30;

const PLACEHOLDER_NAMES = ['image-number-only', 'no-image', 'placeholder'];

function isPlaceholderUrl(url) {
  const filename = url.split('/').pop().toLowerCase();
  return PLACEHOLDER_NAMES.some((name) => filename.includes(name));
}

function getDayIndexForDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 86400000);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function fetchObject(id) {
  const res = await fetch(OBJECT_URL + id);
  return res.json();
}

async function run() {
  console.log('Fetching Met Museum search results...\n');
  const searchRes = await fetch(SEARCH_URL);
  const searchData = await searchRes.json();
  const ids = searchData.objectIDs;
  console.log(`Got ${ids.length} object IDs\n`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let passed = 0;
  let failed = 0;

  for (let offset = 0; offset < DAYS_TO_TEST; offset++) {
    const date = new Date(today.getTime() + offset * 86400000);
    const label = formatDate(date);
    const dayIndex = getDayIndexForDate(date);

    let found = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const idx = (dayIndex + attempt * RETRY_STRIDE) % ids.length;
      const objectID = ids[idx];

      try {
        const obj = await fetchObject(objectID);

        if (!obj.primaryImage || !obj.isPublicDomain) continue;
        if (isPlaceholderUrl(obj.primaryImage)) continue;

        console.log(
          `  PASS  ${label}  attempt ${attempt}  ID ${objectID}  "${(obj.title || '').slice(0, 50)}"`
        );
        passed++;
        found = true;
        break;
      } catch {
        // network error on this object, try next
      }
    }

    if (!found) {
      console.log(`  FAIL  ${label}  — no valid artwork found after ${MAX_RETRIES} retries`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${DAYS_TO_TEST} days`);

  if (failed > 0) {
    console.log('\nSome days will fail — consider increasing MAX_RETRIES or RETRY_STRIDE.');
    process.exit(1);
  } else {
    console.log('\nAll days will display a valid artwork image.');
  }
}

run().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
