<?php /* dont need to call local_config here as splash is always loaded in context of index page */ ?>
<div id="splash-container">
  <div id="splash-background"></div>
  <div id="splash-wrapper">
    <div id="splash-content">
      <div id="splash-title-container">
        <img id="splash-logo" src="images/ART_logo_v5_175.png" alt="Adapting to Rising Tides" />
        <span id="splash-subtitle">Adapting to Rising Tides</span>
        <span id="splash-title">Bay Shoreline <br />Flood Explorer</span>
      </div>
      <div id="splash-text">
        The Adapting to Rising Tides program has developed this website to help Bay Area communities prepare for the impacts of current and future flooding due to <span style="color:#c7ef68;font-weight:bold;">sea level rise and storm surges</span> by learning about causes of flooding, exploring maps of flood risk along our shoreline, and downloading the data for further analysis. These maps increase understanding of what could be at risk without future planning and adaptation, helping Bay communities, governments, and businesses to drive action.
      </div>
      <div id="splash-menu">
        <div class="menu-item-wrapper">
          <div class="menu-item" href="/learn" goto="learn">Learn</div>
          <div class="menu-item-subtitle" style="display:none;">Learn about flooding and sea level rise</div>
        </div>
        <div class="menu-item-wrapper">
          <div class="menu-item" href="/explorer" goto="explorer">Explore</div>
          <div class="menu-item-subtitle" style="display:none;">Explore the map</div>
        </div>
        <div class="menu-item-wrapper">
          <div class="menu-item" href="/download" goto="download">Download</div>
          <div class="menu-item-subtitle" style="display:none;">Download the data</div>
        </div>
        <div class="menu-item-wrapper">
          <div class="menu-item" href="/about" goto="about">About</div>
          <div class="menu-item-subtitle" style="display:none;">About ART Bay Shoreline Flood Explorer</div>
        </div>
      </div>
      <div id="splash-bottom-content">
        <a href="<?= $ini["urls"]["bcdc"]; ?>" target="_blank" rel="noopener" >
          <img class="splash-bottom-logo" src="images/bcdc-logo-small75.jpg" alt="Bay Conservation and Development Commission" />
        </a>
        The ART Bay Shoreline Flood Explorer is part of the San Francisco Bay Conservation and Development Commission's Adapting to Rising Tides Program. 
        <div style="height:0.6em;"></div>
        <a href="/about/a-disclaimer" goto="about#a-disclaimer">Disclaimer</a> | 
        <a href="/about/a-accessibility" goto="about#a-accessibility">Accessibility</a> | 
        <a href="<?= $ini["urls"]["eccexplorer"]; ?>" target="_blank">East Contra Costa Shoreline Flood Explorer</a>
      </div>
    </div>
  </div>
</div>