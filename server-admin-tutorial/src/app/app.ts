import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorialService } from './core/services/tutorial.service';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ServerFoundationsComponent } from './components/server-foundations/server-foundations.component';
import { ServerComponentsComponent } from './components/server-components/server-components.component';
import { NginxGuideComponent } from './components/nginx-guide/nginx-guide.component';
import { OtherGuidesComponent } from './components/other-guides/other-guides.component';
import { ServerSetupComponent } from './components/server-setup/server-setup.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { ScalabilityComponent } from './components/scalability/scalability.component';
import { ReferenceComponent } from './components/reference/reference.component';
import { HomeLabComponent } from './components/home-lab/home-lab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SideNavComponent,
    HeaderComponent,
    FooterComponent,
    ServerFoundationsComponent,
    ServerComponentsComponent,
    NginxGuideComponent,
    OtherGuidesComponent,
    ServerSetupComponent,
    PerformanceComponent,
    ScalabilityComponent,
    ReferenceComponent,
    HomeLabComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  tutorialService = inject(TutorialService);
}
