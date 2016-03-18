import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import recordBridge from '../recordBridge';

const bridgeRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');

    const openModal = (datas) => {

        const $dialog = dialog.create(services, {
            size: 'Full',
            title: 'Bridge',
            loading: false
        });

        return $.post(`${url}prod/bridge/manager/`, datas, function (data) {
            $dialog.setContent(data);
            _onDialogReady();
            return;
        });
    };

    const _onDialogReady = () => {
        recordBridge(services).initialize();
    };

    return { openModal };
};

export default bridgeRecord;
