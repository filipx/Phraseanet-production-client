/**
 * triggered via workzone > Basket > context menu
 */
import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';

const resultInfos = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    let searchSelectionSerialized = '';
    appEvents.listenAll({
        'broadcast.searchResultSelection': (selection) => {
            searchSelectionSerialized = selection.serialized;
        }
    });

    const initialize = (options) => {
        let {$container} = options;

        $container.on('click', '.search-display-info', (event) => {
            event.preventDefault();
            const $el = $(event.currentTarget);
            let dialogOptions = {};

            if ($el.attr('title') !== undefined) {
                dialogOptions.title = $el.html;
            }

            let dialogContent = $el.data('infos');

            openModal(dialogOptions, dialogContent);
        });
    };

    const openModal = (options = {}, content) => {
        const url = configService.get('baseUrl');

        let dialogOptions = Object.assign({
            size: 'Medium',
            loading: false
        }, options);

        const $dialog = dialog.create(services, dialogOptions, 1);

        $dialog.setContent(content);
    };

    return {initialize};
};

export default resultInfos;
