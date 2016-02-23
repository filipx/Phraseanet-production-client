import {Observable} from 'rx';
import {ajax} from 'jQuery';

let recordService = (services) => {
    const {configService} = services;
    const url = configService.get('baseUrl');
    const notificationEndPoint = 'session/notifications/';
    let initialize = () => {
    };

    let getNotification = (data) => {
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
        initialize,
        getNotification,
        stream
    }
}
export default recordService;
