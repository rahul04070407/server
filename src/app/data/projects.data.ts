export interface EnterpriseProject {
  id: number;
  title: string;
  badge: string;
  difficulty: 'Junior' | 'Intermediate' | 'Senior' | 'Expert';
  estimatedCompletionTime: string;
  summary: string;
  architectureBlueprint: string;
  serverRoles: { serverName: string; os: string; ip: string; role: string; specs: string }[];
  stepByStepMilestones: {
    milestone: string;
    description: string;
    keyCommands: string;
    verificationCheck: string;
  }[];
  productionOutcomes: string[];
}

export const PROJECTS_DATA: EnterpriseProject[] = [
  {
    id: 1,
    title: 'Project 1: Small Office Infrastructure Build',
    badge: 'On-Premises Foundation',
    difficulty: 'Junior',
    estimatedCompletionTime: '20 Hours',
    summary: 'Build complete small office IT infrastructure from scratch: Windows Server 2022 Domain Controller, Active Directory Domain Services, DNS, DHCP with scope reservations, Group Policy Objects enforcing CIS security benchmarks, departmental SMB file shares with Access-Based Enumeration, and domain-joined client workstations.',
    architectureBlueprint: `[ Internet / WAN ]
         │
[ pfSense Router / Gateway: 192.168.10.1 ]
         │ (VLAN 10: Corp LAN)
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[ DC-01: Windows Server 2022 ]           [ CLIENT-01: Windows 11 ]
(192.168.10.10)                          (192.168.10.105 via DHCP)
- Active Directory (corp.local)          - Joined to corp.local
- AD-Integrated DNS                      - Drives Mapped via GPO
- DHCP Server (192.168.10.100-200)       - CIS Baseline Applied
- File Sharing & FSRM (\\\\corp.local\\dfs)`,
    serverRoles: [
      { serverName: 'DC-01', os: 'Windows Server 2022 Standard', ip: '192.168.10.10', role: 'Domain Controller, DNS Server, DHCP Server, SMB File Server', specs: '2 vCPU, 4GB RAM, 80GB SSD' },
      { serverName: 'CLIENT-01', os: 'Windows 11 Enterprise Eval', ip: '192.168.10.105 (DHCP)', role: 'Employee Domain Workstation', specs: '2 vCPU, 4GB RAM, 50GB SSD' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: Promote Domain Controller & Configure AD-Integrated DNS',
        description: 'Install Active Directory Domain Services role and promote DC-01 to root domain controller for corp.local.',
        keyCommands: `Install-WindowsFeature -Name AD-Domain-Services, DNS -IncludeManagementTools
Install-ADDSForest -DomainName "corp.local" -InstallDns:$True -SafeModeAdministratorPassword $SecurePassword -Force`,
        verificationCheck: 'Run "dcdiag /test:DNS /v" and verify all directory tests pass with zero errors.'
      },
      {
        milestone: 'Milestone 2: Configure Corporate DHCP Scope & DNS Forwarders',
        description: 'Create DHCP scope 192.168.10.100 to 192.168.10.200, configure default gateway 192.168.10.1 and DNS server 192.168.10.10.',
        keyCommands: `Add-DhcpServerv4Scope -Name "CorpLAN" -StartRange 192.168.10.100 -EndRange 192.168.10.200 -SubnetMask 255.255.255.0 -State Active
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 -Router 192.168.10.1 -DnsServer 192.168.10.10 -DnsDomain "corp.local"
Set-DnsServerForwarder -IPAddress "1.1.1.1", "8.8.8.8"`,
        verificationCheck: 'Boot CLIENT-01 on same virtual switch; verify it acquires IP via DHCP and resolves corp.local.'
      },
      {
        milestone: 'Milestone 3: Structure Organizational Units (OUs) & Bulk User Provisioning',
        description: 'Build enterprise OU hierarchy (Corporate, Users, Groups, Computers, Tier-1 Servers) and provision 20 users with PowerShell.',
        keyCommands: `New-ADOrganizationalUnit -Name "Corporate" -Path "DC=corp,DC=local"
New-ADOrganizationalUnit -Name "Employees" -Path "OU=Corporate,DC=corp,DC=local"
New-ADGroup -Name "Finance-Dept" -GroupScope Global -Path "OU=Corporate,DC=corp,DC=local"`,
        verificationCheck: 'Run "Get-ADUser -Filter * -SearchBase \'OU=Corporate,DC=corp,DC=local\'" to verify all accounts created.'
      },
      {
        milestone: 'Milestone 4: Departmental File Shares with Access-Based Enumeration (ABE)',
        description: 'Create encrypted SMB share \\\\corp.local\\Shared with explicit NTFS ACLs and Access-Based Enumeration enabled.',
        keyCommands: `New-Item -ItemType Directory -Path "D:\\Shares\\Finance"
New-SmbShare -Name "Finance" -Path "D:\\Shares\\Finance" -ChangeAccess "Finance-Dept" -FullAccess "Domain Admins"
Set-SmbShare -Name "Finance" -FolderEnumerationMode AccessBased -EncryptData $True`,
        verificationCheck: 'Log in as non-finance user; verify the Finance share folder is completely invisible.'
      },
      {
        milestone: 'Milestone 5: Group Policy Hardening & Drive Mapping',
        description: 'Deploy GPOs enforcing password complexity (12 chars), disabling USB mass storage, and automatically mapping Z: drive.',
        keyCommands: `New-GPO -Name "Security-Baseline-Workstations" | New-GPLink -Target "OU=Computers,OU=Corporate,DC=corp,DC=local"
gpupdate /force`,
        verificationCheck: 'Run "gpresult /r" on CLIENT-01 to confirm Security-Baseline-Workstations policy is successfully applied.'
      }
    ],
    productionOutcomes: [
      'Independently deployed enterprise Active Directory domain with zero GUI dependencies',
      'Configured resilient DNS and DHCP services with zero IP conflicts',
      'Automated departmental file permissions and policy distribution via Group Policy'
    ]
  },
  {
    id: 2,
    title: 'Project 2: Linux Application Infrastructure Stack',
    badge: 'Linux & DevSecOps',
    difficulty: 'Intermediate',
    estimatedCompletionTime: '24 Hours',
    summary: 'Build a hardened, production-grade Linux application infrastructure hosting an Angular SPA frontend, clustered Node.js Express API with PM2, PostgreSQL 16 database, Redis caching layer, Nginx reverse proxy with TLS 1.3, and UFW firewall lockdown.',
    architectureBlueprint: `[ Public HTTPS Traffic: 443 ]
              │
              ▼
    [ Nginx Web Server / TLS ]
         /                  \\
        ▼                    ▼
[ Angular SPA ]      [ /api/ Reverse Proxy ]
(/var/www/portal)            │
                             ▼
                 [ Node.js Express API ]
                 (PM2 Cluster on :3000)
                    /              \\
                   ▼                ▼
         [ PostgreSQL 16 ]    [ Redis Cache ]
         (Port 5432)          (Port 6379)`,
    serverRoles: [
      { serverName: 'SRV-LINUX-APP', os: 'Ubuntu Server 24.04 LTS', ip: '10.0.1.50', role: 'Nginx, Angular, PM2, Node.js, PostgreSQL, Redis', specs: '4 vCPU, 8GB RAM, 80GB SSD' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: Operating System & SSH Hardening',
        description: 'Configure Ed25519 SSH keys, disable root and password logins, and enable UFW firewall with rate limiting.',
        keyCommands: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw limit 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable`,
        verificationCheck: 'Attempt password login from secondary terminal; verify SSH server rejects with "Permission denied (publickey)".'
      },
      {
        milestone: 'Milestone 2: PostgreSQL 16 & Redis Optimization',
        description: 'Install PostgreSQL 16 and Redis; create production database and user; enforce SCRAM-SHA-256 and Redis password.',
        keyCommands: `sudo -u postgres psql -c "CREATE USER appuser WITH ENCRYPTED PASSWORD 'StrongSecretPassword99#';"
sudo -u postgres psql -c "CREATE DATABASE app_production OWNER appuser;"
sudo sed -i 's/# requirepass foobared/requirepass EnterpriseRedisPassword123#/' /etc/redis/redis.conf
sudo systemctl restart postgresql redis-server`,
        verificationCheck: 'Execute "redis-cli -a EnterpriseRedisPassword123# ping" and verify it returns "PONG".'
      },
      {
        milestone: 'Milestone 3: Node.js Backend Deployment with PM2 Clustering',
        description: 'Deploy Node.js Express REST API clustered across all CPU cores under dedicated unprivileged service account.',
        keyCommands: `sudo useradd -r -s /bin/false -d /opt/node-api nodeuser
sudo -u nodeuser pm2 start /opt/node-api/ecosystem.config.js --env production
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u nodeuser --hp /opt/node-api
sudo -u nodeuser pm2 save`,
        verificationCheck: 'Run "sudo -u nodeuser pm2 status" and verify 4 instances are online with 0 restarts.'
      },
      {
        milestone: 'Milestone 4: Angular Frontend Build & Nginx Reverse Proxy',
        description: 'Compile Angular production build, copy to /var/www/portal, and configure Nginx with SPA route fallback and /api proxy.',
        keyCommands: `sudo cp -r dist/*/browser/* /var/www/portal/
sudo nginx -t && sudo systemctl reload nginx`,
        verificationCheck: 'Curl localhost and verify index.html returns HTTP 200; curl localhost/api/health and verify API returns JSON.'
      },
      {
        milestone: 'Milestone 5: Automated SSL with Certbot',
        description: 'Acquire production Let’s Encrypt TLS certificate with HTTP-01 challenge and verify automated systemd renewal timer.',
        keyCommands: `sudo certbot --nginx -d portal.company.com --non-interactive --agree-tos -m admin@company.com
sudo systemctl status certbot.timer`,
        verificationCheck: 'Run "curl -Iv https://portal.company.com" and confirm TLS 1.3 handshake with valid Let\'s Encrypt certificate.'
      }
    ],
    productionOutcomes: [
      'Production-hardened Linux application host resilient against brute-force attacks',
      'Zero-downtime rolling restart capability for backend microservices via PM2',
      'Sub-5 millisecond response times on cached API endpoints via in-memory Redis'
    ]
  },
  {
    id: 3,
    title: 'Project 3: Windows Server Application Hosting (IIS & .NET / Angular)',
    badge: 'Windows Enterprise',
    difficulty: 'Intermediate',
    estimatedCompletionTime: '22 Hours',
    summary: 'Deploy an enterprise application hosting platform on Windows Server 2022 using IIS 10, isolated Application Pools, URL Rewrite 2.1 for Angular SPA routing, ARR reverse proxy forwarding to backend services, Centralized Certificate Store, and custom PowerShell health monitoring.',
    architectureBlueprint: `[ Public HTTPS Traffic: 443 ]
              │
              ▼
  [ IIS 10 Web Server (Windows Server 2022) ]
  ├── [ Angular SPA AppPool (No Managed Code) ] ──► Serves C:\\inetpub\\portal
  └── [ URL Rewrite / ARR Reverse Proxy ]
              │ Forward to localhost:5000
              ▼
      [ .NET Core / Spring Boot Backend ]
      (Running as Windows Service)`,
    serverRoles: [
      { serverName: 'SRV-IIS-01', os: 'Windows Server 2022 Standard', ip: '10.0.1.60', role: 'IIS 10 Web Server, ARR Reverse Proxy, Windows Services Host', specs: '4 vCPU, 8GB RAM, 80GB SSD' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: IIS 10 Installation & Feature Hardening',
        description: 'Install IIS with URL Rewrite and ARR modules; remove insecure legacy IIS components.',
        keyCommands: `Install-WindowsFeature -Name Web-Server, Web-WebServer, Web-Common-Http, Web-Static-Content, Web-Http-Redirect, Web-Http-Logging -IncludeManagementTools`,
        verificationCheck: 'Open IIS Manager and verify URL Rewrite and Application Request Routing modules appear.'
      },
      {
        milestone: 'Milestone 2: Configure Angular SPA Site with Isolated AppPool',
        description: 'Create dedicated AppPool running under ApplicationPoolIdentity with No Managed Code, and deploy web.config.',
        keyCommands: `New-WebAppPool -Name "AngularPool"
Set-ItemProperty -Path "IIS:\\AppPools\\AngularPool" -Name "managedRuntimeVersion" -Value ""
New-Website -Name "AngularPortal" -Port 80 -PhysicalPath "C:\\inetpub\\portal" -ApplicationPool "AngularPool"`,
        verificationCheck: 'Browse to deep route http://localhost/dashboard/settings and verify page loads without HTTP 404.'
      },
      {
        milestone: 'Milestone 3: Bind SSL Certificate with SNI',
        description: 'Import enterprise TLS certificate and bind to port 443 with Server Name Indication enabled.',
        keyCommands: `New-WebBinding -Name "AngularPortal" -IPAddress "*" -Port 443 -Protocol https -SslFlags 1`,
        verificationCheck: 'Run "netsh http show sslcert" and verify certificate hash is bound to port 443.'
      },
      {
        milestone: 'Milestone 4: Configure IIS Application Initialization & Warm-Up',
        description: 'Configure IIS preload to eliminate cold-start latency for web applications.',
        keyCommands: `Set-ItemProperty -Path "IIS:\\Sites\\AngularPortal" -Name "applicationDefaults.preloadEnabled" -Value $True
Set-ItemProperty -Path "IIS:\\AppPools\\AngularPool" -Name "startMode" -Value "AlwaysRunning"`,
        verificationCheck: 'Restart AppPool; verify w3wp.exe process spawns immediately without waiting for first user HTTP request.'
      }
    ],
    productionOutcomes: [
      'High-performance Windows IIS server hosting modern Angular SPA applications',
      'Configured zero-cold-start AppPool initialization and isolated security identities',
      'Protected application from header leakage and unhandled rewrite errors'
    ]
  },
  {
    id: 4,
    title: 'Project 4: Enterprise Multi-Server Infrastructure Deployment',
    badge: 'Multi-Server Enterprise',
    difficulty: 'Senior',
    estimatedCompletionTime: '35 Hours',
    summary: 'Deploy a segmented 6-server enterprise infrastructure: Primary Domain Controller (Windows Server), Secondary DC, Dedicated SMB/NFS File Server with DFS, Linux Application Server (Ubuntu + Nginx + Node), Clustered PostgreSQL Database Server (Rocky Linux), and Centralized Monitoring Server (Prometheus + Grafana).',
    architectureBlueprint: `               [ pfSense Firewall Router (10.0.0.1) ]
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
  VLAN 10: Identity         VLAN 20: Storage & App     VLAN 30: Database
  [ DC-PRIMARY (10.0.10.10) ] [ FILE-SRV (10.0.20.10) ]  [ DB-MASTER (10.0.30.10) ]
  [ DC-REPLICA (10.0.10.11) ] [ APP-LINUX (10.0.20.20) ] [ DB-STANDBY (10.0.30.11)]
                                   │
                                   ▼
                            VLAN 100: Management
                            [ MONITOR-SRV (10.0.100.10): Prometheus & Grafana ]`,
    serverRoles: [
      { serverName: 'DC-PRIMARY', os: 'Windows Server 2022', ip: '10.0.10.10', role: 'Active Directory Primary DC, DNS, FSMO Master', specs: '2 vCPU, 4GB RAM' },
      { serverName: 'DC-REPLICA', os: 'Windows Server 2022', ip: '10.0.10.11', role: 'Secondary DC, DHCP Failover Partner', specs: '2 vCPU, 4GB RAM' },
      { serverName: 'FILE-SRV', os: 'Windows Server 2022', ip: '10.0.20.10', role: 'DFS Namespace, FSRM Ransomware Screen, SMB Share', specs: '2 vCPU, 4GB RAM' },
      { serverName: 'APP-LINUX', os: 'Ubuntu Server 24.04', ip: '10.0.20.20', role: 'Nginx Ingress, Angular, Node.js API Service', specs: '4 vCPU, 8GB RAM' },
      { serverName: 'DB-MASTER', os: 'Rocky Linux 9', ip: '10.0.30.10', role: 'PostgreSQL 16 Primary with Streaming Replication', specs: '4 vCPU, 8GB RAM' },
      { serverName: 'MONITOR-SRV', os: 'Ubuntu Server 24.04', ip: '10.0.100.10', role: 'Prometheus, Grafana, Alertmanager, Loki', specs: '2 vCPU, 4GB RAM' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: Network Segmentation & Inter-VLAN Routing',
        description: 'Configure 4 isolated VLANs on virtual router with strict ACLs preventing direct access to database tier.',
        keyCommands: `echo "VLAN 10 (Identity), VLAN 20 (App/Storage), VLAN 30 (Database), VLAN 100 (Management)"`,
        verificationCheck: 'Ping from APP-LINUX to DB-MASTER on 5432 succeeds; ping on all other ports blocked by firewall.'
      },
      {
        milestone: 'Milestone 2: Multi-DC Active Directory & Replication',
        description: 'Promote secondary DC and verify bidirectional replication across VLAN boundaries.',
        keyCommands: `Install-ADDSDomainController -DomainName "corp.local" -Credential $Cred -InstallDns:$True
repadmin /replsummary`,
        verificationCheck: 'Verify repadmin /replsummary reports 0 failures and delta < 5 minutes.'
      },
      {
        milestone: 'Milestone 3: PostgreSQL Streaming Replication across Database Nodes',
        description: 'Configure real-time WAL streaming replication from DB-MASTER to DB-STANDBY.',
        keyCommands: `sudo -u postgres pg_basebackup -h 10.0.30.10 -D /var/lib/postgresql/16/main -U replicator -P -v -R`,
        verificationCheck: 'Execute query on master; verify record appears on standby in under 50 milliseconds.'
      },
      {
        milestone: 'Milestone 4: Prometheus & Grafana Fleet Telemetry',
        description: 'Deploy Node Exporter and Windows Exporter across all 6 servers; aggregate metrics in Prometheus.',
        keyCommands: `curl -s http://10.0.100.10:9090/api/v1/targets | jq .data.activeTargets[].discoveredLabels.__address__`,
        verificationCheck: 'Open Grafana dashboard; verify all 6 servers display real-time CPU, RAM, disk, and network graphs.'
      }
    ],
    productionOutcomes: [
      'Engineered complete enterprise topology with zero single points of failure across identity and data',
      'Implemented strict Zero-Trust network segmentation separating web from database tiers',
      'Full-stack real-time telemetry alerting systems administrator to hardware or service degradation'
    ]
  },
  {
    id: 5,
    title: 'Project 5: Production Cloud Deployment (AWS / Azure VPC)',
    badge: 'Cloud Infrastructure',
    difficulty: 'Senior',
    estimatedCompletionTime: '30 Hours',
    summary: 'Architect and deploy an enterprise cloud infrastructure: Multi-Availability Zone VPC with public/private subnet segmentation, Application Load Balancer with SSL termination, Auto Scaling Group running containerized workloads, Multi-AZ Managed PostgreSQL database, and automated S3 backup lifecycle.',
    architectureBlueprint: `                 [ AWS Route 53 / Azure DNS ]
                               │
                               ▼
        [ Multi-AZ Application Load Balancer (ALB) ]
               /                                  \\
              ▼                                    ▼
┌───────────────────────────┐        ┌───────────────────────────┐
│ AZ-1 (Subnet 10.0.1.0/24) │        │ AZ-2 (Subnet 10.0.2.0/24) │
│ [ EC2 Web/App AutoScale ] │        │ [ EC2 Web/App AutoScale ] │
│             │             │        │             │             │
│             ▼             │        │             ▼             │
│ [ RDS PostgreSQL Primary ]│◄───────┼────────────►[ RDS Standby]│
└───────────────────────────┘ Sync Replication └───────────────────────────┘`,
    serverRoles: [
      { serverName: 'ALB-PUBLIC', os: 'AWS Managed', ip: 'Public Anycast', role: 'SSL Termination, Path Routing, Health Checking', specs: 'Elastic' },
      { serverName: 'EC2-APP-ASG', os: 'Amazon Linux 2023', ip: '10.0.1.50 / 10.0.2.50 (Private)', role: 'Dockerized Angular & Node.js Workloads', specs: '2x t3.medium (2 vCPU, 4GB RAM)' },
      { serverName: 'RDS-POSTGRES', os: 'AWS Managed RDS', ip: 'Private DB Subnets', role: 'Multi-AZ High Availability PostgreSQL 16', specs: 'db.m6i.large (2 vCPU, 8GB RAM)' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: VPC Architecture & Route Table Design',
        description: 'Create VPC (10.0.0.0/16) with 2 public subnets, 2 private application subnets, and 2 isolated database subnets.',
        keyCommands: `aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=prod-vpc}]'`,
        verificationCheck: 'Verify Route Tables route outbound internet from private subnets through NAT Gateway.'
      },
      {
        milestone: 'Milestone 2: Security Groups Least Privilege Hardening',
        description: 'Configure Security Groups ensuring DB accepts connections ONLY from Application Security Group.',
        keyCommands: `aws ec2 authorize-security-group-ingress --group-id sg-db --protocol tcp --port 5432 --source-group sg-app`,
        verificationCheck: 'Attempt direct connection to DB from outside application security group; verify timeout.'
      },
      {
        milestone: 'Milestone 3: Auto Scaling Group & Application Load Balancer',
        description: 'Configure ALB target group with /healthz probe and ASG scaling policy based on CPU utilization > 70%.',
        keyCommands: `aws autoscaling create-auto-scaling-group --auto-scaling-group-name prod-asg --launch-template LaunchTemplateName=prod-template --min-size 2 --max-size 6`,
        verificationCheck: 'Run Apache Bench load test; verify ASG automatically provisions new EC2 instance in AZ-2.'
      }
    ],
    productionOutcomes: [
      'Elastic cloud topology capable of handling sudden 10x traffic spikes automatically',
      'Zero database credentials exposed in application code via AWS IAM Instance Roles',
      'Automated multi-AZ failover guaranteeing 99.99% infrastructure uptime'
    ]
  },
  {
    id: 6,
    title: 'Project 6: High Availability & Disaster Recovery Clustering',
    badge: 'Mission-Critical DR',
    difficulty: 'Expert',
    estimatedCompletionTime: '40 Hours',
    summary: 'Build high-availability active-passive cluster with automated failover: Windows Failover Cluster (WSFC) or Linux Pacemaker/Corosync with STONITH fencing, PostgreSQL Patroni with etcd consensus, floating Virtual IP (VIP), and continuous offsite replication meeting RTO < 15 minutes and RPO < 1 minute.',
    architectureBlueprint: `               [ Floating Virtual IP: 10.0.1.100 ]
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [ NODE-01 (Primary) ]           [ NODE-02 (Standby) ]
       - Pacemaker / WSFC              - Pacemaker / WSFC
       - Patroni Leader (Read/Write)   - Patroni Follower (Read-Only)
       - Local Storage Sync            - Storage Mirror Target
               │                               │
               └───────────────┬───────────────┘
                               │ Heartbeat & Quorum Link
                               ▼
               [ CLUSTER-WITNESS (Quorum Arbiter) ]`,
    serverRoles: [
      { serverName: 'NODE-01', os: 'Rocky Linux 9', ip: '10.0.1.10', role: 'Cluster Active Primary, Patroni Leader, DB Read/Write', specs: '4 vCPU, 16GB RAM' },
      { serverName: 'NODE-02', os: 'Rocky Linux 9', ip: '10.0.1.11', role: 'Cluster Hot Standby, Patroni Follower', specs: '4 vCPU, 16GB RAM' },
      { serverName: 'WITNESS-01', os: 'Rocky Linux 9 / Cloud', ip: '10.0.1.12', role: 'etcd Quorum Witness, Split-Brain Arbiter', specs: '1 vCPU, 2GB RAM' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: Corosync & Pacemaker Cluster Initialization',
        description: 'Initialize Corosync ring with dedicated heartbeat network and configure STONITH fencing agents.',
        keyCommands: `pcs cluster auth node01 node02 -u hacluster
pcs cluster setup prod_cluster node01 node02
pcs cluster start --all`,
        verificationCheck: 'Run "pcs status" and verify cluster is quorate and both nodes show status Online.'
      },
      {
        milestone: 'Milestone 2: Configure Floating Virtual IP Resource',
        description: 'Create IPaddr2 resource that floats between cluster nodes based on primary role availability.',
        keyCommands: `pcs resource create VirtualIP ocf:heartbeat:IPaddr2 ip=10.0.1.100 cidr_netmask=24 op monitor interval=5s`,
        verificationCheck: 'Simulate power crash on NODE-01; verify VirtualIP binds to NODE-02 in under 3 seconds.'
      },
      {
        milestone: 'Milestone 3: Patroni PostgreSQL Automated Failover with etcd',
        description: 'Deploy Patroni managing PostgreSQL 16 with etcd distributed consensus.',
        keyCommands: `patronictl -c /etc/patroni/patroni.yml list`,
        verificationCheck: 'Run "patronictl switchover" and observe seamless database master handoff without dropped writes.'
      }
    ],
    productionOutcomes: [
      'Engineered automated database failover completing in under 3 seconds',
      'Eliminated split-brain risks using hardware STONITH fencing agents',
      'Validated RTO and RPO metrics through measured live cutover drills'
    ]
  },
  {
    id: 7,
    title: 'Project 7: Hybrid Enterprise Infrastructure (On-Prem + Cloud Mesh)',
    badge: 'Hybrid Cloud Master',
    difficulty: 'Expert',
    estimatedCompletionTime: '45 Hours',
    summary: 'Grand synthesis enterprise project: Interconnect on-premises Active Directory and VMware/Hyper-V servers directly with an AWS/Azure cloud VPC over a redundant Site-to-Site IPsec VPN tunnel with BGP dynamic routing, Microsoft Entra Connect hybrid identity sync, centralized Prometheus monitoring, and cloud-to-on-prem disaster recovery replication.',
    architectureBlueprint: `┌──────────────────────────────────┐        ┌──────────────────────────────────┐
│ ON-PREMISES DATACENTER           │        │ AWS / AZURE CLOUD VPC            │
│ [ DC-PRIMARY: 10.100.10.10 ]     │        │ [ Cloud Angular/Node Workloads ] │
│ [ Core DB: 10.100.20.50 ]        │        │ [ Cloud Ingress ALB ]            │
│ [ Microsoft Entra Connect Sync ] ├──BGP──►│ [ Cloud Entra ID / Azure AD ]    │
│ [ On-Prem VPN Router ]           │ IPsec  │ [ Cloud Virtual Private Gateway ]│
└──────────────────────────────────┘ Tunnel └──────────────────────────────────┘`,
    serverRoles: [
      { serverName: 'ONPREM-DC-01', os: 'Windows Server 2022', ip: '10.100.10.10', role: 'On-Premises Domain Controller, Entra Connect Master', specs: '4 vCPU, 8GB RAM' },
      { serverName: 'ONPREM-DB-01', os: 'Windows Server 2022', ip: '10.100.20.50', role: 'Core Enterprise SQL Server Database', specs: '8 vCPU, 32GB RAM' },
      { serverName: 'CLOUD-APP-ASG', os: 'Ubuntu Server 24.04', ip: '10.200.1.0/24', role: 'Public-Facing Elastic Cloud Application Tier', specs: 'Auto Scaling' }
    ],
    stepByStepMilestones: [
      {
        milestone: 'Milestone 1: IPsec Site-to-Site VPN with BGP Dynamic Routing',
        description: 'Establish redundant IPsec tunnels between on-premises gateway and cloud virtual gateway using BGP ASN routing.',
        keyCommands: `echo "BGP Neighbor 169.254.10.1 Remote-AS 64512 Established. Routes 10.200.0.0/16 learned."`,
        verificationCheck: 'Ping from on-prem host (10.100.10.10) to cloud private VM (10.200.1.50); verify sub-20ms latency.'
      },
      {
        milestone: 'Milestone 2: Hybrid Identity with Microsoft Entra Connect',
        description: 'Deploy Microsoft Entra Connect on on-prem DC; synchronize 100 on-prem user accounts to Entra ID with Password Hash Sync.',
        keyCommands: `Import-Module ADSync
Start-ADSyncSyncCycle -PolicyType Delta`,
        verificationCheck: 'Log into Microsoft 365 cloud portal using on-prem Active Directory credentials.'
      },
      {
        milestone: 'Milestone 3: Cross-Environment Cloud Disaster Recovery Orchestration',
        description: 'Configure automated replication of on-prem virtual machines to cloud storage for emergency failover.',
        keyCommands: `echo "Veeam Cloud Connect / Azure Site Recovery continuous replication active."`,
        verificationCheck: 'Simulate on-prem server shutdown; initiate test failover in cloud VPC and verify operational boot.'
      }
    ],
    productionOutcomes: [
      'Unified enterprise networking spanning physical datacenter and public cloud',
      'Single Sign-On (SSO) hybrid identity synchronized in real-time across cloud and on-prem',
      'Bulletproof disaster recovery capability protecting physical operations against regional disasters'
    ]
  }
];
