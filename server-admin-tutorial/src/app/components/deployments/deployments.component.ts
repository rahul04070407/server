import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEPLOYMENTS_DATA } from '../../data/deployments.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-deployments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployments.component.html',
  styleUrl: './deployments.component.scss'
})
export class DeploymentsComponent {
  tutorialService = inject(TutorialService);
  deployments = DEPLOYMENTS_DATA;

  selectedDeploymentId = computed(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.deployments.find(d => d.id === active);
    return found ? found.id : (this.deployments[0]?.id || 'angular-linux-nginx');
  });

  currentDeployment = computed(() => {
    return this.deployments.find(d => d.id === this.selectedDeploymentId()) || this.deployments[0];
  });

  selectDeployment(id: string) {
    this.tutorialService.activeTopicId.set(id);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
