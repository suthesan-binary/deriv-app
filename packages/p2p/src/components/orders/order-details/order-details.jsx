import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@deriv/components';
import { localize } from 'Components/i18next';
import Dp2pContext from 'Components/context/dp2p-context';
import { chatCreate } from 'Utils/sendbird';
import OrderDetailsStatusBlock from './order-details-status-block.jsx';
import OrderInfoBlock from './order-info-block.jsx';
import OrderDetailsAmountBlock from './order-details-amount-block.jsx';
import OrderDetailsChatbox from './order-details-chatbox.jsx';
import OrderDetailsTimerBlock from './order-details-timer-block.jsx';
import OrderActionsBlock from './order-actions-block.jsx';
import OrderDetailsResultMessage from './order-details-result-message.jsx';
import Popup from '../popup.jsx';

import './order-details.scss';

const OrderDetails = ({ order_details, chat_info }) => {
    const {
        advertiser_id,
        advertiser_name,
        advertiser_instructions,
        chat_channel_url,
        contact_info,
        display_offer_amount,
        display_price_rate,
        display_transaction_amount,
        is_buyer,
        is_expired,
        is_completed,
        is_buyer_cancelled,
        offer_currency,
        id,
        order_purchase_datetime,
        payment_info,
        transaction_currency,
    } = order_details;
    const [channel_url, setChannelUrl] = React.useState(chat_channel_url);
    const [show_popup, setShowPopup] = React.useState(false);
    const [popup_options, setPopupOptions] = React.useState({});
    const { advertiser_id: ad_advertiser_id } = React.useContext(Dp2pContext);
    const is_my_ad = advertiser_id === ad_advertiser_id;
    const onCancelClick = () => setShowPopup(false);
    const handleShowPopup = options => {
        setPopupOptions(options);
        setShowPopup(true);
    };
    React.useEffect(() => {
        if (!channel_url) {
            chatCreate(id).then(val => {
                setChannelUrl(val.channel_url);
            });
        }
    }, []);

    return (
        <div className='order-details'>
            <div className='order-details__container'>
                <div className='order-details__wrapper'>
                    <div className='order-details__wrapper--inner'>
                        <div className='order-details__header'>
                            <span>
                                <OrderDetailsStatusBlock order_details={order_details} />
                                <OrderDetailsResultMessage order_details={order_details} />
                                {!is_expired && !is_completed && !is_buyer_cancelled && (
                                    <React.Fragment>
                                        <OrderDetailsAmountBlock order_details={order_details} />
                                        <h1 className='order-details__header-method'>
                                            {order_details.display_payment_method}
                                        </h1>
                                    </React.Fragment>
                                )}
                            </span>
                            <OrderDetailsTimerBlock order_details={order_details} />
                        </div>
                        <div className='order-details__separator' />
                        <div className='order-details__info'>
                            <div className='order-details__info-columns'>
                                <div className='order-details__info--left'>
                                    <OrderInfoBlock
                                        label={is_buyer ? localize('Seller') : localize('Buyer')}
                                        // TODO: Once we have access to other party's information we can update below.
                                        value={is_my_ad ? '-' : advertiser_name}
                                    />
                                </div>
                                <div className='order-details__info--right'>
                                    <OrderInfoBlock
                                        label={localize('Rate (1 {{offer_currency}})', { offer_currency })}
                                        value={`${display_price_rate} ${transaction_currency}`}
                                    />
                                </div>
                            </div>
                            {is_buyer && (
                                <React.Fragment>
                                    <OrderInfoBlock
                                        label={localize('Seller payment instructions')}
                                        value={payment_info || '-'}
                                    />
                                    <OrderInfoBlock
                                        label={localize('Seller contact details')}
                                        value={contact_info || '-'}
                                    />
                                </React.Fragment>
                            )}
                            {!is_my_ad && (
                                <OrderInfoBlock
                                    label={is_buyer ? localize('Seller instructions') : localize('Buyer instructions')}
                                    value={advertiser_instructions || '-'}
                                />
                            )}
                            <div className='order-details__info-columns'>
                                <div className='order-details__info--left'>
                                    <OrderInfoBlock
                                        label={is_buyer ? localize('Send') : localize('Receive')}
                                        value={`${display_transaction_amount} ${transaction_currency}`}
                                    />
                                    <OrderInfoBlock label={localize('Order ID')} value={id} />
                                </div>
                                <div className='order-details__info--right'>
                                    <OrderInfoBlock
                                        label={is_buyer ? localize('Receive') : localize('Send')}
                                        value={`${display_offer_amount} ${offer_currency}`}
                                    />
                                    <OrderInfoBlock label={localize('Time')} value={order_purchase_datetime} />
                                </div>
                            </div>
                        </div>
                        <div className='order-details__footer'>
                            <OrderActionsBlock
                                cancelPopup={onCancelClick}
                                showPopup={handleShowPopup}
                                order_details={order_details}
                            />
                        </div>
                    </div>
                </div>
                {channel_url && (
                    <OrderDetailsChatbox {...chat_info} channel_url={channel_url} nickname={advertiser_name} />
                )}
                {show_popup && (
                    <div className='orders__dialog'>
                        <Dialog is_visible={show_popup}>
                            <Popup {...popup_options} onCancel={onCancelClick} />
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    );
};

OrderDetails.propTypes = {
    order_details: PropTypes.object,
};

export default OrderDetails;
