/*
 * Developed by the San Francisco Estuary Institute (SFEI) for the SF Bay Conseravtion and Development 
 * Commission (BCDC).
 * @copyright 2018
 * @author Lawrence S.
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