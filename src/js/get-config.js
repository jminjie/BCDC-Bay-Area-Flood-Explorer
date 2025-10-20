// return global config object that should be defined first in init
define([], function() { 
    return function() {
        if(!window.config) {
            $.ajax({
                async: false, 
                data: { q: "getConfig" }, 
                dataType: "json",
                url: "query.php", 
                error: function(jqXHR, textStatus, errorThrown) {
                    alert(window.defaultErrorMessage);
                    console.log(textStatus + ": " + errorThrown);
                }, 
                success: function(config) {
                    window.config = config;
                }
            });
        }
        return window.config;
    };
});
