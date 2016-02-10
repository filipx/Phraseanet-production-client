import $ from 'jquery';

const recordPropertyModal = (translations, datas) => {
    const language = translations;

    var dialog = p4.Dialog.Create();
    dialog.load('../prod/records/property/', 'GET', datas);

/*
    $dialog = p4.Dialog.Create({
        size: 'Small',
        title: language.move,
        closeButton: true
    });
    $.ajax({
        type: "POST",
        url: "../prod/records/movecollection/",
        data: datas,
        success: function (data) {
            $dialog.setContent(data);
        }
    });
*/

    return true;
};

export default recordPropertyModal;
