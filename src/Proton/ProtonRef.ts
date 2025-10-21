export class ProtonRef<T> {
  current: T

  constructor(initialValue: any) {
    this.current = initialValue
  }
}

export declare const ProtonRefOverload: {
  new <T>(initialValue: T): ProtonRef<T>;
  new <T>(initialValue?: T | null): ProtonRef<T | null>;
}
