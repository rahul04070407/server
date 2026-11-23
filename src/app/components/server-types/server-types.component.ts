import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SERVER_TYPES_DATA, ServerTypeItem } from '../../data/server-types.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-server-types',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-types.component.html',
  styleUrl: './server-types.component.scss'
})
export class ServerTypesComponent {
  tutorialService = inject(TutorialService);
  serverTypes = SERVER_TYPES_DATA;

  readonly categoryMap: Record<string, string> = {
    'srv-compute': 'Compute & Virtualization',
    'srv-web': 'Web & Application',
    'srv-db': 'Database & Cache',
    'srv-identity': 'Identity & Directory',
    'srv-network': 'Network Services & Edge',
    'srv-storage': 'Messaging, Storage & Backup',
    'srv-ops': 'Observability & Operations'
  };

  userSelectedCategory = signal<string | null>(null);

  selectedServerCategory = computed(() => {
    const active = this.tutorialService.activeTopicId();
    if (this.categoryMap[active]) {
      return this.categoryMap[active];
    }
    return this.userSelectedCategory() || 'All';
  });

  selectedServerDetail = signal<ServerTypeItem | null>(null);

  serverCategories = [
    'All',
    'Compute & Virtualization',
    'Web & Application',
    'Database & Cache',
    'Identity & Directory',
    'Network Services & Edge',
    'Messaging, Storage & Backup',
    'Observability & Operations'
  ];

  filteredServerTypes = computed(() => {
    const q = this.tutorialService.searchQuery().toLowerCase().trim();
    const cat = this.selectedServerCategory();

    return this.serverTypes.filter(s => {
      const matchesCat = cat === 'All' || s.category === cat;
      const matchesQuery = !q ||
        s.name.toLowerCase().includes(q) ||
        s.purpose.toLowerCase().includes(q) ||
        s.defaultPorts.some(p => p.toLowerCase().includes(q)) ||
        s.keyConfigSnippet.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  });

  setServerCategory(cat: string) {
    this.userSelectedCategory.set(cat);
  }

  openServerDetail(item: ServerTypeItem) {
    this.selectedServerDetail.set(item);
  }

  closeServerDetail() {
    this.selectedServerDetail.set(null);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
