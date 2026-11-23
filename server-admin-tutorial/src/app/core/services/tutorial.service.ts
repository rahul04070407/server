import { Injectable, signal } from '@angular/core';

export type MainSection =
  | 'foundations'
  | 'components'
  | 'nginx-guide'
  | 'other-guides'
  | 'setup-guide'
  | 'performance'
  | 'scalability'
  | 'reference'
  | 'home-lab';

export interface NavGroup {
  sectionId: MainSection;
  title: string;
  icon: string;
  badgeCount?: number;
  topics: { id: string; label: string; badge?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  // Mobile drawer state
  sidebarOpen = signal<boolean>(false);

  // Active section and topic (Starts at Step 1: Client-Server & Port Mapping)
  activeSection = signal<MainSection>('foundations');
  activeTopicId = signal<string>('client-server-ports');

  // Search filter
  searchQuery = signal<string>('');

  // Copy-to-clipboard state
  copiedSnippet = signal<string | null>(null);

  // Progressive 0 to 100 Side Navigation Curriculum
  readonly navGroups: NavGroup[] = [
    {
      sectionId: 'foundations',
      title: '01. Server 101 (From Scratch)',
      icon: '💡',
      badgeCount: 5,
      topics: [
        { id: 'client-server-ports', label: 'Step 1: Client-Server & Ports' },
        { id: 'linux-terminal-basics', label: 'Step 2: Linux Terminal & Commands' },
        { id: 'ssh-key-pairs', label: 'Step 3: SSH & Key Pairs' },
        { id: 'how-to-create-a-server', label: 'How to Create a Server (3 Ways)' },
        { id: 'why-linux-and-division', label: 'Why Linux & Server Division' }
      ]
    },
    {
      sectionId: 'components',
      title: '02. Server Components',
      icon: '⚙️',
      badgeCount: 3,
      topics: [
        { id: 'server-hardware-anatomy', label: 'Hardware: CPU, RAM, NVMe, NIC' },
        { id: 'server-os-software', label: 'Operating Systems: Linux vs Windows' },
        { id: 'virtualization-containers', label: 'Bare Metal vs VMs vs Docker' }
      ]
    },
    {
      sectionId: 'nginx-guide',
      title: '03. Web Servers & Nginx',
      icon: '🌐',
      badgeCount: 4,
      topics: [
        { id: 'nginx-reverse-proxy', label: 'Step 4: Nginx Reverse Proxy' },
        { id: 'nginx-config-types', label: '5 Production Nginx Configs' },
        { id: 'pm2-process-management', label: 'Step 5: Process Management (PM2)' },
        { id: 'dns-ssl-certbot', label: 'Step 6: DNS & SSL (Certbot)' }
      ]
    },
    {
      sectionId: 'other-guides',
      title: '04. Other Server Type Guides',
      icon: '🖥️',
      badgeCount: 3,
      topics: [
        { id: 'windows-server-iis', label: 'Windows Server & IIS Hosting' },
        { id: 'database-servers', label: 'Database Servers (Postgres, MySQL)' },
        { id: 'firewalls-and-security', label: 'Firewalls & Network Security' }
      ]
    },
    {
      sectionId: 'setup-guide',
      title: '05. Setup from Scratch',
      icon: '🛠️',
      badgeCount: 5,
      topics: [
        { id: 'setup-step-1', label: 'Step 1: Install Server OS' },
        { id: 'setup-step-2', label: 'Step 2: Static IP & Hostname' },
        { id: 'setup-step-3', label: 'Step 3: Port & Firewall Lockdown' },
        { id: 'setup-step-4', label: 'Step 4: Web Server & Live HTML' },
        { id: 'setup-step-5', label: 'Step 5: Database Setup & Password' }
      ]
    },
    {
      sectionId: 'performance',
      title: '06. Performance & Bottlenecks',
      icon: '⚡',
      badgeCount: 2,
      topics: [
        { id: 'performance-core-concepts', label: 'How to Measure Performance' },
        { id: 'diagnostics-and-tools', label: 'Diagnostic Tools (htop, free, uptime)' }
      ]
    },
    {
      sectionId: 'scalability',
      title: '07. Scalability & High Traffic',
      icon: '📈',
      badgeCount: 3,
      topics: [
        { id: 'scale-up-vs-scale-out', label: 'Scale Up vs Scale Out' },
        { id: 'load-balancers-and-caching', label: 'Load Balancers & Redis Cache' },
        { id: 'database-replication-ha', label: 'Database Scaling & Replicas' }
      ]
    },
    {
      sectionId: 'reference',
      title: '08. Cheatsheet & Glossary',
      icon: '📑',
      badgeCount: 3,
      topics: [
        { id: 'cheatsheet-view', label: '📋 Full Developer Cheatsheet' },
        { id: 'troubleshooting-view', label: '🔧 Troubleshooting Runbooks' },
        { id: 'glossary-view', label: '📚 Complete Keyword Glossary' }
      ]
    },
    {
      sectionId: 'home-lab',
      title: '09. Free Home Lab Setup',
      icon: '🏠',
      badgeCount: 3,
      topics: [
        { id: 'lab-tier-1', label: '16GB Starter Lab' },
        { id: 'lab-tier-2', label: '32GB Professional Lab' },
        { id: 'lab-tier-3', label: '64GB+ Bare-Metal Lab' }
      ]
    }
  ];

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  selectTopic(section: MainSection, topicId: string) {
    this.activeSection.set(section);
    this.activeTopicId.set(topicId);
    this.closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  copyToClipboard(text: string, identifier: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedSnippet.set(identifier);
      setTimeout(() => {
        if (this.copiedSnippet() === identifier) {
          this.copiedSnippet.set(null);
        }
      }, 2000);
    });
  }
}
