import classNames from 'classnames';
import { Icon, Label, Money } from '@deriv/components';
import React from 'react';
import { localize } from '@deriv/translations';
import ProgressSliderStream from 'App/Containers/ProgressSliderStream';
import { getProfitOrLoss } from 'Modules/Reports/Helpers/profit-loss';
import IndicativeCell from '../Components/indicative-cell.jsx';
import MarketSymbolIconRow from '../Components/market-symbol-icon-row.jsx';
import ProfitLossCell from '../Components/profit_loss_cell.jsx';

const getModeFromValue = key => {
    const map = {
        deposit: 'warn',
        withdrawal: 'info',
        sell: 'danger',
        buy: 'success',
        default: 'default',
        escrow: 'default-invert',
    };

    if (Object.keys(map).find(x => x === key)) {
        return map[key];
    }

    return map.default;
};

/* eslint-disable react/display-name, react/prop-types */
export const getStatementTableColumnsTemplate = currency => [
    {
        key: 'icon',
        title: '',
        col_index: 'icon',
        renderCellContent: ({ cell_value, row_obj }) => (
            <MarketSymbolIconRow action={cell_value} key={row_obj.transaction_id} payload={row_obj} />
        ),
    },
    {
        title: localize('Ref. ID'),
        col_index: 'refid',
    },
    {
        title: localize('Transaction time'),
        col_index: 'date',
    },
    {
        key: 'mode',
        title: localize('Transaction'),
        col_index: 'action_type',
        renderCellContent: ({ cell_value, row_obj }) => (
            <Label mode={getModeFromValue(cell_value)}>{row_obj.action}</Label>
        ),
    },
    {
        title: localize('Credit/Debit'),
        col_index: 'amount',
        renderCellContent: ({ cell_value }) => (
            <div className={`amount--${getProfitOrLoss(cell_value)}`}>
                <Money has_sign amount={cell_value.replace(/[,]+/g, '')} currency={currency} />
            </div>
        ),
    },
    {
        title: localize('Balance'),
        col_index: 'balance',
        renderCellContent: ({ cell_value }) => <Money amount={cell_value.replace(/[,]+/g, '')} currency={currency} />,
    },
];
export const getProfitTableColumnsTemplate = (currency, items_count) => [
    {
        key: 'icon',
        title: '',
        col_index: 'action_type',
        renderCellContent: ({ cell_value, row_obj, is_footer }) => {
            if (is_footer) {
                return localize('Profit/loss on the last {{item_count}} contracts', { item_count: items_count });
            }
            return <MarketSymbolIconRow action={cell_value} key={row_obj.transaction_id} payload={row_obj} />;
        },
    },
    {
        title: localize('Ref. ID'),
        col_index: 'transaction_id',
    },
    {
        title: localize('Buy time'),
        col_index: 'purchase_time',
    },
    {
        title: localize('Buy price'),
        col_index: 'buy_price',
        renderCellContent: ({ cell_value, is_footer }) => {
            if (is_footer) return '';

            return <Money amount={cell_value} currency={currency} />;
        },
    },
    {
        title: localize('Sell time'),
        col_index: 'sell_time',
        renderHeader: ({ title }) => {
            return (
                <>
                    <span>{title}</span>
                    <Icon icon='IcContractFlag' />
                </>
            );
        },
    },
    {
        title: localize('Sell price'),
        col_index: 'sell_price',
        renderCellContent: ({ cell_value, is_footer }) => {
            if (is_footer) return '';

            return <Money amount={cell_value} currency={currency} />;
        },
    },
    {
        title: localize('Profit/Loss'),
        col_index: 'profit_loss',
        renderCellContent: ({ cell_value }) => (
            <ProfitLossCell value={cell_value}>
                <Money has_sign amount={cell_value.replace(/[,]+/g, '')} currency={currency} />
            </ProfitLossCell>
        ),
    },
];
export const getOpenPositionsColumnsTemplate = currency => [
    {
        title: '',
        col_index: 'type',
        renderCellContent: ({ cell_value, row_obj, is_footer }) => {
            if (is_footer) return localize('Total');

            return <MarketSymbolIconRow action={cell_value} key={row_obj.id} payload={row_obj.contract_info} />;
        },
    },
    {
        title: localize('Ref. ID'),
        col_index: 'reference',
    },
    {
        title: localize('Buy price'),
        col_index: 'purchase',
        renderCellContent: ({ cell_value }) => <Money amount={cell_value} currency={currency} />,
    },
    {
        title: localize('Potential payout'),
        col_index: 'payout',
        renderCellContent: ({ cell_value }) =>
            cell_value ? <Money amount={cell_value} currency={currency} /> : <span>-</span>,
    },
    {
        title: localize('Potential profit/loss'),
        col_index: 'profit',
        renderCellContent: ({ row_obj }) => {
            if (!row_obj.profit_loss && (!row_obj.contract_info || !row_obj.contract_info.profit)) return;
            const profit = row_obj.profit_loss || row_obj.contract_info.profit;
            // eslint-disable-next-line consistent-return
            return (
                <div
                    className={classNames('open-positions__profit-loss', {
                        'open-positions__profit-loss--negative': profit < 0,
                        'open-positions__profit-loss--positive': profit > 0,
                    })}
                >
                    <Money amount={Math.abs(profit)} currency={currency} />
                    <div className='open-positions__profit-loss--movement'>
                        {profit > 0 ? <Icon icon='IcProfit' /> : <Icon icon='IcLoss' />}
                    </div>
                </div>
            );
        },
    },
    {
        title: localize('Indicative price'),
        col_index: 'indicative',
        renderCellContent: ({ cell_value, row_obj }) => (
            <IndicativeCell
                amount={+cell_value}
                currency={currency}
                status={row_obj.contract_info && !row_obj.is_valid_to_sell ? 'no-resale' : ''}
            />
        ),
    },
    {
        title: localize('Remaining time'),
        col_index: 'id',
        renderCellContent: ({ row_obj }) => <ProgressSliderStream contract_info={row_obj.contract_info} />,
    },
];

