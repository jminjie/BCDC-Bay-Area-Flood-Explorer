define({
    'home':     {
                    name: "Splash", 
                    key:  "home", 
                    html: "pages/home.html"
                }, 
    'about':    {
                    name: "About", 
                    key:  "about", 
                    html: "pages/about.php", 
                    showFooter: true, 
                    showSidebar: true, 
                    buildNav: "headers"
                }, 
    'faq':      {
                    name: "FAQ", 
                    key:  "faq", 
                    html: "pages/faq.php", 
                    showFooter: true, 
                    showBackBar: true,
                    showSidebar: true, 
                    buildNav: "list"
                }, 
    'glossary': {
                    name: "Glossary", 
                    key:  "glossary", 
                    html: "pages/glossary.php", 
                    showFooter: true, 
                    showBackBar: true, 
                    showSidebar: true, 
                    buildNav: "list"
                }, 
    'learn':    {
                    name: "Learn", 
                    key:  "learn", 
                    html: "pages/storymap.html", 
                    lang: {
                        en:  "https://arcg.is/1b4j903",
                        es:  "https://arcg.is/1GPr8a2", 
                        zh:  "https://arcg.is/145HGP2", 
                        vi:  "https://arcg.is/5aTb00", 
                        fil: "https://arcg.is/0LvirH1"
                        // en: "https://bcdc.maps.arcgis.com/apps/Cascade/index.html?appid=4285c41f96e542a4afc422baed6bebf4",
                        // es: "https://bcdc.maps.arcgis.com/apps/Cascade/index.html?appid=cf7ad062f3d84bd0a913dce7dee143ba", 
                        // zh: "https://bcdc.maps.arcgis.com/apps/Cascade/index.html?appid=887851b612824e6ab32514a59044f40e", 
                        // vi: "https://bcdc.maps.arcgis.com/apps/Cascade/index.html?appid=6586ef88ed69458887e6d6cb3214eaf2", 
                        // fil: "https://bcdc.maps.arcgis.com/apps/Cascade/index.html?appid=b94331d9cfff4239a637fec4551c6714"
                    }
                }, 
    'explorer': {
                    name: "Explorer", 
                    key:  "explorer", 
                    html: "pages/explorer.php"
                }, 
    'download': {
                    name: "Download", 
                    key:  "download", 
                    html: "pages/data.php", 
                    showFooter: true, 
                    showSidebar: true, 
                    buildNav: "headers"
                }, 
    '404':      {
                    name: "Not Found", 
                    key:  "404", 
                    html: "pages/404.html", 
                    showFooter: true
                }
});