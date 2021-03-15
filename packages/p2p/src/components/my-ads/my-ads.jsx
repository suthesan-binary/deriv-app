import React from 'react';
import { Button, Loading } from '@deriv/components';
import { localize } from 'Components/i18next';
import Dp2pContext from 'Components/context/dp2p-context';
import { TableError } from 'Components/table/table-error.jsx';
import { requestWS } from 'Utils/websocket';
import FormAds from './form-ads.jsx';
import MyAdsTable from './my-ads-table.jsx';
import './my-ads.scss';
import Verification from '../verification/verification.jsx';

const MyAdsState = ({ message, button_text, buttonOnClick }) => (
    <div className='p2p-my-ads__state'>
        <TableError message={message} />
        {button_text && buttonOnClick && (
            <Button
                type='button'
                className='p2p-my-ads__state-button'
                text={button_text}
                onClick={buttonOnClick}
                primary
            />
        )}
    </div>
);

class MyAds extends React.Component {
    // TODO: Find a better solution for handling no-op instead of using is_mounted flags
    is_mounted = false;

    state = {
        is_loading: true,
        show_form: false,
    };

    handleShowForm = show_form => {
        this.setState({ show_form });
    };

    componentDidMount() {
        this.is_mounted = true;

        if (!this.context.is_advertiser) {
            requestWS({ get_account_status: 1 }).then(response => {
                if (this.is_mounted && !response.error) {
                    const { get_account_status } = response;
                    const { authentication } = get_account_status;
                    const { identity } = authentication;
                    const { status } = identity;

                    this.setState({
                        poi_status: status,
                    });
                }

                this.setState({ is_loading: false });
            });
        }
    }

    applyAction = () => {
        if (!this.context.nickname) {
            return;
        }

        // TODO: redirect without refresh
        if (this.state.should_show_poa_link) {
            window.location.href = '/account/proof-of-address';
        } else {
            window.location.href = '/account/proof-of-identity';
        }
    };

    onClickCreate = () => {
        this.setState({ show_form: true });
    };

    render() {
        if (this.state.is_loading) {
            return <Loading is_fullscreen={false} />;
        }

        if (this.context.is_restricted) {
            return <MyAdsState message={localize('P2P cashier is unavailable in your country.')} />;
        }

        if (this.context.is_advertiser) {
            return (
                <div className='p2p-my-ads'>
                    {this.state.show_form ? (
                        <FormAds handleShowForm={this.handleShowForm} />
                    ) : (
                        <MyAdsTable onClickCreate={this.onClickCreate} />
                    )}
                </div>
            );
        }

        return <Verification poi_status={this.state.poi_status} />;
    }
}

export default MyAds;

MyAds.contextType = Dp2pContext;
