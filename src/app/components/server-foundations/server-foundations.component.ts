import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOUNDATIONS_DATA, FoundationTopic } from '../../data/foundations-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-server-foundations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-foundations.component.html',
  styleUrl: './server-foundations.component.scss'
})
export class ServerFoundationsComponent {
  tutorialService = inject(TutorialService);
  topics = FOUNDATIONS_DATA;

  selectedTopic = computed<FoundationTopic>(() => {
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
