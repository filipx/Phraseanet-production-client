import $ from 'jquery';

const thesaurusDatasource = (services) => {
    const {configService, localeService, appEvents} = services;
    let $container = null;
    let parentOptions = {};
    let ETHSeeker = null;
    let $editTextArea;

    const initialize = (options) => {
        let initWith = {$container, parentOptions, $editTextArea} = options;
        let cclicks = 0;
        const cDelay = 350;
        let cTimer = null;
        $container
            .on('click', '.edit-thesaurus-action', (event) => {
                event.preventDefault();
                cclicks++;

                if (cclicks === 1) {
                    cTimer = setTimeout(function () {
                        edit_clickThesaurus(event);
                        cclicks = 0;
                    }, cDelay);

                } else {
                    clearTimeout(cTimer);
                    edit_dblclickThesaurus(event);
                    cclicks = 0;
                }
            })
            .on('dblclick', '.thesaurus-branch-action', (event) => {
                // dbl is handled by click event
                event.preventDefault();
            })

        ETHSeeker = new _EditThesaurusSeeker(parentOptions.sbas_id);

        return ETHSeeker;
    };


    function _EditThesaurusSeeker(sbas_id) {
        this.jq = null;

        this.sbas_id = sbas_id;

        let zid = ('' + sbas_id).replace(new RegExp('\\.', 'g'), '\\.') + '\\.T';

        this.TH_P_node = $('#TH_P\\.' + zid, parentOptions.$container);
        this.TH_K_node = $('#TH_K\\.' + zid, parentOptions.$container);

        this._ctimer = null;

        this.search = function (txt) {
            if (this._ctimer) {
                clearTimeout(this._ctimer);
            }
            this._ctimer = setTimeout(() => {
                return ETHSeeker.search_delayed('"' + txt.replace("'", "\\'") + '"')
            }, 125);
        };

        this.search_delayed = function (txt) {
            if (this.jq && typeof this.jq.abort === 'function') {
                this.jq.abort();
                this.jq = null;
            }
            txt = txt.replace("'", "\\'");
            let url = '/xmlhttp/openbranches_prod.h.php';
            let parms = {
                bid: this.sbas_id,
                lng: localeService.getLocale(),
                t: txt,
                mod: 'TREE',
                u: Math.random()
            };

            let me = this;

            this.jq = $.ajax({
                url: url,
                data: parms,
                type: 'POST',
                success: function (ret) {
                    me.TH_P_node.html('...');
                    me.TH_K_node.attr('class', 'h').html(ret);
                    me.jq = null;
                }
            });
        };

        this.openBranch = function (id, thid) {
            if (this.jq) {
                this.jq.abort();
                this.jq = null;
            }
            let url = '/xmlhttp/getterm_prod.h.php';
            let parms = {
                bid: this.sbas_id,
                lng: localeService.getLocale(),
                sortsy: 1,
                id: thid,
                typ: 'TH'
            };
            let me = this;


            this.jq = $.ajax({
                url: url,
                data: parms,
                success: function (ret) {
                    let zid = '#TH_K\\.' + id.replace(new RegExp('\\.', 'g'), '\\.');	// escape les '.' pour jquery
                    $(zid, parentOptions.$container).html(ret);
                    me.jq = null;
                }
            });
        };
    }

// onclick dans le thesaurus
    function edit_clickThesaurus(event) {
        let e;
        for (e = event.srcElement ? event.srcElement : event.target; e && ((!e.tagName) || (!e.id)); e = e.parentNode);

        if (e) {
            switch (e.id.substr(0, 4)) {
                case 'TH_P':	// +/- de deploiement de mot
                    edit_thesaurus_ow(e.id.substr(5));
                    break;
                default:
            }
        }
        return (false);
    }

// ondblclick dans le thesaurus
    function edit_dblclickThesaurus(event) {
        let e;
        for (e = event.srcElement ? event.srcElement : event.target; e && ((!e.tagName) || (!e.id)); e = e.parentNode);

        if (e) {
            switch (e.id.substr(0, 4)) {
                case 'TH_W':
                    let currentFieldIndex = parentOptions.fieldCollection.getActiveFieldIndex();

                    if (currentFieldIndex >= 0) {
                        let w = $(e).text();
                        let field = parentOptions.fieldCollection.getActiveFieldIndex();
                        if (field.multi) {
                            $('#EditTextMultiValued', parentOptions.$container).val(w);
                            $('#EditTextMultiValued').trigger('keyup.maxLength');
                            appEvents.emit('recordEditor.addMultivaluedField', {
                                value: $('#EditTextMultiValued', parentOptions.$container).val()
                            })
                            // _addMultivaluedField($('#EditTextMultiValued', parentOptions.$container).val(), null);
                        } else {
                            $editTextArea.val(w);
                            $('#idEditZTextArea').trigger('keyup.maxLength');
                            parentOptions.textareaIsDirty = true;
                        }
                    }
                    break;
                default:
            }
        }
        return (false);
    }

// on ouvre ou ferme une branche de thesaurus
    function edit_thesaurus_ow(id) {
        let o = document.getElementById('TH_K.' + id);
        if (o.className === 'o') {
            // on ferme
            o.className = 'c';
            document.getElementById('TH_P.' + id).innerHTML = '+';
            document.getElementById('TH_K.' + id).innerHTML = localeService.t('loading');
        } else if (o.className === 'c' || o.className === 'h') {
            // on ouvre
            o.className = 'o';
            document.getElementById('TH_P.' + id).innerHTML = '-';

            let t_id = id.split('.');
            let sbas_id = t_id[0];
            t_id.shift();
            let thid = t_id.join('.');
            let url = '/xmlhttp/getterm_prod.x.php';
            let parms = 'bid=' + sbas_id;
            parms += '&lng=' + localeService.getLocale();
            parms += '&sortsy=1';
            parms += '&id=' + thid;
            parms += '&typ=TH';

            ETHSeeker.openBranch(id, thid);
        }
        return (false);
    }

    return {initialize};
};
export default thesaurusDatasource;
