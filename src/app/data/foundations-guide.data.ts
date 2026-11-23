export interface FoundationTopic {
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

export const FOUNDATIONS_DATA: FoundationTopic[] = [
  {
    id: 'client-server-ports',
    badge: 'Step 1 from PDF',
    badgeColor: 'teal',
    title: 'Client-Server Architecture & Port Mapping',
    headline: 'Every web interaction is a conversation between two computers: the Client requesting, and the Server responding.',
    analogy: {
      title: '🏢 Analogy: Building & Apartments',
      description: 'The IP address is like the building street address (500 Main St). The Port is the apartment number inside the building. Port 80/443 is the main public entrance lobby. Your Node.js app on port 3000 is a specific private apartment. Nginx is the building doorman directing visitors to the right room!'
    },
    keyTakeaways: [
      'What is Client-Server: A client (your browser/phone) sends a request to a server (remote host) asking for a page. The server processes and sends back a response.',
      'What is an IP Address: The unique digital numerical address assigned to every device on a network (e.g. 192.168.1.10 or public 203.0.113.5).',
      'What is a Port: A 16-bit number (0–65535) identifying a specific program running on that computer. Port 80 = HTTP, Port 443 = HTTPS, Port 22 = SSH, Port 3000 = Node.js.',
      'Why Custom Ports: Your backend app runs on an internal custom port (e.g. 3000 or 8080) because ports 80/443 are reserved for the Nginx web server front door, which forwards traffic.'
    ],
    explanationCards: [
      {
        title: 'The Real Request Flow (Browser to Backend)',
        description: 'See how a request travels from a user clicking a link to your Node.js code and back.',
        diagram: `Browser  -->  https://myapp.com:443
               | (DNS resolves domain to IP)
               v
Server IP --> 203.0.113.5:443
               | (Nginx listens on port 443)
               v
Nginx    --> proxy_pass to http://localhost:3000
               |
               v
Node.js  --> Executes business logic & returns JSON/HTML`
      },
      {
        title: 'Standard Well-Known Ports',
        description: 'Ports 0 to 1023 are standardized worldwide by IANA for core internet services.',
        diagram: `Port 80   -> HTTP  (Unencrypted web traffic)
Port 443  -> HTTPS (Encrypted secure web with SSL/TLS)
Port 22   -> SSH   (Encrypted remote command-line terminal)
Port 3000 -> App   (Standard development port for Node.js / React)
Port 5432 -> DB    (PostgreSQL relational database)`
      }
    ],
    quickCheatSheet: [
      { term: 'IP Address', simpleMeaning: 'Like a street address for a computer on the network.', example: '142.250.190.78' },
      { term: 'Port Number', simpleMeaning: 'Like an apartment door number for a specific program.', example: 'Port 443 for HTTPS' },
      { term: 'proxy_pass', simpleMeaning: 'Nginx directive forwarding incoming traffic to internal port.', example: 'proxy_pass http://localhost:3000;' },
      { term: 'Localhost', simpleMeaning: 'The 127.0.0.1 loopback address pointing to the current computer.', example: 'http://localhost:3000' }
    ],
    tryItYourselfCommands: [
      {
        command: 'curl -I http://example.com',
        whatItDoes: 'Sends a quick HTTP HEAD request to test server web port connectivity.',
        expectedOutput: 'HTTP/1.1 200 OK Content-Type: text/html'
      },
      {
        command: 'netstat -tulpn | grep 3000',
        whatItDoes: 'Checks if any program is currently listening on port 3000 in Linux.',
        expectedOutput: 'tcp6 0 0 :::3000 :::* LISTEN 1234/node'
      }
    ]
  },
  {
    id: 'linux-terminal-basics',
    badge: 'Step 2 from PDF',
    badgeColor: 'gold',
    title: 'Linux Terminal & Command Line Basics',
    headline: 'Over 90% of cloud servers run Linux without a graphical desktop. You interact with them entirely through text commands.',
    analogy: {
      title: '✈️ Analogy: Airplane Cockpit Controls',
      description: 'Using Windows Desktop with a mouse is like taking an elevator: you just press a floor button, but you have no control over the cables. Using the Linux terminal is like sitting in an airplane cockpit: you have direct, unfiltered switches (commands) to every engine, fuel line, and flap on the machine.'
    },
    keyTakeaways: [
      'Why Linux: Linux is lightweight, free, secure, and rock-solid. Most cloud servers run Ubuntu, Debian, or Rocky Linux.',
      'Headless Interface: Cloud servers run without a monitor or mouse to save RAM. Everything is done via the shell command line.',
      'File Permissions: Linux strictly enforces Read (r), Write (w), and Execute (x) permissions for User, Group, and Others.',
      'Package Management: "apt" (on Debian/Ubuntu) or "dnf" (on RHEL) installs, updates, and manages software packages automatically.'
    ],
    explanationCards: [
      {
        title: 'Essential Commands Every Admin Uses Daily',
        description: 'These 6 commands form the foundation of navigating and managing any remote Linux server.',
        codeExample: `# List files with detailed permissions, owner, and size:
ls -la

# Change directory into web root:
cd /var/www

# Restrict SSH key permissions (mandatory for SSH keys):
chmod 400 key.pem

# Change ownership of web folder to user ubuntu:
sudo chown -R ubuntu:ubuntu /var/www/html

# Update package lists and install Nginx web server:
sudo apt update && sudo apt install nginx -y

# Edit configuration files inside the terminal:
nano /etc/nginx/nginx.conf`
      },
      {
        title: 'First Steps on a Fresh Server',
        description: 'When you log into a brand new cloud server, verify your identity and working location.',
        diagram: `Terminal Prompt               Meaning
$ whoami               -----> ubuntu (logged-in username)
$ pwd                  -----> /home/ubuntu (current directory path)
$ ls -la               -----> drwxr-xr-x 2 ubuntu ubuntu 4096 .
$ sudo apt update      -----> downloads latest security package indices`
      }
    ],
    quickCheatSheet: [
      { term: 'ls -la', simpleMeaning: 'List all files including hidden ones with permissions.', example: 'drwxr-xr-x 2 root root' },
      { term: 'cd', simpleMeaning: 'Change directory to a different folder.', example: 'cd /var/log/nginx' },
      { term: 'chmod', simpleMeaning: 'Change file access permissions.', example: 'chmod 400 key.pem' },
      { term: 'chown', simpleMeaning: 'Change file or folder owner.', example: 'sudo chown -R www-data:www-data /var/www' },
      { term: 'sudo', simpleMeaning: 'Superuser Do: execute a command with administrative root power.', example: 'sudo systemctl restart nginx' }
    ],
    tryItYourselfCommands: [
      {
        command: 'whoami && pwd',
        whatItDoes: 'Prints your current logged-in username and current working directory path.',
        expectedOutput: 'ubuntu /home/ubuntu'
      },
      {
        command: 'uname -a',
        whatItDoes: 'Displays Linux operating system kernel version and architecture.',
        expectedOutput: 'Linux srv-prod 6.5.0-generic x86_64 GNU/Linux'
      }
    ]
  },
  {
    id: 'ssh-key-pairs',
    badge: 'Step 3 from PDF',
    badgeColor: 'coral',
    title: 'SSH & Asymmetric Key Pairs',
    headline: 'SSH (Secure Shell) lets you control a remote server over an encrypted tunnel without sending passwords across the internet.',
    analogy: {
      title: '📬 Analogy: The Locked Mailbox',
      description: 'The Public Key is like the mail slot on a post office mailbox: anyone in the world can drop a letter inside (encrypt a message for you). The Private Key is the physical metal key held only by you: nobody else can open the box and read the challenge. The server challenges you, and only your private key can unlock it!'
    },
    keyTakeaways: [
      'What is SSH: Secure Shell on Port 22 creates an encrypted bidirectional tunnel between your laptop and the remote server.',
      'Why Key Pairs Beat Passwords: Passwords can be brute-forced or intercepted. A 2048-bit or Ed25519 cryptographic key is mathematically impossible to guess.',
      'Private Key (~/.ssh/id_ed25519 or key.pem): Stays on your personal laptop. Never share it with anyone.',
      'Public Key (~/.ssh/id_ed25519.pub): Copied onto the server inside ~/.ssh/authorized_keys.',
      'The chmod 400 Rule: SSH clients strictly refuse to use a private key if other users on your laptop have read permissions. You MUST run "chmod 400 key.pem".'
    ],
    explanationCards: [
      {
        title: 'The Complete SSH Key Workflow',
        description: 'How to generate a modern key pair on your laptop and install it onto a remote server.',
        codeExample: `# 1. On your laptop: Generate modern Ed25519 key pair:
ssh-keygen -t ed25519 -C "student-laptop"

# 2. Copy the public key to your remote server:
ssh-copy-id ubuntu@203.0.113.5

# 3. Or on AWS / Cloud: Connect using downloaded .pem key:
chmod 400 key.pem
ssh -i key.pem ubuntu@203.0.113.5

# 4. Result:
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-x86_64)`
      },
      {
        title: 'How SSH Authentication Handshake Works',
        description: 'No password travels across the wire. The server sends a random mathematical puzzle that only your private key can solve.',
        diagram: `Your Laptop (Private Key)                 Remote Server (Public Key)
       |                                               |
       |  1. "Hello, I want to log in as ubuntu" ----> |
       |                                               |
       |  <---- 2. Generates random challenge encrypted |
       |           with your public key                |
       |                                               |
       |  3. Solves challenge using private key        |
       |     and sends back cryptographic proof -----> |
       |                                               |
       |  <---- 4. Verified! Granted shell access:     |
       |           ubuntu@server:~$                    |`
      }
    ],
    quickCheatSheet: [
      { term: 'Private Key', simpleMeaning: 'Secret cryptographic file kept only on your laptop.', example: 'id_ed25519 or key.pem' },
      { term: 'Public Key', simpleMeaning: 'Safe-to-share file placed on servers you want to access.', example: 'id_ed25519.pub' },
      { term: '~/.ssh/authorized_keys', simpleMeaning: 'Server file listing public keys allowed to log into that account.', example: 'ssh-ed25519 AAAAC3...' },
      { term: 'chmod 400', simpleMeaning: 'Sets read-only permission for file owner only (required for SSH).', example: 'chmod 400 my-key.pem' }
    ],
    tryItYourselfCommands: [
      {
        command: 'ssh -V',
        whatItDoes: 'Checks the version of OpenSSH client on your system.',
        expectedOutput: 'OpenSSH_9.6p1 Ubuntu-3ubuntu13'
      },
      {
        command: 'ls -l ~/.ssh',
        whatItDoes: 'Inspects your local SSH keys directory.',
        expectedOutput: '-rw------- 1 ubuntu ubuntu 419 id_ed25519'
      }
    ]
  },
  {
    id: 'how-to-create-a-server',
    badge: 'Infrastructure',
    badgeColor: 'sky',
    title: 'How to Actually Create a Server (3 Real Methods)',
    headline: 'You do not need an enterprise datacenter to run a server. You can create one for $0 on your personal laptop or rent one in the cloud.',
    analogy: {
      title: '🏠 Analogy: Building vs Renting Property',
      description: 'Creating a Local VM is like setting up a guest room in your own home (free, private, under your control). Creating a Cloud VPS (AWS/DigitalOcean) is like renting a serviced apartment in the middle of Manhattan: you get a direct street entrance on the global internet, backup generators, and fiber internet for a small monthly rent.'
    },
    keyTakeaways: [
      'Method 1 (Local VM / Free for Students): Oracle VirtualBox / WSL2. Allocate 2 CPU cores, 2GB RAM, and choose "Bridged Network" so the VM gets an IP on your home router.',
      'Method 2 (Cloud VPS): AWS EC2, DigitalOcean Droplet, Linode, or Hetzner. Select Ubuntu 24.04 LTS, pick $4–$5/mo tier, get a public IPv4 address in 60 seconds.',
      'Method 3 (Physical Machine): Install Ubuntu Server LTS on an old desktop/laptop via USB with Rufus. Turn off sleep mode and plug an Ethernet cable directly into your Wi-Fi router.',
      'First Connection: Run "ssh username@server_ip". The remote terminal prompt opens directly inside your terminal.'
    ],
    explanationCards: [
      {
        title: 'Comparison of Server Creation Methods',
        description: 'Choose the method best suited to your current learning setup and budget.',
        diagram: `+---------------------------------------------------------------+
| METHOD 1: LOCAL VM        | METHOD 2: CLOUD VPS ($4/mo)       |
| Software: VirtualBox/WSL2 | Providers: AWS, DigitalOcean      |
| Cost: 100% Free           | Cost: ~$0.006 per hour            |
| Network: Private Wi-Fi LAN| Network: Global Public IPv4       |
| Best for: Practice        | Best for: Real live websites      |
+---------------------------+-----------------------------------+`
      },
      {
        title: 'First 3 Commands on Any Fresh Server',
        description: 'Always run these three commands immediately after logging into a brand-new machine.',
        codeExample: `# 1. Update OS packages & security patches:
sudo apt update && sudo apt upgrade -y

# 2. Add a non-root admin user with sudo privileges:
sudo adduser appadmin
sudo usermod -aG sudo appadmin

# 3. Check server IP address:
ip -br addr`
      }
    ],
    quickCheatSheet: [
      { term: 'Cloud VPS', simpleMeaning: 'Virtual Private Server hosted in a cloud datacenter.', example: 'DigitalOcean Droplet' },
      { term: 'Bridged Adapter', simpleMeaning: 'VirtualBox setting allowing a VM to act as an independent physical device on Wi-Fi.', example: 'IP: 192.168.1.150' },
      { term: 'Headless', simpleMeaning: 'A computer running without monitor, keyboard, or mouse.', example: 'Ubuntu Server CLI' }
    ],
    tryItYourselfCommands: [
      {
        command: 'hostnamectl',
        whatItDoes: 'Displays server operating system details, kernel architecture, and digital hostname.',
        expectedOutput: 'Operating System: Ubuntu 24.04 LTS Kernel: Linux 6.8.0-31-generic'
      }
    ]
  },
  {
    id: 'why-linux-and-division',
    badge: 'Operating System',
    badgeColor: 'teal',
    title: 'Why Linux & How a Server is Divided',
    headline: 'Understanding how a Linux server partitions storage, allocates RAM, and runs background daemons.',
    analogy: {
      title: '🗄️ Analogy: The Professional Kitchen & Filing System',
      description: 'A personal computer is like a home kitchen where you leave ingredients on the counter. A Linux server is like a commercial restaurant kitchen: storage is strictly organized into labeled cabinets (/etc for recipes, /var for food inventory, /var/log for order receipts), and separate cooks (daemons) run 24/7 without needing the restaurant owner to stand in the room.'
    },
    keyTakeaways: [
      'Zero License Cost: Linux is 100% free. Windows Server licenses cost $1,000+ per CPU core in enterprise environments.',
      'Resource Efficiency: Linux Server runs on 256MB–512MB RAM with zero desktop GUI consuming CPU. Windows Server requires 2GB–3GB RAM just to boot.',
      'Filesystem Hierarchy: Everything in Linux lives under a single unified Root directory ("/"). Config files live in /etc, web files live in /var/www, and logs live in /var/log.',
      'Memory & Swap: Server RAM is divided into User Space and Kernel Space. Swap on disk acts as virtual memory overflow protection preventing sudden Out-Of-Memory crashes.',
      'Background Daemons: Managed by systemd (PID 1). Background programs start on boot and automatically restart if they crash.'
    ],
    explanationCards: [
      {
        title: 'How a Linux Server Disk is Divided',
        description: 'Standard Linux filesystem layout followed by all major enterprise distributions.',
        diagram: `/ (Root Directory)
├── /etc         -> ALL configuration files (nginx.conf, netplan, firewall)
├── /var         -> Dynamic variable data
│   ├── /var/www -> Web applications & HTML builds
│   └── /var/log -> System & error logs (nginx/, auth.log)
├── /home        -> User home directories (/home/ubuntu/)
├── /usr/bin     -> Application software binaries (node, python, git)
└── /boot        -> Linux kernel bootloader files`
      },
      {
        title: 'Managing Background Daemons with systemd',
        description: 'Control services running in the background without a logged-in user.',
        codeExample: `# Check if web server is actively running:
sudo systemctl status nginx

# Restart service after editing configuration:
sudo systemctl restart nginx

# Enable service to start automatically on server boot:
sudo systemctl enable nginx`
      }
    ],
    quickCheatSheet: [
      { term: '/etc', simpleMeaning: 'Folder where all server configurations live.', example: '/etc/nginx/sites-available/' },
      { term: '/var/www', simpleMeaning: 'Standard directory where web applications live.', example: '/var/www/my-app' },
      { term: 'Swap Space', simpleMeaning: 'Dedicated disk space used as overflow memory when RAM is full.', example: '2GB Swapfile on NVMe' },
      { term: 'systemd', simpleMeaning: 'Master Linux init system (PID 1) managing background services.', example: 'systemctl status nginx' }
    ],
    tryItYourselfCommands: [
      {
        command: 'df -h /',
        whatItDoes: 'Checks free disk space on the root partition.',
        expectedOutput: 'Filesystem Size Used Avail Use% Mounted on /dev/sda1 40G 5.2G 33G 14% /'
      },
      {
        command: 'free -h',
        whatItDoes: 'Displays total RAM, used RAM, and Swap space.',
        expectedOutput: 'Mem: Total: 7.7Gi Used: 1.4Gi Free: 4.8Gi Swap: 2.0Gi'
      }
    ]
  }
];
