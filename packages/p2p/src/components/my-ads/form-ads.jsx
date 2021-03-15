import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { Dropdown, Loading, Icon, Input, Button, ThemedScrollbars } from '@deriv/components';
import CurrencyUtils from '@deriv/shared/utils/currency';
import Dp2pContext from 'Components/context/dp2p-context';
import FooterActions from 'Components/footer-actions/footer-actions.jsx';
import { localize } from 'Components/i18next';
import PageReturn from 'Components/page-return/page-return.jsx';
import { countDecimalPlaces } from 'Utils/string';
import { textValidator, lengthValidator } from 'Utils/validations';
import { requestWS } from 'Utils/websocket';
import AdSummary from './my-ads-summary.jsx';

class FormAds extends React.Component {
    state = {
        error_message: '',
        is_loading: true,
    };

    async componentDidMount() {
        this.setState({
            is_loading: false,
        });
    }

    handleSubmit = (values, { setSubmitting }) => {
        this.setState({ error_message: '' });

        const request_payload = {
            p2p_advert_create: 1,
            type: values.type,
            amount: values.offer_amount,
            max_order_amount: values.max_transaction,
            min_order_amount: values.min_transaction,
            payment_method: 'bank_transfer', // TODO: Allow for other types of payment_method.
            rate: values.price_rate,
        };
        if (values.contact_info) {
            request_payload.contact_info = values.contact_info;
        }
        if (values.payment_info) {
            request_payload.payment_info = values.payment_info;
        }
        if (values.default_advert_description) {
            request_payload.description = values.default_advert_description;
        }
        requestWS(request_payload).then(response => {
            // If we get an error we should let the user submit the form again else we just go back to the list of ads
            if (response.error) {
                this.setState({ error_message: response.error.message });
                setSubmitting(false);
            } else {
                this.props.handleShowForm(false);
            }
        });
    };

    restrictLength = (e, handleChange) => {
        // typing more than 15 characters will break the layout
        // max doesn't disable typing, so we will use this to restrict length
        const max_characters = 15;
        if (e.target.value.length > max_characters) {
            e.target.value = e.target.value.slice(0, max_characters);
            return;
        }
        handleChange(e);
    };

