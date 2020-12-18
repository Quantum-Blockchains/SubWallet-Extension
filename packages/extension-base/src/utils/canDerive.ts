// Copyright 2019-2020 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

export default function canDerive (type?: KeypairType): boolean {
  return !!type && ['ed25519', 'sr25519', 'ecdsa'].includes(type);
}
