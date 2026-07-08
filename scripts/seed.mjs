/**
 * Seeds demo accounts + posts for Bilik Keluaran.
 * Requires SUPABASE_SERVICE_ROLE_KEY (legacy JWT service_role works best).
 *
 * Usage:
 *   npm run seed
 *
 * Seed logins (local/demo only):
 *   amei@seed.bilik.local / SeedDemo123!
 *   rizal@seed.bilik.local / SeedDemo123!
 *   fanboy@seed.bilik.local / SeedDemo123!
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  {
    email: "amei@seed.bilik.local",
    password: "SeedDemo123!",
    username: "amei_beats",
    display_name: "Amei Beats",
    role: "producer",
    bio: "KL producer. Drum & bass nights and late-session coffee.",
  },
  {
    email: "rizal@seed.bilik.local",
    password: "SeedDemo123!",
    username: "rizal_jb",
    display_name: "Rizal JB",
    role: "artist",
    bio: "Johor Bahru indie / alt. Gigging the south circuit.",
  },
  {
    email: "fanboy@seed.bilik.local",
    password: "SeedDemo123!",
    username: "penang_fan",
    display_name: "Penang Fan",
    role: "fan",
    bio: "Here for the local scene — Penang / island show runner.",
  },
];

const posts = [
  {
    username: "amei_beats",
    post_type: "discussion",
    body: "Selamat datang ke Bilik Keluaran 🇲🇾 Apa yang sedang kalian work on minggu ni? Drop WIP thoughts — gear, stems, or just the vibes.",
  },
  {
    username: "rizal_jb",
    post_type: "gig_event",
    body: "JB supperclub gig this weekend — doors 9pm. Local openers + late DJ set. DM if you want the details. Support local nights!",
  },
  {
    username: "penang_fan",
    post_type: "discovery",
    body: "Anyone else obsessing over newer Melayu alternative acts from Penang? Drop recs below — hungry for more island sound.",
  },
  {
    username: "amei_beats",
    post_type: "collab_feedback",
    body: "Need a vocalist for a half-time DnB sketch (~140BPM). Looking for Bahasa or Manglish freestyle energy. @rizal_jb thoughts?",
  },
  {
    username: "rizal_jb",
    post_type: "discussion",
    body: "Hot take: gig posters still matter more than IG stories for underground nights. Agree or coping?",
  },
  {
    username: "penang_fan",
    post_type: "discovery",
    body: "Shoutout to the bedroom producers in Shah Alam keeping the community chats live. This space needed a music-only bilik.",
  },
];

async function ensureUser(seed) {
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("username", seed.username)
    .maybeSingle();

  if (existingProfile) {
    await admin
      .from("profiles")
      .update({
        display_name: seed.display_name,
        bio: seed.bio,
        role: seed.role,
      })
      .eq("id", existingProfile.id);
    console.log(`✓ profile exists @${seed.username}`);
    return existingProfile.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: seed.email,
    password: seed.password,
    email_confirm: true,
    user_metadata: {
      username: seed.username,
      display_name: seed.display_name,
      role: seed.role,
    },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create ${seed.email}: ${error?.message}`);
  }

  await new Promise((r) => setTimeout(r, 500));

  await admin
    .from("profiles")
    .update({
      username: seed.username,
      display_name: seed.display_name,
      bio: seed.bio,
      role: seed.role,
    })
    .eq("id", data.user.id);

  console.log(`✓ created @${seed.username}`);
  return data.user.id;
}

async function seedPosts(userIds) {
  const { count } = await admin
    .from("posts")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= posts.length) {
    console.log(`ℹ enough posts already (${count}) — skipping post seed`);
    return;
  }

  for (const post of posts) {
    const userId = userIds[post.username];
    if (!userId) continue;

    const { data: existing } = await admin
      .from("posts")
      .select("id")
      .eq("user_id", userId)
      .eq("body", post.body)
      .maybeSingle();

    if (existing) {
      console.log(`✓ post already exists (@${post.username})`);
      continue;
    }

    const { error } = await admin.from("posts").insert({
      user_id: userId,
      post_type: post.post_type,
      body: post.body,
      track_url: null,
      track_metadata: null,
      image_urls: [],
    });
    if (error) {
      console.error(`✗ post failed: ${error.message}`);
    } else {
      console.log(`✓ post by @${post.username} (${post.post_type})`);
    }
  }
}

async function main() {
  console.log("Seeding Bilik Keluaran…");
  const userIds = {};
  for (const user of users) {
    userIds[user.username] = await ensureUser(user);
  }
  await seedPosts(userIds);
  console.log("Done. Seed password for all accounts: SeedDemo123!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
