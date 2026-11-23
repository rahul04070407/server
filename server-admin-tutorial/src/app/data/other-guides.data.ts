export interface OtherGuideTopic {
  id: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  headline: string;
  analogy: {
    title: string;
    description: string;
  };
  keyTakeaways: string[];
  explanationCards: {
    title: string;
    description: string;
    codeExample?: string;
    diagram?: string;
  }[];
  quickCheatSheet?: {
    term: string;
    simpleMeaning: string;
    example: string;
  }[];
  tryItYourselfCommands?: {
    command: string;
    whatItDoes: string;
    expectedOutput: string;
  }[];
}

export const OTHER_GUIDES_DATA: OtherGuideTopic[] = [
  {
    id: 'windows-server-iis',
    badge: 'Enterprise Windows',
    badgeColor: 'sky',
    title: 'Windows Server & IIS Web Hosting Guide',
    headline: 'While Linux dominates the public cloud, Windows Server dominates corporate offices, enterprise user directories (Active Directory), and IIS hosting.',
    analogy: {
      title: '🏛️ Analogy: The Corporate Town Hall & Registry',
      description: 'Linux is like a bustling public open-air farmers market where every vendor brings their own tools. Windows Server with Active Directory is like a secure Corporate Headquarters: every employee has a registered ID badge (Domain User), every computer belongs to an Organizational Unit (OU), and HR policies (Group Policy) automatically lock doors and enforce password rules on all 1,000 office laptops simultaneously.'
    },
    keyTakeaways: [
      'Active Directory Domain Services (AD DS): Centralizes user logins, security policies, and computer permissions across a company network.',
      'Internet Information Services (IIS): Microsoft\'s enterprise web server built directly into Windows Server, powering ASP.NET, .NET Core, and legacy enterprise web apps.',
      'PowerShell Administration: All Windows Server administration is scriptable via PowerShell cmdlets (e.g., Get-Service, New-IISSite).',
      'Remote Desktop (RDP - Port 3389): Graphical desktop screen sharing protocol used to manage Windows Servers remotely.'
    ],
    explanationCards: [
      {
        title: 'Active Directory Architecture (Forests, Domains & OUs)',
        description: 'How enterprise organizations manage 10,000 employee laptops and permissions from a central domain controller.',
        diagram: `COMPANY.CORP (Active Directory Domain)
└── Domain Controllers (SRV-DC-01, SRV-DC-02)
    ├── Finance OU       -> Applies strict banking GPO security policies
    ├── Engineering OU   -> Grants local admin rights to developer laptops
    ├── File Servers     -> Shared SMB drives with NTFS permission ACLs
    └── DNS Server       -> Resolves internal intranet domains (mail.company.corp)`
      },
      {
        title: 'Hosting Websites on IIS via PowerShell',
        description: 'Automate IIS website creation and application pool configuration using modern PowerShell.',
        codeExample: `# 1. Install IIS Web Server Feature:
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# 2. Create an Application Pool with dedicated memory:
New-WebAppPool -Name "AngularAppPool"

# 3. Create a new website binding on Port 80:
New-IISSite -Name "CompanyPortal" -Port 80 -PhysicalPath "C:\\inetpub\\wwwroot\\portal" -ApplicationPool "AngularAppPool"

# 4. Restart IIS service:
iisreset`
      }
    ],
    quickCheatSheet: [
      { term: 'Active Directory', simpleMeaning: 'Centralized database storing users, passwords, and computer access rights.', example: 'corp\\john.doe' },
      { term: 'IIS', simpleMeaning: 'Internet Information Services: Windows Server web server.', example: 'iisreset' },
      { term: 'RDP (3389)', simpleMeaning: 'Remote Desktop Protocol for Windows graphical management.', example: 'mstsc.exe' },
      { term: 'Group Policy (GPO)', simpleMeaning: 'Rules pushed automatically to all company computers.', example: 'gpupdate /force' }
    ],
    tryItYourselfCommands: [
      {
        command: 'Get-Service -Name W3SVC',
        whatItDoes: 'Checks if IIS Web Server service is running on Windows.',
        expectedOutput: 'Status: Running Name: W3SVC DisplayName: World Wide Web Publishing Service'
      }
    ]
  },
  {
    id: 'database-servers',
    badge: 'Data Layer',
    badgeColor: 'teal',
    title: 'Database Servers: PostgreSQL, MySQL, Redis & MongoDB',
    headline: 'Database servers store persistent business data. Securing database ports and never exposing them to the raw internet is rule #1.',
    analogy: {
      title: '🏦 Analogy: The Bank Vault & Financial Ledger',
      description: 'Your web server (Nginx/Node) is the bank teller counter where customers queue up. Your Database Server is the fortified steel bank vault in the basement. You NEVER open a door from the public street into the vault! The teller is the only person with an internal badge to walk into the vault and update customer balances.'
    },
    keyTakeaways: [
      'The Golden Rule of Database Security: Databases should NEVER bind to 0.0.0.0 on a public IP. Bind them to 127.0.0.1 (Localhost) or a private internal VPC network.',
      'PostgreSQL (Port 5432): Production-grade open-source relational database known for rock-solid ACID transactions and JSONB support.',
      'MySQL / MariaDB (Port 3306): The world\'s most popular open-source relational database powering WordPress and web stacks.',
      'Redis (Port 6379): Superfast in-memory cache and session store responding in sub-millisecond speeds.',
      'MongoDB (Port 27017): Document-oriented NoSQL database storing JSON-like BSON documents for flexible schemas.'
    ],
    explanationCards: [
      {
        title: 'Standard Database Port Mapping & Connection Strings',
        description: 'How backend applications securely connect to databases over internal networks.',
        diagram: `DATABASE      PORT   TYPE             DEFAULT CONNECTION STRING
PostgreSQL    5432   Relational SQL   postgresql://user:pass@127.0.0.1:5432/mydb
MySQL         3306   Relational SQL   mysql://user:pass@127.0.0.1:3306/mydb
Redis         6379   In-Memory Cache  redis://127.0.0.1:6379
MongoDB      27017   Document NoSQL   mongodb://127.0.0.1:27017/mydb`
      },
      {
        title: 'Securing PostgreSQL to Localhost Only',
        description: 'Prevent hacker port scanners from ever reaching your database by configuring postgresql.conf and pg_hba.conf.',
        codeExample: `# In /etc/postgresql/16/main/postgresql.conf:
listen_addresses = 'localhost' # NEVER use '*' on a server with public IP!

# In /etc/postgresql/16/main/pg_hba.conf:
# TYPE  DATABASE  USER       ADDRESS        METHOD
local   all       all                       peer
host    all       all        127.0.0.1/32   scram-sha-256

# Restart PostgreSQL to apply:
sudo systemctl restart postgresql`
      }
    ],
    quickCheatSheet: [
      { term: 'Port 5432', simpleMeaning: 'PostgreSQL default port.', example: 'psql -U postgres' },
      { term: 'Port 3306', simpleMeaning: 'MySQL default port.', example: 'mysql -u root -p' },
      { term: 'Port 6379', simpleMeaning: 'Redis in-memory caching port.', example: 'redis-cli ping -> PONG' },
      { term: 'Port 27017', simpleMeaning: 'MongoDB default port.', example: 'mongosh' }
    ],
    tryItYourselfCommands: [
      {
        command: 'sudo netstat -tulpn | grep -E "5432|3306|6379|27017"',
        whatItDoes: 'Checks which database ports are active and verifies they are bound to 127.0.0.1.',
        expectedOutput: 'tcp 0 0 127.0.0.1:5432 0.0.0.0:* LISTEN'
      }
    ]
  },
  {
    id: 'firewalls-and-security',
    badge: 'Security Shield',
    badgeColor: 'coral',
    title: 'Firewalls & Network Security Guide',
    headline: 'Default Deny: Any port not explicitly required must be locked shut to the outside world.',
    analogy: {
      title: '🏰 Analogy: Castle Moat & Drawbridge',
      description: 'A server without a firewall is like a castle with all doors wide open: any wandering intruder can walk inside. A firewall is the castle moat and drawbridge: the drawbridge stays raised (Default Deny: block all incoming). You only open the front wicket gate for registered delivery drivers (Port 80/443 for web visitors, Port 22 for the administrator).'
    },
    keyTakeaways: [
      'Default Deny Rule: Block all incoming connections by default; only whitelist specific required ports.',
      'UFW (Uncomplicated Firewall): The standard command-line firewall manager on Ubuntu/Debian.',
      'Defense in Depth: Even if a backend service runs on port 3000 or database on 5432, the firewall drops external packets so hackers cannot probe them.',
      'Fail2ban: An automated security daemon that scans log files for brute-force password attempts and automatically bans offending IP addresses in the firewall.'
    ],
    explanationCards: [
      {
        title: 'Complete Production UFW Firewall Setup',
        description: 'Lock down your Ubuntu server in 4 commands.',
        codeExample: `# 1. Set default policies (block incoming, allow outgoing):
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow SSH remote admin (CRITICAL: do this before enabling UFW or you will be locked out!):
sudo ufw allow 22/tcp comment 'SSH Remote Shell'

# 3. Allow public web traffic:
sudo ufw allow 80/tcp comment 'HTTP Web'
sudo ufw allow 443/tcp comment 'HTTPS Secure Web'

# 4. Turn on the firewall:
sudo ufw --force enable

# 5. Check firewall status:
sudo ufw status verbose`
      },
      {
        title: 'Fail2ban Brute-Force Defense',
        description: 'How Fail2ban automatically blocks bot attacks after 3 failed password attempts.',
        diagram: `Attacker IP (45.33.32.15)
  |
  | 1. Attempts SSH login with fake passwords (3 fails in 60s)
  v
[ /var/log/auth.log records "Failed password for root" ]
  |
  v (Fail2ban daemon detects pattern)
[ Fail2ban triggers iptables rule ]
  |
  v
[ Attacker IP is BANNED for 24 hours at the packet level! ]`
      }
    ],
    quickCheatSheet: [
      { term: 'Default Deny', simpleMeaning: 'Security principle where all incoming traffic is blocked unless whitelisted.', example: 'ufw default deny incoming' },
      { term: 'UFW', simpleMeaning: 'Uncomplicated Firewall command-line interface on Linux.', example: 'sudo ufw status' },
      { term: 'Fail2ban', simpleMeaning: 'Daemon that automatically bans IPs attempting brute-force logins.', example: 'fail2ban-client status' }
    ],
    tryItYourselfCommands: [
      {
        command: 'sudo ufw status',
        whatItDoes: 'Displays current active firewall rules and allowed ports on Linux.',
        expectedOutput: 'Status: active 22/tcp ALLOW IN 80/tcp ALLOW IN 443/tcp ALLOW IN'
      }
    ]
  }
];
