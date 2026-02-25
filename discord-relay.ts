/**
 * Discord Relay - Two-way sync between Discord and OpenClaw
 * Posts audit reports to Discord channels
 * Listens for messages and relays them back to OpenClaw
 */

import * as https from "https";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = "1475414275840278681";
const CHANNELS = {
  bruceac: "1476075748958666873",
  meraki: "1476075750162567268",
  general: "1475414276478075035",
};

interface AuditReport {
  site: "bruceac" | "meraki";
  timestamp: string;
  metrics: {
    lighthouseScore: number;
    pageSpeed: number;
    seoVisibility: number;
    conversionRate: number;
  };
  criticalIssues: string[];
  highPriorityItems: string[];
  recommendations: Array<{
    title: string;
    impact: "low" | "medium" | "high";
    effort: number;
  }>;
}

/**
 * Post audit report to Discord channel
 */
export async function postAuditReport(report: AuditReport): Promise<void> {
  const channelId = CHANNELS[report.site];
  if (!channelId) {
    console.error(`Unknown site: ${report.site}`);
    return;
  }

  const embed = {
    title: `📊 ${report.site.toUpperCase()} Audit Report`,
    description: `Weekly optimization audit - ${new Date(report.timestamp).toLocaleDateString()}`,
    color: 3447003, // Blue
    fields: [
      {
        name: "📈 Metrics",
        value: `
• Lighthouse Score: **${report.metrics.lighthouseScore}/100**
• Page Speed: **${report.metrics.pageSpeed}ms**
• SEO Visibility: **${report.metrics.seoVisibility}%**
• Conversion Rate: **${(report.metrics.conversionRate * 100).toFixed(1)}%**`,
        inline: false,
      },
      {
        name: "🔴 Critical Issues",
        value:
          report.criticalIssues.length > 0
            ? report.criticalIssues.map((issue) => `• ${issue}`).join("\n")
            : "None detected",
        inline: false,
      },
      {
        name: "🟡 High Priority",
        value:
          report.highPriorityItems.length > 0
            ? report.highPriorityItems.map((item) => `• ${item}`).join("\n")
            : "None",
        inline: false,
      },
      {
        name: "💡 Top Recommendations",
        value: report.recommendations
          .slice(0, 3)
          .map(
            (rec) => `• **${rec.title}** (Impact: ${rec.impact}, Effort: ${rec.effort}h)`
          )
          .join("\n"),
        inline: false,
      },
    ],
    footer: {
      text: "Mission Control Dashboard",
      icon_url:
        "https://cdn.discordapp.com/app-icons/1475400776485441567/d2a6b3f8f8f8f8f8f8f8f8f8.png",
    },
  };

  const payload = {
    embeds: [embed],
    content: `🚀 New ${report.site} audit report ready!`,
  };

  await discordApiCall(
    `channels/${channelId}/messages`,
    "POST",
    payload
  );
}

/**
 * Post alert to all relevant channels
 */
export async function postAlert(
  sites: ("bruceac" | "meraki")[],
  title: string,
  message: string,
  severity: "critical" | "high" | "medium"
): Promise<void> {
  const colors = {
    critical: 15158332, // Red
    high: 16776960, // Yellow
    medium: 3447003, // Blue
  };

  const embed = {
    title: `🚨 ${title}`,
    description: message,
    color: colors[severity],
    timestamp: new Date().toISOString(),
  };

  const payload = { embeds: [embed] };

  for (const site of sites) {
    const channelId = CHANNELS[site];
    if (channelId) {
      await discordApiCall(`channels/${channelId}/messages`, "POST", payload);
    }
  }
}

/**
 * Generic Discord API call
 */
async function discordApiCall(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: unknown
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "discord.com",
      port: 443,
      path: `/api/v10/${endpoint}`,
      method,
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(
            new Error(
              `Discord API error: ${res.statusCode} ${res.statusMessage}`
            )
          );
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Relay a message from Discord to OpenClaw main session
 * (Called by webhook listener)
 */
export async function relayMessageToOpenClaw(
  channelId: string,
  authorName: string,
  message: string
): Promise<void> {
  const siteMap: { [key: string]: string } = {
    [CHANNELS.bruceac]: "bruceac",
    [CHANNELS.meraki]: "meraki",
    [CHANNELS.general]: "general",
  };

  const site = siteMap[channelId] || "unknown";
  console.log(
    `📨 Message relay: @${authorName} in #${site}: ${message}`
  );

  // In production, this would call sessions_send or message tool
  // to route the Discord message back to the main OpenClaw session
}
