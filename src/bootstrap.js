// import * as $ from 'jquery';
let $ = require('jquery');
// let dialogModule = require('../node_modules/phraseanet-common/src/components/dialog.js');
import * as AppCommons from 'phraseanet-common';

import cgu from './components/cgu';
import preferences from './components/preferences';
import publication from './components/publication';
import preview from './components/ui/recordPreview';

import workzone from './components/ui/workzone';
//import { dialogModule } from 'phraseanet-common';
import notify from './components/notify/index';
import Locale from './components/locale';
import ui from './components/ui';
import ConfigService from './components/core/configService';
import LocaleService from './components/locale';
import i18next from 'i18next';
import defaultConfig from './config';
import Emitter from './components/core/emitter';
import user from './components/user';
import basket from './components/basket';
import search from './components/search';
import utils from './components/utils/utils';

class Bootstrap {

    app;
    configService;
    localeService;
    appServices;
    appUi;
    appCgu;
    appPreferences;
    appPublication;
    appWorkzone;
    appSearch;

    constructor(userConfig) {

        const configuration = Object.assign({}, defaultConfig, userConfig);

        this.appEvents = new Emitter();
        this.appEvents.listenAll(user().subscribeToEvents);
        this.appEvents.listenAll(basket().subscribeToEvents);
        // @TODO add locale/translations in streams


        this.configService = new ConfigService(configuration);
        this.localeService = new LocaleService({
            configService: this.configService
        });

        this.localeService.fetchTranslations()
        .then(() => {
            this.onConfigReady();
        });
        this.utils = utils;

        return this;
    }

    onConfigReady() {
        this.appServices = {
            configService: this.configService,
            localeService: this.localeService,
            appEvents: this.appEvents
        };

        // export translation for backward compatibility:
        window.language = this.localeService.getTranslations();

        let appProdNotification = {
            url: this.configService.get('notify.url'),
            moduleId: this.configService.get('notify.moduleId'),
            userId: this.configService.get('notify.userId')
        };

        /**
         * Initialize notifier
         * @type {{bindEvents, createNotifier, isValid, poll}}
         */
        const notifier = notify(this.appServices);
        notifier.initialize();

        // create a new notification poll:
        appProdNotification = notifier.createNotifier(appProdNotification);

        if (notifier.isValid(appProdNotification)) {
            notifier.poll(appProdNotification);
        } else {
            throw new Error('implementation error: failed to configure new notifier');
        }

        this.appUi = ui(this.appServices);
        this.appCgu = cgu(this.appServices);
        this.appSearch = search(this.appServices);
        this.appPublication = publication(this.appServices);
        this.appPreferences = preferences(this.appServices);
        this.appWorkzone = workzone(this.appServices);

        $(document).ready(() => {
            let $body = $('body');
            // trigger default route
            this.initState();
            this.initJqueryPlugins();
            this.initDom();
            this.appUi.initialize();

            // init cgu modal:
            this.appCgu.initialize(this.appServices);
            // init preferences modal:
            this.appPreferences.initialize( {$container: $body});
        });

    }
    initState() {
        let initialState = this.configService.get('initialState');

        switch(initialState) {
            case 'publication':
                this.appPublication.initialize();
                // window.publicationModule.fetchPublications();
                break;
            default:
                // trigger a search on loading
                this.appEvents.emit('search.doSearch');
                //$('#searchForm').trigger('submit');
                // $('form[name="phrasea_query"]').addClass('triggerAfterInit');
                // trigger last search
        }
    }

