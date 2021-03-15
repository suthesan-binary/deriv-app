import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import Icon from 'Components/icon/icon.jsx';
import Body from './modal-body.jsx';
import Footer from './modal-footer.jsx';

class ModalElement extends React.PureComponent {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
        this.state = {
            modal_root: document.getElementById('modal_root'),
        };
    }

    componentDidMount = () => {
        if (this.props.has_close_icon) {
            document.addEventListener('mousedown', this.handleClickOutside);
        }
        this.el.classList.add('dc-modal');
        this.state.modal_root.appendChild(this.el);
        if (typeof this.props.onMount === 'function') {
            this.props.onMount();
        }
    };

    componentWillUnmount = () => {
        if (this.props.has_close_icon) {
            document.removeEventListener('mousedown', this.handleClickOutside);
        }
        this.state.modal_root.removeChild(this.el);
        if (typeof this.props.onUnmount === 'function') {
            this.props.onUnmount();
        }
    };

    handleClickOutside = event => {
        const path = event.path || (event.composedPath && event.composedPath());
        if (
            this.props.has_close_icon &&
            this.wrapper_ref &&
            !path.some(el => el === this.wrapper_ref) &&
            !(this.props.elements_to_ignore && path.find(el => this.props.elements_to_ignore.includes(el))) &&
            !this.is_datepicker_visible &&
            this.props.is_open
        ) {
            this.props.toggleModal();
        }
    };

    get is_datepicker_visible() {
        return this.state.modal_root.querySelectorAll('.dc-datepicker__picker').length;
    }

    render() {
        const {
            id,
            title,
            className,
            is_vertical_centered,
            is_vertical_bottom,
            is_vertical_top,
            header,
            children,
            has_close_icon,
            height,
            toggleModal,
            width,
        } = this.props;

        return ReactDOM.createPortal(
            <div
                ref={this.setWrapperRef}
                id={id}
                className={classNames('dc-modal__container', {
                    [`dc-modal__container_${className}`]: className,
                    'dc-modal__container--small': this.props.small,
                    'dc-modal__container--is-vertical-centered': is_vertical_centered,
                    'dc-modal__container--is-vertical-bottom': is_vertical_bottom,
                    'dc-modal__container--is-vertical-top': is_vertical_top,
                })}
                style={{
                    height: height || 'auto',
                    width: width || 'auto',
                }}
            >
                {(header || title) && (
                    <div
                        className={classNames('dc-modal-header', {
                            [`dc-modal-header--${className}`]: className,
                        })}
                    >
                        {title && (
                            <h3
                                className={classNames('dc-modal-header__title', {
                                    [`dc-modal-header__title--${className}`]: className,
                                })}
                            >
                                {title}
                            </h3>
                        )}
                        {header && (
                            <div
                                className={classNames('dc-modal-header__section', {
                                    [`dc-modal-header__section--${className}`]: className,
                                })}
                            >
                                {header}
                            </div>
                        )}
                        {has_close_icon && (
                            <div onClick={toggleModal} className='dc-modal-header__close'>
                                <Icon icon='IcCross' />
                            </div>
                        )}
                    </div>
                )}
                {children}
            </div>,
            this.el
        );
    }

    setWrapperRef = node => {
        this.wrapper_ref = node;
    };
}

ModalElement.defaultProps = {
    has_close_icon: true,
};

ModalElement.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    has_close_icon: PropTypes.bool,
    header: PropTypes.node,
    id: PropTypes.string,
    is_open: PropTypes.bool,
    onMount: PropTypes.func,
    onUnmount: PropTypes.func,
    small: PropTypes.bool,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    toggleModal: PropTypes.func,
    elements_to_ignore: PropTypes.array,
};

const Modal = ({
    children,
    className,
    header,
    id,
    is_open,
    has_close_icon,
    height,
    onMount,
    onUnmount,
    small,
    is_vertical_bottom,
    is_vertical_centered,
    is_vertical_top,
    title,
    toggleModal,
    width,
    elements_to_ignore,
}) => (
    <CSSTransition
        appear
        in={is_open}
        timeout={250}
        classNames={{
            appear: 'dc-modal__container--enter',
            enter: 'dc-modal__container--enter',
            enterDone: 'dc-modal__container--enter-done',
            exit: 'dc-modal__container--exit',
        }}
        unmountOnExit
    >
        <ModalElement
            className={className}
            header={header}
            id={id}
            is_open={is_open}
            is_vertical_bottom={is_vertical_bottom}
            is_vertical_centered={is_vertical_centered}
            is_vertical_top={is_vertical_top}
            title={title}
            toggleModal={toggleModal}
            has_close_icon={has_close_icon}
            height={height}
            onMount={onMount}
            onUnmount={onUnmount}
            small={small}
            width={width}
            elements_to_ignore={elements_to_ignore}
        >
            {children}
        </ModalElement>
    </CSSTransition>
);

Modal.Body = Body;
Modal.Footer = Footer;

Modal.defaultProps = {
    has_close_icon: true,
};

Modal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    has_close_icon: PropTypes.bool,
    header: PropTypes.node,
    height: PropTypes.string,
    id: PropTypes.string,
    is_open: PropTypes.bool,
    is_vertical_bottom: PropTypes.bool,
    is_vertical_centered: PropTypes.bool,
    is_vertical_top: PropTypes.bool,
    onMount: PropTypes.func,
    onUnmount: PropTypes.func,
    small: PropTypes.bool,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    toggleModal: PropTypes.func,
    width: PropTypes.string,
    elements_to_ignore: PropTypes.array,
};

export default Modal;
