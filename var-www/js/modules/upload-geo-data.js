define([
    "common", 
    "jquery"
], function(
    common, 
    jQuery
) {
    
    function UploadGeoData(form, outMessage, onSuccess) {
        var self = this;
        this.form        = $(form);
        this.outMessage  = $(outMessage);
        this.onSuccess   = onSuccess;
        this.onError     = function(msg) {
            self.outMessage.html("<span class='error'>" + msg + "</span>");
            self._enable();
        };
        this.maxFileSize = 0;
        
        this.form.find("input[type=submit]").on("click", this.upload.bind(this));
        var inputMaxFs = this.form.find("input[name=max-file-size]");
        if(inputMaxFs.length) this.maxFileSize = inputMaxFs.val();
    };
    
    UploadGeoData.prototype._disable = function() {
        this.form.find("input").prop('disabled', true);
    };

    UploadGeoData.prototype._enable = function() {
        this.form.find("input").prop('disabled', false);
    };
    
    UploadGeoData.prototype.upload = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        
        var fdata = new FormData(this.form[0]);
        this._disable();
        this.outMessage.html("Uploading File...");
        
        if(!this.form.find("input[type=file]")[0].files.length) {
            this.onError("No file selected.");
            return;
        }
        if(this.maxFileSize > 0 && this.form.find("input[type=file]")[0].files[0].size > this.maxFileSize) {
            this.onError("File exceeds maximum file size (" + (this.maxFileSize/1024).addCommas(0) + "KB)");
            return;
        }
        
        var self = this;
        $.ajax({
            url: "upload.php", 
            type: 'POST', 
            data: fdata, 
            dataType: "json", 
            success: function(res) {
                self._processFile(res);
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                self.onError("There was an error sending the file.");
                console.error(jqXHR);
            }, 
            cache: false,
            contentType: false,
            processData: false
        });
        return false;
    };
    
    UploadGeoData.prototype._processFile = function(res) {
        if(!res || res.error) {
            console.debug(res);
            this.onError(res && res.error ? res.error : "There was an error uploading the file.");
            return;
        }
        this.outMessage.html("Processing File...");
        var self = this;
        $.ajax({
            url: "upload.php", 
            data: res, 
            dataType: "json", 
            success: function(data) {
                if(!data || data.error) {
                    self.onError(data && data.error ? data.error : "There was an error processing the file.");
                    return;
                } else {
                    self.onSuccess(data);
                }
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                self.onError("There was an error processsing the file.");
                console.error(jqXHR);
            }, 
            complete: function() {
                self.form[0].reset();
                self.outMessage.html("");
                self._enable();
            }
        });
    };
    
    return UploadGeoData;
    
});