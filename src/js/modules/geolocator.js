define(["OpenLayers"], function(ol) {

    function Geolocator(googleApiKey) {
        this.googleApiKey = googleApiKey;
    };
    
    Geolocator.prototype.locate = function(address, onComplete, onError, filterFunction, errorOnFailure) {
        var self = this, 
            errored = false, 
            response = false;
        $.ajax({
            url: (
                "https://maps.googleapis.com/maps/api/geocode/json?" 
                + "key=" + this.googleApiKey 
                + "&address=" + encodeURIComponent(address)
            ), 
            dataType: "json", 
            success: function(res) {
                if(!res.status === "OK" || !res.results || !res.results.length) {
                    console.debug(res);
                    onError(res, "Could not geolocate address", res);
                } else {
                    for(var i = 0; i < res.results.length; ++i) {
                        var result = res.results[i];
                        // a few things specially formatted for openlayers
                        var btmLeft = ol.proj.fromLonLat([
                            result.geometry.viewport.southwest.lng, 
                            result.geometry.viewport.southwest.lat
                        ]);
                        var topRight = ol.proj.fromLonLat([
                            result.geometry.viewport.northeast.lng, 
                            result.geometry.viewport.northeast.lat
                        ]);
                        result["location"] = ol.proj.fromLonLat([
                            result.geometry.location.lng, 
                            result.geometry.location.lat
                        ]);
                        result["extent"] = btmLeft.concat(topRight);
                        // filter
                        if(!filterFunction || filterFunction(result)) {
                            response = result;
                            break;
                        }
                    }
                }
            }, 
            error: function(jqXHR, textStatus, errorThrown) {
                errored = true;
                console.debug(errorThrown);
                if(onError) onError(jqXHR, textStatus, errorThrown);
            }, 
            complete: function() {
                if(!response && !errored && !errorOnFailure) {
                    // try again, slightly modify query
                    address += " in California";
                    self.locate(address, onComplete, onError, filterFunction, true);
                } else {
                    onComplete(response);
                }
            }
        });
    };
    
    return Geolocator;
    
});