import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordPropertyModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const propertyTemplateEndPoint = 'prod/records/property/';


    const openModal = (datas) => {

        let $dialog = dialog.create(services);
        $dialog.load(`${url}${propertyTemplateEndPoint}`, 'GET', datas);
    };

    return {openModal};

    return true;
};

export default recordPropertyModal;
