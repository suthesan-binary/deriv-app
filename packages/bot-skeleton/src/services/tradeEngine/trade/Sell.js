import { DURING_PURCHASE } from './state/constants';
import { contractStatus, log } from '../utils/broadcast';
import { recoverFromError, doUntilDone } from '../utils/helpers';
import { log_types } from '../../../constants/messages';
import { createError } from '../../../utils/error';

let delay_index = 0;

export default Engine =>
    class Sell extends Engine {
        isSellAtMarketAvailable() {
            return this.contractId && !this.isSold && this.isSellAvailable && !this.isExpired;
        }

        sellAtMarket() {
            // Prevent calling sell twice
            if (this.store.getState().scope !== DURING_PURCHASE) {
                return Promise.resolve();
            }

            if (!this.isSellAtMarketAvailable()) {
                log(log_types.NOT_OFFERED);
                return Promise.resolve();
            }

            const onSuccess = sold_for => {
                delay_index = 0;
                contractStatus('purchase.sold');
                log(log_types.SELL, { sold_for });
                return this.waitForAfter();
            };

            const action = () =>
                this.api
                    .sellContract(this.contractId, 0)
                    .then(response => {
                        onSuccess(response.sell.sold_for);
                    })
                    .catch(response => {
                        const {
                            error: { error },
                        } = response;
                        if (error.code === 'InvalidOfferings') {
                            // "InvalidOfferings" may occur when user tries to sell the contract too close
                            // to the expiry time. We shouldn't interrupt the bot but instead let the contract
                            // finish.
                            log(error.message);
                            return Promise.resolve();
                        }
                        // In all other cases, throw a custom error that will stop the bot (after the current contract has finished).
                        // See interpreter for SellNotAvailableCustom.
                        throw createError('SellNotAvailableCustom', error.message);
                    });

            if (!this.options.timeMachineEnabled) {
                return doUntilDone(action);
            }

            return recoverFromError(
                action,
                (error_code, makeDelay) => makeDelay().then(() => this.observer.emit('REVERT', 'during')),
                ['NoOpenPosition', 'InvalidSellContractProposal', 'UnrecognisedRequest'],
                delay_index++
            ).then(onSuccess);
        }
    };
