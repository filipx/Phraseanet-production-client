import dialog from '../utils/dialog';
const exportRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    let $container = null;
    const initialize = () => {
        $container = $('body');
        $container.on('click', '.record-export-action', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let key = '';
            let kind = $el.data('kind');
            let idContent = $el.data('id');

            switch (kind) {
                case 'basket':
                    key = 'ssel';
                    break;
                case 'record':
                    key = 'lst';
                    break;
            }

            doExport(`${key}=${idContent}`);
        });
    };

    function doExport(datas) {
        var $dialog = dialog.create(services, { title: language['export'] });

        $.post('../prod/export/multi-export/', datas, function (data) {

            $dialog.setContent(data);

            $('.tabs', $dialog.getDomElement()).tabs();

            $('.close_button', $dialog.getDomElement()).bind('click', function () {
                dialog.close();
            });

            return false;
        });
    }

    return { initialize };
};

export default exportRecord;
