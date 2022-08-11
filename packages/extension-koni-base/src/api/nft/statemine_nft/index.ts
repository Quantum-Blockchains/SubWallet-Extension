// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiProps, NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { SUPPORTED_NFT_NETWORKS } from '@subwallet/extension-koni-base/api/nft/config';
import { BaseNftApi, HandleNftParams } from '@subwallet/extension-koni-base/api/nft/nft';
import { isUrl } from '@subwallet/extension-koni-base/utils';

interface AssetId {
  classId: string | number,
  tokenId: string | number
}

interface MetadataResponse {
  deposit?: string,
  data?: string,
  isFrozen?: boolean
}

interface TokenDetail {
  description?: string,
  name?: string,
  attributes?: any[],
  image?: string
}

interface CollectionDetail {
  name?: string,
  image?: string,
  external_url?: string,
  description?: string
}

export default class StatemineNftApi extends BaseNftApi {
  // eslint-disable-next-line no-useless-constructor
  constructor (api: ApiProps | null, addresses: string[], chain: string) {
    super(chain, api, addresses);
  }

  private getMetadata (metadataUrl: string) {
    let url: string | undefined = metadataUrl;

    if (!isUrl(metadataUrl)) {
      url = this.parseUrl(metadataUrl);

      if (!url || url.length === 0) {
        return undefined;
      }
    }

    return fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json());
  }

  /**
   * Retrieve id of NFTs
   *
   * @returns the array of NFT Ids
   * @param addresses
   */
  private async getNfts (addresses: string[]): Promise<AssetId[]> {
    if (!this.dotSamaApi) {
      return [];
    }

    let accountAssets: any[] = [];

    await Promise.all(addresses.map(async (address) => {
      // @ts-ignore
      const resp = await this.dotSamaApi.api.query.uniques.account.keys(address);

      accountAssets = accountAssets.concat(...resp);
    }));

    const assetIds: AssetId[] = [];

    for (const key of accountAssets) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const data = key.toHuman() as string[];

      assetIds.push({ classId: data[1], tokenId: this.parseTokenId(data[2]) });
    }

    return assetIds;
  }

  private async getTokenDetails (assetId: AssetId): Promise<TokenDetail | null> {
    if (!this.dotSamaApi) {
      return null;
    }

    const { classId, tokenId } = assetId;
    const metadataNft = (await this.dotSamaApi.api.query.uniques.instanceMetadataOf(this.parseTokenId(classId as string), this.parseTokenId(tokenId as string))).toHuman() as MetadataResponse;

    if (!metadataNft?.data) {
      return null;
    }

    // @ts-ignore
    return this.getMetadata(metadataNft?.data);
  }

  private async getCollectionDetail (collectionId: number): Promise<CollectionDetail | null> {
    if (!this.dotSamaApi) {
      return null;
    }

    const collectionMetadata = (await this.dotSamaApi.api.query.uniques.classMetadataOf(collectionId)).toHuman() as MetadataResponse;

    if (!collectionMetadata?.data) {
      return null;
    }

    // @ts-ignore
    return this.getMetadata(collectionMetadata?.data);
  }

  public async handleNfts (params: HandleNftParams) {
    // const start = performance.now();

    const assetIds = await this.getNfts(this.addresses);

    try {
      if (!assetIds || assetIds.length === 0) {
        params.updateReady(true);
        params.updateNftIds(SUPPORTED_NFT_NETWORKS.statemine);

        return;
      }

      const collectionNftIds: Record<string, string[]> = {};

      await Promise.all(assetIds.map(async (assetId) => {
        const parsedClassId = this.parseTokenId(assetId.classId as string);
        const parsedTokenId = this.parseTokenId(assetId.tokenId as string);

        if (collectionNftIds[parsedClassId]) {
          collectionNftIds[parsedClassId].push(parsedTokenId);
        } else {
          collectionNftIds[parsedClassId] = [parsedTokenId];
        }

        const [tokenInfo, collectionMeta] = await Promise.all([
          this.getTokenDetails(assetId),
          this.getCollectionDetail(parseInt(parsedClassId))
        ]);

        const parsedNft = {
          id: parsedTokenId,
          name: tokenInfo?.name as string,
          description: tokenInfo?.description as string,
          image: tokenInfo && tokenInfo.image ? this.parseUrl(tokenInfo?.image) : undefined,
          collectionId: this.parseTokenId(parsedClassId),
          chain: SUPPORTED_NFT_NETWORKS.statemine
        } as NftItem;

        params.updateItem(parsedNft);

        const parsedCollection = {
          collectionId: parsedClassId,
          chain: SUPPORTED_NFT_NETWORKS.statemine,
          collectionName: collectionMeta?.name,
          image: collectionMeta && collectionMeta.image ? this.parseUrl(collectionMeta?.image) : undefined
        } as NftCollection;

        params.updateCollection(parsedCollection);
        params.updateReady(true);
      }));

      params.updateCollectionIds(SUPPORTED_NFT_NETWORKS.statemine, Object.keys(collectionNftIds));
      Object.entries(collectionNftIds).forEach(([collectionId, nftIds]) => params.updateNftIds(SUPPORTED_NFT_NETWORKS.statemine, collectionId, nftIds));
    } catch (e) {
      console.error('Failed to fetch statemine nft', e);
    }
  }

  public async fetchNfts (params: HandleNftParams): Promise<number> {
    try {
      await this.connect();
      await this.handleNfts(params);
    } catch (e) {
      return 0;
    }

    return 1;
  }
}
