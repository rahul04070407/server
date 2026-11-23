import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorialService, MainSection } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  tutorialService = inject(TutorialService);
  searchFilter = '';

  // Track expanded dropdown groups in a reactive signal Set
  openGroups = signal<Set<string>>(new Set<string>(['foundations']));

  constructor() {
    // Automatically ensure the currently active section's dropdown is open
    effect(() => {
      const activeSec = this.tutorialService.activeSection();
      this.openGroups.update(groups => {
        const next = new Set(groups);
        next.add(activeSec);
        return next;
      });
    });
  }

  get filteredGroups() {
    const q = this.searchFilter.toLowerCase().trim();
    if (!q) {
      return this.tutorialService.navGroups;
    }
    return this.tutorialService.navGroups
      .map(group => {
        const matchesGroup = group.title.toLowerCase().includes(q);
        const matchedTopics = group.topics.filter(t => t.label.toLowerCase().includes(q));
        if (matchesGroup || matchedTopics.length > 0) {
          return {
            ...group,
            topics: matchesGroup ? group.topics : matchedTopics
          };
        }
        return null;
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }

  isGroupOpen(sectionId: string): boolean {
    // If the user is actively searching, auto-expand all matching dropdowns
    if (this.searchFilter.trim().length > 0) {
      return true;
    }
    return this.openGroups().has(sectionId);
  }

  toggleGroup(sectionId: string) {
    this.openGroups.update(groups => {
      const next = new Set(groups);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  expandAll() {
    const all = new Set<string>(this.tutorialService.navGroups.map(g => g.sectionId));
    this.openGroups.set(all);
  }

  collapseAll() {
    this.openGroups.set(new Set<string>());
  }

  onSelect(section: MainSection, topicId: string) {
    this.tutorialService.selectTopic(section, topicId);
  }

  close() {
    this.tutorialService.closeSidebar();
  }
}
