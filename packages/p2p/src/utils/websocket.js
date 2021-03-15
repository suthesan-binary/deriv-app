import CurrencyUtils from '@deriv/shared/utils/currency';
import ObjectUtils from '@deriv/shared/utils/object';
import { localize } from 'Components/i18next';
import { convertToMillis, getFormattedDateString } from 'Utils/date-time';

let ws, transaction_currency_decimals;

const initial_responses = {};

export const init = (websocket, local_currency_decimal_places) => {
    ws = websocket;
    transaction_currency_decimals = local_currency_decimal_places;
};

const setCurrenciesConfig = website_status_response => {
    if ('website_status' in website_status_response && ObjectUtils.isEmptyObject(CurrencyUtils.currencies_config)) {
        CurrencyUtils.setCurrencies(website_status_response.website_status);
    }
};

const formatMoney = (currency, amount) => CurrencyUtils.formatMoney(currency, amount, true);

const populateInitialResponses = async () => {
    if (ObjectUtils.isEmptyObject(initial_responses)) {
        initial_responses.website_status = await ws.send({ website_status: 1 });
        setCurrenciesConfig(initial_responses.website_status);
    }
};

const map_payment_method = {
    bank_transfer: localize('Bank transfer'),
};

const getModifiedP2PAdvertList = (response, is_original) => {
    // only show active adverts
    const filtered_list = response.list.filter(offer => !!+offer.is_active);

    const length = filtered_list.length;
    const modified_response = [];
    for (let i = 0; i < length; i++) {
        const offer_currency = filtered_list[i].account_currency;
        const transaction_currency = filtered_list[i].local_currency;

        const offer_currency_decimals = ObjectUtils.getPropertyValue(initial_responses, [
            'website_status',
            'website_status',
            'currencies_config',
            offer_currency,
            'fractional_digits',
        ]);

        const available_amount = +filtered_list[i].remaining_amount;
        const offer_amount = +filtered_list[i].amount;
        const min_transaction = +filtered_list[i].min_order_amount; // for advertiser usage in offer creation/update
        const max_transaction = +filtered_list[i].max_order_amount; // for advertiser usage in offer creation/update
        const min_available = +filtered_list[i].min_order_amount_limit; // for client usage in order creation
        const max_available = +filtered_list[i].max_order_amount_limit; // for client usage in order creation
        const price_rate = +filtered_list[i].rate;
        const payment_method = filtered_list[i].payment_method;

        modified_response[i] = {
            available_amount,
            contact_info: filtered_list[i].contact_info,
            min_available,
            max_available,
            max_transaction,
            min_transaction,
            offer_amount,
            offer_currency,
            offer_currency_decimals,
            payment_info: filtered_list[i].payment_info,
            payment_method,
            price_rate,
            transaction_currency,
            transaction_currency_decimals,
            advertiser_name: ObjectUtils.getPropertyValue(filtered_list[i], ['advertiser_details', 'name']),
            advertiser_id: ObjectUtils.getPropertyValue(filtered_list[i], ['advertiser_details', 'id']),
            advertiser_instructions: filtered_list[i].description,
            display_available_amount: formatMoney(offer_currency, available_amount),
            display_max_available: formatMoney(offer_currency, max_available), // for displaying limit fields in buy/sell and ads table
            display_min_available: formatMoney(offer_currency, min_available), // for displaying limit fields in buy/sell and ads table
            display_max_order_amount: formatMoney(offer_currency, max_transaction),
            display_min_order_amount: formatMoney(offer_currency, min_transaction),
            display_offer_amount: formatMoney(offer_currency, offer_amount),
            display_payment_method: map_payment_method[payment_method] || payment_method,
            display_price_rate: formatMoney(transaction_currency, price_rate),
            id: filtered_list[i].id,
            // for view in my ads tab (advertiser perspective), we should show the original type of the ad
            // for view in buy/sell table (client perspective), we should show the counter-party type
            type: is_original ? filtered_list[i].type : filtered_list[i].counterparty_type,
        };
    }
    return modified_response;
};

const getModifiedP2POrder = response => {
    const { chat_channel_url, contact_info, is_incoming, payment_info } = response;
    const offer_currency = response.account_currency;
    const transaction_currency = response.local_currency;

    const offer_amount = +response.amount;
    const price_rate = +response.rate;
    const transaction_amount = +response.price;
    const payment_method = map_payment_method.bank_transfer; // TODO: [p2p-replace-with-api] add payment method to order details once API has it
    // const payment_method = response.payment_method;

    return {
        contact_info,
        offer_amount,
        offer_currency,
        payment_info,
        price_rate,
        transaction_amount,
        transaction_currency,
        chat_channel_url,
        advertiser_id: ObjectUtils.getPropertyValue(response, ['advertiser_details', 'id']),
        advertiser_name: ObjectUtils.getPropertyValue(response, ['advertiser_details', 'name']),
        advertiser_instructions: ObjectUtils.getPropertyValue(response, ['advert_details', 'description']),
        display_offer_amount: formatMoney(offer_currency, offer_amount),
        display_payment_method: map_payment_method[payment_method] || payment_method,
        display_price_rate: formatMoney(offer_currency, price_rate),
        display_transaction_amount: formatMoney(transaction_currency, transaction_amount),
        order_expiry_millis: convertToMillis(response.expiry_time),
        id: response.id,
        is_incoming: !!is_incoming,
        order_purchase_datetime: getFormattedDateString(new Date(convertToMillis(response.created_time))),
        status: response.status,
        type: response.is_incoming ? ObjectUtils.getPropertyValue(response, ['advert_details', 'type']) : response.type,
    };
};

export const getModifiedP2POrderList = response => {
    const modified_response = [];
    response.forEach((list_item, idx) => {
        modified_response[idx] = getModifiedP2POrder(list_item);
    });

    return modified_response;
};

export const requestWS = async request => {
    await populateInitialResponses();

    const response = await ws.send(request);

    return getModifiedResponse(response);
};

const getModifiedResponse = response => {
    let modified_response = response;

    if (response.p2p_advert_list || response.p2p_advertiser_adverts) {
        modified_response = getModifiedP2PAdvertList(
            response.p2p_advert_list || response.p2p_advertiser_adverts,
            response.p2p_advertiser_adverts
        );
    } else if (response.p2p_order_info) {
        modified_response = getModifiedP2POrder(response.p2p_order_info);
    }

    return modified_response;
};

export const subscribeWS = (request, callbacks) =>
    ws.p2pSubscribe(request, response => {
        callbacks.map(callback => callback(getModifiedResponse(response)));
    });
