import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PERFORMANCE_DATA, PerformanceTopic } from '../../data/performance-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.scss'
})
export class PerformanceComponent {
  tutorialService = inject(TutorialService);
  topics = PERFORMANCE_DATA;

  selectedTopic = computed<PerformanceTopic>(() => {
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
