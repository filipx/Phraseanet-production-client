import $ from 'jquery';
import moveRecordModal from '../actions/moveRecordModal';
import recordEditModal from '../actions/recordEditModal';
import recordDeleteModal from '../actions/recordDeleteModal';
import recordDownloadModal from '../actions/recordDownloadModal';
import recordPropertyModal from '../actions/recordPropertyModal';
import recordFeedbackModal from '../actions/recordFeedbackModal';
import recordPushModal from '../actions/recordPushModal';
import recordPublishModal from '../actions/recordPublishModal';
import recordToolsModal from '../actions/recordToolsModal';
import recordPrintModal from '../actions/recordPrintModal';
import recordBridgeModal from '../actions/recordBridgeModal';

const toolbar = (translations) => {
    const language = translations;
    const $container = $('body');

    /**
     * Active group can be a Basket or story
     */
    const getGroupSelection = (activeGroupId = null) => {
        let $activeGroup = $('.SSTT.active');
        if ($activeGroup.length > 0) {
            activeGroupId = $activeGroup.attr('id').split('_').slice(1, 2).pop();
        }
        return activeGroupId;
    };

    const getSelection = (from, originalSelection) => {
        console.log('getSelection')
        let currentSelection = p4.Results.Selection.get(),
            newSelection = {
                list: [],
                group: null, //
                type: null // story | basket
            };
        switch (from) {
            case 'search-result':
                if (p4.Results.Selection.length() > 0) {
                    newSelection.list = p4.Results.Selection.serialize();
                }
                else {
                    newSelection.group = getGroupSelection();
                }

                break;
            case 'basket':
                if (p4.WorkZone.Selection.length() > 0) {
                    newSelection.list = p4.WorkZone.Selection.serialize();
                }
                else {
                    newSelection.group = getGroupSelection();
                    newSelection.type = 'basket';
                }
                break;
            case 'story':
                if (p4.WorkZone.Selection.length() > 0) {
                    newSelection.list = p4.WorkZone.Selection.serialize();
                }
                else {
                    newSelection.group = getGroupSelection();
                    newSelection.type = 'story';
                }
                break;
            default:
                newSelection.group = getGroupSelection();

        }
        //return originalSelection.concat(newSelection);
        return Object.assign({}, originalSelection, newSelection);
    };

    const prepareParams = (selection) => {
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

    const triggerModal = (event, actionFn) => {
        event.preventDefault();
        const $el = $(event.currentTarget);
        const selectionSource = $el.data('selection-source');

        let selection = getSelection(selectionSource, {});
        let params = prepareParams(selection);

        // require a list of records a basket group or a story
        if (params !== false) {
            return actionFn.apply(null, [language, params]);
        } else {
            alert(language.nodocselected);
        }
    };


    const bindEvents = () => {
        /**
         * tools > Edit > Move
         */
        $container.on('click', '.TOOL_chgcoll_btn', function (event) {
            triggerModal(event, moveRecordModal);
        });

        /**
         * tools > Edit > Properties
         */
        $container.on('click', '.TOOL_chgstatus_btn', function (event) {
            triggerModal(event, recordPropertyModal);
        });

        /**
         * tools > Push
         */
        $container.on('click', '.TOOL_pushdoc_btn', function (event) {
            triggerModal(event, recordPushModal);
        });
        /**
         * tools > Push > Feedback
         */
        $container.on('click', '.TOOL_feedback_btn', function (event) {

            triggerModal(event, recordFeedbackModal);
        });
        /**
         * tools > Tools
         */
        $container.on('click', '.TOOL_imgtools_btn', function (event) {
            triggerModal(event, recordToolsModal);
        });
        /**
         * tools > Export
         */
        $container.on('click', '.TOOL_disktt_btn', function (event) {
            triggerModal(event, recordDownloadModal);
        });
        /**
         * tools > Export > Print
         */
        $container.on('click', '.TOOL_print_btn', function (event) {
            triggerModal(event, recordPrintModal);
        });
        /**
         * tools > Push > Bridge
         */
        $container.on('click', '.TOOL_bridge_btn', function (event) {
            event.preventDefault();
            triggerModal(event, recordBridgeModal);

        });
        /**
         * tools > Push > Publish
         */
        $container.on('click', '.TOOL_publish_btn', function (event) {
            triggerModal(event, recordPublishModal);

        });
        /**
         * tools > Delete
         */
        $container.on('click', '.TOOL_trash_btn', function (event) {
            triggerModal(event, recordDeleteModal);
        });
        /**
         * tools > Edit
         */
        $container.on('click', '.TOOL_ppen_btn', function (event) {
            triggerModal(event, recordEditModal);
        });
    };

    return {bindEvents};
};

export default toolbar;
