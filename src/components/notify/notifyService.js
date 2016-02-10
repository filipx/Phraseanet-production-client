import {Observable} from 'rx';
import {ajax} from 'jQuery';

let notifyService = (services) => {
    const {configService} = services;
    const url = configService.get('baseUrl');
    const notificationEndPoint = 'session/notifications/';
    let getNotification = (data) => {
        /*return ajax({
            type: 'POST',
            url: `${notificationEndPoint}`,
            data: data,
            dataType: 'json'
        }).promise();*/
        return new Promise((resolve, reject) => {
            ajax({
                type: 'POST',
                url: `${url}${notificationEndPoint}`,
                data: data,
                dataType: 'json'
            }).done((data) => {
                    data.status = data.status || false;
                    console.log('data', data)
                if( data.status === 'ok') {
                    resolve(data)
                } else {
                    reject(data);
                }
            })
            .fail((data) => {
                reject(data)
            })
        });
    }

    let stream = Observable.fromPromise(getNotification)
    return {
        getNotification,
        stream
    }
}
export default notifyService;