    initJqueryPlugins() {
        AppCommons.commonModule.initialize();
        $.datepicker.setDefaults({showMonthAfterYear: false});
        $.datepicker.setDefaults($.datepicker.regional[this.localeService.getLocale()]);

        console.log(AppCommons.commonModule )
        $('#help-trigger').contextMenu('#mainMenu .helpcontextmenu', {
            openEvt: 'click', dropDown: true, theme: 'vista', dropDown: true,
            showTransition: 'slideDown',
            hideTransition: 'hide',
            shadow: false
        });
    }
    initDom() {
        document.getElementById('loader_bar').style.width = '30%';

            humane.info = humane.spawn({addnCls: 'humane-libnotify-info', timeout: 1000});
            humane.error = humane.spawn({addnCls: 'humane-libnotify-error', timeout: 1000});
            humane.forceNew = true;
            // cguModule.activateCgus();
            $('body').on('click', 'a.dialog', (event) => {

                var $this = $(event.currentTarget), size = 'Medium';

                if ($this.hasClass('small-dialog')) {
                    size = 'Small';
                } else if ($this.hasClass('full-dialog')) {
                    size = 'Full';
                }

                var options = {
                    size: size,
                    loading: true,
                    title: $this.attr('title'),
                    closeOnEscape: true
                };

                $dialog = utils.dialog.create(this.appServices, options);

                $.ajax({
                    type: "GET",
                    url: $this.attr('href'),
                    dataType: 'html',
                    success: function (data) {
                        $dialog.setContent(data);
                        return;
                    }
                });

                return false;
            });




            $(document).bind('contextmenu', function (event) {
                var targ;
                if (event.target)
                    targ = event.target;
                else if (event.srcElement)
                    targ = event.srcElement;
                if (targ.nodeType === 3)// safari bug
                    targ = targ.parentNode;

                var gogo = true;
                var targ_name = targ.nodeName ? targ.nodeName.toLowerCase() : false;

                if (targ_name !== 'input' && targ_name.toLowerCase() !== 'textarea') {
                    gogo = false;
                }
                if (targ_name === 'input') {
                    if ($(targ).is(':checkbox'))
                        gogo = false;
                }

                return gogo;
            });



            $('#loader_bar').stop().animate({
                width: '70%'
            }, 450);

            /*$('#history-queries ul li').on('mouseover',function () {
                $(this).addClass('hover');
            }).on('mouseout', function () {
                $(this).removeClass('hover');
            });*/

            startThesaurus();
            this.appEvents.emit('search.doCheckFilters')
            this.appUi.activeZoning();
            //prodModule._activeZoning();






            this.appEvents.emit('ui.resizeAll');

            $(window).bind('resize', () => {
                this.appEvents.emit('ui.resizeAll');
            });
            $('body').append('<iframe id="MODALDL" class="modalbox" src="about:blank;" name="download" style="display:none;border:none;" frameborder="0"></iframe>');

            $('body').append('<iframe id="idHFrameZ" src="about:blank" style="display:none;" name="HFrameZ"></iframe>');


            $('.datepicker').datepicker({
                changeYear: true,
                changeMonth: true,
                dateFormat: 'yy/mm/dd'
            });

            /*$.ajaxSetup({

             error: function (jqXHR, textStatus, errorThrown) {
             //Request is aborted
             if (errorThrown === 'abort') {
             return false;
             } else {
             showModal('error', {
             title: language.errorAjaxRequest + ' ' + jqXHR.responseText
             });
             }
             },
             timeout: function () {
             showModal('timeout', {
             title: 'Server not responding'
             });
             }
             });*/

            $('.tools .answer_selector').bind('click',function () {
                let el = $(this);
                let p4 = window.p4;
                if (el.hasClass('all_selector')) {
                    p4.Results.Selection.selectAll();
                }
                else {
                    if (el.hasClass('none_selector')) {
                        p4.Results.Selection.empty();
                    }
                    else {
                        if (el.hasClass('starred_selector')) {

                        }
                        else {
                            if (el.hasClass('video_selector')) {
                                p4.Results.Selection.empty();
                                p4.Results.Selection.select('.type-video');
                            }
                            else {
                                if (el.hasClass('image_selector')) {
                                    p4.Results.Selection.empty();
                                    p4.Results.Selection.select('.type-image');
                                }
                                else {
                                    if (el.hasClass('document_selector')) {
                                        p4.Results.Selection.empty();
                                        p4.Results.Selection.select('.type-document');
                                    }
                                    else {
                                        if (el.hasClass('audio_selector')) {
                                            p4.Results.Selection.empty();
                                            p4.Results.Selection.select('.type-audio');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }).bind('mouseover',function (event) {
                if (utilsModule.is_ctrl_key(event)) {
                    $(this).addClass('add_selector');
                }
                else {
                    $(this).removeClass('add_selector');
                }
            }).bind('mouseout', function () {
                $(this).removeClass('add_selector');
            });

            // getLanguage();
            this.appSearch.initAnswerForm();
            // prodModule._initAnswerForm();

            // setTimeout("pollNotifications();", 10000);

            $(this).bind('keydown', function (event) {
                var cancelKey = false;
                var shortCut = false;

                if ($('#MODALDL').is(':visible')) {
                    switch (event.keyCode) {
                        case 27:
                            // hide download
                            commonModule.hideOverlay(2);
                            $('#MODALDL').css({
                                'display': 'none'
                            });
                            break;
                    }
                }
                else {
                    if ($('#EDITWINDOW').is(':visible')) {

                        switch (event.keyCode) {
                            case 9:	// tab ou shift-tab
                                recordEditorModule.edit_chgFld(event, utilsModule.is_shift_key(event) ? -1 : 1);
                                cancelKey = shortCut = true;
                                break;
                            case 27:
                                recordEditorModule.edit_cancelMultiDesc(event);
                                shortCut = true;
                                break;

                            case 33:	// pg up
                                if (!p4.edit.textareaIsDirty || recordEditorModule.edit_validField(event, "ask_ok"))
                                    recordEditorModule.skipImage(event, 1);
                                cancelKey = true;
                                break;
                            case 34:	// pg dn
                                if (!p4.edit.textareaIsDirty || recordEditorModule.edit_validField(event, "ask_ok"))
                                    recordEditorModule.skipImage(event, -1);
                                cancelKey = true;
                                break;
                        }

                    }
                    else {
                        if (p4.preview.open) {
                            /* handled in preview module
                            if (($('#dialog_dwnl:visible').length === 0 && $('#DIALOG1').length === 0 && $('#DIALOG2').length === 0)) {
                                switch (event.keyCode) {
                                    case 39:
                                        recordPreviewModule.getNext();
                                        cancelKey = shortCut = true;
                                        break;
                                    case 37:
                                        recordPreviewModule.getPrevious();
                                        cancelKey = shortCut = true;
                                        break;
                                    case 27://escape
                                        recordPreviewModule.closePreview();
                                        break;
                                    case 32:
                                        if (p4.slideShow)
                                            recordPreviewModule.stopSlide();
                                        else
                                            recordPreviewModule.startSlide();
                                        cancelKey = shortCut = true;
                                        break;
                                }
                            }*/
                        }
                        else {
                            if ($('#EDIT_query').hasClass('focused'))
                                return true;

                            if ($('.overlay').is(':visible'))
                                return true;

                            if ($('.ui-widget-overlay').is(':visible'))
                                return true;

                            switch (p4.active_zone) {
                                case 'rightFrame':
                                    switch (event.keyCode) {
                                        case 65:	// a
                                            if (utilsModule.is_ctrl_key(event)) {
                                                $('.tools .answer_selector.all_selector').trigger('click');
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        case 80://P
                                            if (utilsModule.is_ctrl_key(event)) {
                                                _onOpenPrintModal("lst=" + p4.Results.Selection.serialize());
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        case 69://e
                                            if (utilsModule.is_ctrl_key(event)) {
                                                openRecordEditor('IMGT', p4.Results.Selection.serialize());
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        case 40:	// down arrow
                                            $('#answers').scrollTop($('#answers').scrollTop() + 30);
                                            cancelKey = shortCut = true;
                                            break;
                                        case 38:	// down arrow
                                            $('#answers').scrollTop($('#answers').scrollTop() - 30);
                                            cancelKey = shortCut = true;
                                            break;
                                        case 37://previous page
                                            $('#PREV_PAGE').trigger('click');
                                            shortCut = true;
                                            break;
                                        case 39://previous page
                                            $('#NEXT_PAGE').trigger('click');
                                            shortCut = true;
                                            break;
                                        case 9://tab
                                            if (!utilsModule.is_ctrl_key(event) && !$('.ui-widget-overlay').is(':visible') && !$('.overlay_box').is(':visible')) {
                                                document.getElementById('EDIT_query').focus();
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                    }
                                    break;


                                case 'idFrameC':
                                    switch (event.keyCode) {
                                        case 65:	// a
                                            if (utilsModule.is_ctrl_key(event)) {
                                                p4.WorkZone.Selection.selectAll();
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        case 80://P
                                            if (utilsModule.is_ctrl_key(event)) {
                                                _onOpenPrintModal("lst=" + p4.WorkZone.Selection.serialize());
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        case 69://e
                                            if (utilsModule.is_ctrl_key(event)) {
                                                openRecordEditor('IMGT', p4.WorkZone.Selection.serialize());
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                        //						case 46://del
                                        //								_deleteRecords(p4.Results.Selection.serialize());
                                        //								cancelKey = true;
                                        //							break;
                                        case 40:	// down arrow
                                            $('#baskets div.bloc').scrollTop($('#baskets div.bloc').scrollTop() + 30);
                                            cancelKey = shortCut = true;
                                            break;
                                        case 38:	// down arrow
                                            $('#baskets div.bloc').scrollTop($('#baskets div.bloc').scrollTop() - 30);
                                            cancelKey = shortCut = true;
                                            break;
                                        //								case 37://previous page
                                        //									$('#PREV_PAGE').trigger('click');
                                        //									break;
                                        //								case 39://previous page
                                        //									$('#NEXT_PAGE').trigger('click');
                                        //									break;
                                        case 9://tab
                                            if (!utilsModule.is_ctrl_key(event) && !$('.ui-widget-overlay').is(':visible') && !$('.overlay_box').is(':visible')) {
                                                document.getElementById('EDIT_query').focus();
                                                cancelKey = shortCut = true;
                                            }
                                            break;
                                    }
                                    break;


                                case 'mainMenu':
                                    break;


                                case 'headBlock':
                                    break;

                                default:
                                    break;

                            }
                        }
                    }
                }

                if (!$('#EDIT_query').hasClass('focused') && event.keyCode !== 17) {

                    if ($('#keyboard-dialog.auto').length > 0 && shortCut) {
                        prodModule._triggerShortcuts();
                    }
                }
                if (cancelKey) {
                    event.cancelBubble = true;
                    if (event.stopPropagation)
                        event.stopPropagation();
                    return(false);
                }
                return(true);
            });


            $('#EDIT_query').bind('focus',function () {
                $(this).addClass('focused');
            }).bind('blur', function () {
                $(this).removeClass('focused');
            });





            $('input.input_select_copy').on('focus', function () {
                $(this).select();
            });
            $('input.input_select_copy').on('blur', function () {
                $(this).deselect();
            });
            $('input.input_select_copy').on('click', function () {
                $(this).select();
            });

            $('#loader_bar').stop().animate({
                width: '100%'
            }, 450, function () {
                $('#loader').parent().fadeOut('slow', function () {
                    $(this).remove();
                });
            });


    }
}

const bootstrap = (userConfig) => {
    return new Bootstrap(userConfig);
};

export default bootstrap;
