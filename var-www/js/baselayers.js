
define(["OpenLayers"], function(ol) {
    
    function esriAttribution(citation) {
        if(!citation) {
            citation = "";
        } else {
            var citationLower = citation.toLowerCase();
            if(citationLower.startsWith("esri, ")) {
                citation = citation.slice(5);
            } else if(citationLower.startsWith("esri ")) {
                citation = citation.slice(4);
            }
            if(citation.trim()) {
                citation = ", " + citation;
            }
        }
        return (
            "<p>Icons by <a rel='nofollow' href='https://icons8.com' target='_blank' rel='noopener'>Icons8</a>. " 
            + "Map tiles by <a rel='nofollow' href='https://esri.com' target='_blank' rel='noopener'>ESRI</a>"
            + citation + ".</p>"
        );
    }
    
    return [
        {
            name: "Aerial/Satellite Imagery", 
            layers: {
                base: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", 
                        attributions: [new ol.Attribution({
                            html: esriAttribution("Esri, Maxar, Earthstar Geographics, and the GIS User Community")
                        })]
                    })
                }),
                reference: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/arcgis/rest/services/canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    })
                })
            }
        }, 
        {
            name: "Streets and Topographic", 
            layers: {
                base: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", 
                        attributions: [new ol.Attribution({
                            html: esriAttribution("Esri")
                        })]
                    })
                }),
                reference: null
            }
        }, 
        {
            name: "Light Grey", 
            layers: {
                base: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/arcgis/rest/services/canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", 
                        attributions: [new ol.Attribution({
                            html: esriAttribution("Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS user community")
                        })]
                    })
                }), 
                reference: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/arcgis/rest/services/canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    })
                })
            }
        }, 
        {
            name: "Dark Grey", 
            layers: {
                base: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/arcgis/rest/services/canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", 
                        attributions: [new ol.Attribution({
                            html: esriAttribution("Esri, HERE, Garmin, © OpenStreetMap contributors, and the GIS user community")
                        })]
                    })
                }), 
                reference: new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: "https://server.arcgisonline.com/arcgis/rest/services/canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    })
                })
            }
        }
    ];
});
