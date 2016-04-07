import $ from 'jquery';
import recordEditorService from './recordEditor/index';

const editRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    let $container = null;
    let recordEditor = recordEditorService(services);
    appEvents.listenAll({
        'record.doEdit': _doEdit
    });

    const initialize = () => {


        $container = $('body');
        $container.on('click', '.edit-record-action', function (event) {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let type = '';
            let kind = $el.data('kind');
            let idContent = $el.data('id');

            switch (kind) {
                case 'basket':
                    type = 'SSTT';
                    break;
                case 'record':
                    type = 'IMGT';
                    break;
                default:
            }

            _doEdit({type: type, value: idContent});
        });


    };

    const openModal = (datas) => {
        $('#EDITWINDOW').empty().addClass('loading');
        //commonModule.showOverlay(2);

        $('#EDITWINDOW').show();

        $.ajax({
            url: `${url}prod/records/edit/`,
            type: 'POST',
            dataType: 'html',
            data: datas,
            success: (data) => {
                $('#EDITWINDOW').removeClass('loading').empty().html(data);
                // let recordEditor = recordEditorService(services);
                recordEditor.initialize({
                    $container: $('#EDITWINDOW'),
                    recordConfig: window.recordEditorConfig
                });

                $('#tooltip').hide();
                return;
            },
            error: function (XHR, textStatus, errorThrown) {
                if (XHR.status === 0) {
                    return false;
                }
            }
        });

        return true;
    };

    // open Modal
    function _doEdit(options) {
        let {type, value} = options;
        var datas = {
            lst: '',
            ssel: '',
            act: ''
        };

        switch (type) {
            case 'IMGT':
                datas.lst = value;
                break;

            case 'SSTT':
                datas.ssel = value;
                break;

            case 'STORY':
                datas.story = value;
                break;
            default:
        }

        return openModal(datas);
    }

    return { initialize, openModal };
};

export default editRecord;
