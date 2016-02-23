import $ from 'jquery';
import dialog from '../../utils/dialog';

const recordDeleteModal = (services) => {
    const {configService, localeService, appEvents} = services;
    const url = configService.get('baseUrl');
    const deleteTemplateEndPoint = 'prod/records/delete/what/';


    const openModal = (datas) => {
        // @REFACTORING - should use local dialog
        var $dialog = p4.Dialog.Create({
            size: 'Small',
            title: localeService.t('deleteRecords')
        });

        $.ajax({
            type: "POST",
            url: `${url}${deleteTemplateEndPoint}`,
            dataType: 'html',
            data: datas,
            success: function (data) {
                $dialog.setContent(data);
            }
        });

        return true;
    };

    return {openModal};
};

export default recordDeleteModal;
