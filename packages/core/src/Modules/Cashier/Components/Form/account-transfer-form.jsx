import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Button, Dropdown, Icon, Input, Money, DesktopWrapper, MobileWrapper, SelectNative } from '@deriv/components';
import { Field, Formik, Form } from 'formik';
import CurrencyUtils from '@deriv/shared/utils/currency';
import { localize, Localize } from '@deriv/translations';
import { website_name } from 'App/Constants/app-config';
import { connect } from 'Stores/connect';
import { getPreBuildDVRs, validNumber } from 'Utils/Validator/declarative-validation-rules';
import Loading from '../../../../templates/_common/components/loading.jsx';

const AccountOption = ({ account, idx }) => (
    <React.Fragment key={idx}>
        {(account.currency || account.mt_icon) && (
            <Icon
                icon={account.mt_icon ? `IcMt5-${account.mt_icon}` : `IcCurrency-${account.currency.toLowerCase()}`}
                className='account-transfer__currency-icon'
            />
        )}
        <span className='account-transfer__currency'>{account.text}</span>
        <span className='account-transfer__balance cashier__drop-down-display-brackets'>
            <Money amount={account.balance} currency={account.currency} />
        </span>
    </React.Fragment>
);

const AccountTransferBullet = ({ children }) => (
    <div className='account-transfer__bullet-wrapper'>
        <div className='account-transfer__bullet' />
        <span>{children}</span>
    </div>
);

const AccountTransferNote = ({
    currency,
    transfer_fee,
    minimum_fee,
    internal_total_transfers,
    mt5_total_transfers,
}) => (
    <div className='account-transfer__notes'>
        <AccountTransferBullet>
            <Localize
                i18n_default_text='Daily transfer limits: up to {{number_deriv}} times for Deriv accounts, and up to {{number_dmt5}} times for DMT5 accounts.'
                values={{
                    number_deriv: internal_total_transfers,
                    number_dmt5: mt5_total_transfers,
                }}
            />
        </AccountTransferBullet>
        <AccountTransferBullet>
            <Localize i18n_default_text='Transfer limits may vary depending on the exchange rates.' />
        </AccountTransferBullet>
        <AccountTransferBullet>
            <Localize
                i18n_default_text='We’ll charge a {{transfer_fee}}% transfer fee, or {{minimum_fee}} {{currency}}, whichever is higher.'
                values={{
                    transfer_fee,
                    minimum_fee,
                    currency: CurrencyUtils.getCurrencyDisplayCode(currency),
                }}
            />
        </AccountTransferBullet>
        <AccountTransferBullet>
            <Localize
                i18n_default_text='You may transfer between your fiat and cryptocurrency accounts or between your {{website_name}} and DMT5 accounts.'
                values={{ website_name }}
            />
        </AccountTransferBullet>
        <AccountTransferBullet>
            <Localize i18n_default_text='Transfers may be unavailable when the exchange markets are closed, when there is high volatility, or when there are technical issues.' />
        </AccountTransferBullet>
    </div>
);

class AccountTransferForm extends React.Component {
    componentDidMount() {
        this.props.onMount();
    }

    validateAmount = amount => {
        let error;

        if (!amount) {
            error = localize('This field is required.');
        } else if (
            !validNumber(amount, {
                type: 'float',
                decimals: CurrencyUtils.getDecimalPlaces(this.props.selected_from.currency),
                min: this.props.transfer_limit.min,
                max: this.props.transfer_limit.max,
            })
        ) {
            error = getPreBuildDVRs().number.message;
        } else if (+this.props.selected_from.balance < +amount) {
            error = localize('Insufficient balance.');
        }

        return error;
    };

    onTransferPassthrough = async (values, actions) => {
        const transfer_between_accounts = await this.props.requestTransferBetweenAccounts({
            amount: +values.amount,
        });
        if (transfer_between_accounts?.error) {
            actions.setSubmitting(false);
        }
    };

