import $ from 'jquery';
// import user from '../user/index.js';
import notifyLayout from './notifyLayout';
import notifyService from './notifyService';
import * as Rx from 'rx';

const notify = (services) => {

    const {configService, localeService, appEvents} = services;
    const language = []; //services.localeService;
    const defaultPollingTime = 10000;
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

    //const appendNotifications = (content) => notifyUiComponent().addNotifications(content);

    const isValid = (notificationInstance) => notificationInstance._isValid || false;

    const poll = (notificationInstance) => {

        let notificationSource = Rx.Observable
            .fromPromise(notifyService({
                configService: configService
            }).getNotification({
                module: notificationInstance.moduleId,
                usr: notificationInstance.userId
            }));

        notificationSource.subscribe(
            x => onPollSuccess(x, notificationInstance),
            e => onPollError(e, notificationInstance),
            () => console.log('onCompleted')
        );
    };
    const onPollSuccess = (data, notificationInstance) => {
        if (data.status == 'disconnected' || data.status == 'session') {
            appEvents.emit('user.disconnected', data);
            appEvents.emit('user.disconnected', data);
            return false;
        }
        appEvents.emit('session.refresh', data);

        notifyLayout().addNotifications(data.notifications);

/*
        let isConnected = false;
        if (data) {
            isConnected = user(language).manageSession(data, true);
        }
        if (!isConnected) return;
        */
        let t = 120000;
        if (data.apps && parseInt(data.apps, 10) > 1) {
            t = Math.round((Math.sqrt(parseInt(data.apps, 10) - 1) * 1.3 * 60000));
        }

        window.setTimeout(poll, t, notificationInstance);

        return true;
    };

    const onPollError = (e, notificationInstance) => {
        console.log('onError', e)
        window.setTimeout(poll, defaultPollingTime, notificationInstance);
    }


    return {
        bindEvents: () => {
            notifyLayout().bindEvents();
        },
        /*appendNotifications: (content) => {
            notifyLayout().addNotifications(content)
        },*/
        createNotifier,
        isValid,
        poll
    };
};

export default notify;
