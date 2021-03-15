import React from 'react';
import PropTypes from 'prop-types';
import { Loading, Icon } from '@deriv/components';
import { Localize } from 'Components/i18next';
import Dp2pContext from 'Components/context/dp2p-context';
import { InfiniteLoaderList } from 'Components/table/infinite-loader-list.jsx';
import { TableError } from 'Components/table/table-error.jsx';
import { requestWS } from 'Utils/websocket';
import { RowComponent, BuySellRowLoader } from './row.jsx';
import { BuySellTable } from './buy-sell-table.jsx';

const BuySellTableContent = ({ is_buy, setSelectedAd }) => {
    const { list_item_limit } = React.useContext(Dp2pContext);
    const mounted = React.useRef(false);
    const item_offset = React.useRef(0);
    const [has_more_items_to_load, setHasMoreItemsToLoad] = React.useState(false);
    const [api_error_message, setApiErrorMessage] = React.useState('');
    const [is_loading, setIsLoading] = React.useState(true);
    const [items, setItems] = React.useState([]);

    React.useEffect(() => {
        mounted.current = true;
        loadMoreItems(item_offset.current, list_item_limit);
        return () => (mounted.current = false);
    }, []);

    React.useEffect(() => {
        setIsLoading(true);
        if (mounted.current) {
            loadMoreItems(item_offset.current, list_item_limit);
        }
    }, [is_buy]);

    const loadMoreItems = start_idx => {
        return new Promise(resolve => {
            requestWS({
                p2p_advert_list: 1,
                counterparty_type: is_buy ? 'buy' : 'sell',
                offset: start_idx,
                limit: list_item_limit,
            }).then(response => {
                if (mounted.current) {
                    if (!response.error) {
                        setHasMoreItemsToLoad(response.length >= list_item_limit);
                        setItems(items.concat(response));
                        item_offset.current += response.length;
                    } else {
                        setApiErrorMessage(response.error.message);
                    }
                    setIsLoading(false);
                    resolve();
                }
            });
        });
    };

    if (is_loading) {
        return <Loading is_fullscreen={false} />;
    }
    if (api_error_message) {
        return <TableError message={api_error_message} />;
    }

    const Row = props => <RowComponent {...props} is_buy={is_buy} setSelectedAd={setSelectedAd} />;

    if (items.length) {
        const item_height = 56;
        const height_values = {
            screen_size: '100vh',
            header_size: '48px',
            page_overlay_header: '53px',
            page_overlay_content_padding: '2.4rem',
            tabs_height: '36px',
            filter_height: '44px',
            filter_margin_padding: '4rem', // 2.4rem + 1.6rem
            table_header_height: '50px',
            footer_size: '37px',
        };
        return (
            <BuySellTable>
                <InfiniteLoaderList
                    autosizer_height={`calc(${Object.values(height_values).join(' - ')})`}
                    items={items}
                    item_size={item_height}
                    RenderComponent={Row}
                    RowLoader={BuySellRowLoader}
                    has_more_items_to_load={has_more_items_to_load}
                    loadMore={loadMoreItems}
                />
            </BuySellTable>
        );
    }

    return (
        <div className='p2p-cashier__empty'>
            <Icon icon='IcCashierNoAds' className='p2p-cashier__empty-icon' size={128} />
            <div className='p2p-cashier__empty-title'>
                <Localize i18n_default_text='No ads found' />
            </div>
        </div>
    );
};

BuySellTableContent.propTypes = {
    is_buy: PropTypes.bool,
    setSelectedAd: PropTypes.func,
};

export default BuySellTableContent;
