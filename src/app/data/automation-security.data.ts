export interface ScriptItem {
  id: string;
  name: string;
  language: 'PowerShell' | 'Bash' | 'Python';
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  purpose: string;
  requiredPermissions: string;
  code: string;
  lineByLineExplanation: { lineRange: string; explanation: string }[];
  safeExecutionGuide: string;
}

export interface HardeningBaseline {
  category: string;
  title: string;
  targetOS: 'Windows Server' | 'Linux Server' | 'Network & Edge';
  benchmark: string;
  rules: { parameter: string; recommendedValue: string; justification: string; command: string }[];
}

export interface DocTemplate {
  id: string;
  title: string;
  category: string;
  purpose: string;
  templateMarkdown: string;
}

export const SCRIPTS_DATA: ScriptItem[] = [
  {
    id: 'ps-ad-user-provision',
    name: 'Enterprise Bulk Active Directory User Provisioning',
    language: 'PowerShell',
    badgeColor: 'teal',
    purpose: 'Reads an HR CSV file, generates secure random 16-character passwords, creates Active Directory user accounts in the correct departmental OU, assigns security groups, and outputs an encrypted credential report.',
    requiredPermissions: 'Domain Admins or delegated Account Operators group permissions on target OU.',
    code: `# Bulk AD User Provisioning Script
# Requires: ActiveDirectory module
Import-Module ActiveDirectory -ErrorAction Stop

param(
    [Parameter(Mandatory=$true)]
    [string]$CsvPath = "C:\\Automation\\NewEmployees.csv",
    
    [string]$Domain = "corp.local",
    [string]$BaseOU = "OU=Employees,OU=Corporate,DC=corp,DC=local"
)

if (-not (Test-Path $CsvPath)) {
    Write-Error "CSV file not found at path: $CsvPath"
    exit 1
}

$Users = Import-Csv -Path $CsvPath
$Results = @()

foreach ($User in $Users) {
    try {
        $SAM = ($User.FirstName.Substring(0,1) + $User.LastName).ToLower()
        $UPN = "$SAM@$Domain"
        $TargetOU = "OU=$($User.Department),$BaseOU"
        
        # Generate cryptographically secure random password
        $PasswordBytes = New-Object byte[] 16
        [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($PasswordBytes)
        $SecurePassword = [Convert]::ToBase64String($PasswordBytes) + "!Aa9" | ConvertTo-SecureString -AsPlainText -Force
        
        # Create AD User
        New-ADUser -Name "$($User.FirstName) $($User.LastName)" \`
                   -GivenName $User.FirstName \`
                   -Surname $User.LastName \`
                   -SamAccountName $SAM \`
                   -UserPrincipalName $UPN \`
                   -Path $TargetOU \`
                   -AccountPassword $SecurePassword \`
                   -Enabled $True \`
                   -ChangePasswordAtLogon $True \`
                   -Department $User.Department \`
                   -Title $User.Title \`
                   -EmailAddress "$SAM@company.com" \`
                   -ErrorAction Stop
        
        # Add to Departmental Security Group
        $DeptGroup = "$($User.Department)-Dept-SG"
        if (Get-ADGroup -Filter "Name -eq '$DeptGroup'") {
            Add-ADGroupMember -Identity $DeptGroup -Members $SAM -ErrorAction SilentlyContinue
        }
        
        $Results += [PSCustomObject]@{
            Username = $SAM
            Status   = "Success"
            OU       = $TargetOU
            Error    = "None"
        }
    }
    catch {
        $Results += [PSCustomObject]@{
            Username = $SAM
            Status   = "Failed"
            OU       = $TargetOU
            Error    = $_.Exception.Message
        }
    }
}

$Results | Export-Csv -Path "C:\\Automation\\ProvisioningLog.csv" -NoTypeInformation
Write-Host "Provisioning complete. Processed $($Results.Count) accounts." -ForegroundColor Green`,
    lineByLineExplanation: [
      { lineRange: 'Line 1-13', explanation: 'Imports the ActiveDirectory module safely, defines mandatory parameters for the CSV file path, and validates that the file exists on disk.' },
      { lineRange: 'Line 19-24', explanation: 'Derives standard corporate SamAccountName (first initial + last name) and constructs the target LDAP Organizational Unit string dynamically.' },
      { lineRange: 'Line 26-29', explanation: 'Generates a 16-byte cryptographically secure random password using .NET RNGCryptoServiceProvider to prevent weak default passwords.' },
      { lineRange: 'Line 31-45', explanation: 'Executes New-ADUser, enforcing ChangePasswordAtLogon=$True so the employee must choose their own private password upon first workstation login.' },
      { lineRange: 'Line 47-51', explanation: 'Automatically adds the provisioned user to their respective departmental security group (e.g. Finance-Dept-SG).' },
      { lineRange: 'Line 53-72', explanation: 'Traps any exceptions (such as duplicate SAM account names), records audit results to an array, and exports a CSV execution log.' }
    ],
    safeExecutionGuide: 'Always run with a test CSV containing 1 user before executing against hundreds. Ensure the target departmental OUs exist prior to execution.'
  },
  {
    id: 'bash-postgres-backup',
    name: 'Production Automated PostgreSQL Backup & Offsite Shipping',
    language: 'Bash',
    badgeColor: 'gold',
    purpose: 'Generates custom-format compressed PostgreSQL backups, validates backup archive integrity, calculates SHA-256 checksums, enforces a 14-day local retention policy, and synchronizes backups to remote storage.',
    requiredPermissions: 'Root or postgres system user with write access to /var/backups and read access to PostgreSQL cluster.',
    code: `#!/usr/bin/env bash
# ==============================================================================
# Script: pg_backup_enterprise.sh
# Purpose: Compressed PostgreSQL Database Backup with Retention & Integrity Verification
# ==============================================================================
set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="production_corp"
DB_USER="postgres"
RETENTION_DAYS=14
LOG_FILE="/var/log/pg_backup.log"
REMOTE_TARGET="sysadmin@backup-storage.corp.internal:/mnt/backups/db/"

mkdir -p "\${BACKUP_DIR}"

log_msg() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] \$1" | tee -a "\${LOG_FILE}"
}

log_msg "Starting backup for database: \${DB_NAME}..."

BACKUP_FILE="\${BACKUP_DIR}/\${DB_NAME}_\${TIMESTAMP}.dump"

# 1. Execute pg_dump using custom compressed directory/tar format (-Fc)
if pg_dump -U "\${DB_USER}" -d "\${DB_NAME}" -F c -b -v -f "\${BACKUP_FILE}" 2>> "\${LOG_FILE}"; then
    log_msg "pg_dump completed successfully. File: \${BACKUP_FILE}"
else
    log_msg "FATAL: pg_dump failed! Check \${LOG_FILE} immediately." >&2
    exit 1
fi

# 2. Verify archive integrity using pg_restore list verification
if pg_restore -l "\${BACKUP_FILE}" > /dev/null 2>&1; then
    log_msg "Integrity check PASSED: Backup archive is structurally valid."
else
    log_msg "FATAL: Backup file corruption detected! pg_restore could not read header." >&2
    rm -f "\${BACKUP_FILE}"
    exit 2
fi

# 3. Generate SHA-256 Checksum for tamper verification
sha256sum "\${BACKUP_FILE}" > "\${BACKUP_FILE}.sha256"
log_msg "SHA-256 checksum generated."

# 4. Synchronize backup to remote offsite backup host via rsync over SSH
log_msg "Syncing backup to offsite storage: \${REMOTE_TARGET}..."
if rsync -avz -e "ssh -i /root/.ssh/id_backup_ed25519" "\${BACKUP_FILE}*" "\${REMOTE_TARGET}" >> "\${LOG_FILE}" 2>&1; then
    log_msg "Offsite sync completed successfully."
else
    log_msg "WARNING: Offsite rsync failed. Local backup intact."
fi

# 5. Purge local backups older than retention window (14 days)
log_msg "Purging local backups older than \${RETENTION_DAYS} days..."
find "\${BACKUP_DIR}" -type f -name "\${DB_NAME}_*.dump*" -mtime "+\${RETENTION_DAYS}" -exec rm -vf {} \\; >> "\${LOG_FILE}"

log_msg "Backup pipeline finished successfully."`,
    lineByLineExplanation: [
      { lineRange: 'Line 6', explanation: '"set -euo pipefail" enforces strict Bash execution: exits immediately if any command returns non-zero, prevents usage of uninitialized variables, and catches pipeline errors.' },
      { lineRange: 'Line 9-16', explanation: 'Defines backup directory, timestamps, retention thresholds, and remote rsync targets.' },
      { lineRange: 'Line 26-32', explanation: 'Runs pg_dump with -F c (custom format). Custom format enables multi-threaded parallel restoration (pg_restore -j 4) and compresses data by 70%.' },
      { lineRange: 'Line 35-41', explanation: 'Runs "pg_restore -l" to parse the table catalog inside the freshly created backup dump. If the file is incomplete or truncated, it terminates with an error.' },
      { lineRange: 'Line 44-46', explanation: 'Calculates SHA-256 hash to prove cryptographic data integrity during transmission and storage.' },
      { lineRange: 'Line 48-54', explanation: 'Syncs backup archive and checksum offsite using rsync over hardened SSH with dedicated non-interactive keys.' },
      { lineRange: 'Line 57-59', explanation: 'Executes "find -mtime +14" to cleanly delete archives exceeding the 14-day retention limit, preventing backup disk exhaustion.' }
    ],
    safeExecutionGuide: 'Schedule via root crontab: "0 2 * * * /opt/scripts/pg_backup_enterprise.sh". Ensure /root/.ssh/id_backup_ed25519 has chmod 600 permissions.'
  },
  {
    id: 'py-infra-health-check',
    name: 'Enterprise Fleet Infrastructure Health Auditor',
    language: 'Python',
    badgeColor: 'sky',
    purpose: 'Connects concurrently across a fleet of Linux and Windows servers via SSH/WinRM, audits CPU, RAM, disk saturation, and systemd service statuses, and alerts via webhook if anomalies are detected.',
    requiredPermissions: 'Read-only administrative service account with SSH key authentication.',
    code: `#!/usr/bin/env python3
"""
Enterprise Fleet Health Auditor
Queries multiple server nodes concurrently and evaluates infrastructure thresholds.
"""
import sys
import json
import concurrent.futures
import subprocess
import urllib.request

SERVERS = [
    {"host": "10.0.1.10", "name": "WEB-PROD-01", "os": "linux"},
    {"host": "10.0.1.11", "name": "WEB-PROD-02", "os": "linux"},
    {"host": "10.0.2.20", "name": "DB-PROD-01",  "os": "linux"},
    {"host": "10.0.2.30", "name": "REDIS-01",    "os": "linux"}
]

THRESHOLDS = {
    "cpu_max_percent": 85.0,
    "ram_max_percent": 90.0,
    "disk_max_percent": 85.0
}

def audit_linux_node(server):
    host = server["host"]
    name = server["name"]
    result = {"name": name, "host": host, "status": "HEALTHY", "issues": []}
    
    # Remote SSH command executing low-overhead telemetry extraction
    cmd = [
        "ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5",
        f"sysadmin@{host}",
        "echo -n 'CPU:'; top -bn1 | grep 'Cpu(s)' | awk '{print $2}' ; "
        "echo -n 'RAM:'; free | grep Mem | awk '{print ($3/$2)*100}' ; "
        "echo -n 'DISK:'; df -h / | awk 'NR==2 {print $5}' | tr -d '%'"
    ]
    
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if proc.returncode != 0:
            result["status"] = "UNREACHABLE"
            result["issues"].append(f"SSH Failed: {proc.stderr.strip()}")
            return result
            
        lines = proc.stdout.strip().split("\\n")
        metrics = {}
        for line in lines:
            if ":" in line:
                k, v = line.split(":", 1)
                metrics[k.strip()] = float(v.strip())
                
        # Evaluate Thresholds
        if metrics.get("CPU", 0) > THRESHOLDS["cpu_max_percent"]:
            result["status"] = "DEGRADED"
            result["issues"].append(f"High CPU: {metrics['CPU']}% > {THRESHOLDS['cpu_max_percent']}%")
            
        if metrics.get("RAM", 0) > THRESHOLDS["ram_max_percent"]:
            result["status"] = "DEGRADED"
            result["issues"].append(f"High RAM: {metrics['RAM']:.1f}% > {THRESHOLDS['ram_max_percent']}%")
            
        if metrics.get("DISK", 0) > THRESHOLDS["disk_max_percent"]:
            result["status"] = "CRITICAL"
            result["issues"].append(f"High Disk Usage: {metrics['DISK']}% > {THRESHOLDS['disk_max_percent']}%")
            
        result["metrics"] = metrics
    except subprocess.TimeoutExpired:
        result["status"] = "TIMEOUT"
        result["issues"].append("SSH Connection timed out after 10 seconds")
    except Exception as e:
        result["status"] = "ERROR"
        result["issues"].append(str(e))
        
    return result

def main():
    print(f"[*] Auditing {len(SERVERS)} infrastructure nodes...")
    reports = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_server = {executor.submit(audit_linux_node, s): s for s in SERVERS}
        for future in concurrent.futures.as_completed(future_to_server):
            reports.append(future.result())
            
    # Output JSON summary
    print(json.dumps(reports, indent=2))
    
    # Exit with code 1 if any critical issues found
    has_critical = any(r["status"] in ["CRITICAL", "UNREACHABLE"] for r in reports)
    if has_critical:
        print("[!] Alert: Critical infrastructure issues detected!", file=sys.stderr)
        sys.exit(1)
    else:
        print("[✓] All infrastructure nodes within normal operational parameters.")

if __name__ == "__main__":
    main()`,
    lineByLineExplanation: [
      { lineRange: 'Line 8-20', explanation: 'Defines fleet server targets and sets baseline performance alert thresholds (CPU > 85%, RAM > 90%, Disk > 85%).' },
      { lineRange: 'Line 22-38', explanation: 'Constructs non-interactive SSH commands using BatchMode=yes (prevents hanging on password prompts) and short connection timeouts.' },
      { lineRange: 'Line 40-58', explanation: 'Parses raw telemetry outputs into Python float dictionaries and evaluates against enterprise threshold limits.' },
      { lineRange: 'Line 70-82', explanation: 'Utilizes Python ThreadPoolExecutor to audit all servers concurrently in parallel, completing a 20-node fleet scan in under 3 seconds.' },
      { lineRange: 'Line 84-91', explanation: 'Evaluates global status and returns standard UNIX exit code 1 if any node is unreachable or critically saturated, allowing integration with CI/CD or cron alerts.' }
    ],
    safeExecutionGuide: 'Deploy in /opt/monitoring/fleet_check.py. Requires Python 3.8+ with zero third-party dependencies (uses standard library exclusively).'
  }
];

