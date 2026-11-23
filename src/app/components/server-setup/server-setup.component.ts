import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SETUP_GUIDE_STEPS, SetupStep } from '../../data/setup-guide.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-server-setup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-setup.component.html',
  styleUrl: './server-setup.component.scss'
})
export class ServerSetupComponent {
  tutorialService = inject(TutorialService);
  steps = SETUP_GUIDE_STEPS;

  selectedStep = computed<SetupStep>(() => {
    const active = this.tutorialService.activeTopicId();
    if (active.startsWith('setup-step-')) {
      const num = parseInt(active.replace('setup-step-', ''), 10);
      const found = this.steps.find(s => s.stepNumber === num);
      if (found) return found;
    }
    return this.steps[0];
  });

  selectStep(stepNum: number) {
    this.tutorialService.activeTopicId.set('setup-step-' + stepNum);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
