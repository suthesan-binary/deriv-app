import React from 'react';
import { PageError } from '@deriv/components';
import routes from '@deriv/shared/utils/routes';
import { getUrlBase } from '@deriv/shared/utils/url';
import { localize } from '@deriv/translations';

const Page404 = () => (
    <PageError
        header={localize('We couldn’t find that page')}
        messages={[
            localize('You may have followed a broken link, or the page has moved to a new address.'),
            localize('Error Code: {{error_code}} page not found', { error_code: 404 }),
        ]}
        redirect_url={routes.trade}
        redirect_label={localize('Return to Trade')}
        classNameImage='page-404__image'
        image_url={getUrlBase('/public/images/common/404.png')}
    />
);

export default Page404;
