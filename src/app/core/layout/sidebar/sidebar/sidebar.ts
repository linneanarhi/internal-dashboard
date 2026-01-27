import { Component, OnInit } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { SidebarService, MenuItem } from '../../../services/sidebar.service';

@Component({
    selector: 'app-portal-sidebar',
    templateUrl: './sidebar.html',
    styleUrls: ['./sidebar.css'],
    imports: [RouterModule]
})
export class PortalSidebarComponent implements OnInit {
  isExpanded = false;
  menuItems: MenuItem[] = [];
  bottomMenuItems: MenuItem[] = [];
  isDarkTheme = false;

  constructor(private router: Router, private sidebar: SidebarService) {}

  ngOnInit(): void {
    this.menuItems = this.sidebar.getPortalMenu();
    this.bottomMenuItems = this.sidebar.getPortalBottomMenu();

    this.sidebar.theme$.subscribe((t) => {
      this.isDarkTheme = t === 'dark';
    });
  }

  userAvatarUrl: string | null = null; // how to set to real URL when available???
  defaultAvatar: string = 'https://placehold.co/300x300?text=User'; // and the placeholder???

  // automatically use default when there is a problem with userAvatarUrl :
  get effectiveAvatarUrl(): string {
    return this.userAvatarUrl ?? this.defaultAvatar;
  }

  userAvatar = 'bi bi-person-circle';
  userName = 'Jane Doe';
  userLevel = 'Member';

  toggleTheme() {
    this.sidebar.toggleTheme();
  }
  isRouteActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  logout() {
    this.sidebar.logout();
    this.router.navigate(['/login']);
  }

  exportChat() {
    this.sidebar.exportChat();
  }

  openHelp() {
    this.sidebar.openHelp();
  }
}