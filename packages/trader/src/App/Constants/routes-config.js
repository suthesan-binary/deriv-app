import React from 'react';
import Loadable from 'react-loadable';
import { Loading } from '@deriv/components';
import routes from '@deriv/shared/utils/routes';
import { addRoutesConfig } from '@deriv/shared/utils/route';
import { localize } from '@deriv/translations';
import Trade from 'Modules/Trading';

const ContractDetails = React.lazy(() => import(/* webpackChunkName: "contract" */ 'Modules/Contract'));

// MT5 Routes
const MT5 = React.lazy(() => import(/* webpackChunkName: "mt5", webpackPrefetch: true */ 'Modules/MT5'));

// Error Routes
const Page404 = React.lazy(() => import(/* webpackChunkName: "404" */ 'Modules/Page404'));

const handleLoading = props => {
    // 200ms default
    if (props.pastDelay) {
        return <Loading />;
    }
    return null;
};

const makeLazyLoader = importFn => component_name =>
    Loadable.Map({
        loader: {
            ComponentModule: importFn,
        },
        render(loaded, props) {
            const ComponentLazy = loaded.ComponentModule.default[component_name];
            return <ComponentLazy {...props} />;
        },
        loading: handleLoading,
    });

const lazyLoadReportComponent = makeLazyLoader(() => import(/* webpackChunkName: "reports" */ 'Modules/Reports'));

// Order matters
const initRoutesConfig = () => [
    { path: routes.contract, component: ContractDetails, title: localize('Contract Details'), is_authenticated: true },
    { path: routes.mt5, component: MT5, title: localize('MT5'), is_authenticated: true },
    {
        path: routes.reports,
        component: lazyLoadReportComponent('Reports'),
        is_authenticated: true,
        title: localize('Reports'),
        icon_component: 'IcReports',
        routes: [
            {
                path: routes.positions,
                component: lazyLoadReportComponent('OpenPositions'),
                title: localize('Open positions'),
                icon_component: 'IcOpenPositions',
                default: true,
            },
            {
                path: routes.profit,
                component: lazyLoadReportComponent('ProfitTable'),
                title: localize('Profit table'),
                icon_component: 'IcProfitTable',
            },
            {
                path: routes.statement,
                component: lazyLoadReportComponent('Statement'),
                title: localize('Statement'),
                icon_component: 'IcStatement',
            },
        ],
    },
    { path: routes.trade, component: Trade, title: localize('Trade'), exact: true },
];

let routesConfig;

// For default page route if page/path is not found, must be kept at the end of routes_config array
const route_default = { component: Page404, title: localize('Error 404') };

const getRoutesConfig = () => {
    if (!routesConfig) {
        routesConfig = initRoutesConfig();
        routesConfig.push(route_default);
        addRoutesConfig(routesConfig);
    }
    return routesConfig;
};

export default getRoutesConfig;
