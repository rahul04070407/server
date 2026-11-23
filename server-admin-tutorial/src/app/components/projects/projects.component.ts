import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PROJECTS_DATA } from '../../data/projects.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  tutorialService = inject(TutorialService);
  projects = PROJECTS_DATA;

  selectedProjectId = computed<number>(() => {
    const active = this.tutorialService.activeTopicId();
    if (active.startsWith('proj-')) {
      const num = parseInt(active.replace('proj-', ''), 10);
      const found = this.projects.find(p => p.id === num);
      if (found) return found.id;
    }
    return 1;
  });

  currentProject = computed(() => {
    return this.projects.find(p => p.id === this.selectedProjectId()) || this.projects[0];
  });

  selectProject(id: number) {
    this.tutorialService.activeTopicId.set('proj-' + id);
  }
}
