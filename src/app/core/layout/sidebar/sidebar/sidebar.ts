import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type NavItem = { label: string; path: string; icon: string };

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
nav = [
  { label: 'Alla kunder', path: '/customers', icon: '🏢' },
];


  year = new Date().getFullYear();
}
