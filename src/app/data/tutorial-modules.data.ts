export interface TutorialChapter {
  id: string;
  chapterNumber: number;
  title: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  summary: string;
  coreConcepts: string[];
  architectureContext: string;
  stepByStepGuide: {
    step: number;
    title: string;
    description: string;
    commands: string;
    explanation: string;
  }[];
  configurationFiles: {
    fileName: string;
    path: string;
    content: string;
    notes: string;
  }[];
  portsAndFirewall: { port: string; service: string; rule: string }[];
  verificationCommands: { command: string; expectedOutput: string; meaning: string }[];
  productionHardening: string[];
  troubleshootingScenarios: { symptom: string; rootCause: string; resolution: string }[];
  handsOnLab: {
    objective: string;
    tasks: string[];
    validationCheck: string;
  };
}

export const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 'core-os-foundations',
    chapterNumber: 1,
    title: 'Windows Server 2022/2025 Core & Enterprise Linux Server Administration',
    badgeColor: 'teal',
    summary: 'Master headless server operating system installation, storage partition layouts, static network binding, package management repositories, and secure remote administration using PowerShell Remoting (WinRM over HTTPS) and OpenSSH keys.',
    coreConcepts: [
      'Server Core vs Desktop Experience: why production servers run headless to eliminate GUI attack surfaces',
      'Linux Filesystem Hierarchy Standard (FHS): /etc, /var, /opt, /usr, /dev, /proc, /sys',
      'Linux user, group, and permission model: root, sudoers, chmod octal (755, 644, 600), chown',
      'Package management: apt (Debian/Ubuntu), dnf/rpm (RHEL/Rocky), repository pinning, unattended security upgrades',
      'Encrypted remote administration: WinRM HTTPS listener configuration and OpenSSH Ed25519 public key authentication'
    ],
    architectureContext: 'This foundational layer underpins every server role in the enterprise. Web servers, database nodes, directory services, and container clusters all require deterministic IP addresses, hardened remote shell access, and secure OS package baselines.',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Windows Server Core Network Configuration via PowerShell',
        description: 'Configure static IP address, subnet mask, default gateway, and DNS resolvers on Windows Server Core.',
        commands: `# Identify network adapter index
Get-NetAdapter | Select-Object Name, InterfaceIndex, Status, MacAddress

# Assign Static IPv4 Address
New-NetIPAddress -InterfaceIndex 1 -IPAddress 192.168.10.10 -PrefixLength 24 -DefaultGateway 192.168.10.1

# Configure DNS Client Resolvers
Set-DnsClientServerAddress -InterfaceIndex 1 -ServerAddresses "192.168.10.10", "1.1.1.1"

# Rename Host and Restart
Rename-Computer -NewName "SRV-WIN-01" -Restart`,
        explanation: 'New-NetIPAddress binds static routing parameters immediately without requiring GUI Network Connections wizard. PrefixLength 24 corresponds to 255.255.255.0.'
      },
      {
        step: 2,
        title: 'Configure WinRM over HTTPS for Headless PowerShell Remoting',
        description: 'Generate self-signed certificate, bind WS-Management HTTPS listener, and open Windows Firewall port 5986.',
        commands: `# Create Certificate for WinRM HTTPS
$Cert = New-SelfSignedCertificate -DnsName "SRV-WIN-01" -CertStoreLocation Cert:\\LocalMachine\\My

# Create HTTPS WinRM Listener
New-Item -Path WSMan:\\LocalHost\\Listener -Transport HTTPS -Address * -CertificateThumbPrint $Cert.Thumbprint -Force

# Open Port 5986 in Windows Advanced Firewall
New-NetFirewallRule -Name "WinRM-HTTPS-In" -DisplayName "Windows Remote Management (HTTPS-In)" -Profile Any -LocalPort 5986 -Protocol TCP -Action Allow`,
        explanation: 'Secures remote PowerShell sessions across unencrypted subnets or public networks using TLS encryption on port 5986 instead of plaintext HTTP port 5985.'
      },
      {
        step: 3,
        title: 'Ubuntu Server Enterprise Baseline & SSH Key Lockdown',
        description: 'Harden SSH daemon to permit only elliptic-curve Ed25519 keys, disable root login, and activate UFW firewall.',
        commands: `# Update package repositories and install essentials
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw fail2ban htop net-tools

# Configure UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 22/tcp comment 'Rate-limited SSH'
sudo ufw --force enable

# Harden SSH Daemon Configuration
sudo tee /etc/ssh/sshd_config.d/99-hardened.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
X11Forwarding no
EOF

# Validate syntax and reload SSH
sudo sshd -t && sudo systemctl reload ssh`,
        explanation: 'PermitRootLogin no and PasswordAuthentication no completely neutralize automated credential dictionary attacks by requiring private key possession.'
      }
    ],
    configurationFiles: [
      {
        fileName: '99-hardened.conf',
        path: '/etc/ssh/sshd_config.d/99-hardened.conf',
        content: `PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
X11Forwarding no
AllowGroups sysadmins`,
        notes: 'Restricts remote logins to users belonging to the sysadmins group using authorized public keys.'
      }
    ],
    portsAndFirewall: [
      { port: '22 / TCP', service: 'OpenSSH Server', rule: 'Allow inbound from management subnets only' },
      { port: '5986 / TCP', service: 'WinRM over HTTPS', rule: 'Allow inbound for remote PowerShell administration' },
      { port: 'ICMP Echo', service: 'Ping / MTU Discovery', rule: 'Allow inbound for diagnostic monitoring' }
    ],
    verificationCommands: [
      {
        command: 'Test-NetConnection -ComputerName 192.168.10.10 -Port 5986',
        expectedOutput: 'TcpTestSucceeded : True',
        meaning: 'Validates that Windows Server WinRM HTTPS listener is active and accepting connections.'
      },
      {
        command: 'ssh -i ~/.ssh/id_ed25519 sysadmin@192.168.10.50 "uname -a"',
        expectedOutput: 'Linux srv-linux-01 ... x86_64 GNU/Linux',
        meaning: 'Confirms passwordless key-based SSH authentication succeeds.'
      }
    ],
    productionHardening: [
      'Disable Server Desktop Experience on all Windows servers unless an application explicitly requires a local GUI',
      'Never allow DHCP on servers; always configure static IP bindings and document in IPAM',
      'Enforce automatic security patching via unattended-upgrades on Linux and WSUS GPOs on Windows',
      'Deploy fail2ban to dynamically ban repeat failed SSH connections'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'SSH connection refused when connecting to newly provisioned Linux server.',
        rootCause: 'UFW firewall enabled without allowing port 22, or sshd daemon crashed due to syntax error.',
        resolution: 'Log in via hypervisor virtual console, check "sudo systemctl status ssh" and verify "sudo ufw status".'
      },
      {
        symptom: 'Enter-PSSession to Windows Server Core fails with "WinRM cannot process the request".',
        rootCause: 'WinRM service stopped, or certificate thumbprint in HTTPS listener does not match host name.',
        resolution: 'Run "winrm enumerate winrm/config/listener" from local command prompt to verify listener binding.'
      }
    ],
    handsOnLab: {
      objective: 'Deploy one Windows Server 2022 Core instance and one Ubuntu Server 24.04 LTS instance, assign static IP addresses on private virtual switch, establish remote management, and verify zero unauthorized listening ports.',
      tasks: [
        'Set static IP 192.168.10.10 on Windows Server Core and configure WinRM HTTPS on port 5986',
        'Set static IP 192.168.10.50 on Ubuntu Server, configure UFW, and install Ed25519 SSH keys',
        'Execute remote inventory query from management workstation using PowerShell and SSH CLI'
      ],
      validationCheck: 'Execute "Enter-PSSession -ComputerName 192.168.10.10 -UseSSL" and "ssh sysadmin@192.168.10.50" successfully without passwords.'
    }
  },
  {
    id: 'systemd-storage-lvm',
    chapterNumber: 2,
    title: 'Linux systemd Architecture, Storage Management & LVM',
    badgeColor: 'teal',
    summary: 'Master Linux service lifecycle orchestration with systemd, custom service unit creation, journald log querying, disk partitioning (GPT/parted), Logical Volume Manager (LVM) volume creation and online expansion, and /etc/fstab persistence.',
    coreConcepts: [
      'systemd architecture: units (.service, .socket, .target, .timer), dependency graphs (After=, Requires=, Wants=)',
      'Service lifecycle: systemctl start, stop, restart, reload, enable, disable, mask, status',
      'Logging with systemd-journald: journalctl filtering by unit, priority, boot identifier, and time windows',
      'Disk partition styles: MBR vs GPT, partition management with fdisk and parted',
      'Logical Volume Manager (LVM): Physical Volumes (PV), Volume Groups (VG), Logical Volumes (LV), thin-provisioning',
      'Filesystems: Ext4 vs XFS features, mount options (noatime, nodiratime), and /etc/fstab UUID bindings'
    ],
    architectureContext: 'Modern microservices and enterprise databases require automated daemon recovery, resource cgroup caps (MemoryMax, CPUQuota), and the ability to expand disk partitions live without server reboots or downtime.',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Create a Resilient Production systemd Service Unit',
        description: 'Build a production service unit with auto-restart on failure, cgroup memory limits, and sandbox isolation.',
        commands: `# Write service file to /etc/systemd/system/corp-api.service:
sudo tee /etc/systemd/system/corp-api.service << 'EOF'
[Unit]
Description=Corporate API Backend Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/corp-api
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5s

# Security Sandboxing
ProtectSystem=full
ProtectHome=true
NoNewPrivileges=true
PrivateTmp=true

# Resource Limits (cgroups v2)
MemoryMax=2G
CPUQuota=200%

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start service
sudo systemctl daemon-reload
sudo systemctl enable corp-api.service
sudo systemctl start corp-api.service`,
        explanation: 'ProtectSystem=full mounts /usr, /boot, and /etc as read-only for the process. MemoryMax=2G prevents the process from exhausting host RAM if a memory leak occurs.'
      },
      {
        step: 2,
        title: 'Initialize LVM Physical Volume, Volume Group & Logical Volume',
        description: 'Initialize a secondary virtual disk (/dev/sdb), create an LVM Volume Group, and format an Ext4 volume.',
        commands: `# 1. Initialize physical disk as LVM Physical Volume
sudo pvcreate /dev/sdb

# 2. Create Volume Group named "vg_data"
sudo vgcreate vg_data /dev/sdb

# 3. Create 50GB Logical Volume named "lv_appdata"
sudo lvcreate -L 50G -n lv_appdata vg_data

# 4. Format with Ext4 filesystem
sudo mkfs.ext4 -L "APPDATA" /dev/vg_data/lv_appdata

# 5. Create mount point and mount volume
sudo mkdir -p /data/appdata
sudo mount /dev/vg_data/lv_appdata /data/appdata

# 6. Verify with lvs and df -h
sudo lvs && df -h /data/appdata`,
        explanation: 'LVM abstracts physical hard drives into flexible storage pools, allowing filesystems to span multiple disks and resize dynamically.'
      },
      {
        step: 3,
        title: 'Configure Permanent Filesystem Persistence in /etc/fstab',
        description: 'Identify filesystem UUID and append persistent entry to /etc/fstab with optimized mount options.',
        commands: `# Extract UUID of the logical volume
UUID=$(sudo blkid -s UUID -o value /dev/vg_data/lv_appdata)

# Append entry to /etc/fstab using UUID
echo "UUID=\${UUID}  /data/appdata  ext4  defaults,noatime,nofail  0  2" | sudo tee -a /etc/fstab

# Test /etc/fstab mounting without rebooting
sudo umount /data/appdata
sudo mount -a
df -h /data/appdata`,
        explanation: 'Always mount by UUID rather than device path (/dev/sdb1) because device paths can change across reboots. "noatime" eliminates unnecessary disk write overhead for file reads.'
      },
      {
        step: 4,
        title: 'Perform Live Online LVM Volume Expansion',
        description: 'Expand the logical volume and resize the underlying filesystem without stopping running services.',
        commands: `# Extend Logical Volume by 20GB and resize filesystem in a single atomic command (-r):
sudo lvextend -r -L +20G /dev/vg_data/lv_appdata

# Verify expanded capacity:
df -h /data/appdata`,
        explanation: 'The "-r" flag instructs lvextend to automatically invoke resize2fs (Ext4) or xfs_growfs (XFS) while the filesystem is mounted and actively serving live traffic.'
      }
    ],
    configurationFiles: [
      {
        fileName: 'corp-api.service',
        path: '/etc/systemd/system/corp-api.service',
        content: `[Unit]
Description=Corporate API Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=appuser
ExecStart=/usr/bin/node /opt/corp-api/server.js
Restart=always
RestartSec=5s
MemoryMax=2G
ProtectSystem=full

[Install]
WantedBy=multi-user.target`,
        notes: 'Hardened systemd unit file with automatic crash restart and 2GB cgroup memory ceiling.'
      }
    ],
    portsAndFirewall: [
      { port: 'Internal IPC', service: 'systemd D-Bus', rule: 'Internal local socket /run/systemd/private' }
    ],
    verificationCommands: [
      {
        command: 'systemctl is-active corp-api.service',
        expectedOutput: 'active',
        meaning: 'Confirms daemon is running in background.'
      },
      {
        command: 'sudo vgs && sudo lvs',
        expectedOutput: 'Shows vg_data and lv_appdata with allocated gigabytes',
        meaning: 'Confirms LVM volume group and logical volume are intact and mapped.'
      }
    ],
    productionHardening: [
      'Always use "mount -a" to test /etc/fstab edits before rebooting to prevent recovery mode boot halts',
      'Configure SystemMaxUse=1G in /etc/systemd/journald.conf to prevent journal logs from consuming disk partitions',
      'Apply cgroup memory limits on all custom daemons to safeguard against kernel Out-Of-Memory (OOM) panics'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Server boots into emergency recovery mode with "Failed to mount /data/appdata".',
        rootCause: 'Typo in /etc/fstab or missing disk UUID.',
        resolution: 'Edit /etc/fstab in emergency console, comment out offending line, run "mount -a" to verify, and reboot.'
      },
      {
        symptom: 'systemctl restart service hangs indefinitely for 90 seconds.',
        rootCause: 'Daemon ignores SIGTERM signal and systemd waits for TimeoutStopSec (default 90s) before sending SIGKILL.',
        resolution: 'Set TimeoutStopSec=15s in service unit and update application code to handle SIGTERM gracefully.'
      }
    ],
    handsOnLab: {
      objective: 'Create a custom systemd service, initialize an LVM volume on a secondary virtual disk, mount it persistently with noatime, and perform an online expansion of 10GB under active file writing.',
      tasks: [
        'Attach a 20GB virtual hard drive to your Linux VM',
        'Configure LVM PV, VG, and LV formatted with Ext4 mounted at /data/storage',
        'Add UUID entry to /etc/fstab and test with umount / mount -a',
        'Expand the volume by 5GB live using lvextend -r'
      ],
      validationCheck: 'Run "df -hT /data/storage" and verify expanded capacity is active without any filesystem corruption.'
    }
  },
  {
    id: 'active-directory-mastery',
    chapterNumber: 3,
    title: 'Active Directory Domain Services (AD DS) & Enterprise Identity',
    badgeColor: 'coral',
    summary: 'Design and deploy enterprise Active Directory infrastructure: Forest and Domain planning, Domain Controller promotion via PowerShell, Organizational Unit (OU) tiering architecture, bulk user and security group administration, Kerberos authentication handshakes, and LDAP directory lookups.',
    coreConcepts: [
      'AD DS logical architecture: Forests, Domains, Domain Trees, Organizational Units (OUs), and Schema',
      'Physical architecture: Domain Controllers, Global Catalog servers, Active Directory Sites & Subnets',
      'Active Directory security groups: Global Groups, Domain Local Groups, Universal Groups, and AGDLP nesting standard',
      'Authentication protocols: Kerberos v5 (Ticket Granting Ticket / TGS), LDAP over SSL (LDAPS: 636), NTLMv2 fallback',
      'Service Accounts: Group Managed Service Accounts (gMSA) eliminating manual service password rotations'
    ],
    architectureContext: 'Active Directory is the enterprise identity backbone. When configured correctly, it governs single sign-on authentication, access permissions, and centralized policy enforcement across thousands of physical servers, VMs, and workstations.',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Install AD DS Role and Promote Root Domain Controller',
        description: 'Deploy Active Directory Domain Services role and initialize a new Active Directory forest using PowerShell.',
        commands: `# Install AD DS and RSAT Tools
Install-WindowsFeature -Name AD-Domain-Services, RSAT-AD-Tools -IncludeManagementTools

# Promote Server to Domain Controller (Creates Forest: corp.local)
$SecureDSRM = ConvertTo-SecureString "EnterpriseSafeModePassword987!" -AsPlainText -Force
Install-ADDSForest -DomainName "corp.local" \`
                  -DomainNetbiosName "CORP" \`
                  -InstallDns:$True \`
                  -SafeModeAdministratorPassword $SecureDSRM \`
                  -NoRebootOnCompletion:$False \`
                  -Force`,
        explanation: 'Install-ADDSForest automates directory partition creation, schema instantiation, and DNS SRV record registration, rebooting the server into a fully operational Domain Controller.'
      },
      {
        step: 2,
        title: 'Implement Enterprise AGDLP Role-Based OU Hierarchy',
        description: 'Build standardized Organizational Unit schema based on Microsoft Tiered Administration guidelines.',
        commands: `# Create Base Enterprise OU Container
New-ADOrganizationalUnit -Name "Enterprise" -Path "DC=corp,DC=local" -ProtectedFromAccidentalDeletion $True

# Create Functional Sub-OUs
$SubOUs = @("Tier-0_Admins", "Tier-1_Servers", "Tier-2_Workstations", "Departments", "Service_Accounts", "Security_Groups")
foreach ($ou in $SubOUs) {
    New-ADOrganizationalUnit -Name $ou -Path "OU=Enterprise,DC=corp,DC=local" -ProtectedFromAccidentalDeletion $True
}

# Create Department OUs
$Depts = @("Finance", "Human_Resources", "Engineering", "Marketing", "Executive")
foreach ($d in $Depts) {
    New-ADOrganizationalUnit -Name $d -Path "OU=Departments,OU=Enterprise,DC=corp,DC=local"
}`,
        explanation: 'Separating Tier-0 (Domain Controllers/Admins), Tier-1 (Application Servers), and Tier-2 (End-user Workstations) prevents lateral movement attacks across the network.'
      },
      {
        step: 3,
        title: 'Provision Group Managed Service Account (gMSA)',
        description: 'Configure KDS Root Key and provision a Group Managed Service Account for automated password rotation.',
        commands: `# Add KDS Root Key (Immediate in test lab; effective in 10h in prod replication)
Add-KdsRootKey -EffectiveImmediately

# Create gMSA for IIS / SQL Application
New-ADServiceAccount -Name "gMSA_AppPool" \`
                     -DNSHostName "gMSA_AppPool.corp.local" \`
                     -PrincipalsAllowedToRetrieveManagedPassword "SRV-IIS-01$"

# On target host (SRV-IIS-01):
# Install-ADServiceAccount -Identity "gMSA_AppPool"
# Test-ADServiceAccount -Identity "gMSA_AppPool"`,
        explanation: 'gMSAs eliminate hardcoded service account passwords. Windows automatically rotates the 128-character password every 30 days without requiring service restarts.'
      }
    ],
    configurationFiles: [
      {
        fileName: 'ou-structure.json',
        path: 'C:\\Automation\\ou-structure.json',
        content: `{
  "Forest": "corp.local",
  "BaseOU": "OU=Enterprise,DC=corp,DC=local",
  "Tiers": ["Tier-0_Admins", "Tier-1_Servers", "Tier-2_Workstations"],
  "Departments": ["Finance", "Human_Resources", "Engineering", "Marketing"]
}`,
        notes: 'Declarative OU configuration structure used for automated provisioning scripts.'
      }
    ],
    portsAndFirewall: [
      { port: '88 / TCP & UDP', service: 'Kerberos Authentication', rule: 'Mandatory for domain logins and ticket granting' },
      { port: '389 / TCP & UDP', service: 'LDAP Directory Queries', rule: 'Standard LDAP communication' },
      { port: '636 / TCP', service: 'LDAP over SSL (LDAPS)', rule: 'Secure encrypted directory queries' },
      { port: '445 / TCP', service: 'SMB File & Group Policy', rule: 'GPO template download from SYSVOL' },
      { port: '135 / TCP', service: 'RPC EndPoint Mapper', rule: 'Required for inter-DC replication and management' }
    ],
    verificationCommands: [
      {
        command: 'dcdiag /v /test:Replication',
        expectedOutput: 'Passed test Replication',
        meaning: 'Verifies directory partition replication is error-free.'
      },
      {
        command: 'nltest /dsgetdc:corp.local',
        expectedOutput: 'DC: \\\\DC-01.corp.local, Address: 192.168.10.10',
        meaning: 'Confirms domain client successfully locates authoritative DC via DNS SRV.'
      }
    ],
    productionHardening: [
      'Enable Active Directory Recycle Bin (Enable-ADOptionalFeature) to restore accidentally deleted accounts in seconds',
      'Deploy Windows LAPS to manage random local administrator passwords on all domain-joined computers',
      'Never install third-party software, web servers, or file shares on a Domain Controller',
      'Disable SMBv1 and enforce SMB signing on all Domain Controllers'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Client fails to join domain with "The specified domain either does not exist or could not be contacted".',
        rootCause: 'Client is using external DNS (e.g. 8.8.8.8) instead of the Domain Controller DNS IP.',
        resolution: 'Set primary DNS on client network adapter to Domain Controller IP (192.168.10.10).'
      },
      {
        symptom: 'User login fails with "The time between the client and server is different".',
        rootCause: 'Kerberos strictly rejects time drift exceeding 5 minutes to prevent replay attacks.',
        resolution: 'Resync client clock with DC: "w32tm /resync /force" and check host hypervisor time sync settings.'
      }
    ],
    handsOnLab: {
      objective: 'Promote Windows Server 2022 to Domain Controller for corp.local, create tiered OU structure, bulk-provision 10 users with department groups, and join a Windows client machine.',
      tasks: [
        'Install AD DS and DNS roles and execute Install-ADDSForest via PowerShell',
        'Create Enterprise OU hierarchy with Finance and Engineering sub-OUs',
        'Join test client machine to domain and verify Kerberos ticket generation with klist'
      ],
      validationCheck: 'Run "klist" on joined client to confirm TGT ticket issued by DC-01.'
    }
  },
  {
    id: 'group-policy-hardening',
    chapterNumber: 4,
    title: 'Group Policy Management (GPO) & Server Fleet Hardening',
    badgeColor: 'coral',
    summary: 'Design, configure, and troubleshoot enterprise Group Policy: processing order (LSDOU), WMI filtering, security filtering, loopback processing, CIS security baseline deployment, automated drive and printer mappings, and gpresult diagnostic triage.',
    coreConcepts: [
      'Group Policy processing order: Local, Site, Domain, Organizational Unit (LSDOU) inheritance rules',
      'Policy enforcement: Enforced (No Override), Block Inheritance, and Loopback Processing Mode (Replace vs Merge)',
      'Filtering mechanisms: Security Filtering (Delegation tab) and WMI Queries (e.g., filter by OS architecture or battery state)',
      'Group Policy Preferences (GPP): Drive mappings, shortcut creation, registry modifications, local user management',
      'Diagnostic tools: gpupdate /force, gpresult /h report.html, rsop.msc, Event Viewer GroupPolicy channel'
    ],
    architectureContext: 'Group Policy is the primary configuration management engine for Windows enterprise fleets. A single policy modification instantly distributes password complexity, firewall rules, and audit configurations to 10,000 computers.',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Create and Link a Central CIS Security Baseline GPO',
        description: 'Create an Active Directory Group Policy Object enforcing password standards and account lockouts.',
        commands: `# Create new GPO in Active Directory
$GPO = New-GPO -Name "CIS-Baseline-AccountSecurity" -Comment "Enforces password complexity and lockout rules"

# Link GPO to Domain Root
New-GPLink -Name "CIS-Baseline-AccountSecurity" -Target "DC=corp,DC=local" -LinkOrder 1

# Configure Password Policy using secedit or GPMC:
# - Minimum password length: 14 characters
# - Password complexity: Enabled
# - Account lockout threshold: 5 invalid attempts
# - Account lockout duration: 30 minutes`,
        explanation: 'Linking the policy at the domain level enforces consistent password standards across all departmental sub-OUs.'
      },
      {
        step: 2,
        title: 'Create WMI Filter for Windows Server Only Targets',
        description: 'Build a WMI filter that applies specific server policies only to machines running Windows Server OS.',
        commands: `# WMI Query checking ProductType:
# ProductType 1 = Workstation, ProductType 2 = Domain Controller, ProductType 3 = Member Server
$WmiQuery = "SELECT * FROM Win32_OperatingSystem WHERE ProductType = '2' OR ProductType = '3'"

# Create WMI Filter via PowerShell ActiveDirectory / GroupPolicy module
# Or in GPMC: New WMI Filter -> Name: "Windows Servers Only" -> Query: $WmiQuery`,
        explanation: 'WMI filters evaluate local hardware and OS attributes at boot, ensuring server-specific hardening never breaks workstation desktops.'
      },
      {
        step: 3,
        title: 'Troubleshoot and Generate HTML Diagnostic Report',
        description: 'Force policy synchronization on client workstation and export complete HTML diagnostic audit.',
        commands: `# Force immediate Group Policy update
gpupdate /force

# Generate detailed HTML audit report
gpresult /h C:\\Automation\\GPO_Report.html

# View summary directly in terminal
gpresult /r`,
        explanation: 'gpresult /h produces an exhaustive HTML matrix showing exactly which GPOs won, which policies were denied due to security filtering, and individual registry setting states.'
      }
    ],
    configurationFiles: [
      {
        fileName: 'cis-passwords.inf',
        path: 'C:\\Windows\\security\\templates\\cis-passwords.inf',
        content: `[System Access]
MinimumPasswordAge = 1
MaximumPasswordAge = 60
MinimumPasswordLength = 14
PasswordComplexity = 1
PasswordHistorySize = 24
LockoutBadCount = 5
ResetLockoutCount = 30
LockoutDuration = 30`,
        notes: 'Security template syntax applying CIS benchmark password and lockout baselines.'
      }
    ],
    portsAndFirewall: [
      { port: '445 / TCP', service: 'SMB File Sharing', rule: 'Required for clients to read GPO templates from \\\\corp.local\\SYSVOL' },
      { port: '389 / TCP', service: 'LDAP', rule: 'Required to query Active Directory GPO container attributes' }
    ],
    verificationCommands: [
      {
        command: 'gpresult /r | findstr /i "Applied"',
        expectedOutput: 'Lists applied GPOs including CIS-Baseline-AccountSecurity',
        meaning: 'Validates that policy successfully passed security filtering and applied to the client.'
      }
    ],
    productionHardening: [
      'Never store passwords in Group Policy Preferences (MS14-025 vulnerability); use Windows LAPS instead',
      'Avoid setting "Block Inheritance" unless absolutely required; it obfuscates policy hierarchies and complicates troubleshooting',
      'Configure central Event Log audit policies via GPO to log Event ID 4625 (Logon Failure) and Event ID 4720 (User Created)'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'GPO linked to OU does not apply to users inside that OU.',
        rootCause: 'Policy contains Computer Configuration settings but is linked to an OU containing only User objects (or vice-versa).',
        resolution: 'Verify whether policy settings are Computer-based or User-based, and move targets or link policy to correct OU.'
      },
      {
        symptom: 'gpupdate fails with "The processing of Group Policy failed. Windows could not read the file gpt.ini".',
        rootCause: 'SYSVOL replication failed between Domain Controllers, or client cannot access \\\\domain\\sysvol via SMB.',
        resolution: 'Test UNC access: "dir \\\\corp.local\\sysvol", check DNS resolution, and verify DFS Replication service health.'
      }
    ],
    handsOnLab: {
      objective: 'Create a GPO that restricts USB storage access, maps network drive Z: to departmental file share, applies policy via security filtering to Engineering group, and validates with gpresult.',
      tasks: [
        'Create GPO "Engineering-DriveMapping" with GPP Drive Map pointing to \\\\DC-01\\Engineering',
        'Enforce USB media restriction under Administrative Templates > System > Removable Storage Access',
        'Verify drive Z: appears on domain client and USB drives are blocked'
      ],
      validationCheck: 'Run "gpresult /h report.html" on client; verify Engineering-DriveMapping is listed under Applied GPOs.'
    }
  },
  {
    id: 'enterprise-dns-dhcp',
    chapterNumber: 5,
    title: 'Enterprise DNS Server, DHCP Scopes & Network Core Services',
    badgeColor: 'sky',
    summary: 'Configure mission-critical network services: Windows & Linux DNS servers, forward/reverse lookup zones, conditional forwarders, dynamic updates, scavenging, DHCP scopes, exclusion ranges, static reservations, option 003/006/015, and DHCP failover clustering.',
    coreConcepts: [
      'DNS resolution tree: Root hints, Authoritative servers, Recursive queries, Caching, TTL limits',
      'DNS record types: A, AAAA, CNAME, MX, PTR, TXT, SRV, SOA, and NS records',
      'DNS scavenging: automatic cleanup of stale dynamic records to prevent IP collision bloat',
      'DHCP DORA process: Discover (broadcast), Offer (unicast/broadcast), Request, Acknowledge',
      'DHCP options: Option 003 (Router / Default Gateway), Option 006 (DNS Servers), Option 015 (Domain Search Name)',
      'DHCP Failover: Load Balance mode (50/50 split) vs Hot Standby mode for high availability'
    ],
    architectureContext: 'DNS and DHCP are the foundational network core services. Without DNS, Active Directory authentication, domain joining, internet browsing, and API discovery immediately fail. DHCP automates dynamic IP provisioning across hundreds of VLANs.',
    stepByStepGuide: [
      {
        step: 1,
        title: 'Configure Active Directory Integrated DNS Zone & Forwarders',
        description: 'Create forward and reverse lookup zones and configure upstream root forwarders.',
        commands: `# Configure Reverse Lookup Zone (192.168.10.0/24)
Add-DnsServerPrimaryZone -NetworkId "192.168.10.0/24" -ReplicationScope "Forest"

# Add Static A and PTR Records
Add-DnsServerResourceRecordA -Name "portal" -ZoneName "corp.local" -IPv4Address "192.168.10.50" -CreatePtr

# Set External Upstream Forwarders (Cloudflare & Google DNS)
Set-DnsServerForwarder -IPAddress "1.1.1.1", "8.8.8.8"

# Enable Automated Stale Record Scavenging (7-day intervals)
Set-DnsServerScavenging -ScavengingInterval 7.00:00:00 -ScavengingState $True`,
        explanation: 'Active Directory integrated zones store DNS records directly within the AD database (ntds.dit), providing automatic multi-master replication and Kerberos-authenticated dynamic updates.'
      },
      {
        step: 2,
        title: 'Configure Production DHCP Scope with Enterprise Options',
        description: 'Deploy DHCP server role, define pool boundaries, set lease times, and configure scope options.',
        commands: `# Install DHCP Server Role
Install-WindowsFeature -Name DHCP -IncludeManagementTools

# Authorize DHCP Server in Active Directory
Add-DhcpServerInDC -DnsName "dc01.corp.local" -IPAddress 192.168.10.10

# Create DHCP Scope (192.168.10.100 - 192.168.10.200)
Add-DhcpServerv4Scope -Name "Workstations-VLAN10" \`
                      -StartRange 192.168.10.100 \`
                      -EndRange 192.168.10.200 \`
                      -SubnetMask 255.255.255.0 \`
                      -LeaseDuration 8.00:00:00 \`
                      -State Active

# Configure Essential DHCP Options
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -OptionId 3 -Value "192.168.10.1"      # Default Gateway
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -OptionId 6 -Value "192.168.10.10"     # DNS Server
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -OptionId 15 -Value "corp.local"       # Domain Name`,
        explanation: 'Authorizing in Active Directory prevents unauthorized rogue DHCP servers from answering client requests and causing widespread IP conflicts.'
      },
      {
        step: 3,
        title: 'Deploy High-Availability DHCP Failover Partnership',
        description: 'Configure active-active load balance failover between primary and secondary Domain Controllers.',
        commands: `# Configure Failover Partnership with Secondary DC (10.0.10.11)
Add-DhcpServerv4Failover -Name "DC01-DC02-Failover" \`
                         -ScopeId 192.168.10.0 \`
                         -PartnerServer "10.0.10.11" \`
                         -Mode LoadBalance \`
                         -LoadBalancePercent 50 \`
                         -SharedSecret "EnterpriseSecretSync123#" \`
                         -AutoStateTransition $True \`
                         -StateSwitchInterval 01:00:00`,
        explanation: 'LoadBalance mode shares active leasing 50/50. If one DC dies, the partner server assumes 100% of the lease scope automatically.'
      }
    ],
    configurationFiles: [
      {
        fileName: 'named.conf.options',
        path: '/etc/bind/named.conf.options',
        content: `options {
    directory "/var/cache/bind";
    recursion yes;
    allow-recursion { 192.168.0.0/16; 127.0.0.1; };
    forwarders {
        1.1.1.1;
        8.8.8.8;
    };
    dnssec-validation auto;
    listen-on { 192.168.10.50; 127.0.0.1; };
};`,
        notes: 'Linux BIND9 DNS server configuration restricting recursive queries to private corporate subnets.'
      }
    ],
    portsAndFirewall: [
      { port: '53 / UDP & TCP', service: 'DNS Service', rule: 'Allow inbound for queries (UDP) and zone transfers (TCP)' },
      { port: '67 / UDP', service: 'DHCP Server Inbound', rule: 'Allow broadcast and unicast DHCP requests' },
      { port: '68 / UDP', service: 'DHCP Client Inbound', rule: 'Allow DHCP offers to clients' }
    ],
    verificationCommands: [
      {
        command: 'Resolve-DnsName -Name portal.corp.local -Server 192.168.10.10',
        expectedOutput: 'Name: portal.corp.local, IP4Address: 192.168.10.50',
        meaning: 'Confirms authoritative DNS resolution succeeds.'
      },
      {
        command: 'Get-DhcpServerv4Lease -ScopeId 192.168.10.0',
        expectedOutput: 'Lists active client leases with MAC and Hostname',
        meaning: 'Confirms DHCP server is actively issuing leases.'
      }
    ],
    productionHardening: [
      'Enable DHCP Snooping on managed network switches to physically block unauthorized rogue DHCP servers',
      'Disable DNS Recursion on public-facing DNS servers to prevent DNS amplification DDoS attacks',
      'Configure DNS scavenging on all dynamic zones to eliminate ghost records from decommissioned machines'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Workstations intermittently receive IP 192.168.1.x with wrong gateway and lose internet.',
        rootCause: 'An employee connected an unauthorized consumer Wi-Fi router running a rogue DHCP server.',
        resolution: 'Locate rogue MAC via switch ARP tables, disable port, and enable switch DHCP Snooping.'
      },
      {
        symptom: 'DNS server fails to resolve external internet domains, but resolves internal domains fine.',
        rootCause: 'DNS Forwarders are missing or blocked by the corporate perimeter firewall.',
        resolution: 'Verify forwarder IPs (1.1.1.1) and check firewall drop logs for outbound port 53 UDP traffic.'
      }
    ],
    handsOnLab: {
      objective: 'Configure an authoritative DNS zone corp.local with A and PTR records, create an active DHCP scope with gateway and DNS options, and verify lease issuance on a client machine.',
      tasks: [
        'Add DNS A record api.corp.local -> 192.168.10.80 with automatic PTR pointer',
        'Create DHCP scope 192.168.10.100-200 with option 3 (Router) and option 6 (DNS)',
        'Release and renew IP on client with ipconfig /renew; verify DNS resolution using nslookup'
      ],
      validationCheck: 'Execute "nslookup api.corp.local" on client; verify it returns 192.168.10.80 from local DNS server.'
    }
  }
];