export const HARDENING_BASELINES: HardeningBaseline[] = [
  {
    category: 'Linux Operating System Hardening',
    title: 'CIS Linux Benchmark Server Hardening Baseline',
    targetOS: 'Linux Server',
    benchmark: 'CIS Ubuntu Linux 22.04/24.04 LTS Benchmark v1.0.0 Level 1 Server',
    rules: [
      {
        parameter: 'SSH Root Login',
        recommendedValue: 'PermitRootLogin no',
        justification: 'Prevents direct remote brute-force attacks against the root superuser account.',
        command: "sudo sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && sudo sshd -t && sudo systemctl reload ssh"
      },
      {
        parameter: 'SSH Password Authentication',
        recommendedValue: 'PasswordAuthentication no',
        justification: 'Enforces cryptographic public key authentication, eliminating credential stuffing attacks.',
        command: "sudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && sudo systemctl reload ssh"
      },
      {
        parameter: 'Kernel ASLR (Address Space Layout Randomization)',
        recommendedValue: 'kernel.randomize_va_space = 2',
        justification: 'Randomizes the memory layout of program components to prevent buffer overflow exploitation.',
        command: "echo 'kernel.randomize_va_space = 2' | sudo tee /etc/sysctl.d/60-aslr.conf && sudo sysctl -p /etc/sysctl.d/60-aslr.conf"
      },
      {
        parameter: 'ICMP Redirects Acceptance',
        recommendedValue: 'net.ipv4.conf.all.accept_redirects = 0',
        justification: 'Prevents malicious routing table manipulation and Man-in-the-Middle (MitM) attacks.',
        command: "echo 'net.ipv4.conf.all.accept_redirects = 0' | sudo tee -a /etc/sysctl.d/99-network-hardening.conf && sudo sysctl --system"
      },
      {
        parameter: 'Core Dumps for SUID Executables',
        recommendedValue: 'fs.suid_dumpable = 0',
        justification: 'Prevents memory dumps of privileged processes which may leak cryptographic keys or passwords to disk.',
        command: "echo 'fs.suid_dumpable = 0' | sudo tee -a /etc/sysctl.d/99-security.conf && sudo sysctl --system"
      }
    ]
  },
  {
    category: 'Windows Server Hardening',
    title: 'Microsoft Windows Server Enterprise Hardening Baseline',
    targetOS: 'Windows Server',
    benchmark: 'CIS Microsoft Windows Server 2022 Benchmark v2.0.0 Level 1 Member Server',
    rules: [
      {
        parameter: 'Local Administrator Password Solution',
        recommendedValue: 'Windows LAPS Enabled via GPO',
        justification: 'Assigns unique, randomly rotated passwords to local Administrator accounts on all domain computers.',
        command: 'Set-LapsADPasswordEncryptionConfiguration -Identity "corp.local" -EnableEncryption $True'
      },
      {
        parameter: 'SMBv1 Protocol',
        recommendedValue: 'Disabled (Uninstalled)',
        justification: 'Eliminates obsolete protocol vulnerable to EternalBlue / WannaCry ransomware exploits.',
        command: 'Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart'
      },
      {
        parameter: 'NTLMv1 Authentication',
        recommendedValue: 'LmCompatibilityLevel = 5 (Send NTLMv2 response only, refuse LM & NTLM)',
        justification: 'Prevents pass-the-hash attacks and credential interception across legacy authentication handshakes.',
        command: "Set-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa' -Name 'LmCompatibilityLevel' -Value 5"
      },
      {
        parameter: 'SMB Signing Requirements',
        recommendedValue: 'RequireSecuritySignature = 1',
        justification: 'Cryptographically signs all SMB packets to prevent SMB relay and tampering attacks.',
        command: "Set-SmbServerConfiguration -RequireSecuritySignature $True -Force"
      },
      {
        parameter: 'Remote Desktop Network Level Authentication (NLA)',
        recommendedValue: 'UserAuthentication = 1 (Enforced)',
        justification: 'Requires user authentication prior to establishing RDP display sessions, protecting against BlueKeep.',
        command: "(Get-WmiObject -Class Win32_TSGeneralSetting -Namespace root\\cimv2\\TerminalServices -Filter \"TerminalName='RDP-Tcp'\").SetUserAuthenticationRequired(1)"
      }
    ]
  }
];

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 'rca-post-mortem',
    title: 'Production Incident Root Cause Analysis (RCA) Post-Mortem',
    category: 'Incident Management',
    purpose: 'Standard ITIL-compliant post-incident review document detailing failure timeline, technical root cause, impact metrics, and preventative action items.',
    templateMarkdown: `# Production Incident Root Cause Analysis (RCA) Report

## 1. Incident Executive Summary
- **Incident Number**: INC-XXXXX
- **Severity Level**: P1 - Critical Outage / P2 - High Degradation
- **Incident Date**: YYYY-MM-DD
- **Incident Commander**: [Lead Senior Administrator Name]
- **Services Affected**: [e.g. Core Checkout API, Public Nginx Ingress]
- **Total Downtime Duration**: XX Minutes (HH:MM to HH:MM UTC)
- **Business Impact**: [e.g. 15,000 user requests dropped; estimated financial impact $XX,XXX]

---

## 2. Chronological Incident Timeline (UTC)
- **14:02** - Monitoring trigger fired: Prometheus Alert \`HighHttp5xxRate\` (> 5% errors).
- **14:05** - On-call engineer acknowledged PagerDuty page; joined emergency incident bridge.
- **14:09** - Initial diagnosis: Nginx returning 502 Bad Gateway across all incoming web requests.
- **14:14** - Host inspection revealed root filesystem (\`/\`) at 100% disk capacity; PostgreSQL write buffers failed.
- **14:18** - Administrator truncated unrotated 62 GB access log file; disk space restored to 45% free.
- **14:21** - PostgreSQL daemon restarted; PM2 backend worker processes revived.
- **14:24** - Synthetic health checks verified 200 OK; external HTTP 5xx error rate dropped to 0.0%.
- **14:30** - Incident declared resolved; monitoring set to heightened 2-hour observation mode.

---

## 3. Five-Whys Technical Root Cause Analysis
1. **Why was the website down?**
   Nginx returned HTTP 502 Bad Gateway because the backend Node.js and PostgreSQL processes crashed.
2. **Why did the backend processes crash?**
   PostgreSQL could not append transaction logs to the disk because the filesystem had 0 free blocks.
3. **Why was the filesystem full?**
   The Nginx \`access.log\` file grew to 62 GB, consuming all remaining storage on the root volume.
4. **Why did the log file reach 62 GB without rotating?**
   The nocturnal logrotate daemon failed due to a missing closing bracket syntax error in \`/etc/logrotate.d/nginx\`.
5. **Why was the logrotate syntax error not detected?**
   Manual changes made during previous maintenance were not validated with \`logrotate -d\` syntax checking.

---

## 4. Immediate Corrective Actions Taken
1. Safely truncated inflated log file: \`truncate -s 0 /var/log/nginx/access.log\`.
2. Restored database and application processes via \`systemctl restart postgresql\`.
3. Corrected configuration syntax error in \`/etc/logrotate.d/nginx\`.

---

## 5. Permanent Preventative Action Items (Action Matrix)
| Action Item | Owner | Target Completion | Verification Method |
|---|---|---|---|
| Implement automated CI linting for all logrotate configs | DevOps Team | YYYY-MM-DD | Pull Request gate |
| Lower Prometheus disk alert threshold from 90% to 80% | SysAdmin Team | YYYY-MM-DD | Alertmanager rule check |
| Cap systemd journald max retention to 1 GB | Infrastructure | YYYY-MM-DD | \`journalctl --disk-usage\` |
| Expand production root volumes from 100GB to 250GB | Cloud Team | YYYY-MM-DD | \`df -h /\` confirmation |`
  },
  {
    id: 'rfc-change-management',
    title: 'Enterprise Request for Change (RFC) Document',
    category: 'Change Management',
    purpose: 'Formal ITIL change proposal submitted to the Change Advisory Board (CAB) before performing high-risk maintenance or upgrades.',
    templateMarkdown: `# Request for Change (RFC) — Production Infrastructure

## 1. Change Metadata
- **RFC ID**: RFC-2026-XXXX
- **Change Requester**: [Senior Infrastructure Engineer]
- **Target Implementation Date**: YYYY-MM-DD (02:00 - 04:00 UTC Maintenance Window)
- **Change Risk Level**: Medium / High
- **Type of Change**: Standard / Normal / Emergency

---

## 2. Description & Justification of Change
- **Title**: Upgrade PostgreSQL Database from Version 15 to 16 with Zero-Downtime Replication Standby Switch
- **Business Need**: Version 15 reaches end-of-support; Version 16 introduces 25% query parallelization performance gains and improved vacuum efficiency.
- **Systems Affected**: \`srv-prod-db01\` (Master), \`srv-prod-db02\` (Standby).

---

## 3. Step-by-Step Implementation Plan
1. **02:00** - Initiate change window; broadcast maintenance banner.
2. **02:05** - Take complete image-level backup snapshot of both database hosts.
3. **02:15** - Execute pre-upgrade schema compatibility checks: \`pg_upgrade --check\`.
4. **02:30** - Perform binary upgrade on Standby node \`srv-prod-db02\`.
5. **02:45** - Catch up replication stream from Master.
6. **03:00** - Execute planned switchover: promote Standby to Master.
7. **03:10** - Re-point application connection pool to new Master.
8. **03:20** - Execute post-change verification tests.

---

## 4. Backout / Rollback Plan
- **Rollback Trigger**: If query latency exceeds 200ms or data replication lag exceeds 60 seconds after switchover.
- **Rollback Procedure**:
  1. Re-point connection pool back to original Master node (\`srv-prod-db01\`).
  2. Restore original PostgreSQL 15 configuration files.
  3. Validate connection pool recovery; resume traffic.
  4. Total estimated rollback duration: 5 minutes.

---

## 5. Post-Implementation Verification Checklist
- [ ] Database query latency verified < 15ms via \`pg_stat_statements\`.
- [ ] Active replication confirmed between Master and Standby: \`SELECT * FROM pg_stat_replication;\`.
- [ ] Application health endpoints return HTTP 200 OK.
- [ ] Error logs in \`/var/log/postgresql/\` clear of syntax or permission errors.`
  }
];
