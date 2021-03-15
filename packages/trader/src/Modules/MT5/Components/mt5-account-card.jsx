import classNames from 'classnames';
import React from 'react';
import { Money, Button } from '@deriv/components';
import { Localize } from '@deriv/translations';
import { Mt5AccountCopy } from './mt5-account-copy.jsx';
import { getMT5WebTerminalLink } from '../Helpers/constants';

const MT5AccountCard = ({
    button_label,
    commission_message,
    descriptor,
    existing_data,
    has_mt5_account,
    icon,
    is_button_primary,
    is_disabled,
    specs,
    title,
    type,
    onSelectAccount,
    onClickFund,
    onPasswordManager,
}) => {
    const IconComponent = icon || (() => null);
    const lbl_add_account =
        type.category === 'real' ? (
            <Localize i18n_default_text='Add real account' />
        ) : (
            <Localize i18n_default_text='Add demo account' />
        );
    const cta_label = button_label || lbl_add_account;

    const has_popular_banner = type.type === 'synthetic' && type.category === 'real';
    const has_demo_banner = type.category === 'demo';

    return (
        <div className='mt5-account-card'>
            {has_popular_banner && (
                <div className='mt5-account-card__banner'>
                    <Localize i18n_default_text='Most popular' />
                </div>
            )}
            {has_demo_banner && (
                <div className='mt5-account-card__banner mt5-account-card__banner--demo'>
                    <Localize i18n_default_text='DEMO' />
                </div>
            )}
            <div
                className={classNames('mt5-account-card__type', {
                    'mt5-account-card__type--has-banner': has_popular_banner || has_demo_banner,
                })}
                id={`mt5_${type.category}_${type.type}`}
            >
                {icon && <IconComponent />}
                <div className='mt5-account-card__type--description'>
                    <h1 className='mt5-account-card--heading'>{title}</h1>
                    {!existing_data && <p className='mt5-account-card--paragraph'>{descriptor}</p>}
                    {existing_data && existing_data.display_balance && (
                        <p className='mt5-account-card--balance'>
                            <Money amount={existing_data.display_balance} currency={existing_data.currency} />
                        </p>
                    )}
                </div>
            </div>

            <div className='mt5-account-card__cta'>
                <div className='mt5-account-card__specs'>
                    <table className='mt5-account-card__specs-table'>
                        <tbody>
                            {Object.keys(specs).map((spec_attribute, idx) => (
                                <tr key={idx} className='mt5-account-card__specs-table-row'>
                                    <td className='mt5-account-card__specs-table-attribute'>
                                        <p className='mt5-account-card--paragraph'>{spec_attribute}</p>
                                    </td>
                                    <td className='mt5-account-card__specs-table-data'>
                                        <p className='mt5-account-card--paragraph'>{specs[spec_attribute]}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {existing_data?.login && (
                    <div className='mt5-account-card__login'>
                        <Localize
                            i18n_default_text='Account login no.&nbsp;<0>{{login}}</0>'
                            values={{
                                login: existing_data.display_login,
                            }}
                            components={[<strong key='0' />]}
                        />
                        <Mt5AccountCopy text={existing_data.display_login} />
                    </div>
                )}

                {!existing_data && commission_message && (
                    <p className='mt5-account-card__commission mt5-account-card--paragraph'>{commission_message}</p>
                )}
                {existing_data && (
                    <div className='mt5-account-card__manage'>
                        <Button onClick={onClickFund} type='button' secondary>
                            {type.category === 'real' && <Localize i18n_default_text='Fund transfer' />}
                            {type.category === 'demo' && <Localize i18n_default_text='Fund top up' />}
                        </Button>
                        <Button
                            onClick={() => {
                                onPasswordManager(existing_data.login, title, type.category, type.type);
                            }}
                            type='button'
                            secondary
                        >
                            <Localize i18n_default_text='Password' />
                        </Button>
                    </div>
                )}

                {!existing_data && has_mt5_account && (
                    <Button className='mt5-account-card__account-selection' onClick={onSelectAccount} type='button'>
                        <Localize i18n_default_text='Select' />
                    </Button>
                )}
                {existing_data && (
                    <a
                        className='dc-btn mt5-account-card__account-selection mt5-account-card__account-selection--primary'
                        type='button'
                        href={getMT5WebTerminalLink({ category: type.category, loginid: existing_data.display_login })}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <Localize i18n_default_text='Trade on web terminal' />
                    </a>
                )}
                {!existing_data && !has_mt5_account && (
                    <Button
                        className='mt5-account-card__account-selection'
                        onClick={onSelectAccount}
                        type='button'
                        is_disabled={is_disabled}
                        primary={is_button_primary}
                        secondary={!is_button_primary}
                        large
                    >
                        {cta_label}
                    </Button>
                )}
            </div>
        </div>
    );
};

export { MT5AccountCard };
