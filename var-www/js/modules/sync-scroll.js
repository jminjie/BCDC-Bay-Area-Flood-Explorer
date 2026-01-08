define(["jquery"], function(jQuery) {
    
    function SyncScroll(options) {
        this.$view        = $(options.view);
        this.$scroll      = $(options.scroll);
        this.$sync        = $(options.sync).css('position', 'absolute');
        this.$listen      = $(options.listen);
        this._height      = 0;
        this._scroll      = 0;
        this._offset      = 0;
        this._listener    = this._listen.bind(this);
        this.bottomOffset = 150;
        
        this.$listen.on('scroll', this._listener);
        this.reset();
    };
    
    SyncScroll.prototype.destroy = function() {
        this.$listen.off('scroll', this._listener);
        this.$view   = null;
        this.$sync   = null;
        this.$scroll = null;
        this.$listen = null;
    };
    
    SyncScroll.prototype.reset = function(newOptions) {
        if(newOptions) {
            if(newOptions.listen) {
                this.$listen.off('scroll', this._listener);
                this.$listen = $(newOptions.listen);
            }
            if(newOptions.view)   this.$view   = $(newOptions.view);
            if(newOptions.scroll) this.$scroll = $(newOptions.scroll);
            if(newOptions.sync)   this.$sync   = $(newOptions.sync);
        }
        
        this._scroll = 0;
        this._offset = 0;
        this.$sync.css('top', 0);
        
        this._height = this.$sync.outerHeight();
        this._maxOffset = this._vheight - this._height;
    };
    
    SyncScroll.prototype._listen = function() {
        var newScrollTop = this.$scroll.offset().top, 
            distance = newScrollTop - this._scroll;
        this._scroll = newScrollTop;
        
        var vheight = this.$view.outerHeight();
        if(vheight > this._height + this.bottomOffset) {
            this._offset = 0;
        } else {
            this._offset += distance*0.35;
            if(this._offset > 0) {
                this._offset = 0;
            } else {
                var maxOffset = -(this._height - vheight + this.bottomOffset);
                if(this._offset < maxOffset) {
                    this._offset = maxOffset;
                }
            }
        }
        
        this.$sync.css('top', this._offset);
    };
    
    return SyncScroll;
    
});