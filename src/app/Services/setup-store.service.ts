import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TechnicalSetup } from '../core/models/flow.models';

@Injectable({ providedIn: 'root' })
export class SetupStoreService {
  private list: TechnicalSetup[] = [];
  setups$ = new BehaviorSubject<TechnicalSetup[]>([]);

  init(seed: TechnicalSetup[]) {
    this.list = [...seed];
    this.emit();
  }

  getByCustomer(customerId: string) {
    return this.list.find(s => s.customerId === customerId) ?? null;
  }

  upsert(setup: TechnicalSetup) {
    const idx = this.list.findIndex(s => s.customerId === setup.customerId);
    if (idx === -1) this.list.push(setup);
    else this.list[idx] = setup;
    this.emit();
  }

  private emit() {
    this.setups$.next([...this.list]);
  }
}
