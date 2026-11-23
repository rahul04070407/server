import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OTHER_GUIDES_DATA, OtherGuideTopic } from '../../data/other-guides.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-other-guides',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './other-guides.component.html',
  styleUrl: './other-guides.component.scss'
})
export class OtherGuidesComponent {
  tutorialService = inject(TutorialService);
  topics = OTHER_GUIDES_DATA;

  selectedTopic = computed<OtherGuideTopic>(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.topics.find(t => t.id === active);
    return found || this.topics[0];
  });

  selectTopic(id: string) {
    this.tutorialService.activeTopicId.set(id);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
