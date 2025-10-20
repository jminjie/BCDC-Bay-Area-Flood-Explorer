<?php require_once("local_config.php"); ?>
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <base href="/" />
    <meta charset="UTF-8" />
    <title>ART Bay Shoreline Flood Explorer</title>
    <meta name="description" content="The Adapting to Rising Tides program has developed this website to help Bay Area communities prepare for the impacts of current and future flooding due to sea level rise and storm surges by learning about causes of flooding, exploring maps of flood risk along our shoreline, and downloading the data for further analysis. These maps increase understanding of what could be at risk without future planning and adaptation, helping Bay communities, governments, and businesses to drive action." />
    <meta name="viewport" content="width=640" />
    <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet" />
<?php if($ini["dev_mode"] && !$ini["dev_force_build"]) { ?>
    <link rel="stylesheet" href="css/style.css" />
<?php } else { ?>
    <link rel="stylesheet" href="build/style.css" />
<?php } ?>
    <meta name="theme-color" content="#004785" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  </head>
  <body>
    <div id="loading-block">
      <article id="loading-content">Loading<span class="animate-loading" style="width:20px;">...</span></article>
    </div>
    <div id="container">
<?php require("pages/splash.php"); ?> 
      <header id="header" class="panel">
        <div id="header-inner-container">
          <div id="nav-title">Bay</div>
          <div id="header-inner">
            <nav id="nav">
              <ul id="menu">
                <li class="menu-item" goto="learn"><a href="/learn">Learn</a></li>
                <li class="menu-item" goto="explorer"><a href="/explorer">Explore</a></li>
                <li class="menu-item" goto="download"><a href="/download">Download</a></li>
                <li class="menu-item" goto="about"><a href="/about">About</a></li>
                <li id="menu-item-splash" class="menu-item no-active" href="/home" goto="home"><img src="images/pull-down.png" alt="Return to Splash" /></li>
              </ul>
            </nav>
          </div>
        </div>
        <div id="slr-header-menu" class="mobile-view-hide"></div>
        <div id="header-back-bar" style="display:none;"><a onclick="window.history.back()" style="cursor:pointer;">Return to <span class="lastpage">Last Page</a></a></div>
      </header>
      <div id="stage" class="flex panel">
<?php require("pages/loading.html"); ?> 
      </div>
      <div id="sidebar">
<?php require("partials/sidebar.html"); ?> 
      </div>
      <div id="menu-translate" class="cm-tooltip-left" cm-tooltip-msg="Translate storymap">
        <i class="slr-menu-item"></i>
      </div>
    </div>
    <script type="text/javascript">
      window._siteInit = {<?php if($ini["dev_debug_msgs"]) { ?>'debugMode':true,<?php } ?>'page':"<?= isset($_GET["p"]) && !empty($_GET["p"]) ? filter_input(INPUT_GET, "p", FILTER_SANITIZE_STRING) : "home"; ?>",'anchor':<?= isset($_GET["a"]) && !empty($_GET["a"]) ? "\"".filter_input(INPUT_GET, "a", FILTER_SANITIZE_STRING)."\"" : "null"; ?>};
    </script>
<?php if($ini["dev_mode"] && !$ini["dev_force_build"]) { ?>
    <script src="js/lib/require.js"></script>
    <script src="js/init/rconfig.js"></script>
    <script>require(["init/site"], function(init) { init(); });</script>
<?php } else { ?>
<?php if(!empty($ini["g_analytics_id"])) { ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= $ini["g_analytics_id"]; ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', "<?= $ini["g_analytics_id"]; ?>");
    </script>
<?php } ?>
    <script src="build/require.js"></script>
    <script>require(["build/libs","build/site"],function(){require(["init/site"],function(init){init();});});</script>
<?php } ?>
  </body>
</html>
