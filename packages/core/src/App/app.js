import { configure } from 'mobx';
import { setStorageEvents } from '@deriv/shared/utils/storage';
import Client from '_common/base/client_base';
import NetworkMonitor from 'Services/network-monitor';
// import OutdatedBrowser      from 'Services/outdated-browser';
import RootStore from 'Stores';

configure({ enforceActions: 'observed' });

const initStore = notification_messages => {
    Client.init();

    const root_store = new RootStore();

    setStorageEvents();

    NetworkMonitor.init(root_store);
    // TODO: Re-enable and update browser checking
    // OutdatedBrowser.init(root_store);
    root_store.client.init();
    root_store.ui.init(notification_messages);
    // root_store.modules.trade.init();

    return root_store;
};

export default initStore;
