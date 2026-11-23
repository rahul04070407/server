export interface ServerComponentTopic {
  id: string;
  badge: string;
  badgeColor: 'teal' | 'gold' | 'coral' | 'sky';
  title: string;
  headline: string;
  analogy: {
    title: string;
    description: string;
  };
  hardwareCards: {
    component: string;
    icon: string;
    functionInServer: string;
    whyItMatters: string;
    specStandard: string;
  }[];
  comparisons?: {
    itemA: string;
    itemB: string;
    aspects: { feature: string; a: string; b: string }[];
  };
  keyTakeaways: string[];
}

export const COMPONENTS_DATA: ServerComponentTopic[] = [
  {
    id: 'server-hardware-anatomy',
    badge: 'Hardware',
    badgeColor: 'teal',
    title: 'Server Hardware Anatomy: Inside a Real Server',
    headline: 'Unlike desktop PCs built for gaming or typing, server hardware is engineered for multi-tasking and non-stop reliability.',
    analogy: {
      title: '🧠 Analogy: The Human Body & Physical Workspace',
      description: 'The CPU is the brain making calculations. RAM is the physical desk right in front of you: the bigger the desk, the more active papers (cached web pages, user sessions) you can hold without reaching into the filing cabinet. NVMe SSD is the storage archive warehouse in the basement. Network Cards (NICs) are the mouth and ears constantly receiving and sending packets.'
    },
    keyTakeaways: [
      'CPU Cores Matter More Than Clock Speed: A server handles thousands of small requests concurrently, so having 32 or 64 cores beats having 8 high-clock cores.',
      'ECC Memory: Error-Correcting Code RAM automatically detects and fixes electronic bit flips, preventing catastrophic random server crashes.',
      'NVMe SSDs & RAID: Servers use RAID (Redundant Array of Independent Disks) so if an SSD physically dies, the server keeps running without data loss.',
      'Redundant Power Supplies (PSUs): Enterprise servers plug into two separate electrical circuits so a blown fuse never shuts down the server.'
    ],
    hardwareCards: [
      {
        component: 'Multi-Core CPU (Intel Xeon / AMD EPYC)',
        icon: '⚡',
        functionInServer: 'Executes computing instructions, handles incoming web requests, and runs application logic.',
        whyItMatters: 'More cores allow hundreds of web requests and background database queries to run in parallel without queueing.',
        specStandard: 'Production servers run 16 to 64 cores (32 to 128 virtual threads).'
      },
      {
        component: 'ECC RAM (Error-Correcting Code Memory)',
        icon: '🧠',
        functionInServer: 'Holds active programs, cached web pages, and in-memory database queries.',
        whyItMatters: 'Cosmic rays and electrical noise can flip a 0 to a 1 in RAM. ECC RAM automatically corrects this on the fly.',
        specStandard: 'Production web/DB servers typically run 32 GB, 64 GB, 128 GB, or 256 GB RAM.'
      },
      {
        component: 'Enterprise NVMe SSD Storage & RAID',
        icon: '💾',
        functionInServer: 'Stores operating system files, databases, application code, and logs permanently.',
        whyItMatters: 'NVMe drives read/write at 5,000+ MB/s and handle 500,000+ IOPS (operations/sec), preventing database lag.',
        specStandard: 'Configured in RAID 1 (Mirror) for OS, and RAID 10 (Striped + Mirrored) for database data.'
      },
      {
        component: 'Dual 10Gbps Network Interface Cards (NICs)',
        icon: '🔌',
        functionInServer: 'Connects the server motherboard physically to the top-of-rack network switch.',
        whyItMatters: 'Dual NICs are bonded together ("NIC Teaming") for double bandwidth and instant failover if one cable is cut.',
        specStandard: '2x 10Gbps SFP+ Fiber or RJ45 Ethernet ports.'
      }
    ]
  },
  {
    id: 'server-os-software',
    badge: 'Software',
    badgeColor: 'gold',
    title: 'Server Operating Systems: Linux vs Windows Server',
    headline: 'A server OS manages the hardware and prioritizes background network tasks rather than graphical animations.',
    analogy: {
      title: '🏭 Analogy: Industrial Automated Factory vs Corporate Tower',
      description: 'Linux is like an automated, high-precision industrial robot factory: stripped of plush carpets and graphical windows, 100% dedicated to raw processing speed, throughput, and automated 24/7 manufacturing without needing human operators to sit at a desk. Windows Server is like a corporate office headquarters: designed around employee badges, check-in desks (Active Directory), and centralized policy handbooks (Group Policy).'
    },
    keyTakeaways: [
      'Linux Server (Ubuntu, Rocky Linux, Debian) powers 90%+ of cloud web infrastructure and container platforms.',
      'Windows Server dominates enterprise corporate offices: Active Directory user logins, Group Policy, and SMB file shares.',
      'Daemons / Services: Programs that run continuously in the background without needing a user to log into the screen.'
    ],
    hardwareCards: [],
    comparisons: {
      itemA: 'Linux Server (Ubuntu / RHEL)',
      itemB: 'Windows Server 2022 / 2025',
      aspects: [
        { feature: 'Primary Use Case', a: 'Web servers, APIs, Docker, microservices, databases', b: 'Active Directory, Office domain login, Windows services, IIS' },
        { feature: 'Default Interface', a: '100% Command Line (Bash shell over SSH)', b: 'Server Manager GUI or PowerShell Core' },
        { feature: 'Resource Overhead', a: 'Extremely lightweight (~300MB - 500MB idle RAM)', b: 'Moderate (~1.5GB - 2.5GB idle RAM)' },
        { feature: 'License Cost', a: 'Free and Open Source (Ubuntu, Debian, Rocky)', b: 'Commercial per-core licensing fees' },
        { feature: 'Background Services', a: 'systemd units (systemctl start/enable)', b: 'Windows Services (services.msc / sc.exe)' }
      ]
    }
  },
  {
    id: 'virtualization-containers',
    badge: 'Virtualization',
    badgeColor: 'sky',
    title: 'Bare Metal vs Virtual Machines (VMs) vs Containers',
    headline: 'Understanding how multiple isolated servers can live on a single physical box.',
    analogy: {
      title: '🏘️ Analogy: House vs Apartment Complex vs Shipping Containers',
      description: 'Bare Metal is like building a custom standalone single-family house on physical soil: maximum performance, but expensive and empty rooms go to waste. Virtual Machines (VMs) are like an apartment building: one physical structure split into separate apartments with private walls, separate plumbing, and independent front doors (each with its own OS kernel). Containers (Docker) are like standardized shipping containers stacked on a cargo ship: they share the ship\'s engine and hull (Linux kernel) while keeping cargo isolated and portable.'
    },
    keyTakeaways: [
      'Bare Metal: The operating system is installed directly on the physical motherboard and disks (maximum performance, least flexibility).',
      'Virtual Machine (VM): A hypervisor splits one physical computer into multiple completely independent virtual computers, each with its own virtual OS kernel.',
      'Docker Container: Multiple apps share the single host OS kernel while remaining completely isolated from each other (starts in milliseconds!).'
    ],
    hardwareCards: [],
    comparisons: {
      itemA: 'Virtual Machines (VMs / Hyper-V / KVM)',
      itemB: 'Docker Containers',
      aspects: [
        { feature: 'Architecture', a: 'Full virtual hardware stack + dedicated guest OS kernel', b: 'Shares host Linux kernel, isolates user space namespaces' },
        { feature: 'Startup Speed', a: '30 seconds to 2 minutes (boots full OS)', b: 'Under 1 second (starts app process immediately)' },
        { feature: 'Memory Overhead', a: 'Requires 1GB–4GB RAM per VM for guest OS', b: 'Requires only 10MB–100MB RAM for the app process' },
        { feature: 'Isolation Level', a: 'Hardware-level hypervisor boundary (very high)', b: 'Kernel namespace and cgroups boundary (high)' }
      ]
    }
  }
];
