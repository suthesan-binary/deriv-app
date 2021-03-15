import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'Components/button/button.jsx';
import HighlightWrapper from './button-highlight-wrapper.jsx';

const ButtonToggle = ({ buttons_arr, className, id, is_animated, name, onChange, value, has_rounded_button }) => {
    const changeValue = selected_value => {
        if (value === selected_value) return;
        onChange({ target: { value: selected_value, name } });
    };
    const menu = buttons_arr.map((val, idx) => {
        const menuClassNames = classNames('dc-button-menu__button', {
            'dc-button-menu__button--active': val.value === value,
        });
        return (
            <Button
                id={`dc_${val.value}_toggle_item`}
                key={idx}
                text={`${val.text.charAt(0).toUpperCase()}${val.text.slice(1)}`}
                onClick={() => changeValue(val.value)}
                className={menuClassNames}
                is_button_toggle
            />
        );
    });
    return (
        <div id={id} className={classNames('dc-button-menu', className)}>
            {is_animated ? (
                <HighlightWrapper has_rounded_button={has_rounded_button}>{menu}</HighlightWrapper>
            ) : (
                <React.Fragment>{menu}</React.Fragment>
            )}
        </div>
    );
};

ButtonToggle.propTypes = {
    buttons_arr: PropTypes.array,
    className: PropTypes.string,
    id: PropTypes.string,
    is_animated: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    has_rounded_button: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ButtonToggle;
