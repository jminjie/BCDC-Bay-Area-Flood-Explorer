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
    'domReady!', 
    'jquery', 
    'common', 
    'init/debug', 
    'apps/site', 
    'get-config'
], function(
    domReady, 
    jQuery, 
    common, 
    debug, 
    Site, 
    getConfig
) {
    return function() {
        // loading small animation
        var c = 0, 
            animateMs = 600;
        function animateLoading() {
            if(++c > 3) c = 1;
            $("#loading-block .animate-loading").html(".".repeat(c));
            if(animateMs) setTimeout(animateLoading, animateMs);
        }
        setTimeout(animateLoading, animateMs);
        // load site
        window.site = new Site(getConfig());
        // clear loading
        $("#loading-block").fadeOut(100, function() {
            animateMs = 0;
            this.remove();
        });
        // load first page
        var page   = window._siteInit && window._siteInit.page   || "home", 
            anchor = window._siteInit && window._siteInit.anchor || null;
        window.site.router.changePage(page + (anchor ? "#"+anchor : ""));
    };
});