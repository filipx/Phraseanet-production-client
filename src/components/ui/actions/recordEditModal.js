import $ from 'jquery';

const recordEditModal = (translations, datas) => {
    const language = translations;

    $('#idFrameE').empty().addClass('loading');
    showOverlay(2);

    $('#EDITWINDOW').show();

    $.ajax({
        url: "../prod/records/edit/",
        type: "POST",
        dataType: "html",
        data: datas,
        success: function (data) {
            initializeEdit();
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

export default recordEditModal;
