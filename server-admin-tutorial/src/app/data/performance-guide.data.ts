export interface PerformanceMetric {
  name: string;
  unit: string;
  normalRange: string;
  dangerRange: string;
  whatItMeasures: string;
  diagnosticCommand: string;
  fixAction: string;
}

export interface PerformanceTopic {
  id: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  headline: string;
  analogy: {
    title: string;
    description: string;
  };
  explanation: string;
  metrics?: PerformanceMetric[];
  tools?: {
    tool: string;
    command: string;
    description: string;
    sampleOutput: string;
    interpretation: string;
  }[];
  quickWins?: string[];
}

export const PERFORMANCE_DATA: PerformanceTopic[] = [
  {
    id: 'performance-core-concepts',
    badge: 'Performance 1',
    badgeColor: 'teal',
    title: 'What is Server Performance & How Do You Measure It?',
    headline: 'Performance comes down to three numbers: Throughput (how much work gets done), Latency (how fast it responds), and Concurrency (how many visitors at once).',
    analogy: {
      title: '🏥 Analogy: The Hospital ICU Vital Signs Monitor',
      description: 'Monitoring a server is like checking patient vital signs in an intensive care unit. CPU Load is heart rate, RAM is blood oxygen supply, Disk I/O is blood pressure, and Network is respiratory capacity. If any single one hits 100% or flatlines, the whole patient (server) collapses into unresponsiveness.'
    },
    explanation: 'When a server slows down, it is almost always blocked on one of 4 physical resources: CPU, Memory (RAM), Disk I/O, or Network. If any single one hits 100%, the entire server grinds to a halt.',
    metrics: [
      {
        name: 'CPU Load Average',
        unit: 'Load / Core Ratio',
        normalRange: '< 0.70 per CPU Core',
        dangerRange: '> 1.50 per CPU Core',
        whatItMeasures: 'The average number of processes actively waiting in line for CPU execution time.',
        diagnosticCommand: 'uptime',
        fixAction: 'Identify runaway infinite loops with htop; optimize database queries; add more CPU cores.'
      },
      {
        name: 'Available RAM (Memory)',
        unit: 'Megabytes / Gigabytes',
        normalRange: '> 20% Free / Cached',
        dangerRange: '< 5% Free (Swapping heavily)',
        whatItMeasures: 'Physical RAM available for applications before the OS is forced to use slow disk Swap.',
        diagnosticCommand: 'free -h',
        fixAction: 'Restart leaking processes; tune database buffer pool sizes; add physical RAM.'
      },
      {
        name: 'Disk I/O Wait (%iowait)',
        unit: 'Percentage of CPU time',
        normalRange: '< 5% %iowait',
        dangerRange: '> 20% %iowait',
        whatItMeasures: 'Time CPU sits idle doing nothing because it is waiting on a slow hard drive to finish reading/writing.',
        diagnosticCommand: 'iostat -xz 1',
        fixAction: 'Upgrade spinning HDD to NVMe SSD; add in-memory caching (Redis); add database indexes.'
      },
      {
        name: 'Network Connection State',
        unit: 'Active TCP Sockets',
        normalRange: '< 5,000 active sockets',
        dangerRange: '> 50,000 (Socket Exhaustion)',
        whatItMeasures: 'Number of active TCP connections between clients and the server.',
        diagnosticCommand: 'ss -s',
        fixAction: 'Enable TCP SYN cookies; decrease keepalive timeout in Nginx; place behind a load balancer.'
      }
    ]
  },
  {
    id: 'diagnostics-and-tools',
    badge: 'Diagnostics',
    badgeColor: 'coral',
    title: 'Hands-On Diagnostic Tools Every Server Admin Runs',
    headline: 'When an alert fires at 2 AM, run these diagnostic commands in order to identify the bottleneck in under 60 seconds.',
    analogy: {
      title: '🩺 Analogy: The Doctor\'s Stethoscope & Lab Tests',
      description: 'You do not perform random surgery when a patient feels ill. You take their temperature first (uptime), listen to their lungs (free -h), run an MRI scan (htop), and check their blood vessels (ss -tulpn). These tools reveal the exact root cause with precision.'
    },
    explanation: 'Diagnosing a slow server requires a systematic elimination methodology: CPU -> Memory -> Disk -> Network.',
    tools: [
      {
        tool: 'htop / top',
        command: 'htop',
        description: 'Interactive real-time process viewer showing CPU core utilization bars, memory consumption, and top running processes.',
        sampleOutput: 'PID USER PRI NI VIRT RES SHR S CPU% MEM% TIME+ Command\n1429 nginx 20 0 148M 24M 12M S 18.2 0.3 0:14.22 nginx: worker',
        interpretation: 'Look for any single process pegged at 100% CPU. Press "P" to sort by CPU usage, or "M" to sort by memory consumption.'
      },
      {
        tool: 'free -h',
        command: 'free -h',
        description: 'Instant snapshot of total, used, free, shared, and buffered/cached physical RAM and disk Swap space.',
        sampleOutput: '               total        used        free      shared  buff/cache   available\nMem:           7.7Gi       2.1Gi       4.2Gi        64Mi       1.4Gi       5.3Gi\nSwap:          2.0Gi          0B       2.0Gi',
        interpretation: 'Focus on "available" RAM. If available is under 200MB and Swap "used" is climbing rapidly, your server is running out of memory.'
      },
      {
        tool: 'uptime',
        command: 'uptime',
        description: 'Displays how long the server has been running, number of logged-in users, and 1, 5, and 15-minute CPU load averages.',
        sampleOutput: ' 14:22:05 up 142 days, 3:18,  2 users,  load average: 0.42, 0.58, 0.65',
        interpretation: 'Rule of thumb: If the load average is higher than your number of CPU cores (e.g. load 8.0 on a 4-core machine), processes are queueing and waiting for CPU time.'
      },
      {
        tool: 'iostat',
        command: 'iostat -xz 1 3',
        description: 'Monitors disk input/output transfer rates, queue lengths, and %iowait per disk drive partition.',
        sampleOutput: 'Device   r/s   w/s   rMB/s   wMB/s   await  %util\nnvme0n1  120   450    8.4    32.1    0.42   18.5%',
        interpretation: 'If "%util" is near 100% and "await" is over 15ms, the hard drive is saturated with read/write requests, freezing applications.'
      }
    ],
    quickWins: [
      'High CPU: Identify offending PID with htop. Run "sudo renice -n 10 -p PID" to deprioritize it, or "sudo kill -9 PID" if it is a runaway thread.',
      'High Memory / Out-of-Memory: Check which service is leaking RAM. Restart it gracefully ("sudo systemctl reload nginx" or "pm2 reload app").',
      'High Disk I/O: Run "sudo iotop -o" to see which process is writing gigabytes to disk. Check for unrotated runaway log files in /var/log/.'
    ]
  }
];
