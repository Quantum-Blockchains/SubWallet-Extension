// Copyright 2019-2022 @koniverse/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseStore from '@koniverse/extension-base/stores/Base';
import { Subject } from 'rxjs';

export default abstract class SubscribableStore<T> extends BaseStore<T> {
  private readonly subject: Subject<T> = new Subject<T>();

  public getSubject (): Subject<T> {
    return this.subject;
  }

  public override set (_key: string, value: T, update?: () => void): void {
    super.set(_key, value, () => {
      this.subject.next(value);
      update && update();
    });
  }
}
