import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Button, Checkbox, Icon, Modal, RadioGroup, Input } from '@deriv/components';
import { Formik, Form, Field } from 'formik';
import { localize } from '@deriv/translations';
import { config } from '@deriv/bot-skeleton';
import { connect } from '../stores/connect';
import '../assets/sass/google-drive.scss';
import '../assets/sass/save-modal.scss';

const SaveModal = ({
    bot_name,
    button_status,
    is_authorised,
    is_save_modal_open,
    onConfirmSave,
    onDriveConnect,
    toggleSaveModal,
    validateBotName,
}) => (
    <Modal
        title={'Save bot'}
        className='modal--save'
        width='384px'
        is_open={is_save_modal_open}
        toggleModal={toggleSaveModal}
    >
        <Formik
            initialValues={{
                is_local: true,
                save_as_collection: false,
                bot_name: bot_name === config.default_file_name ? '' : bot_name,
            }}
            validate={validateBotName}
            onSubmit={onConfirmSave}
        >
            {({ values: { is_local, save_as_collection }, setFieldValue, touched, errors }) => (
                <Form>
                    <div className='modal__content'>
                        <div className='modal__content-row'>
                            <Field name='bot_name'>
                                {({ field }) => (
                                    <Input
                                        {...field}
                                        className='save-type__input'
                                        type='text'
                                        placeholder={'Untitled Bot'}
                                        error={touched[field.name] && errors[field.name]}
                                        label={localize('Bot name')}
                                    />
                                )}
                            </Field>
                        </div>
                        <div className='modal__content-row'>
                            <RadioGroup
                                className='radio-group__save-type'
                                name='is_local'
                                items={[
                                    {
                                        id: 'local',
                                        label: (
                                            <IconRadio
                                                text={localize('Local')}
                                                icon={
                                                    <Icon
                                                        icon='IcDesktop'
                                                        size={48}
                                                        custom_color='#{$COLOR_DARK_BLUE_5}'
                                                    />
                                                }
                                            />
                                        ),
                                        value: true,
                                    },
                                    {
                                        id: 'drive',
                                        label: (
                                            <IconRadio
                                                text={'Google Drive'}
                                                icon={<Icon icon='IcGoogleDrive' size={48} />}
                                                google_drive_connected={is_authorised}
                                                onDriveConnect={onDriveConnect}
                                            />
                                        ),
                                        value: false,
                                        disabled: !is_authorised,
                                        className: classNames({
                                            'dc-radio-group__item-disabled': !is_authorised,
                                        }),
                                    },
                                ]}
                                selected={is_authorised ? is_local : true}
                                onToggle={() => setFieldValue('is_local', !is_local)}
                            />
                        </div>
                        <>
                            <Field name='save_as_collection'>
                                {({ field }) => (
                                    <Checkbox
                                        {...field}
                                        onChange={() => setFieldValue('save_as_collection', !save_as_collection)}
                                        defaultChecked={save_as_collection}
                                        label={localize('Save as collection')}
                                        classNameLabel='save-type__checkbox-text'
                                    />
                                )}
                            </Field>
                            <div className='save-type__checkbox-description'>
                                {localize(
                                    'Enabling this allows you to save your blocks as one collection which can be easily integrated into other bots.'
                                )}
                            </div>
                        </>
                    </div>
                    <div className='modal__footer'>
                        <Button
                            type='button'
                            className='modal__footer--button'
                            text={localize('Cancel')}
                            onClick={toggleSaveModal}
                            secondary
                        />
                        <Button
                            className='modal__footer--button'
                            type='submit'
                            is_loading={button_status === 1}
                            is_submit_success={button_status === 2}
                            text={localize('Continue')}
                            primary
                        />
                    </div>
                </Form>
            )}
        </Formik>
    </Modal>
);

const IconRadio = ({ icon, text, google_drive_connected, onDriveConnect }) => {
    const is_drive_radio = text === 'Google Drive';

    return (
        <div className='save-type__container'>
            <div className='save-type__radio'>
                {icon &&
                    React.cloneElement(icon, {
                        className: classNames(
                            'save-type__icon',
                            {
                                'save-type__icon--active': is_drive_radio && google_drive_connected,
                                'save-type__icon--disabled': is_drive_radio && !google_drive_connected,
                            },
                            icon.props.className
                        ),
                    })}
                <p
                    className={classNames('save-type__radio-text', {
                        'save-type__radio-text--disabled': is_drive_radio && !google_drive_connected,
                    })}
                >
                    {localize(text)}
                </p>
            </div>
            {is_drive_radio && (
                <p className='save-type__drive-status' onClick={onDriveConnect}>
                    {localize(google_drive_connected ? localize('Disconnect') : localize('Connect'))}
                </p>
            )}
        </div>
    );
};

SaveModal.propTypes = {
    button_status: PropTypes.number,
    is_authorised: PropTypes.bool,
    is_save_modal_open: PropTypes.bool,
    onConfirmSave: PropTypes.func,
    onDriveConnect: PropTypes.func,
    toggleSaveModal: PropTypes.func,
    bot_name: PropTypes.string,
};

export default connect(({ save_modal, google_drive }) => ({
    button_status: save_modal.button_status,
    is_authorised: google_drive.is_authorised,
    is_save_modal_open: save_modal.is_save_modal_open,
    onConfirmSave: save_modal.onConfirmSave,
    onDriveConnect: save_modal.onDriveConnect,
    toggleSaveModal: save_modal.toggleSaveModal,
    validateBotName: save_modal.validateBotName,
    bot_name: save_modal.bot_name,
}))(SaveModal);
