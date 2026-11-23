import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ARCHITECTURES_DATA, ArchitectureItem } from '../../data/architectures.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-architectures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architectures.component.html',
  styleUrl: './architectures.component.scss'
})
export class ArchitecturesComponent {
  tutorialService = inject(TutorialService);
  architectures = ARCHITECTURES_DATA;

  selectedArchitecture = computed<ArchitectureItem>(() => {
    const active = this.tutorialService.activeTopicId();
    if (active.startsWith('arch-')) {
      const num = parseInt(active.replace('arch-', ''), 10);
      const found = this.architectures.find(a => a.id === num);
      if (found) return found;
    }
    return this.architectures[0];
  });

  selectArchitecture(arch: ArchitectureItem) {
    this.tutorialService.activeTopicId.set('arch-' + arch.id);
  }
}
