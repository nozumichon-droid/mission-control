/**
 * Discord Bot - Message Listener & Command Handler
 * Responds to @mentions with commands
 */

const https = require("https");
const BOT_ID = "1475400776485441567";

function parseCommand(content) {
  // Support both @mention and ! prefix
  const mentionPattern = new RegExp(`<@!?${BOT_ID}>`);
  const prefixPattern = /^!/;
  
  let cleanContent;
  
  if (mentionPattern.test(content)) {
    // @mention format
    cleanContent = content.replace(mentionPattern, "").trim();
  } else if (prefixPattern.test(content)) {
    // ! prefix format
    cleanContent = content.replace(prefixPattern, "").trim();
  } else {
    // Not a command
    return null;
  }

  const parts = cleanContent.split(/\s+/);
  const command = parts[0]?.toLowerCase() || "";
  const args = parts.slice(1);

  return { command, args };
}

async function executeCommand(command, args) {
  switch (command) {
    case "audit":
      return getAuditReport(args[0] || "bruceac");

    case "status":
      return getStatus(args[0] || "bruceac");

    case "recommendations":
      return getRecommendations(args[0] || "bruceac");

    case "help":
      return getHelpText();

    default:
      return `❓ Unknown command: \`${command}\`\n${getHelpText()}`;
  }
}

function getAuditReport(site) {
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `📊 **${siteName} - Latest Audit**
  
  🔄 Fetching latest audit data...
  (Once Mission Control dashboard is live, this will show real metrics)
  
  **Expected Next Audit:** Monday 6 AM PST`;
}

function getStatus(site) {
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `🟢 **${siteName} - Status**
  
  • Bot connection: ✅ Active
  • Audit schedule: Monday 6 AM PST
  • Last audit: Pending (first run Monday)
  
  Use \`@Open Claw audit ${site}\` for detailed metrics`;
}

function getRecommendations(site) {
  const siteName = site === "bruceac" ? "Bruce A/C" : "Meraki Restoration";
  return `💡 **${siteName} - Top Recommendations**
  
  🔄 Fetching recommendations...
  (Once Mission Control dashboard is live, this will show ranked recommendations)
  
  Visit the dashboard for detailed breakdown by priority & effort.`;
}

function getHelpText() {
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

async function sendMessage(channelId, content) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const payload = { content };

  const options = {
    hostname: "discord.com",
    port: 443,
    path: `/api/v10/channels/${channelId}/messages`,
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
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

async function handleMessage(message) {
  // Ignore bot's own messages
  if (message.author.id === BOT_ID) {
    return;
  }

  // Check if message is a command (! prefix or @mention)
  const isPrefixCommand = message.content.startsWith("!");
  const isMentioned = message.mentions.some((m) => m.id === BOT_ID);
  
  if (!isPrefixCommand && !isMentioned) {
    return;
  }

  const parsed = parseCommand(message.content);
  if (!parsed) {
    return;
  }

  console.log(`📨 Command received: ${parsed.command} ${parsed.args.join(" ")}`);

  try {
    const response = await executeCommand(parsed.command, parsed.args);
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

async function healthCheck() {
  const token = process.env.DISCORD_BOT_TOKEN;
  try {
    const options = {
      hostname: "discord.com",
      port: 443,
      path: `/api/v10/users/@me`,
      method: "GET",
      headers: {
        Authorization: `Bot ${token}`,
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

module.exports = { handleMessage, healthCheck };
