import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrcizghnvjpawkzawej.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PeuFFl5qLIgTWlubzIfxWQ_hwUJaT97";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes("--dry");

async function getAllPostIds() {
  console.log("Fetching all post IDs from Supabase...");
  const postIds = [];
  const PAGE_SIZE = 1000;
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("public_posts")
      .select("id")
      .range(start, start + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || !data.length) break;
    postIds.push(...data.map((r) => r.id));
    if (data.length < PAGE_SIZE) break;
  }
  console.log(`Found ${postIds.length} total posts.`);
  return postIds;
}

async function getExistingPurrCounts() {
  console.log("Fetching existing purr counts...");
  const counts = new Map();
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("purr_counts")
      .select("post_id,purrs")
      .range(start, start + 999);
    if (error) break;
    if (!data || !data.length) break;
    for (const row of data) {
      counts.set(row.post_id, Number(row.purrs) || 0);
    }
    if (data.length < 1000) break;
  }
  console.log(`Found ${counts.size} posts that already have purrs.`);
  return counts;
}

async function main() {
  const postIds = await getAllPostIds();
  const existingCounts = await getExistingPurrCounts();

  console.log("Assigning random purr targets (0-231) with no pattern...");
  const rowsToInsert = [];
  const purrDistribution = [];

  for (const id of postIds) {
    // Completely random integer from 0 to 231 inclusive
    const target = Math.floor(Math.random() * 232);
    purrDistribution.push(target);
    const existing = existingCounts.get(id) || 0;
    const needed = Math.max(0, target - existing);

    for (let i = 0; i < needed; i++) {
      rowsToInsert.push({
        post_id: id,
        client_id: "c_" + crypto.randomBytes(8).toString("hex"),
      });
    }
  }

  // Summary stats
  const min = Math.min(...purrDistribution);
  const max = Math.max(...purrDistribution);
  const avg = (purrDistribution.reduce((a, b) => a + b, 0) / purrDistribution.length).toFixed(1);
  console.log(`Distribution summary across ${postIds.length} posts:`);
  console.log(`  Min purrs: ${min}, Max purrs: ${max}, Average purrs: ${avg}`);
  console.log(`  Total purr rows to insert: ${rowsToInsert.length}`);

  if (DRY_RUN) {
    console.log("DRY RUN: Sample of 10 posts with their assigned purrs:");
    for (let i = 0; i < 10; i++) {
      console.log(`  Post ${postIds[i]}: ${purrDistribution[i]} purrs`);
    }
    return;
  }

  // Shuffle rows so inserts are evenly distributed across posts
  for (let i = rowsToInsert.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rowsToInsert[i], rowsToInsert[j]] = [rowsToInsert[j], rowsToInsert[i]];
  }

  const BATCH_SIZE = 1000;
  const batches = [];
  for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
    batches.push(rowsToInsert.slice(i, i + BATCH_SIZE));
  }
  console.log(`Splitted into ${batches.length} batches of up to ${BATCH_SIZE} rows.`);

  let completedBatches = 0;
  let totalInserted = 0;
  const CONCURRENCY = 4;

  async function worker(id) {
    while (batches.length > 0) {
      const batch = batches.pop();
      if (!batch) break;

      let success = false;
      let retries = 3;
      while (!success && retries-- > 0) {
        const { error } = await supabase.from("purrs").insert(batch);
        if (!error) {
          success = true;
          totalInserted += batch.length;
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      completedBatches++;
      if (completedBatches % 20 === 0 || completedBatches === batches.length) {
        const percent = ((completedBatches / (completedBatches + batches.length)) * 100).toFixed(1);
        console.log(`Progress: ${completedBatches} batches done (${totalInserted} purrs inserted, ~${percent}%)...`);
      }
    }
  }

  const initialTotal = batches.length;
  console.log(`Starting ${CONCURRENCY} parallel insertion workers...`);
  console.time("purrs_insertion");
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  console.timeEnd("purrs_insertion");

  console.log(`\nSuccessfully finished inserting ${totalInserted} purrs!`);
}

main().catch((e) => {
  console.error("Error running seed-purrs:", e);
  process.exit(1);
});
