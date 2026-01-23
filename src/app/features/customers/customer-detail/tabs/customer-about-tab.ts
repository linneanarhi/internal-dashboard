import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CustomerAboutVm {
  id?: string | number;
  name: string;
  currentUserName?: string; 
}

export interface CustomerComment {
  id: string;
  text: string;
  authorName: string;
  createdAt: string; 
}

@Component({
  selector: 'app-customer-about-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-about-tab.html',
})
export class CustomerAboutTabComponent implements OnChanges {
  @Input({ required: true }) customer!: CustomerAboutVm;

  draft = '';
  history: CustomerComment[] = [];
  lastSavedAt: string | null = null;

  get canSave(): boolean {
    return this.draft.trim().length >= 2;
  }

  ngOnChanges(): void {
    this.history = this.loadHistory();
    this.lastSavedAt = this.history.length ? this.history[0].createdAt : null;
    this.draft = '';
  }

  onDraftChange(): void {
  }

  saveComment(): void {
    const text = this.draft.trim();
    if (!text) return;

    const authorName = this.customer.currentUserName?.trim() || 'Linnea Närhi';

    const newItem: CustomerComment = {
      id: this.makeId(),
      text,
      authorName,
      createdAt: new Date().toISOString(),
    };

    // Nyast först
    this.history = [newItem, ...this.history];
    this.persistHistory(this.history);

    this.lastSavedAt = newItem.createdAt;
    this.draft = '';
  }

  deleteComment(id: string): void {
    this.history = this.history.filter(x => x.id !== id);
    this.persistHistory(this.history);
    this.lastSavedAt = this.history.length ? this.history[0].createdAt : null;
  }

  trackById(_: number, item: CustomerComment): string {
    return item.id;
  }

  private storageKey(): string {
    const key = this.customer?.id ?? this.customer?.name ?? 'unknown';
    return `customer-history:${key}`;
  }

  private loadHistory(): CustomerComment[] {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CustomerComment[];

      // skydd: filtrera bort trasiga rader
      return Array.isArray(parsed)
        ? parsed.filter(x => x?.id && x?.text && x?.createdAt)
        : [];
    } catch {
      return [];
    }
  }

  //Använder localstorage, ska såklart va backend i framtiden
  private persistHistory(items: CustomerComment[]): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(items));
    } catch {
    }
  }

  private makeId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
