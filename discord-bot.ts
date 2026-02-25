/**
 * Discord Bot - Message Listener & Command Handler
 * Responds to @mentions with commands
 * Requires MESSAGE_CONTENT intent enabled in Discord Developer Portal
 */

import * as https from "https";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const BOT_ID = "1475400776485441567";
const GUILD_ID = "1475414275840278681";

interface DiscordMessage {
  id: string;
  channel_id: string;
  author: { id: string; username: string };
  content: string;
  mentions: Array<{ id: string }>;
}

/**
 * Parse command from message
 * Format: @Open Claw <command> [args]
 */
function parseCommand(content: string): { command: string; args: string[] } | null {
  const mentionPattern = new RegExp(`<@!?${BOT_ID}>`);
  if (!mentionPattern.test(content)) {
    return null;
  }

  const cleanContent = content.replace(mentionPattern, "").trim();
  const parts = cleanContent.split(/\s+/);
  const command = parts[0]?.toLowerCase() || "";
  const args = parts.slice(1);

  return { command, args };
}

/**
 * Execute command and return response
 */
async function executeCommand(
  command: string,
  args: string[]
): Promise<string> {
  switch (command) {
    case "audit":
      return await getAuditReport(args[0] || "bruceac");

    case "status":
      return await getStatus(args[0] || "bruceac");

    case "recommendations":
      return await getRecommendations(args[0] || "bruceac");

    case "help":
      return getHelpText();

    default:
      return `❓ Unknown command: \`${command}\`\n${getHelpText()}`;
  }
}

/**
 * Get latest audit report
 */
async function getAuditReport(site: string): Promise<string> {
  // In production, this would query the Supabase audits table
  // For now, return a placeholder
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `📊 **${siteName} - Latest Audit**
  
  🔄 Fetching latest audit data...
  (Once Mission Control dashboard is live, this will show real metrics)
  
  **Expected Next Audit:** Monday 6 AM PST`;
}

/**
 * Get current status
 */
async function getStatus(site: string): Promise<string> {
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `🟢 **${siteName} - Status**
  
  • Bot connection: ✅ Active
  • Audit schedule: Monday 6 AM PST
  • Last audit: Pending (first run Monday)
  
  Use \`@Open Claw audit ${site}\` for detailed metrics`;
}

/**
 * Get top recommendations
 */
async function getRecommendations(site: string): Promise<string> {
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `💡 **${siteName} - Top Recommendations**
  
  🔄 Fetching recommendations...
  (Once Mission Control dashboard is live, this will show ranked recommendations)
  
  Visit the dashboard for detailed breakdown by priority & effort.`;
}

/**
 * Help text
 */
function getHelpText(): string {
  return `**Available Commands:**
\`\`\`
@Open Claw audit [site]       - Get latest audit report
@Open Claw status [site]      - Check current status
@Open Claw recommendations    - Get top recommendations
@Open Claw help               - Show this help message
\`\`\`

**Sites:** \`bruceac\`, \`meraki\` (default: bruceac)

**Examples:**
• \`@Open Claw audit meraki\`
• \`@Open Claw status\`
• \`@Open Claw recommendations bruceac\``;
}

/**
 * Send message to Discord channel
 */
async function sendMessage(channelId: string, content: string): Promise<void> {
  const payload = { content };

  const options = {
    hostname: "discord.com",
    port: 443,
    path: `/api/v10/channels/${channelId}/messages`,
    method: "POST",
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`Discord API error: ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Handle incoming Discord message
 * Called by gateway webhook or polling
 */
export async function handleMessage(message: DiscordMessage): Promise<void> {
  // Ignore bot's own messages
  if (message.author.id === BOT_ID) {
    return;
  }

  // Check if bot was mentioned
  const isBotMentioned = message.mentions.some((m) => m.id === BOT_ID);
  if (!isBotMentioned) {
    return; // Ignore messages that don't mention us
  }

  // Parse command
  const parsed = parseCommand(message.content);
  if (!parsed) {
    return;
  }

  console.log(`📨 Command received: ${parsed.command} ${parsed.args.join(" ")}`);

  try {
    // Execute command
    const response = await executeCommand(parsed.command, parsed.args);

    // Send response
    await sendMessage(message.channel_id, response);
    console.log(`✅ Response sent to #${message.channel_id}`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Error executing command: ${errorMsg}`);

    await sendMessage(
      message.channel_id,
      `❌ Error: ${errorMsg}\n\nTry \`@Open Claw help\` for available commands.`
    );
  }
}

/**
 * Health check - verify bot can reach Discord
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const options = {
      hostname: "discord.com",
      port: 443,
      path: `/api/v10/users/@me`,
      method: "GET",
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
      },
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
      req.end();
    });
  } catch {
    return false;
  }
}
