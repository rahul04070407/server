import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  tutorialService = inject(TutorialService);

  toggleSidebar() {
    this.tutorialService.toggleSidebar();
  }

  getActiveSectionTitle(): string {
    const activeSec = this.tutorialService.activeSection();
    const group = this.tutorialService.navGroups.find(g => g.sectionId === activeSec);
    if (!group) return 'Server 101';
    const cleanTitle = group.title.includes('.') ? group.title.split('.')[1].trim() : group.title;
    return `${group.icon} ${cleanTitle}`;
  }
}
