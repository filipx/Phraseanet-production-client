import dialog from '../../utils/dialog';

const recordBridge = (services) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const bridgeTemplateEndPoint = 'prod/bridge/manager/';

    const openModal = (datas) => {

        const $dialog = dialog.create({
            size: 'Full',
            title: 'Bridge',
            loading: false
        });
    
        $dialog.load(`${url}${bridgeTemplateEndPoint}`, 'POST', datas);
    
        return true;
    };
    
    return {openModal};
};

export default recordBridge;