export const getMultiplierOpenPositionsColumnsTemplate = currency => [
    {
        title: '',
        col_index: 'type',
        renderCellContent: ({ cell_value, row_obj, is_footer }) => {
            if (is_footer) return localize('Total');

            return <MarketSymbolIconRow action={cell_value} key={row_obj.id} payload={row_obj.contract_info} />;
        },
    },
    {
        title: localize('Stake'),
        col_index: 'buy_price',
        renderCellContent: ({ cell_value, row_obj, is_footer }) => {
            if (is_footer) {
                return <Money amount={cell_value} currency={currency} />;
            }
            if (row_obj.contract_info) {
                const { ask_price: cancellation_price = 0 } = row_obj.contract_info.cancellation || {};
                return <Money amount={row_obj.contract_info.buy_price - cancellation_price} currency={currency} />;
            }
            return '';
        },
    },
    {
        title: localize('Multiplier'),
        col_index: 'multiplier',
        renderCellContent: ({ row_obj }) =>
            row_obj.contract_info && row_obj.contract_info.multiplier ? `x${row_obj.contract_info.multiplier}` : '',
    },
    {
        title: localize('Deal cancellation'),
        col_index: 'cancellation',
        renderCellContent: ({ row_obj }) => {
            if (row_obj.contract_info && row_obj.contract_info.cancellation) {
                return <Money amount={row_obj.contract_info.cancellation.ask_price} currency={currency} />;
            }
            return '-';
        },
    },
    {
        title: localize('Take profit'),
        col_index: 'take_profit',
        renderCellContent: ({ row_obj, is_footer }) => {
            if (is_footer) {
                return '';
            }

            if (
                row_obj.contract_info &&
                row_obj.contract_info.limit_order &&
                row_obj.contract_info.limit_order.take_profit
            ) {
                return (
                    <Money
                        has_sign
                        amount={row_obj.contract_info.limit_order.take_profit.order_amount}
                        currency={currency}
                    />
                );
            }
            return '-';
        },
    },
    {
        title: localize('Stop loss'),
        col_index: 'stop_loss',
        renderCellContent: ({ row_obj, is_footer }) => {
            if (is_footer) {
                return '';
            }

            if (
                row_obj.contract_info &&
                row_obj.contract_info.limit_order &&
                row_obj.contract_info.limit_order.stop_loss
            ) {
                return (
                    <Money
                        has_sign
                        amount={row_obj.contract_info.limit_order.stop_loss.order_amount}
                        currency={currency}
                    />
                );
            }
            return '-';
        },
    },
    {
        title: localize('Potential profit/loss'),
        col_index: 'profit',
        renderCellContent: ({ row_obj }) => {
            if (!row_obj.contract_info || !row_obj.contract_info.profit) return;
            const profit = row_obj.contract_info.profit;
            // eslint-disable-next-line consistent-return
            return (
                <div
                    className={classNames('open-positions__profit-loss', {
                        'open-positions__profit-loss--negative': profit < 0,
                        'open-positions__profit-loss--positive': profit > 0,
                    })}
                >
                    <Money amount={Math.abs(profit)} currency={currency} />
                    <div className='open-positions__profit-loss--movement'>
                        {profit > 0 ? <Icon icon='IcProfit' /> : <Icon icon='IcLoss' />}
                    </div>
                </div>
            );
        },
    },
];
/* eslint-enable react/display-name, react/prop-types */
