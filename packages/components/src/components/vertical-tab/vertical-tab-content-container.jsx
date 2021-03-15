import classNames from 'classnames';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Icon from 'Components/icon/icon.jsx';

const Content = ({ is_routed, items, selected }) => {
    const selected_item = items.find(item => item.label === selected.label);
    const TabContent = selected_item.value;
    return (
        <React.Fragment>
            {is_routed ? (
                <Switch>
                    {items.map(({ value, component, path, icon }, idx) => {
                        const Component = value || component;
                        return <Route key={idx} path={path} render={() => <Component component_icon={icon} />} />;
                    })}
                </Switch>
            ) : (
                <TabContent key={selected_item.label} className='item-id' />
            )}
            {selected_item.has_side_note && <div className='dc-vertical-tab__content-side-note' />}
        </React.Fragment>
    );
};

export default class VerticalTabContentContainer extends React.PureComponent {
    render() {
        const {
            action_bar,
            action_bar_classname,
            id,
            is_floating,
            is_routed,
            items,
            selected,
            tab_container_classname,
        } = this.props;

        return (
            <div
                className={classNames('dc-vertical-tab__content', {
                    'dc-vertical-tab__content--floating': is_floating,
                })}
            >
                {!is_floating && action_bar && (
                    <div
                        className={classNames('dc-vertical-tab__action-bar', {
                            [action_bar_classname]: !!action_bar_classname,
                        })}
                    >
                        {action_bar.map(({ component, icon, onClick }, idx) => {
                            const Component = component;
                            return component ? (
                                <Component key={idx} />
                            ) : (
                                <div
                                    id={`dt_${id}_close_icon`}
                                    className='dc-vertical-tab__action-bar-wrapper'
                                    key={idx}
                                    onClick={onClick}
                                >
                                    <Icon className='dc-vertical-tab__action-bar--icon' icon={icon} />
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className={classNames('dc-vertical-tab__content-container', tab_container_classname)}>
                    {selected.has_side_note ? (
                        <div className='dc-vertical-tab__content-inner'>
                            <Content is_routed={is_routed} items={items} selected={selected} />
                        </div>
                    ) : (
                        <Content is_routed={is_routed} items={items} selected={selected} />
                    )}
                </div>
            </div>
        );
    }
}
