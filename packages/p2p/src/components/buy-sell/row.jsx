import React from 'react';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import { Table, Button } from '@deriv/components';
import Dp2pContext from 'Components/context/dp2p-context';
import { localize } from 'Components/i18next';
import { generateHexColourFromNickname, getShortNickname } from 'Utils/string';

export const BuySellRowLoader = () => (
    <ContentLoader
        height={64}
        width={900}
        speed={2}
        primaryColor={'var(--general-hover)'}
        secondaryColor={'var(--general-active)'}
    >
        <rect x='1' y='20' rx='5' ry='5' width='90' height='10' />
        <rect x='150' y='20' rx='5' ry='5' width='90' height='10' />
        <rect x='300' y='20' rx='5' ry='5' width='90' height='10' />
        <rect x='446' y='20' rx='5' ry='5' width='90' height='10' />
        <rect x='600' y='20' rx='5' ry='5' width='90' height='10' />
        <rect x='750' y='15' rx='5' ry='5' width='45' height='18' />
    </ContentLoader>
);

BuySellRowLoader.propTypes = {
    width: PropTypes.number,
};

export const RowComponent = React.memo(({ data, is_buy, setSelectedAd, style }) => {
    const { advertiser_id } = React.useContext(Dp2pContext);
    const is_own_ad = data.advertiser_id === advertiser_id;
    const short_name = getShortNickname(data.advertiser_name);

    return (
        <div style={style}>
            <Table.Row className='buy-sell__table-row'>
                <Table.Cell>
                    <div
                        className='buy-sell__icon'
                        style={{ backgroundColor: generateHexColourFromNickname(data.advertiser_name) }}
                    >
                        {short_name}
                    </div>
                    {data.advertiser_name}
                </Table.Cell>
                <Table.Cell>
                    {data.display_min_available}&ndash;{data.display_max_available} {data.offer_currency}
                </Table.Cell>
                <Table.Cell className='buy-sell__price' flex='2fr'>
                    {data.display_price_rate} {data.transaction_currency}
                </Table.Cell>
                <Table.Cell>{data.display_payment_method}</Table.Cell>
                {is_own_ad ? (
                    <Table.Cell />
                ) : (
                    <Table.Cell className='buy-sell__button'>
                        <Button primary small onClick={() => setSelectedAd(data)}>
                            {is_buy ? localize('Buy') : localize('Sell')} {data.offer_currency}
                        </Button>
                    </Table.Cell>
                )}
            </Table.Row>
        </div>
    );
});

RowComponent.propTypes = {
    data: PropTypes.object,
    is_buy: PropTypes.bool,
    setSelectedAd: PropTypes.func,
    style: PropTypes.object,
};

RowComponent.displayName = 'RowComponent';
