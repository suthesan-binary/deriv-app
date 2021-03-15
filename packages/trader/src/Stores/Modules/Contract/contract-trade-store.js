import { action, computed, observable, toJS } from 'mobx';
import { isDesktop } from '@deriv/shared/utils/screen';
import { WS } from 'Services/ws-methods';
import { LocalStore } from '_common/storage';
import { switch_to_tick_chart } from './Helpers/chart-notifications';
import ContractStore from './contract-store';
import getValidationRules from './Constants/validation-rules';
import { isEnded, getContractUpdateConfig } from './Helpers/logic';
import { isMultiplierContract } from './Helpers/multiplier';
import { isCallPut } from './Helpers/contract-type';
import { getLimitOrder } from './Helpers/limit-orders';
import BaseStore from '../../base-store';
import { getContractTypesConfig } from '../Trading/Constants/contract';

export default class ContractTradeStore extends BaseStore {
    // --- Observable properties ---
    @observable.shallow contracts = [];
    contracts_map = {};
    @observable has_error = false;
    @observable error_message = '';

    // Chart specific observables
    @observable granularity = +LocalStore.get('contract_trade.granularity') || 0;
    @observable chart_type = LocalStore.get('contract_trade.chart_type') || 'mountain';

    // Multiplier contract update observable refs
    @observable.ref has_contract_update_stop_loss;
    @observable.ref has_contract_update_take_profit;
    @observable.ref contract_update_stop_loss;
    @observable.ref contract_update_take_profit;

    constructor({ root_store }) {
        super({
            root_store,
            validation_rules: getValidationRules(),
        });

        this.onSwitchAccount(this.accountSwitchListener);
    }

    // -------------------
    // ----- Actions -----
    // -------------------

    @action.bound
    updateChartType(type) {
        LocalStore.set('contract_trade.chart_type', type);
        this.chart_type = type;
    }

    @action.bound
    updateGranularity(granularity) {
        const tick_chart_types = ['mountain', 'line', 'colored_line', 'spline', 'baseline'];
        if (granularity === 0 && tick_chart_types.indexOf(this.chart_type) === -1) {
            this.chart_type = 'mountain';
        }
        LocalStore.set('contract_trade.granularity', granularity);
        this.granularity = granularity;
        if (this.granularity === 0) {
            this.root_store.ui.removeNotificationMessage(switch_to_tick_chart);
        }
    }

    @action.bound
    clearContractUpdateConfigValues(contract_id) {
        const contract = this.getContractById(contract_id);
        contract.contract_update_config = getContractUpdateConfig(contract.contract_info);
        this.validation_errors.contract_update_stop_loss = [];
        this.validation_errors.contract_update_take_profit = [];
    }

    @action.bound
    onChange({ name, value }, contract_id) {
        this.contract_id = contract_id;

        const contract = this.getContractById(this.contract_id);
        contract.contract_update_config[name] = value;

        this[name] = value; // update respective refs for validations to work
        this.validateProperty(name, this[name]);
    }

    @action.bound
    updateLimitOrder(contract_id) {
        const contract = this.getContractById(contract_id);
        const limit_order = getLimitOrder(contract.contract_update_config);

        WS.contractUpdate(contract_id, limit_order).then(response => {
            if (response.error) {
                this.root_store.common.setServicesError({
                    type: response.msg_type,
                    ...response.error,
                });
                this.root_store.ui.toggleServicesErrorModal(true);
                return;
            }

            // Update contract store
            contract.populateContractUpdateConfig(response);
            if (this.root_store.ui.is_history_tab_active) {
                WS.contractUpdateHistory(contract_id).then(contract.populateContractUpdateHistory);
            }

            // Update portfolio store
            this.root_store.modules.portfolio.populateContractUpdate(response, contract_id);
        });
    }

