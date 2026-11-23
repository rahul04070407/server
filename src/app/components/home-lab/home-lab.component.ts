import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HOME_LAB_TIERS } from '../../data/home-lab.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-home-lab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-lab.component.html',
  styleUrl: './home-lab.component.scss'
})
export class HomeLabComponent {
  tutorialService = inject(TutorialService);
  labTiers = HOME_LAB_TIERS;

  selectedTierIndex = computed<number>(() => {
    const active = this.tutorialService.activeTopicId();
    if (active === 'lab-tier-1') return 0;
    if (active === 'lab-tier-3') return 2;
    return 1; // Default to 32GB
  });

  selectTier(index: number) {
    this.tutorialService.activeTopicId.set(`lab-tier-${index + 1}`);
  }
}
