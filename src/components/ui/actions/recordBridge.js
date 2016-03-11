import $ from 'jquery';
import dialog from '../../utils/dialog';
import recordBridge from '../recordBridge';

const bridgeRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const bridgeTemplateEndPoint = 'prod/bridge/manager/';

    const openModal = (datas) => {

        const $dialog = dialog.create(services, {
            size: 'Full',
            title: 'Bridge',
            loading: false
        });

        return $.post(`${url}${bridgeTemplateEndPoint}`, datas, function (data) {
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
