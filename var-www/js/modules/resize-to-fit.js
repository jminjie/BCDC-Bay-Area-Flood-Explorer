define(function() {
    
    /**
     * Handles auto-resizing elements to fit as well as for responsive layouts. Generally reserved for things 
     * that need to fill the full width and/or height of the screen, though offsets may be provided in pixel 
     * value.
     * <br /><br />
     * Adds resize listener to the router (on page change) and to the window on resize event. Thus do not 
     * apply more than once (as currently no way to clean these event listeners). The element does not have to
     * be presistent, it requeries for the element each time, so even if the element disappears/reappears, the
     * resize will still be applied.
     * @param {Router} router - Router object, used to attached event listener for page change
     * @param {SiteElement} siteElement - Site element object for which to apply resize
     * @param {Object} options
     * @param {boolean} responsiveWidth - If true, enabled for adjusting width.
     * @param {boolean} responsiveHeight - If true, enabled for adjusting height.
     * @param {number} [options.minWidth=Infinity] - Dyanmic resize to only be applied if below this width. 
     *        Useful for responsive layouts as this both only uses dynamic resizes below a certain screen size
     *        and also erases any forced width/height inline styles when above this value. Of course this 
     *        means that <strong>any element this is applied to should never be given an inline style for 
     *        width/height</strong>.
     * @param {number} [widthOffset] - Offset, in pixels, for the adjusted width (that is 100% window width 
     *        minus this value).
     * @param {number} [heightOffset] - Offset, in pixels, for the adjusted height (that is 100% window height
     *        minus this value).
     */
    return function(router, siteElement, options) {
        if(!options)          options = {};
        if(!options.minWidth) options.minWidth = Infinity;
        var resizeHeight = function(elem) {
                var height = window.innerHeight - (options.heightOffset || 0);
                elem.height = height;
                elem.style.height = height + "px";
            }, 
            resizeWidth = function(elem) {
                var width = document.body.clientWidth - (options.widthOffset || 0);
                elem.width = width;
                elem.style.width = width + "px";
            }, 
            resizeListener = function() {
                var elem = siteElement.asElementSingle();
                if(!elem) return;
                if(window.screen.width < options.minWidth) {
                    if(options.responsiveWidth) {
                        resizeWidth(elem);
                    }
                    if(options.responsiveHeight) {
                        resizeHeight(elem);
                    }
                } else {
                    // if normal window resizing between big/small, make sure to clear forced dimensions
                    if(options.responsiveWidth && elem.style.width !== "") {
                        elem.style.width = "";
                    }
                    if(options.responsiveHeight && elem.style.height !== "") {
                        elem.style.height = "";
                    }
                }
            };
        resizeListener();  // fire once to start
        window.addEventListener('resize', resizeListener);
        router.addOnChangeEvent(resizeListener);
    };
    
});