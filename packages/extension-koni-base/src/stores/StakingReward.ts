// Copyright 2019-2022 @koniverse/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EXTENSION_PREFIX } from '@koniverse/extension-base/defaults';
import { StakingRewardJson } from '@koniverse/extension-koni-base/background/types';
import SubscribableStore from '@koniverse/extension-koni-base/stores/SubscribableStore';

export default class StakingRewardStore extends SubscribableStore<StakingRewardJson> {
  constructor () {
    super(EXTENSION_PREFIX ? `${EXTENSION_PREFIX}stakingReward` : null);
  }
}