    render() {
        const accounts_from = [];
        const mt_accounts_from = [];
        const accounts_to = [];
        const mt_accounts_to = [];

        this.props.accounts_list.forEach((account, idx) => {
            const text = <AccountOption idx={idx} account={account} />;
            const value = account.value;
            (account.is_mt ? mt_accounts_from : accounts_from).push({
                text,
                value,
                nativepicker_text: `${account.text} (${account.currency} ${account.balance})`,
            });
            const is_selected_from = account.value === this.props.selected_from.value;
            // account from and to cannot be the same
            if (!is_selected_from) {
                const is_selected_from_mt = this.props.selected_from.is_mt && account.is_mt;
                const is_selected_from_crypto = this.props.selected_from.is_crypto && account.is_crypto;
                // cannot transfer to MT account from MT
                // cannot transfer to crypto account from crypto
                const is_disabled = is_selected_from_mt || is_selected_from_crypto;
                (account.is_mt ? mt_accounts_to : accounts_to).push({
                    text,
                    value,
                    disabled: is_disabled,
                    nativepicker_text: `${account.text} (${account.currency} ${account.balance})`,
                });
            }
        });

        const from_accounts = {
            ...(mt_accounts_from.length && { [localize('DMT5 accounts')]: mt_accounts_from }),
            ...(accounts_from.length && { [localize('Deriv accounts')]: accounts_from }),
        };

        const to_accounts = {
            ...(mt_accounts_to.length && { [localize('DMT5 accounts')]: mt_accounts_to }),
            ...(accounts_to.length && { [localize('Deriv accounts')]: accounts_to }),
        };

        const { daily_transfers } = this.props.account_limits;
        const mt5_remaining_transfers = daily_transfers?.mt5?.available;
        const internal_remaining_transfers = daily_transfers?.internal?.available;
        const mt5_total_transfers = daily_transfers?.mt5?.allowed;
        const internal_total_transfers = daily_transfers?.internal?.allowed;

        const is_mt_transfer = this.props.selected_to.is_mt || this.props.selected_from.is_mt;
        const remaining_transfers = is_mt_transfer ? mt5_remaining_transfers : internal_remaining_transfers;

        const transfer_to_hint =
            +remaining_transfers === 1
                ? localize('You have {{number}} transfer remaining for today.', { number: remaining_transfers })
                : localize('You have {{number}} transfers remaining for today.', { number: remaining_transfers });

        return (
            <div className='cashier__wrapper cashier__wrapper--align-left'>
                <React.Fragment>
                    <h2 className='cashier__header cashier__content-header'>
                        {localize('Transfer between your accounts in Deriv')}
                    </h2>
                    <Formik
                        initialValues={{
                            amount: '',
                        }}
                        onSubmit={this.onTransferPassthrough}
                    >
                        {({ errors, isSubmitting, isValid, touched, validateField, handleChange }) => (
                            <React.Fragment>
                                {isSubmitting ? (
                                    <div className='cashier__loader-wrapper'>
                                        <Loading className='cashier__loader' />
                                    </div>
                                ) : (
                                    <Form>
                                        <div className='cashier__drop-down-wrapper'>
                                            <DesktopWrapper>
                                                <Dropdown
                                                    id='transfer_from'
                                                    className='cashier__drop-down account-transfer__drop-down'
                                                    classNameDisplay='cashier__drop-down-display'
                                                    classNameDisplaySpan='cashier__drop-down-display-span'
                                                    classNameItems='cashier__drop-down-items'
                                                    classNameLabel='cashier__drop-down-label'
                                                    is_large
                                                    label={localize('From')}
                                                    list={from_accounts}
                                                    name='transfer_from'
                                                    value={this.props.selected_from.value}
                                                    onChange={e => {
                                                        this.props.onChangeTransferFrom(e);
                                                        handleChange(e);
                                                        validateField('amount');
                                                    }}
                                                />
                                            </DesktopWrapper>
                                            <MobileWrapper>
                                                <SelectNative
                                                    placeholder={localize('Please select')}
                                                    className='account-transfer__transfer-from'
                                                    classNameDisplay='cashier__drop-down-display'
                                                    label={localize('From')}
                                                    value={this.props.selected_from.value}
                                                    list_items={from_accounts}
                                                    onChange={e => {
                                                        this.props.onChangeTransferFrom(e);
                                                        handleChange(e);
                                                        validateField('amount');
                                                    }}
                                                />
                                            </MobileWrapper>
                                            <DesktopWrapper>
                                                <Icon
                                                    className='cashier__transferred-icon account-transfer__transfer-icon'
                                                    icon='IcArrowLeftBold'
                                                />
                                            </DesktopWrapper>
                                            <DesktopWrapper>
                                                <Dropdown
                                                    id='transfer_to'
                                                    className='cashier__drop-down account-transfer__drop-down'
                                                    classNameDisplay='cashier__drop-down-display'
                                                    classNameDisplaySpan='cashier__drop-down-display-span'
                                                    classNameItems='cashier__drop-down-items'
                                                    classNameLabel='cashier__drop-down-label'
                                                    is_large
                                                    label={localize('To')}
                                                    list={to_accounts}
                                                    name='transfer_to'
                                                    value={this.props.selected_to.value}
                                                    onChange={this.props.onChangeTransferTo}
                                                    hint={transfer_to_hint}
                                                />
                                            </DesktopWrapper>
                                            <MobileWrapper>
                                                <SelectNative
                                                    placeholder={localize('Please select')}
                                                    className='account-transfer__transfer-to'
                                                    classNameDisplay='cashier__drop-down-display'
                                                    label={localize('To')}
                                                    value={this.props.selected_to.value}
                                                    list_items={to_accounts}
                                                    onChange={this.props.onChangeTransferTo}
                                                    hint={transfer_to_hint}
                                                />
                                            </MobileWrapper>
                                        </div>
                                        <Field name='amount' validate={this.validateAmount}>
                                            {({ field }) => (
                                                <Input
                                                    {...field}
                                                    onChange={e => {
                                                        this.props.setErrorMessage('');
                                                        handleChange(e);
                                                    }}
                                                    className='cashier__input cashier__input--long dc-input--no-placeholder account-transfer__input'
                                                    type='text'
                                                    label={localize('Amount')}
                                                    error={touched.amount && errors.amount}
                                                    required
                                                    leading_icon={
                                                        this.props.selected_from.currency ? (
                                                            <span
                                                                className={classNames(
                                                                    'symbols',
                                                                    `symbols--${this.props.selected_from.currency.toLowerCase()}`
                                                                )}
                                                            />
                                                        ) : (
                                                            undefined
                                                        )
                                                    }
                                                    autoComplete='off'
                                                    maxLength='30'
                                                    hint={
                                                        this.props.transfer_limit.max && (
                                                            <Localize
                                                                i18n_default_text='Transfer limits: <0 /> - <1 />'
                                                                components={[
                                                                    <Money
                                                                        key={0}
                                                                        amount={this.props.transfer_limit.min}
                                                                        currency={this.props.selected_from.currency}
                                                                    />,
                                                                    <Money
                                                                        key={1}
                                                                        amount={this.props.transfer_limit.max}
                                                                        currency={this.props.selected_from.currency}
                                                                    />,
                                                                ]}
                                                            />
                                                        )
                                                    }
                                                />
                                            )}
                                        </Field>
                                        <div className='cashier__form-submit  cashier__form-submit--align-end'>
                                            {this.props.error.message && (
                                                <React.Fragment>
                                                    <DesktopWrapper>
                                                        <div className='cashier__form-error-wrapper'>
                                                            <Icon
                                                                icon='IcAlertDanger'
                                                                className='cashier__form-error-icon'
                                                                size={80}
                                                            />
                                                            <Icon
                                                                icon='IcAlertDanger'
                                                                className='cashier__form-error-small-icon'
                                                            />
                                                            <p className='cashier__form-error'>
                                                                {this.props.error.message}
                                                            </p>
                                                        </div>
                                                    </DesktopWrapper>
                                                    <MobileWrapper>
                                                        <div className='cashier__form-error-container'>
                                                            <Icon
                                                                icon='IcAlertDanger'
                                                                className='cashier__form-error-small-icon'
                                                            />
                                                            <p className='cashier__form-error'>
                                                                {this.props.error.message}
                                                            </p>
                                                        </div>
                                                    </MobileWrapper>
                                                </React.Fragment>
                                            )}
                                            <Button
                                                className='cashier__form-submit-button'
                                                type='submit'
                                                is_disabled={!isValid || isSubmitting || !+remaining_transfers}
                                                primary
                                                large
                                            >
                                                <Localize i18n_default_text='Transfer' />
                                            </Button>
                                        </div>
                                        <AccountTransferNote
                                            mt5_total_transfers={mt5_total_transfers}
                                            internal_total_transfers={internal_total_transfers}
                                            transfer_fee={this.props.transfer_fee}
                                            currency={this.props.selected_from.currency}
                                            minimum_fee={this.props.minimum_fee}
                                        />
                                    </Form>
                                )}
                            </React.Fragment>
                        )}
                    </Formik>
                </React.Fragment>
            </div>
        );
    }
}

