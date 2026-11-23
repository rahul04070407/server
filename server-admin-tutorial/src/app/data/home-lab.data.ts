export interface HomeLabTier {
  name: string;
  ram: string;
  cpu: string;
  storage: string;
  hypervisor: string;
  suitability: string;
  analogy: string;
  vmAllocation: {
    vm: string;
    os: string;
    ram: string;
    vcpu: string;
    role: string;
  }[];
}

export const HOME_LAB_TIERS: HomeLabTier[] = [
  {
    name: 'Starter Lab (16 GB Host RAM)',
    ram: '16 GB RAM (Host)',
    cpu: '4 to 6 Cores (Intel i5/i7 or AMD Ryzen 5)',
    storage: '256 GB Free SSD Space',
    hypervisor: 'VirtualBox or Hyper-V (Windows Pro/Enterprise)',
    suitability: 'Ideal for foundational server administration and targeted 1-2 VM labs running sequentially.',
    analogy: '🛠️ Analogy: The Single-Car Garage Workshop: A compact private workbench with essential tools. You can assemble and test 1 or 2 server machines at a time cleanly without taking up your whole home.',
    vmAllocation: [
      { vm: 'VM-01 (DC-01)', os: 'Windows Server 2022 Core', ram: '2.5 GB', vcpu: '2 vCPU', role: 'Active Directory, DNS, DHCP' },
      { vm: 'VM-02 (WEB-01)', os: 'Ubuntu Server 24.04 LTS', ram: '2.0 GB', vcpu: '1 vCPU', role: 'Nginx, Node.js, Spring Boot' },
      { vm: 'VM-03 (CLT-01)', os: 'Windows 11 Client or TinyCore', ram: '3.0 GB', vcpu: '1 vCPU', role: 'Domain Joined Client workstation' },
      { vm: 'Host Overhead', os: 'Windows 10/11 Host OS', ram: '8.0 GB', vcpu: 'Remaining', role: 'Host OS, IDE, Browser, Management tools' }
    ]
  },
  {
    name: 'Recommended Professional Lab (32 GB Host RAM)',
    ram: '32 GB RAM (Host)',
    cpu: '8 Cores / 16 Threads (Intel i7/i9 or AMD Ryzen 7/9)',
    storage: '500 GB to 1 TB NVMe SSD',
    hypervisor: 'Hyper-V or VMware Workstation Pro',
    suitability: 'Runs complete multi-server enterprise topologies, clusters, and monitoring stacks simultaneously.',
    analogy: '🏭 Analogy: The Commercial Prototyping Workshop: Separate dedicated assembly benches, testing stations, and monitoring consoles running simultaneously to simulate a full company datacenter.',
    vmAllocation: [
      { vm: 'VM-01 (DC-PRIMARY)', os: 'Windows Server 2022 Desktop', ram: '4.0 GB', vcpu: '2 vCPU', role: 'Primary DC, DNS, AD CS CA' },
      { vm: 'VM-02 (DC-REPLICA)', os: 'Windows Server 2022 Core', ram: '2.5 GB', vcpu: '2 vCPU', role: 'Secondary DC, DHCP, File Server' },
      { vm: 'VM-03 (APP-LINUX-01)', os: 'Ubuntu Server 24.04', ram: '3.0 GB', vcpu: '2 vCPU', role: 'Nginx, Angular, Node.js API' },
      { vm: 'VM-04 (DB-POSTGRES)', os: 'Rocky Linux 9', ram: '3.0 GB', vcpu: '2 vCPU', role: 'PostgreSQL 16, Redis Cache' },
      { vm: 'VM-05 (MONITOR-01)', os: 'Ubuntu Server 24.04', ram: '3.5 GB', vcpu: '2 vCPU', role: 'Prometheus, Grafana, Loki Stack' },
      { vm: 'VM-06 (ROUTER/FW)', os: 'pfSense / OPNsense VM', ram: '1.5 GB', vcpu: '1 vCPU', role: 'VLAN Router, Firewall, DHCP Relay' },
      { vm: 'VM-07 (CLIENT-WIN)', os: 'Windows 11 Enterprise Eval', ram: '4.0 GB', vcpu: '2 vCPU', role: 'Domain Joined test workstation' },
      { vm: 'Host Overhead', os: 'Windows 11 Host OS', ram: '10.5 GB', vcpu: 'Remaining', role: 'Host OS & hypervisor management' }
    ]
  },
  {
    name: 'Advanced Bare-Metal / Dedicated Lab (64 GB+ RAM)',
    ram: '64 GB - 128 GB RAM',
    cpu: '12 to 24 Cores (Dedicated server or high-end desktop)',
    storage: '2 TB NVMe + 4 TB HDD storage pool',
    hypervisor: 'Proxmox VE 8 or VMware ESXi 8 bare-metal',
    suitability: 'Simulates true multi-site enterprise clouds, Kubernetes clusters, and Ceph/S2D SAN storage.',
    analogy: '🏢 Analogy: The Private Mini-Datacenter: A dedicated enterprise server rack running bare-metal Proxmox with high-speed ZFS storage, simulating an entire AWS Availability Zone in your home.',
    vmAllocation: [
      { vm: '15+ Multi-Node Fleet', os: 'Windows Server & Enterprise Linux', ram: '52 GB', vcpu: '24 vCPU', role: 'Full enterprise multi-site topology with HA clustering' },
      { vm: 'Host Overhead', os: 'Proxmox VE Hypervisor', ram: '12 GB', vcpu: 'Remaining', role: 'ZFS ARC cache and hypervisor core' }
    ]
  }
];
