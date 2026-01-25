#!/usr/bin/env python3
"""
Cortana System Monitor
Collects system stats and service status, writes to stats.json
Run via cron every minute: * * * * * /usr/bin/python3 /path/to/monitor.py
"""

import json
import os
import socket
import subprocess
import time
from datetime import datetime
from pathlib import Path

# Configuration
CONFIG = {
    # Where to write the stats.json file
    "output_path": "/var/www/cortana/stats.json",

    # Systemd services to monitor
    "services": [
        {"name": "nginx", "type": "systemd"},
        {"name": "sshd", "type": "systemd"},
    ],

    # Applications to monitor via port check
    "apps": [
        {"name": "strong", "port": 8000, "type": "port"},
        {"name": "flights", "port": 8001, "type": "port"},
    ],

    # Websites to monitor via HTTP ping
    "websites": [
        {"name": "travels", "url": "https://travels.carlocarfora.co.uk", "type": "http"},
    ],

    # Optional services (only monitor if they exist)
    "optional_services": [
        {"name": "fail2ban", "type": "systemd"},
        {"name": "redis", "type": "systemd"},
        {"name": "postgresql", "type": "systemd"},
    ],

    # Disk mount point to monitor
    "disk_mount": "/",

    # History settings
    "history_file": "/var/www/cortana/stats_history.json",
    "history_max_points": 168,  # 7 days at hourly intervals
}


def get_cpu_percent():
    """Get CPU usage percentage."""
    try:
        # Read /proc/stat for CPU stats
        with open('/proc/stat', 'r') as f:
            line = f.readline()

        cpu_times = list(map(int, line.split()[1:8]))
        idle = cpu_times[3]
        total = sum(cpu_times)

        # Get previous values if they exist
        cache_file = '/tmp/cortana_cpu_cache'
        try:
            with open(cache_file, 'r') as f:
                prev = json.load(f)
                prev_idle = prev['idle']
                prev_total = prev['total']
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            prev_idle = 0
            prev_total = 0

        # Save current values
        with open(cache_file, 'w') as f:
            json.dump({'idle': idle, 'total': total}, f)

        # Calculate percentage
        if prev_total == 0:
            return 0.0

        idle_delta = idle - prev_idle
        total_delta = total - prev_total

        if total_delta == 0:
            return 0.0

        cpu_percent = (1.0 - idle_delta / total_delta) * 100
        return max(0.0, min(100.0, cpu_percent))

    except Exception as e:
        print(f"Error getting CPU: {e}")
        return 0.0


def get_memory_info():
    """Get memory usage information."""
    try:
        with open('/proc/meminfo', 'r') as f:
            meminfo = {}
            for line in f:
                parts = line.split()
                if len(parts) >= 2:
                    key = parts[0].rstrip(':')
                    value = int(parts[1])
                    meminfo[key] = value

        total_kb = meminfo.get('MemTotal', 0)
        available_kb = meminfo.get('MemAvailable', meminfo.get('MemFree', 0))
        used_kb = total_kb - available_kb

        total_gb = total_kb / (1024 * 1024)
        used_gb = used_kb / (1024 * 1024)
        percent = (used_kb / total_kb * 100) if total_kb > 0 else 0

        return {
            "used_gb": round(used_gb, 2),
            "total_gb": round(total_gb, 2),
            "percent": round(percent, 1)
        }
    except Exception as e:
        print(f"Error getting memory: {e}")
        return {"used_gb": 0, "total_gb": 0, "percent": 0}


def get_disk_info(mount_point="/"):
    """Get disk usage information."""
    try:
        stat = os.statvfs(mount_point)
        total = stat.f_blocks * stat.f_frsize
        free = stat.f_bavail * stat.f_frsize
        used = total - free

        total_gb = total / (1024 ** 3)
        used_gb = used / (1024 ** 3)
        percent = (used / total * 100) if total > 0 else 0

        return {
            "used_gb": round(used_gb, 2),
            "total_gb": round(total_gb, 2),
            "percent": round(percent, 1)
        }
    except Exception as e:
        print(f"Error getting disk: {e}")
        return {"used_gb": 0, "total_gb": 0, "percent": 0}


def get_load_average():
    """Get system load average."""
    try:
        with open('/proc/loadavg', 'r') as f:
            parts = f.read().split()
            return [float(parts[0]), float(parts[1]), float(parts[2])]
    except Exception as e:
        print(f"Error getting load: {e}")
        return [0.0, 0.0, 0.0]


def get_uptime_days():
    """Get system uptime in days."""
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.read().split()[0])
            return int(uptime_seconds / 86400)
    except Exception as e:
        print(f"Error getting uptime: {e}")
        return 0