AccountTransferForm.propTypes = {
    account_limits: PropTypes.object,
    accounts_list: PropTypes.array,
    error: PropTypes.object,
    minimum_fee: PropTypes.string,
    onChangeTransferFrom: PropTypes.func,
    onChangeTransferTo: PropTypes.func,
    onMount: PropTypes.func,
    requestTransferBetweenAccounts: PropTypes.func,
    selected_from: PropTypes.object,
    selected_to: PropTypes.object,
    setErrorMessage: PropTypes.func,
    transfer_fee: PropTypes.number,
    transfer_limit: PropTypes.object,
};

export default connect(({ client, modules }) => ({
    account_limits: client.account_limits,
    onMount: client.getLimits,
    accounts_list: modules.cashier.config.account_transfer.accounts_list,
    minimum_fee: modules.cashier.config.account_transfer.minimum_fee,
    onChangeTransferFrom: modules.cashier.onChangeTransferFrom,
    onChangeTransferTo: modules.cashier.onChangeTransferTo,
    requestTransferBetweenAccounts: modules.cashier.requestTransferBetweenAccounts,
    selected_from: modules.cashier.config.account_transfer.selected_from,
    selected_to: modules.cashier.config.account_transfer.selected_to,
    setErrorMessage: modules.cashier.setErrorMessage,
    transfer_fee: modules.cashier.config.account_transfer.transfer_fee,
    transfer_limit: modules.cashier.config.account_transfer.transfer_limit,
}))(AccountTransferForm);
