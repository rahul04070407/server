export interface ArchitectureTopologyNode {
  name: string;
  role: string;
  ip: string;
  os: string;
  ports: string;
}

export interface ArchitectureItem {
  id: number;
  title: string;
  badge: string;
  summary: string;
  whenCompaniesUseIt: string;
  advantages: string[];
  disadvantages: string[];
  topologyNodes: ArchitectureTopologyNode[];
  dataFlow: string[];
  firewallRules: { source: string; destination: string; port: string; action: string; purpose: string }[];
  failoverStrategy: string;
  costAndResourceReqs: string;
  asciiDiagram: string;
}

export const ARCHITECTURES_DATA: ArchitectureItem[] = [
  {
    id: 1,
    title: 'Single-Server Architecture (All-in-One)',
    badge: 'Starter / Lab / Small Biz',
    summary: 'A single physical or virtual machine hosting the web server (Nginx/IIS), application runtime (Node.js/Spring Boot), and database engine (PostgreSQL/SQL Server) on the same operating system.',
    whenCompaniesUseIt: 'Used for internal development environments, proof-of-concept (PoC) validation, staging sandboxes, or very small retail businesses with under 25 employees and low traffic.',
    advantages: [
      'Minimal infrastructure cost (single server license / single VM footprint)',
      'Zero inter-server network latency: Web, App, and DB communicate over localhost loopback (127.0.0.1) or UNIX domain sockets',
      'Extremely simple backup routines (single image-level snapshot or file backup)'
    ],
    disadvantages: [
      'Single Point of Failure (SPOF): if the host OS crashes or the CPU hits 100%, the entire business operation halts',
      'Resource contention: a heavy database query starves the web server of RAM and CPU cycles',
      'Zero security segmentation: compromising the public web server immediately compromises the database storage'
    ],
    topologyNodes: [
      { name: 'SRV-ALLINONE', role: 'Web Server (Nginx) + App (Node.js) + DB (PostgreSQL)', ip: '192.168.10.15', os: 'Ubuntu Server 24.04 LTS', ports: '80, 443 (External) / 3000, 5432 (Localhost only)' }
    ],
    dataFlow: [
      '1. Client sends HTTPS request on port 443 to 192.168.10.15.',
      '2. Nginx terminates TLS and serves static Angular files or reverse proxies /api requests to 127.0.0.1:3000.',
      '3. Node.js backend processes business logic and queries PostgreSQL over localhost socket 127.0.0.1:5432.',
      '4. PostgreSQL returns query results over localhost; Node.js returns JSON to Nginx; Nginx encrypts response back to client.'
    ],
    firewallRules: [
      { source: 'Internet / LAN', destination: 'SRV-ALLINONE', port: '443 / TCP', action: 'ALLOW', purpose: 'Public HTTPS traffic' },
      { source: 'Internet / LAN', destination: 'SRV-ALLINONE', port: '80 / TCP', action: 'ALLOW', purpose: 'HTTP to HTTPS redirect only' },
      { source: 'Management Jump Host', destination: 'SRV-ALLINONE', port: '22 / TCP', action: 'ALLOW', purpose: 'Administrative SSH access' },
      { source: 'Any', destination: 'SRV-ALLINONE', port: '5432 / TCP', action: 'DENY', purpose: 'Block external database access' }
    ],
    failoverStrategy: 'No automatic failover. Recovery relies entirely on scheduled nocturnal VM backups and cold restoration on spare hardware (RTO: 4-8 hours, RPO: 24 hours).',
    costAndResourceReqs: 'Lowest cost: 4 vCPU, 8-16 GB RAM, 100 GB SSD. Single VM or basic cloud instance (~$40-$80/month).',
    asciiDiagram: `[ Client Browser ]
        │ HTTPS (443)
        ▼
┌──────────────────────────────────────────────┐
│  SRV-ALLINONE (192.168.10.15)                │
│                                              │
│  [ Nginx Web Server ] (Port 80/443)          │
│        │ Proxy pass (127.0.0.1:3000)         │
│        ▼                                     │
│  [ Node.js / Spring App ]                    │
│        │ Local query (127.0.0.1:5432)        │
│        ▼                                     │
│  [ PostgreSQL Database ]                     │
└──────────────────────────────────────────────┘`
  },
  {
    id: 2,
    title: 'Two-Tier Architecture (Web/App Tier + Dedicated DB Tier)',
    badge: 'Growing Business',
    summary: 'Separates compute and business logic from data persistence. The Web Server and Application runtime reside on Tier 1, while the Database resides on an isolated Tier 2 server.',
    whenCompaniesUseIt: 'Standard entry-level production architecture for small-to-medium businesses (SMBs), SaaS startups, and internal company portals with 50-200 concurrent users.',
    advantages: [
      'Eliminates resource contention: database indexing and memory buffers do not compete with web traffic',
      'Enhanced security: the database server is placed on a private subnet and has zero public IP exposure',
      'Independent scalability: CPU on the web tier can be scaled up or down without modifying database storage'
    ],
    disadvantages: [
      'Web/App server remains a single point of failure without load balancing',
      'Database server is still standalone without automated replication or failover',
      'Introduces network latency between web server and database server'
    ],
    topologyNodes: [
      { name: 'WEB-APP-01', role: 'Nginx Reverse Proxy + Angular SPA + Node.js API', ip: '10.0.1.10 (Public/DMZ)', os: 'Ubuntu Server 24.04', ports: '80, 443, 22' },
      { name: 'DB-SRV-01', role: 'Dedicated PostgreSQL or SQL Server Database', ip: '10.0.2.20 (Private Subnet)', os: 'Rocky Linux 9 or Windows Server', ports: '5432 or 1433' }
    ],
    dataFlow: [
      '1. User hits public IP on WEB-APP-01 over HTTPS 443.',
      '2. WEB-APP-01 serves Angular frontend assets and executes Node.js backend logic.',
      '3. Node.js initiates TCP socket connection to DB-SRV-01 at 10.0.2.20:5432 through internal firewall.',
      '4. DB-SRV-01 executes SQL query and returns datasets back across private network link.'
    ],
    firewallRules: [
      { source: '0.0.0.0/0 (Internet)', destination: 'WEB-APP-01', port: '443 / TCP', action: 'ALLOW', purpose: 'Public HTTPS Web traffic' },
      { source: '10.0.1.10 (WEB-APP-01)', destination: 'DB-SRV-01 (10.0.2.20)', port: '5432 / TCP', action: 'ALLOW', purpose: 'Backend database connection' },
      { source: '0.0.0.0/0 (Internet)', destination: 'DB-SRV-01', port: 'ANY', action: 'DENY', purpose: 'Complete isolation of database' },
      { source: 'Management VLAN', destination: 'All Nodes', port: '22 / TCP', action: 'ALLOW', purpose: 'Administrative SSH' }
    ],
    failoverStrategy: 'Database uses automated hourly differential backups pushed to offsite storage. If WEB-APP-01 crashes, a templated VM clone can be spun up in 15 minutes pointing to the existing DB-SRV-01.',
    costAndResourceReqs: 'Moderate: 2 VMs (Web: 4 vCPU/8GB RAM, DB: 4 vCPU/16GB RAM with dedicated SSD storage pool). ~$150-$250/month.',
    asciiDiagram: `[ Client Browser ]
        │ HTTPS (443)
        ▼
┌─────────────────────────────────┐
│  Tier 1: WEB-APP-01 (10.0.1.10) │
│  [ Nginx + Angular + Node.js ]  │
└────────────────┬────────────────┘
                 │ TCP 5432 (Internal Private Subnet)
                 ▼
┌─────────────────────────────────┐
│  Tier 2: DB-SRV-01 (10.0.2.20)  │
│  [ Dedicated PostgreSQL Server] │
└─────────────────────────────────┘`
  },
  {
    id: 3,
    title: 'Three-Tier Architecture (Web Presentation + App Logic + Database)',
    badge: 'Enterprise Standard',
    summary: 'The classic enterprise topology separating Presentation (Web), Business Logic (Application), and Data Persistence (Database) into three completely isolated network zones.',
    whenCompaniesUseIt: 'Mandated by banking, healthcare, e-commerce, and enterprise compliance frameworks (PCI-DSS, HIPAA) to prevent web vulnerabilities from accessing databases.',
    advantages: [
      'Maximum security isolation: Application and Database tiers are completely invisible to external users',
      'Granular horizontal scaling: can scale 5 Web servers, 8 App servers, and a Clustered DB independently',
      'Modular updates: frontend presentation code can be updated without restarting backend services'
    ],
    disadvantages: [
      'Higher architectural complexity requiring multiple VLANs and internal routing rules',
      'Increased infrastructure costs across 3 distinct server clusters',
      'Requires load balancing between Web and App tiers'
    ],
    topologyNodes: [
      { name: 'LB-EDGE-01', role: 'HAProxy / AWS Application Load Balancer', ip: '198.51.100.5 (Public)', os: 'Linux / Cloud Managed', ports: '80, 443' },
      { name: 'WEB-TIER (2x)', role: 'Nginx Web Servers hosting Angular SPA', ip: '10.0.1.11, 10.0.1.12 (DMZ Subnet)', os: 'Ubuntu Server 24.04', ports: '80, 443' },
      { name: 'APP-TIER (2x)', role: 'Spring Boot / Node.js API Microservices', ip: '10.0.2.21, 10.0.2.22 (App Subnet)', os: 'Ubuntu Server 24.04', ports: '8080' },
      { name: 'DB-TIER (Primary)', role: 'PostgreSQL Primary Database Node', ip: '10.0.3.31 (Data Subnet)', os: 'Rocky Linux 9', ports: '5432' }
    ],
    dataFlow: [
      '1. Edge Load Balancer terminates TLS and routes HTTP requests to Web Tier instances in DMZ.',
      '2. Web Tier serves Angular SPA bundle; API calls are reverse-proxied to App Tier at 10.0.2.x:8080.',
      '3. App Tier validates business logic and executes parameterized queries to Database Tier at 10.0.3.31:5432.',
      '4. Strict firewall prevents Web Tier from ever contacting Database Tier directly.'
    ],
    firewallRules: [
      { source: 'Internet', destination: 'Edge LB', port: '443 / TCP', action: 'ALLOW', purpose: 'Public HTTPS entry' },
      { source: 'Edge LB', destination: 'WEB-TIER (DMZ)', port: '80 / TCP', action: 'ALLOW', purpose: 'Internal unencrypted web ingress' },
      { source: 'WEB-TIER (DMZ)', destination: 'APP-TIER', port: '8080 / TCP', action: 'ALLOW', purpose: 'REST API calls' },
      { source: 'WEB-TIER (DMZ)', destination: 'DB-TIER', port: 'ANY', action: 'DENY', purpose: 'Block direct DB access from DMZ' },
      { source: 'APP-TIER', destination: 'DB-TIER', port: '5432 / TCP', action: 'ALLOW', purpose: 'Database SQL connections' }
    ],
    failoverStrategy: 'Load Balancer automatically removes dead Web or App instances. Database uses streaming replication with automated Patroni / etcd failover.',
    costAndResourceReqs: 'Requires minimum 6 VMs across 3 subnets. Hardware budget: 24 vCPUs, 64 GB RAM total. Cloud budget: ~$500-$900/month.',
    asciiDiagram: `[ Public Internet ]
        │ HTTPS (443)
        ▼
┌────────────────────────────────────────────────────────┐
│  Edge Load Balancer (HAProxy / AWS ALB)                │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│ Tier 1: WEB-01 (DMZ)    │    │ Tier 1: WEB-02 (DMZ)    │
│ [ Nginx + Angular SPA ] │    │ [ Nginx + Angular SPA ] │
└───────────────┬─────────┘    └─────────┬───────────────┘
                │                        │
                └───────────┬────────────┘
                            │ Reverse Proxy (Port 8080)
                            ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│ Tier 2: APP-01 (Private)│    │ Tier 2: APP-02 (Private)│
│ [ Spring Boot / Node ]  │    │ [ Spring Boot / Node ]  │
└───────────────┬─────────┘    └─────────┬───────────────┘
                │                        │
                └───────────┬────────────┘
                            │ SQL Queries (Port 5432)
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 3: DB-PRIMARY (Isolated Data Subnet)              │
│ [ PostgreSQL Master / MSSQL Always On ]                │
└────────────────────────────────────────────────────────┘`
  },
  {
    id: 4,
    title: 'Multi-Tier Enterprise Architecture (Edge, DMZ, App, Data, Management)',
    badge: 'Large Enterprise',
    summary: 'Comprehensive enterprise framework featuring Web Application Firewalls (WAF), caching tiers (Redis), messaging queues (RabbitMQ), segregated Active Directory management planes, and centralized observability.',
    whenCompaniesUseIt: 'Standard for corporations with 500+ employees, high-volume transactional platforms, financial institutions, and global digital services.',
    advantages: [
      'Zero-Trust isolation across every functional layer',
      'Massive concurrency handling via in-memory caching and asynchronous message buffering',
      'Dedicated out-of-band management network preventing administrative compromise'
    ],
    disadvantages: [
      'High administrative overhead requiring dedicated infrastructure, network, and database specialists',
      'Substantial hardware footprint and licensing commitments',
      'Complex troubleshooting requiring centralized logging (ELK / Loki) to trace transactions'
    ],
    topologyNodes: [
      { name: 'WAF-EDGE', role: 'Cloudflare / F5 BIG-IP WAF + DDoS Shield', ip: 'Edge Anycast', os: 'Appliance', ports: '443' },
      { name: 'DMZ-WEB-FARM', role: '3x Nginx Web Cluster with SSL Offloading', ip: '10.10.1.0/24', os: 'Ubuntu Server', ports: '443' },
      { name: 'CACHE-CLUSTER', role: 'Redis Cluster for Sessions & Rate Limiting', ip: '10.10.2.0/24', os: 'Rocky Linux', ports: '6379' },
      { name: 'APP-CLUSTER', role: 'Kubernetes / Spring Boot Service Mesh', ip: '10.10.3.0/24', os: 'Enterprise Linux', ports: '8080' },
      { name: 'QUEUE-CLUSTER', role: 'RabbitMQ / Kafka Event Bus', ip: '10.10.4.0/24', os: 'Ubuntu Server', ports: '5672' },
      { name: 'DB-CLUSTER', role: 'SQL Always On / PostgreSQL HA Cluster', ip: '10.10.5.0/24', os: 'Windows / RHEL', ports: '1433/5432' },
      { name: 'MGMT-PLANE', role: 'Domain Controllers, Prometheus, Grafana, Jumpbox', ip: '10.10.100.0/24', os: 'Windows Server / Linux', ports: 'Dedicated' }
    ],
    dataFlow: [
      '1. Client request inspected by WAF for SQL injection/XSS; forwarded to DMZ Web Farm.',
      '2. Web server checks Redis Cache Cluster for pre-computed response; returns cached payload instantly if hit.',
      '3. On cache miss, request hits App Service Mesh; App queries DB Cluster or pushes background task to RabbitMQ.',
      '4. All layers emit telemetry streams to Management Plane (Prometheus/Loki).'
    ],
    firewallRules: [
      { source: 'WAF', destination: 'DMZ Web Farm', port: '443', action: 'ALLOW', purpose: 'Filtered HTTP traffic' },
      { source: 'DMZ Web Farm', destination: 'Cache Cluster', port: '6379', action: 'ALLOW', purpose: 'Session & read cache' },
      { source: 'DMZ Web Farm', destination: 'App Cluster', port: '8080', action: 'ALLOW', purpose: 'Business API calls' },
      { source: 'App Cluster', destination: 'Queue Cluster', port: '5672', action: 'ALLOW', purpose: 'Message publishing' },
      { source: 'App Cluster', destination: 'DB Cluster', port: '1433 / 5432', action: 'ALLOW', purpose: 'ACID transactions' }
    ],
    failoverStrategy: 'Multi-layer redundancy: Active-Active Web/App instances, Redis Sentinel automatic failover, and Synchronous DB replication with zero RPO.',
    costAndResourceReqs: 'Enterprise budget: 15-30 VMs or physical blades, dual SAN arrays, redundant switches. ~$2,500 - $8,000/month.',
    asciiDiagram: `[ WAF & DDoS Shield (Cloudflare / F5) ]
                    │ HTTPS 443
                    ▼
┌────────────────────────────────────────────────────────┐
│ DMZ Web Farm (Nginx Cluster)                           │
└────────┬───────────────────────────────┬───────────────┘
         │ Session Cache (6379)          │ API Requests (8080)
         ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│ Redis In-Memory Cluster │    │ Application Mesh        │
└─────────────────────────┘    └────────┬───────────────┬┘
                                        │               │
                     Asynchronous Tasks │ 5672          │ SQL Queries (5432)
                                        ▼               ▼
                      ┌───────────────────────┐   ┌───────────────────────┐
                      │ RabbitMQ Event Broker │   │ PostgreSQL HA Cluster │
                      └───────────────────────┘   └───────────────────────┘`
  },
  {
    id: 5,
    title: 'On-Premises Corporate Office Infrastructure',
    badge: 'On-Premises Enterprise',
    summary: 'Traditional corporate local infrastructure running on physical server racks within the company building, providing Active Directory, file shares, print queues, and local DHCP/DNS.',
    whenCompaniesUseIt: 'Standard for physical corporate headquarters, manufacturing plants, legal firms, and institutions requiring total physical data custody and low-latency LAN access.',
    advantages: [
      'Complete physical ownership and sovereignty over hardware, storage drives, and data',
      'No recurring cloud compute bandwidth or egress charges',
      'Lightning-fast Gigabit/10G LAN speeds for large CAD, video, and accounting file transfers'
    ],
    disadvantages: [
      'Heavy upfront Capital Expenditure (CapEx) for server chassis, racks, UPS, and climate control',
      'Company is solely responsible for power redundancy, cooling, physical security, and hardware replacements',
      'Office internet fiber cuts disable remote employee access'
    ],
    topologyNodes: [
      { name: 'ROUTER-FW', role: 'pfSense / FortiGate Dual WAN Firewall', ip: '192.168.1.1 (Gateway)', os: 'FortiOS / FreeBSD', ports: 'WAN/LAN' },
      { name: 'CORE-SW01', role: 'Layer 3 48-Port PoE+ Managed Switch', ip: '192.168.1.2', os: 'Switch Firmware', ports: 'VLAN 10, 20, 30, 40' },
      { name: 'DC-01', role: 'Primary Domain Controller + DNS + DHCP', ip: '192.168.10.10', os: 'Windows Server 2022', ports: '53, 88, 389, 445' },
      { name: 'FILE-SRV-01', role: 'Windows SMB File Server + FSRM Quotas', ip: '192.168.10.20', os: 'Windows Server 2022', ports: '445' },
      { name: 'BACKUP-NAS', role: 'Synology / TrueNAS Backup Storage', ip: '192.168.10.99', os: 'TrueNAS CORE', ports: '2049, 445' }
    ],
    dataFlow: [
      '1. Employee PC boots up on VLAN 20; DHCP relay sends request to DC-01; receives IP 192.168.20.105.',
      '2. Employee logs in; Kerberos ticket requested from DC-01 (port 88); GPO policies downloaded.',
      '3. Network drive mapped automatically to \\\\FILE-SRV-01\\Engineering; files opened at 1 Gbps wire speed.',
      '4. Nocturnal Veeam backup pulls image deltas from DC-01 and FILE-SRV-01 to BACKUP-NAS.'
    ],
    firewallRules: [
      { source: 'VLAN 20 (Workstations)', destination: 'DC-01', port: '88, 53, 389, 445', action: 'ALLOW', purpose: 'Domain authentication & DNS' },
      { source: 'VLAN 20 (Workstations)', destination: 'FILE-SRV-01', port: '445', action: 'ALLOW', purpose: 'SMB File sharing' },
      { source: 'VLAN 30 (Guest Wi-Fi)', destination: 'All Internal VLANs', port: 'ANY', action: 'DENY', purpose: 'Complete guest isolation' },
      { source: 'VLAN 30 (Guest Wi-Fi)', destination: 'WAN (Internet)', port: '80, 443, 53', action: 'ALLOW', purpose: 'Internet browsing only' }
    ],
    failoverStrategy: 'Secondary DC (DC-02) ensures continuous authentication during DC-01 patching. Dual redundant UPS batteries sustain 45 minutes of power during grid blackouts.',
    costAndResourceReqs: 'CapEx: $15,000 - $35,000 upfront hardware + $150/month electricity/cooling maintenance.',
    asciiDiagram: `[ Dual Fiber WAN ] ──► [ FortiGate / pfSense Firewall ]
                                │ Trunk 802.1Q
                                ▼
                   [ Core Managed Layer 3 Switch ]
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  VLAN 10: Servers       VLAN 20: Workstations   VLAN 30: Guest Wi-Fi
  [ DC-01 (AD/DNS) ]     [ 150x Desktop PCs ]    [ Isolated Mobile ]
  [ FILE-SRV-01 ]
  [ BACKUP-NAS ]`
  },
  {
    id: 6,
    title: 'Cloud Infrastructure (AWS / Azure / GCP Production)',
    badge: 'Cloud Native',
    summary: 'Fully virtualized cloud environment leveraging multi-Availability Zone (AZ) redundancy, managed databases (RDS/Cloud SQL), elastic load balancers, and autoscaling groups.',
    whenCompaniesUseIt: 'Modern startups, web-scale applications, mobile app backends, and enterprises migrating away from physical datacenter leases.',
    advantages: [
      'Infinite elastic scalability: spin up 50 servers in 2 minutes during Black Friday sales',
      'Zero physical hardware maintenance; 99.99% service level agreements (SLAs) on managed services',
      'Global multi-region reach with built-in CDN edge distribution (CloudFront / Cloudflare)'
    ],
    disadvantages: [
      'OpEx cost volatility: unmonitored resources or runaway queries can generate surprise multi-thousand dollar invoices',
      'Vendor lock-in if using proprietary cloud services (DynamoDB, SQS, Cloud Spanner)',
      'Egress bandwidth fees ($0.09/GB on AWS) can become substantial at high data volumes'
    ],
    topologyNodes: [
      { name: 'AWS Route 53', role: 'Global Managed Anycast DNS with Health Checks', ip: 'Cloud Managed', os: 'Cloud Managed', ports: '53' },
      { name: 'Application Load Balancer', role: 'Multi-AZ Public Load Balancer', ip: 'Public Subnet AZ-A & AZ-B', os: 'Cloud Managed', ports: '443' },
      { name: 'Auto Scaling Group (EC2)', role: '2-10x Linux Web/App Instances in Private Subnets', ip: 'Private Subnets', os: 'Amazon Linux 2023', ports: '8080' },
      { name: 'NAT Gateway', role: 'Outbound-only secure internet access for private EC2s', ip: 'Public Subnet', os: 'Cloud Managed', ports: 'Outbound' },
      { name: 'AWS RDS Multi-AZ', role: 'PostgreSQL with synchronous standby in AZ-B', ip: 'DB Subnet', os: 'Cloud Managed', ports: '5432' }
    ],
    dataFlow: [
      '1. User resolves api.company.com via Route 53; directed to ALB across nearest Availability Zone.',
      '2. ALB terminates TLS and forwards request to healthy EC2 instance in Private Subnet.',
      '3. EC2 processes request; updates data in RDS PostgreSQL Primary (AZ-A).',
      '4. RDS synchronously replicates block update to Standby RDS in AZ-B; confirms commit to EC2.'
    ],
    firewallRules: [
      { source: '0.0.0.0/0', destination: 'ALB Security Group', port: '443', action: 'ALLOW', purpose: 'Public HTTPS ingress' },
      { source: 'ALB Security Group', destination: 'EC2 Security Group', port: '8080', action: 'ALLOW', purpose: 'Forwarded application traffic' },
      { source: 'EC2 Security Group', destination: 'RDS Security Group', port: '5432', action: 'ALLOW', purpose: 'Database access from private VMs' },
      { source: 'Any', destination: 'RDS Security Group', port: '5432', action: 'DENY', purpose: 'Block direct external DB access' }
    ],
    failoverStrategy: 'If AZ-A experiences a power failure, Route 53 and ALB route all traffic to AZ-B instantly; RDS flips standby to primary in under 60 seconds automatically.',
    costAndResourceReqs: 'Monthly OpEx: ~$450 - $1,800/month depending on instance sizes and traffic volume.',
    asciiDiagram: `                      [ AWS Route 53 DNS ]
                                │
                                ▼
              [ AWS Application Load Balancer (ALB) ]
               /                                  \\
              ▼                                    ▼
┌───────────────────────────┐        ┌───────────────────────────┐
│ Availability Zone A (AZ-A)│        │ Availability Zone B (AZ-B)│
│                           │        │                           │
│  [ EC2 Web/App Node 1 ]   │        │  [ EC2 Web/App Node 2 ]   │
│            │              │        │            │              │
│            ▼              │        │            ▼              │
│  [ RDS Primary Postgres ] │◄───────┼───────────►[ RDS Standby ]│
│                           │ Sync Replication                   │
└───────────────────────────┘        └───────────────────────────┘`
  },
  {
    id: 7,
    title: 'Hybrid Cloud & On-Premises Infrastructure',
    badge: 'Enterprise Hybrid',
    summary: 'Interconnects an on-premises physical datacenter directly with a public cloud provider (AWS/Azure) over an encrypted Site-to-Site IPsec VPN or dedicated AWS Direct Connect / Azure ExpressRoute link.',
    whenCompaniesUseIt: 'Standard for enterprises with legacy on-prem databases (e.g. core AS/400 or SQL Server) that want to run modern public-facing web applications in the cloud.',
    advantages: [
      'Preserves massive prior on-prem hardware investments while gaining cloud elasticity',
      'Sensitive regulated customer data stays on-prem; public web workloads run elastically in the cloud',
      'Unified identity using Microsoft Entra Connect synchronizing on-prem AD to Azure AD'
    ],
    disadvantages: [
      'Network latency between cloud compute and on-prem databases can introduce transaction delays',
      'Complex dual-environment monitoring and security policy enforcement',
      'Cloud direct connect private circuits carry significant fixed monthly telecom fees ($1,000+/month)'
    ],
    topologyNodes: [
      { name: 'ON-PREM-GATEWAY', role: 'Cisco ASA / FortiGate IPsec VPN Endpoint', ip: '203.0.113.10', os: 'Hardware', ports: '500, 4500/UDP' },
      { name: 'ON-PREM-DC', role: 'Active Directory Domain Controller', ip: '10.100.10.10', os: 'Windows Server 2022', ports: '88, 389, 445' },
      { name: 'ON-PREM-DB', role: 'Core Enterprise SQL Server Database', ip: '10.100.20.50', os: 'Windows Server 2022', ports: '1433' },
      { name: 'CLOUD-VGW', role: 'AWS Virtual Private Gateway / Azure VPN Gateway', ip: '198.51.100.20', os: 'Cloud Managed', ports: 'IPsec' },
      { name: 'CLOUD-APP-FARM', role: 'Cloud Angular / Node.js Microservices', ip: '10.200.1.0/24', os: 'Linux / Containers', ports: '8080' }
    ],
    dataFlow: [
      '1. Cloud App Farm receives user web transaction from public internet.',
      '2. Cloud App needs customer credit balance from legacy On-Prem SQL database.',
      '3. App initiates TCP connection to 10.100.20.50:1433 routed across the encrypted IPsec VPN tunnel.',
      '4. On-Prem firewall inspects packet, permits traffic, and SQL Server returns records back over tunnel.'
    ],
    firewallRules: [
      { source: '10.200.0.0/16 (Cloud VPC)', destination: '10.100.20.50 (On-Prem DB)', port: '1433', action: 'ALLOW', purpose: 'Cloud API database queries' },
      { source: '10.200.0.0/16 (Cloud VPC)', destination: '10.100.10.10 (On-Prem DC)', port: '88, 389, 636', action: 'ALLOW', purpose: 'Kerberos / LDAPS identity sync' },
      { source: 'Any', destination: 'IPsec Gateway', port: '500, 4500 / UDP', action: 'ALLOW', purpose: 'IKEv2 VPN tunnel establishment' }
    ],
    failoverStrategy: 'Dual redundant IPsec tunnels configured with BGP dynamic routing; if primary tunnel drops, BGP automatically shifts routes to secondary tunnel in 3 seconds.',
    costAndResourceReqs: 'On-prem maintenance + Cloud VPC + VPN Gateway fee (~$35/month/tunnel) + Cloud VMs. Total: ~$800-$2,500/month.',
    asciiDiagram: `┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│ ON-PREMISES DATACENTER           │      │ AWS / AZURE CLOUD ENVIRONMENT    │
│                                  │      │                                  │
│ [ Core SQL Server (10.100.20.50) ]│      │ [ Angular/Node Web App (10.200.x)]│
│ [ Active Directory (10.100.10.10)│      │ [ Microservice Container Fleet ] │
│                ▲                 │      │                ▲                 │
│                │ Internal LAN    │      │                │ Private Subnet  │
│ [ On-Prem VPN Gateway ]          │      │ [ Cloud Virtual Private Gateway ]│
└────────────────┬─────────────────┘      └────────────────┬─────────────────┘
                 │                                         │
                 └─────────── Encrypted IPsec Tunnel ──────┘
                              (BGP Dynamic Routing)`
  },
  {
    id: 8,
    title: 'High-Availability Infrastructure (Active-Active / Active-Passive)',
    badge: 'Mission-Critical HA',
    summary: 'Redundant infrastructure engineered to survive individual node, switch, or power failures with zero service interruption and automated failover.',
    whenCompaniesUseIt: 'Essential for financial payment gateways, emergency dispatch systems, 24/7 hospital databases, and high-revenue e-commerce stores.',
    advantages: [
      'Eliminates single points of failure across compute, networking, storage, and power',
      'Enables non-disruptive rolling maintenance (patching servers during business hours)',
      'Sub-second automated recovery transparent to end users'
    ],
    disadvantages: [
      'Requires double the compute, storage, and licensing capacity (100% idle capacity in Active-Passive)',
      'Risk of split-brain syndrome if quorum and fencing (STONITH) are improperly configured',
      'Complexity in data synchronization and distributed state management'
    ],
    topologyNodes: [
      { name: 'LB-PAIR', role: 'Dual HAProxy Load Balancers with Keepalived Virtual IP', ip: '10.0.1.1 (VIP)', os: 'Linux', ports: '80, 443' },
      { name: 'APP-ACTIVE-1', role: 'Application Node 1 (Active)', ip: '10.0.1.10', os: 'Ubuntu 24.04', ports: '8080' },
      { name: 'APP-ACTIVE-2', role: 'Application Node 2 (Active)', ip: '10.0.1.11', os: 'Ubuntu 24.04', ports: '8080' },
      { name: 'DB-PRIMARY', role: 'PostgreSQL Primary (Active Read/Write)', ip: '10.0.2.20', os: 'Rocky Linux 9', ports: '5432' },
      { name: 'DB-STANDBY', role: 'PostgreSQL Standby (Hot Passive Replica)', ip: '10.0.2.21', os: 'Rocky Linux 9', ports: '5432' }
    ],
    dataFlow: [
      '1. Requests arrive at Floating Virtual IP (10.0.1.1) owned by Primary Load Balancer via VRRP.',
      '2. Traffic distributed 50/50 across APP-ACTIVE-1 and APP-ACTIVE-2 (Active-Active).',
      '3. Both App nodes write transactions to DB-PRIMARY.',
      '4. DB-PRIMARY streams synchronous WAL logs to DB-STANDBY. Transaction commits only when written to both nodes.'
    ],
    firewallRules: [
      { source: 'Keepalived Nodes', destination: '224.0.0.18 (Multicast)', port: 'VRRP Protocol 112', action: 'ALLOW', purpose: 'Load balancer heartbeats' },
      { source: 'DB-PRIMARY', destination: 'DB-STANDBY', port: '5432', action: 'ALLOW', purpose: 'Synchronous replication' }
    ],
    failoverStrategy: 'If DB-PRIMARY fails, Patroni etcd consensus immediately promotes DB-STANDBY to Primary in under 3 seconds; App pool reconnects without dropped transactions.',
    costAndResourceReqs: 'Double hardware footprint: 2x LBs, 2x App nodes, 2x DB nodes + Quorum Witness. ~$1,200 - $3,000/month.',
    asciiDiagram: `                [ Floating Virtual IP: 10.0.1.1 ]
                ┌───────────────┴───────────────┐
                ▼                               ▼
       [ HAProxy LB-01 (Master) ] ◄──VRRP──► [ HAProxy LB-02 (Backup) ]
                │                               │
                └───────────────┬───────────────┘
                                │ Balanced Traffic
                ┌───────────────┴───────────────┐
                ▼                               ▼
       [ App Node 01 (Active) ]        [ App Node 02 (Active) ]
                │                               │
                └───────────────┬───────────────┘
                                │ SQL Transactions
                                ▼
                   [ DB-PRIMARY (Read/Write) ]
                                │ Synchronous Replication
                                ▼
                   [ DB-STANDBY (Hot Standby) ]`
  },
  {
    id: 9,
    title: 'Disaster Recovery Infrastructure (Multi-Region Warm/Cold Site)',
    badge: 'Disaster Recovery',
    summary: 'Geographically separated backup infrastructure designed to restore business operations when the primary datacenter suffers a catastrophic outage (fire, flood, regional power failure).',
    whenCompaniesUseIt: 'Required for business continuity compliance, insurance mandates, and disaster survival for all medium-to-large enterprises.',
    advantages: [
      'Guarantees company survival even if primary datacenter is completely obliterated',
      'Strict adherence to defined RTO (Recovery Time Objective) and RPO (Recovery Point Objective)',
      'Data air-gapping provides ultimate ransomware recovery safety'
    ],
    disadvantages: [
      'Substantial ongoing expense to maintain hardware standing idle in a secondary facility',
      'Asynchronous WAN replication implies minor RPO data loss (e.g. last 1-5 minutes of data)',
      'Requires regular complex failover drills to ensure runbooks remain operational'
    ],
    topologyNodes: [
      { name: 'PRIMARY-DC', role: 'Main Production Datacenter (US-East)', ip: 'Subnets 10.10.0.0/16', os: 'Mixed', ports: 'Full Stack' },
      { name: 'REPLICATION-LINK', role: 'Encrypted Dedicated WAN Link (1 Gbps)', ip: 'Private Fiber', os: 'Network', ports: 'IPsec / WireGuard' },
      { name: 'DR-SITE-WARM', role: 'Disaster Recovery Datacenter (US-West)', ip: 'Subnets 10.20.0.0/16', os: 'Standby VMs', ports: 'Replication Ingest' },
      { name: 'GLOBAL-DNS', role: 'Route 53 / Cloudflare Global Traffic Manager', ip: 'Anycast', os: 'Cloud', ports: '53' }
    ],
    dataFlow: [
      '1. Normal operations: Global DNS sends 100% of user traffic to Primary Datacenter (US-East).',
      '2. Primary storage and databases continuously replicate delta blocks asynchronously across WAN to US-West DR site.',
      '3. Catastrophe occurs: US-East datacenter goes offline completely.',
      '4. Global DNS health check fails; automatically flips DNS A-records to US-West DR site.',
      '5. Standby database at DR site promoted to Primary; business resumes in under 15 minutes.'
    ],
    firewallRules: [
      { source: 'PRIMARY-DC Storage', destination: 'DR-SITE Storage', port: '443 / 3260', action: 'ALLOW', purpose: 'Asynchronous storage replication' },
      { source: 'PRIMARY-DC DB', destination: 'DR-SITE DB', port: '5432 / 1433', action: 'ALLOW', purpose: 'Database replication stream' }
    ],
    failoverStrategy: 'Target metrics: RTO = 15 minutes (time to promote DR DB and flip DNS); RPO = 60 seconds (data loss bounded by asynchronous replication interval).',
    costAndResourceReqs: 'Additional 60%-100% of primary infrastructure costs, plus cross-region bandwidth charges.',
    asciiDiagram: `[ Primary Datacenter: US-East ]            [ Disaster Recovery Datacenter: US-West ]
┌─────────────────────────────┐            ┌───────────────────────────────────────┐
│ [ Active Web / App Fleet ]  │            │ [ Warm Standby Web / App Fleet ]      │
│ [ Active Primary Database ] │            │ [ Asynchronous DB Replica (Standby) ] │
│ [ Primary SAN Storage ]     │            │ [ DR SAN Storage Array ]              │
└──────────────┬──────────────┘            └───────────────────▲───────────────────┘
               │                                               │
               └─────────── Asynchronous WAN Replication ──────┘
                            (RPO < 60s, RTO < 15m)`
  },
  {
    id: 10,
    title: 'Microservices Infrastructure (API Gateway & Service Mesh)',
    badge: 'Cloud Native Microservices',
    summary: 'Decomposes monolithic applications into dozens of independent, single-purpose microservices communicating over gRPC or REST, managed by an API Gateway and Service Mesh (Istio / Linkerd).',
    whenCompaniesUseIt: 'Large engineering organizations (50+ developers) with rapidly changing features, continuous deployment pipelines, and high scalability demands.',
    advantages: [
      'Decoupled deployments: payment service can be updated without touching order or user services',
      'Polyglot runtime: use Node.js for I/O heavy APIs, Python for machine learning, Go for high-throughput routing',
      'Fault isolation: crash in recommendations service does not crash the core checkout flow'
    ],
    disadvantages: [
      'Massive operational complexity in networking, distributed tracing, and service discovery',
      'Substantial inter-service network overhead and serialization latency',
      'Hard distributed transaction management (requires Saga patterns instead of simple SQL ACID transactions)'
    ],
    topologyNodes: [
      { name: 'API-GATEWAY', role: 'Kong / Envoy API Gateway (Auth & Rate Limiting)', ip: '10.0.1.10', os: 'Linux', ports: '443, 8000' },
      { name: 'SVC-USER', role: 'User Identity Microservice (Node.js)', ip: 'Mesh Pod IP', os: 'Container', ports: '50051 (gRPC)' },
      { name: 'SVC-ORDER', role: 'Order Processing Microservice (Spring Boot)', ip: 'Mesh Pod IP', os: 'Container', ports: '50051 (gRPC)' },
      { name: 'SVC-PAYMENT', role: 'Payment Settlement Microservice (Go)', ip: 'Mesh Pod IP', os: 'Container', ports: '50051 (gRPC)' },
      { name: 'EVENT-BUS', role: 'Apache Kafka Event Streaming Broker', ip: '10.0.4.10', os: 'Linux', ports: '9092' }
    ],
    dataFlow: [
      '1. Client request arrives at API Gateway; JWT token validated; rate limit checked.',
      '2. Gateway routes request via gRPC to Order Microservice.',
      '3. Order service publishes "OrderCreated" event to Kafka topic.',
      '4. Payment and Inventory services consume Kafka event independently, process tasks, and acknowledge.'
    ],
    firewallRules: [
      { source: 'Internet', destination: 'API-GATEWAY', port: '443', action: 'ALLOW', purpose: 'Public API ingress' },
      { source: 'Service Mesh Sidecars', destination: 'Peer Sidecars', port: '15001 / mTLS', action: 'ALLOW', purpose: 'Mutual TLS encrypted mesh traffic' }
    ],
    failoverStrategy: 'Service mesh automatically retries idempotent requests, enforces circuit breakers to trip failing services, and shifts traffic to canary deployments.',
    costAndResourceReqs: 'Kubernetes cluster with 5-10 worker nodes, 32-64 vCPUs, 128 GB RAM. ~$1,500 - $4,500/month.',
    asciiDiagram: `[ Client App / Web SPA ] ──► [ API Gateway (Kong / Envoy) ]
                                    │ gRPC / REST (mTLS)
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ User Microservice ]      [ Order Microservice ]      [ Payment Microservice ]
(Dedicated DB)             (Dedicated DB)              (Dedicated DB)
       │                            │                            │
       └────────────────────┬───────┴────────────────────────────┘
                            │ Event Publishing / Consuming
                            ▼
               [ Apache Kafka Event Stream ]`
  },
  {
    id: 11,
    title: 'Containerized Infrastructure (Docker Compose / Kubernetes Cluster)',
    badge: 'DevOps & Containers',
    summary: 'Runs entire application workflows inside standardized, immutable container images managed by Docker Engine or orchestrated across Kubernetes clusters with declarative YAML.',
    whenCompaniesUseIt: 'Standard modern deployment standard across 85%+ of tech companies, eliminating "it works on my machine" issues and enabling rapid CI/CD deployment.',
    advantages: [
      'Standardized deployment units: same Docker image runs identically in local dev, staging, and production',
      'Ultra-dense server utilization: run 50 micro-containers on a single physical host without VM OS bloat',
      'Instant container cold starts (under 1 second compared to 60-120 seconds for VMs)'
    ],
    disadvantages: [
      'Steep learning curve for Kubernetes concepts (Pods, Services, Ingress, Persistent Volumes, CRDs)',
      'Persistent storage management requires specialized CSI drivers and volume planning',
      'Shared kernel security risks: container breakout vulnerabilities require strict runtime security tools'
    ],
    topologyNodes: [
      { name: 'K8S-CONTROL-01', role: 'Kubernetes Control Plane (API Server, etcd)', ip: '10.0.10.10', os: 'Ubuntu 24.04', ports: '6443, 2379' },
      { name: 'K8S-WORKER-01', role: 'Kubernetes Worker Node (kubelet, containerd)', ip: '10.0.10.21', os: 'Ubuntu 24.04', ports: '10250, NodePorts' },
      { name: 'K8S-WORKER-02', role: 'Kubernetes Worker Node (kubelet, containerd)', ip: '10.0.10.22', os: 'Ubuntu 24.04', ports: '10250, NodePorts' },
      { name: 'INGRESS-NGINX', role: 'Nginx Ingress Controller DaemonSet', ip: 'Host Ports 80/443', os: 'Container', ports: '80, 443' }
    ],
    dataFlow: [
      '1. Ingress Controller receives HTTP request, inspects Host header (app.company.com).',
      '2. Ingress routes request to ClusterIP Service; kube-proxy balances traffic across healthy container pods.',
      '3. Pod processes request; reads persistent volume data mounted via Ceph / NFS CSI driver.',
      '4. If pod crashes, kubelet detects failed liveness probe, restarts pod, or schedules new pod instantly.'
    ],
    firewallRules: [
      { source: 'Workers', destination: 'Control Plane', port: '6443 / TCP', action: 'ALLOW', purpose: 'kube-apiserver communication' },
      { source: 'Worker Nodes', destination: 'Worker Nodes', port: 'VXLAN 8472 / UDP or WireGuard', action: 'ALLOW', purpose: 'CNI Pod overlay network' }
    ],
    failoverStrategy: 'Self-healing: Kubernetes automatically reschedules pods from dead worker nodes onto surviving healthy nodes in under 30 seconds.',
    costAndResourceReqs: 'Minimum 3 nodes (1 Control, 2 Workers) with 4 vCPU, 8GB RAM each. ~$200 - $600/month.',
    asciiDiagram: `[ Client Traffic: 443 ] ──► [ Nginx Ingress Controller ]
                                   │ Routes to ClusterIP Service
        ┌──────────────────────────┴──────────────────────────┐
        ▼                                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Worker Node 01                  │   │ Worker Node 02                  │
│  [ Pod: Angular Frontend ]      │   │  [ Pod: Angular Frontend ]      │
│  [ Pod: Node.js API ]           │   │  [ Pod: Node.js API ]           │
│  [ Persistent Volume Claim ]    │   │  [ Persistent Volume Claim ]    │
└─────────────────────────────────┘   └─────────────────────────────────┘`
  },
  {
    id: 12,
    title: 'Multi-Site Company Infrastructure (HQ + Branch Offices + S2S VPN)',
    badge: 'Enterprise Multi-Site',
    summary: 'Interconnects corporate headquarters, regional branch offices, and cloud datacenters into a unified wide area network (WAN) using Active Directory Sites & Services, DFS replication, and SD-WAN.',
    whenCompaniesUseIt: 'Multi-location enterprises with branch offices, retail store chains, bank branches, or international regional headquarters.',
    advantages: [
      'Local survivability: branch offices can authenticate and print locally even if the WAN fiber connection goes down',
      'DFS Namespaces present a unified global folder hierarchy (\\\\corp.local\\Shared) worldwide',
      'Bandwidth optimization: DFS Replication syncs large files across branches during off-peak night hours'
    ],
    disadvantages: [
      'WAN bandwidth constraints can create replication backlogs between distant geographical sites',
      'Replication conflict resolution overhead when users edit the same file simultaneously at different sites',
      'Requires standardized network hardware and consistent IP subnet planning across all branch locations'
    ],
    topologyNodes: [
      { name: 'HQ-DC-PRIMARY', role: 'Headquarters Primary DC + FSMO Roles', ip: '10.10.1.10 (HQ Site)', os: 'Windows Server 2022', ports: 'AD Ports' },
      { name: 'HQ-FILE-DFS', role: 'HQ DFS Root Namespace Server', ip: '10.10.2.15 (HQ Site)', os: 'Windows Server 2022', ports: '445' },
      { name: 'BRANCH-NY-RODC', role: 'Read-Only Domain Controller (RODC)', ip: '10.20.1.10 (NY Site)', os: 'Windows Server 2022', ports: 'AD Ports' },
      { name: 'BRANCH-LDN-DC', role: 'London Branch Read-Write Domain Controller', ip: '10.30.1.10 (LDN Site)', os: 'Windows Server 2022', ports: 'AD Ports' },
      { name: 'SD-WAN-EDGES', role: 'Cisco Meraki / Fortinet SD-WAN Appliances', ip: 'WAN Gateways', os: 'Appliance', ports: 'IPsec' }
    ],
    dataFlow: [
      '1. New York employee logs in; PC queries DNS for local DC; DNS returns local RODC (10.20.1.10).',
      '2. Authentication completed locally in under 5 milliseconds without traversing WAN.',
      '3. User opens \\\\corp.local\\Files\\Marketing; DFS points user to local replicated file copy.',
      '4. Inter-site replication occurs over encrypted SD-WAN tunnel scheduled at 15-minute intervals.'
    ],
    firewallRules: [
      { source: 'HQ Subnets', destination: 'Branch Subnets', port: 'ANY (Encrypted SD-WAN)', action: 'ALLOW', purpose: 'Full internal routability' },
      { source: 'Branch WAN', destination: 'Internet', port: '80, 443', action: 'ALLOW', purpose: 'Local internet breakout' }
    ],
    failoverStrategy: 'If branch WAN drops, local RODC/File server keeps local operations running. When WAN restores, DFS replication catches up delta changes automatically.',
    costAndResourceReqs: 'Multi-site hardware: SD-WAN appliance + 1-2 servers per branch office. ~$5,000 - $15,000 per branch site setup.',
    asciiDiagram: `┌──────────────────────────────────┐
│ HEADQUARTERS (HQ - 10.10.0.0/16) │
│ [ Primary DC / FSMO ]            │
│ [ DFS Master Namespace ]         │
└────────────────┬─────────────────┘
                 │ Encrypted SD-WAN / IPsec Mesh
         ┌───────┴───────┐
         ▼               ▼
┌──────────────────┐   ┌──────────────────┐
│ BRANCH NY        │   │ BRANCH LONDON    │
│ (10.20.0.0/16)   │   │ (10.30.0.0/16)   │
│ [ Local RODC ]   │   │ [ Local DC ]     │
│ [ DFS File Sync ]│   │ [ DFS File Sync ]│
└──────────────────┘   └──────────────────┘`
  }
];
