
define(function() {

    function TheaterMode(site, router) {
        // list of pages which use theater mode
        this.pagesActive  = [];
        // animation duration
        this._animateOnMs   = 800;
        // get elements
        var header        = site.elements.header.asElementSingle(), 
            headerInner   = site.elements.headerInner.asElementSingle();
        // pull some CSS styles for reverting back to later
        var curBackground = window.getComputedStyle(header)["background-color"];
        // set styles on inline
        header.style["background-color"] = curBackground;
        // add transition to elements
        header.style["transition-property"] = "background";
        headerInner.style["transition-property"] = "left";
        var elems = [header, headerInner];
        for(var i = 0; i < elems.length; ++i) {
            elems[i].style["-o-transition-duration"] = this._animateOnMs + "ms";
            elems[i].style["-moz-transition-duration"] = this._animateOnMs + "ms";
            elems[i].style["-webkit-transition-duration"] = this._animateOnMs + "ms";
            elems[i].style["transition-duration"] = this._animateOnMs + "ms";
        }
        
        var self = this;
        router.addBeforeChangeEvent(function(page) {
            var onTheaterPage   = false, 
                fromTheaterPage = false;
            for(var i = 0; i < self.pagesActive.length; i++) {
                if(site.page === self.pagesActive[i]) {
                    onTheaterPage = true;
                } else if(site.lastPage === self.pagesActive[i]) {
                    fromTheaterPage = true;
                }
                if(onTheaterPage && fromTheaterPage) {
                    break;
                }
            }
            if(onTheaterPage !== fromTheaterPage) {
                return function(completePromise) {
                    if(onTheaterPage) {
                        document.body.classList.add("in-theater-mode");
                        self._animate(header, {"background-color": '#000'});
                        self._animate(headerInner, {left: '0%'});
                    } else {
                        document.body.classList.remove("in-theater-mode");
                        self._animate(header, {"background-color": curBackground});
                        self._animate(headerInner, {
                                // this has got to be hardcoded (IE doesn't do transitions with calc())
                                // UPDATE TO FIT LEFT PROPERTY IN SITE.CSS
                                left: (0.5*document.body.clientWidth - 390) + "px"
                            }, function() {
                                // clear style when done so calc() retakes over
                                headerInner.style["left"] = "";
                            });
                    }
                    // wait until transition is complete
                    setTimeout(completePromise, this._animateOnMs);
                }
            }
        });
    };
    
    TheaterMode.prototype.addPage = function(onPage) {
        if(this.pagesActive.indexOf(onPage) < 0) {
            this.pagesActive.push(onPage);
        }
    };
    
    TheaterMode.prototype.removePage = function(onPage) {
        var index = this.pagesActive.indexOf(onPage);
        if(index >= 0) {
            this.pagesActive.splice(index, 1);
        }
    };
    
    TheaterMode.prototype._animate = function(element, style, onComplete) {
        for(var key in style) {
            element.style[key] = style[key];
        }
        if(onComplete) setTimeout(onComplete, this._animateOnMs);
    };
    
    return TheaterMode;
    
});
