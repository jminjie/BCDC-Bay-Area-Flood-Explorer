<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="page-title">ART Bay Shoreline Flood Explorer</div>
<div id="slr-container" class="flex">
  <div id="slr-map-panel" style="position:absolute;flex:1;"></div>
  <div id="slr-slider-panel"></div>
  <?php require("../partials/slr-side-panel.php"); ?>
  <div id="slr-menu"></div>
  <div id="slr-mode-toggle-wrapper">
    <div id="slr-mode-toggle" class="cm-tooltip-top tooltip-line-breaks" cm-tooltip-msg="Click to swap between viewing&#xa;flooding and consequence impacts.">
      <div id="slr-mode-toggle-switch"></div>
      <div id="slr-mode-toggle-label">Viewing Flooding</div>
    </div>
  </div>
  <div id="slr-menu-responsive-wrapper">
    <div id="slr-menu-responsive"></div>
  </div>
  <div id="slr-art-logo" class="mobile-view-hide">
    <a href="<?= $ini["urls"]["art"]; ?>" target="_blank" rel="noopener" >
      <img src="images/ART_logo_v5_78.png" alt="Adapting to Rising Tides" />
    </a>
  </div>
  <div id="slr-screen-warning">
    <div>
      <embed src="images/screen_rotation.svg" id="slr-screen-rotate-image" />
      <h2 style="color:#fff;">Incompatible screen size.</h3>
      Screen width and height are incompatible for using the SLR viewer. If on a mobile device or tablet, try rotating to portrait mode. Or try expanding the browser window.
    </div>
  </div>
  <script>
    require(['common'], function(common) {
      common.setModalAsLoading(true, "");
      if(window.browserType.isIE && window.browserType.ieVersion <= 9) {
        alert("This application is not compatible with Internet Explorer version 9 or below.");
      }
      <?php if($ini["dev_mode"] && !$ini["dev_force_build"]) { ?> 
      require(["init/slr"], function(init) { init(); });
      <?php } else { ?>
      require(["../build/slr"], function() { require(["init/slr"], function(init) { init(); }); });
      <?php } ?>
    });
    </script>
</div>