import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INCIDENTS_DATA, IncidentRunbook } from '../../data/incidents.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incidents.component.html',
  styleUrl: './incidents.component.scss'
})
export class IncidentsComponent {
  tutorialService = inject(TutorialService);
  incidents = INCIDENTS_DATA;

  selectedIncidentCategory = signal<string>('All');

  selectedIncident = computed<IncidentRunbook>(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.incidents.find(i => i.id === active);
    return found || this.incidents[0];
  });

  incidentCategories = [
    'All',
    'System & Hardware',
    'Web & Application',
    'Database & Storage',
    'Identity & Network',
    'Cloud & Containers'
  ];

  filteredIncidents = computed(() => {
    const q = this.tutorialService.searchQuery().toLowerCase().trim();
    const cat = this.selectedIncidentCategory();

    return this.incidents.filter(inc => {
      const matchesCat = cat === 'All' || inc.category === cat;
      const matchesQuery = !q ||
        inc.title.toLowerCase().includes(q) ||
        inc.ticketNumber.toLowerCase().includes(q) ||
        inc.reportedIssue.toLowerCase().includes(q) ||
        inc.rootCause.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  });

  selectIncident(inc: IncidentRunbook) {
    this.tutorialService.activeTopicId.set(inc.id);
  }

  setCategory(cat: string) {
    this.selectedIncidentCategory.set(cat);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
