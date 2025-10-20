<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="slr-side-panel">
  <div id="slr-panel-top" class="side-panel">
    <p class="side-panel-title">ONE MAP, MANY FUTURES<i id="help-icon-many-futures" class="cm-icon">?</i></p>
    <ul class="side-panel-tab-ctrl"></ul>
    <div class="side-panel-content content-a"></div>
    <div class="side-panel-content content-b"></div>
  </div>
  <div id="slr-panel-drag">&#8226;&#8226;&#8226;</div>
  <div id="slr-panel-bottom" class="side-panel">
    <p class="side-panel-title">CHOOSE IMPACT TO DISPLAY</p>
    <ul class="side-panel-tab-ctrl"></ul>
    <div class="side-panel-content">
        <div id="slr-panel-attributions" style="display:none;">
          <div class="slr-org-attributions">
              <a href="<?= $ini["urls"]["bcdc"]; ?>" target="_blank" rel="noopener" >
                <img src="images/bcdc-logo-small50.jpg" height="45" alt="BCDC" />
              </a>
          </div>
          <div class="slr-org-attributions">
              <a href="<?= $ini["urls"]["sfei"]; ?>" target="_blank" rel="noopener" >
                Developed by: <br />
                <img src="images/sfei-logo-grey.png" height="30" alt="SFEI" />
              </a>
          </div>
          <div id="slr-map-attributions"></div>
        </div>
    </div>
  </div>
</div>