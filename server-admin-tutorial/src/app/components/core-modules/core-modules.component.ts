import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TUTORIAL_CHAPTERS } from '../../data/tutorial-modules.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-core-modules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './core-modules.component.html',
  styleUrl: './core-modules.component.scss'
})
export class CoreModulesComponent {
  tutorialService = inject(TutorialService);
  tutorialChapters = TUTORIAL_CHAPTERS;

  selectedChapterId = computed(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.tutorialChapters.find(c => c.id === active);
    return found ? found.id : (this.tutorialChapters[0]?.id || 'core-os-foundations');
  });

  currentChapter = computed(() => {
    return this.tutorialChapters.find(c => c.id === this.selectedChapterId()) || this.tutorialChapters[0];
  });

  selectChapter(id: string) {
    this.tutorialService.activeTopicId.set(id);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
