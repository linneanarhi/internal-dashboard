import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PortalSidebarComponent } from '../../sidebar/sidebar/sidebar';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, PortalSidebarComponent],
  templateUrl: './shell.html',
})
export class ShellComponent {}
