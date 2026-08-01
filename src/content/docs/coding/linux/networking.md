---
title: Networking
---

# Networking — Quick Reference

---

## curl — HTTP Requests

```bash
# GET request
curl https://api.example.com/users

# Pretty-print JSON response
curl https://api.example.com/users | jq .

# POST with JSON body
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name": "vivek"}'

# With auth header
curl -H "Authorization: Bearer TOKEN" https://api.example.com

# Follow redirects
curl -L https://example.com

# Save response to file
curl -o output.json https://api.example.com/data

# Show response headers
curl -I https://example.com

# Verbose (show request + response headers)
curl -v https://example.com

# Upload a file
curl -F "file=@report.pdf" https://upload.example.com

# Send form data
curl -X POST -d "user=vivek&pass=secret" https://example.com/login

# Set timeout
curl --max-time 10 https://example.com
```

---

## wget — Download Files

```bash
wget https://example.com/file.zip          # download file
wget -O output.zip https://example.com/file.zip   # custom filename
wget -r https://example.com               # recursive download
wget -c https://example.com/file.zip      # resume incomplete download
wget -q https://example.com/file.zip      # quiet mode
```

---

## ssh — Remote Login

```bash
ssh user@host                 # connect
ssh -p 2222 user@host         # custom port
ssh -i ~/.ssh/key.pem user@host   # specific key

# Run a single command remotely
ssh user@host "ls -la /var/log"

# Port forwarding — local:8080 → remote:80
ssh -L 8080:localhost:80 user@host

# Reverse tunnel — remote:9090 → local:3000
ssh -R 9090:localhost:3000 user@host

# Keep connection alive
ssh -o ServerAliveInterval=60 user@host
```

### SSH Config (~/.ssh/config)

```
Host myserver
    HostName 192.168.1.100
    User vivek
    IdentityFile ~/.ssh/id_rsa
    Port 22
```

Then just: `ssh myserver`

---

## scp — Copy Files Over SSH

```bash
# Local → Remote
scp file.txt user@host:/remote/path/

# Remote → Local
scp user@host:/remote/file.txt ./local/

# Copy directory
scp -r ./dir user@host:/remote/path/

# Custom port
scp -P 2222 file.txt user@host:/path/
```

---

## rsync — Sync Files Over Network

Better than `scp` for large transfers — skips unchanged files.

```bash
# Sync local dir to remote
rsync -avz ./src/ user@host:/remote/src/

# Sync remote to local
rsync -avz user@host:/remote/src/ ./src/

# Dry run (preview what would change)
rsync -avzn ./src/ user@host:/remote/src/

# Delete files on dest that don't exist in source
rsync -avz --delete ./src/ user@host:/remote/src/

# Exclude a directory
rsync -avz --exclude=node_modules ./src/ user@host:/remote/
```

| Flag | Meaning |
|------|---------|
| `-a` | Archive (preserves permissions, timestamps, symlinks) |
| `-v` | Verbose |
| `-z` | Compress during transfer |
| `-n` | Dry run |
| `--delete` | Remove extra files on destination |

---

## netstat / ss — Open Ports & Connections

`ss` is the modern replacement for `netstat`.

```bash
ss -tuln                      # all listening TCP/UDP ports
ss -tulnp                     # include process name
ss -s                         # summary stats
netstat -tuln                 # same with netstat
netstat -an | grep :8080      # check specific port
```

---

## ping / traceroute — Diagnose Connectivity

```bash
ping google.com               # check connectivity
ping -c 4 google.com          # send only 4 packets

traceroute google.com         # show hops to destination
tracepath google.com          # alternative (no root needed)
mtr google.com                # live traceroute (combines ping + traceroute)
```

---

## lsof -i — What's Using a Port

```bash
lsof -i :8080                 # process on port 8080
lsof -i TCP:3000              # TCP on port 3000
lsof -i -n -P                 # all network connections, no DNS lookup
```

---

## nmap — Port Scanning

```bash
nmap localhost                # scan common ports on localhost
nmap -p 80,443,8080 host     # scan specific ports
nmap -p 1-65535 host          # scan all ports
nmap -sV host                 # detect service versions
```

---

## dig / nslookup — DNS Lookup

```bash
dig example.com               # DNS lookup
dig example.com A             # A record only
dig example.com MX            # mail records
dig @8.8.8.8 example.com      # query specific DNS server

nslookup example.com          # simpler alternative
```

---

## Tips

- Use `curl -v` when debugging API issues — it shows the full request and response headers.
- `rsync --dry-run` before any real sync to avoid accidental overwrites.
- `ssh -L` local port forwarding is essential for accessing remote services (databases, dashboards) securely.
- `ss -tulnp` is your first stop when a port isn't responding as expected.

---

[← Linux](/coding/linux/)
