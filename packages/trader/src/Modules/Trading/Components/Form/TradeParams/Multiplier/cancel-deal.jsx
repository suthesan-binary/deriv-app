import PropTypes from 'prop-types';
import React from 'react';
import { Checkbox, Popover, Dropdown } from '@deriv/components';
import { localize } from '@deriv/translations';
import Fieldset from 'App/Components/Form/fieldset.jsx';
import { connect } from 'Stores/connect';
import PopoverMessageCheckbox from 'Modules/Trading/Components/Elements/popover-message-checkbox.jsx';

const CancelDeal = ({
    cancellation_range_list,
    cancellation_duration,
    has_cancellation,
    has_stop_loss,
    onChangeMultiple,
    should_show_cancellation_warning,
    toggleCancellationWarning,
}) => {
    const changeValue = () => {
        // e.target.checked is not reliable, we have to toggle its previous value
        const new_val = !has_cancellation;
        onChangeMultiple({
            has_cancellation: new_val,
            ...(!new_val
                ? {
                      // reset deal cancellation price
                      cancellation_price: 0,
                  }
                : {
                      // unchecked Stop loss
                      has_stop_loss: false,
                  }),
        });
    };

    const changeDuration = e => {
        const { name, value } = e.target;
        onChangeMultiple({
            has_cancellation: true,
            has_stop_loss: false,
            [name]: value,
        });
    };

    const should_show_popover = has_stop_loss && should_show_cancellation_warning;

    const input = (
        <Checkbox
            id='dt_cancellation-checkbox_input'
            onChange={changeValue}
            name='has_cancellation'
            label={localize('Deal cancellation')}
            defaultChecked={has_cancellation}
        />
    );

    return (
        <Fieldset className='trade-container__fieldset'>
            <div className='input-wrapper--inline'>
                {should_show_popover ? (
                    <Popover
                        alignment='left'
                        classNameBubble='trade-container__popover'
                        is_bubble_hover_enabled
                        margin={2}
                        message={
                            <PopoverMessageCheckbox
                                defaultChecked={!should_show_cancellation_warning}
                                message={localize('You may choose either stop loss or deal cancellation.')}
                                name='should_show_cancellation_warning'
                                onChange={() => toggleCancellationWarning()}
                            />
                        }
                        relative_render
                    >
                        {input}
                    </Popover>
                ) : (
                    <React.Fragment>{input}</React.Fragment>
                )}
                <Popover
                    alignment='left'
                    icon='info'
                    id='dt_cancellation-checkbox__tooltip'
                    message={localize(
                        'Allows you to cancel your trade within a chosen time frame should the market move against your favour.'
                    )}
                    margin={210}
                    relative_render
                />
            </div>
            <Dropdown
                id='dt_cancellation_range'
                className='trade-container__multiplier-dropdown'
                is_alignment_left
                is_nativepicker={false}
                list={cancellation_range_list}
                name='cancellation_duration'
                no_border={true}
                value={cancellation_duration}
                onChange={changeDuration}
            />
        </Fieldset>
    );
};

CancelDeal.propTypes = {
    cancellation_range_list: PropTypes.array,
    cancellation_duration: PropTypes.string,
    has_cancellation: PropTypes.bool,
    has_stop_loss: PropTypes.bool,
    onChangeMultiple: PropTypes.func,
    should_show_cancellation_warning: PropTypes.bool,
    toggleCancellationWarning: PropTypes.func,
};

export default connect(({ modules, ui }) => ({
    cancellation_range_list: modules.trade.cancellation_range_list,
    cancellation_duration: modules.trade.cancellation_duration,
    has_cancellation: modules.trade.has_cancellation,
    has_stop_loss: modules.trade.has_stop_loss,
    onChangeMultiple: modules.trade.onChangeMultiple,
    should_show_cancellation_warning: ui.should_show_cancellation_warning,
    toggleCancellationWarning: ui.toggleCancellationWarning,
}))(CancelDeal);
