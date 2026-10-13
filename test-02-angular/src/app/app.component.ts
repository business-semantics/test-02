import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAlertModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbAlertModule, NgbPaginationModule],
  template: `
    <div class="container">
      <ngb-alert type="info" [dismissible]="false" i18n>Libraries used by test-02-angular</ngb-alert>
      <input class="form-control" [(ngModel)]="filter" placeholder="Filter">
      <ul class="list-group">
        <li class="list-group-item" *ngFor="let library of libraries$ | async">{{ library }}</li>
      </ul>
      <ngb-pagination [collectionSize]="40" [(page)]="page"></ngb-pagination>
    </div>
  `
})
export class AppComponent {
  filter = '';
  page = 1;

  readonly libraries$: Observable<string[]> = of(['@angular/core', '@ng-bootstrap/ng-bootstrap', 'rxjs', 'zone.js']).pipe(
    map(libraries => libraries.filter(library => library.includes(this.filter)))
  );
}
