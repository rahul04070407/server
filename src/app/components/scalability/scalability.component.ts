import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCALABILITY_DATA, ScalabilityTopic } from '../../data/scalability-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-scalability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scalability.component.html',
  styleUrl: './scalability.component.scss'
})
export class ScalabilityComponent {
  tutorialService = inject(TutorialService);
  topics = SCALABILITY_DATA;

  selectedTopic = computed<ScalabilityTopic>(() => {
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
