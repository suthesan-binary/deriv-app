// eslint-disable-next-line import/order
const isMobile = require('@deriv/shared/utils/os').isMobile;
const domain_app_ids = require('@deriv/shared/utils/config').domain_app_ids;
const getAppId = require('@deriv/shared/utils/config').getAppId;
const getDerivComLink = require('@deriv/shared/utils/url').getDerivComLink;
const urlForCurrentDomain = require('@deriv/shared/utils/url').urlForCurrentDomain;
const { getLanguage } = require('@deriv/translations');
const website_name = require('App/Constants/app-config').website_name;
const Client = require('./client_base');
const getElementById = require('../common_functions').getElementById;
const isStorageSupported = require('../storage').isStorageSupported;
const LocalStore = require('../storage').LocalStore;

const Login = (() => {
    const redirectToLogin = () => {
        if (!Client.isLoggedIn() && !isLoginPages() && isStorageSupported(sessionStorage)) {
            sessionStorage.setItem('redirect_url', window.location.href);
            window.location.href = loginUrl();
        }
    };

    const redirectToSignUp = () => {
        window.open(getDerivComLink('/signup/'));
    };

    const loginUrl = () => {
        const server_url = localStorage.getItem('config.server_url');
        const language = getLanguage();
        const signup_device = LocalStore.get('signup_device') || (isMobile() ? 'mobile' : 'desktop');
        const date_first_contact = LocalStore.get('date_first_contact');
        const marketing_queries = `&signup_device=${signup_device}${
            date_first_contact ? `&date_first_contact=${date_first_contact}` : ''
        }`;
        const default_login_url = `https://oauth.deriv.app/oauth2/authorize?app_id=${getAppId()}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}`;

        if (server_url && /qa/.test(server_url)) {
            return `https://${server_url}/oauth2/authorize?app_id=${getAppId()}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}`;
        }
        if (getAppId === domain_app_ids['deriv.app']) {
            return default_login_url;
        }

        return urlForCurrentDomain(default_login_url);
    };

    // TODO: update this to handle logging into /app/ url
    const isLoginPages = () => /logged_inws|redirect/i.test(window.location.pathname);

    const socialLoginUrl = brand => `${loginUrl()}&social_signup=${brand}`;

    const initOneAll = () => {
        ['google', 'facebook'].forEach(provider => {
            const el_button = getElementById(`#button_${provider}`);
            el_button.removeEventListener('click');
            el_button.addEventListener('click', e => {
                e.preventDefault();
                window.location.href = socialLoginUrl(provider);
            });
        });
    };

    return {
        redirectToLogin,
        loginUrl,
        isLoginPages,
        initOneAll,
        redirectToSignUp,
    };
})();

module.exports = Login;
