// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class MigrateEthProvider extends BaseMigrationJob {
  public override async run (): Promise<void> {
    const state = this.state;

    const slug = 'ethereum';
    const oldProvider = 'Cloudflare';
    const newProvider = 'Llamarpc';

    const chainState = state.getChainStateByKey(slug);
    const chainInfo = state.getChainInfo(slug);

    if (chainState.active && chainState.currentProvider === oldProvider) {
      await state.upsertChainInfo({
        mode: 'update',
        chainEditInfo: {
          currentProvider: newProvider,
          slug: slug,
          providers: chainInfo.providers
        }
      });
    }
  }
}
