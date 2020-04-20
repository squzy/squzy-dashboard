import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'sqd-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.scss'],
})
export class CheckerComponent {
  currentId$ = this.route.params.pipe(map((p) => p.id));

  constructor(private route: ActivatedRoute) {}
}