    applicable_contracts = () => {
        const { symbol: underlying, contract_type: trade_type } = this.root_store.modules.trade;
        if (!trade_type || !underlying) {
            return [];
        }
        let { trade_types } = getContractTypesConfig()[trade_type];
        const is_call_put = isCallPut(trade_type);
        if (is_call_put) {
            // treat CALLE/PUTE and CALL/PUT the same
            trade_types = ['CALLE', 'PUTE', 'CALL', 'PUT'];
        }
        return this.contracts
            .filter(c => c.contract_info.underlying === underlying)
            .filter(c => {
                const info = c.contract_info;
                const has_multiplier_contract_ended =
                    isMultiplierContract(info.contract_type) && isEnded(c.contract_info);
                // filter multiplier contract which has ended
                return !has_multiplier_contract_ended;
            })
            .filter(c => {
                const info = c.contract_info;

                const trade_type_is_supported = trade_types.indexOf(info.contract_type) !== -1;
                // both high_low & rise_fall have the same contract_types in POC response
                // entry_spot=barrier means it is rise_fall contract (blame the api)
                if (trade_type_is_supported && info.barrier && info.entry_tick && is_call_put) {
                    if (`${+info.entry_tick}` === `${+info.barrier}`) {
                        return trade_type === 'rise_fall' || trade_type === 'rise_fall_equal';
                    }
                    return trade_type === 'high_low';
                }
                return trade_type_is_supported;
            });
    };

    @computed
    get markers_array() {
        const markers = this.applicable_contracts()
            .map(c => c.marker)
            .filter(m => m)
            .map(m => toJS(m));
        if (markers.length) {
            markers[markers.length - 1].is_last_contract = true;
        }
        return markers;
    }

    @action.bound
    addContract({
        barrier,
        contract_id,
        contract_type,
        start_time,
        longcode,
        underlying,
        is_tick_contract,
        limit_order = {},
    }) {
        const contract_exists = this.contracts_map[contract_id];
        if (contract_exists) {
            // buy response doesn't have limit_order info so here we update contract limit_order
            // on the first poc response right after buy response, if any
            const has_limit_order = Object.keys(limit_order).length;
            if (has_limit_order) {
                const contract = this.contracts_map[contract_id];
                contract.populateConfig(
                    {
                        date_start: start_time,
                        barrier,
                        contract_type,
                        longcode,
                        underlying,
                        limit_order,
                    },
                    true
                );
            }
            return;
        }

        const contract = new ContractStore(this.root_store, { contract_id });
        contract.populateConfig({
            date_start: start_time,
            barrier,
            contract_type,
            longcode,
            underlying,
            limit_order,
        });

        this.contracts.push(contract);
        this.contracts_map[contract_id] = contract;

        if (is_tick_contract && this.granularity !== 0 && isDesktop()) {
            this.root_store.ui.addNotificationMessage(switch_to_tick_chart);
        }
    }

    @action.bound
    removeContract({ contract_id }) {
        this.contracts = this.contracts.filter(c => c.contract_id !== contract_id);
        delete this.contracts_map[contract_id];
    }

    @action.bound
    accountSwitchListener() {
        if (this.has_error) {
            this.clearError();
        }

        return Promise.resolve();
    }

    @action.bound
    onUnmount() {
        this.disposeSwitchAccount();
        // TODO: don't forget the tick history when switching to contract-replay-store
    }

    // Called from portfolio
    @action.bound
    updateProposal(response) {
        if ('error' in response) {
            this.has_error = true;
            this.error_message = response.error.message;
            return;
        }
        // Update the contract-store corresponding to this POC
        if (response.proposal_open_contract) {
            const contract_id = +response.proposal_open_contract.contract_id;
            const contract = this.contracts_map[contract_id];
            contract.populateConfig(response.proposal_open_contract);
            if (response.proposal_open_contract.is_sold) {
                this.root_store.ui.removeNotificationMessage(switch_to_tick_chart);
            }
        }
    }

    @computed
    get last_contract() {
        const applicable_contracts = this.applicable_contracts();
        const length = applicable_contracts.length;
        return length > 0 ? applicable_contracts[length - 1] : {};
    }

    @action.bound
    clearError() {
        this.error_message = '';
        this.has_error = false;
    }

    @action.bound
    getContractById(contract_id) {
        return (
            this.contracts_map[contract_id] ||
            // or get contract from contract_replay store when user is on the contract details page
            this.root_store.modules.contract_replay.contract_store
        );
    }
}
