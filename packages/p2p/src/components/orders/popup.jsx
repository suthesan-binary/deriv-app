import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { Checkbox, Button, ThemedScrollbars } from '@deriv/components';
import FormError from '../form/error.jsx';
import { localize } from '../i18next';
import IconClose from '../../assets/icon-close.jsx';

class Popup extends React.Component {
    state = {
        api_error_message: '',
        disable_confirm: true,
    };

    handleSubmit = (values, { setStatus, setSubmitting }) => {
        // TODO: [p2p-remove-console] this console is to avoid unused variable eslint linter
        // eslint-disable-next-line no-console
        this.props.onClickConfirm(setStatus);
        setSubmitting(false);
    };

    setApiError = ({ error_message: api_error_message }) => {
        this.setState({ api_error_message });
    };

    render() {
        const {
            cancel_text,
            confirm_text,
            onClickConfirm,
            has_cancel,
            message,
            need_confirmation,
            order,
            onCancel,
            title,
            className,
            payment_confirm,
        } = this.props;
        const { api_error_message, disable_confirm } = this.state;

        return (
            <>
                <div className={classNames('orders__popup', className)}>
                    <div className='orders__popup-header'>
                        <div className='orders__popup-header_wrapper'>
                            <h2 className='orders__popup-header--title'>{title}</h2>
                            <IconClose className='orders__popup-close_icon' onClick={onCancel} />
                        </div>
                    </div>
                    {/* TODO: [p2p-fix-component-pollution]
                        the value inside form should be from outside of components instead
                    */}
                    {need_confirmation ? (
                        <Formik
                            initialValues={{
                                need_confirmation: false,
                            }}
                            onSubmit={this.handleSubmit}
                        >
                            {({ isSubmitting, setFieldValue, values, status }) => (
                                <Form noValidate>
                                    <ThemedScrollbars height='90px'>
                                        <div className='orders__popup-content'>
                                            {message}
                                            <div className='orders__popup-field'>
                                                <Field name='need_confirmation'>
                                                    {({ field }) => (
                                                        <Checkbox
                                                            {...field}
                                                            onChange={() =>
                                                                setFieldValue(
                                                                    'need_confirmation',
                                                                    !values.need_confirmation
                                                                )
                                                            }
                                                            defaultChecked={values.need_confirmation}
                                                            label={localize('I have received {{amount}} {{currency}}', {
                                                                amount: order.display_transaction_amount,
                                                                currency: order.transaction_currency,
                                                            })}
                                                            classNameLabel='orders__popup-field_text'
                                                        />
                                                    )}
                                                </Field>
                                            </div>
                                        </div>
                                    </ThemedScrollbars>
                                    <div className='orders__popup-footer'>
                                        {status && status.error_message && <FormError message={status.error_message} />}
                                        {has_cancel && (
                                            <Button onClick={onCancel} secondary>
                                                {cancel_text}
                                            </Button>
                                        )}
                                        <Button is_disabled={isSubmitting || !values.need_confirmation} primary>
                                            {localize('Release {{amount}} {{currency}}', {
                                                amount: order.display_offer_amount,
                                                currency: order.offer_currency,
                                            })}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    ) : (
                        <>
                            <ThemedScrollbars height='130px'>
                                <div className='orders__popup-content'>
                                    {message}
                                    {payment_confirm ? (
                                        <div className='order-details__popup-checkBox'>
                                            <Checkbox
                                                onChange={() => {
                                                    this.setState({
                                                        disable_confirm: !this.state.disable_confirm,
                                                    });
                                                }}
                                                defaultChecked={!disable_confirm}
                                                label={localize('I have paid {{amount}} {{currency}}', {
                                                    amount: order.display_transaction_amount,
                                                    currency: order.transaction_currency,
                                                })}
                                            />
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </ThemedScrollbars>
                            <div className='orders__popup-footer'>
                                {api_error_message && <FormError message={api_error_message} />}
                                {has_cancel && (
                                    <Button onClick={onCancel} secondary>
                                        {cancel_text}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => onClickConfirm(this.setApiError)}
                                    primary
                                    is_disabled={payment_confirm && disable_confirm}
                                >
                                    {confirm_text}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }
}

Popup.propTypes = {
    cancel_text: PropTypes.string,
    confirm_text: PropTypes.string,
    has_cancel: PropTypes.bool,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    need_confirmation: PropTypes.bool,
    onCancel: PropTypes.func,
    onClickConfirm: PropTypes.func,
    order: PropTypes.object,
    title: PropTypes.string,
    payment_confirm: PropTypes.bool,
};

export default Popup;