def get_swap_info():
    """Get swap usage information."""
    try:
        with open('/proc/meminfo', 'r') as f:
            meminfo = {}
            for line in f:
                parts = line.split()
                if len(parts) >= 2:
                    key = parts[0].rstrip(':')
                    value = int(parts[1])
                    meminfo[key] = value

        total_kb = meminfo.get('SwapTotal', 0)
        free_kb = meminfo.get('SwapFree', 0)
        used_kb = total_kb - free_kb

        total_gb = total_kb / (1024 * 1024)
        used_gb = used_kb / (1024 * 1024)
        percent = (used_kb / total_kb * 100) if total_kb > 0 else 0

        return {
            "used_gb": round(used_gb, 2),
            "total_gb": round(total_gb, 2),
            "percent": round(percent, 1)
        }
    except Exception as e:
        print(f"Error getting swap: {e}")
        return {"used_gb": 0, "total_gb": 0, "percent": 0}


def check_systemd_service(service_name):
    """Check if a systemd service is running and get its uptime."""
    try:
        # Check if service is active
        result = subprocess.run(
            ['systemctl', 'is-active', service_name],
            capture_output=True,
            text=True,
            timeout=5
        )
        is_running = result.stdout.strip() == 'active'

        if not is_running:
            return {"name": service_name, "status": "stopped", "uptime": None}

        # Get service uptime
        result = subprocess.run(
            ['systemctl', 'show', service_name, '--property=ActiveEnterTimestamp'],
            capture_output=True,
            text=True,
            timeout=5
        )

        uptime_str = None
        if result.returncode == 0:
            timestamp_str = result.stdout.strip().split('=', 1)[-1]
            if timestamp_str and timestamp_str != 'n/a':
                try:
                    # Parse the timestamp
                    start_time = datetime.strptime(
                        timestamp_str.split('.')[0],
                        '%a %Y-%m-%d %H:%M:%S'
                    )
                    uptime_seconds = (datetime.now() - start_time).total_seconds()
                    uptime_str = format_uptime(uptime_seconds)
                except (ValueError, IndexError):
                    uptime_str = None

        return {"name": service_name, "status": "running", "uptime": uptime_str}

    except subprocess.TimeoutExpired:
        return {"name": service_name, "status": "unknown", "uptime": None}
    except FileNotFoundError:
        return {"name": service_name, "status": "unknown", "uptime": None}
    except Exception as e:
        print(f"Error checking service {service_name}: {e}")
        return {"name": service_name, "status": "unknown", "uptime": None}


def check_port(port, host="127.0.0.1", timeout=2):
    """Check if a port is open."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


def check_http(url, timeout=5):
    """Check if a URL is reachable via HTTP."""
    try:
        import urllib.request
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'Cortana-Monitor/1.0')
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status < 400
    except Exception:
        return False


def check_app(app_config):
    """Check if an app is running based on its config."""
    name = app_config["name"]
    check_type = app_config.get("type", "port")

    if check_type == "port":
        port = app_config.get("port")
        if port and check_port(port):
            return {"name": name, "status": "running", "uptime": None}
        else:
            return {"name": name, "status": "stopped", "uptime": None}

    elif check_type == "http":
        url = app_config.get("url")
        if url and check_http(url):
            return {"name": name, "status": "running", "uptime": None}
        else:
            return {"name": name, "status": "stopped", "uptime": None}

    return {"name": name, "status": "unknown", "uptime": None}


def format_uptime(seconds):
    """Format uptime seconds to human-readable string."""
    days = int(seconds // 86400)
    hours = int((seconds % 86400) // 3600)

    if days > 0:
        return f"{days}d {hours}h"
    elif hours > 0:
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"
    else:
        minutes = int(seconds // 60)
        return f"{minutes}m"


def service_exists(service_name):
    """Check if a systemd service exists."""
    try:
        result = subprocess.run(
            ['systemctl', 'list-unit-files', f'{service_name}.service'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return service_name in result.stdout
    except Exception:
        return False


def collect_stats():
    """Collect all system stats."""
    # System stats
    system = {
        "cpu_percent": get_cpu_percent(),
        "memory": get_memory_info(),
        "disk": get_disk_info(CONFIG["disk_mount"]),
        "load_average": get_load_average(),
        "uptime_days": get_uptime_days(),
        "swap": get_swap_info(),
    }

    # Services
    services = []

    # Required systemd services
    for svc in CONFIG["services"]:
        services.append(check_systemd_service(svc["name"]))

    # Optional systemd services (only if they exist)
    for svc in CONFIG["optional_services"]:
        if service_exists(svc["name"]):
            services.append(check_systemd_service(svc["name"]))

    # Apps (port checks and HTTP checks)
    for app in CONFIG["apps"]:
        services.append(check_app(app))

    for website in CONFIG["websites"]:
        services.append(check_app(website))

    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "system": system,
        "services": services,
    }


def write_stats(stats):
    """Write stats to the output file."""
    output_path = Path(CONFIG["output_path"])

    # Ensure directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write atomically (write to temp file, then rename)
    temp_path = output_path.with_suffix('.tmp')

    with open(temp_path, 'w') as f:
        json.dump(stats, f, indent=2)

    temp_path.rename(output_path)
    print(f"Stats written to {output_path}")


def main():
    """Main entry point."""
    print(f"Collecting stats at {datetime.now().isoformat()}")

    stats = collect_stats()
    write_stats(stats)

    print("Done")


if __name__ == "__main__":
    main()
