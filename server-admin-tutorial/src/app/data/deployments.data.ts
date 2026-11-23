export interface DeploymentStep {
  step: number;
  title: string;
  commandOrConfig: string;
  explanation: string;
}

export interface DeploymentGuide {
  id: string;
  title: string;
  technology: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  targetOS: 'Linux (Ubuntu/Debian)' | 'Windows Server (IIS)' | 'Full-Stack Multi-Tier';
  architectureSummary: string;
  prerequisites: string[];
  steps: DeploymentStep[];
  productionChecklist: string[];
  troubleshootingScenarios: { symptom: string; cause: string; fix: string }[];
}

export const DEPLOYMENTS_DATA: DeploymentGuide[] = [
  {
    id: 'angular-linux-nginx',
    title: 'Angular Production Build & Hosting on Linux Nginx',
    technology: 'Angular 18/19/21 + Nginx + Ubuntu Server',
    badgeColor: 'teal',
    targetOS: 'Linux (Ubuntu/Debian)',
    architectureSummary: 'Compiles Angular into high-performance static client-side bundles (Ahead-of-Time compilation, minified HTML/JS/CSS, Brotli/Gzip compression) and configures Nginx to serve assets with strict caching headers, SPA URL rewrite fallback, and TLS 1.3 encryption.',
    prerequisites: [
      'Node.js 20+ and Angular CLI installed on build runner',
      'Ubuntu Server 24.04 LTS instance with public IP or domain name',
      'Nginx installed and ports 80/443 open in UFW firewall',
      'Domain DNS A-record pointing to server IP (e.g. app.company.com)'
    ],
    steps: [
      {
        step: 1,
        title: 'Generate Production Build with Optimized Bundling',
        commandOrConfig: `# Run inside your Angular project repository:
ng build --configuration production

# Inspect compiled output in dist directory:
ls -lh dist/*/browser/`,
        explanation: 'The --configuration production flag triggers Ahead-of-Time (AOT) compilation, tree-shaking (removing unused code), dead code elimination, and content hashing in filenames (e.g., main-7X492A.js) to support aggressive browser caching.'
      },
      {
        step: 2,
        title: 'Transfer Build Artifacts to Production Web Root',
        commandOrConfig: `# Create web root directory on Ubuntu server:
sudo mkdir -p /var/www/angular-app

# Copy files from build machine to server via rsync / scp:
rsync -avz --delete dist/*/browser/ sysadmin@10.0.1.10:/tmp/angular-build/

# Move files to web root and assign correct ownership:
sudo rsync -avz --delete /tmp/angular-build/ /var/www/angular-app/
sudo chown -R www-data:www-data /var/www/angular-app
sudo chmod -R 755 /var/www/angular-app`,
        explanation: 'Ensures the Nginx worker process (running as www-data user) has read permissions across all bundle files and directories while disallowing write permissions for security.'
      },
      {
        step: 3,
        title: 'Configure Hardened Nginx Virtual Host with SPA Fallback & Compression',
        commandOrConfig: `# Write configuration to /etc/nginx/sites-available/angular-app.conf:
sudo tee /etc/nginx/sites-available/angular-app.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name app.company.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.company.com;

    root /var/www/angular-app;
    index index.html;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/app.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.company.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    # Static assets with cache busting (1 year cache)
    location ~* \.(?:css|js|woff2?|svg|ttf|eot|ico|png|jpg|jpeg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # SPA Route Fallback (Mandatory for Angular Router)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF`,
        explanation: 'Crucial setting: "try_files $uri $uri/ /index.html;" enables client-side routing. When a user directly visits https://app.company.com/dashboard/billing, Nginx checks if a physical file exists; if not, it serves index.html so Angular’s Router handles the path instead of returning an HTTP 404.'
      },
      {
        step: 4,
        title: 'Enable Site, Test Syntax, and Reload Nginx',
        commandOrConfig: `# Create symlink in sites-enabled:
sudo ln -sf /etc/nginx/sites-available/angular-app.conf /etc/nginx/sites-enabled/

# Remove default site if present:
sudo rm -f /etc/nginx/sites-enabled/default

# Validate configuration syntax:
sudo nginx -t

# Reload Nginx without dropping active connections:
sudo systemctl reload nginx`,
        explanation: 'Always test syntax with "sudo nginx -t" before reloading. A syntax error caught during reload will not crash active worker processes.'
      }
    ],
    productionChecklist: [
      'SPA route fallback confirmed: refreshing browser on deep URL returns 200 OK, not 404',
      'Cache-Control headers verified: index.html has no-cache; hashed .js/.css have 1y immutable cache',
      'Gzip/Brotli compression verified via curl -I -H "Accept-Encoding: gzip" https://app.company.com',
      'HTTP to HTTPS redirection verified with 301 Moved Permanently',
      'Certbot renewal timer active: sudo systemctl status certbot.timer'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Refreshing browser on /settings or deep route returns HTTP 404 Not Found.',
        cause: 'Missing "try_files $uri $uri/ /index.html;" in Nginx server block. Nginx searches the disk for a physical /settings folder and fails.',
        fix: 'Add try_files directive to location / block and reload Nginx.'
      },
      {
        symptom: 'Users report seeing old version of website even after a new deployment.',
        cause: 'index.html was cached by user browsers because Cache-Control headers were missing or configured with long expiry.',
        fix: 'Set "add_header Cache-Control \'no-cache, no-store, must-revalidate\';" specifically for the index.html location block.'
      }
    ]
  },
  {
    id: 'angular-windows-iis',
    title: 'Angular Production Hosting on Windows Server IIS',
    technology: 'Angular + IIS 10 + URL Rewrite 2.1 + Windows Server 2022',
    badgeColor: 'gold',
    targetOS: 'Windows Server (IIS)',
    architectureSummary: 'Hosts Angular SPA builds on Microsoft Internet Information Services (IIS) using an isolated Application Pool, static compression, and URL Rewrite rules configured in web.config to handle client-side routing.',
    prerequisites: [
      'Windows Server 2022 with Web Server (IIS) role installed',
      'IIS URL Rewrite Module 2.1 installed (mandatory for SPA routing)',
      'TLS Certificate imported into Windows Certificate Store (Local Computer > Personal)',
      'Administrator access on Windows Server'
    ],
    steps: [
      {
        step: 1,
        title: 'Install IIS Features & URL Rewrite Module',
        commandOrConfig: `# Run in Administrative PowerShell:
Install-WindowsFeature -Name Web-Server, Web-WebServer, Web-Common-Http, Web-Static-Content, Web-Http-Redirect, Web-Http-Logging -IncludeManagementTools

# Download and install URL Rewrite 2.1 extension:
$UrlRewriteUrl = "https://download.microsoft.com/download/1/2/8/128E2E03-C54D-4A73-AEAB-C32B5A99F8F8/rewrite_amd64_en-US.msi"
Invoke-WebRequest -Uri $UrlRewriteUrl -OutFile "$env:TEMP\\rewrite.msi"
Start-Process -FilePath msiexec -ArgumentList "/i $env:TEMP\\rewrite.msi /quiet /qn" -Wait`,
        explanation: 'Installs core IIS web serving modules and silently installs the Microsoft URL Rewrite extension required to rewrite client-side browser routes to index.html.'
      },
      {
        step: 2,
        title: 'Create Dedicated IIS Application Pool & Web Directory',
        commandOrConfig: `# Create web root folder:
New-Item -ItemType Directory -Path "C:\\inetpub\\angular-portal" -Force

# Create dedicated unmanaged Application Pool (No .NET runtime required for static assets):
Import-Module WebAdministration
New-WebAppPool -Name "AngularPortalPool"
Set-ItemProperty -Path "IIS:\\AppPools\\AngularPortalPool" -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty -Path "IIS:\\AppPools\\AngularPortalPool" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"

# Create IIS Website:
New-Website -Name "AngularPortal" -Port 80 -PhysicalPath "C:\\inetpub\\angular-portal" -ApplicationPool "AngularPortalPool"`,
        explanation: 'Setting managedRuntimeVersion to "" configures the AppPool as "No Managed Code". Since Angular consists of static client files, loading the .NET CLR runtime is unnecessary, reducing memory footprint to under 15 MB.'
      },
      {
        step: 3,
        title: 'Create web.config with URL Rewrite & MIME Types',
        commandOrConfig: `# Place web.config inside C:\\inetpub\\angular-portal\\web.config:
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- URL Rewrite for Angular Client-Side Routing -->
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>

    <!-- Static Compression -->
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />

    <!-- Static File Caching Headers -->
    <staticContent>
      <remove fileExtension=".json" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <remove fileExtension=".woff2" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
    </staticContent>

    <!-- Default Document -->
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "C:\\inetpub\\angular-portal\\web.config" -Encoding UTF8`,
        explanation: 'The rewrite rule negates physical files and directories: if the requested URL does not match an actual file on disk and does not start with /api, IIS transparently serves the root index.html without changing the browser URL bar.'
      },
      {
        step: 4,
        title: 'Copy Angular Build and Bind HTTPS Certificate',
        commandOrConfig: `# Copy Angular production build output to C:\\inetpub\\angular-portal\\:
Copy-Item -Path "D:\\builds\\angular\\dist\\*\\browser\\*" -Destination "C:\\inetpub\\angular-portal\\" -Recurse -Force

# Bind SSL Certificate to Website on Port 443 with SNI:
$Cert = Get-ChildItem -Path Cert:\\LocalMachine\\My | Select-Object -First 1
New-WebBinding -Name "AngularPortal" -IPAddress "*" -Port 443 -Protocol https -SslFlags 1
Get-Item -Path "IIS:\\Sites\\AngularPortal" | Set-ItemProperty -Name "bindings" -Value @{protocol="https";bindingInformation="*:443:portal.corp.local";sslFlags=1}`,
        explanation: 'SslFlags=1 enables Server Name Indication (SNI), permitting multiple independent SSL certificates on a single shared IP address.'
      }
    ],
    productionChecklist: [
      'URL Rewrite Module 2.1 verified installed in IIS Modules view',
      'AppPool configured with managedRuntimeVersion = "" (No Managed Code)',
      'NTFS permissions on C:\\inetpub\\angular-portal grant "IIS AppPool\\AngularPortalPool" Read & Execute rights',
      'web.config tested for XML syntax errors (HTTP 500.19 resolution)',
      'HTTPS binding active with valid TLS certificate'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'HTTP Error 500.19 - Internal Server Error with Error Code 0x8007000d upon browsing site.',
        cause: 'web.config contains a <rewrite> section, but the IIS URL Rewrite Module is not installed on Windows Server.',
        fix: 'Download and install URL Rewrite Module 2.1 using msiexec /i rewrite_amd64.msi, then restart IIS with iisreset.'
      },
      {
        symptom: 'Font icons or .woff2 files fail to load with HTTP 404.',
        cause: 'IIS blocks file extensions without an explicit MIME type registered in staticContent.',
        fix: 'Add <mimeMap fileExtension=".woff2" mimeType="font/woff2" /> inside <staticContent> in web.config.'
      }
    ]
  },
  {
    id: 'nodejs-express-production',
    title: 'Node.js & Express Production Deployment with PM2 & Nginx',
    technology: 'Node.js 20/22 + Express + PM2 + systemd + Nginx',
    badgeColor: 'coral',
    targetOS: 'Linux (Ubuntu/Debian)',
    architectureSummary: 'Deploys a Node.js Express backend using PM2 cluster mode across all available physical CPU cores, manages environment variables and secrets securely, enables zero-downtime reloads, and places the cluster behind an Nginx reverse proxy with rate limiting.',
    prerequisites: [
      'Node.js 20+ LTS installed via NodeSource official repository',
      'PM2 process manager installed globally (npm install -g pm2)',
      'Nginx reverse proxy installed and configured',
      'Dedicated unprivileged system user for running application'
    ],
    steps: [
      {
        step: 1,
        title: 'Create Unprivileged Application User & Directory',
        commandOrConfig: `# Create system user with disabled interactive shell:
sudo useradd -r -s /bin/false -d /opt/node-api nodeuser

# Create application directory structure:
sudo mkdir -p /opt/node-api/logs
sudo chown -R nodeuser:nodeuser /opt/node-api`,
        explanation: 'Running Node.js as root is a critical security vulnerability. If an unhandled remote code execution (RCE) occurs, an attacker inherits root. Running as nodeuser confines the breach.'
      },
      {
        step: 2,
        title: 'Create Production ecosystem.config.js for PM2',
        commandOrConfig: `# Place inside /opt/node-api/ecosystem.config.js:
module.exports = {
  apps: [{
    name: 'enterprise-api',
    script: 'dist/server.js',
    instances: 'max',              // Clusters across all CPU cores
    exec_mode: 'cluster',          // Enables round-robin cluster mode
    watch: false,
    max_memory_restart: '1G',      // Automatically recycles worker if leak exceeds 1GB
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: '10.0.2.20',
      DB_PORT: 5432,
      DB_NAME: 'corp_db'
    },
    error_file: '/opt/node-api/logs/err.log',
    out_file: '/opt/node-api/logs/out.log',
    merge_logs: true,
    time: true,
    kill_timeout: 5000,            // Graceful shutdown timeout
    listen_timeout: 8000
  }]
};`,
        explanation: 'PM2 cluster mode utilizes Node.js cluster module to run multiple worker processes on a single port (3000) using internal OS round-robin load balancing. max_memory_restart guards against memory leak exhaustion.'
      },
      {
        step: 3,
        title: 'Configure systemd Auto-Start on System Boot',
        commandOrConfig: `# Start application using PM2 under nodeuser:
sudo -u nodeuser pm2 start /opt/node-api/ecosystem.config.js --env production

# Generate and configure systemd startup script:
sudo pm2 startup systemd -u nodeuser --hp /opt/node-api

# Save running process list so it restores upon reboot:
sudo -u nodeuser pm2 save

# Verify systemd service status:
sudo systemctl status pm2-nodeuser.service`,
        explanation: 'pm2 startup integrates PM2 with Linux systemd. If the server reboots for OS patching, systemd automatically launches PM2 and revives all clustered workers without manual intervention.'
      },
      {
        step: 4,
        title: 'Execute Zero-Downtime Deployment & Rolling Reload',
        commandOrConfig: `# Deploy new build artifacts:
git pull origin main && npm ci --production && npm run build

# Perform zero-downtime reload:
sudo -u nodeuser pm2 reload enterprise-api

# Check cluster status and memory utilization:
sudo -u nodeuser pm2 status
sudo -u nodeuser pm2 monit`,
        explanation: '"pm2 reload" performs rolling restarts: it spawns a new worker with updated code, verifies it is listening on port 3000, then terminates the old worker. Zero HTTP requests are dropped.'
      }
    ],
    productionChecklist: [
      'NODE_ENV strictly set to "production" (disables verbose Express stack traces)',
      'Application runs as non-root unprivileged user (nodeuser)',
      'pm2 save executed and verified in systemctl status pm2-nodeuser',
      'max_memory_restart configured to recycle leaky workers gracefully',
      'Graceful shutdown handled in Express code (server.close() on SIGINT/SIGTERM)'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'PM2 workers show status "errored" or restart in infinite loop (restarts count climbing).',
        cause: 'Application threw an unhandled exception on startup (e.g. missing environment variable or database unreachable).',
        fix: 'Run "sudo -u nodeuser pm2 logs --lines 50" to read the fatal crash stack trace.'
      },
      {
        symptom: 'Nginx returns HTTP 502 Bad Gateway intermittently under heavy load.',
        cause: 'Node.js event loop blocked by synchronous computation or database pool exhausted.',
        fix: 'Scale PM2 instances across all cores (instances: "max") and increase PostgreSQL connection pool size.'
      }
    ]
  },
  {
    id: 'java-springboot-production',
    title: 'Java & Spring Boot Production Deployment with systemd',
    technology: 'Java 21 OpenJDK + Spring Boot + systemd + Nginx',
    badgeColor: 'sky',
    targetOS: 'Linux (Ubuntu/Debian)',
    architectureSummary: 'Deploys an enterprise Spring Boot executable JAR as a hardened systemd Linux service with explicit JVM heap memory boundaries (-Xms/-Xmx), garbage collection tuning, cgroup resource limits, and an Nginx reverse proxy.',
    prerequisites: [
      'OpenJDK 21 Headless runtime installed on Ubuntu Server',
      'Spring Boot fat JAR package built with Maven or Gradle',
      'Dedicated unprivileged system user (springuser)',
      'Database connection verified from host'
    ],
    steps: [
      {
        step: 1,
        title: 'Install OpenJDK 21 & Create Application Directory',
        commandOrConfig: `# Install headless JRE (eliminates GUI/audio libraries):
sudo apt update && sudo apt install -y openjdk-21-jre-headless

# Verify Java version:
java -version

# Create service user and deployment directories:
sudo useradd -r -s /bin/false -d /opt/spring-app springuser
sudo mkdir -p /opt/spring-app/config /opt/spring-app/logs
sudo chown -R springuser:springuser /opt/spring-app`,
        explanation: 'Using openjdk-21-jre-headless minimizes disk space and removes unnecessary GUI dependencies from the production server.'
      },
      {
        step: 2,
        title: 'Create Hardened systemd Service Unit',
        commandOrConfig: `# Create service unit file: /etc/systemd/system/spring-app.service
sudo tee /etc/systemd/system/spring-app.service << 'EOF'
[Unit]
Description=Enterprise Spring Boot API Service
After=network.target postgresql.service
Requires=network.target

[Service]
Type=simple
User=springuser
Group=springuser
WorkingDirectory=/opt/spring-app

# Environment configuration
Environment="SPRING_PROFILES_ACTIVE=production"
Environment="LOG_PATH=/opt/spring-app/logs"
EnvironmentFile=-/opt/spring-app/config/application-prod.env

# JVM Memory and GC Parameters
ExecStart=/usr/bin/java \
    -server \
    -Xms2048m \
    -Xmx4096m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/opt/spring-app/logs/heapdump.hprof \
    -Djava.security.egd=file:/dev/./urandom \
    -jar /opt/spring-app/app.jar

# Restart Policies
Restart=always
RestartSec=10
SuccessExitStatus=143

# Security & Sandbox Isolation
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
NoNewPrivileges=true
ReadWritePaths=/opt/spring-app/logs

# Resource Limits (cgroups)
LimitNOFILE=65535
MemoryMax=5G

[Install]
WantedBy=multi-user.target
EOF`,
        explanation: '-Xms2048m allocates initial heap; -Xmx4096m caps maximum heap. -XX:+UseG1GC provides low-latency garbage collection. -XX:+HeapDumpOnOutOfMemoryError dumps memory state to disk if an OOM occurs for forensic analysis. ProtectSystem=strict prevents the service from writing to OS binaries.'
      },
      {
        step: 3,
        title: 'Deploy Application JAR and Launch Service',
        commandOrConfig: `# Copy Spring Boot JAR to target location:
sudo cp target/enterprise-api-1.0.0.jar /opt/spring-app/app.jar
sudo chown springuser:springuser /opt/spring-app/app.jar
sudo chmod 500 /opt/spring-app/app.jar

# Reload systemd daemon to pick up new service:
sudo systemctl daemon-reload

# Enable service to start on system boot:
sudo systemctl enable spring-app.service

# Start the service:
sudo systemctl start spring-app.service

# Verify service is running and inspect startup logs:
sudo systemctl status spring-app.service
sudo journalctl -u spring-app.service -f`,
        explanation: 'Setting file permissions to 500 (read & execute only by owner) prevents the running process from overwriting its own binary executable.'
      },
      {
        step: 4,
        title: 'Configure Health Checks and Nginx Proxy',
        commandOrConfig: `# Test Spring Boot Actuator health endpoint:
curl -I http://127.0.0.1:8080/actuator/health

# Configure Nginx upstream and reverse proxy:
sudo tee /etc/nginx/conf.d/spring-proxy.conf << 'EOF'
upstream spring_backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.company.com;

    location / {
        proxy_pass http://spring_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo nginx -t && sudo systemctl reload nginx`,
        explanation: 'keepalive 32 maintains persistent TCP connections between Nginx and Spring Boot, eliminating connection handshake latency.'
      }
    ],
    productionChecklist: [
      'JVM heap limits (-Xms and -Xmx) explicitly bounded to prevent host RAM starvation',
      'HeapDumpOnOutOfMemoryError enabled with valid write path in logs directory',
      'Actuator sensitive endpoints (/actuator/env, /actuator/beans) disabled in production',
      'systemd sandbox options (ProtectSystem=strict, NoNewPrivileges=true) verified active',
      'Database connection pool (HikariCP) sized appropriately (maximum-pool-size: 20)'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Spring Boot service crashes with OutOfMemoryError: Java heap space.',
        cause: 'Application loaded large datasets into RAM or has a memory leak holding object references.',
        fix: 'Inspect generated heapdump.hprof using Eclipse Memory Analyzer (MAT) to identify leaking classes; increase -Xmx if workload genuinely requires more memory.'
      },
      {
        symptom: 'Service takes 90 seconds to shut down or systemd forcefully kills it with SIGKILL.',
        cause: 'Database transactions or active threads are not shutting down gracefully.',
        fix: 'Enable "server.shutdown=graceful" in application.properties and configure spring.lifecycle.timeout-per-shutdown-phase=20s.'
      }
    ]
  },
  {
    id: 'fullstack-multitier-production',
    title: 'Complete Full-Stack Production Deployment (Angular + Node/Spring + DB + Redis)',
    technology: 'Angular + Spring/Node + PostgreSQL + Redis + Nginx + SSL',
    badgeColor: 'teal',
    targetOS: 'Full-Stack Multi-Tier',
    architectureSummary: 'End-to-end production deployment combining an Angular Single Page Application frontend, Node.js or Spring Boot backend API, PostgreSQL 16 database, Redis caching cluster, and Nginx reverse proxy with automated SSL, firewall lockdown, and monitoring telemetry.',
    prerequisites: [
      'Dedicated Web/App Server and Database Server instances',
      'Private network subnet (10.0.1.0/24 and 10.0.2.0/24)',
      'Public domain name with DNS A records configured',
      'SSH access to both servers'
    ],
    steps: [
      {
        step: 1,
        title: 'Provision & Secure Database & Cache Tier (Server B: 10.0.2.20)',
        commandOrConfig: `# On Database Host (10.0.2.20):
sudo apt install -y postgresql-16 redis-server ufw

# Configure PostgreSQL to listen on private network interface:
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '10.0.2.20,127.0.0.1'/" /etc/postgresql/16/main/postgresql.conf

# Permit connection from Web/App server ONLY in pg_hba.conf:
echo "host corp_db appuser 10.0.1.10/32 scram-sha-256" | sudo tee -a /etc/postgresql/16/main/pg_hba.conf

# Restart PostgreSQL:
sudo systemctl restart postgresql

# Harden Redis: bind only to private IP and enforce password
sudo sed -i 's/bind 127.0.0.1/bind 10.0.2.20 127.0.0.1/' /etc/redis/redis.conf
echo "requirepass EnterpriseSuperSecretRedisPass99#" | sudo tee -a /etc/redis/redis.conf
sudo systemctl restart redis-server

# UFW Firewall: Allow DB and Redis ONLY from Web/App host IP:
sudo ufw default deny incoming
sudo ufw allow from 10.0.1.10 to any port 5432 proto tcp comment 'PostgreSQL from Web/App'
sudo ufw allow from 10.0.1.10 to any port 6379 proto tcp comment 'Redis from Web/App'
sudo ufw allow from 10.0.0.0/16 to any port 22 proto tcp comment 'Internal SSH'
sudo ufw --force enable`,
        explanation: 'Enforces strict network tiering: the database and cache server accept connections exclusively from the Web/App server IP (10.0.1.10), rejecting all other network traffic.'
      },
      {
        step: 2,
        title: 'Deploy Backend Application Service (Server A: 10.0.1.10)',
        commandOrConfig: `# On Web/App Host (10.0.1.10):
# Deploy Node.js or Spring Boot backend connecting to remote database:
export DB_HOST="10.0.2.20"
export DB_PORT="5432"
export REDIS_HOST="10.0.2.20"

# Verify connectivity to database port:
nc -zv 10.0.2.20 5432
nc -zv 10.0.2.20 6379

# Launch backend service via systemd or PM2:
sudo systemctl start spring-app.service`,
        explanation: 'nc (netcat) tests raw TCP handshake to confirm firewall rules allow traffic through before launching the application.'
      },
      {
        step: 3,
        title: 'Deploy Angular Frontend & Configure Nginx Unified Ingress',
        commandOrConfig: `# Copy Angular production build to /var/www/angular-portal
sudo cp -r dist/*/browser/* /var/www/angular-portal/

# Nginx config routing frontend and backend on single domain:
sudo tee /etc/nginx/sites-available/portal.conf << 'EOF'
server {
    listen 80;
    server_name portal.company.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.company.com;

    ssl_certificate /etc/letsencrypt/live/portal.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.company.com/privkey.pem;

    # Frontend Angular SPA
    location / {
        root /var/www/angular-portal;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/portal.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`,
        explanation: 'Routing both Angular frontend and API backend through a single Nginx domain eliminates Cross-Origin Resource Sharing (CORS) preflight complexity.'
      },
      {
        step: 4,
        title: 'Obtain Automated TLS Certificate via Certbot',
        commandOrConfig: `# Run Certbot to acquire and install Let's Encrypt SSL:
sudo certbot --nginx -d portal.company.com --non-interactive --agree-tos -m admin@company.com

# Verify auto-renewal timer:
sudo systemctl list-timers | grep certbot`,
        explanation: 'Certbot provisions a production certificate, updates Nginx SSL directives, and registers a systemd timer for automatic renewals every 60 days.'
      }
    ],
    productionChecklist: [
      'Database port 5432 and Redis port 6379 are completely inaccessible from public internet',
      'Angular SPA routing handles browser reloads without 404 errors',
      'API calls succeed with sub-10ms response times over local Redis cache',
      'TLS certificate scores A+ on Qualys SSL Labs analysis',
      'Nocturnal automated database backup cron job active and verified with test restore'
    ],
    troubleshootingScenarios: [
      {
        symptom: 'Application logs: "Connection refused to 10.0.2.20:5432".',
        cause: 'PostgreSQL is either listening only on localhost or UFW firewall on Server B is blocking Server A.',
        fix: 'Check listen_addresses in postgresql.conf and run "sudo ufw status verbose" on Server B.'
      },
      {
        symptom: 'Angular displays CORS error in browser console when calling API.',
        cause: 'Angular was configured to call http://api-server:8080 directly instead of routing through relative path /api/.',
        fix: 'Update Angular environment.prod.ts apiUrl to "/api" so Nginx reverse proxies traffic locally.'
      }
    ]
  }
];
