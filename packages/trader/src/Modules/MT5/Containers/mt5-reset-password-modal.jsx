import { Formik } from 'formik';
import * as PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Icon, PasswordMeter, PasswordInput, FormSubmitButton, Loading, Modal } from '@deriv/components';
import routes from '@deriv/shared/utils/routes';
import { localize, Localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import { getMtCompanies } from 'Stores/Modules/MT5/Helpers/mt5-config';
import { WS } from 'Services/ws-methods';

const ResetPasswordIntent = ({ current_list, children, ...props }) => {
    const reset_password_intent = localStorage.getItem('mt5_reset_password_intent');
    const reset_password_type = localStorage.getItem('mt5_reset_password_type') || 'main'; // Default to main
    const has_intent =
        reset_password_intent && /(real|demo)\.(financial_stp|financial|synthetic)/.test(reset_password_intent);

    let group, type, login, title;
    if (has_intent && current_list) {
        [group, type] = reset_password_intent.split('.');
        login = current_list[`${group}.${type}`].login;
        title = getMtCompanies()[group][type].title;
    } else if (current_list) {
        [group, type] = Object.keys(current_list)
            .pop()
            .split('.');
        login = current_list[`${group}.${type}`].login;
        title = getMtCompanies()[group][type].title;
    } else {
        // Set a default intent
        login = '';
        title = '';
    }

    return children({
        login,
        title,
        type: reset_password_type,
        ...props,
    });
};

class MT5ResetPasswordModal extends React.Component {
    state = {
        has_error: false,
        error_message: undefined,
        is_finished: false,
        changed_password_type: '',
    };
    renderErrorBox = error => {
        this.setState({
            has_error: true,
            error_message: error.message,
        });
    };
    clearAddressBar = () => {
        localStorage.removeItem('mt5_reset_password_intent');
        localStorage.removeItem('mt5_reset_password_type');
        this.props.history.push(`${routes.mt5}`);
    };

    resetPassword = (values, password_type, login, actions) => {
        const { setSubmitting } = actions;
        const url_params = new URLSearchParams(window.location.search);
        setSubmitting(true);
        const request = {
            login,
            password_type,
            new_password: values.new_password,
            verification_code: url_params.get('code'),
        };

        WS.mt5PasswordReset(request).then(response => {
            if (response.error && response.error.code === 'InvalidToken') {
                this.renderErrorBox(response.error);
            } else {
                this.setState({
                    is_finished: true,
                    changed_password_type: password_type,
                });
                this.clearAddressBar();
            }
            setSubmitting(false);
        });
    };
    get is_list_fetched() {
        return Object.keys(this.props.current_list).length !== 0;
    }
    render() {
        const { is_mt5_reset_password_modal_enabled, setMt5PasswordResetModal, current_list } = this.props;

        return (
            <Modal
                className='mt5-reset-password-modal'
                is_open={is_mt5_reset_password_modal_enabled}
                toggleModal={() => setMt5PasswordResetModal(false)}
                title={localize('Reset DMT5 password')}
            >
                {!this.is_list_fetched && !this.state.has_error && <Loading is_fullscreen={false} />}
                {this.is_list_fetched && !this.state.has_error && !this.state.is_finished && (
                    <ResetPasswordIntent current_list={current_list}>
                        {({ title, type, login }) => (
                            <Formik
                                initialValues={{ new_password: '' }}
                                validate={values => !!values.new_password}
                                onSubmit={(values, actions) => this.resetPassword(values, type, login, actions)}
                            >
                                {({
                                    handleSubmit,
                                    errors,
                                    values,
                                    isSubmitting,
                                    handleChange,
                                    handleBlur,
                                    touched,
                                }) => (
                                    <form autoComplete='off' onSubmit={handleSubmit}>
                                        <div className='mt5-reset-password'>
                                            <div className='mt5-reset-password__container'>
                                                <h2 className='mt5-reset-password__heading'>
                                                    <Localize
                                                        i18n_default_text='Reset DMT5 {{title}} password'
                                                        values={{
                                                            title,
                                                        }}
                                                    />
                                                </h2>
                                                <div className='mt5-reset-password__password-area'>
                                                    <PasswordMeter
                                                        input={values.new_password}
                                                        error={touched.new_password && errors.new_password}
                                                    >
                                                        <PasswordInput
                                                            className='mt5-reset-password__password-field'
                                                            name='new_password'
                                                            label={localize('New {{type}} password', { type })}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={touched.new_password && errors.new_password}
                                                            value={values.new_password}
                                                            data-lpignore='true'
                                                            required
                                                        />
                                                    </PasswordMeter>
                                                    {!values.new_password && (
                                                        <p className='mt5-reset-password__hint'>
                                                            <Localize i18n_default_text='Strong passwords contain at least 8 characters, combine uppercase and lowercase letters and numbers.' />
                                                        </p>
                                                    )}
                                                </div>
                                                {isSubmitting && <Loading is_fullscreen={false} />}
                                                {!isSubmitting && (
                                                    <FormSubmitButton
                                                        is_disabled={isSubmitting || !values.new_password}
                                                        errors={errors}
                                                        is_center={true}
                                                        large
                                                        label={localize('Create {{type}} password', { type })}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        )}
                    </ResetPasswordIntent>
                )}
                {this.state.has_error && (
                    <div className='mt5-reset-password__error'>
                        <Icon icon='IcMt5Expired' size={128} />
                        <p className='mt5-reset-password__heading'>{this.state.error_message}</p>
                        <p className='mt5-reset-password__description mt5-reset-password__description--is-centered'>
                            <Localize i18n_default_text='Please request a new password and check your email for the new token.' />
                        </p>
                        <Button
                            primary
                            large
                            onClick={() => {
                                this.clearAddressBar();
                                setMt5PasswordResetModal(false);
                            }}
                        >
                            <Localize i18n_default_text='Ok' />
                        </Button>
                    </div>
                )}
                {this.state.is_finished && (
                    <div className='mt5-reset-password__success'>
                        <Icon icon='IcMt5PasswordUpdated' size={128} />
                        <div className='mt5-reset-password__heading'>
                            <Localize i18n_default_text='Password saved' />
                        </div>
                        <div className='mt5-reset-password__description'>
                            <Localize
                                i18n_default_text='Your {{account_type}} password has been changed.'
                                values={{
                                    account_type:
                                        this.state.changed_password_type === 'main'
                                            ? localize('main')
                                            : localize('investor'),
                                }}
                            />
                        </div>
                        <Button primary large onClick={() => setMt5PasswordResetModal(false)}>
                            <Localize i18n_default_text='Ok' />
                        </Button>
                    </div>
                )}
            </Modal>
        );
    }
}

MT5ResetPasswordModal.propTypes = {
    is_mt5_reset_password_modal_enabled: PropTypes.any,
    setMt5PasswordResetModal: PropTypes.any,
    current_list: PropTypes.any,
};

export default withRouter(
    connect(({ modules: { mt5 } }) => ({
        is_mt5_reset_password_modal_enabled: mt5.is_mt5_reset_password_modal_enabled,
        setMt5PasswordResetModal: mt5.setMt5PasswordResetModal,
        current_list: mt5.current_list,
    }))(MT5ResetPasswordModal)
);
