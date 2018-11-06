import * as Rx from 'rx';
import $ from 'jquery';
import _ from 'underscore';
import resultInfos from './resultInfos';
import user from 'phraseanet-common/src/components/user';
import dialog from 'phraseanet-common/src/components/dialog';
import Selectable from '../utils/selectable';
import searchAdvancedForm from './advSearch/searchAdvancedForm';
import searchGeoForm from './geoSearch/searchGeoForm';
const searchForm = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let $searchValue = null;
    let isAdvancedDialogOpen = false;
    let $dialog = null;
    let geoForm;
    let searchPreferences = {};
    let $geoSearchTriggerImg;
    const initialize = (options) => {
        let initWith = {$container} = options;
        $searchValue = $('#EDIT_query');

        searchAdvancedForm(services).initialize({
            $container: $container
        });
        geoForm = searchGeoForm(services);

        $container.on('click', '.adv_search_button', (event) => {
            event.preventDefault();
            openAdvancedForm();
        });
        
        toggleSearchState();
        appEvents.emit('search.doCheckFilters');
        
        $container.on('click', '.geo-search-action-btn', (event) => {
            event.preventDefault();
            geoForm.openModal({
                drawnItems: searchPreferences.drawnItems || false,
            });
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
            appEvents.emit('search.doNewSearch', $searchValue.val())
            return false;
        });
    };

    const toggleSearchState = () => {
        $geoSearchTriggerImg = $('.geo-search-action-btn').find('img');
        $geoSearchTriggerImg.attr('src', '/assets/common/images/icons/map.png');
        if (searchPreferences.drawnItems !== undefined) {
            if (!_.isEmpty(searchPreferences.drawnItems)) {
                $geoSearchTriggerImg.attr('src', '/assets/common/images/icons/map-active.png');
            }

        }
    }

    const updateSearchValue = (params) => {
        let {searchValue} = params;
        let reset = params.reset !== undefined ? params.reset : false;
        let submit = params.submit !== undefined ? params.submit : false;
        $searchValue.val(searchValue);

        // toogle states:
        toggleSearchState();


        if (submit === true) {
            if (reset === true) {
                appEvents.emit('search.doNewSearch', $searchValue.val())
            } else {
                appEvents.emit('search.doRefreshState');
            }
        }

        return searchValue;
    }
    const getSearchValue = () => {
        return $searchValue.val();
    }

    const updateSearchPreferences = (preferences) => {
        for (let prefKey in preferences) {
            if (preferences.hasOwnProperty(prefKey)) {
                searchPreferences[prefKey] = preferences[prefKey];
                user.setPref(prefKey, JSON.stringify(preferences[prefKey]));
            }
        }
    }

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
        $dialog.getDomElement().closest('.ui-dialog').addClass('advanced_search_dialog_container');

        // move all content into dialog:
        $dialog.getDomElement().append($container);

        // toggle advanced search options
        $dialog.getDomElement().find('.adv_options').show();
        $dialog.getDomElement().find('.adv_trigger').hide();
        isAdvancedDialogOpen = true;

    }
    appEvents.listenAll({
        'search.getSearchValue': getSearchValue,
        'search.updateSearchValue': updateSearchValue,
        'search.updatePreferences': updateSearchPreferences
    })
    return {initialize};
};

export default searchForm;
