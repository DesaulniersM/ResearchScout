#!/bin/bash

# Get absolute paths
PYTHON_PATH=$(which python3.10)
SCRIPT_PATH="/home/matt/Mines/pecs_lab/ResearchFeed/backend/main.py"
LOG_PATH="/home/matt/Mines/pecs_lab/ResearchFeed/cron_log.txt"

# Create the cron line (Monday at 9:00 AM)
CRON_LINE="0 9 * * 1 $PYTHON_PATH $SCRIPT_PATH >> $LOG_PATH 2>&1"

# Install it
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "Cronjob installed successfully!"
echo "It will run every Monday at 9:00 AM."
echo "You can check the schedule with: crontab -l"
