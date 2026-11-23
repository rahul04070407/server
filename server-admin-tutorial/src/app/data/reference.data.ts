export interface CheatsheetCard {
  category: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  commands: { cmd: string; desc: string }[];
}

export interface TroubleshootingItem {
  title: string;
  badgeColor: 'coral';
  cause: string;
  solution: string;
  checkCommands: string;
  analogy: string;
}

export interface GlossaryTerm {
  keyword: string;
  category: string;
  definition: string;
  analogy: string;
  example: string;
}

export const CHEATSHEET_DATA: CheatsheetCard[] = [
  {
    category: 'Linux Terminal',
    badgeColor: 'teal',
    commands: [
      { cmd: 'ls -la', desc: 'List all files including hidden ones with permissions' },
      { cmd: 'cd /var/www', desc: 'Navigate to web root folder' },
      { cmd: 'chmod 400 key.pem', desc: 'Set read-only permissions on SSH private key' },
      { cmd: 'sudo chown -R ubuntu:ubuntu /var/www', desc: 'Transfer folder ownership to ubuntu user' },
      { cmd: 'sudo apt update && sudo apt upgrade -y', desc: 'Update package repositories & install patches' },
      { cmd: 'nano /etc/nginx/nginx.conf', desc: 'Edit text config files directly in terminal' }
    ]
  },
  {
    category: 'SSH & Remote Access',
    badgeColor: 'gold',
    commands: [
      { cmd: 'ssh-keygen -t ed25519 -C "student"', desc: 'Generate high-security asymmetric key pair' },
      { cmd: 'ssh-copy-id ubuntu@203.0.113.5', desc: 'Copy public key to server authorized_keys' },
      { cmd: 'chmod 400 key.pem', desc: 'Lock key file permissions so SSH client accepts it' },
      { cmd: 'ssh -i key.pem ubuntu@203.0.113.5', desc: 'Connect to remote server terminal over encrypted tunnel' }
    ]
  },
  {
    category: 'Nginx Web Server',
    badgeColor: 'sky',
    commands: [
      { cmd: 'sudo nginx -t', desc: 'Test configuration syntax before applying' },
      { cmd: 'sudo systemctl reload nginx', desc: 'Hot-reload Nginx configuration with zero downtime' },
      { cmd: 'sudo systemctl restart nginx', desc: 'Completely stop and restart Nginx daemon' },
      { cmd: 'proxy_pass http://localhost:3000;', desc: 'Forward incoming requests to internal backend port' }
    ]
  },
  {
    category: 'PM2 Process Manager',
    badgeColor: 'coral',
    commands: [
      { cmd: 'pm2 start index.js --name mern-api', desc: 'Launch application as a persistent background daemon' },
      { cmd: 'pm2 list', desc: 'List all managed apps with CPU%, RAM, and uptime' },
      { cmd: 'pm2 logs', desc: 'Stream live console logs and runtime error traces' },
      { cmd: 'pm2 save && pm2 startup', desc: 'Save process list and enable systemd auto-restart on boot' }
    ]
  },
  {
    category: 'SSL/TLS & Certbot',
    badgeColor: 'teal',
    commands: [
      { cmd: 'sudo certbot --nginx -d myapp.com', desc: 'Automatically request free SSL cert & configure Nginx' },
      { cmd: 'sudo certbot renew --dry-run', desc: 'Simulate automated 90-day SSL renewal without changes' },
      { cmd: 'listen 443 ssl;', desc: 'Nginx directive enabling encrypted HTTPS listener' },
      { cmd: 'return 301 https://$host$request_uri;', desc: 'Permanent redirect forcing HTTP visitors to HTTPS' }
    ]
  },
  {
    category: 'DNS & Domain Records',
    badgeColor: 'gold',
    commands: [
      { cmd: 'A record -> 203.0.113.5', desc: 'Points root domain directly to server public IPv4' },
      { cmd: 'CNAME -> myapp.com', desc: 'Creates an alias (e.g. www) pointing to root domain' },
      { cmd: 'dig myapp.com', desc: 'Inspects global DNS resolution for a domain' },
      { cmd: 'nslookup myapp.com', desc: 'Queries configured DNS server for IP address records' }
    ]
  }
];

export const TROUBLESHOOTING_DATA: TroubleshootingItem[] = [
  {
    title: '502 Bad Gateway',
    badgeColor: 'coral',
    cause: 'Nginx received the visitor\'s request successfully, but the backend application (Node.js/Spring Boot) on port 3000 is either stopped, crashed, or listening on a different port.',
    solution: 'Verify the backend app is online using "pm2 list". Send a test request from the server terminal using "curl http://localhost:3000". Check proxy_pass in your Nginx config matches the exact port.',
    checkCommands: 'pm2 list\ncurl http://localhost:3000\nsudo netstat -tulpn | grep 3000',
    analogy: 'The hotel receptionist (Nginx) dialed Room 3000 on the intercom, but nobody answered because the guest (Node.js) fell asleep.'
  },
  {
    title: 'SSL Certificate Not Renewing',
    badgeColor: 'coral',
    cause: 'Certbot could not complete the HTTP-01 domain validation challenge because Port 80 is blocked in the firewall, or DNS A record does not match the server IP.',
    solution: 'Ensure Port 80 is open in UFW ("sudo ufw allow 80/tcp"). Verify DNS A record matches your public IP with "dig +short myapp.com". Test renewal with dry-run.',
    checkCommands: 'sudo certbot renew --dry-run\nsudo ufw status verbose\ndig +short myapp.com',
    analogy: 'The passport renewal inspector tried to mail you a verification letter, but your mailbox (Port 80) was nailed shut.'
  },
  {
    title: 'Permission Denied (publickey)',
    badgeColor: 'coral',
    cause: 'SSH rejected the private key because permissions on your laptop are too permissive (not chmod 400), or your public key is missing from the server\'s ~/.ssh/authorized_keys file.',
    solution: 'Run "chmod 400 key.pem" on your laptop. On the server, ensure ~/.ssh is 700 and authorized_keys is 600, owned by the target user.',
    checkCommands: 'chmod 400 key.pem\nssh -vvv -i key.pem ubuntu@SERVER_IP',
    analogy: 'The lock was changed or your key teeth are scratched. The server refuses to let you turn the key.'
  },
  {
    title: 'Nginx Configuration Error',
    badgeColor: 'coral',
    cause: 'Syntax error in /etc/nginx/sites-available/ (e.g. missing semicolon, misspelled directive, or duplicated server_name).',
    solution: 'Always test syntax before reloading: run "sudo nginx -t". Fix the line number indicated in the output, then run "sudo systemctl reload nginx".',
    checkCommands: 'sudo nginx -t\nsudo journalctl -u nginx --no-pager -n 20',
    analogy: 'A road sign has a misspelled city name or points in two opposite directions, causing traffic cops to halt traffic.'
  }
];

