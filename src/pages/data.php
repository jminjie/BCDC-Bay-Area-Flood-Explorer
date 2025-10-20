<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="page-title">ART Bay Shoreline Flood Explorer: Download</div>
<article id="inner-stage">

  <h1 nav-title="ART County Sea Level Rise Maps">ART Bay Area Sea Level Rise and Shoreline Analysis Maps</h1>
  <p class="align-justify">
    The ART Bay Area Sea Level Rise and Shoreline Analysis maps are robust and accurate mapping products that leverage the latest LiDAR topographic data sets, the 
    <a href="<?= $ini["urls"]["tides"] ?>" target="_blank" rel="noopener" >FEMA San Francisco Bay Area Coastal Study and San Francisco Tidal Datums Study</a>, and the 
    <a href="//www.sfei.org/content/flood-infrastructure-mapping-and-communication-project" target="_blank" rel="noopener" >regional shoreline delineation developed by the San Francisco Estuary Institute</a>.
    The county maps are available to download as .pdf or a geodatabase (.gdb) for all ten water levels including: 
  </p>
  <ul>
    <li>Depth of Flooding (polygon and raster)</li>
    <li>Shoreline Overtopping Depth</li>
    <li>Disconnected Low-Lying Areas</li>
  </ul>
  <p>
    You can read more about the 
    <a href="<?= $ini["urls"]["report"]; ?>" target="_blank" rel="noopener" >mapping methodology</a>
    and
    <a href="<?= $ini["urls"]["gis"]; ?>" target="_blank" rel="noopener" >GIS data catalog</a>.
  </p>
  
  <div id="download-table" class="flex-table" style="width:85%;margin:auto;font-size:0.9em;">
    <div class="row header" style="background:#477ebc;color:#fff;">
      <div class="cell dl-first-col">County</div>
      <div class="cell">Mapbook<br />(PDF)</div>
      <div class="cell">Geodatabase<br />(Download)</div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Alameda</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Alameda PDF" class="downloadable" dl-key="Alameda_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Alameda Geodatabase" class="downloadable" dl-key="Alameda_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Contra Costa</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Contra Costa PDF" class="downloadable" dl-key="ContraCosta_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Contra Costa Geodatabase" class="downloadable" dl-key="ContraCosta_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Marin</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Marin PDF" class="downloadable" dl-key="Marin_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Marin Geodatabase" class="downloadable" dl-key="Marin_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Napa</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Napa PDF" class="downloadable" dl-key="Napa_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Napa Geodatabase" class="downloadable" dl-key="Napa_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">San Francisco</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download San Francisco PDF" class="downloadable" dl-key="SanFrancisco_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download San Francisco Geodatabase" class="downloadable" dl-key="SanFrancisco_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">San Mateo</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download San Mateo PDF" class="downloadable" dl-key="SanMateo_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download San Mateo Geodatabase" class="downloadable" dl-key="SanMateo_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Santa Clara</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Santa Clara PDF" class="downloadable" dl-key="SantaClara_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Santa Clara Geodatabase" class="downloadable" dl-key="SantaClara_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Solano</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Solano PDF" class="downloadable" dl-key="Solano_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Solano Geodatabase" class="downloadable" dl-key="Solano_gdb" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Sonoma</div>
      <div class="cell">
        <img src="images/pdf-icon.svg.png" width="25" alt="Download Sonoma PDF" class="downloadable" dl-key="Sonoma_pdf" />
      </div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Sonoma Geodatabase" class="downloadable" dl-key="Sonoma_gdb" />
      </div>
    </div>
  </div>
  
  <h1  nav-title="ART Bay Area Consequence Maps">ART Bay Area Consequence Analysis and Maps</h1>
  <p class="align-justify">
    ART Bay Area conducted an analysis based on factors that pointed to “regional significance” - impacts that would create cascading consequences that would reverberate throughout the region. These factors - called Consequence Indicators - vary across each regional system but provide a measure of impact not captured by flood exposure alone. 'Regional systems' refers to the isolated components within Ecosystem Services, Transportation, Housing & Jobs, and Vulnerable Communities used to better evaluate and understand SLR scenarios. Thirty-two indicators across the four systems give a measure of expected impacts, or consequences, to people, the economy, and the environment as rising seas lead to shoreline flooding.
  </p>
  <p class="align-justify">
    The ART Bay Shoreline Flood Explorer visualizes only a few of the total indicators analyzed in ART Bay Area and those are available to download as a geodatabase for each of the regional systems (Ecosystem Services, Transportation, Housing & Jobs, and Vulnerable Communities).
  </p>
  <p><a href="<?= $ini["urls"]["artProject"]; ?>" target="_blank"  rel="noopener">Read the full ART Bay Area report to learn more</a>.</p>
  <p>Each zipped folder includes:</p>
  <ul>
    <li>Geodatabase with the regional impacts for all ten water levels</li>
    <li>ART Bay Area Methodology Appendix</li>
    <li>Layer Symbologies</li>
  </ul>
  <p>
    You can read more about the 
    <a href="<?= $ini["urls"]["artMethods"]; ?>" target="_blank" rel="noopener">mapping methodology</a>.
  </p>
  
  <div id="download-table" class="flex-table" style="width:85%;margin:auto;font-size:0.9em;">
    <div class="row header" style="background:#477ebc;color:#fff;">
      <div class="cell dl-first-col">Regional Consequence</div>
      <div class="cell">Geodatabase<br />(Download)</div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Ecosystem Services</div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Ecosystem Services Dataset" class="downloadable disclaimer-consequence" dl-key="EcosystemServices" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Housing/Jobs</div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Housing/Jobs Dataset" class="downloadable disclaimer-consequence" dl-key="HousingJobs" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Transportation</div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Transportation Dataset" class="downloadable disclaimer-consequence" dl-key="Transportation" />
      </div>
    </div>
    <div class="row">
      <div class="cell dl-first-col">Vulnerable Communities</div>
      <div class="cell">
        <img src="images/geodatabase-icon.png" width="25" alt="Download Vulnerable Communities Dataset" class="downloadable disclaimer-consequence" dl-key="VulnerableCommunities" />
      </div>
    </div>
  </div>
  
  <form id="download-form" style="display:none;" method="post" action="download.php">
    <input type="hidden" name="r" value="fetch" />
  </form>
  <span class="spacer"></span>
</article>