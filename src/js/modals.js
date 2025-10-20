//************************************************************************************************************
// Modals (module)
//   -Handles/consolidates help modals/text
//   -Loads and caches HTML on demand (rather than previously requiring each to be loaded in the define call)
//   -Loads are done asynchronously so as not to tie up application.
//************************************************************************************************************

define([
    "common", 
    "text!../partials/modal-loading.html"
], function(
    common, 
    htmlModalLoading
) {
    
    /**
     * Constructor.
     */
    Modals = function() {
        this.draggableInit = false;
        this.currentMutli  = 0;
        // dictionary of modal HTMLs and locations to retrieve them
        this.htmlDict = {
            // pages to be preloaded
            "loading":      [htmlModalLoading]
            // pages to be loaded on demand will be stored here
            //"typeKey": [null, "url/to/content.html"]
        };
        // event listeners by key, then array
        this._listeners = {
            'open': [], 
            'error': [], 
            'complete': []
        };
    };
    
    /**
     * Dynamically enable help links within the provided container. Help links are identified by the class 
     * "modal-help-link" and the attribute "goto" in the element is used to select the modal help it will 
     * open (i.e. it is used as the 'type' paramter in HelpModals.open()).
     * @param {jQuery} container - DOM element or selector string for container.
     * @param {Object} options - Options provided when opening help links (see 
     *        [HelpModals.open()]{@link HelpModals#open}).
     */
    Modals.prototype.enableHelpLinks = function(container, options) {
        var self = this;
        $(container).find(".modal-help-link").on('click', function(e) {
            e.preventDefault();
            self.open(this.getAttribute("goto"), options);
            // necessary if within modal to stop common lib from thinking you've clicked outside due to changed content
            e.stopPropagation();
        });
    };
    
    Modals.prototype.on = function(key, listener) {
        if(!(key in this._listeners)) {
            this._listeners[key] = [listener];
        } else if(this._listeners[key].indexOf(listener) < 0) {
            this._listeners[key].push(listener);
        }
    };
    
    Modals.prototype.un = function(key, listener) {
        if(!(key in this._listeners)) return;
        var index = this._listeners[key].indexOf(listener);
        if(index >= 0) this._listeners[key].splice(index, 1);
    };
    
    
    /**
     * Open an error modal dialog.
     * @param {String} [title] - The modal title, default is "The application has encountered an error", or 
     *        "Fatal Error" if fatal=true.
     * @param {String} [message] - The message. Default is "The application has encountered an error, please 
     *        try again."
     * @param {Boolean} [fatal] - If true, creates an unexitable modal, basically ending any further user 
     *        interaction the application.
     */
    Modals.prototype.openError = function(title, message, fatal) {
        if(!title) {
            title = fatal ? "Fatal Error" : "The application has encountered an error";
        }
        if(!message) { message = "The application has encountered an error, please try again."; }
        return common.setModal(
            true, 
            "<h1>"+title+"</h1><p class='error'>"+message+"</p>", 
            {
                id: "modal-error", 
                notExitable: fatal, 
                hideCloser: fatal, 
                showBackground: fatal
            }
        );
    };
    Modals.prototype.error = function(title, message, fatal) {
        this.openError(title, message, fatal);
    };
    
    /**
     * Open a modal.
     * @param {String} type - Identifier of help page to open. Equivalent to key in 
     *        [HelpModals.htmlDict]{@link HelpModals#htmlDict}. If new type, must supply URL in options.
     * @param {Object} [options] - Object of options
     * @param {Boolean} [options.url] - Required if setting a new type that has not yet been loaded. The URL 
     *        to the html content of the modal.
     * @param {Boolean} [options.id] - ID of modal content div. Defaults to "modal-content";
     * @param {Boolean} [options.change] - If true and the modal is already open, uses a change animation on 
     *        the existing modal to smoothly replace the content and animate the change in height.
     * @param {Boolean} [options.force] - If true, sets a modal as not exitable without clicking a close 
     *        button or the top-right 'x'. If false, simply clicking outside the modal window will close it.
     * @param {Boolean} [options.draggable] - If true, enables draggable modal. However this is overwritten to
     *        false in any multipage modal, as the dynamic content replacement gets buggy combined with the 
     *        draggable functionality.
     * @param {Boolean} [options.addCloseButton] - If true, appends a simple close button at bottom of modal 
     *        content.
     * @param {Callback} [onOpen] - Function to run on opening modal.
     */
    Modals.prototype.open = function(type, options, onOpen) {
        // default options
        if(!options) { options = {}; }
        options.change    = !!options.change;
        options.force     = !!options.force;
        options.draggable = !!options.draggable;
        options.id        = options.id ? options.id : "modal-content";
        var idSelector    = "#"+options.id;
        options.addCloseButton = !!options.addCloseButton;
        
        var changeOpenModal = options.change && common.isModalOpen();
        
        // fix to old height to prep animation before proceeding
        var modalContent = null, oldHeight = '';
        if(changeOpenModal) {
            modalContent = $("#cm-modal-container .cm-modal-inner");
            oldHeight = modalContent.height();
            modalContent.css('height', oldHeight);
            // prep with loading message
            modalContent.html(this.htmlDict["loading"][0]);
        }
        
        // success, error, and compete functions
        var self = this;
        var onSuccess = function(html) {
                if(!changeOpenModal) {
                    // if brand new modal, just use built-in open function
                    common.setModal(true, html, {
                        id: options.id, 
                        notExitable: options.force, 
                        showBackground: options.force, 
                        hideCloser: options.force && !options.showCloser, 
                        // necessary to 'reset' draggable
                        onClose: function() {
                            if(options.draggable) {
                                $(idSelector).draggable('disable').removeAttr('style');
                            }
                        }
                    });
                }
                // add close button
                var modalContent = $(idSelector);
                if(options.addCloseButton) {
                    $("<div>", {'class': "btn2 close-btn"}).appendTo(modalContent)
                        .html("Close")
                        .on('click', self.close.bind(self));
                }
                // if doing change animation, finish animation
                if(changeOpenModal) {
                    modalContent = $(idSelector).css('height', '').css('width', '');
                    var newHeight = modalContent.height();
                    modalContent.css('height', oldHeight);
                    modalContent.animate(
                        {height: newHeight}, 
                        200, 
                        "swing", 
                        function() { modalContent.css('height', ''); }
                    );
                }
                // event listeners first
                for(var i = 0; i < self._listeners["open"].length; ++i) {
                    self._listeners["open"][i](modalContent);
                }
                // on complete
                if(onOpen) onOpen(modalContent);
            }, 
            
            onError = function(message) {
                if(!changeOpenModal) {
                    // if not doing any change, just switch to error modal
                    self.openError("Error", message, false);
                } else {
                    // kill animation stuff first
                    $(idSelector).css({'height': '', 'width': ''});
                    // switch to error modal
                    self.openError("Error", message, false);
                }
                // event listeners first
                for(var i = 0; i < self._listeners["error"].length; ++i) {
                    self._listeners["error"][i](modalContent);
                }
            }, 
            
            onComplete = function() {
                var modalContent = $(idSelector);
                // enable close button
                modalContent.find(".close-btn").on('click', function() {
                    common.setModal(false);
                });
                // enable help links
                self.enableHelpLinks(
                    modalContent, 
                    {change: true, draggable: options.draggable}
                );
                // enable/disable draggable
                if(options.draggable) {
                    if(!self.draggableInit) {
                        idSelector.draggable({ containment: "parent" });
                        self.draggableInit = true;
                    } else {
                        idSelector.draggable('enable');
                    }
                } else if(self.draggableInit) {
                    idSelector.draggable('disable').removeAttr('style');
                }
                // event listeners first
                for(var i = 0; i < self._listeners["complete"].length; ++i) {
                    self._listeners["complete"][i](modalContent);
                }
                if(options.onComplete) options.onComplete(modalContent);
                
                // clear references
                onSuccess = null;
                onError = null;
                onComplete = null;
            };
        
        if(!(type in this.htmlDict)) {
            // create type from url in options
            if(options.url) {
                this.htmlDict[type] = [null, options.url];
            } else {
                // bad request
                onError("Content does not exist");
                onComplete();
                return;
            }
        }
        // html already cached
        if(this.htmlDict[type][0]) {
            onSuccess(this.htmlDict[type][0]);
            onComplete();
            return;
        }
        
        // request html asynchronously
        var self = this;
        $.ajax({
            url: this.htmlDict[type][1], 
            success: function(html) {
                self.htmlDict[type][0] = html;
                onSuccess(html);
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                onError(errorThrown);
            }, 
            complete: function() {
                if(onComplete) onComplete();  // Require minimizes this wierdly even though nullchekc shouldn't be necessary
            }
        });
    };
    
    
    Modals.prototype.close = function() {
        common.setModal(false);
    };
    
    
    Modals.prototype._addModularSections = function(modalContent) {
        modalContent = $(modalContent);
    };
    
    //********************************************************************************************************
    // Return as singular instance (which should be cached on first loading)
    //********************************************************************************************************
    return new Modals();
    
});