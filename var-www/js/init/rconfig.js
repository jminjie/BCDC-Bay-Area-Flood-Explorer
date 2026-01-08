require.config({
    baseUrl: "js", 
    paths: {
        // plugins for require js
        domReady:        "lib/require.domReady", 
        text:            "lib/require.text", 
        // jquery and plugins for
        jquery:          "//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min", 
        // library shortcuts (some have debug options, just set true to use debuggable source)
        common:          !false ? "lib/common/dist/common.min" : "lib/common/src/common", 
        "common.table":  !false ? "lib/common/dist/common.table.min" : "lib/common/src/common.table", 
        d3:              !false ? "lib/d3-4.10.2.min" : "lib/d3-4.10.2-debug", 
        dateFormat:      "lib/date.format", 
        OpenLayers:      !false ? "lib/ol-4.3.4" : "lib/ol-4.3.4-debug", 
        SimpleGraph:     !false ? "lib/d3-simplegraph/d3.simplegraph.min" : "lib/d3-simplegraph/src/simple-graph", 
        // redirects
        pageHtml:        "../pages", 
        partials:        "../partials"
    }, 
    shim: {
        // shim for non-AMD compatible libraries
        dateFormat: { exports: "dateFormat" }
    }
});