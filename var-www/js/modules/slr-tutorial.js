define(["jquery"], function(JQuery) {
    
    function SLRTutorial(container) {
        this.container = container;
        this.viewContainer = this.container.find("#slr-tutorial-view");
        this.textContainer = this.container.find("#slr-tutorial-text");
        this.prevButton    = this.container.find("#slr-tutorial-prev");
        this.nextButton    = this.container.find("#slr-tutorial-next");
        
        this.prevButton.addClass("disabled");
        this.nextButton.addClass("disabled");
        
        this.tutorialText = null;
        this.__length = 0;
        this.__position = 0;
        
        var self = this;
        $.ajax({
            url: "partials/text/slr-tutorial.html", 
            error: function() {
                self.textContainer.html("There was an error loading the tutorial..");
                self.viewContainer.html("");
            }, 
            success: function(tutorialHtml) {
                self.tutorialText = $(tutorialHtml).filter(".tutorial-text");
                self._init();
            }
        });
    }
    
    SLRTutorial.prototype._init = function() {
        this.__length = this.tutorialText.length;
        this.textContainer.html(this.tutorialText[0]);
        
        this.prevButton.on("click", this.prev.bind(this));
        this.nextButton.on("click", this.next.bind(this));
        
        this.nextButton.removeClass("disabled");
    };
    
    SLRTutorial.prototype._swap = function() {
        this.textContainer.html(this.tutorialText[this.__position]);
        var imgSrc = this.tutorialText[this.__position].getAttribute("tutorial-image"), 
            bgImgSrc = this.tutorialText[this.__position].getAttribute("tutorial-bg-image");
        var bgCss = (
            (imgSrc ? "url(" + imgSrc + ")," : "")
            + (bgImgSrc ? "url(" + bgImgSrc + ")," : "")
            + "url(images/tutorial/bg-1.jpg)"
        );
        this.viewContainer.css("background-image", bgCss);
    };
    
    SLRTutorial.prototype.next = function() {
        if(this.__position === 0) {
            this.prevButton.removeClass("disabled");
        }
        if(++this.__position >= this.__length-1) {
            this.nextButton.addClass("disabled");
        }
        this._swap();
    };
    
    SLRTutorial.prototype.prev = function() {
        if(this.__position === this.__length-1) {
            this.nextButton.removeClass("disabled");
        }
        if(--this.__position <= 0) {
            this.prevButton.addClass("disabled");
            if(this.__position < 0) this.__position = 0;
        }
        this._swap();
    };
    
    return SLRTutorial;
    
});