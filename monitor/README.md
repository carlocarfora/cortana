# Cortana Monitor

A lightweight Python script that collects system stats and service status for the Cortana dashboard.

## Quick Install

```bash
cd /path/to/cortana/monitor
sudo bash install.sh
```

This will:
1. Copy `monitor.py` to `/opt/cortana-monitor/`
2. Create a cron job to run every minute
3. Generate `stats.json` in `/var/www/cortana/`

## Manual Setup

1. Copy `monitor.py` to your preferred location
2. Edit the `CONFIG` section at the top of the script:
   - `output_path`: Where to write stats.json (must be accessible by nginx)
   - `services`: Systemd services to monitor
   - `apps`: Applications to check via port
   - `websites`: URLs to check via HTTP ping

3. Add to crontab:
```bash
sudo crontab -e
# Add this line:
* * * * * /usr/bin/python3 /opt/cortana-monitor/monitor.py > /var/log/cortana-monitor.log 2>&1
```

## Configuration

Edit the `CONFIG` dictionary in `monitor.py`:

```python
CONFIG = {
    "output_path": "/var/www/cortana/stats.json",

    # Systemd services
    "services": [
        {"name": "nginx", "type": "systemd"},
        {"name": "sshd", "type": "systemd"},
    ],

    # Port-based checks
    "apps": [
        {"name": "strong", "port": 8000, "type": "port"},
        {"name": "flights", "port": 8001, "type": "port"},
    ],

    # HTTP ping checks
    "websites": [
        {"name": "travels", "url": "https://travels.carlocarfora.co.uk", "type": "http"},
    ],
}
```

## Output Format

The script generates `stats.json` with this structure:

```json
{
  "timestamp": "2026-01-25T12:00:00Z",
  "system": {
    "cpu_percent": 23.5,
    "memory": { "used_gb": 4.2, "total_gb": 8.0, "percent": 52.5 },
    "disk": { "used_gb": 45.2, "total_gb": 100.0, "percent": 45.2 },
    "load_average": [0.52, 0.48, 0.51],
    "uptime_days": 42,
    "swap": { "used_gb": 0.1, "total_gb": 2.0, "percent": 5.0 }
  },
  "services": [
    { "name": "nginx", "status": "running", "uptime": "42d 3h" },
    { "name": "strong", "status": "running", "uptime": null }
  ]
}
```

## Troubleshooting

**Check if cron is running:**
```bash
sudo systemctl status cron
```

**Check the log:**
```bash
tail -f /var/log/cortana-monitor.log
```

**Run manually:**
```bash
sudo python3 /opt/cortana-monitor/monitor.py
```

**Check if stats.json exists:**
```bash
cat /var/www/cortana/stats.json
```

**Verify cron job is installed:**
```bash
sudo crontab -l | grep cortana-monitor
```

If the cron job is missing, manually install it:
```bash
sudo bash -c '(crontab -l 2>/dev/null; echo "* * * * * /usr/bin/python3 /opt/cortana-monitor/monitor.py > /var/log/cortana-monitor.log 2>&1") | crontab -'
```

**Note:** The install.sh script may occasionally fail to install the cron job. If stats.json is not updating every minute, verify the cron job exists using the command above and install it manually if needed.

## Requirements

- Python 3.6+
- No external dependencies (uses only standard library)
- systemd (for service monitoring)
