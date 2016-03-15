import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
const shareRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    let $container = null;
    const initialize = () => {
        $container = $('body');
        $container.on('click', '.share-record-action', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let db = $el.data('db');
            let recordId = $el.data('record-id');

            doShare(db, recordId);
        });
    };

    function doShare(bas, rec) {
        var dialog = dialog.create(services, {
            title: localeService.t('share')
        });

        dialog.load('../prod/share/record/' + bas + '/' + rec + '/', 'GET');
    }

    return { initialize };
};

export default shareRecord;
