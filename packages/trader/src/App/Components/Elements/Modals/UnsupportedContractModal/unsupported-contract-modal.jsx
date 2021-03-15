import { Dialog } from '@deriv/components';
import PropTypes from 'prop-types';
import React from 'react';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import { website_domain } from '../../../../Constants/app-config';

class UnsupportedContractModal extends React.Component {
    render() {
        const { disableApp, enableApp, is_loading, is_visible, onConfirm, onClose } = this.props;
        return (
            <Dialog
                title={localize('We’re working on it')}
                confirm_button_text={localize('Stay on {{website_domain}}', { website_domain })}
                cancel_button_text={localize('Go to Binary.com')}
                onConfirm={onConfirm}
                onCancel={onClose}
                disableApp={disableApp}
                enableApp={enableApp}
                is_loading={is_loading}
                is_closed_on_cancel
                is_visible={is_visible}
            >
                <Localize i18n_default_text='You’ve selected a trade type that is currently unsupported, but we’re working on it.' />
            </Dialog>
        );
    }
}

UnsupportedContractModal.propTypes = {
    disableApp: PropTypes.func,
    enableApp: PropTypes.func,
    is_loading: PropTypes.bool,
    is_visible: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
};

export default connect(({ ui }) => ({
    disableApp: ui.disableApp,
    enableApp: ui.enableApp,
    is_loading: ui.is_loading,
}))(UnsupportedContractModal);
