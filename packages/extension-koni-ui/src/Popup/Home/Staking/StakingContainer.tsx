// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import LogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { ActionContext } from '@subwallet/extension-koni-ui/components';
import Button from '@subwallet/extension-koni-ui/components/Button';
import { StakingDataType } from '@subwallet/extension-koni-ui/hooks/screen/home/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

const StakingRow = React.lazy(() => import('./StakingRow'));
const Spinner = React.lazy(() => import('@subwallet/extension-koni-ui/components/Spinner'));
const EmptyList = React.lazy(() => import('@subwallet/extension-koni-ui/Popup/Home/Staking/EmptyList'));

interface Props extends ThemeProps {
  className?: string;
  data: StakingDataType[];
  loading: boolean;
  priceMap: Record<string, number>;
}

function StakingContainer ({ className, data, loading, priceMap }: Props): React.ReactElement<Props> {
  const navigate = useContext(ActionContext);

  const handleNavigateBonding = useCallback(() => {
    navigate('/account/bonding');
    window.localStorage.setItem('popupNavigation', '/account/bonding');
  }, [navigate]);

  return (
    <div className={className}>
      <div className={'staking-container'}>

        {loading && <Spinner />}

        {/* @ts-ignore */}
        {data.length === 0 && !loading &&
          <EmptyList />
        }

        {data.length > 0 && !loading &&
          // @ts-ignore
          data.map((stakingDataType: StakingDataType, index: number) => {
            const item = stakingDataType.staking;
            const reward = stakingDataType?.reward;

            const name = item.name || item.chainId;
            const icon = LogosMap[item.chainId] || LogosMap.default;
            const price = priceMap[item.chainId];

            return <StakingRow
              amount={item.balance}
              chainName={name}
              index={index}
              key={index}
              logo={icon}
              price={price}
              reward={reward}
              unit={item.unit}
            />;
          })
        }

        <Button
          onClick={handleNavigateBonding}
        >
          Start staking
        </Button>
      </div>
    </div>
  );
}

export default React.memo(styled(StakingContainer)(({ theme }: Props) => `
  width: 100%;
  padding: 0 25px;

  .staking-container {
    display: flex;
    flex-direction: column;
  }
`));
