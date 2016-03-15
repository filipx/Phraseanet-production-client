import $ from 'jquery';
import * as AppCommons from 'phraseanet-common';
import moveRecords from '../actions/moveRecord';
import editRecord from '../../record/edit';
import deleteRecord from '../../record/delete';
import recordDownloadModal from '../actions/recordDownload';
import recordPropertyModal from '../actions/recordProperty';
import recordFeedbackModal from '../actions/recordFeedback';
import recordPushModal from '../actions/recordPush';
import recordPublishModal from '../actions/recordPublish';
import recordToolsModal from '../../record/tools/index';
import recordPrintModal from '../actions/recordPrint';
import recordBridge from '../actions/recordBridge';

const toolbar = (services) => {
    const { configService, localeService, appEvents } = services;
    const $container = $('body');
    let workzoneSelection = [];
    let searchSelection = [];

    appEvents.listenAll({
        'broadcast.searchResultSelection': (selection) => {
            searchSelection = selection.serialized;
            console.log('ok jsut received a updated selection from search', selection);
        },
        'broadcast.workzoneResultSelection': (selection) => {
            workzoneSelection = selection.serialized;
            console.log('ok jsut received a updated selection from workzone', selection);
        }
    });

    const initialize = () => {
        _bindEvents();

        return true;
    };

    /**
     * Active group can be a Basket or story
     */
    const _getGroupSelection = (activeGroupId = null) => {
        let $activeGroup = $('.SSTT.active');
        if ($activeGroup.length > 0) {
            activeGroupId = $activeGroup.attr('id').split('_').slice(1, 2).pop();
        }
        return activeGroupId;
    };

    const _getSelection = (from, originalSelection) => {
        let newSelection = {
            list: [],
            group: null, //
            type: null // story | basket
        };
        switch (from) {
            case 'search-result':
                if (searchSelection.length > 0) {
                    newSelection.list = searchSelection;
                } else {
                    newSelection.group = _getGroupSelection();
                }

                break;
            case 'basket':
                if (workzoneSelection.length > 0) {
                    newSelection.list = workzoneSelection;
                } else {
                    newSelection.group = _getGroupSelection();
                    newSelection.type = 'basket';
                }
                break;
            case 'story':
                if (workzoneSelection.length > 0) {
                    newSelection.list = workzoneSelection;
                } else {
                    newSelection.group = _getGroupSelection();
                    newSelection.type = 'story';
                }
                break;
            default:
                newSelection.group = _getGroupSelection();

        }
        //return originalSelection.concat(newSelection);
        return Object.assign({}, originalSelection, newSelection);
    };

    const _prepareParams = (selection) => {
        let params = {};

        if (selection.list.length > 0) {
            params.lst = selection.list;
        }

        if (selection.group !== null) {
            if (selection.type === 'story') {
                params.story = selection.group;
            } else {
                params.ssel = selection.group;
            }
        }

        // require a list of records a basket group or a story
        if (params.lst !== undefined || params.ssel !== undefined || params.story !== undefined) {
            return params;
        }
        return false;
    };

    const _triggerModal = (event, actionFn) => {
        event.preventDefault();
        const $el = $(event.currentTarget);
        const selectionSource = $el.data('selection-source');

        let selection = _getSelection(selectionSource, {});
        let params = _prepareParams(selection);

        // require a list of records a basket group or a story
        if (params !== false) {
            return actionFn.apply(null, [params]);
        } else {
            alert(localeService.t('nodocselected'));
        }
    };


    const _bindEvents = () => {

        /**
         * tools > selection ALL|NONE|per type
         */
        $container.on('click mouseover', '.tools .answer_selector', (event) => {
            event.preventDefault();
            let $el = $(event.currentTarget);
            let actionName = $el.data('action-name');
            let state = $el.data('action-state') === true ? true : false;
            let type = $el.data('type');

            switch (actionName) {
                case 'select-toggle':
                    if (state) {
                        appEvents.emit('search.selection.unselectAll');
                    } else {
                        appEvents.emit('search.selection.selectAll');
                    }
                    break;
                case 'select-all':
                    appEvents.emit('search.selection.selectAll');
                    break;
                case 'unselect-all':
                    appEvents.emit('search.selection.unselectAll');
                    break;
                case 'select-type':
                    appEvents.emit('search.selection.selectByType', {type: type});
                    break;
                default:
            }
            $el.data('action-state', !state);
        });

        /**
         * tools > Edit > Move
         */
        $container.on('click', '.TOOL_chgcoll_btn', function (event) {
            //let moveRecordsInstance = moveRecords(services);
            _triggerModal(event, moveRecords(services).openModal);
        });

        /**
         * tools > Edit > Properties
         */
        $container.on('click', '.TOOL_chgstatus_btn', function (event) {
            _triggerModal(event, recordPropertyModal(services).openModal);
        });

        /**
         * tools > Push
         */
        $container.on('click', '.TOOL_pushdoc_btn', function (event) {
            _triggerModal(event, recordPushModal(services).openModal);
        });
        /**
         * tools > Push > Feedback
         */
        $container.on('click', '.TOOL_feedback_btn', function (event) {

            _triggerModal(event, recordFeedbackModal(services).openModal);
        });
        /**
         * tools > Tools
         */
        $container.on('click', '.TOOL_imgtools_btn', function (event) {
            _triggerModal(event, recordToolsModal(services).openModal);
        });
        /**
         * tools > Export
         */
        $container.on('click', '.TOOL_disktt_btn', function (event) {
            // can't be fully refactored
            _triggerModal(event, recordDownloadModal(services).openModal);
        });
        /**
         * tools > Export > Print
         */
        $container.on('click', '.TOOL_print_btn', function (event) {
            _triggerModal(event, recordPrintModal(services).openModal);
        });
        /**
         * tools > Push > Bridge
         */
        $container.on('click', '.TOOL_bridge_btn', function (event) {
            _triggerModal(event, recordBridge(services).openModal);

        });
        /**
         * tools > Push > Publish
         */
        $container.on('click', '.TOOL_publish_btn', function (event) {
            _triggerModal(event, recordPublishModal(services).openModal);

        });
        /**
         * tools > Delete
         */
        $container.on('click', '.TOOL_trash_btn', function (event) {
            _triggerModal(event, deleteRecord(services).openModal);
        });
        /**
         * tools > Edit
         */
        $container.on('click', '.TOOL_ppen_btn', function (event) {
            _triggerModal(event, editRecord(services).openModal);
        });
    };

    return {initialize};
};

export default toolbar;
