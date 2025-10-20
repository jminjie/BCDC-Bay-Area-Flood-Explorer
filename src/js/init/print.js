/*
 * Developed by the San Francisco Estuary Institute (SFEI) for the SF Bay Conseravtion and Development 
 * Commission (BCDC).
 * @copyright 2018
 * @author Lawrence S.
 */
define([
    'common', 
    'apps/slr', 
    'get-config', 
    'OpenLayers'
], function(
    common, 
    SLR, 
    getConfig, 
    ol
) {
    return function(restore) {
        restore = restore || {};
        var slrValue = restore.slrvalue || 0, 
            slr = new SLR(getConfig(), {forPrintLayout: true});
        slr.init(
            restore, 
            function(errors) {
                // error handler
                if(errors && errors.length) {
                    document.querySelector("#print-button").remove();
                    window.querySelector("#slr-print-container").innerHTML = "";
                    var errMsg = document.createElement("p");
                    for(var i = 0; i < errors.length; ++i) {
                        errMsg.innerHTML = errMsg.innerHTML + errors[i] + "<br />";
                    }
                    window.querySelector("#slr-print-container").appendChild(errMsg);
                    return;
                }
                // slr text
                document.querySelector("#slr-print-info").innerHTML = (
                    "<h1>TOTAL WATER LEVEL: <span>" + slrValue + "-inches</span></h1>" + 
                    "Printed from: <strong>explorer.adaptingtorisingtides.org</strong>"
                );
                // hide reference layer on basemap
                slr.mapHandler.basemapModule.turnOffReference();
                // no matter what, counties turned off
                slr.layers.setVisible("counties", false, true);
                // adjust consequence header, or remove if not in conseequence mode
                var mainLabel = document.querySelector("#slr-legend-print-consequence > .slr-legend-main-label"), 
                    subLabel = document.querySelector("#slr-legend-print-consequence .slr-legend-item .slr-legend-main-label");
                if(subLabel) {
                    mainLabel.innerHTML = subLabel.innerHTML;
                } else {
                    document.querySelector("#slr-legend-print-consequence").remove();
                }
                // turn legend items on/off based on settings
                var widgets = slr.legend.getItems().filter(function(item) { return item.isWidget; });
                slr.layers.getLayerKeys().forEach(function(lkey) {
                    var legendItem = slr.legend.items[lkey], 
                        show = slr.layers.getVisible(lkey) && slr.layers.getOpacity(lkey) > 0;
                    if(legendItem) {
                        // basic legend item
                        if(!show) {
                            legendItem.container.hide();
                        } else {
                            legendItem.container.removeClass("legend-disabled");
                        }
                    } else if(show) {
                        // find and swap in widget in widget
                        widgets.find(function(widget) {
                            if(widget.has(lkey)) {
                                widget._swap(lkey);
                                return true;
                            }
                        });
                    }
                });
                // add scalebar
                slr.mapHandler.olMap.addControl(new ol.control.ScaleLine({units: "us"}));
                // populate table
                slrValue = slr.state.get("slrvalue");
                var table = document.querySelector("#slr-print-table");
                if(!slrValue) {
                    table.style["display"] = "none";
                } else {
                    var scenarios = slr.matrix.getInundationScenarios("regional", slrValue);
                    for(var s = 0; s < scenarios.length; ++s) {
                        scenarios[s].stormSurge = (
                            scenarios[s].stormSurge ? 
                                (scenarios[s].stormSurge === 1 ? "King Tide" : scenarios[s].stormSurge + "-year")
                                : "No Storm Surge"
                        );
                        var tr = document.createElement("tr"), 
                            td1 = document.createElement("td"), 
                            td2 = document.createElement("td");
                        td1.innerHTML = scenarios[s].slr + "\"";
                        td2.innerHTML = scenarios[s].stormSurge;
                        tr.appendChild(td1);
                        tr.appendChild(td2);
                        table.appendChild(tr);
                    }
                    document.querySelector("#slr-print-info2").innerHTML += " At the regional scale, these scenarios present average water levels that are representative of what could occur along the entire Bay shoreline. The mapped scenarios are based on binning the water levels with a tolerance of ±3 inches.";
                }
                // print button
                document.querySelector("#print-button").addEventListener("click", function() { window.print(); });
            }
        );
    };
});