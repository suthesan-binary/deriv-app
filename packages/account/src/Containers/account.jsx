import PropTypes from 'prop-types';
import React from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { VerticalTab, DesktopWrapper, MobileWrapper, FadeWrapper, PageOverlay } from '@deriv/components';
import routes from '@deriv/shared/utils/routes';
import { isMobile } from '@deriv/shared/utils/screen';
import { getSelectedRoute } from '@deriv/shared/utils/route';
import { localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import { WS } from 'Services/ws-methods';
import { flatten } from '../Helpers/flatten';
import AccountLimitInfo from '../Sections/Security/AccountLimits/account-limits-info.jsx';
import 'Styles/account.scss';

class Account extends React.Component {
    // TODO: find better fix for no-op issue
    is_mounted = false;
    state = {
        needs_financial_assessment: false,
        is_loading: true,
        allow_document_upload: false,
    };

    componentDidMount() {
        this.is_mounted = true;
        WS.wait('authorize', 'get_account_status').then(() => {
            if (this.props.account_status) {
                const { status } = this.props.account_status;
                const needs_financial_assessment =
                    this.props.is_high_risk || status.includes('financial_information_not_complete');
                const allow_document_upload = status.includes('allow_document_upload');

                if (this.is_mounted)
                    this.setState({
                        needs_financial_assessment,
                        is_loading: false,
                        allow_document_upload,
                    });
            }
        });
        this.props.toggleAccount(true);
    }

    componentWillUnmount() {
        this.is_mounted = false;
        this.props.toggleAccount(false);
    }

    onClickClose = () => this.props.routeBackInApp(this.props.history);

    render() {
        const { needs_financial_assessment, is_loading, allow_document_upload } = this.state;

        const subroutes = flatten(this.props.routes.map((i) => i.subroutes));
        let list_groups = [...this.props.routes];
        list_groups = list_groups.map((route_group) => ({
            icon: route_group.icon,
            label: route_group.title,
            subitems: route_group.subroutes.map((sub) => subroutes.indexOf(sub)),
        }));
        let selected_content = subroutes.filter((route) => route.path === this.props.location.pathname)[0];
        if (!selected_content) {
            // fallback
            selected_content = subroutes[0];
            this.props.history.push(routes.personal_details);
        }

        if (
            !is_loading &&
            ((!needs_financial_assessment && /financial-assessment/.test(selected_content.path)) ||
                (!allow_document_upload && /proof-of-identity|proof-of-address/.test(selected_content.path)))
        )
            return <Redirect to='/' />;
        // TODO: modify account route to support disabled
        this.props.routes.forEach((menu_item) => {
            menu_item.subroutes.forEach((route) => {
                if (route.path === routes.financial_assessment) {
                    route.is_disabled = !needs_financial_assessment;
                }

                if (route.path === routes.proof_of_identity || route.path === routes.proof_of_address) {
                    route.is_disabled = !allow_document_upload;
                }
            });
        });

        const action_bar_items = [
            {
                onClick: () => {
                    this.props.history.push(routes.trade);
                },
                icon: 'IcCross',
                title: localize('Close'),
            },
        ];

        const is_account_limits_route = selected_content.path === routes.account_limits;
        if (is_account_limits_route) {
            action_bar_items.push({
                component: () => <AccountLimitInfo currency={this.props.currency} is_virtual={this.props.is_virtual} />,
            });
        }

        const selected_route = isMobile()
            ? getSelectedRoute({ routes: subroutes, pathname: this.props.location.pathname })
            : null;

        return (
            <FadeWrapper
                is_visible={this.props.is_visible}
                className='account-page-wrapper'
                keyname='account-page-wrapper'
            >
                <div className='account'>
                    <PageOverlay
                        has_side_note
                        header={isMobile() ? selected_route.title : localize('Settings')}
                        onClickClose={this.onClickClose}
                    >
                        <DesktopWrapper>
                            <VerticalTab
                                alignment='center'
                                is_floating
                                classNameHeader='account__inset_header'
                                current_path={this.props.location.pathname}
                                is_routed
                                is_full_width
                                list={subroutes}
                                list_groups={list_groups}
                            />
                        </DesktopWrapper>
                        <MobileWrapper>
                            {selected_route && (
                                <selected_route.component component_icon={selected_route.icon_component} />
                            )}
                        </MobileWrapper>
                    </PageOverlay>
                </div>
            </FadeWrapper>
        );
    }
}

Account.propTypes = {
    account_status: PropTypes.object,
    currency: PropTypes.string,
    history: PropTypes.object,
    is_high_risk: PropTypes.bool,
    is_virtual: PropTypes.bool,
    is_visible: PropTypes.bool,
    location: PropTypes.object,
    routes: PropTypes.arrayOf(PropTypes.object),
    toggleAccount: PropTypes.func,
};

export default connect(({ client, common, ui }) => ({
    routeBackInApp: common.routeBackInApp,
    account_status: client.account_status,
    currency: client.currency,
    is_high_risk: client.is_high_risk,
    is_virtual: client.is_virtual,
    is_visible: ui.is_account_settings_visible,
    toggleAccount: ui.toggleAccountSettings,
}))(withRouter(Account));
