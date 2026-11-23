export interface SetupStep {
  stepNumber: number;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  objective: string;
  analogy: string;
  linuxCommand: string;
  windowsCommand: string;
  explanation: string;
  verificationCheck: string;
}

export const SETUP_GUIDE_STEPS: SetupStep[] = [
  {
    stepNumber: 1,
    badgeColor: 'teal',
    title: 'Install the Server Operating System',
    objective: 'Install a headless server OS without a desktop GUI to save RAM and eliminate graphical attack surfaces.',
    analogy: '🏗️ Analogy: Laying the Concrete Foundation: Before decorating or installing glass windows, you pour heavy industrial concrete engineered to bear non-stop weight without cracking.',
    linuxCommand: `# Boot Ubuntu Server LTS USB / ISO installer
# Select language -> Set username (e.g. srvadmin) -> Check "Install OpenSSH Server" -> Finish
sudo apt update && sudo apt upgrade -y`,
    windowsCommand: `# Boot Windows Server 2022/2025 ISO
# Select "Windows Server Standard (Server Core)" -> Complete installation
# Set local Administrator password on first boot prompt`,
    explanation: 'Server Core (Windows) and Ubuntu Server (Linux) run completely in text mode. This saves 1.5GB to 3GB of RAM and leaves more computing power for your websites and databases.',
    verificationCheck: 'System boots to a text login prompt: "login:" (Linux) or "cmd.exe / PowerShell" (Windows Core).'
  },
  {
    stepNumber: 2,
    badgeColor: 'gold',
    title: 'Configure Static IP Address & Hostname',
    objective: 'Ensure the server always stays at the same IP address so clients and other servers can reliably find it.',
    analogy: '📫 Analogy: Registering a Permanent Postal Street Address: If a store moved to a random street corner every night (DHCP), customers could never find it. A static IP locks your address permanently on the map.',
    linuxCommand: `# Edit Netplan configuration in /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses: [192.168.1.50/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]

# Apply changes:
sudo netplan apply`,
    windowsCommand: `# In PowerShell (Run as Administrator):
New-NetIPAddress -InterfaceIndex 1 -IPAddress 192.168.1.50 -PrefixLength 24 -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceIndex 1 -ServerAddresses "1.1.1.1", "8.8.8.8"
Rename-Computer -NewName "SRV-PROD-01" -Restart`,
    explanation: 'If a server uses DHCP (dynamic IP), its IP address could change every time your router reboots, breaking client connections. A static IP makes the server address permanent.',
    verificationCheck: 'Run "ip a" (Linux) or "ipconfig" (Windows) to verify the IP shows 192.168.1.50.'
  },
  {
    stepNumber: 3,
    badgeColor: 'coral',
    title: 'Lock Down Firewall & Open Only Required Ports',
    objective: 'Block all incoming connections by default and open only the specific ports needed for Web and Remote Management.',
    analogy: '🔒 Analogy: Locking All Windows & Installing Security Gates: By default, every door and window is bolted shut (Default Deny). Only the front door (Port 80/443 for web) and manager keycard slot (Port 22 SSH) are allowed.',
    linuxCommand: `# UFW (Uncomplicated Firewall) setup:
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Remote Shell'
sudo ufw allow 80/tcp comment 'HTTP Web'
sudo ufw allow 443/tcp comment 'HTTPS Secure Web'
sudo ufw --force enable`,
    windowsCommand: `# Windows Advanced Firewall configuration:
Set-NetFirewallProfile -Profile Domain,Public,Private -DefaultInboundAction Block
New-NetFirewallRule -DisplayName "HTTP-In (80)" -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HTTPS-In (443)" -LocalPort 443 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WinRM-HTTPS (5986)" -LocalPort 5986 -Protocol TCP -Action Allow`,
    explanation: 'Defense in depth: Any port not explicitly allowed is rejected. Hackers scanning your IP will find all other ports closed.',
    verificationCheck: 'Run "sudo ufw status verbose" (Linux) to verify ports 22, 80, 443 are ALLOW IN.'
  },
  {
    stepNumber: 4,
    badgeColor: 'sky',
    title: 'Install a Web Server & Put Your First HTML Page Live',
    objective: 'Install Nginx (or IIS) so the server can accept HTTP requests on Port 80 and return web pages.',
    analogy: '🏪 Analogy: Unlocking the Storefront Display Window: Installing Nginx is like unlocking the front display window and placing your menu on the glass so passing customers (web browsers) can see your website.',
    linuxCommand: `# Install Nginx Web Server:
sudo apt install -y nginx
sudo systemctl enable --now nginx

# Create a simple test webpage:
echo "<h1>Hello from My First Production Server!</h1>" | sudo tee /var/www/html/index.html`,
    windowsCommand: `# Install Internet Information Services (IIS):
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Place test file in default IIS directory:
Set-Content -Path "C:\\inetpub\\wwwroot\\index.html" -Value "<h1>Hello from Windows Server IIS!</h1>"`,
    explanation: 'Nginx starts a master process and worker processes that continuously listen on Port 80. When a browser requests the server IP, Nginx immediately returns index.html.',
    verificationCheck: 'Open your laptop browser and navigate to "http://192.168.1.50" - you should see the greeting heading!'
  },
  {
    stepNumber: 5,
    badgeColor: 'teal',
    title: 'Install & Configure a Database (PostgreSQL / MySQL)',
    objective: 'Set up an enterprise relational database server to store application data persistently.',
    analogy: '🛡️ Analogy: Installing the Fortified Bank Safe: Placing customer records and transaction data inside an encrypted safe in the basement, protected by root authentication and accessible only by trusted clerks.',
    linuxCommand: `# Install PostgreSQL on Linux:
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service:
sudo systemctl enable --now postgresql

# Create a database and user with a password:
sudo -u postgres psql -c "CREATE USER appuser WITH PASSWORD 'SecurePassword123';"
sudo -u postgres psql -c "CREATE DATABASE appdb OWNER appuser;"`,
    windowsCommand: `# Download and run PostgreSQL installer silently:
# Or install Microsoft SQL Server Express:
Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/?linkid=866658" -OutFile "SQL2022-SSEI-Expr.exe"
.\\SQL2022-SSEI-Expr.exe /Quiet /Action=Install /IACCEPTSQLSERVERLICENSETERMS`,
    explanation: 'Databases listen on Port 5432 (Postgres) or 1433 (SQL Server). For security, databases should ONLY listen on localhost (127.0.0.1) or private IP so the public internet cannot probe them directly.',
    verificationCheck: 'Run "pg_isready" or "sudo -u postgres psql -c \\"\\l\\"" to confirm database appdb is active.'
  }
];
