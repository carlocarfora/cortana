#!/bin/bash
#
# Cortana Monitor Installation Script
# Run with: sudo bash install.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Cortana Monitor Installation${NC}"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo bash install.sh)${NC}"
    exit 1
fi

# Configuration
MONITOR_DIR="/opt/cortana-monitor"
CORTANA_WEB_DIR="/var/www/cortana"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Step 1: Create directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$MONITOR_DIR"
mkdir -p "$CORTANA_WEB_DIR"

# Step 2: Copy monitor script
echo -e "${YELLOW}Installing monitor script...${NC}"
cp "$SCRIPT_DIR/monitor.py" "$MONITOR_DIR/monitor.py"
chmod +x "$MONITOR_DIR/monitor.py"

# Step 3: Update the output path in the script
echo -e "${YELLOW}Configuring output path...${NC}"
# The default path in monitor.py should already be correct

# Step 4: Test the script
echo -e "${YELLOW}Testing monitor script...${NC}"
python3 "$MONITOR_DIR/monitor.py"

if [ -f "$CORTANA_WEB_DIR/stats.json" ]; then
    echo -e "${GREEN}Test successful! stats.json created.${NC}"
else
    echo -e "${RED}Test failed - stats.json not created${NC}"
    exit 1
fi

# Step 5: Set up cron job
echo -e "${YELLOW}Setting up cron job...${NC}"

# Create cron entry
CRON_ENTRY="* * * * * /usr/bin/python3 $MONITOR_DIR/monitor.py > /var/log/cortana-monitor.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "cortana-monitor"; then
    echo -e "${YELLOW}Cron job already exists, updating...${NC}"
    (crontab -l 2>/dev/null | grep -v "cortana-monitor") | crontab -
fi

# Add cron entry
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

echo -e "${GREEN}Cron job installed.${NC}"

# Step 6: Set permissions
echo -e "${YELLOW}Setting permissions...${NC}"
chown -R www-data:www-data "$CORTANA_WEB_DIR" 2>/dev/null || true
chmod 644 "$CORTANA_WEB_DIR/stats.json"

# Done
echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "The monitor will run every minute and update:"
echo "  $CORTANA_WEB_DIR/stats.json"
echo ""
echo "To check the log:"
echo "  tail -f /var/log/cortana-monitor.log"
echo ""
echo "To manually run the monitor:"
echo "  python3 $MONITOR_DIR/monitor.py"
echo ""
echo "To customize monitored services, edit:"
echo "  $MONITOR_DIR/monitor.py"
echo ""
