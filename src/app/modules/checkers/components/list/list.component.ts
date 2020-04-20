import { Component } from '@angular/core';
import { CheckersService, Types, StatusCode } from '../../services/checkers.service';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'sqd-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {

  constructor(private checkersService: CheckersService, private router: Router) {}
  private pageNumber$ = new BehaviorSubject<number>(0);

  obs$ = this.pageNumber$.pipe(switchMap((number) => this.checkersService.getList(number)));
  displayedColumns: string[] = ['ID', 'type', 'status', 'time'];

  toType = (type) => {
    return Types[type].toUpperCase();
  }

  toStatus = (status) => {
    return StatusCode[status];
  }

  changePage(event: PageEvent) {
    this.pageNumber$.next(event.pageIndex);
  }

  clickRow(row) {
    this.router.navigate(['checkers', row.id]);
  }
}
