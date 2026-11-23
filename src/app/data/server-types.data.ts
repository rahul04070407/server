export interface ServerTypeItem {
  id: number;
  name: string;
  category: 'Compute & Virtualization' | 'Web & Application' | 'Database & Cache' | 'Identity & Directory' | 'Network Services & Edge' | 'Messaging, Storage & Backup' | 'Observability & Operations';
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky' | 'purple';
  purpose: string;
  architectureRole: string;
  defaultPorts: string[];
  keyConfigSnippet: string;
  securityHardening: string;
  troubleshootingTip: string;
  interServerCommunication: string;
}

export const SERVER_TYPES_DATA: ServerTypeItem[] = [
  {
    id: 1,
    name: 'Physical Server (Bare-Metal)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Dedicated rack-mount hardware (e.g. Dell PowerEdge, HPE ProLiant) providing maximum raw computing power without hypervisor virtualization overhead.',
    architectureRole: 'Hosts high-performance hypervisors, massive SQL Server/Oracle clusters, or extreme low-latency financial processing engines.',
    defaultPorts: ['IPMI / iDRAC: 443, 623/UDP', 'SNMP: 161/UDP'],
    keyConfigSnippet: `# Configure Dell iDRAC / HPE iLO out-of-band management IP
racadm set NIC.1.IPv4.Address 192.168.100.10
racadm set NIC.1.IPv4.Netmask 255.255.255.0
racadm set NIC.1.IPv4.Gateway 192.168.100.1`,
    securityHardening: 'Isolate iDRAC/iLO on a dedicated, non-routable management VLAN. Enforce complex IPMI passwords, disable IPMI over LAN cipher suite 0, and enable HTTPS TLS 1.3.',
    troubleshootingTip: 'Use IPMI / iDRAC system event log (SEL) to detect ECC memory correctable errors, failing redundant power supplies (PSUs), or RAID controller battery degradation before system crashes occur.',
    interServerCommunication: 'Communicates via dual 10G/25G SFP+ bonded NICs (LACP 802.3ad) to Top-of-Rack (ToR) switches for redundancy and SAN fabric via Fibre Channel or iSCSI.'
  },
  {
    id: 2,
    name: 'Virtual Server (Virtual Machine / Guest VM)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Software-emulated machine executing an isolated guest OS on top of a hypervisor, maximizing physical hardware utilization and workload portability.',
    architectureRole: 'Forms 90%+ of all enterprise application, web, and internal database servers, enabling rapid snapshots, live migrations, and automated disaster recovery.',
    defaultPorts: ['RDP: 3389/TCP', 'SSH: 22/TCP', 'Hyper-V VMBus / VirtIO internal'],
    keyConfigSnippet: `# PowerShell Hyper-V VM Creation
New-VM -Name "PROD-APP-01" -MemoryStartupBytes 8GB -Generation 2 -NewVHDPath "D:\\VMs\\PROD-APP-01.vhdx" -NewVHDSizeBytes 100GB -SwitchName "V-Switch-Corporate"`,
    securityHardening: 'Enable virtual TPM 2.0 (vTPM), enable Secure Boot, and disable virtual floppy/serial ports. Never share hypervisor root credentials with VM guest administrators.',
    troubleshootingTip: 'Check for CPU ready time (>5% in ESXi or % Guest Run Time in Hyper-V) indicating CPU overcommitment, where the hypervisor cannot schedule vCPUs across physical cores.',
    interServerCommunication: 'Transfers packets through hypervisor Virtual Switches to physical NICs or directly across virtual internal switches at memory bus speeds (10-40 Gbps).'
  },
  {
    id: 3,
    name: 'Windows Server',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Microsoft enterprise server OS designed for centralized enterprise management, Active Directory domain infrastructure, and .NET/IIS enterprise web applications.',
    architectureRole: 'Acts as the identity, authentication, group policy, and corporate file storage backbone for enterprise Windows endpoints and corporate back-offices.',
    defaultPorts: ['SMB: 445/TCP', 'WinRM: 5985/5986', 'RDP: 3389/TCP', 'RPC: 135/TCP'],
    keyConfigSnippet: `# Configure Windows Server Baseline via PowerShell
Install-WindowsFeature -Name FS-FileServer, RSAT-AD-PowerShell
Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name "fDenyTSConnections" -Value 0`,
    securityHardening: 'Enforce Microsoft Security Compliance Toolkit CIS GPO benchmarks. Enable Credential Guard, disable NTLMv1 and SMBv1, and require SMB signing on all shares.',
    troubleshootingTip: 'Query Windows Event Log via PowerShell: Get-WinEvent -FilterHashtable @{LogName="System"; Level=1,2; StartTime=(Get-Date).AddHours(-4)} to isolate critical kernel faults.',
    interServerCommunication: 'Uses SMB, Kerberos, LDAP, RPC, and WinRM to coordinate domain operations with Domain Controllers and administrative consoles.'
  },
  {
    id: 4,
    name: 'Linux Server (Ubuntu / RHEL / Rocky)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Open-source, highly stable POSIX-compliant server OS powering enterprise web apps, microservices, databases, containers, and cloud native architectures.',
    architectureRole: 'Primary operating system for modern production web tiers, API gateways, Redis caches, PostgreSQL clusters, and Docker/Kubernetes worker nodes.',
    defaultPorts: ['SSH: 22/TCP', 'HTTP/HTTPS: 80, 443'],
    keyConfigSnippet: `# Standardize Linux Enterprise Baseline
sudo timedatectl set-timezone UTC
sudo hostnamectl set-hostname srv-prod-app01.corp.internal
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.d/99-sysctl.conf && sudo sysctl -p /etc/sysctl.d/99-sysctl.conf`,
    securityHardening: 'Lock down SSH with Ed25519 public keys, disable root password login, enforce UFW/Firewalld, enable SELinux (enforcing) or AppArmor, and deploy auditd.',
    troubleshootingTip: 'Use "journalctl -xeu <service> --no-pager" to inspect crashing daemons, and "dmesg -T | grep -i oom" to detect if the Linux Out-Of-Memory Killer killed high-RAM processes.',
    interServerCommunication: 'Communicates via SSH, REST APIs, gRPC, PostgreSQL wire protocol, and Redis protocol over TLS across private network VLANs.'
  },
  {
    id: 5,
    name: 'Web Server',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Handles incoming HTTP/HTTPS requests, serves static client assets (HTML, CSS, JS, images), and terminates TLS connections from client browsers.',
    architectureRole: 'Serves Angular/React Single Page Applications directly to users and acts as the public-facing entry point for user requests.',
    defaultPorts: ['HTTP: 80/TCP', 'HTTPS: 443/TCP', 'HTTP/3: 443/UDP (QUIC)'],
    keyConfigSnippet: `# Nginx Web Server configuration for Angular SPA
server {
    listen 443 ssl http2;
    server_name portal.company.com;
    root /var/www/angular-app;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}`,
    securityHardening: 'Disable HTTP methods other than GET, POST, HEAD, PUT, DELETE. Configure strict security headers: Content-Security-Policy, X-Frame-Options: DENY, and HSTS.',
    troubleshootingTip: 'Inspect HTTP 4xx/5xx status distribution in access logs: awk \'{print $9}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn to spot automated scraping or 500 errors.',
    interServerCommunication: 'Receives traffic from edge firewalls and load balancers, then proxies application requests to backend application servers via internal private IPs.'
  },
  {
    id: 6,
    name: 'Application Server',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Executes core server-side business logic, data validation, transactions, and API endpoints (Node.js, Spring Boot, .NET Core, Python Django).',
    architectureRole: 'Separates public web presentation from core application business rules, processing requests received from reverse proxies.',
    defaultPorts: ['Node.js: 3000/TCP', 'Spring Boot: 8080/TCP', 'ASP.NET: 5000/TCP'],
    keyConfigSnippet: `# systemd service for Spring Boot JAR
[Unit]
Description=Enterprise Core API Service
After=syslog.target network.target postgresql.service

[Service]
User=appuser
ExecStart=/usr/bin/java -Xms2048m -Xmx4096m -jar /opt/corp-api/app.jar
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`,
    securityHardening: 'Run processes under non-root unprivileged service accounts. Pass secrets via secure environment files with chmod 600 or HashiCorp Vault. Restrict JVM memory bounds.',
    troubleshootingTip: 'Analyze thread dumps (jcmd <pid> Thread.print) during application freezes to detect database connection pool deadlocks or infinite loops.',
    interServerCommunication: 'Connects to Database Servers via JDBC/Connection Pools (5432/1433) and Cache Servers (Redis 6379) over private backend VLANs.'
  },
  {
    id: 7,
    name: 'Database Server',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Provides persistent, ACID-compliant structured data storage, indexing, transactions, and high-performance querying.',
    architectureRole: 'Houses the company single source of truth for customer records, financial transactions, product catalogs, and audit ledgers.',
    defaultPorts: ['PostgreSQL: 5432/TCP', 'MSSQL: 1433/TCP', 'MySQL: 3306/TCP', 'Oracle: 1521/TCP'],
    keyConfigSnippet: `# PostgreSQL postgresql.conf Memory & Connection Tuning
shared_buffers = 4GB
work_mem = 64MB
maintenance_work_mem = 512MB
effective_cache_size = 12GB
max_connections = 150`,
    securityHardening: 'Never bind database listeners to 0.0.0.0; bind strictly to private internal IP. Require TLS encryption for all wire connections. Rotate DB credentials automatically.',
    troubleshootingTip: 'Identify blocking locks in PostgreSQL: SELECT pid, query, state, age(clock_timestamp(), query_start) FROM pg_stat_activity WHERE state != \'idle\' ORDER BY 4 DESC;',
    interServerCommunication: 'Accepts queries from Application Servers and replicates transaction logs (WAL / Always On) to standby replica database servers over dedicated replication links.'
  },
  {
    id: 8,
    name: 'File Server',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Provides shared network file access, departmental collaboration directories, and centralized file storage using SMB / CIFS and NFS protocols.',
    architectureRole: 'Hosts company department shares (Finance, HR, Engineering) with granular NTFS permissions, quotas, and shadow copies.',
    defaultPorts: ['SMB: 445/TCP', 'NetBIOS: 139/TCP', 'NFS: 2049/TCP'],
    keyConfigSnippet: `# PowerShell Create SMB Share with Granular Access
New-SmbShare -Name "Finance" -Path "D:\\Shares\\Finance" -FullAccess "Domain Admins" -ChangeAccess "Finance-Dept-SG" -EncryptData $True`,
    securityHardening: 'Enable SMB Encryption (-EncryptData $True), enforce Access-Based Enumeration (ABE) so users cannot see folders they lack permissions to, and disable SMBv1.',
    troubleshootingTip: 'Identify locked open files preventing user edits using "Get-SmbOpenFile | Where-Object Path -like \'*budget*\'" and close offending handles with Close-SmbOpenFile.',
    interServerCommunication: 'Authenticates user Kerberos tickets against Active Directory Domain Controllers before granting file handles to Windows/Mac/Linux clients.'
  },
  {
    id: 9,
    name: 'Storage Server',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Dedicated high-capacity storage appliance or OS (e.g. TrueNAS CORE, Windows Storage Server) managing dense arrays of SAS/NVMe drives.',
    architectureRole: 'Supplies block storage LUNs via iSCSI or file exports to hypervisors, database hosts, and backup repositories.',
    defaultPorts: ['iSCSI: 3260/TCP', 'NFS: 2049/TCP', 'Management HTTPS: 443'],
    keyConfigSnippet: `# Targetcli iSCSI LUN Export on Linux
targetcli /backstores/block create name=lun0 dev=/dev/sdb1
targetcli /iscsi create iqn.2026-11.corp.storage:target01
targetcli /iscsi/iqn.2026-11.corp.storage:target01/tpg1/luns create /backstores/block/lun0`,
    securityHardening: 'Configure CHAP (Challenge Handshake Authentication Protocol) authentication for iSCSI initiators and place storage traffic on a dedicated, non-routable SAN VLAN.',
    troubleshootingTip: 'Check SMART telemetry: smartctl -a /dev/sda | grep -E "Reallocated|Pending|Uncorrectable" to identify failing sectors before complete drive death.',
    interServerCommunication: 'Streams raw block data to Hyper-V and ESXi hypervisor hosts over dual dedicated 10G iSCSI network adapters.'
  },
  {
    id: 10,
    name: 'DNS Server (Domain Name System)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Translates human-readable domain names (portal.corp.local) into computer-routable IP addresses (192.168.10.25).',
    architectureRole: 'The absolute backbone of corporate networking and Active Directory. Without DNS, Active Directory authentication, domain joining, and internet lookups completely collapse.',
    defaultPorts: ['DNS: 53/TCP (Zone Transfers/Large Records), 53/UDP (Queries)'],
    keyConfigSnippet: `# PowerShell Windows DNS Server Record Creation
Add-DnsServerResourceRecordA -Name "api" -ZoneName "corp.local" -IPv4Address "192.168.10.30" -CreatePtr
Set-DnsServerForwarder -IPAddress "1.1.1.1", "8.8.8.8"`,
    securityHardening: 'Disable DNS recursion on public-facing DNS servers to prevent DNS amplification DDoS attacks. Enable DNSSEC and configure Response Rate Limiting (RRL).',
    troubleshootingTip: 'Use "dig +trace portal.corp.local @192.168.10.10" or "Resolve-DnsName -Name dc01.corp.local -Server 192.168.10.10" to pinpoint authoritative resolution failures.',
    interServerCommunication: 'Queried by every server, client, and container on startup for resolving service hostnames and locating Active Directory domain controllers via SRV records.'
  },
  {
    id: 11,
    name: 'DHCP Server (Dynamic Host Configuration Protocol)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Automatically assigns IP addresses, subnet masks, default gateways, and DNS server options to network devices upon connection.',
    architectureRole: 'Eliminates IP conflicts and manual network configuration for hundreds of employee workstations, laptops, and VoIP phones across office subnets.',
    defaultPorts: ['DHCP Server: 67/UDP', 'DHCP Client: 68/UDP'],
    keyConfigSnippet: `# PowerShell Add DHCP Scope with Enterprise Options
Add-DhcpServerv4Scope -Name "Workstations-VLAN20" -StartRange 192.168.20.50 -EndRange 192.168.20.200 -SubnetMask 255.255.255.0 -State Active
Set-DhcpServerv4OptionValue -ScopeId 192.168.20.0 -Router 192.168.20.1 -DnsServer 192.168.10.10, 192.168.10.11 -DnsDomain "corp.local"`,
    securityHardening: 'Enable DHCP Snooping on managed network switches to block unauthorized rogue DHCP servers. Authorize DHCP servers in Active Directory before they are permitted to service clients.',
    troubleshootingTip: 'Check DHCP scope statistics: Get-DhcpServerv4ScopeStatistics to verify free address percentage. If scope exhaustion reaches 100%, reduce lease times from 8 days to 8 hours.',
    interServerCommunication: 'Receives DORA broadcasts forwarded across VLAN boundaries by core router DHCP Relay agents (ip helper-address).'
  },
  {
    id: 12,
    name: 'Active Directory Server (AD DS)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'Stores directory data and manages user accounts, computers, organizational units, and enterprise security policies across the company.',
    architectureRole: 'Central enterprise identity store. Every corporate login, permission check, and workstation security policy originates from Active Directory.',
    defaultPorts: ['Kerberos: 88/TCP/UDP', 'LDAP: 389/TCP/UDP', 'LDAPS: 636/TCP', 'Global Catalog: 3268/TCP', 'SMB: 445/TCP'],
    keyConfigSnippet: `# PowerShell Install AD DS Forest
Install-ADDSForest -DomainName "corp.local" -SafeModeAdministratorPassword $SecurePassword -InstallDns:$True -NoRebootOnCompletion:$False`,
    securityHardening: 'Deploy Microsoft LAPS (Local Administrator Password Solution), enforce Tiered Administration (Tier 0, 1, 2 isolation), and disable obsolete NTLMv1/LAN Manager protocols.',
    troubleshootingTip: 'Run "dcdiag /v /c /d /e" to execute comprehensive health tests on Active Directory directory services, DNS registrations, and replication consistency.',
    interServerCommunication: 'Replicates directory changes bi-directionally with peer Domain Controllers and validates Kerberos tickets for file servers, SQL servers, and workstations.'
  },
  {
    id: 13,
    name: 'Authentication Server (RADIUS / Keycloak)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'Validates user identity credentials, multifactor authentication (MFA) tokens, and issues signed security tokens (OAuth2/OIDC/SAML).',
    architectureRole: 'Acts as the central authentication clearinghouse for enterprise VPN logins, corporate 802.1X Wi-Fi access, and web application Single Sign-On (SSO).',
    defaultPorts: ['RADIUS Auth: 1812/UDP', 'RADIUS Accounting: 1813/UDP', 'Keycloak HTTPS: 8443/TCP'],
    keyConfigSnippet: `# Keycloak Docker Deployment with Postgres DB
docker run -d --name keycloak -p 8443:8443 -e KC_DB=postgres -e KC_DB_URL=jdbc:postgresql://db:5432/keycloak -e KEYCLOAK_ADMIN=admin quay.io/keycloak/keycloak start`,
    securityHardening: 'Enforce FIDO2 / WebAuthn hardware security keys, TOTP MFA, and rate limit authentication attempts to prevent automated credential stuffing.',
    troubleshootingTip: 'Inspect FreeRADIUS debug log: freeradius -X to view live PAP/MS-CHAPv2 authentication handshakes and see exactly why user credentials failed validation.',
    interServerCommunication: 'Queries Active Directory or LDAP backends over LDAPS (636) to verify user passwords before issuing Kerberos/JWT tokens to applications.'
  },
  {
    id: 14,
    name: 'LDAP Server (OpenLDAP / 389 Directory)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'Provides hierarchical directory storage optimized for lightning-fast reading and searching of user attributes, groups, and contact directories.',
    architectureRole: 'Serves user directory lookups for Linux servers, Git servers, Jenkins CI/CD, and internal intranet portals.',
    defaultPorts: ['LDAP: 389/TCP', 'LDAPS (SSL): 636/TCP'],
    keyConfigSnippet: `# Query LDAP directory from command line
ldapsearch -x -H ldaps://ldap.corp.local:636 -b "dc=corp,dc=local" "(sAMAccountName=john.doe)" mail memberOf`,
    securityHardening: 'Strictly disable unencrypted LDAP (port 389) and enforce StartTLS or LDAPS (port 636) to prevent plaintext password sniffing across the network.',
    troubleshootingTip: 'Test SSL certificate handshake: openssl s_client -connect ldap.corp.local:636 -showcerts to verify CA trust and expiration dates.',
    interServerCommunication: 'Provides read-only identity queries to GitLab, Jenkins, Nextcloud, and Linux PAM authentication modules.'
  },
  {
    id: 15,
    name: 'Domain Controller (DC)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'A Windows Server holding an Active Directory database copy, responding to authentication requests and enforcing security policies.',
    architectureRole: 'Authenticates users, distributes Group Policy Objects (GPOs), holds FSMO roles, and syncs directory state with other DCs.',
    defaultPorts: ['Kerberos: 88', 'LDAP: 389', 'RPC EndPoint Mapper: 135', 'SMB: 445', 'DNS: 53'],
    keyConfigSnippet: `# Verify FSMO Role Holders via PowerShell
Get-ADDomainController -Filter * | Select-Object Name, IPv4Address, IsGlobalCatalog, OperationMasterRoles
netdom query fsmo`,
    securityHardening: 'Never use a Domain Controller as a general-purpose server (do not install IIS, file sharing, or third-party software on a DC). Restrict RDP access strictly to Tier-0 PAWs.',
    troubleshootingTip: 'Check replication health: repadmin /replsummary and repadmin /showrepl * /errorsonly to catch failing AD replication partners before tombstone lifetime expires.',
    interServerCommunication: 'Replicates directory changes every 15 seconds intra-site using RPC/DRSUAPI with peer Domain Controllers.'
  },
  {
    id: 16,
    name: 'IIS Server (Internet Information Services)',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Microsoft’s enterprise web server engine tightly integrated with Windows Server, ASP.NET Core, and Active Directory.',
    architectureRole: 'Hosts enterprise corporate web applications, .NET web APIs, SharePoint, and corporate Angular Single Page Applications on Windows.',
    defaultPorts: ['HTTP: 80/TCP', 'HTTPS: 443/TCP'],
    keyConfigSnippet: `# Configure IIS Application Pool & Site via PowerShell
New-WebAppPool -Name "AngularAppPool"
Set-ItemProperty -Path "IIS:\\AppPools\\AngularAppPool" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
New-Website -Name "CompanyPortal" -Port 443 -PhysicalPath "C:\\inetpub\\portal" -ApplicationPool "AngularAppPool" -Ssl`,
    securityHardening: 'Isolate each website into its own dedicated Application Pool. Remove HTTP response headers revealing IIS version (Server: Microsoft-IIS/10.0) via URL Rewrite outbound rules.',
    troubleshootingTip: 'Check the Application Event Log for Event ID 5002 / 5011 indicating rapid-fail protection triggered when an AppPool crashed 5 times within 5 minutes.',
    interServerCommunication: 'Communicates with backend SQL Servers via .NET connection strings (1433) and queries Active Directory for Windows Integrated Authentication (Kerberos).'
  },
  {
    id: 17,
    name: 'Nginx Server',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'High-performance, event-driven web server, reverse proxy, and HTTP cache capable of handling 50,000+ concurrent connections per node.',
    architectureRole: 'Frontend edge ingress router, static asset server for Angular/React, and TLS termination proxy for Node.js and Spring Boot applications.',
    defaultPorts: ['HTTP: 80/TCP', 'HTTPS: 443/TCP'],
    keyConfigSnippet: `# High-Performance Nginx Core Settings (/etc/nginx/nginx.conf)
worker_processes auto;
worker_rlimit_nofile 65535;
events {
    worker_connections 10240;
    use epoll;
    multi_accept on;
}`,
    securityHardening: 'Configure server_tokens off; to hide Nginx version numbers. Enforce rate limiting with limit_req_zone to defend against DDoS attacks and brute-force scanners.',
    troubleshootingTip: 'Always run "sudo nginx -t" before reloading the service. Inspect error.log: tail -f /var/log/nginx/error.log to diagnose upstream connection refused errors.',
    interServerCommunication: 'Receives public HTTPS traffic from internet clients and proxies HTTP requests to internal application servers on 127.0.0.1:3000 or 10.0.1.50:8080.'
  },
  {
    id: 18,
    name: 'Apache HTTP Server (httpd)',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Battle-tested modular web server supporting dynamic module loading (mod_php, mod_rewrite, mod_ssl) and .htaccess decentralized directory overrides.',
    architectureRole: 'Hosts PHP enterprise applications, legacy web portals, and custom modules requiring Apache-specific handlers.',
    defaultPorts: ['HTTP: 80/TCP', 'HTTPS: 443/TCP'],
    keyConfigSnippet: `# Apache VirtualHost Configuration
<VirtualHost *:443>
    ServerName app.corp.local
    DocumentRoot /var/www/html/app
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/app.crt
    SSLCertificateKeyFile /etc/ssl/private/app.key
</VirtualHost>`,
    securityHardening: 'Set ServerTokens Prod and ServerSignature Off. Disable AllowOverride None in root directory to prevent malicious .htaccess overrides.',
    troubleshootingTip: 'Check Apache syntax errors with "apachectl configtest". Monitor worker threads using mod_status (/server-status) to spot thread exhaustion.',
    interServerCommunication: 'Talks to MySQL/MariaDB database servers (3306) and local PHP-FPM sockets (/run/php/php8.2-fpm.sock).'
  },
  {
    id: 19,
    name: 'Reverse Proxy Server',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Sits in front of backend web/app servers, intercepting client requests, terminating SSL, caching responses, and shielding backend topologies.',
    architectureRole: 'Single entry point for corporate domains, hiding internal private network topology and distributing traffic to microservices.',
    defaultPorts: ['HTTPS: 443/TCP', 'HTTP: 80/TCP'],
    keyConfigSnippet: `# Nginx Reverse Proxy Block
location /api/ {
    proxy_pass http://10.0.2.15:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`,
    securityHardening: 'Block sensitive backend endpoints (/actuator, /admin, /.env) at the reverse proxy level before traffic ever touches backend application servers.',
    troubleshootingTip: 'HTTP 502 Bad Gateway means the reverse proxy cannot connect to backend host (service is down or firewall blocked port). HTTP 504 means backend timed out.',
    interServerCommunication: 'Translates external public internet requests into secure internal private network requests routed to application servers.'
  },
  {
    id: 20,
    name: 'Load Balancer (HAProxy / AWS ALB)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Evenly distributes incoming network and application traffic across multiple backend servers to prevent server overload and ensure high availability.',
    architectureRole: 'Ensures zero downtime: if an application server dies, the load balancer instantly redirects all subsequent requests to healthy instances.',
    defaultPorts: ['HTTP: 80', 'HTTPS: 443', 'Stats: 8404'],
    keyConfigSnippet: `# HAProxy Backend Configuration with Health Checks
frontend web_front
    bind *:443 ssl crt /etc/haproxy/certs/site.pem
    default_backend web_servers

backend web_servers
    balance roundrobin
    cookie SERVERID insert indirect nocache
    server app01 10.0.1.10:8080 check inter 2000 rise 2 fall 3
    server app02 10.0.1.11:8080 check inter 2000 rise 2 fall 3`,
    securityHardening: 'Lock down HAProxy management stats socket to localhost. Configure SSL session tickets and disable insecure cipher suites (SSLv3, TLS 1.0, 1.1).',
    troubleshootingTip: 'Inspect live backend health states via HAProxy CSV stats socket: echo "show stat" | socat stdio /var/run/haproxy.sock to see downed backends.',
    interServerCommunication: 'Continuously sends periodic HTTP GET /healthz probes to backend application servers every 2 seconds to confirm operational readiness.'
  },
  {
    id: 21,
    name: 'Proxy Server (Forward Proxy / Squid)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Acts as an intermediary for internal client machines requesting external internet resources, providing web caching, URL filtering, and auditing.',
    architectureRole: 'Enforces corporate internet usage policies, blocks malicious phishing websites, and inspects employee outbound web traffic for malware.',
    defaultPorts: ['Proxy Port: 3128/TCP, 8080/TCP'],
    keyConfigSnippet: `# Squid Proxy ACL Rule (/etc/squid/squid.conf)
acl localnet src 192.168.0.0/16
acl blocked_sites dstdomain "/etc/squid/blocked_domains.txt"
http_access deny blocked_sites
http_access allow localnet
http_port 3128`,
    securityHardening: 'Strictly prohibit open relay proxying; restrict proxy access solely to authenticated corporate subnet IP ranges.',
    troubleshootingTip: 'Tail access log: tail -f /var/log/squid/access.log | grep TCP_DENIED to diagnose legitimate business traffic being blocked by aggressive proxy filters.',
    interServerCommunication: 'Intercepts outbound web requests from internal client workstations and fetches web content from external internet web servers.'
  },
  {
    id: 22,
    name: 'Mail Server (Postfix / Exchange / Dovecot)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Receives, routes, and delivers electronic mail messages between senders and recipients using SMTP, IMAP, and POP3 protocols.',
    architectureRole: 'Provides enterprise internal email routing, automated system alert notifications, and user mailbox storage.',
    defaultPorts: ['SMTP: 25/TCP', 'Submission: 587/TCP', 'SMTPS: 465/TCP', 'IMAP: 143/TCP', 'IMAPS: 993/TCP'],
    keyConfigSnippet: `# Postfix main.cf Essential Settings
myhostname = mail.corp.local
mydomain = corp.local
myorigin = $mydomain
inet_interfaces = all
mynetworks = 127.0.0.0/8, 192.168.10.0/24
smtpd_tls_security_level = may`,
    securityHardening: 'Configure SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC DNS TXT records. Never configure an open SMTP relay.',
    troubleshootingTip: 'Check mail queue: "mailq" or "postqueue -p". Flush queued emails with "postfix flush" and inspect delivery rejections in /var/log/mail.log.',
    interServerCommunication: 'Receives monitoring alerts from Prometheus/Alertmanager and routes transactional notification emails to employee inboxes.'
  },
  {
    id: 23,
    name: 'FTP / SFTP Server (OpenSSH / vsftpd)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Provides encrypted, authenticated bulk file transfers between remote systems and corporate backends using the SSH File Transfer Protocol (SFTP).',
    architectureRole: 'Facilitates batch data ingestion, vendor file drops, EDI order processing, and automated nocturnal database backup shipping.',
    defaultPorts: ['SFTP: 22/TCP (SSH)', 'FTPS: 990/TCP + passive ports'],
    keyConfigSnippet: `# Chroot SFTP Configuration in /etc/ssh/sshd_config
Match Group sftpusers
    ChrootDirectory /data/sftp/%u
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no
    PasswordAuthentication yes`,
    securityHardening: 'Completely eliminate legacy plaintext FTP (port 21). Chroot SFTP users into their home directories so they cannot browse root system files.',
    troubleshootingTip: 'Ensure Chroot directory is owned by root with 755 permissions: "chown root:root /data/sftp/vendor && chmod 755 /data/sftp/vendor"; otherwise sshd will reject the login.',
    interServerCommunication: 'Receives automated nocturnal database export dumps from production SQL servers and stores them on encrypted backup arrays.'
  },
  {
    id: 24,
    name: 'SSH Server (OpenSSH)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Provides secure, encrypted command-line shell sessions, tunneling, port forwarding, and administrative file transfers for Linux servers.',
    architectureRole: 'The primary management plane for every Linux server, container host, router, and cloud compute instance in modern infrastructure.',
    defaultPorts: ['SSH: 22/TCP (or hardened non-standard port: e.g. 2222)'],
    keyConfigSnippet: `# /etc/ssh/sshd_config.d/security.conf
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
MaxAuthTries 3
ClientAliveInterval 300`,
    securityHardening: 'Enforce modern Ed25519 elliptic-curve SSH keys, disable root login, disable password authentication, and bind to internal management IP addresses.',
    troubleshootingTip: 'Run SSH client in maximum debug mode to pinpoint handshake failures: "ssh -vvv sysadmin@192.168.10.50" to identify rejected keys or permission mismatches.',
    interServerCommunication: 'Used by Ansible automation engines and DevOps CI/CD runners to execute remote commands across hundreds of server nodes simultaneously.'
  },
  {
    id: 25,
    name: 'VPN Server (WireGuard / OpenVPN / IPsec)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Creates an encrypted tunnel over the public internet, securely joining remote workers or branch offices to the corporate private network.',
    architectureRole: 'Protects corporate internal web applications, databases, and Domain Controllers from public internet exposure by requiring encrypted tunnel ingress.',
    defaultPorts: ['WireGuard: 51820/UDP', 'OpenVPN: 1194/UDP', 'IPsec: 500/UDP, 4500/UDP'],
    keyConfigSnippet: `# WireGuard Server Configuration (/etc/wireguard/wg0.conf)
[Interface]
Address = 10.100.0.1/24
ListenPort = 51820
PrivateKey = <ServerPrivateKey>
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <ClientPublicKey>
AllowedIPs = 10.100.0.2/32`,
    securityHardening: 'Enforce Multi-Factor Authentication (MFA) on user VPN tunnels. Implement split-tunneling policies to prevent personal streaming traffic from saturating corporate WAN links.',
    troubleshootingTip: 'Verify handshake status: "wg show" on WireGuard or check OpenVPN status log. If handshake occurred but traffic fails, verify "net.ipv4.ip_forward = 1" in sysctl.',
    interServerCommunication: 'Encapsulates and encrypts internal IP packets between remote branch office routers and central corporate datacenter gateways.'
  },
  {
    id: 26,
    name: 'Firewall Server (pfSense / OPNsense / FortiGate)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Inspects and filters all ingress and egress network packets based on IP, port, protocol, and state, enforcing strict network perimeter security boundaries.',
    architectureRole: 'Perimeter defense barrier between the hostile public internet and internal corporate subnets; establishes DMZs and isolates VLANs.',
    defaultPorts: ['Web Management: 443/TCP', 'SSH: 22/TCP (internal only)'],
    keyConfigSnippet: `# pfSense Packet Filtering Principle
Rule: Block All Inbound WAN by default
Rule: Allow LAN to WAN (HTTP, HTTPS, DNS, NTP)
Rule: Allow DMZ to Internal Database ONLY on port 5432 with state tracking`,
    securityHardening: 'Never expose the firewall web management interface to the WAN interface. Restrict administrative logins strictly to a dedicated physical management port or VLAN.',
    troubleshootingTip: 'Review the live firewall packet drop log (pfTop / System Logs > Firewall) to determine whether connection timeouts are caused by blocked SYN packets or missing route tables.',
    interServerCommunication: 'Acts as the default gateway for every server in the subnet, routing packets between VLANs and performing Network Address Translation (NAT) to the internet.'
  },
  {
    id: 27,
    name: 'Backup Server (Veeam / Proxmox Backup Server / Bacula)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Orchestrates scheduled, deduplicated, and encrypted backups of virtual machine images, databases, system states, and critical file systems.',
    architectureRole: 'The ultimate insurance policy against hardware failure, accidental deletion, database corruption, and catastrophic ransomware outbreaks.',
    defaultPorts: ['Veeam Management: 9392/TCP', 'PBS: 8007/TCP', 'Agent: 6160/TCP'],
    keyConfigSnippet: `# Configure Immutable Backup Repository on Linux
# Veeam uses hardened Linux repository with chattr +i to lock backup files
sudo chattr +i /backups/repo/vm-backup-full.vbk`,
    securityHardening: 'Enforce the 3-2-1-1-0 backup rule: 3 copies, 2 different media types, 1 offsite, 1 immutable/air-gapped, and 0 errors during recovery verification drills.',
    troubleshootingTip: 'Investigate Volume Shadow Copy (VSS) errors on Windows guests during backup failures: "vssadmin list writers" to find writers in "Failed" or "Waiting for completion" states.',
    interServerCommunication: 'Connects to Hyper-V and ESXi hypervisors to take VM snapshots, pull changed block tracking (CBT) deltas, and write data to immutable storage pools.'
  },
  {
    id: 28,
    name: 'Monitoring Server (Prometheus / Zabbix / Nagios)',
    category: 'Observability & Operations',
    badgeColor: 'teal',
    purpose: 'Continuously queries and collects performance metrics (CPU, RAM, disk I/O, network throughput, error rates) from all infrastructure nodes.',
    architectureRole: 'Provides 24/7 visibility into server health, detects anomalies, triggers automatic alerts, and enables data-driven capacity planning.',
    defaultPorts: ['Prometheus: 9090/TCP', 'Node Exporter: 9100/TCP', 'Windows Exporter: 9182/TCP'],
    keyConfigSnippet: `# prometheus.yml Scrape Configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'linux-servers'
    static_configs:
      - targets: ['10.0.1.10:9100', '10.0.1.11:9100']
  - job_name: 'windows-servers'
    static_configs:
      - targets: ['10.0.1.20:9182']`,
    securityHardening: 'Do not expose metrics scrapers to public networks. Secure Node Exporter with TLS and basic authentication or restrict scrape access via firewall rules.',
    troubleshootingTip: 'Check Prometheus targets page (http://localhost:9090/targets) to see if nodes are marked DOWN due to connection refused or scrape timeouts.',
    interServerCommunication: 'Scrapes HTTP metrics endpoints on all servers every 15 seconds and pushes firing alerts to Alertmanager for incident routing.'
  },
  {
    id: 29,
    name: 'Logging Server (Grafana Loki / Elasticsearch / Graylog)',
    category: 'Observability & Operations',
    badgeColor: 'teal',
    purpose: 'Aggregates, indexes, stores, and searches terabytes of system logs, application logs, security event logs, and web access logs across the fleet.',
    architectureRole: 'Enables rapid root cause analysis during production outages and provides immutable audit trails required for enterprise compliance (SOC 2, ISO 27001).',
    defaultPorts: ['Loki HTTP: 3100/TCP', 'Elasticsearch: 9200/TCP', 'Syslog: 514/UDP'],
    keyConfigSnippet: `# Promtail agent config shipping systemd logs to Loki
clients:
  - url: http://loki.corp.local:3100/loki/api/v1/push

scrape_configs:
  - job_name: journal
    journal:
      max_age: 12h
      labels:
        plugin: journal
    relabel_configs:
      - source_labels: ['__journal__systemd_unit']
        target_label: 'unit'`,
    securityHardening: 'Configure index lifecycle management (ILM) to automatically delete or archive cold logs to S3 after 90 days. Encrypt all log streams in transit with mTLS.',
    troubleshootingTip: 'If the logging server disk fills up, Elasticsearch enters read-only mode (cluster_block_exception). Run: curl -X PUT "localhost:9200/_all/_settings" -d \'{"index.blocks.read_only_allow_delete": null}\'.',
    interServerCommunication: 'Receives log streams pushed by Promtail, Vector, or FluentBit agents running on application, database, and web servers.'
  },
  {
    id: 30,
    name: 'Cache Server (Memcached / Varnish)',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Stores pre-rendered HTML fragments, database query results, and API payloads in RAM for lightning-fast retrieval without disk or DB overhead.',
    architectureRole: 'Accelerates web performance by 10x to 100x and shields underlying relational databases from repetitive read spikes.',
    defaultPorts: ['Memcached: 11211/TCP/UDP', 'Varnish HTTP: 6081/TCP'],
    keyConfigSnippet: `# Memcached Configuration (/etc/memcached.conf)
-m 4096
-p 11211
-u memcache
-l 127.0.0.1,10.0.2.20
-P /var/run/memcached/memcached.pid`,
    securityHardening: 'Completely disable Memcached UDP support (-U 0) to prevent the server from being weaponized as a reflection DDoS amplifier. Bind strictly to private IPs.',
    troubleshootingTip: 'Calculate cache hit ratio: echo "stats" | nc 127.0.0.1 11211 | grep -E "get_hits|get_misses". If hit ratio is below 80%, investigate premature eviction or bad cache keys.',
    interServerCommunication: 'Responds to rapid in-memory key/value lookup requests from Application Servers before they query the relational database.'
  },
  {
    id: 31,
    name: 'Redis Server',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Advanced in-memory data store supporting strings, hashes, lists, sets, sorted sets, pub/sub messaging, and configurable disk persistence (RDB/AOF).',
    architectureRole: 'Powers user session storage, leaderboard rankings, API rate limiting counters, and background job queue brokering (BullMQ / Celery).',
    defaultPorts: ['Redis: 6379/TCP', 'Redis Sentinel: 26379/TCP', 'Redis Cluster: 16379/TCP'],
    keyConfigSnippet: `# Hardened redis.conf Configuration
bind 10.0.2.30 127.0.0.1
protected-mode yes
port 6379
requirepass "SuperStrongEnterpriseRedisAuthSecret987#"
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
rename-command FLUSHALL ""
rename-command CONFIG ""`,
    securityHardening: 'Disable or rename dangerous administrative commands (FLUSHALL, FLUSHDB, CONFIG, KEYS). Always enforce requirepass and enable TLS in production.',
    troubleshootingTip: 'Check memory fragmentation ratio: "redis-cli info memory | grep mem_fragmentation_ratio". If ratio exceeds 1.5, memory is fragmented; restart service or enable active defrag.',
    interServerCommunication: 'Acts as the shared distributed state and session cache for scaled-out Node.js, Angular SSR, and Spring Boot application clusters.'
  },
  {
    id: 32,
    name: 'Message Broker Server',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Decouples distributed systems by accepting, queuing, and delivering asynchronous messages between producer and consumer applications.',
    architectureRole: 'Ensures reliable inter-service communication and buffers peak transactional spikes so backend services do not crash.',
    defaultPorts: ['Varies by broker: AMQP 5672, MQTT 1883, STOMP 61613'],
    keyConfigSnippet: `# Concept: Producer pushes order event -> Message Broker buffers event in persistent queue -> Consumer processes order at sustained pace`,
    securityHardening: 'Require TLS for message transport, authenticate producers/consumers with unique credentials, and restrict queue read/write access via ACLs.',
    troubleshootingTip: 'Monitor queue depth: if unacknowledged messages grow continuously, consumer workers are either dead, crashing on poison pills, or under-provisioned.',
    interServerCommunication: 'Bridges transactional requests between web frontend APIs and slow backend processing workers (e.g. video rendering, PDF generation).'
  },
  {
    id: 33,
    name: 'RabbitMQ Server',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Enterprise AMQP message broker implementing complex routing patterns: direct, fanout, topic, and headers exchanges with guaranteed delivery.',
    architectureRole: 'Routes order processing, financial settlements, email dispatching, and asynchronous workflow tasks across microservices.',
    defaultPorts: ['AMQP: 5672/TCP', 'RabbitMQ Management Web UI: 15672/TCP', 'Erlang epmd: 4369/TCP'],
    keyConfigSnippet: `# Enable RabbitMQ Management Plugin & Add Admin User
sudo rabbitmq-plugins enable rabbitmq_management
sudo rabbitmqctl add_user rabbitadmin "EnterpriseSecurePassword123!"
sudo rabbitmqctl set_user_tags rabbitadmin administrator
sudo rabbitmqctl set_permissions -p / rabbitadmin ".*" ".*" ".*"`,
    securityHardening: 'Delete default "guest" user immediately. Enforce TLS on AMQP port 5671 and restrict Management UI port 15672 to administrator IPs.',
    troubleshootingTip: 'Check memory alarms: "rabbitmqctl status | grep -A 5 alarms". If free disk or RAM drops below watermarks, RabbitMQ blocks all incoming producers.',
    interServerCommunication: 'Accepts AMQP messages from backend application servers and routes them to worker microservice pools over persistent TCP sockets.'
  },
  {
    id: 34,
    name: 'Kafka Server (Apache Kafka / KRaft)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Distributed event streaming platform capable of handling trillions of events a day with extreme high-throughput disk-backed partition logs.',
    architectureRole: 'Powers real-time analytics pipelines, clickstream tracking, IoT sensor data ingestion, and event-driven microservices architecture.',
    defaultPorts: ['Kafka Broker: 9092/TCP', 'Kafka Controller (KRaft): 9093/TCP'],
    keyConfigSnippet: `# server.properties KRaft Configuration
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@kafka1:9093,2@kafka2:9093,3@kafka3:9093
listeners=PLAINTEXT://10.0.3.10:9092,CONTROLLER://10.0.3.10:9093
log.dirs=/var/lib/kafka/data
num.partitions=6
default.replication.factor=3`,
    securityHardening: 'Enable SASL/SCRAM authentication, configure TLS encryption for broker-to-broker and client-to-broker communication, and enforce ACLs per topic.',
    troubleshootingTip: 'Check consumer group lag: "kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group order-processors" to detect falling-behind consumers.',
    interServerCommunication: 'Streams high-velocity logs and events continuously from application servers to storage engines and real-time analytics processors.'
  },
  {
    id: 35,
    name: 'API Gateway (Kong / Traefik / Apisix)',
    category: 'Web & Application',
    badgeColor: 'gold',
    purpose: 'Single entry point for client API requests, providing centralized authentication, rate limiting, request routing, logging, and protocol translation.',
    architectureRole: 'Shields internal microservices, validates JWT auth tokens, transforms headers, and protects against API abuse before hitting business logic.',
    defaultPorts: ['Proxy: 8000/TCP, 8443/TCP', 'Admin API: 8001/TCP'],
    keyConfigSnippet: `# Kong Gateway Route Definition via declarative YAML
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-backend:8080
    routes:
      - name: user-route
        paths:
          - /api/v1/users
        plugins:
          - name: rate-limiting
            config:
              minute: 100`,
    securityHardening: 'Never expose the Admin API (port 8001) to public networks; bind strictly to 127.0.0.1 or protect with mutual TLS (mTLS).',
    troubleshootingTip: 'Examine API Gateway latency metrics: proxy_latency (time spent in gateway plugins) vs upstream_latency (time spent inside your actual backend microservice).',
    interServerCommunication: 'Terminates client HTTPS traffic and fans out requests across dozens of internal Docker / Kubernetes service pods.'
  },
  {
    id: 36,
    name: 'Container Server (Docker Host / Podman)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Runs lightweight, isolated OS-level containers sharing the host Linux kernel, providing instant application startups and consistent environments.',
    architectureRole: 'Hosts containerized microservices, build runners, and development testbeds without virtual machine hypervisor overhead.',
    defaultPorts: ['Docker Daemon Socket: /var/run/docker.sock', 'TCP (optional): 2376 (TLS)'],
    keyConfigSnippet: `# /etc/docker/daemon.json Production Baseline
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}`,
    securityHardening: 'Never expose Docker daemon TCP socket unauthenticated on port 2375. Rootless Docker or Podman is strongly recommended. Limit container capabilities (--cap-drop ALL).',
    troubleshootingTip: 'Inspect container crash exits: "docker inspect <container> --format \'{{.State.ExitCode}} {{.State.Error}}\'". Exit code 137 indicates the OS OOM killer killed the container.',
    interServerCommunication: 'Routes packets across virtual bridge networks (docker0 / custom bridge) and forwards exposed container ports to host network adapters.'
  },
  {
    id: 37,
    name: 'Kubernetes Control Plane & Worker Nodes',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Automates deployment, scaling, health checking, and management of containerized application clusters across physical or virtual machines.',
    architectureRole: 'Enterprise container orchestration platform running high-scale web apps with self-healing, rolling updates, and automatic horizontal scaling.',
    defaultPorts: ['kube-apiserver: 6443/TCP', 'etcd: 2379-2380/TCP', 'kubelet: 10250/TCP', 'NodePort range: 30000-32767'],
    keyConfigSnippet: `# Check cluster node health and core system pods
kubectl get nodes -o wide
kubectl get pods -n kube-system`,
    securityHardening: 'Enable Role-Based Access Control (RBAC), enforce Pod Security Standards (restricted profile), isolate etcd with dedicated certificates, and audit API server logs.',
    troubleshootingTip: 'Troubleshoot CrashLoopBackOff: "kubectl describe pod <pod-name>" to inspect events, then "kubectl logs <pod-name> --previous" to inspect the fatal error before the crash.',
    interServerCommunication: 'Kubelet on worker nodes communicates with kube-apiserver over mutual TLS; pods communicate across nodes via CNI overlay network (Calico / Flannel / Cilium).'
  },
  {
    id: 38,
    name: 'CI/CD Server (Jenkins / GitLab Runner / GitHub Runner)',
    category: 'Observability & Operations',
    badgeColor: 'teal',
    purpose: 'Executes automated continuous integration build scripts, unit tests, code quality scans, container image packaging, and production deployments.',
    architectureRole: 'Bridges developer source code commits to production server deployments without requiring manual sysadmin intervention.',
    defaultPorts: ['Jenkins Web: 8080/TCP', 'Jenkins JNLP Agent: 50000/TCP', 'GitLab Web: 443/TCP'],
    keyConfigSnippet: `# Jenkins systemd service configuration
Environment="JAVA_OPTS=-Djava.awt.headless=true -Xmx2048m"
JENKINS_PORT="8080"
JENKINS_LISTEN_ADDRESS="127.0.0.1"`,
    securityHardening: 'Never run Jenkins as root. Secure Jenkins with reverse proxy HTTPS. Restrict script approvals, isolate build agents into ephemeral Docker containers, and store secrets in Vault.',
    troubleshootingTip: 'Clean up workspace disk bloat: automated Jenkins builds can consume 100 GB in days; configure workspace cleanup plugins and discard old build artifacts automatically.',
    interServerCommunication: 'Pulls source code from Git servers, connects to Docker registries to push images, and connects via SSH/Ansible/Kubectl to deploy to production servers.'
  },
  {
    id: 39,
    name: 'Git Server (GitLab / Gitea / Gitolite)',
    category: 'Observability & Operations',
    badgeColor: 'teal',
    purpose: 'Hosts centralized version-controlled software repositories, code review workflows, and configuration management infrastructure code.',
    architectureRole: 'Stores company source code, Infrastructure as Code (Terraform), Ansible playbooks, and server configuration scripts securely on-premises.',
    defaultPorts: ['HTTPS: 443/TCP', 'Git SSH: 22/TCP'],
    keyConfigSnippet: `# Backup GitLab repository server
sudo gitlab-backup create
# Synchronize backup archive to offsite storage
rsync -avz /var/opt/gitlab/backups/ backup-srv:/mnt/offsite/gitlab/`,
    securityHardening: 'Enforce SSH key access and signed GPG commits. Require mandatory MFA for all accounts and restrict project visibility with granular branch protection rules.',
    troubleshootingTip: 'Run GitLab integrity check: "sudo gitlab-rake gitlab:git:fsck" to catch corrupted repository pack files or broken references.',
    interServerCommunication: 'Notifies CI/CD servers via outbound webhooks upon code pushes and authenticates developers via Active Directory / LDAP.'
  },
  {
    id: 40,
    name: 'Certificate Authority Server (AD CS / Step-CA / Easy-RSA)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'Issues, validates, renews, and revokes digital X.509 cryptographic certificates to verify the identity of servers, services, and users.',
    architectureRole: 'Forms the root of trust for all internal TLS/SSL encryption, 802.1X network access, VPN authentication, and smart card logins.',
    defaultPorts: ['AD CS Web Enrollment: 443/TCP', 'ACME / Step-CA: 9000/TCP', 'RPC: 135/TCP'],
    keyConfigSnippet: `# certutil command to verify enterprise CA status
certutil -ping
certutil -view -out "RequestID,CommonName,NotAfter"`,
    securityHardening: 'Keep Root CA offline and powered off. Issue certificates exclusively from Subordinate Issuing CAs. Protect private keys with Hardware Security Modules (HSMs).',
    troubleshootingTip: 'If domain certificates fail to auto-enroll, check Certificate Revocation List (CRL) availability: certutil -verifyctl -urlfetch to ensure CRL endpoints are online and unexpired.',
    interServerCommunication: 'Publishes CRLs to internal web servers and distributes root CA certificates to all domain computers via Active Directory Group Policy.'
  },
  {
    id: 41,
    name: 'NTP Server (Network Time Protocol / Chrony / w32time)',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Synchronizes system clocks across all servers, routers, and client computers down to sub-millisecond accuracy.',
    architectureRole: 'Absolute requirement for Kerberos authentication (which rejects time drift > 5 minutes), distributed database log ordering, and security log correlation.',
    defaultPorts: ['NTP: 123/UDP'],
    keyConfigSnippet: `# /etc/chrony/chrony.conf Production NTP Server
server time.cloudflare.com iburst
server time.google.com iburst
allow 192.168.0.0/16
local stratum 10`,
    securityHardening: 'Restrict NTP client query access to internal corporate subnets. Disable monlist feature to eliminate NTP amplification DDoS vulnerabilities.',
    troubleshootingTip: 'Check clock synchronization: "chronyc tracking" on Linux or "w32tm /query /status" on Windows to verify stratum level and root dispersion under 20ms.',
    interServerCommunication: 'Listens on 123/UDP responding to time sync requests from Domain Controllers, database servers, and network switches.'
  },
  {
    id: 42,
    name: 'Print Server',
    category: 'Network Services & Edge',
    badgeColor: 'purple',
    purpose: 'Manages enterprise network printers, spools print jobs, distributes print drivers to clients, and tracks printing quotas.',
    architectureRole: 'Centralizes printer queue management, eliminating the need to install printer drivers individually on hundreds of employee laptops.',
    defaultPorts: ['SMB: 445/TCP', 'Spooler RPC: 135/TCP', 'IPP: 631/TCP'],
    keyConfigSnippet: `# PowerShell Add Network Printer Driver & Share
Add-PrinterDriver -Name "HP Universal Printing PCL 6"
Add-Printer -Name "Office-Color-Printer" -DriverName "HP Universal Printing PCL 6" -PortName "192.168.10.80" -Shared -ShareName "OfficeColor"`,
    securityHardening: 'Remediate PrintNightmare (CVE-2021-34527) vulnerabilities: restrict Point and Print driver installation strictly to administrators via Group Policy.',
    troubleshootingTip: 'Clear hung print spooler jobs on Windows: Stop-Service spooler; Remove-Item C:\\Windows\\System32\\spool\\PRINTERS\\* -Force; Start-Service spooler.',
    interServerCommunication: 'Accepts print jobs from domain clients via SMB/RPC and delivers rasterized print streams to physical network printers over port 9100/RAW or IPP.'
  },
  {
    id: 43,
    name: 'Remote Desktop Server (RDS / RD Gateway)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Allows remote users to securely access centralized Windows desktops, published corporate applications, and virtual desktops from any client device.',
    architectureRole: 'Enables secure remote employee work, provides contractor access without shipping physical hardware, and isolates administrative consoles.',
    defaultPorts: ['RDP: 3389/TCP/UDP', 'RD Gateway HTTPS: 443/TCP, 3391/UDP'],
    keyConfigSnippet: `# Configure Remote Desktop Session Host Limits via PowerShell
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services' -Name "MaxInstanceCount" -Value 50`,
    securityHardening: 'Never expose port 3389 directly to the internet. Deploy Remote Desktop Gateway (RD Gateway) terminating over port 443 with mandatory MFA.',
    troubleshootingTip: 'Diagnose frozen user sessions: run "query user" to see active session IDs, and log off unresponsive sessions cleanly with "logoff <session-id>".',
    interServerCommunication: 'Authenticates user sessions against Active Directory Domain Controllers and checks user license CALs against an RD Licensing Server.'
  },
  {
    id: 44,
    name: 'Terminal Server (Linux Terminal Server / Guacamole)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Provides multi-user Linux terminal access, command execution sandboxes, or clientless HTML5 browser-based remote desktop gateways.',
    architectureRole: 'Allows systems engineers to access remote Windows and Linux servers securely through a web browser without installing local client software.',
    defaultPorts: ['Guacamole Web: 8080/TCP', 'guacd: 4822/TCP'],
    keyConfigSnippet: `# Apache Guacamole Docker Deployment
docker run -d --name guacd -p 4822:4822 guacamole/guacd
docker run -d --name guacamole -p 8080:8080 -e GUACD_HOSTNAME=guacd -e POSTGRES_DATABASE=guacamole guacamole/guacamole`,
    securityHardening: 'Enforce MFA (Duo / TOTP) on web terminal portals. Record administrative sessions to disk for compliance audits and forensic inspection.',
    troubleshootingTip: 'Check guacd connection logs: docker logs -f guacd to detect protocol negotiation failures or unsupported RDP security layers.',
    interServerCommunication: 'Bridges browser WebSocket sessions over HTTPS to internal target servers via RDP (3389), VNC (5900), or SSH (22).'
  },
  {
    id: 45,
    name: 'Virtualization Host',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'High-spec physical server running a bare-metal hypervisor kernel, carving physical CPU, RAM, disk, and network resources into multiple virtual machines.',
    architectureRole: 'The physical hardware platform hosting all enterprise compute workloads, consolidating 20-50 physical servers into single hardware chassis.',
    defaultPorts: ['Management Web: 443/TCP', 'Cluster Heartbeat: 5405/UDP'],
    keyConfigSnippet: `# Monitor host CPU and RAM resource saturation
top -b -n 1 | head -n 10
free -h`,
    securityHardening: 'Dedicate isolated physical network interfaces for hypervisor management traffic. Enable CPU hardware virtualization extensions (Intel VT-x / AMD-V) and IOMMU.',
    troubleshootingTip: 'Verify memory NUMA balance: lscpu | grep NUMA to ensure VMs fit within single NUMA nodes, avoiding 30% memory bus penalties.',
    interServerCommunication: 'Coordinates VM status, storage heartbeats, and cluster quorum votes with peer virtualization hosts over dedicated cluster networks.'
  },
  {
    id: 46,
    name: 'Hyper-V Server',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Microsoft’s Type-1 hypervisor running directly on server hardware or as a core role inside Windows Server Datacenter.',
    architectureRole: 'Powers enterprise Windows virtualized environments, Failover Clusters, and high-performance virtual networking with deep Windows ecosystem integration.',
    defaultPorts: ['WinRM: 5985/TCP', 'Hyper-V Replica: 80/443', 'Live Migration: 6600/TCP'],
    keyConfigSnippet: `# PowerShell Hyper-V Live Migration Configuration
Enable-VMMigration
Set-VMHost -VirtualMachineMigrationAuthenticationType Kerberos
Set-VMMigrationNetwork -Subnet 192.168.99.0/24`,
    securityHardening: 'Enable Shielded Virtual Machines, Virtualization-Based Security (VBS), and enforce BitLocker encryption on all underlying host volumes.',
    troubleshootingTip: 'Inspect Live Migration failures in Event Viewer under "Microsoft-Windows-Hyper-V-High-Availability-Admin". Ensure Kerberos delegation is configured between host computer accounts.',
    interServerCommunication: 'Streams VM memory states over 10GbE Live Migration networks to target Hyper-V hosts without dropping running TCP connections.'
  },
  {
    id: 47,
    name: 'VMware ESXi Host',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Industry-standard bare-metal Type-1 hypervisor from VMware delivering enterprise virtualization with minimal OS footprint (150 MB).',
    architectureRole: 'Forms the compute foundation of enterprise private clouds, managed centrally by VMware vCenter Server for vMotion and DRS balancing.',
    defaultPorts: ['vSphere Client / Web: 443/TCP', 'ESXi Shell / SSH: 22/TCP', 'vMotion: 8000/TCP'],
    keyConfigSnippet: `# ESXi Command-Line VM Control (esxcli)
esxcli vm process list
esxcli vm process kill --type=force --world-id=<WorldID>`,
    securityHardening: 'Enable ESXi Lockdown Mode (Strict), which terminates SSH and allows host management exclusively through authorized vCenter servers.',
    troubleshootingTip: 'Examine VMFS datastore locking issues: vmkfstools -D /vmfs/volumes/datastore1/vm/vm.vmx to see which host MAC address holds the active SCSI reservation lock.',
    interServerCommunication: 'Sends management telemetry to vCenter Server over port 443 and exchanges heartbeats with storage SAN fabrics.'
  },
  {
    id: 48,
    name: 'Proxmox Host (Proxmox VE)',
    category: 'Compute & Virtualization',
    badgeColor: 'teal',
    purpose: 'Open-source complete enterprise virtualization management platform combining KVM hypervisor, LXC containers, and software-defined ZFS/Ceph storage.',
    architectureRole: 'Cost-effective alternative to VMware for enterprise virtualization, homelabs, and edge datacenter deployments without licensing fees.',
    defaultPorts: ['Proxmox Web GUI: 8006/TCP', 'Corosync: 5405/UDP', 'SPICE: 3128/TCP'],
    keyConfigSnippet: `# Proxmox Cluster Management CLI
pvecm status
pvecm create ProductionCluster
qm list`,
    securityHardening: 'Configure Two-Factor Authentication (TOTP / YubiKey) on the web portal. Disable the enterprise repository on non-subscription nodes to prevent update errors.',
    troubleshootingTip: 'If cluster loses quorum: pvecm status shows "Quorate: No". Temporarily force expected votes: pvecm expected 1 to allow VM startup during emergency recovery.',
    interServerCommunication: 'Syncs cluster configuration filesystem (/etc/pve) across nodes using Corosync multicast/unicast heartbeats over dedicated physical networks.'
  },
  {
    id: 49,
    name: 'SQL Server (Microsoft SQL Server)',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Enterprise relational database management system (RDBMS) supporting complex transactional processing, business intelligence (SSIS, SSRS), and analytics.',
    architectureRole: 'Powers enterprise ERP systems, core banking backends, healthcare electronic medical records, and high-concurrency .NET applications.',
    defaultPorts: ['Default Instance: 1433/TCP', 'Dedicated Admin Connection (DAC): 1434/TCP'],
    keyConfigSnippet: `# T-SQL Check Database File Sizes & Free Space
SELECT name, size/128.0 AS TotalSizeMB,
       size/128.0 - CAST(FILEPROPERTY(name, 'SpaceUsed') AS int)/128.0 AS FreeSpaceMB
FROM sys.database_files;`,
    securityHardening: 'Disable the "sa" account or assign a 30-character random password. Place SQL Server behind Windows Authentication. Enable Transparent Data Encryption (TDE).',
    troubleshootingTip: 'Diagnose blocking queries: EXEC sp_who2 or query sys.dm_exec_requests to identify the lead blocker SPID holding exclusive table locks.',
    interServerCommunication: 'Replicates transaction logs to Always On Availability Group secondary replicas over port 5022 with synchronous or asynchronous commit.'
  },
  {
    id: 50,
    name: 'PostgreSQL Server',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Advanced open-source object-relational database known for strict standards compliance, extensibility, JSONB support, and massive write concurrency.',
    architectureRole: 'The premier open-source database engine for modern cloud-native web applications, geospatial services (PostGIS), and microservices.',
    defaultPorts: ['PostgreSQL: 5432/TCP'],
    keyConfigSnippet: `# Enable Streaming Replication on Master (postgresql.conf)
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1024MB
# Allow standby connection in pg_hba.conf
host replication replicator 10.0.2.11/32 scram-sha-256`,
    securityHardening: 'Configure pg_hba.conf to enforce scram-sha-256 password hashing. Reject all unencrypted network connections (hostssl only). Bind to private IP addresses.',
    troubleshootingTip: 'Detect table bloat requiring VACUUM: SELECT schemaname, relname, n_dead_tup, n_live_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 5;',
    interServerCommunication: 'Streams Write-Ahead Logs (WAL) continuously to standby replica database nodes over port 5432 to provide real-time data redundancy.'
  },
  {
    id: 51,
    name: 'MySQL Server (MySQL / MariaDB)',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Widely deployed open-source relational database engine optimized for fast read operations and widespread web software compatibility.',
    architectureRole: 'Powers content management systems (WordPress, Drupal), e-commerce portals, and web backend storage layers.',
    defaultPorts: ['MySQL: 3306/TCP'],
    keyConfigSnippet: `# /etc/mysql/my.cnf InnoDB Memory Optimization
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 1
max_connections = 300`,
    securityHardening: 'Run mysql_secure_installation: remove anonymous users, disallow remote root login, remove test database, and enable validate_password plugin.',
    troubleshootingTip: 'Inspect running queries: "SHOW FULL PROCESSLIST;" and check for slow unindexed table scans causing CPU spikes.',
    interServerCommunication: 'Replicates binary logs (binlog) asynchronously to read-replicas over port 3306 for horizontal read scaling.'
  },
  {
    id: 52,
    name: 'MongoDB Server',
    category: 'Database & Cache',
    badgeColor: 'coral',
    purpose: 'Document-oriented NoSQL database storing data in flexible, JSON-like BSON documents with dynamic schemas and native horizontal sharding.',
    architectureRole: 'Used for high-velocity catalogs, real-time telemetry ingestion, user profile storage, and mobile application data backends.',
    defaultPorts: ['mongod: 27017/TCP', 'mongos (sharding router): 27018/TCP'],
    keyConfigSnippet: `# /etc/mongod.conf Security & Replica Set Configuration
net:
  port: 27017
  bindIp: 10.0.2.40,127.0.0.1
security:
  authorization: enabled
  keyFile: /var/lib/mongodb/mongo-keyfile
replication:
  replSetName: "rs0"`,
    securityHardening: 'Always enable security.authorization: enabled. Generating an internal keyFile is mandatory before replica set nodes are permitted to communicate.',
    troubleshootingTip: 'Check replica set health: "rs.status()" in mongosh. Verify member health values are 1 and stateStr matches PRIMARY or SECONDARY without replication lag.',
    interServerCommunication: 'Nodes elect a primary via internal Raft-like consensus and replicate oplog (operations log) records across member nodes.'
  },
  {
    id: 53,
    name: 'Application Monitoring Server (APM: Dynatrace / Datadog / Signoz)',
    category: 'Observability & Operations',
    badgeColor: 'teal',
    purpose: 'Monitors application code execution, traces distributed HTTP/gRPC transactions across microservices, and profiles memory and database query latency.',
    architectureRole: 'Allows developers and sysadmins to identify slow SQL queries, unhandled exceptions, and bottlenecked microservices instantly.',
    defaultPorts: ['OpenTelemetry OTLP: 4317/TCP (gRPC), 4318/TCP (HTTP)'],
    keyConfigSnippet: `# OpenTelemetry Collector Pipeline Configuration
receivers:
  otlp:
    protocols:
      grpc:
      http:
processors:
  batch:
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"`,
    securityHardening: 'Enforce API token authentication on telemetry ingest endpoints and sanitize database queries to prevent sensitive PII from leaking into APM traces.',
    troubleshootingTip: 'Correlate trace ID with logs: when an API returns HTTP 500, grep the unique TraceId in Grafana Loki to see the exact stack trace and preceding database calls.',
    interServerCommunication: 'Receives distributed trace spans streamed over OTLP protocols from instrumentation agents running inside application runtimes.'
  },
  {
    id: 54,
    name: 'Network Management Server (NMS: LibreNMS / PRTG)',
    category: 'Observability & Operations',
    badgeColor: 'purple',
    purpose: 'Monitors network infrastructure devices (routers, core switches, firewalls, UPS systems) via SNMP, NetFlow, and ICMP probes.',
    architectureRole: 'Provides physical port link status alerts, bandwidth utilization graphs, switch port mapping, and hardware temperature warnings.',
    defaultPorts: ['SNMP Polling: 161/UDP', 'SNMP Traps: 162/UDP', 'Syslog: 514/UDP'],
    keyConfigSnippet: `# snmpd.conf Secure SNMPv3 User Configuration
createUser nms_admin SHA "AuthPassword987!" AES "PrivPassword987!"
rouser nms_admin authpriv`,
    securityHardening: 'Eliminate insecure SNMPv1 and SNMPv2c plaintext community strings (e.g. "public"). Enforce SNMPv3 with SHA authentication and AES encryption.',
    troubleshootingTip: 'Verify SNMP reachability: snmpwalk -v3 -u nms_admin -l authPriv -a SHA -A "AuthPassword" -x AES -X "PrivPassword" 192.168.1.1 1.3.6.1.2.1.1.1.',
    interServerCommunication: 'Periodically polls SNMP OID trees on network switch interfaces to calculate interface bandwidth utilization and port error drops.'
  },
  {
    id: 55,
    name: 'High Availability Cluster (Pacemaker / WSFC)',
    category: 'Compute & Virtualization',
    badgeColor: 'coral',
    purpose: 'Combines two or more servers running specialized cluster middleware that continuously monitors node health and automatically fails over resources.',
    architectureRole: 'Guarantees 99.99% to 99.999% uptime for mission-critical databases, hypervisors, and file servers without manual sysadmin intervention.',
    defaultPorts: ['Corosync: 5405/UDP', 'Pacemaker: 2224/TCP', 'WSFC: 3343/TCP/UDP'],
    keyConfigSnippet: `# Pacemaker Cluster Resource Creation (Floating VIP)
pcs resource create FloatingIP ocf:heartbeat:IPaddr2 ip=192.168.10.100 cidr_netmask=24 op monitor interval=10s
pcs constraint colocation add FloatingIP with WebApp INFINITY`,
    securityHardening: 'Configure hardware STONITH (fencing agents via IPMI/iDRAC) to instantly sever power to unresponsive nodes, preventing catastrophic split-brain data corruption.',
    troubleshootingTip: 'Inspect cluster quorum: "pcs status" on Linux or "Get-ClusterNode" on Windows. Ensure total voting nodes exceed 50% + 1 to maintain active quorum.',
    interServerCommunication: 'Exchanges high-frequency sub-second heartbeat pings across isolated dedicated cluster network interfaces.'
  },
  {
    id: 56,
    name: 'Disaster Recovery Server (DR Replica)',
    category: 'Compute & Virtualization',
    badgeColor: 'coral',
    purpose: 'Standby server located at a separate geographical datacenter or cloud region continuously receiving replicated data to restore operations during catastrophe.',
    architectureRole: 'Provides business continuity if the primary datacenter suffers total power loss, natural disasters, or fiber cuts, meeting targeted RTO/RPO limits.',
    defaultPorts: ['Replication: 443/TCP or 8080/TCP (Hyper-V Replica / Zerto)'],
    keyConfigSnippet: `# Hyper-V Replica Failover Test via PowerShell
Test-VMReplicationConnection -ReplicaServerName "dr-hyperv.backup.corp.local" -ReplicaServerPort 443 -AuthenticationType Certificate`,
    securityHardening: 'Encrypt all replication streams traversing public WAN links using IPsec or mutual TLS certificates. Keep DR networks air-gapped from production test networks.',
    troubleshootingTip: 'Verify replication health: Get-VMReplication to confirm "Normal" health and replication latency under 15 minutes.',
    interServerCommunication: 'Continuously receives delta byte changes streamed from primary datacenter production storage engines over encrypted WAN connections.'
  },
  {
    id: 57,
    name: 'Domain & Identity Management Server (FreeIPA / Red Hat IdM)',
    category: 'Identity & Directory',
    badgeColor: 'coral',
    purpose: 'Provides integrated Linux-centric identity management, Kerberos single sign-on, centralized sudo rule enforcement, and host-based access control (HBAC).',
    architectureRole: 'The Linux counterpart to Windows Active Directory, providing unified authentication and policy enforcement for Linux server fleets.',
    defaultPorts: ['Kerberos: 88', 'LDAP: 389/636', 'DNS: 53', 'PKI/CA: 8443'],
    keyConfigSnippet: `# Join Linux client to FreeIPA / IdM Domain
sudo ipa-client-install --domain=corp.linux.local --server=ipa.corp.linux.local --mkhomedir`,
    securityHardening: 'Establish cross-forest trust with Active Directory so corporate employees can authenticate to Linux servers using their corporate domain accounts securely.',
    troubleshootingTip: 'Inspect SSSD authentication cache on clients: "sudo sssd -i -d 4" or clear stale user credentials with "sss_cache -E".',
    interServerCommunication: 'Distributes host-based access control policies and sudo permission rules to Linux SSSD client daemons over encrypted LDAP/Kerberos.'
  },
  {
    id: 58,
    name: 'Storage Area Network (SAN)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Dedicated, high-speed, specialized storage network providing block-level network access to consolidated storage arrays (Dell PowerStore, Pure Storage, HPE Nimble).',
    architectureRole: 'Supplies raw storage LUNs to virtualization clusters and database servers with microsecond latency and massive parallel IOPS.',
    defaultPorts: ['Fibre Channel: 8Gb/16Gb/32Gb optical', 'iSCSI: 3260/TCP', 'NVMe-oF: 4420/TCP'],
    keyConfigSnippet: `# Scan and login to SAN iSCSI target on Linux
sudo iscsiadm -m discovery -t sendtargets -p 192.168.50.10:3260
sudo iscsiadm -m node -T iqn.2026.san:storage.pool01 -p 192.168.50.10 --login`,
    securityHardening: 'Enforce Fibre Channel zoning on SAN switches (isolate initiator WWPN to target WWPN). Require CHAP credentials on iSCSI targets and use dedicated isolated fabrics.',
    troubleshootingTip: 'Check multipath topology: "multipath -ll" to ensure active/optimized paths are available across dual controllers, preventing single-cable disconnections from crashing storage.',
    interServerCommunication: 'Transfers raw SCSI / NVMe commands and block data directly between host HBAs and SAN storage controller processors.'
  },
  {
    id: 59,
    name: 'Network Attached Storage (NAS)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Dedicated file storage device connected to standard Ethernet IP networks, providing file-level data access to heterogeneous network clients.',
    architectureRole: 'Hosts general file shares, video/multimedia archives, user home directories, and VMware NFS datastores.',
    defaultPorts: ['NFS: 2049/TCP', 'SMB: 445/TCP', 'Management: 443/TCP'],
    keyConfigSnippet: `# /etc/exports on Enterprise Linux NFS Server
/data/nfs/shared  192.168.10.0/24(rw,sync,no_subtree_check,sec=sys)
/data/nfs/backup  192.168.10.99(rw,async,no_root_squash)`,
    securityHardening: 'Enforce NFSv4 with Kerberos encryption (sec=krb5p) rather than insecure IP-based export trust. Disable root squash only when explicitly required by hypervisors.',
    troubleshootingTip: 'Diagnose stale NFS file handles: "mount -o remount /mnt/nfs" or inspect unmounted exports with "showmount -e <nas-ip>".',
    interServerCommunication: 'Serves file metadata and byte streams over standard TCP/IP network interfaces to client computers and hypervisors.'
  },
  {
    id: 60,
    name: 'Distributed Storage Server (Ceph / GlusterFS / MinIO)',
    category: 'Messaging, Storage & Backup',
    badgeColor: 'sky',
    purpose: 'Aggregates physical storage drives across multiple independent server nodes into a unified, self-healing, horizontally scalable storage cluster.',
    architectureRole: 'Provides S3-compatible object storage, distributed block devices (RBD), and POSIX filesystems (CephFS) for Kubernetes and private clouds.',
    defaultPorts: ['Ceph Mon: 3300/TCP, 6789/TCP', 'Ceph OSD: 6800-7300/TCP', 'MinIO API: 9000/TCP'],
    keyConfigSnippet: `# Ceph Cluster Health & Pool Query
ceph health detail
ceph osd status
ceph df`,
    securityHardening: 'Encrypt data at rest across all Object Storage Daemons (OSDs) using dm-crypt. Enforce S3 bucket policies and TLS encryption for all MinIO API traffic.',
    troubleshootingTip: 'Inspect degraded placement groups (PGs): "ceph pg dump_stuck" to identify OSDs that crashed or disk drives reporting uncorrectable read errors.',
    interServerCommunication: 'Nodes use CRUSH maps and peer-to-peer gossip protocols to balance replicas and rebuild lost data chunks across healthy drives automatically.'
  }
];
