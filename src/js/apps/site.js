define([
    'jquery', 
    'common', 
    'modals', 
    'site-element', 
    'pages', 
    'modules/router', 
    'modules/resize-to-fit', 
    'modules/theater-mode', 
    'modules/navbar', 
    'modules/sync-scroll'
], function(
    jQuery, 
    common, 
    modals, 
    SiteElement, 
    Pages, 
    Router, 
    ResizeToFit, 
    TheaterMode, 
    Navbar, 
    SyncScroll
) {
    if(!window.cmLibGlobals.jQueryHelpersDefined) {
        window.cmLibGlobals.initJQueryHelpers();
    }
    
    function Site(config) {
        var self = this;
        // slr application
        this.slr          = null;
        // state variables
        this.page         = null;
        this.lastPage     = null;
        this.splashOn     = false;
        this.askedLang    = false;
        this.storymapLang = "en";
        // site element handlers
        this.elements = (function() {
            var elements = {
                container:           "#container", 
                // splash
                splash:              "#splash-container", 
                splashMenu:          "#splash-menu", 
                splashMenuItem:      "#splash-menu .menu-item", 
                splashMenuSubtitle:  "#splash-menu .menu-item-subtitle", 
                splashDisclaimer:    "#splash-bottom-content a", 
                // header
                header:              "#header", 
                headerInner:         "#header-inner", 
                headerBackBar:       "#header-back-bar", 
                nav:                 "#nav", 
                menu:                "#menu", 
                menuItem:            "#menu .menu-item", 
                menuItemSplash:      "#menu-item-splash", 
                menuItemSplashIcon:  "#menu-item-splash img", 
                slrToolMenu:         "#slr-menu", 
                menuTranslate:       "#menu-translate", 
                // stage and content
                stage:               "#stage", 
                innerStage:          "#inner-stage", 
                pageTitle:           "#page-title", 
                // sidebar elements
                sidebar:             "#sidebar", 
                navbar:              "#navbar", 
                // footer elements
                footer:              "#footer", 
                // storymap
                storymap:            "#embedded-storymap", 
                // slr container
                slrContainer:        "#slr-container", 
                // modal
                modalOuter:          "#cm-modal-outer", 
                // downloads
                downloadTable:       "#download-table", 
                downloadables:       ".downloadable", 
                downloadForm:        "#download-form"
            };
            for(var e in elements) { elements[e] = new SiteElement(elements[e]); };
            return elements;
        })();
        // google analytics
        this.gAnalyticsId = config ? config.gAnalyticsId || false : false;
        // pull this as jquery persistently so we don't requery all the time
        this.$splash = this.elements.splash.asJQuery();
        this.splashVisible = true;
        // Because using -100vh doesn't work on mobile..
        window.addEventListener('resize', function() {
            if(!self.splashVisible) {
                self.$splash.css("margin-top", -window.innerHeight);
            }
        });
        
        // navbar modules
        this.navbar = new Navbar(
            this.elements.navbar.asJQuery(), 
            this.scrollToElement.bind(this)
        );
        this.syncScroll = null;

        // translate button (only on storymap)
        this.elements.menuTranslate.asElementSingle().addEventListener('click', function() {
            self.askStorymapLanguage();
        });
        
        // prepare back bar on header
        this.backBarAnimationMs = 500;
        var backBar = this.elements.headerBackBar.asElementSingle(), 
            transition = "opacity " + this.backBarAnimationMs + "ms";
        backBar.style["display"] = "none";
        backBar.style["-moz-transition"] = transition;
        backBar.style["-webkit-transition"] = transition;
        backBar.style["transition"] = transition;
        
        // subtitle effect on splash page buttons
        this.elements.splashMenuSubtitle.asJQuery().each(function() {
            var elem = $(this);
            elem.prev(".menu-item")
                .mouseover(function() { elem.css("opacity", 1).slideDown(); })
                .mouseout(function() { elem.css("opacity", 0).slideUp(); });
        });
        
        // create and attach page router
        this.router = new Router(this, this, "ART Bay Shoreline Flood Explorer");
        this.router.attach(
            this.elements.menuItem, 
            function(elem) { return elem.getAttribute("goto"); }
        );
        this.router.appendAttach(this.elements.splashMenuItem);
        this.router.appendAttach(this.elements.splashDisclaimer);
        // to reduce clutter, router setup pulled here
        this.__initRouterStuff();
        
        // "Theater mode" when switching to slr-viewer or storymap
        this.theaterMode = new TheaterMode(this, this.router);
        this.theaterMode.addPage(Pages["learn"]);
        this.theaterMode.addPage(Pages["explorer"]);
        
        var headerOffset = document.getElementById('header').clientHeight;
        // IFrame dynamic resize
        ResizeToFit(this.router, this.elements.storymap, {
            responsiveHeight: true, 
            heightOffset: headerOffset
        });
        // for mobile/tablets that may or may not be messing with viewport scale, have to force resize of the 
        // stage otherwise CSS goes completely wonky as 100%/100vh values become unpredictable
        ResizeToFit(this.router, this.elements.container, {
            minWidth: 640, 
            responsiveWidth: false, 
            responsiveHeight: true
        });
    }
    
    Site.prototype.__initRouterStuff = function() {
        var self = this;
        // download footer HTML (synchronously)
        var htmlFooter = "";
        $.ajax({
            async: false, 
            url: "partials/footer.php", 
            success: function(html) {
                htmlFooter = html;
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                console.debug("Error downloading footer HTML");
                console.debug(textStatus + ": " + errorThrown);
            }
        });
        // for canceling reloading the same page
        this.router.setCheckChangeEvent(function(page) {
            // same page
            return !self.page || Pages[page] !== self.page;
        });
        // this to do before page change (this got really circuitous with callback calling callback but 
        // necessary due to all these async events that sometimes need to wait)
        this.router.addBeforeChangeEvent(function(page) {
            // save new page state
            self.lastPage = self.page;
            self.page = Pages[page];
            // google analytics
            if(typeof window.gtag !== "undefined" && self.gAnalyticsId) {
                window.gtag('config', self.gAnalyticsId, {
                    page_title: self.page.name, 
                    page_location: location.protocol + '//' + location.host + "/" + page, 
                    engagement_time_msec: 100
                });
            }
            // hide navbar if necessary
            if(!self.page.showSideBar || !self.page.buildNav) {
                if(!self.page.showSideBar) self.elements.sidebar.asJQuery().hide();
                self.navbar.hide();
                if(self.syncScroll) self.syncScroll.reset();
            }
            // return this as callback if router must wait for transition to complete
            var waitToTransition = null;
            // transition to/from loading page skips animation
            if(!self.lastPage) {
                if(self.page === Pages["home"]) {
                    $("body").addClass("in-splash");
                    self.showSplash(true);
                } else {
                    $("body").removeClass("in-splash");
                    self.hideSplash(true);
                }
            // transition to and from splash, add callback to let router wait until animation complete
            } else if(self.page === Pages["home"]) {
                $("body").addClass("in-splash");
                waitToTransition = function(completePromise) {
                    self.showSplash(false, completePromise);
                };
            } else if(self.lastPage === Pages["home"]) {
                $("body").removeClass("in-splash");
                waitToTransition = function(completePromise) {
                    self.hideSplash(false, completePromise);
                };
            }
            // set active menu item
            if(self.menuElems) {
                self.menuElems.each(function() {
                    if(self.page === this.getAttribute("goto")) {
                        this.classList.add("active");
                    } else {
                        this.classList.remove("active");
                    }
                });
            }
            return waitToTransition;
        });
        // things to do after page change
        this.router.addOnChangeEvent(function(page) {
            // add classes to help modify view
            var pDetect = false;
            if(self.page === Pages["learn"]) {
                pDetect = true;
                $("body").addClass("in-storymap");
                // set lang from last
                if(self.storymapLang && self.storymapLang != "en" && self.storymapLang in self.page.lang) {
                    var storymapElem = self.elements.storymap.asElementSingle();
                    if(storymapElem) {
                        storymapElem.setAttribute("lang", self.storymapLang);
                        storymapElem.setAttribute("src", self.page.lang[self.storymapLang]);
                    }
                }
                // ask about other languages
                if(!self.askedLang) {
                    self.askStorymapLanguage();
                    self.askedLang = true;
                }
            } else {
                $("body").removeClass("in-storymap");
            }
            if(!pDetect && self.page === Pages["explorer"]) {
                pDetect = true;
                $("body").addClass("in-slr-view");
            } else if(self.slr) {
                $("body").removeClass("in-slr-view");
                // cleanup event listeners when switching from slr-viewer
                self.slr.exit();
                self.slr = null;
            }
            // footer (i hate hate hate hate IE)
            if(self.page.showFooter && !window.browser.isIE) {
                self.elements.stage.asJQuery().append(htmlFooter);
                var $footer = self.elements.footer.asJQuery();
                $footer.find(".footer-logo-text a").each(function() {
                    var bindLogo = this.getAttribute("bind-logo");
                    if(!bindLogo) return;
                    var bindTo = self.elements.footer.asJQuery().find(".footer-logo[bind-logo="+bindLogo+"] img");
                    $(this).hover(
                        function() { bindTo.css({opacity: 1, filter: "saturate(100%)"}); }, 
                        function() { bindTo.css({opacity: "", filter: ""}); }
                    );
                });
                self.enableSiteLinks($footer);
            }
            // back bar
            var backBar = self.elements.headerBackBar.asElementSingle();;
            if(self.page.showBackBar && self.lastPage) {
                backBar.querySelector(".lastpage").innerHTML = self.lastPage.name + " page";
                backBar.style["display"] = "flex";
                backBar.style["opacity"] = 1;
            } else if(backBar.style["display"] !== "none") {
                backBar.style["opacity"] = 0;
                setTimeout(function() { backBar.style["display"] = "none"; }, self.backBarAnimationMs);
            }
            // in-content links
            self.enableSiteLinks(self.elements.innerStage.asJQuery());
            // sidebar element
            if(self.page.showSidebar) {
                // build navbar
                if(self.page.buildNav) {
                    if(self.page.buildNav === "list") {
                        self.navbar.buildFromList(
                            self.elements.innerStage.asJQuery().find("ul:first"), 
                            self.page.key
                        );
                    } else {
                        self.navbar.buildFromHeaders(
                            self.elements.innerStage.asJQuery().find(":header"), 
                            self.page.key
                        );
                    }
                }
                self.elements.sidebar.asJQuery().show();
                // sync scroll handler for navbar
                if(!self.syncScroll) {
                    self.syncScroll = new SyncScroll({
                        view:   self.elements.stage.asJQuery(), 
                        listen: self.elements.stage.asJQuery(), 
                        scroll: self.elements.innerStage.asJQuery(), 
                        sync:   self.elements.navbar.asJQuery()
                    });
                } else {
                    self.syncScroll.reset({
                        scroll: self.elements.innerStage.asJQuery()
                    });
                }
            }
            // downloads
            if(!pDetect && self.page === Pages["download"]) {
                self.initDownloads();
            }
        });
    };
    
    Site.prototype.scrollToElement = function(scrollToElem) {
        scrollToElem = $(scrollToElem);
        if(!scrollToElem.length) return;
        var innerStageOffset = this.elements.innerStage.asJQuery().offset().top;
        var scrollTo = scrollToElem.offset().top - innerStageOffset - 24;
        if(scrollTo < 0) scrollTo = 0;
        var diff = Math.abs(innerStageOffset - scrollTo), 
            speed = Math.floor(900*Math.exp(-100/diff));
        this.elements.stage.asJQuery().animate({scrollTop: scrollTo}, speed);
    };
    
    Site.prototype.enableSiteLinks = function(container) {
        var self = this;
        container = $(container);
        container.find("a.site-link").on('click', function(evt) {
            if(common.isModalOpen()) common.closeModal();
            if(evt.ctrlKey || evt.shiftKey || evt.metaKey || (evt.button && evt.button === 1)) {
                // open in new window for new-tab/window events
                return;
            }
            evt.preventDefault();
            self.router.changePage(this.getAttribute("goto"));
        });
        container.find("a.a-link").on('click', function(evt) {
            if(evt.ctrlKey || evt.shiftKey || evt.metaKey || (evt.button && evt.button === 1)) {
                // open in new window for new-tab/window events
                return;
            }
            evt.preventDefault();
            self.scrollToElement($("a[name='"+this.getAttribute('goto')+"']"));
        });
    };
    
    Site.prototype.showSplash = function(dontAnimate, onComplete) {
        this.elements.menuItemSplashIcon.asJQuery().removeClass("animate-unrotate").addClass("animate-rotate");
        if(dontAnimate) {
            this.elements.splash.asJQuery().css("margin-top", "0vh");
            this.splashVisible = true;
            if(onComplete) onComplete();
            return;
        }
        var self = this;
        this.$splash.animate(
            {"margin-top": "0px"}, 
            600, 
            "swing", 
            function() {
                self.splashVisible = true;
                if(onComplete) {
                    onComplete(self._splashChanged.bind(self));
                } else {
                    self._splashChanged();
                }
            }
        );
    };
    
    Site.prototype.hideSplash = function(dontAnimate, onComplete) {
        this.elements.menuItemSplashIcon.asJQuery().removeClass("animate-rotate").addClass("animate-unrotate");
        if(dontAnimate) {
            this.elements.splash.asJQuery().css("margin-top", -window.innerHeight+"px");
            this.splashVisible = false;
            if(onComplete) onComplete();
            return;
        }
        var self = this;
        this.$splash.animate(
            {"margin-top": -window.innerHeight+"px"}, 
            600, 
            "swing", 
            function() {
                self.splashVisible = false;
                if(onComplete) {
                    onComplete(self._splashChanged.bind(self));
                } else {
                    self._splashChanged();
                }
            }
        );
    };
    
    Site.prototype._splashChanged = function() {
        // Slider being created as panels are moving about causes issues so force resize event when finished 
        // to adjust everything. Really don't like this way of doing it, wanted to keep separation of 
        // concerns, but the resize trigger doesn't seem to trigger the event listener.
        //$(window).trigger('resize');
        if(window.slr) window.slr.forceResizeAdjust();
    };
    
    Site.prototype.askStorymapLanguage = function() {
        var self = this, 
            storymapElem = this.elements.storymap.asElementSingle();
        // open modal to ask language
        modals.open(
            "storymap-lang", 
            {
                url: "partials/modal-storymap-lang.html", 
                id: "lang-select-modal"
            }, 
            function() {
                self.elements.modalOuter.asJQuery()
                  .find(".lang-select-btn")
                    .on('click', function(evt) {
                        var langKey = this.getAttribute("value");
                        if(langKey && self.page.lang && langKey in self.page.lang) {
                            self.storymapLang = langKey;
                            storymapElem.setAttribute("lang", langKey);
                            storymapElem.setAttribute("src", self.page.lang[langKey]);
                            modals.close();
                        } else {
                            evt.stopPropagation();
                            modals.openError(
                                "Translation Not Yet Available", 
                                "The translation for this storymap in <span class='notranslate'>" + this.innerText + "</span> is still under construction. We apologize for the inconvenience, please try again at a later date."
                            );
                        }
                    });
            }
        );
    };
    
    Site.prototype.initDownloads = function() {
        var self = this;
        this.elements.downloadables.asJQuery().each(function() {
            this.addEventListener('click', function() {
                self._downloadableListener(this);
            });
        });
    };
    
    Site.prototype._downloadableListener = function(elem) {
        if(!elem) return;
        elem.style['cursor'] = 'wait';
        elem.removeEventListener('click', this._downloadableListener);

        var dlModalPath;
        if(elem.classList.contains("disclaimer-consequence")) {
            dlModalPath = "partials/modal-download-data-consequence.php";
        } else {
            dlModalPath = "partials/modal-download-data.php";
        }
        
        var self = this, 
            dlKey = elem.getAttribute("dl-key");
        $.ajax({
            url: "download.php", 
            method: "POST", 
            data: {
                r: "prep", 
                f: dlKey
            }, 
            dataType: "json", 
            error: function(jqXHR, textStatus, errorThrown) {
                alert("Error connecting to download");
                console.debug(textStatus + ": " + errorThrown);
            }, 
            success: function(res) {
                if(!res[0]) {
                    alert(res[1]);
                } else {
                    modals.open(
                        "download-data", 
                        {
                            url: dlModalPath, 
                            id: "download-data-modal"
                        }, 
                        function(modalElem) {
                            var filesize = parseFloat(res[2]) / 1048576.0;
                            if(filesize < 1024.0) {
                                filesize = filesize.addCommas(1) + " MB";
                            } else {
                                filesize = (filesize/1024.0).addCommas(1) + " GB";
                            }
                            modalElem.find(".filename").html(res[1]);
                            modalElem.find(".filesize").html(filesize);
                            modalElem.find(".cancel").on('click', function() { modals.close(); });
                            modalElem.find(".accept").on('click', function() {
                                self.elements.downloadForm.asElementSingle().submit();
                                modals.close();
                                // google analytics
                                if(typeof window.gtag !== "undefined") {
                                    window.gtag('event', 'download', {
                                        "request": dlKey
                                    });
                                }
                            });
                        }
                    );
                }
            }, 
            complete: function() {
                elem.style['cursor'] = null;
                elem.addEventListener('click', self._downloadableListener);
            }
        });
    };
    
    return Site;
    
});