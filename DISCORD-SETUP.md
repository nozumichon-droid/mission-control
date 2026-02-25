# Discord Integration Setup

## Status
✅ Bot created and connected  
✅ Channels created (#bruceac-optimization, #meraki-optimization)  
⏳ Bot permissions - **MANUAL SETUP NEEDED**

---

## Manual Setup Required

### Step 1: Grant Bot Permissions
To enable the bot to post to all channels and relay messages:

1. Go to your Discord server: https://discord.gg/Xx5neHvU
2. **Server Settings → Roles**
3. Find **"Open Claw"** role
4. Click on it → **Permissions** tab
5. Enable these permissions:
   - ✅ **View Channels**
   - ✅ **Send Messages**
   - ✅ **Embed Links** (for formatted audit reports)
   - ✅ **Attach Files**
   - ✅ **Read Message History**
   - ✅ **Add Reactions**
   - ✅ **Manage Messages** (optional, for cleanup)
6. **Save Changes**

### Step 2: Channel Roles (Optional)
To make channels accessible to all users:

1. Go to each channel (#bruceac-optimization, #meraki-optimization)
2. **Channel Settings → Permissions**
3. Ensure **@everyone** can **View Channel** and **Send Messages**

---

## What's Set Up Now

### Channels
```
🔵 #general
   └─ Announcements & general updates

🟠 #bruceac-optimization
   └─ Weekly audit reports for bruceac.com
   └─ Critical issues for Bruce AC
   └─ Recommendations & progress tracking

🔴 #meraki-optimization
   └─ Weekly audit reports for merakirestoration.com
   └─ Critical issues for Meraki
   └─ Recommendations & progress tracking
```

### Bot Capabilities (Once Permissions Are Set)

#### 📤 Outbound (Bot → Discord)
- **Audit Reports**: Formatted embeds with metrics, issues, recommendations
- **Critical Alerts**: Immediate notifications of critical issues
- **Status Updates**: Progress on recommendations and fixes
- **Scheduled Cron Posts**: Monday 6 AM PST automatic audits

#### 📥 Inbound (Discord → OpenClaw)
- **Message Relay**: Messages in Discord channels → OpenClaw main session
- **Commands**: Trigger agent actions from Discord
  - `!audit bruceac` → Force immediate audit
  - `!status meraki` → Get latest metrics
  - `!recommend bruceac` → Get top recommendations
  - `!complete <rec-id>` → Mark recommendation as done

---

## Testing

Once permissions are set, test with:

```bash
# From OpenClaw session, trigger a test post:
node /tmp/test_discord_post.js
```

This will post a sample audit report to both channels.

---

## Architecture

```
Mission Control Dashboard
├─ Cron Job (Monday 6 AM PST)
│  ├─ Run audits (Lighthouse, SEO, forms)
│  ├─ Generate findings
│  └─ Post to Discord via discord-relay.ts
│
├─ Discord Relay Module (discord-relay.ts)
│  ├─ postAuditReport() → posts to site channels
│  ├─ postAlert() → broadcasts critical issues
│  └─ relayMessageToOpenClaw() → messages back to main session
│
└─ Discord Channels (2-way sync)
   ├─ #bruceac-optimization (automated + manual)
   ├─ #meraki-optimization (automated + manual)
   └─ #general (announcements)
```

---

## Config Files

- **discord-config.json** → Channel IDs, bot info, relay settings
- **discord-relay.ts** → Relay logic (posting, listening)
- **cron/audit.ts** → Weekly audit automation (calls discord-relay)

---

## Next Steps

1. ✅ Grant bot permissions (see Step 1 above)
2. ⏳ Test webhook relay (optional, for bi-directional messages)
3. ⏳ Deploy Mission Control dashboard
4. ⏳ First audit runs Monday 6 AM PST

Once permissions are set, you can start receiving audit reports on Discord!
