export interface IncidentRunbook {
  id: string;
  ticketNumber: string;
  category: 'System & Hardware' | 'Web & Application' | 'Database & Storage' | 'Identity & Network' | 'Cloud & Containers';
  severity: 'P1 - Critical Outage' | 'P2 - High Degradation' | 'P3 - Medium Incident';
  title: string;
  reportedIssue: string;
  businessImpact: string;
  environment: string;
  affectedService: string;
  triage13Steps: {
    stepNumber: number;
    title: string;
    action: string;
    commands: string;
    expectedNormalOutput: string;
    abnormalOutputIndication: string;
    interpretation: string;
  }[];
  rootCause: string;
  resolution: string;
  verificationCommands: string;
  preventionMeasure: string;
}

export const INCIDENTS_DATA: IncidentRunbook[] = [
  {
    id: 'inc-01-disk-100',
    ticketNumber: 'INC-20491',
    category: 'System & Hardware',
    severity: 'P1 - Critical Outage',
    title: 'Root Filesystem Reaches 100% Disk Space, Crashing Critical Daemons',
    reportedIssue: 'Database server stopped accepting writes; Nginx returns HTTP 500; syslog reports "No space left on device".',
    businessImpact: 'Complete platform outage. All customer checkouts and background workers failing.',
    environment: 'Production Linux Database & Application Host (srv-prod-db01)',
    affectedService: 'PostgreSQL, Nginx, Docker, systemd-journald',
    triage13Steps: [
      {
        stepNumber: 1,
        title: 'Understand the reported problem',
        action: 'Review alert notifications from Prometheus Alertmanager: DiskSpaceFillingUp trigger fired.',
        commands: 'curl -s http://localhost:9090/api/v1/alerts | jq .',
        expectedNormalOutput: 'No active disk alerts; usage < 80%.',
        abnormalOutputIndication: 'Alert: "DiskSpaceFillingUp" state: "firing", severity: "critical".',
        interpretation: 'Confirms automated monitoring detected partition exhaustion before crash.'
      },
      {
        stepNumber: 2,
        title: 'Identify affected service and filesystem',
        action: 'Check mounted filesystems and inode utilization.',
        commands: 'df -hT && df -i',
        expectedNormalOutput: '/dev/mapper/ubuntu--vg-ubuntu--lv mounted on / with 30% used.',
        abnormalOutputIndication: 'Use% is 100% or IUse% (Inodes) is 100%.',
        interpretation: 'Identifies whether physical block storage is full or if millions of zero-byte files exhausted filesystem inodes.'
      },
      {
        stepNumber: 3,
        title: 'Check server reachability and load',
        action: 'Inspect load average and process queue.',
        commands: 'uptime && free -h',
        expectedNormalOutput: 'Load average below CPU core count.',
        abnormalOutputIndication: 'Extremely high disk D-state processes or high load.',
        interpretation: 'Processes are blocking on disk I/O write operations.'
      },
      {
        stepNumber: 4,
        title: 'Collect error logs',
        action: 'Inspect recent kernel and system journal messages.',
        commands: 'journalctl -n 50 -p err --no-pager',
        expectedNormalOutput: 'Normal operational logs without I/O errors.',
        abnormalOutputIndication: 'EXT4-fs error: no space left on device, journal aborting.',
        interpretation: 'Kernel filesystem drivers are refusing write buffers.'
      },
      {
        stepNumber: 5,
        title: 'Identify largest directories',
        action: 'Traverse root filesystem to locate disk bloat.',
        commands: 'sudo du -h --max-depth=1 / 2>/dev/null | sort -hr | head -n 10',
        expectedNormalOutput: '/var and /usr reasonable sizes (~5-10 GB).',
        abnormalOutputIndication: '/var/log consumes 85 GB or /var/lib/docker consumes 90 GB.',
        interpretation: 'Isolates the exact subdirectory accumulating unrotated data.'
      },
      {
        stepNumber: 6,
        title: 'Scan for deleted unlinked files held open by processes',
        action: 'Check if deleted log files are still held open in memory by active daemons.',
        commands: 'sudo lsof +L1',
        expectedNormalOutput: 'Empty or small system handles.',
        abnormalOutputIndication: 'nginx or java process holding deleted file of size 40GB.',
        interpretation: 'Deleting a log file with rm does not free disk space until the process holding the file handle is restarted.'
      },
      {
        stepNumber: 7,
        title: 'Examine largest individual files',
        action: 'Find files larger than 500MB on the root partition.',
        commands: 'sudo find /var/log -type f -size +500M -exec ls -lh {} +',
        expectedNormalOutput: 'All rotated logs compressed and under 100MB.',
        abnormalOutputIndication: '/var/log/nginx/access.log is 62 GB.',
        interpretation: 'Log rotation failed or runaway debug logging flooded disk.'
      },
      {
        stepNumber: 8,
        title: 'Truncate bloated files safely',
        action: 'Zero-out bloated log file without breaking open file descriptors.',
        commands: 'sudo truncate -s 0 /var/log/nginx/access.log',
        expectedNormalOutput: 'Command executes silently; disk space immediately freed.',
        abnormalOutputIndication: 'Permission denied if not run with sudo.',
        interpretation: 'Truncate resets file size to 0 bytes while preserving the file handle.'
      },
      {
        stepNumber: 9,
        title: 'Restart crashed dependent services',
        action: 'Restart database and web daemons.',
        commands: 'sudo systemctl restart postgresql nginx',
        expectedNormalOutput: 'Active: active (running).',
        abnormalOutputIndication: 'Failed with result "exit-code".',
        interpretation: 'Verify services recover now that write capability is restored.'
      },
      {
        stepNumber: 10,
        title: 'Expand LVM Logical Volume if virtual disk resized',
        action: 'Grow logical volume online without downtime.',
        commands: 'sudo lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv',
        expectedNormalOutput: 'Filesystem size grown to new boundary successfully.',
        abnormalOutputIndication: 'No free extents in volume group.',
        interpretation: 'Dynamically expands disk capacity online.'
      },
      {
        stepNumber: 11,
        title: 'Verify free space and service operations',
        action: 'Check df -h and execute test database query.',
        commands: 'df -h / && sudo -u postgres psql -c "SELECT 1;"',
        expectedNormalOutput: '/ has > 40% free space; query returns 1.',
        abnormalOutputIndication: 'Any error.',
        interpretation: 'Service has resumed normal production state.'
      },
      {
        stepNumber: 12,
        title: 'Document root cause in incident post-mortem',
        action: 'Record why logrotate did not compress or purge old files.',
        commands: 'sudo logrotate -d /etc/logrotate.d/nginx',
        expectedNormalOutput: 'Logrotate dry run validates parsing syntax.',
        abnormalOutputIndication: 'Configuration syntax error preventing daily rotation.',
        interpretation: 'Root cause identified as syntax typo in logrotate config.'
      },
      {
        stepNumber: 13,
        title: 'Implement permanent preventative measures',
        action: 'Configure automated disk cleanup and logrotate validation.',
        commands: 'echo "systemd-journald max size limit in /etc/systemd/journald.conf: SystemMaxUse=1G"',
        expectedNormalOutput: 'Journal capped; alert threshold set to 80%.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Prevents recurrence.'
      }
    ],
    rootCause: 'A typo in /etc/logrotate.d/nginx prevented logrotate from running for 45 days. Concurrently, an external scraper generated 15 million 404 errors, causing access.log to balloon to 62 GB, completely exhausting the root volume.',
    resolution: 'Safely truncated the 62 GB access.log using "truncate -s 0", restarted PostgreSQL and Nginx, fixed the syntax error in the logrotate configuration, and increased the VM disk by 50 GB via LVM online expansion.',
    verificationCommands: 'df -h /; sudo systemctl status postgresql nginx; sudo logrotate -f /etc/logrotate.d/nginx',
    preventionMeasure: 'Configured Prometheus alert threshold at 80% disk capacity, capped systemd journald logs to 1 GB (SystemMaxUse=1G), and added automated CI testing for logrotate configuration syntax.'
  },
  {
    id: 'inc-02-nginx-502',
    ticketNumber: 'INC-20512',
    category: 'Web & Application',
    severity: 'P1 - Critical Outage',
    title: 'Nginx Returns HTTP 502 Bad Gateway to All Inbound Users',
    reportedIssue: 'Public website displaying "502 Bad Gateway" on all pages and API routes; traffic halted.',
    businessImpact: 'Public web portal inaccessible. High executive visibility.',
    environment: 'Production Web Ingress Tier (srv-prod-web01)',
    affectedService: 'Nginx Reverse Proxy, Node.js Backend API (PM2)',
    triage13Steps: [
      {
        stepNumber: 1,
        title: 'Confirm user symptom and HTTP response code',
        action: 'Perform HTTP header probe against public domain.',
        commands: 'curl -I -v https://app.company.com',
        expectedNormalOutput: 'HTTP/2 200 OK.',
        abnormalOutputIndication: 'HTTP/2 502 Bad Gateway.',
        interpretation: 'Confirms Nginx is functioning but cannot connect to upstream backend.'
      },
      {
        stepNumber: 2,
        title: 'Inspect Nginx error log for upstream failures',
        action: 'Tail Nginx error log to read upstream socket error.',
        commands: 'sudo tail -n 25 /var/log/nginx/error.log',
        expectedNormalOutput: 'No critical errors.',
        abnormalOutputIndication: 'connect() failed (111: Connection refused) while connecting to upstream 127.0.0.1:3000.',
        interpretation: 'The backend service on port 3000 is stopped or not listening.'
      },
      {
        stepNumber: 3,
        title: 'Check listening sockets on server',
        action: 'Inspect TCP ports currently listening on localhost.',
        commands: 'sudo ss -tulpn | grep -E "3000|8080|nginx"',
        expectedNormalOutput: 'node or java listening on 127.0.0.1:3000.',
        abnormalOutputIndication: 'Port 3000 is completely absent from listening sockets.',
        interpretation: 'Proves the backend process is completely dead.'
      },
      {
        stepNumber: 4,
        title: 'Check PM2 process manager status',
        action: 'Inspect PM2 worker state under service account.',
        commands: 'sudo -u nodeuser pm2 status',
        expectedNormalOutput: 'enterprise-api status: online, uptime > 2d.',
        abnormalOutputIndication: 'enterprise-api status: errored or stopped (restarts: 45).',
        interpretation: 'Backend crashed repeatedly and PM2 stopped reviving it.'
      },
      {
        stepNumber: 5,
        title: 'Extract backend crash stack trace',
        action: 'Read PM2 error log for unhandled exceptions.',
        commands: 'sudo -u nodeuser pm2 logs enterprise-api --lines 30 --err',
        expectedNormalOutput: 'Normal operational logs.',
        abnormalOutputIndication: 'Error: getaddrinfo ENOTFOUND redis-cache.corp.local.',
        interpretation: 'Application crashed on startup because internal DNS failed to resolve Redis hostname.'
      },
      {
        stepNumber: 6,
        title: 'Test internal DNS resolution',
        action: 'Resolve Redis hostname from application server.',
        commands: 'dig redis-cache.corp.local +short',
        expectedNormalOutput: '10.0.2.30',
        abnormalOutputIndication: 'Empty output or connection timed out.',
        interpretation: 'The root cause is a failure in the internal DNS resolver.'
      },
      {
        stepNumber: 7,
        title: 'Check /etc/resolv.conf and systemd-resolved',
        action: 'Check DNS resolver configuration on host.',
        commands: 'systemd-resolve --status || resolvectl status',
        expectedNormalOutput: 'Active DNS servers: 10.0.1.10.',
        abnormalOutputIndication: 'DNS server unreachable or systemd-resolved stopped.',
        interpretation: 'Local DNS stub resolver had hung.'
      },
      {
        stepNumber: 8,
        title: 'Restart systemd-resolved and test lookup',
        action: 'Restart DNS resolution daemon.',
        commands: 'sudo systemctl restart systemd-resolved && dig redis-cache.corp.local +short',
        expectedNormalOutput: 'Returns 10.0.2.30.',
        abnormalOutputIndication: 'Still failing.',
        interpretation: 'DNS resolution restored.'
      },
      {
        stepNumber: 9,
        title: 'Restart PM2 backend application',
        action: 'Revive clustered backend workers.',
        commands: 'sudo -u nodeuser pm2 restart enterprise-api',
        expectedNormalOutput: 'status: online, 4 instances active.',
        abnormalOutputIndication: 'Still errored.',
        interpretation: 'Application successfully reconnected to Redis and resumed listening on 3000.'
      },
      {
        stepNumber: 10,
        title: 'Verify socket binding',
        action: 'Check port 3000 is now active.',
        commands: 'sudo ss -tulpn | grep 3000',
        expectedNormalOutput: 'LISTEN 0 511 127.0.0.1:3000',
        abnormalOutputIndication: 'Empty.',
        interpretation: 'Port active.'
      },
      {
        stepNumber: 11,
        title: 'Verify end-to-end HTTP response',
        action: 'Query public URL through Nginx.',
        commands: 'curl -I https://app.company.com/api/health',
        expectedNormalOutput: 'HTTP/2 200 OK with {"status":"UP"}.',
        abnormalOutputIndication: '502 Bad Gateway.',
        interpretation: 'End-to-end traffic fully restored.'
      },
      {
        stepNumber: 12,
        title: 'Document timeline and root cause',
        action: 'Record incident in ticketing system.',
        commands: 'echo "INC-20512 Resolved at $(date)"',
        expectedNormalOutput: 'Timestamped.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Incident closed.'
      },
      {
        stepNumber: 13,
        title: 'Implement graceful error handling in application code',
        action: 'Prevent crash when Redis is temporarily unavailable.',
        commands: 'echo "Update Redis client retry_strategy to reconnect instead of throwing fatal unhandled exception on boot."',
        expectedNormalOutput: 'Non-fatal retry configured.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Prevents future crashes during momentary network blips.'
      }
    ],
    rootCause: 'The host systemd-resolved service hung following a network gateway change, causing the internal hostname redis-cache.corp.local to fail resolution. The Node.js application lacked a retry strategy in its Redis connection pool, throwing an unhandled exception that crashed all 4 PM2 worker processes.',
    resolution: 'Restarted systemd-resolved to restore internal DNS, restarted PM2 enterprise-api cluster, verified port 3000 listening, and validated HTTP 200 responses through Nginx.',
    verificationCommands: 'curl -I https://app.company.com/api/health; sudo -u nodeuser pm2 status; sudo ss -tulpn | grep 3000',
    preventionMeasure: 'Updated backend code to implement exponential backoff reconnection logic on Redis failures, and added a secondary upstream DNS server in /etc/netplan.'
  },
  {
    id: 'inc-03-ad-replication-fail',
    ticketNumber: 'INC-20588',
    category: 'Identity & Network',
    severity: 'P2 - High Degradation',
    title: 'Active Directory Directory Replication Fails Between Domain Controllers',
    reportedIssue: 'User password changes made in Headquarters do not sync to Branch Office DC; branch users locked out.',
    businessImpact: 'Branch office employees cannot log in with newly updated credentials.',
    environment: 'Enterprise Multi-Site Active Directory (corp.local)',
    affectedService: 'AD DS, NTDS, Kerberos, DNS',
    triage13Steps: [
      {
        stepNumber: 1,
        title: 'Query replication summary across all Domain Controllers',
        action: 'Run repadmin replication summary in PowerShell.',
        commands: 'repadmin /replsummary',
        expectedNormalOutput: 'largest delta < 15m, 0 / 5 fails.',
        abnormalOutputIndication: 'DC-BRANCH-01 shows 14 fails, error 1722 (The RPC server is unavailable).',
        interpretation: 'DC-BRANCH-01 cannot communicate with primary DC via RPC.'
      },
      {
        stepNumber: 2,
        title: 'Identify exact failing naming contexts',
        action: 'Check showrepl on the failing DC.',
        commands: 'repadmin /showrepl DC-BRANCH-01',
        expectedNormalOutput: 'Last error: 0 (Success).',
        abnormalOutputIndication: 'Last error: 1722 (0x6ba) "The RPC server is unavailable".',
        interpretation: 'Network connectivity or RPC port blocking between sites.'
      },
      {
        stepNumber: 3,
        title: 'Test network reachability and ping',
        action: 'Ping primary DC from branch DC.',
        commands: 'Test-NetConnection -ComputerName DC-HQ-01 -CommonTCPPort RDP',
        expectedNormalOutput: 'PingSucceeded : True.',
        abnormalOutputIndication: 'Ping succeeds but TCP ports fail.',
        interpretation: 'ICMP is allowed by firewall, but required Active Directory TCP ports are blocked.'
      },
      {
        stepNumber: 4,
        title: 'Test RPC EndPoint Mapper port 135',
        action: 'Verify port 135 TCP connectivity.',
        commands: 'Test-NetConnection -ComputerName DC-HQ-01 -Port 135',
        expectedNormalOutput: 'TcpTestSucceeded : True.',
        abnormalOutputIndication: 'TcpTestSucceeded : False.',
        interpretation: 'Firewall between HQ and Branch is blocking port 135 or dynamic RPC ports.'
      },
      {
        stepNumber: 5,
        title: 'Inspect inter-site firewall logs',
        action: 'Check firewall drop logs for traffic between DC IPs.',
        commands: 'echo "Inspect FortiGate / pfSense log between 10.10.1.10 and 10.20.1.10"',
        expectedNormalOutput: 'Traffic permitted.',
        abnormalOutputIndication: 'Deny rule dropping TCP 135 and dynamic RPC ports 49152-65535.',
        interpretation: 'A recent firewall rule change inadvertently stripped Active Directory replication ports.'
      },
      {
        stepNumber: 6,
        title: 'Verify DNS SRV records for Domain Controllers',
        action: 'Query DNS SRV record for LDAP and Kerberos.',
        commands: 'Resolve-DnsName -Name _ldap._tcp.dc._msdcs.corp.local -Type SRV',
        expectedNormalOutput: 'Lists both DC-HQ-01 and DC-BRANCH-01 with priority and port 389.',
        abnormalOutputIndication: 'DNS name does not exist.',
        interpretation: 'DNS records are healthy.'
      },
      {
        stepNumber: 7,
        title: 'Restore firewall rules permitting AD RPC traffic',
        action: 'Allow ports 135, 389, 445, 88, and dynamic RPC range 49152-65535 between DCs.',
        commands: 'echo "Applied firewall policy: Allow AD-Replication-Group between DC-HQ-01 and DC-BRANCH-01"',
        expectedNormalOutput: 'Policy applied and active.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Network path cleared.'
      },
      {
        stepNumber: 8,
        title: 'Retest RPC Port 135 connectivity',
        action: 'Execute Test-NetConnection.',
        commands: 'Test-NetConnection -ComputerName DC-HQ-01 -Port 135',
        expectedNormalOutput: 'TcpTestSucceeded : True.',
        abnormalOutputIndication: 'False.',
        interpretation: 'Firewall now allowing RPC traffic.'
      },
      {
        stepNumber: 9,
        title: 'Force manual replication synchronization',
        action: 'Trigger immediate Active Directory replication.',
        commands: 'repadmin /syncall /Apdq DC-BRANCH-01',
        expectedNormalOutput: 'SyncAll finished with no errors.',
        abnormalOutputIndication: 'Errors reported.',
        interpretation: 'Replication delta applied.'
      },
      {
        stepNumber: 10,
        title: 'Verify replication summary status',
        action: 'Check repadmin /replsummary.',
        commands: 'repadmin /replsummary',
        expectedNormalOutput: '0 fails across all DCs; largest delta < 1m.',
        abnormalOutputIndication: 'Fails > 0.',
        interpretation: 'All naming contexts fully synchronized.'
      },
      {
        stepNumber: 11,
        title: 'Run complete Domain Controller diagnostics',
        action: 'Execute dcdiag tests.',
        commands: 'dcdiag /test:Replication /v',
        expectedNormalOutput: 'Passed test Replication.',
        abnormalOutputIndication: 'Failed test.',
        interpretation: 'AD health validated.'
      },
      {
        stepNumber: 12,
        title: 'Test user authentication on branch DC',
        action: 'Verify updated password works on branch workstation.',
        commands: 'echo "User authentication successful with new password."',
        expectedNormalOutput: 'Logon permitted.',
        abnormalOutputIndication: 'Logon rejected.',
        interpretation: 'Business functionality restored.'
      },
      {
        stepNumber: 13,
        title: 'Prevent future replication lockouts',
        action: 'Restrict RPC dynamic ports to fixed range.',
        commands: 'echo "Configure static RPC port for AD DS in registry: HKLM\\SYSTEM\\CurrentControlSet\\Services\\NTDS\\Parameters -> TCP/IP Port = 50000"',
        expectedNormalOutput: 'Static port active.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Simplifies firewall rules by eliminating need for huge dynamic port range.'
      }
    ],
    rootCause: 'An automated firewall rule update on the inter-site IPsec tunnel stripped the dynamic RPC port range (49152-65535), blocking RPC EndPoint Mapper lookups between DC-HQ-01 and DC-BRANCH-01 and resulting in RPC Error 1722.',
    resolution: 'Updated firewall rule policy to explicitly permit Active Directory ports (TCP 88, 135, 389, 445, 636, and RPC dynamic range), forced manual replication with "repadmin /syncall /Apdq", and verified with "dcdiag /test:Replication".',
    verificationCommands: 'repadmin /replsummary; repadmin /showrepl; dcdiag /test:Replication',
    preventionMeasure: 'Configured a static TCP port (50000) for NTDS replication in the Windows Registry to restrict replication to a single deterministic port, and locked the inter-site firewall policy against unauthorized override.'
  },
  {
    id: 'inc-04-k8s-crashloop',
    ticketNumber: 'INC-20640',
    category: 'Cloud & Containers',
    severity: 'P1 - Critical Outage',
    title: 'Kubernetes Backend Pod Enters CrashLoopBackOff State Following Deployment',
    reportedIssue: 'New application release deployed via CI/CD; all backend pods failing to start with status CrashLoopBackOff.',
    businessImpact: 'Mobile app and web portal failing with "Service Unavailable".',
    environment: 'Production Kubernetes Cluster (EKS / Bare-Metal K8s)',
    affectedService: 'Order Processing API Microservice',
    triage13Steps: [
      {
        stepNumber: 1,
        title: 'List pod statuses in application namespace',
        action: 'Query kubectl get pods.',
        commands: 'kubectl get pods -n production -l app=order-api',
        expectedNormalOutput: 'NAME: order-api-xxx, READY: 1/1, STATUS: Running, RESTARTS: 0',
        abnormalOutputIndication: 'STATUS: CrashLoopBackOff, RESTARTS: 6',
        interpretation: 'The container starts, executes briefly, exits with an error code, and kubelet restarts it with backoff delay.'
      },
      {
        stepNumber: 2,
        title: 'Inspect pod events and lifecycle metadata',
        action: 'Run kubectl describe pod.',
        commands: 'kubectl describe pod -n production -l app=order-api | grep -A 10 Events:',
        expectedNormalOutput: 'Started container, Liveness probe passed.',
        abnormalOutputIndication: 'Back-off restarting failed container; Last State: Terminated with Exit Code: 1.',
        interpretation: 'Container application process exited with error code 1.'
      },
      {
        stepNumber: 3,
        title: 'Extract previous container crash logs',
        action: 'Read logs from the terminated container instance before restart.',
        commands: 'kubectl logs -n production -l app=order-api --previous --tail=50',
        expectedNormalOutput: 'Normal application startup banner.',
        abnormalOutputIndication: 'Fatal: DB_PASSWORD environment variable is missing or empty.',
        interpretation: 'The new application code introduced a strict check for DB_PASSWORD, but the Secret was not mounted.'
      },
      {
        stepNumber: 4,
        title: 'Inspect Kubernetes Deployment manifest secrets configuration',
        action: 'Check envFrom and secretKeyRef definitions in deployment.',
        commands: 'kubectl get deployment order-api -n production -o yaml | grep -A 5 secretKeyRef',
        expectedNormalOutput: 'Points to valid secret and key name.',
        abnormalOutputIndication: 'secretName: db-credentials, key: database_password (wrong key name).',
        interpretation: 'CI/CD deployment template had a typo in the secret key name (database_password vs db-password).'
      },
      {
        stepNumber: 5,
        title: 'Check actual keys in production Secret',
        action: 'Inspect keys inside db-credentials secret.',
        commands: 'kubectl get secret db-credentials -n production -o jsonpath="{.data}" | jq keys',
        expectedNormalOutput: '["db-password", "db-username"]',
        abnormalOutputIndication: 'Does not contain "database_password".',
        interpretation: 'Confirmed key name mismatch.'
      },
      {
        stepNumber: 6,
        title: 'Roll back deployment to previous stable revision',
        action: 'Execute instant rollback to restore production uptime immediately.',
        commands: 'kubectl rollout undo deployment/order-api -n production',
        expectedNormalOutput: 'deployment.apps/order-api rolled back.',
        abnormalOutputIndication: 'Rollback failed.',
        interpretation: 'Immediate production restoration taking under 10 seconds.'
      },
      {
        stepNumber: 7,
        title: 'Verify rollback pod health',
        action: 'Check pod running status.',
        commands: 'kubectl get pods -n production -l app=order-api',
        expectedNormalOutput: 'STATUS: Running, READY: 1/1.',
        abnormalOutputIndication: 'Still crashlooping.',
        interpretation: 'Previous revision pods successfully spawned and healthy.'
      },
      {
        stepNumber: 8,
        title: 'Fix typo in Deployment manifest',
        action: 'Patch deployment with correct secret key name.',
        commands: 'kubectl set env deployment/order-api -n production --from=secret/db-credentials --keys=db-password',
        expectedNormalOutput: 'deployment.apps/order-api updated.',
        abnormalOutputIndication: 'Syntax error.',
        interpretation: 'Fixed configuration.'
      },
      {
        stepNumber: 9,
        title: 'Apply updated deployment and monitor rollout',
        action: 'Track rolling update status.',
        commands: 'kubectl rollout status deployment/order-api -n production',
        expectedNormalOutput: 'deployment "order-api" successfully rolled out.',
        abnormalOutputIndication: 'Waiting for rollout to finish: 1 old replicas are pending termination...',
        interpretation: 'New pods passed readiness probes and old pods terminated cleanly.'
      },
      {
        stepNumber: 10,
        title: 'Verify liveness and readiness probes',
        action: 'Inspect probe status in describe output.',
        commands: 'kubectl describe pod -n production -l app=order-api | grep -E "Liveness|Readiness"',
        expectedNormalOutput: 'Readiness: http-get http://:8080/healthz delay=5s result=success.',
        abnormalOutputIndication: 'Failing.',
        interpretation: 'Probes passing.'
      },
      {
        stepNumber: 11,
        title: 'Test application endpoint through Ingress',
        action: 'Send live request through Nginx Ingress.',
        commands: 'curl -I https://api.company.com/orders/health',
        expectedNormalOutput: 'HTTP/2 200 OK.',
        abnormalOutputIndication: '503 Service Unavailable.',
        interpretation: 'External ingress routing to healthy pods.'
      },
      {
        stepNumber: 12,
        title: 'Document incident root cause and resolution',
        action: 'Log post-mortem ticket.',
        commands: 'echo "INC-20640 Resolved via rollback and secret key patch."',
        expectedNormalOutput: 'Logged.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Ticket closed.'
      },
      {
        stepNumber: 13,
        title: 'Implement CI/CD pre-deployment secret validation',
        action: 'Add helm lint / kubeval / conftest step in GitHub Actions.',
        commands: 'echo "Added pre-deployment validation asserting all referenced Secrets exist prior to kubectl apply."',
        expectedNormalOutput: 'CI pipeline gate enforced.',
        abnormalOutputIndication: 'None.',
        interpretation: 'Prevents invalid secret references from ever reaching production cluster.'
      }
    ],
    rootCause: 'A typo in the Helm values file referenced "database_password" instead of "db-password", causing container initialization to fail with missing environment variable and terminating with exit code 1.',
    resolution: 'Immediately executed "kubectl rollout undo deployment/order-api" to restore service from previous replica revision in 8 seconds, corrected the secret key reference in the manifest, and re-applied the deployment cleanly.',
    verificationCommands: 'kubectl get pods -n production -l app=order-api; kubectl rollout status deployment/order-api -n production; curl -I https://api.company.com/orders/health',
    preventionMeasure: 'Integrated kubeconform and automated dry-run validation in the CI/CD pipeline to verify secret key references against cluster schema prior to deployment.'
  }
];
