import $ from 'jquery';
import recordEditorService from './recordEditor';

const editRecord = (services) => {
    const { configService, localeService, appEvents } = services;
    const url = configService.get('baseUrl');
    const editTemplateEndPoint = 'prod/records/edit/';
    let $container = null;
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

            _doEdit(type, idContent);
        });
    };

    const openModal = (datas) => {

        $('#idFrameE').empty().addClass('loading');
        //commonModule.showOverlay(2);

        $('#EDITWINDOW').show();

        $.ajax({
            url: `${url}${editTemplateEndPoint}`,
            type: 'POST',
            dataType: 'html',
            data: datas,
            success: function (data) {
                let recordEditor = recordEditorService(services);


                $('#idFrameE').removeClass('loading').empty().html(data);

                recordEditor.initialize();
                recordEditor.startThisEditing(window.recordEditorConfig);

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
    function _doEdit(type, value) {
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

        /*$.ajax({
            url: `${url}${editTemplateEndPoint}`,
            type: "POST",
            dataType: "html",
            data: datas,
            success: function (data) {
                recordEditor(services).initialize();
                //recordEditorModule.initialize();
                $('#idFrameE').removeClass('loading').empty().html(data);
                $('#tooltip').hide();
                return;
            },
            error: function (XHR, textStatus, errorThrown) {
                if (XHR.status === 0) {
                    return false;
                }
            }
        });

        return;*/
    }

    return { initialize, openModal };
};

export default editRecord;
