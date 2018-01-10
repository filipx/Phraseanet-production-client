require('./facets.scss');

import $ from 'jquery';
require('jquery-ui');
require('jquery.fancytree/src/jquery.fancytree');
import * as _ from 'underscore';
const workzoneFacets = services => {
    const { configService, localeService, appEvents } = services;

    /*
     selectedFacetValues[]
     key : facet.name
     value : {
     'value' : facet.value,
     'mode' : "AND"|"EXCEPT"
     }
     */

    let selectedFacetValues = [];
    let facetStatus = $.parseJSON(sessionStorage.getItem('facetStatus')) || [];

    /*var getSelectedFacets = function() {
     return selectedFacetValues;
     };*/

    var resetSelectedFacets = function () {
        selectedFacetValues = [];
        return selectedFacetValues;
    };
    var loadFacets = function (data) {
        // Convert facets data to fancytree source format
        var treeSource = _.map(data.facets, function (facet) {
            // Values
            var values = _.map(facet.values, function (value) {
                return {
                    title: value.value + ' (' + value.count + ')',
                    query: value.query,
                    label: value.value,
                    tooltip: value.value + ' (' + value.count + ')'
                };
            });
            // Facet
            return {
                name: facet.name,
                title: facet.label,
                folder: true,
                children: values,
                expanded: !_.some(facetStatus, function(o) { return _.has(o, facet.name)})
            };
        });

        treeSource.sort(
            _sortFacets('title', true, function (a) {
                return a.toUpperCase();
            })
        );

        treeSource = _sortByPredefinedFacets(treeSource, 'name', [
            'Base_Name',
            'Collection_Name',
            'Type_Name'
        ]);

        treeSource = _shouldFilterSingleContent(treeSource, data.filterFacet);

        return _getFacetsTree().reload(treeSource)
            .done(function () {
                _.each($('#proposals').find('.fancytree-expanded'), function (element) {
                    $(element).find('.fancytree-title, .fancytree-expander').css('line-height', $(element)[0].offsetHeight + 'px');
                });
            });
    };

    // from stackoverflow
    // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects/979325#979325
    function _sortFacets(field, reverse, primer) {
        var key = function (x) {
            return primer ? primer(x[field]) : x[field];
        };

        return function (a, b) {
            let A = key(a);
            let B = key(b);
            return (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!reverse];
        };
    }

    function _shouldFilterSingleContent(source, shouldFilter) {
        var filteredSource = [];
        if (shouldFilter === true) {
            _.forEach(source, function (facet) {
                //close expansion for facet containing selected values
                // if (!_.isUndefined(selectedFacetValues[facet.title])) {
                //     facet.expanded = false;
                // }
                if (
                    !_.isUndefined(facet.children) &&
                    (facet.children.length > 1 ||
                        !_.isUndefined(selectedFacetValues[facet.title]))
                ) {
                    filteredSource.push(facet);
                }
            });
            source = filteredSource;
        }

        return source;
    }

    function _sortByPredefinedFacets(source, field, predefinedFieldOrder) {
        let filteredSource = source.slice();
        let ordered = [];

        _.each(predefinedFieldOrder, function (fieldValue, index) {
            for (let i = filteredSource.length - 1; i > -1; --i) {
                let facet = filteredSource[i];
                if (facet[field] !== undefined) {
                    if (facet[field] === fieldValue) {
                        ordered.push(facet);
                        // remove from filtered
                        filteredSource.splice(i, 1);
                    }
                }
            }
        });

        const olen = filteredSource.length;
        // fill predefined facets with non predefined facets
        for (let i = 0; i < olen; i++) {
            ordered.push(filteredSource[i]);
        }
        return ordered;
    }

    function _getFacetsTree() {
        var $facetsTree = $('#proposals');
        if (!$facetsTree.data('ui-fancytree')) {
            $facetsTree.fancytree({
                // activate and expand
                clickFolderMode: 3,
                icons: false,
                source: [],
                activate: function (event, data) {
                    var query = data.node.data.query;
                    var eventType = event.originalEvent;
                    //if user did not click, then no need to perform any query
                    if(eventType == null) {
                        return;
                    }
                    if (query) {
                        var facet = data.node.parent;
                        var facetData = {
                            value: data.node.data,
                            mode: event.altKey ? "EXCEPT" : "AND"
                        };

                        if (selectedFacetValues[facet.title] == null) {
                            selectedFacetValues[facet.title] = [];
                        }
                        selectedFacetValues[facet.title].push(facetData);
                        _facetCombinedSearch();
                    }
                },
                collapse: function (event, data) {
                    var dict = {};
                    dict[data.node.data.name] = "collapse";
                    if(_.findWhere(facetStatus, dict) !== undefined ) {
                        facetStatus = _.without(facetStatus, _.findWhere(facetStatus, dict))
                    }
                    facetStatus.push(dict);
                    sessionStorage.setItem('facetStatus', JSON.stringify(facetStatus));
                },
                expand: function (event, data) {
                    var dict = {};
                    dict[data.node.data.name] = "collapse";
                    if (_.findWhere(facetStatus, dict) !== undefined) {
                        facetStatus = _.without(facetStatus, _.findWhere(facetStatus, dict))
                    }
                    sessionStorage.setItem('facetStatus', JSON.stringify(facetStatus));
                },
                renderNode: function (event, data) {
                    var facetFilter = "";
                    if (data.node.folder && !_.isUndefined(selectedFacetValues[data.node.title])) {
                        if ($(".fancytree-folder", data.node.li).find('.dataNode').length == 0) {
                            var dataNode = document.createElement('div');
                            dataNode.setAttribute("class", "dataNode");
                            $(".fancytree-folder", data.node.li).append(
                                dataNode
                            );
                        } else {
                            //remove existing facets
                            $(".dataNode", data.node.li).empty();
                        }
                        _.each(selectedFacetValues[data.node.title], function (facetValue) {

                            facetFilter = facetValue.value.label;

                            var s_label = document.createElement("SPAN");
                            s_label.setAttribute("class", "facetFilter-label");
                            s_label.setAttribute("title", facetFilter);

                            var length = 15;
                            var facetFilterString = facetFilter;
                            if (facetFilterString.length > length) {
                                facetFilterString = facetFilterString.substring(0, length) + '…';
                            }
                            s_label.appendChild(document.createTextNode(facetFilterString));

                            var s_closer = document.createElement("A");
                            s_closer.setAttribute("class", "facetFilter-closer");

                            var s_gradient = document.createElement("SPAN");
                            s_gradient.setAttribute("class", "facetFilter-gradient");
                            s_gradient.appendChild(document.createTextNode("\u00A0"));

                            s_label.appendChild(s_gradient);

                            var s_facet = document.createElement("SPAN");
                            s_facet.setAttribute("class", "facetFilter" + '_' + facetValue.mode);
                            s_facet.appendChild(s_label);
                            s_closer = $(s_facet.appendChild(s_closer));

                            s_closer.click(
                                function (event) {
                                    event.stopPropagation();
                                    var facetTitle = $(this).parent().data("facetTitle");
                                    var facetFilter = $(this).parent().data("facetFilter");
                                    var mode = $(this).parent().hasClass("facetFilter_EXCEPT") ? "EXCEPT" : "AND";
                                    selectedFacetValues[facetTitle] = _.reject(selectedFacetValues[facetTitle], function (obj) {
                                        return (obj.value.label == facetFilter && obj.mode == mode);
                                    });
                                    //delete selectedFacetValues[facetTitle];
                                    _facetCombinedSearch();
                                    return false;
                                }
                            );

                            var newNode = document.createElement('div');
                            newNode.setAttribute("class", "newNode");
                            s_facet = $(newNode.appendChild(s_facet));
                            s_facet.data("facetTitle", data.node.title);
                            s_facet.data("facetFilter", facetFilter);

                            $(".fancytree-folder .dataNode", data.node.li).append(
                                newNode
                            );

                            s_facet.click(
                                function (event) {
                                    if (event.altKey) {
                                        event.stopPropagation();
                                        var facetTitle = $(this).data("facetTitle");
                                        var facetFilter = $(this).data("facetFilter");
                                        var mode = $(this).hasClass("facetFilter_EXCEPT") ? "EXCEPT" : "AND";
                                        var found = _.find(selectedFacetValues[facetTitle], function (obj) {
                                            return (obj.value.label == facetFilter && obj.mode == mode);
                                        });
                                        if (found) {
                                            var newMode = mode == "EXCEPT" ? "AND" : "EXCEPT";
                                            found.mode = newMode;
                                            //replace class attr
                                            $(this).filter('.' + "facetFilter" + '_' + mode).removeClass("facetFilter" + '_' + mode).addClass("facetFilter" + '_' + newMode).end();
                                            _facetCombinedSearch();
                                        }
                                    }
                                    return false;
                                }
                            );
                        });
                    }
                }
            });
        }
        return $facetsTree.fancytree('getTree');
    }

    function _facetCombinedSearch() {
        var q = $('#EDIT_query').val();
        var q_facet_and = "";
        var q_facet_except = "";
        _.each(_.values(selectedFacetValues), function (facet) {
            _.each(facet, function (facetValue) {
                switch (facetValue.mode) {
                    case "AND":
                        q_facet_and += (q_facet_and ? " AND " : "") + '(' + facetValue.value.query + ')';
                        break;
                    case "EXCEPT":
                        q_facet_except += (q_facet_except ? " OR " : "") + '(' + facetValue.value.query + ')';
                        break;
                }
            });
        });
        if(!q && !q_facet_and && q_facet_except) {
            // too bad : an except with no query.
            q = "created_on>1900/01/01";    // fake "all"
        }
        if(q_facet_and != "") {
            if (q) {
                q = '(' + q + ') AND '
            }
            q += q_facet_and;
        }
        if(q_facet_except != "") {
            q = '(' + q + ') EXCEPT (' + q_facet_except + ')';
        }

        appEvents.emit('search.doCheckFilters');
        appEvents.emit('search.doNewSearch', q);
        // searchModule.newSearch(q);
    }

    appEvents.listenAll({
        'facets.doLoadFacets': loadFacets,
        'facets.doResetSelectedFacets': resetSelectedFacets
    });

    return {
        loadFacets,
        resetSelectedFacets
    };
};

export default workzoneFacets;
