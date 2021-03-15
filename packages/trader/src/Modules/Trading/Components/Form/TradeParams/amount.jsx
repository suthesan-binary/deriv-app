import classNames from 'classnames';
import { Dropdown, ButtonToggle } from '@deriv/components';
import { PropTypes as MobxPropTypes } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import CurrencyUtils from '@deriv/shared/utils/currency';
import Fieldset from 'App/Components/Form/fieldset.jsx';
import InputField from 'App/Components/Form/InputField';
import { connect } from 'Stores/connect';
import { localize } from '@deriv/translations';
import AllowEquals from './allow-equals.jsx';

const Amount = ({
    amount,
    basis,
    basis_list,
    contract_start_type,
    contract_type,
    contract_types_list,
    currencies_list,
    currency,
    duration_unit,
    expiry_type,
    is_equal,
    is_minimized,
    is_multiplier,
    is_nativepicker,
    is_single_currency,
    onChange,
    validation_errors,
}) => {
    if (is_minimized) {
        return (
            <div className='fieldset-minimized fieldset-minimized__amount'>
                <span className='fieldset-minimized__basis'>
                    {(basis_list.find(o => o.value === basis) || {}).text}
                </span>
                &nbsp;
                <i>
                    <span
                        className={classNames('fieldset-minimized__currency', 'symbols', {
                            [`symbols--${(currency || '').toLowerCase()}`]: currency,
                        })}
                    />
                </i>
                {CurrencyUtils.addComma(amount, 2)}
            </div>
        );
    }

    const error_messages = validation_errors.amount;

    const Input = () => (
        <InputField
            className='trade-container__amount'
            classNameInlinePrefix='trade-container__currency'
            classNameInput='trade-container__input'
            currency={currency}
            error_messages={error_messages}
            fractional_digits={CurrencyUtils.getDecimalPlaces(currency)}
            id='dt_amount_input'
            inline_prefix={is_single_currency ? currency : null}
            is_autocomplete_disabled
            is_float
            is_hj_whitelisted
            is_incrementable
            is_nativepicker={is_nativepicker}
            is_negative_disabled
            max_length={CurrencyUtils.AMOUNT_MAX_LENGTH}
            name='amount'
            onChange={onChange}
            type='tel'
            value={amount}
            ariaLabel={localize('Amount')}
        />
    );

    return (
        <Fieldset
            className='trade-container__fieldset center-text'
            header={is_multiplier ? localize('Stake') : undefined}
            header_tooltip={
                is_multiplier
                    ? localize(
                          'To ensure your loss does not exceed your stake, your contract will be closed automatically when your loss equals to {{amount}}.',
                          { amount }
                      )
                    : undefined
            }
        >
            {basis_list.length > 1 && (
                <ButtonToggle
                    id='dt_amount_toggle'
                    buttons_arr={basis_list}
                    className='dropdown--no-margin'
                    is_animated={true}
                    name='basis'
                    onChange={onChange}
                    value={basis}
                />
            )}
            {!is_single_currency ? (
                <div className='trade-container__currency-options'>
                    <Dropdown
                        id='amount'
                        className={classNames({ 'dc-dropdown-container__currency': !is_single_currency })}
                        has_symbol
                        is_alignment_left
                        is_nativepicker={false}
                        list={currencies_list}
                        name='currency'
                        no_border={true}
                        value={currency}
                        onChange={onChange}
                    />
                    <Input />
                </div>
            ) : (
                <Input />
            )}
            <AllowEquals
                contract_start_type={contract_start_type}
                contract_type={contract_type}
                contract_types_list={contract_types_list}
                duration_unit={duration_unit}
                expiry_type={expiry_type}
                onChange={onChange}
                value={parseInt(is_equal)}
            />
        </Fieldset>
    );
};

Amount.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    basis: PropTypes.string,
    basis_list: MobxPropTypes.arrayOrObservableArray,
    contract_start_type: PropTypes.string,
    contract_type: PropTypes.string,
    contract_types_list: MobxPropTypes.observableObject,
    currencies_list: MobxPropTypes.observableObject,
    currency: PropTypes.string,
    duration_unit: PropTypes.string,
    expiry_type: PropTypes.string,
    is_equal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    is_minimized: PropTypes.bool,
    is_multiplier: PropTypes.bool,
    is_nativepicker: PropTypes.bool,
    is_single_currency: PropTypes.bool,
    onChange: PropTypes.func,
    validation_errors: PropTypes.object,
};

export default connect(({ modules, client }) => ({
    amount: modules.trade.amount,
    basis: modules.trade.basis,
    basis_list: modules.trade.basis_list,
    contract_start_type: modules.trade.contract_start_type,
    contract_type: modules.trade.contract_type,
    contract_types_list: modules.trade.contract_types_list,
    currencies_list: client.currencies_list,
    currency: modules.trade.currency,
    duration_unit: modules.trade.duration_unit,
    expiry_type: modules.trade.expiry_type,
    is_equal: modules.trade.is_equal,
    is_single_currency: client.is_single_currency,
    is_multiplier: modules.trade.is_multiplier,
    onChange: modules.trade.onChange,
    validation_errors: modules.trade.validation_errors,
}))(Amount);
