import * as Rx from 'rx';
import $ from 'jquery';
import dialog from '../utils/dialog';
import Selectable from '../utils/selectable';
let lazyload = require('jquery-lazyload');

const search = (services) => {
    const {configService, localeService, appEvents} = services;

    let searchResult = {
        selection: false,
        navigation: {
            tot: 0, // p4.tot in record preview
            tot_options: false, //datas.form; // p4.tot_options common/tooltip
            tot_query: false, //datas.query; // p4.tot_query
            perPage: 0,
            page: 0
        }
    };
    let $searchForm = null;
    let $searchResult = null;

    const initialize = () => {
        $searchForm = $('#searchForm');
        $searchResult = $('#answers');
        console.log('search form should be here', $searchForm.get(0))

        searchResult.selection = new Selectable($searchResult, {
                selector: '.IMGT',
                limit: 800,
                selectStart: function (event, selection) {
                    $('#answercontextwrap table:visible').hide();
                },
                selectStop: function (event, selection) {
                    prodApp.appEvents.emit('search.doRefreshSelection')
                },
                callbackSelection: function (element) {
                    console.log(element);
                    var elements = $(element).attr('id').split('_');

                    return elements.slice(elements.length - 2, elements.length).join('_');
                }
            });

        /*searchResult.selection.stream.subscribe(function(data){
            console.log('subscribed to stream', data)
        });*/

        $searchForm.on('click', '.toggle-collection', (event) => {
            let $el = $(event.currentTarget);
            toggleCollection($el, $($el.data('toggle-content')))
        });

        $searchForm.on('click', '.toggle-database', (event) => {
            let $el = $(event.currentTarget);
            let state = $el.data('state') || false;
            console.log('toggle database', state)
            toggleDatabase(state);
        });

        $searchForm.on('change', '.select-database', (event) => {
            let $el = $(event.currentTarget);
            let collectionId = $el.data('database');

            selectDatabase($el, collectionId)
        });

        $searchForm.on('change', '.check-filters', (event) => {
            let $el = $(event.currentTarget);
            let shouldSave = $el.data('save') || false;

            checkFilters(shouldSave)
        });

        $searchResult

            .on('click', '.search-navigate-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                console.log('passs page', $el.attr('data-page'))
                navigate($el.data('page'))
            })
            .on('keypress', '.search-navigate-input-action', (event) => {
                // event.preventDefault();
                let $el = $(event.currentTarget);
                let inputPage = $el.val();
                let initialPage = $el.data('initial-value');
                let totalPages = $el.data('total-pages');

                if( isNaN(inputPage)) {
                    event.preventDefault();
                }
                if( event.keyCode == 13) {
                    if (inputPage > 0 && inputPage <= totalPages) {
                        navigate(inputPage)
                    } else{
                        $el.val(initialPage);
                    }
                }
            });

        $('.adv_search_button').on('click', function () {
            var parent = $searchForm.parent();

            var options = {
                size: (bodySize.x - 120)+'x'+(bodySize.y - 120),
                loading: false,
                closeCallback: function (dialog) {

                    var datas = dialog.find('form.phrasea_query').appendTo(parent);//.clone();

                    $('.adv_trigger', $searchForm).show();
                    $('.adv_options', $searchForm).hide();
                }
            };

            let $dialog = dialog.create(services, options);

            $searchForm.appendTo($dialog.getDomElement());

            $dialog.getDomElement().find('.adv_options').show();
            $dialog.getDomElement().find('.adv_trigger').hide();

            $dialog.getDomElement().find('form').bind('submit.conbo', function () {
                $(this).unbind('submit.conbo');
                $dialog.close();
                return false;
            });


            return false;
        });

        $('input[name=search_type]').bind('click', function () {

            var $this = $(this);
            var $record_types = $('#recordtype_sel');

            if ($this.hasClass('mode_type_reg')) {
                $record_types.css("visibility", "hidden");  // better than hide because does not change layout
                $record_types.prop("selectedIndex", 0);
            } else {
                $record_types.css("visibility", "visible");
            }
        });

        initAnswerForm();
    }

    const getResultSelectionStream = () => searchResult.selection.stream;
    const getResultNavigationStream = () => Rx.Observable.ofObjectChanges(searchResult.navigation);

    const onSpecialSearch = (data) => {
        let {qry, allbase} = data;
        console.log('catch onSpecialSearch', data);
        if (allbase) {
            toggleDatabase(true);
        }
        workzoneFacetsModule.resetSelectedFacets();
        $('#EDIT_query').val(decodeURIComponent(qry).replace(/\+/g, " "));
        newSearch(qry);
    }

    const initAnswerForm = () => {
        $('button[type="submit"]', $searchForm).bind('click', function () {
            prodApp.appEvents.emit('facets.doResetSelectedFacets');
            console.log('trigger search')
            newSearch($("#EDIT_query").val());
            return false;
        });


        $('body').on('submit', $searchForm, function (event) {
            event.preventDefault();
            onSearch();
            /*// $this = $(event.currentTarget);
            var $this = $(event.currentTarget),
                method = $this.attr('method') ? $this.attr('method') : 'POST';

            var data = $this.serializeArray();
            console.log('query', method, $this.attr('action'));*/

            return false;
        });
    }

    const newSearch = (query) => {

        searchResult.selection.empty();

        clearAnswers();
        $('#SENT_query').val(query);
        var histo = $('#history-queries ul');

        histo.prepend('<li onclick="prodModule.doSpecialSearch(\'' + query.replace(/\'/g, "\\'") + '\')">' + query + '</li>');

        var lis = $('li', histo);
        if (lis.length > 25) {
            $('li:last', histo).remove();
        }

        $('#idFrameC li.proposals_WZ').removeClass('active');

        appEvents.emit('search.doSearch');
        return false;
    }

    const onSearch = () => {
        console.log('ok search!')
        var data = $searchForm.serializeArray();

        answAjax = $.ajax({
            type: 'POST',
            url: '../prod/query/',
            data: data,
            dataType: 'json',
            beforeSend: function (formData) {
                if (answAjaxrunning && answAjax.abort)
                    answAjax.abort();
                beforeSearch();
            },
            error: function () {
                answAjaxrunning = false;
                $('#answers').removeClass('loading');
            },
            timeout: function () {
                answAjaxrunning = false;
                $('#answers').removeClass('loading');
            },
            success: function (datas) {

                // DEBUG QUERY PARSER
                try {
                    console.info(JSON.parse(datas.parsed_query));
                }
                catch(e) {}

                $('#answers').empty().append(datas.results).removeClass('loading');

                $("#answers img.lazyload").lazyload({
                    container: $('#answers')
                });
                prodApp.appEvents.emit('facets.doLoadFacets', datas.facets);
                // workzoneFacetsModule.loadFacets(datas.facets);

                $('#answers').append('<div id="paginate"><div class="navigation"><div id="tool_navigate"></div></div></div>');

                $('#tool_results').empty().append(datas.infos);
                $('#tool_navigate').empty().append(datas.navigationTpl);

                $.each(searchResult.selection.get(), function (i, el) {
                    $('#IMGT_' + el).addClass('selected');
                });

                // searchResult.tot = datas.total_answers;
                // searchResult.tot_options = datas.form;
                // searchResult.tot_query = datas.query;
                searchResult.navigation = Object.assign(searchResult.navigation, datas.navigation, {
                    tot: datas.total_answers,
                    tot_options: datas.form,
                    tot_query: datas.query
                });

                if (datas.next_page) {
                    $("#NEXT_PAGE, #answersNext").bind('click', function () {
                        navigate(datas.next_page);
                    });
                }
                else {
                    $("#NEXT_PAGE").unbind('click');
                }

                if (datas.prev_page) {
                    $("#PREV_PAGE").bind('click', function () {
                        navigate(datas.prev_page);
                    });
                }
                else {
                    $("#PREV_PAGE").unbind('click');
                }

                afterSearch();
            }
        });
    };

    const beforeSearch = () => {
        if (answAjaxrunning)
            return;
        answAjaxrunning = true;

        clearAnswers();
        $('#tooltip').css({
            'display': 'none'
        });
        $('#answers').addClass('loading').empty();
        $('#answercontextwrap').remove();
    }

    const afterSearch = () => {
        if ($('#answercontextwrap').length === 0)
            $('body').append('<div id="answercontextwrap"></div>');

        $.each($('#answers .contextMenuTrigger'), function () {

            var id = $(this).closest('.IMGT').attr('id').split('_').slice(1, 3).join('_');

            $(this).contextMenu('#IMGT_' + id + ' .answercontextmenu', {
                appendTo: '#answercontextwrap',
                openEvt: 'click',
                dropDown: true,
                theme: 'vista',
                showTransition: 'slideDown',
                hideTransition: 'hide',
                shadow: false
            });
        });

        answAjaxrunning = false;
        $('#answers').removeClass('loading');
        $('.captionTips, .captionRolloverTips').tooltip({
            delay: 0,
            isBrowsable: false,
            extraClass: 'caption-tooltip-container'
        });
        $('.infoTips').tooltip({
            delay: 0
        });
        $('.previewTips').tooltip({
            fixable: true
        });
        $('.thumb .rollovable').hover(
            function () {
                $('.rollover-gif-hover', this).show();
                $('.rollover-gif-out', this).hide();
            },
            function () {
                $('.rollover-gif-hover', this).hide();
                $('.rollover-gif-out', this).show();
            }
        );
        viewNbSelect();
        $('#answers div.IMGT').draggable({
            helper: function () {
                $('body').append('<div id="dragDropCursor" style="position:absolute;z-index:9999;background:red;-moz-border-radius:8px;-webkit-border-radius:8px;"><div style="padding:2px 5px;font-weight:bold;">' + searchResult.selection.length() + '</div></div>');
                return $('#dragDropCursor');
            },
            scope: "objects",
            distance: 20,
            scroll: false,
            cursorAt: {
                top: -10,
                left: -20
            },
            start: function (event, ui) {
                if (!$(this).hasClass('selected'))
                    return false;
            }
        });
        appEvents.emit('ui.linearizeUi');
    }

    const clearAnswers = () => {
        $('#formAnswerPage').val('');
        $('#searchForm input[name="nba"]').val('');
        $('#answers, #dyn_tool').empty();
    };

    const resetSearch = () => {
        var container = $("#ADVSRCH_OPTIONS_ZONE");
        var fieldsSort = $('#ADVSRCH_SORT_ZONE select[name=sort]', container);
        var fieldsSortOrd = $('#ADVSRCH_SORT_ZONE select[name=ord]', container);
        var dateFilterSelect = $('#ADVSRCH_DATE_ZONE select', container);

        $("option.default-selection", fieldsSort).prop("selected", true);
        $("option.default-selection", fieldsSortOrd).prop("selected", true);

        $('#ADVSRCH_FIELDS_ZONE option').prop("selected", false);
        $('#ADVSRCH_OPTIONS_ZONE input:checkbox.field_switch').prop("checked", false);

        $("option:eq(0)", dateFilterSelect).prop("selected", true);
        $('#ADVSRCH_OPTIONS_ZONE .datepicker').val('');
        $('form.adv_search_bind input:text').val('');
        toggleDatabase(true);
    }

    /**
     * adv search : check/uncheck all the collections (called by the buttons "all"/"none")
     *
     * @param bool
     */
    const toggleDatabase = (bool) => {
        $('form.phrasea_query .sbas_list').each(function () {

            var sbas_id = $(this).find('input[name=reference]:first').val();
            if (bool)
                $(this).find(':checkbox').prop('checked', true);
            else
                $(this).find(':checkbox').prop('checked', false);
        });

        checkFilters(true);
    }

    const checkFilters = (save) => {
        var danger = false;
        var search = {
            bases: {},
            fields: [],
            dates: {},
            status: [],
            elasticSort: {}

        };

        var adv_box = $('form.phrasea_query .adv_options');
        var container = $("#ADVSRCH_OPTIONS_ZONE");
        var fieldsSort = $('#ADVSRCH_SORT_ZONE select[name=sort]', container);
        var fieldsSortOrd = $('#ADVSRCH_SORT_ZONE select[name=ord]', container);
        var fieldsSelect = $('#ADVSRCH_FIELDS_ZONE select', container);
        var dateFilterSelect = $('#ADVSRCH_DATE_ZONE select', container);
        var scroll = fieldsSelect.scrollTop();

        // hide all the fields in the "sort by" select, so only the relevant ones will be shown again
        $("option.dbx", fieldsSort).hide().prop("disabled", true);  // dbx is for "field of databases"

        // hide all the fields in the "fields" select, so only the relevant ones will be shown again
        $("option.dbx", fieldsSelect).hide().prop("disabled", true);     // option[0] is "all fields"

        // hide all the fields in the "date field" select, so only the relevant ones will be shown again
        $("option.dbx", dateFilterSelect).hide().prop("disabled", true);   // dbx = all "field" entries in the select = all except the firstt

        var nbTotalSelectedColls = 0;
        $.each($('.sbascont', adv_box), function () {
            var $this = $(this);

            var sbas_id = $this.parent().find('input[name="reference"]').val();
            console.log('sbas id', sbas_id);
            search.bases[sbas_id] = [];

            var nbCols = 0;
            var nbSelectedColls = 0;
            $this.find('.checkbas').each(function (idx, el) {
                nbCols++;
                if($(this).prop('checked')) {
                    nbSelectedColls++;
                    nbTotalSelectedColls++;
                    search.bases[sbas_id].push($(this).val());
                }
            });

            // display the number of selected colls for the databox
            $('.infos_sbas_' + sbas_id).empty().append(nbSelectedColls + '/' + nbCols);

            // if one coll is not checked, show danger
            if(nbSelectedColls != nbCols) {
                $("#ADVSRCH_SBAS_LABEL_" + sbas_id).addClass("danger");
                danger = true;
            }
            else {
                $("#ADVSRCH_SBAS_LABEL_" + sbas_id).removeClass("danger");
            }

            if(nbSelectedColls == 0) {
                // no collections checked for this databox
                // hide the status bits
                $("#ADVSRCH_SB_ZONE_"+sbas_id, container).hide();
                // uncheck
                $("#ADVSRCH_SB_ZONE_"+sbas_id+" input:checkbox", container).prop("checked", false);
            }
            else {
                // at least one coll checked for this databox
                // show again the relevant fields in "sort by" select
                $(".db_"+sbas_id, fieldsSort).show().prop("disabled", false);
                // show again the relevant fields in "from fields" select
                $(".db_"+sbas_id, fieldsSelect).show().prop("disabled", false);
                // show the sb
                $("#ADVSRCH_SB_ZONE_"+sbas_id, container).show();
                // show again the relevant fields in "date field" select
                $(".db_"+sbas_id, dateFilterSelect).show().prop("disabled", false);
            }
        });

        if (nbTotalSelectedColls == 0) {
            // no collections checked at all
            // hide irrelevant filters
            $("#ADVSRCH_OPTIONS_ZONE").hide();
        }
        else {
            // at least one collection checked
            // show relevant filters
            $("#ADVSRCH_OPTIONS_ZONE").show();
        }

        // --------- sort  --------

        // if no field is selected for sort, select the default option
        if($("option:selected:enabled", fieldsSort).length == 0) {
            $("option.default-selection", fieldsSort).prop("selected", true);
            $("option.default-selection", fieldsSortOrd).prop("selected", true);
        }

        search.elasticSort.by = $("option:selected:enabled", fieldsSort).val();
        search.elasticSort.order = $("option:selected:enabled", fieldsSortOrd).val();

        //--------- from fields filter ---------

        // unselect the unavailable fields (or all fields if "all" is selected)
        var optAllSelected = false;
        $("option", fieldsSelect).each(
            function(idx, opt) {
                if(idx == 0) {
                    // nb: unselect the "all" field, so it acts as a button
                    optAllSelected = $(opt).is(":selected");
                }
                if(idx == 0 || optAllSelected || $(opt).is(":disabled") || !$(opt).is(":visible") ) {
                    $(opt).prop("selected", false);
                }
            }
        );

        // here only the relevant fields are selected
        search.fields = fieldsSelect.val();
        if(search.fields == null || search.fields.length == 0) {
            $('#ADVSRCH_FIELDS_ZONE', container).removeClass('danger');
            search.fields = [];
        }
        else {
            $('#ADVSRCH_FIELDS_ZONE', container).addClass('danger');
            danger = true;
        }

        //--------- status bits filter ---------

        // here only the relevant sb are checked
        console.log('should loop through', search.bases)
        const availableDb = search.bases;
        for (var sbas_id in availableDb) {

            var nchecked = 0;
            $("#ADVSRCH_SB_ZONE_"+sbas_id+" :checkbox[checked]", container).each(function () {
                var n = $(this).attr('n');
                search.status[n] = $(this).val().split('_');
                nchecked++;
            });
            if(nchecked == 0) {
                $("#ADVSRCH_SB_ZONE_"+sbas_id, container).removeClass('danger');
            }
            else {
                $("#ADVSRCH_SB_ZONE_"+sbas_id, container).addClass('danger');
                danger = true;
            }
        }
        /*for(sbas_id in search.bases) {
        }*/

        //--------- dates filter ---------

        // if no date field is selected for filter, select the first option
        $('#ADVSRCH_DATE_ZONE', adv_box).removeClass('danger');
        if($("option.dbx:selected:enabled", dateFilterSelect).length == 0) {
            $("option:eq(0)", dateFilterSelect).prop("selected", true);
            $("#ADVSRCH_DATE_SELECTORS", container).hide();
        }
        else {
            $("#ADVSRCH_DATE_SELECTORS", container).show();
            search.dates.minbound = $('#ADVSRCH_DATE_ZONE input[name=date_min]', adv_box).val();
            search.dates.maxbound = $('#ADVSRCH_DATE_ZONE input[name=date_max]', adv_box).val();
            search.dates.field = $('#ADVSRCH_DATE_ZONE select[name=date_field]', adv_box).val();
            console.log(search.dates.minbound, search.dates.maxbound, search.dates.field)
            if ($.trim(search.dates.minbound) || $.trim(search.dates.maxbound)) {
                danger = true;
                $('#ADVSRCH_DATE_ZONE', adv_box).addClass('danger');
            }
        }

        fieldsSelect.scrollTop(scroll);

        // if one filter shows danger, show it on the query
        if (danger) {
            $('#EDIT_query').addClass('danger');
        }
        else {
            $('#EDIT_query').removeClass('danger');
        }

        if (save === true) {
            userModule.setPref('search', JSON.stringify(search));
        }
    }

    const viewNbSelect = () => {
        $("#nbrecsel").empty().append(searchResult.selection.length());
    }

    const selectDatabase = ($el, sbas_id) => {
        console.log('ok select', $el, sbas_id)
        var bool = $el.prop('checked');
        $.each($('.sbascont_' + sbas_id + ' :checkbox'), function () {
            this.checked = bool;
        });

        checkFilters(true);
    }

    const toggleCollection = ($el, $elContent) => {
        if($el.hasClass("deployer_opened")) {
            $el.removeClass("deployer_opened").addClass("deployer_closed");
            $elContent.hide();
        }
        else {
            $el.removeClass("deployer_closed").addClass("deployer_opened");
            $elContent.show();
        }
    }



    const navigate = (page) => {
        console.log('pass',page)
        $('#searchForm input[name="sel"]').val(searchResult.selection.serialize());
        $('#formAnswerPage').val(page);
        console.log('answer', $('#formAnswerPage').val())
        $('#searchForm').submit();
    }


    appEvents.listenAll({
        'search.doSearch': onSearch,
        'search.doNewSearch': newSearch,
        'search.doAfterSearch': afterSearch,
        'search.doResetSearch': resetSearch,
        'search.doClearSearch': clearAnswers,
        'search.doCheckFilters': checkFilters,
        'search.doSpecialSearch': onSpecialSearch,
        'search.doRefreshSelection': viewNbSelect,
        'search.doSelectDatabase': selectDatabase,
        'search.doToggleCollection': toggleCollection,
        'search.doNavigate': navigate,
        /*'search.getResultSelection': () => {
            console.log('ok requesting result selection')
            return searchResult.selection.stream
        }*/
    });

    return { initialize, getResultSelectionStream, getResultNavigationStream };
}

export default search;
