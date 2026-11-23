import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCRIPTS_DATA, HARDENING_BASELINES, DOC_TEMPLATES, ScriptItem } from '../../data/automation-security.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-automation-security',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './automation-security.component.html',
  styleUrl: './automation-security.component.scss'
})
export class AutomationSecurityComponent {
  tutorialService = inject(TutorialService);
  scripts = SCRIPTS_DATA;
  hardeningBaselines = HARDENING_BASELINES;
  docTemplates = DOC_TEMPLATES;

  selectedAutomationTab = computed<'scripts' | 'hardening' | 'templates'>(() => {
    const active = this.tutorialService.activeTopicId();
    if (active.startsWith('cis-')) return 'hardening';
    if (active.startsWith('doc-')) return 'templates';
    return 'scripts';
  });

  selectedScript = computed<ScriptItem>(() => {
    const active = this.tutorialService.activeTopicId();
    const found = this.scripts.find(s => s.id === active);
    return found || this.scripts[0];
  });

  setSubTab(tab: 'scripts' | 'hardening' | 'templates') {
    if (tab === 'scripts') this.tutorialService.activeTopicId.set(this.scripts[0].id);
    else if (tab === 'hardening') this.tutorialService.activeTopicId.set('cis-linux-hardening');
    else this.tutorialService.activeTopicId.set('doc-rca-template');
  }

  selectScript(script: ScriptItem) {
    this.tutorialService.activeTopicId.set(script.id);
  }

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
