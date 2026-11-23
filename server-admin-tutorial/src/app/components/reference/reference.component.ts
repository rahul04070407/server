import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CHEATSHEET_DATA,
  TROUBLESHOOTING_DATA,
  GLOSSARY_DATA,
  CheatsheetCard,
  TroubleshootingItem,
  GlossaryTerm
} from '../../data/reference.data';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-reference',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reference.component.html',
  styleUrl: './reference.component.scss'
})
export class ReferenceComponent {
  tutorialService = inject(TutorialService);

  cheatsheet = CHEATSHEET_DATA;
  troubleshooting = TROUBLESHOOTING_DATA;
  glossary = GLOSSARY_DATA;

  activeTab = signal<'cheatsheet' | 'troubleshooting' | 'glossary'>('cheatsheet');
  glossarySearch = signal<string>('');

  filteredGlossary = computed(() => {
    const q = this.glossarySearch().toLowerCase().trim();
    if (!q) return this.glossary;
    return this.glossary.filter(
      item =>
        item.keyword.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  });

  copy(text: string, id: string) {
    this.tutorialService.copyToClipboard(text, id);
  }
}
