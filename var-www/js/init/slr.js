/*
 * Developed by the San Francisco Estuary Institute (SFEI) for the SF Bay Conseravtion and Development 
 * Commission (BCDC).
 * @copyright 2025 San Francisco Estuary Institute (SFEI)
 * @author SFEI
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define([
    'jquery', 
    'common', 
    'apps/slr', 
    'get-config'
], function(
    jQuery, 
    common, 
    SLR, 
    getConfig
) {
    if(!window.cmLibGlobals.jQueryHelpersDefined) {
        window.cmLibGlobals.initJQueryHelpers();
    }
    return function() {
        // need global 'site' var
        if(!window.site) return;
        // slr app global memory
        if(!window.slrm) window.slrm = {};
        // end app, if already existing
        if(window.site.slr) {
            window.site.slr.exit();
            window.site.slr = null;
        }
        // take snapshot of state before initialzing app (which will modify state)
        var restore = JSON.parse(JSON.stringify(window.slrm));
        // start app
        var slr = window.site.slr = new SLR(
            getConfig(), 
            {
                // link site instance
                site: window.site, 
                // below sets change listeners to keep global memory synced
                stateOn: {
                    set: function(event, key, value, old) {
                        window.slrm[key] = value;
                    }
                }, 
                layerChange: function(layerStates) {
                    window.slrm.layers = layerStates;
                }, 
                udaChange: function(uda) {
                    window.slrm.uda = uda;
                }
            }
        );
        slr.init(
            // restore state
            restore, 
            // This callback is called after initialization is finalized, activating the app.
            function(errors) {
                // sometimes the clippath for the bar doesn't get redrawn properly, so just force it again
                slr.mapHandler.olMap.once("postrender", function() { slr.slider._forceRedrawBar(); });
                // disclaimer (show only if not seen before)
                if(window.slrm.hidedisclaimer) {
                    common.closeModal();
                } else {
                    // start halfway for animation
                    slr.openSplashModal(true);
                    if(errors && errors.length) {
                        var errorP = $("#slr-splash-modal p.error");
                        for(var i = 0; i < errors.length; ++i) {
                            if(i > 0) errorP.append("<br />");
                            errorP.append(errors[i]);
                        }
                    }
                    window.slrm.hidedisclaimer = true;
                }
            }
        );
    };
});