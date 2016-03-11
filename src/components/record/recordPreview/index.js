let $ = require('jquery');
import * as Rx from 'rx';
let image_enhancer = require('imports?$=jquery!../../utils/jquery-plugins/imageEnhancer');
const previewRecordService = (services) => {
    const { configService, localeService, appEvents } = services;
    let $bodyContainer = null;
    let $previewContainer = null;
    var prevAjax, prevAjaxrunning;
    prevAjaxrunning = false;
    let stream = new Rx.Subject();
    let options = {
        open: false,
        current: false,
        slideShow: false,
        navigation: {
            perPage: 0,
            page: 0
        }
    };
    const getPreviewOptionStream = () => Rx.Observable.ofObjectChanges(options);
    const initialize = () => {
        $bodyContainer = $('body');
        $previewContainer = $('#PREVIEWBOX');

        $('#PREVIEWIMGDESC').tabs();

        // if contained in record editor (p4.edit.editBox):
        $('#PREVIEWBOX .gui_vsplitter').draggable({
            axis: 'x',
            containment: 'parent',
            drag: function (event, ui) {
                var x = $(ui.position.left)[0];
                if (x < 330 || x > (bodySize.x - 400)) {
                    return false;
                }
                var v = $(ui.position.left)[0];
                $('#PREVIEWLEFT').width(v);
                $('#PREVIEWRIGHT').css('left', $(ui.position.left)[0]);
                resizePreview();
            }
        });
        _bindEvents();
    };

    const _bindEvents = () => {
        $bodyContainer
            .on('click', '.close-preview-action', (event) => {
                event.preventDefault();
                closePreview();
            })
            .on('dblclick', '.open-preview-action', (event) => {
                let $el = $(event.currentTarget);
                // env, pos, contId, reload
                let reload = $el.data('reload') === true ? true : false;
                _openPreview($el.data('kind'), $el.data('position'), $el.data('id'), $el.data('kind'));
            });
        $previewContainer
            .on('click', '.preview-navigate-action', (event) => {
                event.preventDefault();
                let $el = $(event.currentTarget);
                let dir = $el.data('direction') === 'forward' ? getNext() : getPrevious();
            })
            .on('click', '.preview-start-slideshow-action', (event) => {
                event.preventDefault();
                startSlide();
            })
            .on('click', '.preview-stop-slideshow-action', (event) => {
                event.preventDefault();
                stopSlide();
            });
    };

    /**
     * Handle global keydown event if preview is open
     * @param event
     */
    const onGlobalKeydown = (event, specialKeyState) => {
        if ( specialKeyState === undefined ) {
            let specialKeyState = {
                isCancelKey: false,
                isShortcutKey: false
            };
        }
        if (options.open) {
            if (($('#dialog_dwnl:visible').length === 0 && $('#DIALOG1').length === 0 && $('#DIALOG2').length === 0)) {

                switch (event.keyCode) {
                    // next
                    case 39:
                        getNext();
                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                        break;
                    // previous
                    case 37:
                        getPrevious();
                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                        break;
                    case 27://escape
                        closePreview();
                        break;
                    case 32:
                        if (options.slideShow)
                            stopSlide();
                        else
                            startSlide();
                        specialKeyState.isCancelKey = specialKeyState.isShortcutKey = true;
                        break;
                }
            }
        }
        return specialKeyState;
    };

    /**
     *
     * @param env
     * @param pos - relative position in current page
     * @param contId
     * @param reload
     */
    function _openPreview(env, pos, contId, reload) {

        if (contId === undefined)
            contId = '';
        var roll = 0;
        var justOpen = false;

        if (!options.open) {
            commonModule.showOverlay();

            $('#PREVIEWIMGCONT').disableSelection();

            justOpen = true;

            if (!( navigator.userAgent.match(/msie/i))) {
                $('#PREVIEWBOX').css({
                    'display': 'block',
                    'opacity': 0
                }).fadeTo(500, 1);
            } else {
                $('#PREVIEWBOX').css({
                    'display': 'block',
                    'opacity': 1
                });
            }
            options.open = true;
            options.nCurrent = 5;
            $('#PREVIEWCURRENT, #PREVIEWOTHERSINNER, #SPANTITLE').empty();
            resizePreview();
            if (env === 'BASK')
                roll = 1;

        }

        if (reload === true)
            roll = 1;


        $('#tooltip').css({
            'display': 'none'
        });

        $('#PREVIEWIMGCONT').empty();

        var options_serial = options.navigation.tot_options;
        var query = options.navigation.tot_query;

        // keep relative position for answer train:
        var relativePos = pos;
        // update real absolute position with pagination:
        var absolutePos = parseInt(options.navigation.perPage, 10) * (parseInt(options.navigation.page, 10) - 1) + parseInt(pos, 10);

        // if comes from story, work with relative positionning
        if (env === 'REG') {
            // @TODO - if event comes from workzone (basket|story),
            // we can use the relative position in order to display the doubleclicked records
            // except we can't know the original event in this implementation
            absolutePos = 0;
        }
        let posAsk = null;
        prevAjax = $.ajax({
            type: 'POST',
            url: '../prod/records/',
            dataType: 'json',
            data: {
                env: env,
                pos: absolutePos,
                cont: contId,
                roll: roll,
                options_serial: options_serial,
                query: query
            },
            beforeSend: function () {
                if (prevAjaxrunning)
                    prevAjax.abort();
                if (env === 'RESULT')
                    $('#current_result_n').empty().append(parseInt(pos) + 1);
                prevAjaxrunning = true;
                $('#PREVIEWIMGDESC, #PREVIEWOTHERS').addClass('loading');
            },
            error: function (data) {
                prevAjaxrunning = false;
                $('#PREVIEWIMGDESC, #PREVIEWOTHERS').removeClass('loading');

            },
            timeout: function () {
                prevAjaxrunning = false;
                $('#PREVIEWIMGDESC, #PREVIEWOTHERS').removeClass('loading');

            },
            success: function (data) {
                _cancelPreview();
                prevAjaxrunning = false;

                if (data.error) {
                    $('#PREVIEWIMGDESC, #PREVIEWOTHERS').removeClass('loading');
                    alert(data.error);
                    if (justOpen)
                        closePreview();
                    return;
                }
                posAsk = data.pos - 1;

                $('#PREVIEWIMGCONT').empty().append(data.html_preview);
                $('#PREVIEWIMGCONT .thumb_wrapper')
                    .width('100%').height('100%').image_enhance({ zoomable: true });

                $('#PREVIEWIMGDESCINNER').empty().append(data.desc);
                $('#HISTORICOPS').empty().append(data.history);
                $('#popularity').empty().append(data.popularity);

                if ($('#popularity .bitly_link').length > 0) {

                    BitlyCB.statsResponse = function (data) {
                        var result = data.results;
                        if ($('#popularity .bitly_link_' + result.userHash).length > 0) {
                            $('#popularity .bitly_link_' + result.userHash).append(' (' + result.clicks + ' clicks)');
                        }
                    };
                    BitlyClient.stats($('#popularity .bitly_link').html(), 'BitlyCB.statsResponse');
                }

                options.current = {};
                options.current.width = parseInt($('#PREVIEWIMGCONT input[name=width]').val());
                options.current.height = parseInt($('#PREVIEWIMGCONT input[name=height]').val());
                options.current.tot = data.tot;
                options.current.pos = relativePos;

                if ($('#PREVIEWBOX img.record.zoomable').length > 0) {
                    $('#PREVIEWBOX img.record.zoomable').draggable();
                }

                $('#SPANTITLE').empty().append(data.title);
                $('#PREVIEWTITLE_COLLLOGO').empty().append(data.collection_logo);
                $('#PREVIEWTITLE_COLLNAME').empty().append(data.collection_name);

                _setPreview();

                if (env !== 'RESULT') {
                    if (justOpen || reload) {
                        _setCurrent(data.current);
                    }
                    _viewCurrent($('#PREVIEWCURRENT li.selected'));
                }
                else {
                    if (!justOpen) {
                        $('#PREVIEWCURRENT li.selected').removeClass('selected');
                        $('#PREVIEWCURRENTCONT li.current' + absolutePos).addClass('selected');
                    }
                    if (justOpen || ($('#PREVIEWCURRENTCONT li.current' + absolutePos).length === 0) || ($('#PREVIEWCURRENTCONT li:last')[0] === $('#PREVIEWCURRENTCONT li.selected')[0]) || ($('#PREVIEWCURRENTCONT li:first')[0] === $('#PREVIEWCURRENTCONT li.selected')[0])) {
                        _getAnswerTrain(pos, data.tools, query, options_serial);
                    }

                    _viewCurrent($('#PREVIEWCURRENT li.selected'));
                }
                if (env === 'REG' && $('#PREVIEWCURRENT').html() === '') {
                    _getRegTrain(contId, pos, data.tools);
                }
                _setOthers(data.others);
                _setTools(data.tools);
                $('#tooltip').css({
                    'display': 'none'
                });
                $('#PREVIEWIMGDESC, #PREVIEWOTHERS').removeClass('loading');
                if (!justOpen || (options.mode !== env))
                    resizePreview();

                options.mode = env;
                $('#EDIT_query').focus();

                $('#PREVIEWOTHERSINNER .otherBaskToolTip').tooltip();

                return;
            }

        });

    }

    function closePreview() {
        options.open = false;
        commonModule.hideOverlay();

        $('#PREVIEWBOX').fadeTo(500, 0);
        $('#PREVIEWBOX').queue(function () {
            $(this).css({
                'display': 'none'
            });
            _cancelPreview();
            $(this).dequeue();
        });

    }

    function startSlide() {
        if (!options.slideShow) {
            options.slideShow = true;
        }
        if (options.slideShowCancel) {
            options.slideShowCancel = false;
            options.slideShow = false;
            $('#start_slide').show();
            $('#stop_slide').hide();
        }
        if (!options.open) {
            options.slideShowCancel = false;
            options.slideShow = false;
            $('#start_slide').show();
            $('#stop_slide').hide();
        }
        if (options.slideShow) {
            $('#start_slide').hide();
            $('#stop_slide').show();
            getNext();
            setTimeout('startSlide()', 3000);
        }
    }

    function stopSlide() {
        options.slideShowCancel = true;
        $('#start_slide').show();
        $('#stop_slide').hide();
    }

    function getNext() {
        if (options.mode === 'REG' && parseInt(options.current.pos) === 0)
            $('#PREVIEWCURRENTCONT li img:first').trigger('click');
        else {
            if (options.mode === 'RESULT') {
                let posAsk = parseInt(options.current.pos) + 1;
                posAsk = (posAsk >= parseInt(options.navigation.tot) || isNaN(posAsk)) ? 0 : posAsk;
                _openPreview('RESULT', posAsk, '', false);
            }
            else {
                if (!$('#PREVIEWCURRENT li.selected').is(':last-child'))
                    $('#PREVIEWCURRENT li.selected').next().children('img').trigger('click');
                else
                    $('#PREVIEWCURRENT li:first-child').children('img').trigger('click');
            }

        }
    }

    function getPrevious() {
        if (options.mode === 'RESULT') {
            let posAsk = parseInt(options.current.pos) - 1;
            posAsk = (posAsk < 0) ? ((parseInt(options.navigation.tot) - 1)) : posAsk;
            _openPreview('RESULT', posAsk, '', false);
        }
        else {
            if (!$('#PREVIEWCURRENT li.selected').is(':first-child'))
                $('#PREVIEWCURRENT li.selected').prev().children('img').trigger('click');
            else
                $('#PREVIEWCURRENT li:last-child').children('img').trigger('click');
        }
    }

    function _setPreview() {
        if (!options.current)
            return;

        var zoomable = $('img.record.zoomable');
        if (zoomable.length > 0 && zoomable.hasClass('zoomed'))
            return;

        var h = parseInt(options.current.height);
        var w = parseInt(options.current.width);
        var t = 20;
        var de = 0;

        var margX = 0;
        var margY = 0;

        if ($('#PREVIEWIMGCONT .record_audio').length > 0) {
            margY = 100;
            de = 60;
        }

        var ratioP = w / h;
        var ratioD = parseInt(options.width) / parseInt(options.height);

        if (ratioD > ratioP) {
            //je regle la hauteur d'abord
            if ((parseInt(h) + margY) > parseInt(options.height)) {
                h = Math.round(parseInt(options.height) - margY);
                w = Math.round(h * ratioP);
            }
        }
        else {
            if ((parseInt(w) + margX) > parseInt(options.width)) {
                w = Math.round(parseInt(options.width) - margX);
                h = Math.round(w / ratioP);
            }
        }

        t = Math.round((parseInt(options.height) - h - de) / 2);
        var l = Math.round((parseInt(options.width) - w) / 2);
        $('#PREVIEWIMGCONT .record').css({
            width: w,
            height: h,
            top: t,
            left: l
        }).attr('width', w).attr('height', h);
    }

    function _setCurrent(current) {
        if (current !== '') {
            var el = $('#PREVIEWCURRENT');
            el.removeClass('loading').empty().append(current);

            $('ul', el).width($('li', el).length * 80);
            $('img.prevRegToolTip', el).tooltip();
            $.each($('img.openPreview'), function (i, el) {
                var jsopt = $(el).attr('jsargs').split('|');
                $(el).removeAttr('jsargs');
                $(el).removeClass('openPreview');
                $(el).bind('click', function () {
                    _viewCurrent($(this).parent());
                    // convert abssolute to relative position
                    var absolutePos = jsopt[1];
                    var relativePos = parseInt(absolutePos, 10) - parseInt(options.navigation.perPage, 10) * (parseInt(options.navigation.page, 10) - 1);
                    // keep relative position for answer train:
                    _openPreview(jsopt[0], relativePos, jsopt[2], false);
                });
            });
        }
    }

    function _viewCurrent(el) {
        if (el.length === 0) {
            return;
        }
        $('#PREVIEWCURRENT li.selected').removeClass('selected');
        el.addClass('selected');
        $('#PREVIEWCURRENTCONT').animate({ 'scrollLeft': ($('#PREVIEWCURRENT li.selected').position().left + $('#PREVIEWCURRENT li.selected').width() / 2 - ($('#PREVIEWCURRENTCONT').width() / 2 )) });
        return;
    }

    function reloadPreview() {
        $('#PREVIEWCURRENT li.selected img').trigger('click');
    }

    function _getAnswerTrain(pos, tools, query, options_serial) {
        // keep relative position for answer train:
        var relativePos = pos;
        // update real absolute position with pagination:
        var absolutePos = parseInt(options.navigation.perPage, 10) * (parseInt(options.navigation.page, 10) - 1) + parseInt(pos, 10);

        $('#PREVIEWCURRENTCONT').fadeOut('fast');
        $.ajax({
            type: 'POST',
            url: '/prod/query/answer-train/',
            dataType: 'json',
            data: {
                pos: absolutePos,
                options_serial: options_serial,
                query: query
            },
            success: function (data) {
                _setCurrent(data.current);
                _viewCurrent($('#PREVIEWCURRENT li.selected'));
                _setTools(tools);
                return;
            }
        });
    }

    function _getRegTrain(contId, pos, tools) {
        $.ajax({
            type: 'POST',
            url: '/prod/query/reg-train/',
            dataType: 'json',
            data: {
                cont: contId,
                pos: pos
            },
            success: function (data) {
                _setCurrent(data.current);
                _viewCurrent($('#PREVIEWCURRENT li.selected'));
                if (typeof (tools) !== 'undefined')
                    _setTools(tools);
                return;
            }
        });
    }

    function _cancelPreview() {
        $('#PREVIEWIMGDESCINNER').empty();
        $('#PREVIEWIMGCONT').empty();
        options.current = false;
    }

    function _setOthers(others) {

        $('#PREVIEWOTHERSINNER').empty();
        if (others !== '') {
            $('#PREVIEWOTHERSINNER').append(others);

            $('#PREVIEWOTHERS table.otherRegToolTip').tooltip();
        }
    }

    function _setTools(tools) {
        $('#PREVIEWTOOL').empty().append(tools);
        if (!options.slideShowCancel && options.slideShow) {
            $('#start_slide').hide();
            $('#stop_slide').show();
        } else {
            $('#start_slide').show();
            $('#stop_slide').hide();
        }
    }

    function resizePreview() {
        options.height = $('#PREVIEWIMGCONT').height();
        options.width = $('#PREVIEWIMGCONT').width();
        _setPreview();
    }

    const shouldResize = () => {
        if ( options.open) {
            resizePreview();
        }
    };

    const shouldReload = () => {
        if ( options.open) {
            reloadPreview();
        }
    };

    const onNavigationChanged = (navigation = {}) => {
        options.navigation = Object.assign(options.navigation, navigation);
    };

    appEvents.listenAll({
        'broadcast.searchResultNavigation': onNavigationChanged,
        'preview.doResize': shouldResize,
        'preview.doReload': shouldReload,
        'preview.close': closePreview
    });

    return {
        initialize,
        onGlobalKeydown,
        getPreviewOptionStream,
        //_openPreview,
        startSlide,
        stopSlide,
        getNext,
        getPrevious,
        reloadPreview,
        resizePreview
    };
};
export default previewRecordService;
