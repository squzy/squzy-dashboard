import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Types, SelectorTypes, selectorToString } from 'src/app/shared/enums/schedulers.type';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { integerValidator } from 'src/app/shared/validators/number.validators';
import { MatSelectChange, MatChipInputEvent, MatInput, MatSelect } from '@angular/material';

@Component({
  selector: 'sqd-dialog-add-checker',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCheckerFormComponent {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  schdedulerTypes = Types

  methods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE']

  selectors = [SelectorTypes.Any, SelectorTypes.Bool, SelectorTypes.Number, SelectorTypes.Raw, SelectorTypes.String, SelectorTypes.Time]

  httpConfig = this.fb.group({
    method: [this.methods[0], Validators.required],
    url: ['', Validators.required],
    status_code: [200, Validators.compose([Validators.required, Validators.min(1), Validators.max(503), integerValidator])],
    headers: [{}]
  })

  httpValueConfig = this.fb.group({
    method: [this.methods[0], Validators.required],
    url: ['', Validators.required],
    headers: [{}],
    selectors: [[]]
  })


  tcpConfig = this.fb.group({
    host: ['', Validators.required],
    port: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(65535), integerValidator])]
  })

  grpcConfig = this.fb.group({
    service: [''],
    host: ['', Validators.required],
    port: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(65535), integerValidator])]
  })

  siteMapConfig = this.fb.group({
    url: ['', Validators.required],
    concurrency: [null, Validators.compose([integerValidator, Validators.min(1)])]
  })

  private configMap = {
    [Types.Tcp]: this.fb.group({
      tcpConfig: this.tcpConfig,
    }),
    [Types.Grpc]: this.fb.group({
      grpcConfig: this.grpcConfig,
    }),
    [Types.SiteMap]: this.fb.group({
      siteMapConfig: this.siteMapConfig,
    }),
    [Types.Http]: this.fb.group({
      httpConfig: this.httpConfig,
    }),
    [Types.HttpJsonValue]: this.fb.group({
      httpValueConfig: this.httpValueConfig,
    })
  }

  form = this.fb.group({
    type: [null, Validators.required],
    interval: [1, Validators.compose([Validators.required, Validators.min(1), integerValidator])],
    timeout: [null, Validators.compose([Validators.min(1), integerValidator])],
    config: [null],
  })

  constructor(
    private fb: FormBuilder,
    ){}

  onSubmit() {
    console.log(this.form.value)
  }

  changeType(event: MatSelectChange) {
    this.form.setControl('config', this.configMap[event.value])
  }

  addHeader(control: FormControl, event: MatChipInputEvent) {
    const value = event.value
    const trimmedValue = (value || '').trim()
    if (trimmedValue && trimmedValue.split(':').length == 2)  {
      const splited = trimmedValue.split(':')
      const key = splited[0].trim()
      const value = splited[1].trim()
      if (key && value) {
        control.value[key] = value
        event.input.value = ''
      }
    }
  }

  removeHeader(control: FormControl, key: string) {
    delete control.value[key]
  }

  removeSelector(control: FormControl, index: number) {
    control.value.splice(index, 1)
  }

  toSelectorType(selector: SelectorTypes) {
    return selectorToString(selector)
  }

  addSelector(control: FormControl, select: MatSelect, input: MatInput) {
    const pathValue = input.value.trim()
    if (input.value && pathValue) {
      control.value.push({
        type: select.value,
        path: pathValue
      })
      input.value = ''
    }
  }
}
