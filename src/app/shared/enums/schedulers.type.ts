export enum Types {
  Tcp = 1,
  Grpc = 2,
  Http = 3,
  SiteMap = 4,
  HttpJsonValue = 5,
}

export enum SelectorTypes {
  String = 1,
  Bool = 2,
  Number = 3,
  Time = 4,
  Any = 5,
  Raw = 6,
}

export function selectorToString(selector: SelectorTypes) {
  return SelectorTypes[selector];
}

export function typeToString(type: Types) {
  return Types[type];
}