    render() {
        return (
            <>
                <PageReturn onClick={() => this.props.handleShowForm(false)} page_title={localize('Create new ad')} />
                {this.state.is_loading ? (
                    <Loading is_fullscreen={false} />
                ) : (
                    <Formik
                        initialValues={{
                            contact_info: '',
                            default_advert_description: '',
                            max_transaction: '',
                            min_transaction: '',
                            offer_amount: '',
                            payment_info: '',
                            // payment_method: 'bank_transfer',
                            price_rate: '',
                            type: 'buy',
                        }}
                        onSubmit={this.handleSubmit}
                        validate={this.validateFormAds}
                    >
                        {({ isSubmitting, errors, handleChange, touched, isValid, values }) => {
                            const is_sell_ad = values.type === 'sell';
                            return (
                                <div className='p2p-my-ads__form'>
                                    <Form noValidate>
                                        <ThemedScrollbars className='p2p-my-ads__form-scrollbar' height='440px'>
                                            <p className='p2p-my-ads__form-summary'>
                                                <AdSummary
                                                    offer_amount={errors.offer_amount ? '' : values.offer_amount}
                                                    offer_currency={this.context.currency}
                                                    transaction_currency={this.context.local_currency_config.currency}
                                                    price_rate={errors.price_rate ? '' : values.price_rate}
                                                    type={values.type}
                                                />
                                            </p>
                                            <div className='p2p-my-ads__form-container'>
                                                <Field name='type'>
                                                    {({ field }) => (
                                                        <Dropdown
                                                            {...field}
                                                            placeholder={localize('Type')}
                                                            is_align_text_left
                                                            className='p2p-my-ads__form-field'
                                                            list={[
                                                                { text: 'Buy', value: 'buy' },
                                                                { text: 'Sell', value: 'sell' },
                                                            ]}
                                                            error={touched.type && errors.type}
                                                        />
                                                    )}
                                                </Field>
                                                <Field name='offer_amount'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            data-lpignore='true'
                                                            type='text'
                                                            error={touched.offer_amount && errors.offer_amount}
                                                            label={localize('Total amount')}
                                                            className='p2p-my-ads__form-field'
                                                            trailing_icon={
                                                                <span className='p2p-my-ads__form-field--trailing'>
                                                                    {this.context.currency}
                                                                </span>
                                                            }
                                                            onChange={e => {
                                                                this.restrictLength(e, handleChange);
                                                            }}
                                                            required
                                                        />
                                                    )}
                                                </Field>
                                            </div>
                                            <div className='p2p-my-ads__form-container'>
                                                {/* <Field name='payment_method'>
                                                    {({ field }) => (
                                                        <Dropdown
                                                            {...field}
                                                            placeholder={localize('Payment method')}
                                                            is_align_text_left
                                                            className='p2p-my-ads__form-field'
                                                            list={[{ text: 'Bank transfer', value: 'bank_transfer' }]}
                                                            error={touched.payment_method && errors.payment_method}
                                                        />
                                                    )}
                                                </Field> */}
                                                <Field name='price_rate'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            data-lpignore='true'
                                                            type='text'
                                                            error={touched.price_rate && errors.price_rate}
                                                            label={localize('Fixed price')}
                                                            hint={localize('Per 1 {{currency}}', {
                                                                currency: this.context.currency,
                                                            })}
                                                            className='p2p-my-ads__form-field'
                                                            trailing_icon={
                                                                <span className='p2p-my-ads__form-field--trailing'>
                                                                    {this.context.local_currency_config.currency}
                                                                </span>
                                                            }
                                                            onChange={e => {
                                                                this.restrictLength(e, handleChange);
                                                            }}
                                                            required
                                                        />
                                                    )}
                                                </Field>
                                                <Field name='min_transaction'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            data-lpignore='true'
                                                            type='text'
                                                            error={touched.min_transaction && errors.min_transaction}
                                                            label={localize('Min order')}
                                                            className='p2p-my-ads__form-field'
                                                            trailing_icon={
                                                                <span className='p2p-my-ads__form-field--trailing'>
                                                                    {this.context.currency}
                                                                </span>
                                                            }
                                                            onChange={e => {
                                                                this.restrictLength(e, handleChange);
                                                            }}
                                                            required
                                                        />
                                                    )}
                                                </Field>
                                                <Field name='max_transaction'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            type='text'
                                                            error={touched.max_transaction && errors.max_transaction}
                                                            label={localize('Max order')}
                                                            className='p2p-my-ads__form-field'
                                                            trailing_icon={
                                                                <span className='p2p-my-ads__form-field--trailing'>
                                                                    {this.context.currency}
                                                                </span>
                                                            }
                                                            onChange={e => {
                                                                this.restrictLength(e, handleChange);
                                                            }}
                                                            required
                                                        />
                                                    )}
                                                </Field>
                                            </div>
                                            {is_sell_ad && (
                                                <Field name='payment_info'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            data-lpignore='true'
                                                            type='textarea'
                                                            error={touched.payment_info && errors.payment_info}
                                                            hint={localize(
                                                                'Bank name, account number, beneficiary name'
                                                            )}
                                                            className='p2p-my-ads__form-field p2p-my-ads__form-field--textarea'
                                                            placeholder={localize('Payment instructions')}
                                                            required
                                                            has_character_counter
                                                            max_characters={300}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                            {is_sell_ad && (
                                                <Field name='contact_info'>
                                                    {({ field }) => (
                                                        <Input
                                                            {...field}
                                                            data-lpignore='true'
                                                            type='textarea'
                                                            error={touched.contact_info && errors.contact_info}
                                                            className='p2p-my-ads__form-field p2p-my-ads__form-field--textarea'
                                                            placeholder={localize('Contact details')}
                                                            required
                                                            has_character_counter
                                                            max_characters={300}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                            <Field name='default_advert_description'>
                                                {({ field }) => (
                                                    <Input
                                                        {...field}
                                                        data-lpignore='true'
                                                        type='textarea'
                                                        error={
                                                            touched.default_advert_description &&
                                                            errors.default_advert_description
                                                        }
                                                        hint={localize('This information will be visible to everyone')}
                                                        className='p2p-my-ads__form-field p2p-my-ads__form-field--textarea'
                                                        placeholder={localize('Instructions (optional)')}
                                                        has_character_counter
                                                        max_characters={300}
                                                        required
                                                    />
                                                )}
                                            </Field>
                                        </ThemedScrollbars>
                                        <FooterActions has_border>
                                            {this.state.error_message && (
                                                <div className='p2p-my-ads__form-error'>
                                                    <Icon icon='IcAlertDanger' />
                                                    <p>{this.state.error_message}</p>
                                                </div>
                                            )}
                                            <Button
                                                className='p2p-my-ads__form-button'
                                                secondary
                                                large
                                                onClick={() => this.props.handleShowForm(false)}
                                            >
                                                {localize('Cancel')}
                                            </Button>
                                            <Button
                                                className='p2p-my-ads__form-button'
                                                primary
                                                large
                                                is_disabled={isSubmitting || !isValid}
                                            >
                                                {localize('Post ad')}
                                            </Button>
                                        </FooterActions>
                                    </Form>
                                </div>
                            );
                        }}
                    </Formik>
                )}
            </>
        );
    }

    validateFormAds = values => {
        // TODO: uncomment this when we have available_price
        // const available_price = ;
        const validations = {
            default_advert_description: [v => !v || lengthValidator(v), v => !v || textValidator(v)],
            max_transaction: [
                v => !!v,
                v => !isNaN(v),
                v => v > 0 && countDecimalPlaces(v) <= CurrencyUtils.getDecimalPlaces(this.context.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.min_transaction ? +v >= values.min_transaction : true),
            ],
            min_transaction: [
                v => !!v,
                v => !isNaN(v),
                v => v > 0 && countDecimalPlaces(v) <= CurrencyUtils.getDecimalPlaces(this.context.currency),
                v => (values.offer_amount ? +v <= values.offer_amount : true),
                v => (values.max_transaction ? +v <= values.max_transaction : true),
            ],
            offer_amount: [
                v => !!v,
                // TODO: uncomment this when we have available_price
                // v => v > available_price,
                // TODO: remove v > 0 check when we have available_price
                v => !isNaN(v),
                v => v > 0 && countDecimalPlaces(v) <= CurrencyUtils.getDecimalPlaces(this.context.currency),
                v => (values.min_transaction ? +v >= values.min_transaction : true),
                v => (values.max_transaction ? +v >= values.max_transaction : true),
            ],
            price_rate: [
                v => !!v,
                v => !isNaN(v),
                v => v > 0 && countDecimalPlaces(v) <= this.context.local_currency_config.decimal_places,
            ],
        };

        if (values.type === 'sell') {
            validations.contact_info = [v => !!v, v => textValidator(v), v => lengthValidator(v)];
            validations.payment_info = [v => !!v, v => textValidator(v), v => lengthValidator(v)];
        }

        const mapped_key = {
            contact_info: localize('Contact details'),
            default_advert_description: localize('Instructions'),
            max_transaction: localize('Max limit'),
            min_transaction: localize('Min limit'),
            offer_amount: localize('Amount'),
            payment_info: localize('Payment instructions'),
            price_rate: localize('Fixed price'),
        };

        const common_messages = field_name => [localize('{{field_name}} is required', { field_name })];

        const contact_info_messages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
            localize('{{field_name}} has exceeded maximum length', { field_name }),
        ];

        const default_advert_description_messages = field_name => [
            localize('{{field_name}} has exceeded maximum length', { field_name }),
            localize(
                "{{field_name}} can only include letters, numbers, spaces, and any of these symbols: -+.,'#@():;",
                { field_name }
            ),
        ];

        const amount_messages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            // TODO: uncomment this when we have available_price
            // localize('Min is {{value}}', { value: available_price }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not be below Min limit', { field_name }),
            localize('{{field_name}} should not be below Max limit', { field_name }),
        ];

        const max_limit_messages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not be below Min limit', { field_name }),
        ];

        const min_limit_messages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
            localize('{{field_name}} should not exceed Amount', { field_name }),
            localize('{{field_name}} should not exceed Max limit', { field_name }),
        ];

        const price_rate_messages = field_name => [
            localize('{{field_name}} is required', { field_name }),
            localize('Enter a valid amount'),
            localize('Enter a valid amount'),
        ];

        const errors = {};

        Object.entries(validations).forEach(([key, rules]) => {
            const error_index = rules.findIndex(v => !v(values[key]));
            if (error_index !== -1) {
                switch (key) {
                    case 'contact_info':
                    case 'payment_info':
                        errors[key] = contact_info_messages(mapped_key[key])[error_index];
                        break;
                    case 'default_advert_description':
                        errors[key] = default_advert_description_messages(mapped_key[key])[error_index];
                        break;
                    case 'offer_amount':
                        errors[key] = amount_messages(mapped_key[key])[error_index];
                        break;
                    case 'max_transaction':
                        errors[key] = max_limit_messages(mapped_key[key])[error_index];
                        break;
                    case 'min_transaction':
                        errors[key] = min_limit_messages(mapped_key[key])[error_index];
                        break;
                    case 'price_rate':
                        errors[key] = price_rate_messages(mapped_key[key])[error_index];
                        break;
                    default:
                        errors[key] = common_messages(mapped_key[key])[error_index];
                }
            }
        });

        return errors;
    };
}

FormAds.propTypes = {
    handleShowForm: PropTypes.func,
};

FormAds.contextType = Dp2pContext;

export default FormAds;
