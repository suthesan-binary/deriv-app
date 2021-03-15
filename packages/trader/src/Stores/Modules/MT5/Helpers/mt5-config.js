import { localize } from '@deriv/translations';

export const getMtCompanies = () => {
    const synthetic_config = {
        account_type: '',
        leverage: 500,
        short_title: localize('Synthetic'),
    };
    const financial_config = {
        account_type: 'financial',
        leverage: 1000,
        short_title: localize('Financial'),
    };
    const financial_stp_config = {
        account_type: 'financial_stp',
        leverage: 100,
        short_title: localize('Financial STP'),
    };

    return {
        demo: {
            synthetic: {
                mt5_account_type: synthetic_config.account_type,
                leverage: synthetic_config.leverage,
                title: localize('Demo Synthetic'),
                short_title: synthetic_config.short_title,
            },
            financial: {
                mt5_account_type: financial_config.account_type,
                leverage: financial_config.leverage,
                title: localize('Demo Financial'),
                short_title: financial_config.short_title,
            },
            financial_stp: {
                mt5_account_type: financial_stp_config.account_type,
                leverage: financial_stp_config.leverage,
                title: localize('Demo Financial STP'),
                short_title: financial_stp_config.short_title,
            },
        },
        real: {
            synthetic: {
                mt5_account_type: synthetic_config.account_type,
                leverage: synthetic_config.leverage,
                title: localize('Real Synthetic'),
                short_title: synthetic_config.short_title,
            },
            financial: {
                mt5_account_type: financial_config.account_type,
                leverage: financial_config.leverage,
                title: localize('Real Financial'),
                short_title: financial_config.short_title,
            },
            financial_stp: {
                mt5_account_type: financial_stp_config.account_type,
                leverage: financial_stp_config.leverage,
                title: localize('Real Financial STP'),
                short_title: financial_stp_config.short_title,
            },
        },
    };
};

export const getMt5GroupConfig = (group = undefined) => {
    const map_mode = {
        'real\\svg': {
            type: 'synthetic',
            category: 'real',
        },
        'real\\svg_standard': {
            type: 'financial',
            category: 'real',
        },
        'real\\vanuatu_standard': {
            type: 'financial',
            category: 'real',
        },
        'real\\labuan_advanced': {
            type: 'financial_stp',
            category: 'real',
        },
        'demo\\svg': {
            type: 'synthetic',
            category: 'demo',
        },
        'demo\\svg_standard': {
            type: 'financial',
            category: 'demo',
        },
        'demo\\vanuatu_standard': {
            type: 'financial',
            category: 'demo',
        },
        'demo\\labuan_advanced': {
            type: 'financial_stp',
            category: 'demo',
        },
    };

    if (group !== undefined) {
        if (map_mode[group] && map_mode[group].type) {
            return map_mode[group];
        }

        return { type: '', category: '' };
    }

    return map_mode;
};

/**
 * Generate the enum for API request.
 *
 * @param {string} category [real, demo]
 * @param {string} type [synthetic, financial, financial_stp]
 * @return {string}
 */
export const getAccountTypeFields = ({ category, type }) => {
    const map_mode = {
        real: {
            synthetic: {
                account_type: 'gaming',
            },
            financial: {
                account_type: 'financial',
                mt5_account_type: 'standard', // API still calls it standard
            },
            financial_stp: {
                account_type: 'financial',
                mt5_account_type: 'advanced', // API still calls it advanced
            },
        },
        demo: {
            synthetic: {
                account_type: 'demo',
            },
            financial: {
                account_type: 'demo',
                mt5_account_type: 'standard', // API still calls it standard
            },
            financial_stp: {
                account_type: 'demo',
                mt5_account_type: 'advanced', // API still calls it advanced
            },
        },
    };

    return map_mode[category][type];
};