export const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    keyword: 'IP Address',
    category: 'Networking',
    definition: 'Unique numerical address assigned to every device on a network so routers can deliver packets.',
    analogy: 'A physical postal street address for a house.',
    example: '192.168.1.10 (Private) or 203.0.113.5 (Public)'
  },
  {
    keyword: 'Port',
    category: 'Networking',
    definition: '16-bit number identifying a specific running application on a server.',
    analogy: 'Apartment number inside a large apartment building.',
    example: 'Port 80 (HTTP), Port 443 (HTTPS), Port 22 (SSH)'
  },
  {
    keyword: 'HTTP / HTTPS',
    category: 'Protocols',
    definition: 'HyperText Transfer Protocol used by web browsers. HTTPS encrypts traffic using SSL/TLS.',
    analogy: 'HTTP is sending a postcard (anyone can read it); HTTPS is sending a locked tamper-proof safe.',
    example: 'https://bank.com'
  },
  {
    keyword: 'SSH',
    category: 'Security',
    definition: 'Secure Shell protocol used to control a remote computer\'s terminal over an encrypted connection.',
    analogy: 'A secure, encrypted telephone line directly to the server\'s cockpit.',
    example: 'ssh -i key.pem ubuntu@203.0.113.5'
  },
  {
    keyword: 'Key Pair',
    category: 'Security',
    definition: 'Asymmetric cryptography pair: a private key (secret) and public key (shared) used for authentication.',
    analogy: 'A locked mailbox: anyone can drop a letter via public slot; only private key can open it.',
    example: 'id_ed25519 (private) + id_ed25519.pub (public)'
  },
  {
    keyword: 'Nginx',
    category: 'Web Server',
    definition: 'High-performance web server, reverse proxy, load balancer, and HTTP cache.',
    analogy: 'The hotel receptionist at the front desk directing guests to rooms.',
    example: 'systemctl status nginx'
  },
  {
    keyword: 'Reverse Proxy',
    category: 'Architecture',
    definition: 'Server that sits in front of backend applications, receiving public requests and forwarding them.',
    analogy: 'A personal assistant who answers the phone so callers never talk directly to the CEO.',
    example: 'Nginx forwarding 443 -> localhost:3000'
  },
  {
    keyword: 'proxy_pass',
    category: 'Nginx',
    definition: 'Nginx configuration directive specifying where to forward matching incoming requests.',
    analogy: 'The transfer button on a phone switchboard.',
    example: 'proxy_pass http://localhost:3000;'
  },
  {
    keyword: 'PM2',
    category: 'Process Management',
    definition: 'Production process manager for Node.js that keeps apps alive 24/7 with auto-restarts and clustering.',
    analogy: 'A dedicated 24/7 babysitter that picks up the app whenever it falls down.',
    example: 'pm2 start app.js --name api'
  },
  {
    keyword: 'DNS',
    category: 'Networking',
    definition: 'Domain Name System: translates human-readable domain names into machine-readable IP addresses.',
    analogy: 'The contact book on your smartphone translating contact names to phone numbers.',
    example: 'myapp.com -> 203.0.113.5'
  },
  {
    keyword: 'A Record',
    category: 'DNS',
    definition: 'Address record mapping a domain name directly to an IPv4 address.',
    analogy: 'The main phonebook entry for a business.',
    example: 'myapp.com A 203.0.113.5'
  },
  {
    keyword: 'SSL / TLS',
    category: 'Security',
    definition: 'Cryptographic protocols providing end-to-end encryption and authentication over networks.',
    analogy: 'An armored bank truck transporting confidential documents.',
    example: 'TLS 1.3 encryption on Port 443'
  },
  {
    keyword: 'Let\'s Encrypt',
    category: 'Security',
    definition: 'Non-profit certificate authority providing free, automated SSL/TLS certificates worldwide.',
    analogy: 'A free digital government passport agency.',
    example: 'Issues 90-day certificates'
  },
  {
    keyword: 'Certbot',
    category: 'Automation',
    definition: 'Command-line tool that automates obtaining and renewing Let\'s Encrypt certificates.',
    analogy: 'The automated robot that renews your passport automatically without waiting in line.',
    example: 'sudo certbot --nginx'
  },
  {
    keyword: 'MERN Stack',
    category: 'Architecture',
    definition: 'Full-stack web software stack comprising MongoDB, Express, React, and Node.js.',
    analogy: 'A complete modular assembly line: database warehouse (Mongo), engine (Express/Node), and user display (React).',
    example: 'React frontend + Node API + MongoDB'
  }
];
