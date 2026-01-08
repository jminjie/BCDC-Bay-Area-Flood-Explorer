define([
    "jquery", 
    "common", 
    "pages", 
    "text!../../pages/404.html", 
    "text!../../pages/loading.html"
], function(
    jQuery, 
    common, 
    Pages, 
    html404Page, 
    htmlLoadingPage
) {
    
    function Router(site, defaultTitle) {
        var self = this;
        
        this.$stage        = site.elements.stage.asJQuery();
        this.titleSelector = site.elements.pageTitle.value;
        this.defaultTitle  = defaultTitle || "Page Title";
        this._menuElems    = null;
        this._beforeChange = [];
        this._onChange     = [];
        this._withChange   = [];
        this._goToFunction = function(elem) { return "404"; };
        this._checkChange  = function() { return true; };
        this._scrollTop    = 0;
        
        // local function to be attached to menu items
        this._listener = function(evt) {
            if(common.isModalOpen()) common.closeModal();
            // use default action if opening in new tab/window
            if(evt.ctrlKey || evt.shiftKey || evt.metaKey || (evt.button && evt.button === 1)) {
                return;
            }
            // get go-to value
            var goto = self._goToFunction(this);
            if(goto) {
                evt.preventDefault();
                evt.stopPropagation();
                self.changePage(goto);
            }
        };
        
        // handle back/pop-state events
        window.onpopstate = function(evt) {
            if(evt.state) {
                if(common.isModalOpen()) common.closeModal();
                self.changePage(evt.state.p, true, self._scrollTop);
            }
        };
    };
    
    Router.prototype.attach = function(menuElems, goToFunction) {
        if(this._menuElems) this.detach();
        this._goToFunction = goToFunction;
        this._menuElems = [];
        var newElems = menuElems.asElement();
        for(var i = 0; i < newElems.length; ++i) {
            newElems[i].addEventListener("click", this._listener, true);
            this._menuElems.push(newElems[i]);
        }
    };
    
    Router.prototype.appendAttach = function(menuElems) {
        if(!this._menuElems) this._menuElems = [];
        var newElems = menuElems.asElement();
        for(var i = 0; i < newElems.length; ++i) {
            newElems[i].addEventListener("click", this._listener, true);
            this._menuElems.push(newElems[i]);
        }
    };
    
    Router.prototype.detach = function() {
        if(!this._menuElems) return;
        for(var i = 0; i < this._menuElems.length; ++i) {
            this._menuElems[i].removeEventListener("click", this._listener, true);
        }
        this._menuElems = null;
    };
    
    Router.prototype.setCheckChangeEvent = function(checkChange) {
        this._checkChange = checkChange;
    };
    
    Router.prototype.addBeforeChangeEvent = function(beforeChange) {
        this._beforeChange.push(beforeChange);
    };
    
    Router.prototype.removeBeforeChangeEvent = function(beforeChange) {
        var i = this._beforeChange.indexOf(beforeChange);
        if(i >= 0) this._beforeChange.splice(i, 1);
    };
    
    Router.prototype.addOnChangeEvent = function(onChange) {
        this._onChange.push(onChange);
    };
    
    Router.prototype.removeOnChangeEvent = function(onChange) {
        var i = this._onChange.indexOf(onChange);
        if(i >= 0) this._onChange.splice(i, 1);
    };
    
    Router.prototype.addWithChangeEvent = function(withChange) {
        this._withChange.push(withChange);
    };
    
    Router.prototype.removeWithChangeEvent = function(withChange) {
        var i = this._withChange.indexOf(withChange);
        if(i >= 0) this._withChange.splice(i, 1);
    };
    
    Router.prototype.changePage = function(page, back, scrollTo) {
        // split page by anchor, if supplies
        var pieces = page.split("#"), 
            anchor = null;
        if(pieces.length > 1) {
            page = pieces[0];
            anchor = pieces[1];
        }
        
        // check whether we should load next page
        if(this._checkChange && !this._checkChange(page)) {
            // scroll only
            if(anchor) window.location.hash = "#"+anchor;
            return;
        }
        
        // save scroll top position before modifying content
        this._scrollTop = this.$stage.scrollTop();
        
        this.$stage.html(htmlLoadingPage);
        if(!Pages[page]) page = "404";
        // page change handled by promise, default wait of 1 (for html)
        var self = this, 
            beforeCallbacks = [], 
            promiseHtml = null, 
            promiseWait = 1, 
            promiseCount = 0, 
            checkPromise = function() {
                if(++promiseCount === promiseWait) {
                    // load html
                    if(promiseHtml) self.$stage.html(promiseHtml);
                    // set current page menu item as active
                    self.setActiveMenuItem(page);
                    // set title from page
                    var titleElem = self.$stage.find(self.titleSelector), 
                        title = titleElem.length ? titleElem[0].innerText : self.defaultTitle;
                    // save state
                    if(!back) {
                        history.pushState({p: page}, title, "/"+page);
                        if(title) document.title = title;
                    }
                    // onchange events
                    for(var i = 0; i < self._onChange.length; i++) {
                        self._onChange[i](page);
                    }
                    // current page
                    self.currentPage = page;
                    // scroll to
                    if(scrollTo) {
                        self.$stage.scrollTop(scrollTo);
                    } else if(anchor) {
                        window.location.hash = "#"+anchor;
                    }
                }
            };
        // before change events
        this._beforeChange.forEach(function(doBefore) {
            // if function returns callback, means it must be added to wait process
            var beforeWait = doBefore(page);
            if(beforeWait) {
                beforeCallbacks.push(beforeWait);
                ++promiseWait;
            }
        });
        beforeCallbacks.forEach(function(beforeWait) {
            beforeWait(checkPromise);
        });
        // get HTML via ajax
        $.ajax({
            url: Pages[page].html, 
            error: function(jqXHR, textStatus, errorThrown) {
                page = "404";
                self.$stage.html(html404Page);
                console.log(textStatus + ": " + errorThrown);
            }, 
            success: function(html) {
                promiseHtml = html;
            }, 
            complete: function() {
                checkPromise();
            }
        });
        for(var i = 0; i < this._withChange.length; i++) {
            this._withChange[i](page);
        }
    };
    
    Router.prototype.setActiveMenuItem = function(page) {
        if(!this._menuElems) return;
        this._menuElems.forEach(function(elem) {
            if(page === elem.getAttribute("goto")) {
                elem.classList.add("active");
            } else {
                elem.classList.remove("active");
            }
        });
    };
    
    return Router;
    
});