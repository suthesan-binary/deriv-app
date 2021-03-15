import classNames from 'classnames';
import React from 'react';
import FieldError from 'Components/field-error';

const Input = (
    {
        className,
        classNameError,
        disabled,
        error,
        hint,
        leading_icon,
        has_character_counter,
        max_characters,
        trailing_icon,
        label,
        ...props
    },
    ref
) => {
    const [counter, setCounter] = React.useState(0);
    const changeHandler = e => {
        let input_value = e.target.value;
        if (max_characters && input_value.length >= max_characters) {
            input_value = input_value.slice(0, max_characters);
        }
        setCounter(input_value.length);
        e.target.value = input_value;
        props.onChange(e);
    };
    return (
        <div
            className={classNames('dc-input', className, {
                'dc-input__disabled': disabled,
                'dc-input--error': error,
            })}
        >
            {leading_icon &&
                React.cloneElement(leading_icon, {
                    className: classNames('dc-input__leading-icon', leading_icon.props.className),
                })}
            {props.type === 'textarea' ? (
                <textarea
                    ref={ref}
                    {...props}
                    className={classNames('dc-input__field', {
                        'dc-input__field--placeholder-visible': !label && props.placeholder,
                    })}
                    onChange={changeHandler}
                    disabled={disabled}
                />
            ) : (
                <input
                    ref={ref}
                    {...props}
                    className={classNames('dc-input__field', {
                        'dc-input__field--placeholder-visible': !label && props.placeholder,
                    })}
                    disabled={disabled}
                />
            )}
            {trailing_icon &&
                React.cloneElement(trailing_icon, {
                    className: classNames('dc-input__trailing-icon', trailing_icon.props.className),
                })}
            {label && (
                <label className='dc-input__label' htmlFor={props.id}>
                    {label}
                </label>
            )}
            {error && <FieldError className={classNameError} message={error} />}
            {!error && hint && <p className='dc-input__hint'>{hint}</p>}
            {has_character_counter && (
                <p className='dc-input__counter'>
                    {counter}
                    {max_characters ? `/${max_characters}` : ''}
                </p>
            )}
        </div>
    );
};

export default React.forwardRef(Input);
