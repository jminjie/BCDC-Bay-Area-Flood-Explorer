<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="footer">
  <div id="footer-top-row" class="footer-row">
    <div id="footer-flex">
      <div class="panel-left">
        <a href="<?= $ini["urls"]["art"]; ?>" target="_blank" rel="noopener"  class="footer-logo" bind-logo="art">
          <img src="images/ART_logo_v5_56.png" alt="Adapting to Rising Rides" />
        </a>
        <a href="<?= $ini["urls"]["bcdc"]; ?>" target="_blank" rel="noopener"  class="footer-logo" bind-logo="bcdc">
          <img src="images/bcdc-logo-small50.jpg" alt="SF Bay Conservation and Development Commission" />
        </a>
        <a href="<?= $ini["urls"]["sfei"]; ?>" target="_blank" rel="noopener"  class="footer-logo" bind-logo="sfei">
          <img src="images/sfei-logo-white.png" alt="San Francisco Estuary Institute" style="height:30px;" />
        </a>
        <br />
        <a class="site-link" href="/about/a-disclaimer" goto="about#a-disclaimer" style="color:#a5c6ea;">Disclaimer</a> &nbsp;|&nbsp;
        <a class="site-link" href="/about/a-accessibility" goto="about#a-accessibility" style="color:#a5c6ea;">Accessibility</a>
      </div>
      <div class="panel-right footer-logo-text">
        The ART Bay Shoreline Flood Explorer was developed by the
        <a href="<?= $ini["urls"]["bcdc"]; ?>" target="_blank" rel="noopener"  bind-logo="bcdc">Bay Conservation and Development Commission (BCDC)</a>
        <a href="<?= $ini["urls"]["art"]; ?>" target="_blank" rel="noopener"  bind-logo="art">Adapting to Rising Tides (ART) Program</a>
        with technical development by the 
        <a href="<?= $ini["urls"]["sfei"]; ?>" target="_blank" rel="noopener" bind-logo="sfei">San Francisco Estuary Institute (SFEI)</a>.
      </div>
    </div>
  </div>
  <div id="footer-bottom-row" class="footer-row"></div>
</div>