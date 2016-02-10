const recordBridgeModal = (translations, datas) => {
    const dialog = p4.Dialog.Create({
        size: 'Full',
        title: 'Bridge',
        loading: false
    });

    dialog.load('../prod/bridge/manager/', 'POST', datas);

    return true;
};

export default recordBridgeModal;
