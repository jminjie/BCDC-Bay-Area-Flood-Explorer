<?php
require_once("local_config.php");
if(isset($_POST["s"])) {
    $settings = json_decode(base64_decode($_POST["s"]));
} else {
    $settings = new stdClass();
}
if(isset($_POST["u"]) && !empty($_POST["u"])) {
    $settings->uda = base64_decode($_POST["u"]);
}

?>
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <title>ART Bay Shoreline Flood Explorer Print Map</title>
    <meta name="description" content="The Adapting to Rising Tides program has developed this tool to help Bay Area communities learn about current flooding and future flooding due to sea level rise by exploring local flood maps, identifying areas of greatest risk, and downloading the data for further analysis." />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  <body style="padding:0.15in 0;overflow:scroll;">
    <div id="print-button" class="btn2">Print the Map <i></i></div>
    <div class="print-page-landscape">
      <div id="slr-print-container">
        <div id="slr-print-map">
          <div id="slr-map-watermarks">
            <img src="images/bcdc-logo-small50.jpg" />
            <img src="images/ART_logo_v5_56.png" />
          </div>
        </div>
        <div id="slr-print-sidebar">
          <div id="slr-print-info"></div>
          <table id="slr-print-table" class="cm-table">
            <tr>
              <th>Sea Level Rise<div style="position:absolute;top:15%;right:-0.25em;z-index:9;">+</div></th>
              <th>Storm Surge</th>
            </tr>
          </table>
          <div id="slr-print-legend"></div>
          <div id="slr-print-info2"></div>
          <div id="slr-map-attributions"></div>
        </div>
      </div>
    </div>
    <?php if($ini["dev_mode"] && !$ini["dev_force_build"]) { ?> 
    <script src="js/lib/require.js"></script>
    <script src="js/init/rconfig.js"></script>
    <script>require(["init/print"], function(init) { init(<?= json_encode($settings) ?>); });</script>
    <?php } else { ?>
    <script src="build/require.js"></script>
    <script>require(["build/libs","build/slr","build/print"],function() {require(["init/print"],function(c){c(<?= json_encode($settings) ?>);});});</script>
    <?php } ?> 
  </body>
</html>
