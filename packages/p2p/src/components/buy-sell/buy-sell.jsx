import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, ButtonToggle } from '@deriv/components';
import Dp2pContext from 'Components/context/dp2p-context';
import { localize } from 'Components/i18next';
import { requestWS } from 'Utils/websocket';
import Popup from './popup.jsx';
import BuySellTableContent from './buy-sell-table-content.jsx';
import Verification from '../verification/verification.jsx';
import PageReturn from '../page-return/page-return.jsx';
import './buy-sell.scss';

const buy_sell_filters = [
    {
        text: localize('Buy'),
        value: 'buy',
    },
    {
        text: localize('Sell'),
        value: 'sell',
    },
];

class BuySell extends React.Component {
    is_mounted = false;
    state = {
        table_type: 'buy',
        selected_ad: {},
        show_popup: false,
        show_verification: false,
    };

    componentWillMount() {
        this.is_mounted = true;

        if (!this.context.is_advertiser) {
            requestWS({ get_account_status: 1 }).then(response => {
                if (this.is_mounted && !response.error) {
                    const { get_account_status } = response;
                    const { authentication } = get_account_status;
                    const { identity } = authentication;

                    this.setState({
                        poi_status: identity.status,
                    });
                }
            });
        }
    }

    setSelectedAd = selected_ad => {
        if (!this.context.is_advertiser) {
            this.setState({ show_verification: true });
        } else {
            this.setState({ selected_ad, show_popup: true });
        }
    };

    onCancelClick = () => {
        this.setState({ show_popup: false });
    };

    onChangeTableType = event => {
        this.setState({ table_type: event.target.value });
    };

    onConfirmClick = order_info => {
        const nav = { location: 'buy_sell' };
        this.props.navigate('orders', { order_info, nav });
    };

    hideVerification = () => this.setState({ show_verification: false });

    render() {
        const { table_type, selected_ad, show_popup } = this.state;

        if (this.state.show_verification)
            return (
                <>
                    <PageReturn onClick={this.hideVerification} page_title={localize('Back')} />
                    <Verification poi_status={this.state.poi_status} />
                </>
            );

        return (
            <div className='buy-sell'>
                <div className='buy-sell__header'>
                    <ButtonToggle
                        buttons_arr={buy_sell_filters}
                        className='buy-sell__header__filters'
                        is_animated
                        name='filter'
                        onChange={this.onChangeTableType}
                        value={table_type}
                        has_rounded_button
                    />
                </div>
                <BuySellTableContent
                    key={table_type}
                    is_buy={table_type === 'buy'}
                    setSelectedAd={this.setSelectedAd}
                />
                {show_popup && (
                    <div className='buy-sell__dialog'>
                        <Dialog is_visible={show_popup}>
                            <Popup
                                ad={selected_ad}
                                handleClose={this.onCancelClick}
                                handleConfirm={this.onConfirmClick}
                            />
                        </Dialog>
                    </div>
                )}
            </div>
        );
    }
}

BuySell.propTypes = {
    navigate: PropTypes.func,
    params: PropTypes.object,
};

export default BuySell;

BuySell.contextType = Dp2pContext;
