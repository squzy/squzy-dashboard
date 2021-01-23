import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Types, SelectorTypes } from 'src/app/shared/enums/schedulers.type';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { integerValidator } from 'src/app/shared/validators/number.validators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { CheckersService } from 'src/app/modules/checkers/services/checkers.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { URL_REGEXP, HOST_REGEXP } from 'src/app/shared/validators/urls.validators';

@Component({
  selector: 'sqd-dialog-add-checker',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCheckerFormComponent implements OnDestroy {
  private destroyed$ = new Subject();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  TcpType = Types.TCP;

  GrpcType = Types.GRPC;

  HttpType = Types.HTTP;

  SiteMapType = Types.SITE_MAP;

  HttpJsonValueType = Types.HTTP_JSON_VALUE;

  SslExpirationType = Types.SSL_EXPIRATION;

  schdedulerTypes = [
    this.HttpType,
    this.TcpType,
    this.GrpcType,
    this.SiteMapType,
    this.HttpJsonValueType,
    this.SslExpirationType,
  ];

  methods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];

  selectors = [
    SelectorTypes.ANY,
    SelectorTypes.BOOL,
    SelectorTypes.NUMBER,
    SelectorTypes.RAW,
    SelectorTypes.STRING,
    SelectorTypes.TIME,
  ];

  httpConfig = this.fb.group({
    method: [this.methods[0], Validators.required],
    url: ['', Validators.compose([Validators.required, Validators.pattern(URL_REGEXP)])],
    status_code: [
      200,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(503),
        integerValidator,
      ]),
    ],
    headers: [{}],
  });

  httpValueConfig = this.fb.group({
    method: [this.methods[0], Validators.required],
    url: ['', Validators.compose([Validators.required, Validators.pattern(URL_REGEXP)])],
    headers: [{}],
    selectors: [[]],
  });

  tcpConfig = this.fb.group({
    host: ['', Validators.compose([Validators.required, Validators.pattern(HOST_REGEXP)])],
    port: [
      null,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(65535),
        integerValidator,
      ]),
    ],
  });

  sslExpirationConfig = this.fb.group({
    host: ['', Validators.compose([Validators.required, Validators.pattern(HOST_REGEXP)])],
    port: [
      null,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(65535),
        integerValidator,
      ]),
    ],
  });

  grpcConfig = this.fb.group({
    service: [''],
    host: ['', Validators.compose([Validators.required, Validators.pattern(HOST_REGEXP)])],
    port: [
      null,
      Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(65535),
        integerValidator,
      ]),
    ],
  });

  siteMapConfig = this.fb.group({
    url: ['', Validators.compose([Validators.required, Validators.pattern(URL_REGEXP)])],
    concurrency: [null, Validators.compose([integerValidator, Validators.min(1)])],
  });

  private configMap = {
    [Types.TCP]: this.fb.group({
      tcpConfig: this.tcpConfig,
    }),
    [Types.GRPC]: this.fb.group({
      grpcConfig: this.grpcConfig,
    }),
    [Types.SITE_MAP]: this.fb.group({
      siteMapConfig: this.siteMapConfig,
    }),
    [Types.HTTP]: this.fb.group({
      httpConfig: this.httpConfig,
    }),
    [Types.HTTP_JSON_VALUE]: this.fb.group({
      httpValueConfig: this.httpValueConfig,
    }),
    [Types.SSL_EXPIRATION]: this.fb.group({
      sslExpirationConfig: this.sslExpirationConfig,
    }),
  };

  form = this.fb.group({
    type: [null, Validators.required],
    name: [null],
    interval: [10, Validators.compose([Validators.required, Validators.min(1), integerValidator])],
    timeout: [null, Validators.compose([Validators.min(1), integerValidator])],
    config: [null],
  });

  constructor(
    private dialogRef: MatDialogRef<AddCheckerFormComponent>,
    private fb: FormBuilder,
    private checkerService: CheckersService,
  ) {}

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    const formValue = this.form.value;

    const rq = {
      type: formValue.type,
      name: formValue.name,
      timeout: formValue.timeout,
      interval: formValue.interval,
      ...formValue.config,
    };

    this.checkerService
      .addChecker(rq)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

  changeType(event: MatSelectChange) {
    this.form.setControl('config', this.configMap[event.value]);
  }

  addHeader(control: AbstractControl, event: MatChipInputEvent) {
    const value = event.value;
    const trimmedValue = (value || '').trim();
    if (trimmedValue && trimmedValue.split(':').length === 2) {
      const splited = trimmedValue.split(':');
      const headerKey = splited[0].trim();
      const headerValue = splited[1].trim();
      if (headerKey && headerValue) {
        control.value[headerKey] = headerValue;
        event.input.value = '';
      }
    }
  }

  removeHeader(control: AbstractControl, key: string) {
    delete control.value[key];
  }

  removeSelector(control: AbstractControl, index: number) {
    control.value.splice(index, 1);
  }

  addSelector(control: AbstractControl, select: MatSelect, input: MatInput) {
    const pathValue = input.value.trim();
    if (input.value && pathValue) {
      control.value.push({
        type: select.value,
        path: pathValue,
      });
      select.value = null;
      input.value = '';
    }
  }
}
