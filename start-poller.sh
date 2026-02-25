#!/bin/bash

# Load environment from .env.local
export $(grep -v '^#' /Users/tricole/.openclaw/workspace/.env.local | xargs)

# Start the poller
cd /Users/tricole/.openclaw/workspace/projects/mission-control
node discord-poller.js
