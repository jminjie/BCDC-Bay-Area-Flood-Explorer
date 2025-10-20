//************************************************************************************************************
// Overlays (module)
//   -Modules under the MapHandler Module.
//   -Handles overlays
//   -Custom cyano layer overlay handlers
//************************************************************************************************************

define(["OpenLayers", "overlays"], function(ol, overlays) {
    
    function Overlays(parentMapHandler, mapServerUrls) {
        this.mapHandler    = parentMapHandler;
        this.mapServerUrls = mapServerUrls;
        // create layers
        this.overlays = overlays;
        // add layers
        this.overlayLayersArray = [];
        for(var layername in this.overlays) {
            this.overlayLayersArray.push(this.overlays[layername].layer);
            this.overlays[layername].layer.setVisible(false);
            this.mapHandler.olMap.addLayer(this.overlays[layername].layer);
        }
    };
    
    Overlays.prototype.addControl = function(container) {
        container = $(container);
        var controlContainer = $("<div>", {'id': 'slr-overlay-control', 'class': 'popup-menu-container'})
            .appendTo(container);
        var controlButton = $("<div>", {'id': 'slr-overlay-control-btn', 'class': 'btn popup-menu-button', 'text': 'Overlays'})
            .appendTo(controlContainer);
        var selectBox = $("<div>", {'id': 'slr-overlay-select-box', 'class': 'popup-menu'})
            .hide()
            .appendTo(controlContainer);
        var form = $("<form>", {'id': 'slr-overlay-control'}).appendTo(selectBox);
        form.append(
            $("<input>", {
                'type':  'radio', 
                'name':  'slr-overlay-select', 
                'value': 'none'
            }).prop('checked', true)
        );
        form.append(" None<br />");
        for(var layername in this.overlays) {
            form.append(
                $("<input>", {
                    'type': 'radio', 
                    'name': 'slr-overlay-select', 
                    'value': layername
                })
            );
            form.append(" " + this.overlays[layername].name + "<br />");
        }
        
        var self = this;
        // button toggles
        controlButton.on('click', function() {
            selectBox.toggle();
        });
        // on clicking outside if open
        $('body').click(function(evt) {
            if(selectBox.is(":visible")) {
                if(evt.target.id === "slr-overlay-control") {
                    return;
                }
                if($(evt.target).closest('#slr-overlay-control').length) {
                    return;
                }
                selectBox.hide();
            }
        });
        // form change listeners
        form.on('change', function() {
            var layerchoice = form.find("input:checked").val();
            for(var layername in self.overlays) {
                self.overlays[layername].layer.setVisible(layerchoice === layername);
            }
            selectBox.hide();
        });
    };
    
    Overlays.prototype.turnOn = function(layername) {
        if(layername in this.overlays) {
            this.overlays[layername].layer.setVisible(true);
        }
    };
    
    Overlays.prototype.turnOff = function(layername) {
        if(layername in this.layers) {
            this.overlays[layername].layer.setVisible(false);
        }
    };
    
    return Overlays;
    
});
