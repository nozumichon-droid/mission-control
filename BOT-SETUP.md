# Discord Bot - Message Listener Setup

## Step 1: Enable MESSAGE_CONTENT Intent

1. Go to **Discord Developer Portal**: https://discord.com/developers/applications
2. Select **Open Claw** application
3. Go to **Bot** section (left sidebar)
4. Scroll down to **Privileged Gateway Intents**
5. Enable these intents:
   - ✅ **Message Content Intent** (required to read message text)
   - ✅ **Guild Messages Intent** (receive messages from servers)
   - ✅ **Direct Messages Intent** (optional, for DMs)
6. **Save Changes**

**⚠️ Important:** Without MESSAGE_CONTENT intent, the bot can't read message content and won't work.

---

## Step 2: Start the Message Poller

The bot listens for @mentions via polling (checks Discord every 5 seconds for new messages).

### Option A: Run Locally (for testing)

```bash
cd /Users/tricole/.openclaw/workspace/projects/mission-control

# Install dependencies (if needed)
npm install

# Start the poller
npx ts-node discord-poller.ts
```

Expected output:
```
🤖 Discord Bot Poller Starting...
✅ Bot is healthy and connected to Discord

📡 Listening for @mentions in Discord channels...
   Poll interval: 5000ms
```

Leave this running in the background (or in a tmux/screen session).

### Option B: Run as Cron/Background Service

To run the poller continuously in the background:

```bash
# Start in background
nohup npx ts-node discord-poller.ts > /tmp/discord-bot.log 2>&1 &

# Monitor logs
tail -f /tmp/discord-bot.log

# Stop the process
pkill -f "discord-poller"
```

### Option C: Deploy with Mission Control Dashboard (Recommended)

Once the Mission Control dashboard is deployed to Vercel, the poller will run as a background service on the same deployment.

---

## Step 3: Test the Bot

Once the poller is running, try these commands in any Discord channel:

```
@Open Claw help
@Open Claw audit bruceac
@Open Claw status meraki
@Open Claw recommendations
```

You should see responses within 5 seconds.

---

## Available Commands

| Command | Example | Description |
|---------|---------|-------------|
| `audit` | `@Open Claw audit bruceac` | Get latest audit report for a site |
| `status` | `@Open Claw status meraki` | Check current status |
| `recommendations` | `@Open Claw recommendations bruceac` | Get top recommendations |
| `help` | `@Open Claw help` | Show available commands |

**Sites:** `bruceac` (default) or `meraki`

---

## Architecture

```
User types @Open Claw audit bruceac in Discord
          ↓
   Discord Message Created
          ↓
   Poller (discord-poller.ts) checks every 5s
          ↓
   discord-bot.ts parses command
          ↓
   executeCommand() runs logic
          ↓
   Response posted back to Discord
```

---

## Files Created

- **discord-bot.ts** - Command parser & executor
- **discord-poller.ts** - Message listener (polling service)
- **BOT-SETUP.md** - This file

---

## Troubleshooting

### Bot doesn't respond to @mentions
1. Check MESSAGE_CONTENT intent is enabled
2. Verify bot token in `.env.local` is correct
3. Check bot is running: `ps aux | grep discord-poller`
4. View logs: `tail -f /tmp/discord-bot.log`

### "Discord API error: 403"
- Bot doesn't have permission to view/send messages
- Go to Discord Server → Roles → Open Claw → enable permissions (see DISCORD-SETUP.md)

### "DISCORD_BOT_TOKEN not set"
- Check `.env.local` has the token
- Verify it's not empty: `cat /Users/tricole/.openclaw/workspace/.env.local`

---

## Next Steps

1. ✅ Enable MESSAGE_CONTENT intent (Discord Developer Portal)
2. ✅ Start the poller: `npx ts-node discord-poller.ts`
3. ✅ Test with `@Open Claw help`
4. ⏳ Once Mission Control dashboard deploys, poller runs automatically
5. ⏳ Cron audits start posting weekly to Discord

Once the dashboard is live, the bot will have access to real-time metrics and can respond with actual data!
