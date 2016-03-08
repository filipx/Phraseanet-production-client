import $ from 'jquery';
import dialog from '../../utils/dialog';

// @REFACTORING @TODO activeTab is lost tbtested
const recordToolsModal = (services, datas, activeTab) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const toolsTemplateEndPoint = 'prod/tools/';


    const openModal = (datas) => {

        let $dialog = dialog.create(services, {
            size: 'Medium',
            title: localeService.t('toolbox'),
            loading: true
        });

        $.get(`${url}${toolsTemplateEndPoint}`
            , datas
            , function (data) {
                $dialog.setContent(data);
                $dialog.setOption('contextArgs', datas);
                var tabs = $('.tabs', $dialog.getDomElement()).tabs();

                // activate tab if exists:
                if (activeTab !== undefined) {
                    tabs.tabs('option', 'active', activeTab);
                }
                return;
            }
        );

        return true;
    };

    return {openModal};
};

export default recordToolsModal;
