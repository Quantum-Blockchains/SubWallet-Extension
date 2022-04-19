// Copyright 2019-2022 @koniverse/extension-koni-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { initApi } from '@koniverse/extension-koni-base/api/dotsama/api';
import NETWORKS from '@koniverse/extension-koni-base/api/endpoints';
import { ApiProps } from '@koniverse/extension-koni-base/background/types';

import { AccountInfo } from '@polkadot/types/interfaces';

jest.setTimeout(50000);

describe('test DotSama APIs', () => {
  let apiMap: Record<string, ApiProps>;

  beforeAll(async () => {
    apiMap = {};
    const networkList = ['moonbase'];

    const promList = networkList.map((networkKey) => {
      return initApi(networkKey, NETWORKS[networkKey].provider).isReady;
    });

    const apiPropsList = await Promise.all(promList);

    networkList.forEach((networkKey, index) => {
      apiMap[networkKey] = apiPropsList[index];
    });
  });

  afterAll(async () => {
    await Promise.all(Object.values(apiMap).map((apiProps) => {
      return apiProps.api.disconnect();
    }));
  });

  it('test get Balances', async () => {
    const balances = await apiMap.moonbase?.api.query.system.account.multi(['0x25B12Fe4D6D7ACca1B4035b26b18B4602cA8b10F']);

    balances.forEach((rs) => {
      // @ts-ignore
      const balanceInfo = rs as AccountInfo;

      console.log(balanceInfo.data.free.toString());
    });
  });
});
