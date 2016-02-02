import $ from 'jquery';

const notify = () => {
    const defaultPollingTime =  10000;
    const defaultConfig = {
        url: null,
        moduleId: null,
        userId: null,
        _isValid: false
    };

    const createNotifier = (state) => {
        if (state === undefined) {
            return defaultConfig;
        }
        if (state.url === undefined) {
            return defaultConfig;
        }

        return Object.assign({}, defaultConfig, {
            url: state.url,
            moduleId: state.moduleId,
            userId: state.userId,
            _isValid: true
        });
    };

    const isValid = (state) => state._isValid || false;

    const poll = (state) => {
        return $.ajax({
            type: 'POST',
            url: state.url,
            dataType: 'json',
            data: {
                module: state.moduleId,
                usr: state.userId
            },
            error: () => {
                window.setTimeout(poll, defaultPollingTime, state);
            },
            timeout: () => {
                window.setTimeout(poll, defaultPollingTime, state);
            },
            success: (data) => {
                let isConnected = false;
                if (data) {
                    isConnected = manageSession(data, true);
                }
                if (!isConnected) return;
                let t = 120000;
                if (data.apps && parseInt(data.apps, 10) > 1) {
                    t = Math.round((Math.sqrt(parseInt(data.apps, 10) - 1) * 1.3 * 60000));
                }

                window.setTimeout(poll, t, state);

                return true;
            }
        });

    };
    return {
        createNotifier,
        isValid,
        poll
    };
};


export default notify;
