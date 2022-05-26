// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetWorkInfo } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson, FindAccountFunction } from '@subwallet/extension-base/background/types';
import getNetworkInfoByGenesisHash, { getNetworkKeyByGenesisHash } from '@subwallet/extension-koni-ui/util/getNetworkInfoByGenesisHash';
import { getLogoByNetworkKey } from '@subwallet/extension-koni-ui/util/index';
import reformatAddress from '@subwallet/extension-koni-ui/util/reformatAddress';
import { AccountInfoByNetwork } from '@subwallet/extension-koni-ui/util/types';

export const createFindAccountHandler = (accounts: AccountJson[]): FindAccountFunction => {
  return (address: string, genesisHash?: string): AccountJson | undefined => {
    if (!genesisHash) {
      return accounts.find((account) => {
        const formattedAddress = reformatAddress(account.address, 0, true);

        return formattedAddress === address;
      });
    }

    const network: NetWorkInfo | null = getNetworkInfoByGenesisHash(genesisHash);

    if (network) {
      for (const account of accounts) {
        const formattedAddress = reformatAddress(account.address, network.ss58Format, network.isEthereum);

        if (formattedAddress === address) {
          return account;
        }
      }
    } else {
      return accounts.find((account) => account.address === address);
    }

    // eslint-disable-next-line no-useless-return
    return;
  };
};

export const getAccountInfoByNetwork = (address: string, network: NetWorkInfo): AccountInfoByNetwork => {
  const networkKey = getNetworkKeyByGenesisHash(network.genesisHash) || '';

  return {
    address,
    key: networkKey,
    networkKey,
    networkDisplayName: network.chain,
    networkPrefix: network.ss58Format,
    networkLogo: getLogoByNetworkKey(networkKey),
    networkIconTheme: network.isEthereum ? 'ethereum' : (network.icon || 'polkadot'),
    formattedAddress: reformatAddress(address, network.ss58Format, network.isEthereum)
  };
};
