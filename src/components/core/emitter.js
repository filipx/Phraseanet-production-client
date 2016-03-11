import * as Rx from 'rx';
var hasOwnProp = {}.hasOwnProperty;

function createName(name) {
    return '$' + name;
}

let Emitter = function () {
    this.subjects = {};
};

Emitter.prototype.emit = function (name, data) {
    var fnName = createName(name);
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
    this.subjects[fnName].onNext(data);

    return this.subjects[fnName];
};

Emitter.prototype.listen = function (name, handler) {
    var fnName = createName(name);
    this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
    return this.subjects[fnName].subscribe(handler);
};
Emitter.prototype.listenAll = function (group, name, handler) {
    for (var prop in group) {
        console.log('add event', prop);
        var fnName = createName(prop);
        this.subjects[fnName] || (this.subjects[fnName] = new Rx.Subject());
        this.subjects[fnName].subscribe(group[prop]);
    }
};

Emitter.prototype.dispose = function () {
    var subjects = this.subjects;
    for (var prop in subjects) {
        if (hasOwnProp.call(subjects, prop)) {
            subjects[prop].dispose();
        }
    }

    this.subjects = {};
};
export default Emitter;
