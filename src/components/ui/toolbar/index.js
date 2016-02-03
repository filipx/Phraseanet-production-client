import $ from 'jquery';

const toolbar = (translations) => {
    const language = translations;
    const  $container = $('body');


    const setTypeForContext = ( $el ) => {

    }

    const bindEvents = () => {

        console.log('conainer', $container)

        $container.on('click', '.TOOL_chgcoll_btn', function (event) {
            const $el = $(event.currentTarget);
            console.log($el, $(this));
            var value = {};

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    value.lst = p4.Results.Selection.serialize();
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        value.lst = p4.WorkZone.Selection.serialize();
                    else
                        value.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        value.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                value.lst = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                value.story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            /**
             * if works, then the object is not empty
             */
            for (i in value) {
                return chgCollThis(value);
            }

            alert(language.nodocselected);
        });

        $container.on('click', '.TOOL_chgstatus_btn', function () {
            var params = {};
            var $this = $(this);

            if ($this.hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0) {
                    params.lst = p4.Results.Selection.serialize();
                }
            } else {
                if ($this.hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0) {
                        params.lst = p4.WorkZone.Selection.serialize();
                    } else {
                        params.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                } else {
                    if ($this.hasClass('basket_element')) {
                        params.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    } else {
                        if ($this.hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                params.lst = p4.WorkZone.Selection.serialize();
                            } else {
                                params.story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (false === $.isEmptyObject(params)) {
                var dialog = p4.Dialog.Create();
                dialog.load('../prod/records/property/', 'GET', params);
            } else {
                alert(language.nodocselected);
            }
        });

        $container.on('click', '.TOOL_pushdoc_btn', function () {
            var value = "", type = "", sstt_id = "", story = "";
            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    value = p4.Results.Selection.serialize();
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        value = p4.WorkZone.Selection.serialize();
                    else
                        sstt_id = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        sstt_id = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                value = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }
            if (value !== '' || sstt_id !== '' || story !== '') {
                pushThis(sstt_id, value, story);
            }
            else {
                alert(language.nodocselected);
            }
        });

        $container.on('click', '.TOOL_feedback_btn', function () {
            var value = "", type = "", sstt_id = "", story = '';
            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    value = p4.Results.Selection.serialize();
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        value = p4.WorkZone.Selection.serialize();
                    else
                        sstt_id = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        sstt_id = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                value = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }
            if (value !== '' || sstt_id !== '' || story !== '') {
                feedbackThis(sstt_id, value, story);
            }
            else {
                alert(language.nodocselected);
            }
        });

        $container.on('click', '.TOOL_imgtools_btn', function () {
            var datas = {};

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    datas.lst = p4.Results.Selection.serialize();
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        datas.lst = p4.WorkZone.Selection.serialize();
                    else
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                datas.lst = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                datas.story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (!$.isEmptyObject(datas)) {
                toolREFACTOR(datas);
            }
            else {
                alert(language.nodocselected);
            }
        });

        $container.on('click', '.TOOL_disktt_btn', function () {
            var datas = {};

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0) {
                    datas.lst = p4.Results.Selection.serialize();
                }
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0) {
                        datas.lst = p4.WorkZone.Selection.serialize();
                    }
                    else {
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                datas.lst = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                datas.story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            for (var i in datas) {
                return downloadThis(datas);
            }

            alert(language.nodocselected);
        });

        $container.on('click', '.TOOL_print_btn', function (e) {
            e.preventDefault();
            var value = "";

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    value = "lst=" + p4.Results.Selection.serialize();
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        value = "lst=" + p4.WorkZone.Selection.serialize();
                    else
                        value = "SSTTID=" + $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        value = "SSTTID=" + $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                value = "lst=" + p4.WorkZone.Selection.serialize();
                            }
                            else {
                                value = "story=" + $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (value !== '') {
                printThis(value);
            }
            else {
                alert(language.nodocselected);
            }
        });
        $container.on('click', '.TOOL_bridge_btn', function (e) {
            e.preventDefault();
            var $button = $(this);
            var datas = {};
            var bridgeHref = $button.attr("href");

            if ($button.hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    datas.lst = p4.Results.Selection.serialize();
            }
            else {
                if ($button.hasClass('basket_window')) {
                    bridgeHref = $button.attr("data-href");
                    if (p4.WorkZone.Selection.length() > 0)
                        datas.lst = p4.WorkZone.Selection.serialize();
                    else
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                }
                else {
                    if ($button.hasClass('basket_element')) {
                        datas.ssel = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($button.hasClass('story_window')) {
                            bridgeHref = $button.attr("data-href");
                            if (p4.WorkZone.Selection.length() > 0) {
                                datas.lst = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                datas.story = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (datas.ssel || datas.lst || datas.story) {
                init_publicator(bridgeHref, datas);
            }
            else {
                alert(language.nodocselected);
            }
        });

        $container.on('click', '.TOOL_trash_btn', function () {

            var type = "";
            var el = false;

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0)
                    type = 'IMGT';
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0)
                        type = 'CHIM';
                    else {
                        type = 'SSTT';
                        el = $('.SSTT.active');
                    }
                }
                else {
                    if ($(this).hasClass('story_window')) {
                        if (p4.WorkZone.Selection.length() > 0) {
                            type = 'CHIM';
                        }
                        else {
                            type = 'STORY';
                            el = $(this).find('input[name=story_key]');
                        }
                    }
                }
            }
            if (type !== '') {
                checkDeleteThis(type, el);
            }
            else {
                alert(language.nodocselected);
            }
        });
        $container.on('click', '.TOOL_ppen_btn', function () {

            var value = "";
            var type = "";

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0) {
                    type = 'IMGT';
                    value = p4.Results.Selection.serialize();
                }
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0) {
                        type = 'IMGT';
                        value = p4.WorkZone.Selection.serialize();
                    }
                    else {
                        type = 'SSTT';
                        value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        type = 'SSTT';
                        value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                type = 'IMGT';
                                value = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                type = 'STORY';
                                value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (value !== '') {
                editThis(type, value);
            }
            else {
                alert(language.nodocselected);
            }
        });
        $container.on('click', '.TOOL_publish_btn', function () {
            var value = "";
            var type = "";

            if ($(this).hasClass('results_window')) {
                if (p4.Results.Selection.length() > 0) {
                    type = 'IMGT';
                    value = p4.Results.Selection.serialize();
                }
            }
            else {
                if ($(this).hasClass('basket_window')) {
                    if (p4.WorkZone.Selection.length() > 0) {
                        type = 'IMGT';
                        value = p4.WorkZone.Selection.serialize();
                    }
                    else {
                        type = 'SSTT';
                        value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                }
                else {
                    if ($(this).hasClass('basket_element')) {
                        type = 'SSTT';
                        value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                    }
                    else {
                        if ($(this).hasClass('story_window')) {
                            if (p4.WorkZone.Selection.length() > 0) {
                                type = 'IMGT';
                                value = p4.WorkZone.Selection.serialize();
                            }
                            else {
                                type = 'STORY';
                                value = $('.SSTT.active').attr('id').split('_').slice(1, 2).pop();
                            }
                        }
                    }
                }
            }

            if (value !== '') {
                feedThis(type, value);
            }
            else {
                alert(language.nodocselected);
            }
        });

        function feedThis(type, value) {
            var options = {
                lst: '',
                ssel: '',
                act: ''
            };

            switch (type) {
                case "IMGT":
                case "CHIM":
                    options.lst = value;
                    break;

                case "STORY":
                    options.story = value;
                    break;
                case "SSTT":
                    options.ssel = value;
                    break;
            }

            $.post("../prod/feeds/requestavailable/"
                , options
                , function (data) {

                    return set_up_feed_box(data);
                });

            return;
        }

    }



    return { bindEvents };
}

export default toolbar;
