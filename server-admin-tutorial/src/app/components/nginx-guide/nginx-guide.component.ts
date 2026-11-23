import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGINX_GUIDE_DATA, NginxTopic } from '../../data/nginx-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-nginx-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nginx-guide.component.html',
  styleUrl: './nginx-guide.component.scss'
})
export class NginxGuideComponent {
  tutorialService = inject(TutorialService);
  topics = NGINX_GUIDE_DATA;

  activeConfigIndex = signal<number>(0);

  selectedTopic = computed<NginxTopic>(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.topics.find(t => t.id === active);
    return found || this.topics[0];
  });

  selectTopic(id: string) {
    this.tutorialService.activeTopicId.set(id);
    this.activeConfigIndex.set(0);
  }

  selectConfig(index: number) {
    this.activeConfigIndex.set(index);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
