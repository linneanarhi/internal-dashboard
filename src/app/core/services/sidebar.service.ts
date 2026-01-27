import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // Theme
  private themeSubject = new BehaviorSubject<'light' | 'dark'>(
    document.body.classList.contains('dark-theme') ? 'dark' : 'light'
  );
  theme$ = this.themeSubject.asObservable();

  // Portal menu items
  private readonly portalMenu: MenuItem[] = [
    { icon: 'bi bi-speedometer2', label: 'Översikt', route: '/oversikt' },
    { icon: 'bi bi-kanban', label: 'Projekt', route: '/project' },
    { icon: 'bi bi-folder-fill', label: 'Filer', route: '/files' },
    {
      icon: 'bi bi-chat-dots-fill',
      label: 'Chatta med din data',
      route: '/LLM',
    },
    { icon: 'bi bi-book-fill', label: 'Rapporter', route: '/rapporter' }
  ];

  private readonly portalBottomMenu: MenuItem[] = [
    { icon: 'bi bi-gear-fill', label: 'Admincentral', route: '/' },
    { icon: 'bi bi-info-circle-fill', label: 'Om oss', route: '/about-us' },
    { icon: 'bi bi-person-circle', label: 'Mitt konto', route: '/my-account' },
    { icon: 'bi bi-box-arrow-right', label: 'Logga ut' },
  ];

  getPortalMenu(): MenuItem[] {
    return this.portalMenu;
  }
  getPortalBottomMenu(): MenuItem[] {
    return this.portalBottomMenu;
  }

  toggleTheme() {
    const next = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.themeSubject.next(next);
    document.body.classList.toggle('dark-theme', next === 'dark');
  }

  exportChat() {
    // placeholder
    console.log('exportChat called');
  }

  openHelp() {
    // placeholder
    console.log('openHelp called');
  }

  logout() {
    // placeholder
    console.log('logout called');
  }
}