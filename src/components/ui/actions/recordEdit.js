import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordEditModal = (services, datas) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const editTemplateEndPoint = 'prod/records/edit/';


    const openModal = (datas) => {

        $('#idFrameE').empty().addClass('loading');
        commonModule.showOverlay(2);

        $('#EDITWINDOW').show();

        $.ajax({
            url: `${url}${editTemplateEndPoint}`,
            type: "POST",
            dataType: "html",
            data: datas,
            success: function (data) {
                recordEditorModule.initialize();
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

        return true;
    };

    return {openModal};
};

export default recordEditModal;
