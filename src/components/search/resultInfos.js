/**
 * triggered via workzone > Basket > context menu
 */
import $ from 'jquery';
import dialog from 'phraseanet-common/src/components/dialog';
import merge from 'lodash.merge';

const resultInfos = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    let searchSelectionSerialized = '0';
    appEvents.listenAll({
        'broadcast.searchResultSelection': (selection) => {
            updateSelectionCounter(selection.asArray.length);
        }
    });

    const initialize = (options) => {
        let {$container} = options;
        updateSelectionCounter(0);
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
    const render = (template, selectionCount) => {
        $('#tool_results').empty().append(template);
        updateSelectionCounter(selectionCount);
    }
    const updateSelectionCounter = (selectionLength) => {
        $('#nbrecsel').empty().append(selectionLength);
    }

    const openModal = (options = {}, content) => {
        const url = configService.get('baseUrl');

        let dialogOptions = merge({
            size: '600x600',
            loading: false
        }, options);

        const $dialog = dialog.create(services, dialogOptions, 1);

        $dialog.setContent(content);
    };

    return {initialize, render};
};

export default resultInfos;
