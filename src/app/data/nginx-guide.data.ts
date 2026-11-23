export interface NginxConfigSnippet {
  title: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  purpose: string;
  configFile: string;
  fullConfigCode: string;
  lineByLineExplanation: { line: string; explanation: string }[];
  testCommand: string;
}

export interface NginxTopic {
  id: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  headline: string;
  analogy: {
    title: string;
    description: string;
  };
  conceptSummary: string;
  architectureDiagram?: string;
  comparisonTable?: {
    feature: string;
    nginx: string;
    apache: string;
    directNodeOrJava: string;
  }[];
  configs?: NginxConfigSnippet[];
  cliCommands?: {
    command: string;
    purpose: string;
    whenToUse: string;
  }[];
  troubleshooting?: {
    errorCode: string;
    cause: string;
    solution: string;
    diagnosticCommand: string;
  }[];
}

export const NGINX_GUIDE_DATA: NginxTopic[] = [
  {
    id: 'nginx-reverse-proxy',
    badge: 'Step 4 from PDF',
    badgeColor: 'teal',
    title: 'Nginx Reverse Proxy Architecture',
    headline: 'Nginx sits at the front door (ports 80/443) of your server, shielding your application and forwarding requests.',
    analogy: {
      title: '🛎️ Analogy: The Hotel Receptionist',
      description: 'Nginx is the front desk receptionist at a luxury hotel. When visitors arrive at the main lobby (ports 80/443), they do not walk directly into the private guest rooms. They speak to the receptionist (Nginx), who verifies credentials (SSL certificates), checks the room directory (URL routing), and connects them to Room 3000 (Node.js). The guest never has to deal with the public directly!'
    },
    conceptSummary: 'Why not just expose your Node.js or Spring Boot app directly to Port 80? Because application runtimes are built to execute business logic, not to defend against slow-loris DDoS attacks, terminate SSL certificates, or serve static images directly from kernel space.',
    architectureDiagram: `Client  -->  https://myapp.com/api/users
                |
                v  (Port 443 HTTPS)
+-------------------------------------------------------------+
| NGINX REVERSE PROXY                                         |
| - Listens on Port 443                                       |
| - Decrypts SSL/TLS certificate                              |
| - Matches "location /api/"                                  |
| - Forwards to http://localhost:3000/api/users               |
+-------------------------------------------------------------+
                |
                v  (Internal local loopback)
+-------------------------------------------------------------+
| NODE.JS BACKEND RUNTIME (Port 3000)                         |
| - Processes request & returns JSON response                 |
| - Node.js -> Nginx -> Client Browser                        |
+-------------------------------------------------------------+`,
    comparisonTable: [
      {
        feature: 'Position in Network',
        nginx: 'Reverse Proxy: Sits in front of backend servers. Clients do not know the backend exists.',
        apache: 'Direct web server or reverse proxy, process/thread heavy.',
        directNodeOrJava: 'Direct exposure: Application is exposed directly to raw internet attacks.'
      },
      {
        feature: 'Memory at 10,000 Visitors',
        nginx: '~10 MB – 25 MB RAM total using Linux epoll event loop.',
        apache: '500 MB – 2 GB RAM (thread-per-request overhead).',
        directNodeOrJava: 'Single-thread event loop queue lag or JVM heap exhaustion.'
      },
      {
        feature: 'Static File Delivery',
        nginx: 'Direct kernel sendfile() bypassing user space memory entirely.',
        apache: 'Good, but higher CPU overhead per connection.',
        directNodeOrJava: 'Slow: Buffers binary files in JavaScript/Java memory.'
      }
    ],
    cliCommands: [
      {
        command: 'sudo apt update && sudo apt install nginx -y',
        purpose: 'Installs the official Nginx package on Ubuntu/Debian.',
        whenToUse: 'Once during initial server setup.'
      },
      {
        command: 'sudo systemctl start nginx && sudo systemctl enable nginx',
        purpose: 'Starts Nginx and configures it to start automatically on system boot.',
        whenToUse: 'After initial installation.'
      },
      {
        command: 'sudo nginx -t',
        purpose: 'Tests configuration syntax for mistakes before reloading.',
        whenToUse: 'Mandatory before running systemctl reload nginx.'
      }
    ]
  },
  {
    id: 'nginx-config-types',
    badge: '5 Production Templates',
    badgeColor: 'gold',
    title: 'Different Types of Nginx Configurations',
    headline: 'Master the 5 essential production configuration files every system engineer and developer needs.',
    analogy: {
      title: '🚦 Analogy: The Airport Traffic Controller',
      description: 'Nginx config blocks act like airport runway controllers: they inspect the tail number (server_name), look at the cargo type (location path), and decide whether to send the plane to Terminal 1 (static HTML), Terminal 2 (backend Node API), or divert unencrypted flights to the secure runway (HTTP to HTTPS redirect).'
    },
    conceptSummary: 'Every configuration file in Nginx is structured cleanly as: "server {}" (virtual host) containing "listen" (port), "server_name" (domain), and "location {}" (URL routing blocks).',
    configs: [
      {
        title: 'Type 1: Static Website & Angular Single Page App (SPA)',
        badge: 'Frontend SPA',
        badgeColor: 'teal',
        purpose: 'Hosts compiled HTML, CSS, JavaScript, or Angular/React SPAs with client-side routing support.',
        configFile: '/etc/nginx/sites-available/my-angular-app.conf',
        fullConfigCode: `server {
    listen 80;
    server_name mydomain.com www.mydomain.com;

    root /var/www/my-angular-app/browser;
    index index.html;

    # Gzip Compression for fast page loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    # Single Page App routing: prevents 404 when user refreshes /dashboard
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets for 30 days
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}`,
        lineByLineExplanation: [
          { line: 'listen 80;', explanation: 'Listens for standard incoming HTTP traffic on Port 80.' },
          { line: 'server_name mydomain.com;', explanation: 'Matches requests where the HTTP Host header is mydomain.com.' },
          { line: 'root /var/www/...;', explanation: 'The physical disk directory containing your compiled production build files.' },
          { line: 'try_files $uri $uri/ /index.html;', explanation: 'CRITICAL: If the exact file is not found on disk, serves index.html so Angular router can handle the URL.' }
        ],
        testCommand: 'sudo nginx -t && sudo systemctl reload nginx'
      },
      {
        title: 'Type 2: Reverse Proxy to Backend API (Node / Express / Spring)',
        badge: 'Backend Proxy',
        badgeColor: 'sky',
        purpose: 'Forwards public web requests on ports 80/443 to an internal backend app running on localhost:3000.',
        configFile: '/etc/nginx/sites-available/api-proxy.conf',
        fullConfigCode: `server {
    listen 80;
    server_name api.mydomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Forward real client identity to backend app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for live real-time feeds
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts to prevent hanging connections
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}`,
        lineByLineExplanation: [
          { line: 'proxy_pass http://127.0.0.1:3000;', explanation: 'Hands off the incoming request to the internal Node.js process running on port 3000.' },
          { line: 'proxy_set_header X-Real-IP $remote_addr;', explanation: 'Passes the client\'s true IP address to the backend for audit logs and security.' },
          { line: 'proxy_set_header Upgrade $http_upgrade;', explanation: 'Enables WebSocket handshake upgrade for real-time applications.' }
        ],
        testCommand: 'curl -I http://api.mydomain.com'
      },
      {
        title: 'Type 3: Production SSL/TLS (HTTPS) + Auto HTTP->HTTPS Redirect',
        badge: 'Security & SSL',
        badgeColor: 'coral',
        purpose: 'Enforces bank-grade HTTPS encryption with Let\'s Encrypt certificates and automatically redirects insecure HTTP requests to HTTPS.',
        configFile: '/etc/nginx/sites-available/secure-site.conf',
        fullConfigCode: `# 1. Port 80: Permanent 301 redirect to HTTPS
server {
    listen 80;
    server_name mydomain.com www.mydomain.com;
    return 301 https://$host$request_uri;
}

# 2. Port 443: Secure Encrypted HTTPS Server
server {
    listen 443 ssl http2;
    server_name mydomain.com www.mydomain.com;

    # SSL Certificates managed via Certbot Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/mydomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mydomain.com/privkey.pem;

    # Modern TLS Protocols & Ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}`,
        lineByLineExplanation: [
          { line: 'return 301 https://$host$request_uri;', explanation: 'Permanent redirect telling browsers to always upgrade to HTTPS.' },
          { line: 'listen 443 ssl http2;', explanation: 'Listens on port 443 with TLS encryption and HTTP/2 multiplexing.' },
          { line: 'Strict-Transport-Security (HSTS);', explanation: 'Forces modern browsers to refuse any unencrypted connections for 1 year.' }
        ],
        testCommand: 'sudo certbot --nginx -d mydomain.com'
      },
      {
        title: 'Type 4: Upstream Load Balancer (Horizontal Scaling)',
        badge: 'Load Balancer',
        badgeColor: 'gold',
        purpose: 'Spreads incoming traffic across multiple backend server instances to handle high traffic and provide redundancy.',
        configFile: '/etc/nginx/conf.d/load-balancer.conf',
        fullConfigCode: `# Define backend server cluster
upstream backend_cluster {
    least_conn; # Sends new requests to the least busy server

    server 10.0.0.10:3000 weight=3 max_fails=3 fail_timeout=10s;
    server 10.0.0.11:3000 weight=2 max_fails=3 fail_timeout=10s;
    server 10.0.0.12:3000 backup; # Standby server activated only if others fail!
}

server {
    listen 80;
    server_name app.mydomain.com;

    location / {
        proxy_pass http://backend_cluster;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`,
        lineByLineExplanation: [
          { line: 'upstream backend_cluster { ... }', explanation: 'Defines a named pool of backend application instances.' },
          { line: 'least_conn;', explanation: 'Distributes traffic to the server currently handling the fewest active connections.' },
          { line: 'server ... backup;', explanation: 'Standby node that only receives traffic if all primary servers go down.' }
        ],
        testCommand: 'curl -I http://app.mydomain.com'
      },
      {
        title: 'Type 5: Production Hardening, Rate Limiting & DDoS Shield',
        badge: 'Security Shield',
        badgeColor: 'coral',
        purpose: 'Protects backend APIs from brute-force password attacks, scraper bots, and request floods.',
        configFile: '/etc/nginx/conf.d/rate-limiting.conf',
        fullConfigCode: `# 10MB memory zone tracking visitor IP addresses (~160,000 IPs)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=2r/s;

server {
    listen 80;
    server_name api.mydomain.com;

    # Protect login endpoint: Max 2 requests/sec with burst of 5
    location /api/v1/auth/login {
        limit_req zone=login_limit burst=5 nodelay;
        limit_req_status 429; # Returns HTTP 429 Too Many Requests

        proxy_pass http://127.0.0.1:3000;
    }

    # General API endpoints: Max 10 requests/sec
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }

    # Cap file uploads at 10MB to protect memory
    client_max_body_size 10M;
}`,
        lineByLineExplanation: [
          { line: 'limit_req_zone $binary_remote_addr ... rate=10r/s;', explanation: 'Creates an in-memory token-bucket limiter tracking visitor IPs.' },
          { line: 'burst=5 nodelay;', explanation: 'Permits brief bursts while instantly blocking continuous flood attacks.' },
          { line: 'client_max_body_size 10M;', explanation: 'Prevents out-of-memory crashes by rejecting uploads exceeding 10MB.' }
        ],
        testCommand: 'ab -n 50 -c 10 http://api.mydomain.com/api/v1/auth/login'
      }
    ]
  },
  {
    id: 'pm2-process-management',
    badge: 'Step 5 from PDF',
    badgeColor: 'coral',
    title: 'Process Management with PM2 & Systemd',
    headline: 'If your application code encounters an error or the server reboots, what keeps it alive?',
    analogy: {
      title: '🧑‍🍼 Analogy: The Dedicated Babysitter',
      description: 'Running "node app.js" in your terminal is like a toddler playing alone: the moment you close the laptop or an unhandled exception occurs, the app falls down and dies. PM2 is like a dedicated 24/7 babysitter: it watches your app continuously. If the app stumbles and crashes, PM2 instantly picks it up and restarts it in milliseconds. If the whole house (server) loses power and reboots, PM2 makes sure the app is running before visitors even notice!'
    },
    conceptSummary: 'PM2 is a production process manager for Node.js. It runs applications in the background, keeps logs, monitors CPU/RAM, and hooks into systemd so apps start on system boot.',
    cliCommands: [
      {
        command: 'sudo npm install -g pm2',
        purpose: 'Installs PM2 globally as a system tool.',
        whenToUse: 'Once on any server hosting Node.js apps.'
      },
      {
        command: 'pm2 start index.js --name mern-api',
        purpose: 'Launches your application as an independent background daemon process.',
        whenToUse: 'When deploying a new Node.js service.'
      },
      {
        command: 'pm2 list',
        purpose: 'Displays all running processes with their status, CPU%, RAM, and restart count.',
        whenToUse: 'To verify whether your backend app is online or restarting in a loop.'
      },
      {
        command: 'pm2 logs mern-api',
        purpose: 'Streams real-time console.log and error output from your application.',
        whenToUse: 'When debugging backend errors and exceptions.'
      },
      {
        command: 'pm2 save && pm2 startup',
        purpose: 'Saves the current process list and creates a systemd startup script.',
        whenToUse: 'Mandatory! Ensures your app restarts automatically after a server reboot.'
      }
    ],
    architectureDiagram: `[ Operating System Boot / Reboot ]
            |
            v
[ systemd Init System (PID 1) ]
            |
            v  (Triggers pm2-root service)
[ PM2 Process Manager ]
            |
    +-------+-------+
    |               |
    v               v
[ Worker 1 ]    [ Worker 2 ]  (Cluster Mode: Restarts on crash in <10ms)`
  },
  {
    id: 'dns-ssl-certbot',
    badge: 'Step 6 from PDF',
    badgeColor: 'sky',
    title: 'DNS Records & SSL/TLS with Certbot',
    headline: 'Connect your human-readable domain name to your server IP, and secure all traffic with free automated HTTPS certificates.',
    analogy: {
      title: '🛂 Analogy: The Passport Office',
      description: 'An SSL certificate is like an official international passport proving your website\'s real identity to visitors\' browsers. In the old days, you had to manually pay $100 and wait weeks at a passport office every year. Certbot is like an automated robot passport agent: it verifies your domain, generates your cryptographic passport for free from Let\'s Encrypt, and automatically renews it every 90 days without you lifting a finger!'
    },
    conceptSummary: 'DNS A records connect your domain (myapp.com) to your server\'s public IP. Certbot talks to Let\'s Encrypt to verify domain ownership and writes the SSL config directly into Nginx.',
    architectureDiagram: `1. DNS A RECORD MAPPING:
   Domain Name: myapp.com  ----->  Points to Server IP: 203.0.113.5

2. CERTBOT AUTOMATION:
   Server Terminal: sudo certbot --nginx -d myapp.com
          |
          v (Let's Encrypt issues free TLS certificate)
   Cert: /etc/letsencrypt/live/myapp.com/fullchain.pem
   Key:  /etc/letsencrypt/live/myapp.com/privkey.pem
          |
          v (Auto-configures Nginx Port 443 with HTTPS & 301 Redirect)`
  }
];
