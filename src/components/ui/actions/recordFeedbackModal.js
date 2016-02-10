import $ from 'jquery';

const recordFeedbackModal = (translations, datas) => {
    const language = translations;

    /* disable push closeonescape as an over dialog may exist (add user) */
    $dialog = p4.Dialog.Create({
        size: 'Full',
        title: language.feedback
    });

    $.post("../prod/push/validateform/", datas, function (data) {
        $dialog.setContent(data);
        return;
    });

    return true;
};

export default recordFeedbackModal;
