import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMPONENTS_DATA, ServerComponentTopic } from '../../data/components-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-server-components',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-components.component.html',
  styleUrl: './server-components.component.scss'
})
export class ServerComponentsComponent {
  tutorialService = inject(TutorialService);
  topics = COMPONENTS_DATA;

  selectedTopic = computed<ServerComponentTopic>(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.topics.find(t => t.id === active);
    return found || this.topics[0];
  });

  selectTopic(id: string) {
    this.tutorialService.activeTopicId.set(id);
  }
}
