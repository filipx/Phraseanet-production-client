import * as Rx from 'rx';
import $ from 'jquery';
import * as appCommons from 'phraseanet-common';
import resultInfos from './resultInfos';
import dialog from 'phraseanet-common/src/components/dialog';
import Selectable from '../utils/selectable';
import searchAdvancedForm from './searchAdvancedForm';

const searchForm = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let isAdvancedDialogOpen = false;
    let $dialog = null;


    const initialize = (options) => {
        let initWith = {$container} = options;

        searchAdvancedForm(services).initialize({
            $container: $container
        });

        $container.on('click', '.adv_search_button', (event) => {
            event.preventDefault();
            openAdvancedForm();
        });


        $container.on('click', 'input[name=search_type]', (event) => {
            let $el = $(event.currentTarget);
            let $record_types = $('#recordtype_sel');

            if ($el.hasClass('mode_type_reg')) {
                $record_types.css('visibility', 'hidden');  // better than hide because does not change layout
                $record_types.prop('selectedIndex', 0);
            } else {
                $record_types.css('visibility', 'visible');
            }
        });

        $container.on('submit', (event) => {
            if (isAdvancedDialogOpen === true) {
                $dialog.close();
                isAdvancedDialogOpen = false;
            }
            appEvents.emit('facets.doResetSelectedFacets');
            appEvents.emit('search.doNewSearch', $('#EDIT_query').val())
            return false;
        });
    };

    /**
     * Move entire search form into dialog
     */
    const openAdvancedForm = () => {
        let $searchFormContainer = $container.parent();

        var options = {
            size: (window.bodySize.x - 120) + 'x' + (window.bodySize.y - 120),
            loading: false,
            closeCallback: function (dialog) {
                // move back search form
                $container.appendTo($searchFormContainer);

                // toggle advanced search options
                $('.adv_trigger', $container).show();
                $('.adv_options', $container).hide();
                isAdvancedDialogOpen = false;
            }
        };

        $dialog = dialog.create(services, options);

        // move all content into dialog:
        $dialog.getDomElement().append($container);

        // toggle advanced search options
        $dialog.getDomElement().find('.adv_options').show();
        $dialog.getDomElement().find('.adv_trigger').hide();
        isAdvancedDialogOpen = true;

    }

    return {initialize};
};

export default searchForm;
