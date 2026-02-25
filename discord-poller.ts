/**
 * Discord Message Poller
 * Polls Discord for new messages and handles commands
 * Run with: npx ts-node discord-poller.ts
 */

import { handleMessage, healthCheck } from "./discord-bot";
import * as fs from "fs";

const GUILD_ID = "1475414275840278681";
const CHANNELS = {
  bruceac: "1476075748958666873",
  meraki: "1476075750162567268",
  general: "1475414276478075035",
};

const POLL_INTERVAL = 5000; // 5 seconds
const STATE_FILE = "/Users/tricole/.openclaw/workspace/.discord-poller-state.json";

interface PollerState {
  lastMessageIds: { [channelId: string]: string };
  lastCheck: number;
}

/**
 * Load poller state
 */
function loadState(): PollerState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore errors, use defaults
  }

  return {
    lastMessageIds: {},
    lastCheck: Date.now(),
  };
}

/**
 * Save poller state
 */
function saveState(state: PollerState): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to save state:", err);
  }
}

/**
 * Fetch recent messages from channel
 */
async function getChannelMessages(
  channelId: string,
  limit = 5
): Promise<any[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN not set");
  }

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: { Authorization: `Bot ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Poll all channels for new messages
 */
async function pollChannels(state: PollerState): Promise<void> {
  console.log(`⏰ Polling at ${new Date().toISOString()}`);

  for (const [siteName, channelId] of Object.entries(CHANNELS)) {
    try {
      const messages = await getChannelMessages(channelId, 5);

      // Process messages in reverse order (oldest first)
      for (const message of messages.reverse()) {
        const lastId = state.lastMessageIds[channelId];

        // Skip if we've already processed this message
        if (lastId && BigInt(message.id) <= BigInt(lastId)) {
          continue;
        }

        // Update last seen message ID
        if (!state.lastMessageIds[channelId] || BigInt(message.id) > BigInt(lastId || "0")) {
          state.lastMessageIds[channelId] = message.id;
        }

        // Handle the message
        console.log(`📨 New message in #${siteName}: ${message.author.username}`);
        await handleMessage(message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error polling #${siteName}: ${errorMsg}`);
    }
  }

  state.lastCheck = Date.now();
  saveState(state);
}

/**
 * Main polling loop
 */
async function start(): Promise<void> {
  console.log("🤖 Discord Bot Poller Starting...\n");

  // Health check
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.error("❌ Bot health check failed. Check DISCORD_BOT_TOKEN.");
    process.exit(1);
  }

  console.log("✅ Bot is healthy and connected to Discord\n");
  console.log("📡 Listening for @mentions in Discord channels...");
  console.log(`   Poll interval: ${POLL_INTERVAL}ms\n`);

  let state = loadState();

  // Start polling
  setInterval(async () => {
    try {
      await pollChannels(state);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Polling error: ${errorMsg}`);
    }
  }, POLL_INTERVAL);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down gracefully...");
    saveState(state);
    process.exit(0);
  });
}

// Start the poller
start().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
