<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="page-title">About the ART Bay Shoreline Flood Explorer</div>
<article id="inner-stage">
  
  <h1>Planning Support</h1>
  
  <p>The Flood Explorer and associated flood maps are intended to be used as a planning guide to understand where our shoreline is at risk from current and future flooding from sea level rise and storms.</p>
  <p>The maps support adaptation planning by: </p>
  <ul>
    <li>Showing low points along the shoreline that can lead to inland flooding, enabling resources to be directed to areas that pose the greatest risk.</li>
    <li>Presenting flooding as a “Total Water Level” above mean higher high water (MHHW), which represents various combinations of storm-surge and sea level rise. In using this approach, the Flood Explorer communicates that some areas will be temporarily flooded before they are permanently inundated and therefore, supports development of early-, mid-, and long-, term thresholds for action.</li>
    <li>Providing high quality spatial information to support planning given that these high-resolution maps were carefully reviewed by local stakeholders.</li>
  </ul>
  <p>It is important to note that while the maps depict flooding that would result if water levels were higher, the shoreline is shown as it appears today. Thus, the maps represent flooding that would occur absent any preparatory action or shoreline changes. Additionally, users should note that while the maps represent areas that could be at risk of flooding in the absence of adaptation action, there are numerous adaptation planning efforts occurring at many scales all around the Bay Area. These maps are meant to help inform those efforts and reduce the risks associated with sea level rise.</p>
  <img src="images/flooding-scenarios.jpg" alt="Flooding scenarios" class="image-style" />
  
  <a name="a-projections"></a>
  <h2>Sea Level Rise Projections</h2>
  <p>While the Flood Explorer can be paired with the latest sea level rise projections for the Bay area, the flooding depicted is not inherently tied to any time or emissions-based projections. As such, the information presented in the Flood Explorer will remain relevant even as sea level rise projections are updated. The Flood Explorer's use of a Total Water Level approach emphasizes various flooding scenarios in order to focus attention on incremental action, despite uncertainties in predicting storms and the rate of sea level rise. </p>
  <p>If you are looking to consider the Flood Explorer maps in the context of the latest sea level rise projections for the San Francisco Bay Area, please refer to the latest <a href="https://opc.ca.gov/wp-content/uploads/2024/05/California-Sea-Level-Rise-Guidance-2024-508.pdf" target="_blank" rel="noopener">State of California Sea Level Rise Guidance</a> (June 2024, at the time of writing). The State Guidance is updated every 5 years and provides probabilistic projections for the height of sea-level rise over various timescales for several greenhouse gas emissions scenarios. These scenarios are derived from those developed in the Intergovernmental Panel on Climate Change Sixth Assessment Report (IPCC AR6).</p>
  <p>The table below illustrates which Total Water Level in the Flood Explorer (using MHHW as a baseline) corresponds to a subset of the sea level rise scenarios described in the California State Guidance. Please note that Flood Explorer water levels are mapped using a tolerance of ± 3 inches to increase the applicable range of each scenario. The table also shows what temporary water levels may occur due to storms in each future scenario.</p>
  <?php include("../partials/projections-table.html"); ?>
  
  <p>The California State Guidance recommends that jurisdictions and developers decide which of these sea level rise projections to select based on a variety of factors, including location, lifespan of the project or asset, adaptive capacity, and risk tolerance/aversion.</p>
  <p>Check out the <a href="https://opc.ca.gov/wp-content/uploads/2024/05/California-Sea-Level-Rise-Guidance-2024-508.pdf" target="_blank" rel="noopener">State Sea Level Rise Guidance report</a> for additional information on steps suggested for evaluating risk tolerance, selecting sea level rise projections, and using this information to inform adaptation planning.</p>
  
  <a name="a-planning"></a>
  <h2>Planning Across Scales</h2>
  <p>San Francisco Bay is the largest estuary in the western United States, and the movement of water and the water levels within the Bay are influenced by many factors, including tides, winds, freshwater inflows, atmospheric pressure, and bathymetry. Due to the Bay’s complex bathymetry and geographic configuration, tidal range and water level elevations vary spatially throughout the estuary. Interactions between tidal processes (e.g., reflection of tidal waves), bathymetric variations, and shoreline orientation can amplify the tides with increasing distance from the Golden Gate Strait. Tidal amplification is greatest in the South Bay, causing an average tide range greater than 7.5 ft south of the San Mateo Bridge, compared to only 5.8 ft at the Golden Gate Bridge. In the far South Bay, along the Santa Clara County shoreline, the tide range can exceed 8 feet. Tidal amplification is also present to a lesser extent in San Pablo Bay to the north.</p>
  <p>Given this variation in water levels along the shoreline, it is important to use locally-specific water levels for more localized planning. This is less of a concern when planning at larger scales.</p>
  
  <h3>County-based Planning</h3>
  <p>The Flood Explorer enables users to zoom into their county of interest and view sea level rise and storm surge scenarios that reflect the daily and extreme tide levels (above MHHW) specific to that county. County-specific flood scenarios in the Flood Explorer account for some local processes, such as wind dynamics unique to each county’s shoreline, as well as the county’s location and orientation relative to the overall Bay. The county-specific flood scenarios are based on daily and extreme tide values calculated under the <a href="//www.adaptingtorisingtides.org/wp-content/uploads/2016/05/20160429.SFBay_Tidal-Datums_and_Extreme_Tides_Study.FINAL_.pdf" target="_blank" rel="noopener" >FEMA San Francisco Bay Coastal Study</a>.</p>
  <p><a href="<?= $ini["urls"]["matrix"]; ?>" target="_blank" rel="noopener" >For more information on flood scenarios averaged by county, see this memo. </a></p>
  
  <h3>Regional Planning</h3>
  <p>Although Bay water levels vary throughout the San Francisco Bay, the Flood Explorer allows decision makers and planners to zoom out and view the range of permanent and temporary flooding scenarios mapped across the entire region, without regard to geographic or political boundaries. When the Flood Explorer draws on regional scenarios (indicated in the Flood Explorer legend as “SF Bay”), the mapping projections are drawing on data that collapses the complex array of process affecting Bay water levels into a single water level above MHHW that is then used to display each sea level rise and storm surge amount regionally. These scenarios are most applicable to region-wide planning efforts.</p>
  <p><a href="<?= $ini["urls"]["matrix"]; ?>" target="_blank" rel="noopener" >For more information on flood scenarios applied across the region, see this memo. </a></p>
  
  <h3>Local Planning</h3>
  <p>For project-level planning, it may be necessary to assess local water levels and storm surge scenarios at a specific project location along the shoreline. At the local scale, the water levels calculated at each point are available from the FEMA San Francisco Bay Tidal Datums and Extreme Tides Study. This study presents the tidal datums (e.g., MLLW, MHHW, etc.) and storm surge levels under existing conditions, but does not extend this analysis to consider sea level rise. This data set has not been averaged along the shoreline and therefore it is a more accurate presentation of the water levels that could occur at a specific location. The data is not intended to replace the need for site-specific engineering analyses and modeling to inform design decisions.</p>
  <p><a href="<?= $ini["urls"]["tides"]; ?>" target="_blank" rel="noopener" >FEMA’s San Francisco Bay and Extreme Tides Study</a></p>
  
  <a name="a-disclaimer"></a>
  <h2>Disclaimer</h2>
  <p><?php include("../partials/text/disclaimer.html"); ?> <a class="a-link" href="/about/a-limitations" goto="a-limitations">Learn more</a>.</p>
  <p>For more information see the <a href="<?= $ini["urls"]["report"]; ?>" target="_blank" rel="noopener" >technical methods report</a>.</p>
  
  
  <span class="spacer"></span>
  <h1>Training Video</h1>
  <p>Watch this introductory and training video to understand how the Flood Explorer can support planning.</p>
  <iframe 
      title="Bay Shoreline Flood Explorer Training Video" 
      width="520" height="295" frameborder="0" 
      style="margin:0 10px;"
      src="https://www.youtube.com/embed/g_TJ-M_5VMs"
      allow="autoplay; encrypted-media" allowfullscreen
      ></iframe>
  
  <span class="spacer"></span>
  <h1>Flood Maps</h1>
  
  <h2>Description</h2>
  <p>The regional flooding and shoreline overtopping analysis maps provided in the ART Bay Shoreline Flood Explorer website capture permanent and temporary flooding impacts from sea level rise scenarios from 0- to 108-inches above MHHW (mean higher high water) and storm surge events from the 1-year to the 100-year storm surge. The process used to develop the maps included discussions with key stakeholders in each county, who reviewed the preliminary maps and provided on-the-ground verification and supplemental data to improve the accuracy of the maps (see the <a href="<?= $ini["urls"]["report"]; ?>#page=39" target="_blank" rel="noopener" >“Stakeholder Engagement” section of the technical methods report</a> for  more information and lists of all groups involved). The maps and information produced through this effort can inform adaptation planning, assist in managing climate change risks, and help identify trigger points for implementing adaptation strategies to address sea level rise and flooding hazards, at both local and regional scales.</p>
  <p>The Flood Explorer maps were produced using the latest LiDAR topographic data sets, water level outputs from the FEMA San Francisco Bay Area Coastal Study (which relied in hydrodynamic modeling using MIKE21) and the San Francisco Tidal Datums Study. The 2010/2011 LIDAR applied (collected by USGS and NOAA at a 1-m resolution) was further refined through the stakeholder review process and integration of additional elevation data where available (further described in <a href="<?= $ini["urls"]["report"]; ?>" target="_blank" rel="noopener" >the technical methods report</a>). The Flood Explorer also includes  the regional shoreline delineation developed by the San Francisco Estuary Institute to represent coastal flooding and overtopping throughout the Bay Area. In sum, the maps include:</p>
  <ul>
    <li>Flooding at ten total water levels that capture over 90 combinations of future sea level rise and storm surge scenarios.</li>
    <li>Shoreline overtopping maps for all ten total water levels that depict where the Bay may overtop the shoreline and its depth of overtopping at that specific location. Coupled with the flood maps, the overtopping data can help identify vulnerable shoreline locations and their respective flow paths that could lead to inland flooding.</li>
    <li>Hydraulically disconnected low-lying areas that represent areas that may be vulnerable to flooding due to their low elevation. These areas are not directly within flooding locations, but could be connected to flood waters through culverts and storm drains that are not captured in this analysis.</li>
  </ul>
  
  <a name="a-limitations"></a>
  <h2>Limitations</h2>
  <p>The flooding maps identify areas of risk to  flooding from <strong>sea level rise and storm surge</strong>. These inundation maps rely on two primary data sources: hydrodynamic modeling data to assess daily and extreme tide levels throughout the Bay and high quality topographic data for terrain development and shoreline delineation. <a href="<?= $ini["urls"]["report"]; ?>" target="_blank" rel="noopener" >You can learn more here</a>. The shoreline overtopping maps were also developed to help illustrate the primary inundation pathways from the Bay. Using these tools, stakeholders can understand shoreline asset exposure to a broad range of sea level rise scenarios.</p>
  <p>The maps and data layers are for planning-level assessments only. They should not be used for engineering design or construction purposes without consulting a qualified engineer. However, these products help identify where additional detailed information is needed to confirm shoreline vulnerabilities and can support the need for additional engineering analysis.</p>
  <p>However, there are notable <strong>limitations</strong> to these maps and the models that produced them. While the limitations should not preclude the use of the maps for the purposes described above, it is important to be aware of those flood-related impacts that are not included in these maps or models:</p>
  <ul>
    <li><strong>Riverine Flooding.</strong> The inundation maps do not account for localized inundation associated with any freshwater inputs, such as rainfall-runoff events, or the potential for riverine overbank flooding in the local tributaries associated with large rainfall events. Inundation associated with changing rainfall patterns, frequency, or intensity as a result of climate change is also not included in this analysis.</li>
    <li><strong>Wave hazards.</strong> For shorelines and developments directly along the bayshore, the consideration of wave hazards is required. Wave hazards, such as wave run-up and overtopping, are dependent on the shoreline type, roughness, slope, and other factors that require more detailed analysis than that presented in this project. In addition, wave run-up is excluded from this analysis as it may not increase linearly with sea level rise (i.e., a 1ft increase in SLR may lead to more than a 1ft increase in wave run-up). A coastal engineering assessment is required for both existing conditions and proposed adaptation strategies to adequately consider wave hazards and how they might change in the future with sea level rise.</li>
    <li><strong>Combined coastal-riverine events.</strong> Extreme storm events in the Bay Area, particularly during El Niño winters, often include extreme Bay water levels and precipitation. The cumulative impacts of rainfall runoff and storm surge were not considered in this project; however, the combination of these factors would further exacerbate inland flooding. In nearshore developed areas, particularly in areas behind flood protection infrastructure with topographic elevations below the Bay water surface elevation during an extreme event, it is important to consider the impacts of heavy rainfall and storm surge occurring together. You can learn about resources for considering combined riverine-tidal impacts here.</li>
    <li><strong>Climate change and storminess.</strong> Changes in storm frequency and magnitude due to climate change were also not examined in this project, but an evaluation of these dynamics may provide further insight into when adaptation strategies need to be implemented.</li>
    <li><strong>Groundwater.</strong> Rising groundwater tables, primarily associated with sea level rise, can also impact flooding and drainage.  The impacts of rising groundwater tables on watershed flooding are not well understood. With higher groundwater tables and rising sea levels, existing drainage systems will become less effective over time, and they may become completely ineffective with higher levels of sea level rise. Further evaluation of these factors is recommended.</li>
    <li><strong>Erosion and Subsidence.</strong> Geomorphic processes related to the erosion of the shoreline or subsidence land around the shoreline are not captured in these maps. Our maps present a ‘snapshot’ of the shoreline and inland area topography.</li>
    <li><strong>Marsh Vegetation.</strong> The inundation and flooding depths shown on heavily vegetated marsh plain surfaces may not be accurate due to vegetation interference with the bare-earth LiDAR signal, which may bias topographic elevation data high in these areas.</li>
    <li><strong>Salt Ponds and Wetlands.</strong> Our maps assume that if areas are hydrodynamically connected to flood waters, that these areas will fill up. This approach does not account for the physics of overland flow nor the volume of water available during any individual event. Therefore, the maps may overestimate the extent of flooding during a short duration flood impacting a salt pond or wetlands that can absorb and slow the movement of water.</li>
  </ul>
  <p>We will work to address the limitations in our modeling through updates to the maps over the coming years. If you have specific feedback about the maps you can provide that through our <a href="<?= $ini["urls"]["feedback"]; ?>" target="_blank" rel="noopener" >feedback survey</a>.</p>
  
  <h2>Technical Report</h2>
  <p>You can read more about mapping methodologies and analysis in <a href="<?= $ini["urls"]["report"]; ?>" target="_blank" rel="noopener" >the technical methods report</a>.</p>
  
  <h2>Mapping Resources</h2>
  <p>While there are a number of sea level rise (SLR) mapping tools available for San Francisco Bay and Delta (Table 1), the ART maps in both the Bay and Delta are unique due to their fine scale resolution, stakeholder review process, overtopping analysis, and combination of storm and SLR flooding. As a result, the ART maps are a powerful tool and are uniquely suited to support adaptation planning in the Bay and Delta. The table below compares the <a href="<?= $ini["urls"]["bayexplorer"]; ?>" target="_blank">ART SF Bay</a> and <a href="<?= $ini["urls"]["eccexplorer"]; ?>" target="_blank">East Contra Costa</a> maps to other SLR mapping products available in the Bay, including <a href="https://data.pointblue.org/apps/ocof/cms/" target="_blank" rel="noopener" >Our Coast, Our Future (OCOF)</a>, and <a href="https://coast.noaa.gov/slr/" target="_blank" rel="noopener" >NOAA’s Sea Level Rise Viewer</a>. To find a detailed comparison of the ART and U.S. Geological Survey (USGS) Our Coast Our Future (OCOF) mapping products specifically, please see <a href="<?= $ini["urls"]["comparison"]; ?>" target="_blank" rel="noopener" >the ART, OCOF comparison document</a> produced under San Mateo County Sea Change.</p>
  <table class="style-table">
    <tbody>
      <tr>
        <th>Mapping</th><th>Base Water</th><th>SLR Scenarios</th><th>Includes Waves</th><th>Includes Shoreline</th><th>Stakeholder</th>
      </tr>
      <tr>
        <td><a href="<?= $ini["urls"]["bayexplorer"]; ?>" target="_blank" rel="noopener">ART SLR Maps (SF Bay)</a></td>
        <td>MHHW</td>
        <td>12 to 108 inches</td>
        <td>No</td>
        <td>Yes</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><a href="<?= $ini["urls"]["eccexplorer"]; ?>" target="_blank" rel="noopener">ART SLR Maps (East Contra Costa)</a></td>
        <td>MHHW, 100-year Storm Event</td>
        <td>0, 12, 24, 36, 83 inches (+ 100-year Storm Event)</td>
        <td>No</td>
        <td>Yes</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td><a href="http://data.pointblue.org/apps/ocof/cms/" target="_blank" rel="noopener">USGS OCOF</a></td>
        <td>MHHW, King Tide, 20-year, 100-year Tide Level</td>
        <td>0 to 79 inches; 179 inches</td>
        <td>Yes</td>
        <td>No</td>
        <td>Limited</td>
      </tr>
      <tr>
        <td><a href="https://msc.fema.gov/portal/home" target="_blank" rel="noopener">FEMA FIRM</a></td>
        <td>100-year Tide Level and/or Wave Runup</td>
        <td>None</td>
        <td>Yes</td>
        <td>Yes</td>
        <td>Yes</td>
      </tr>
      <tr>
        <td>FEMA Increase Flooding Scenarios</td>
        <td>100-year Tide Level</td>
        <td>12, 24, 36 inches</td>
        <td>No</td>
        <td>No</td>
        <td>No</td>
      </tr>
      <tr>
        <td><a href="https://coast.noaa.gov/slr/" target="_blank" rel="noopener">NOAA SLR Viewer</a></td>
        <td>MHHW</td>
        <td>0 to 72 inches</td>
        <td>No</td>
        <td>No</td>
        <td>No</td>
      </tr>
    </tbody>
  </table>
  
  <span class="spacer"></span>
  <a name="a-consequence"></a>
  <h1>Consequence Maps</h1>
  
  <h2>Description</h2>
  <p>ART Bay Area is the first regional study to assess the impacts of rising sea level to four systems critical to the continued functioning and prosperity of communities in the Bay Area. Regional analysis was conducted for: transportation networks, vulnerable communities, future growth areas and natural lands. </p>
  <p>ART Bay Area conducted an analysis based on factors that pointed to “regional significance” – impacts that would create rippling consequences that would be felt throughout the region. These factors – called Consequence Indicators – vary across each regional system but provide a measure of impact not captured by flood exposure alone. Thirty-two indicators across the four systems give a measure of impacts, or consequences, to people, the economy, and the environment that could happen as rising seas lead to shoreline flooding.</p>
  <p>The Bay Shoreline Flood Explorer visualizes only a few of the total indicators analyzed in ART Bay Area. </p>
  <p><a href="<?= $ini["urls"]["artReport"]; ?>" target="_blank" rel="noopener">Read the full ART Bay Area report to learn more</a>.</p>
  
  <a name="a-consequence-methods"></a>
  <h2>Methods and Limitations</h2>
  <p>You can read more about consequence analysis methodology and limitations in <a href="<?= $ini["urls"]["artMethods"]; ?>" target="_blank" rel="noopener">ART Bay Area Appendix</a>.</p>
  
  <span class="spacer"></span>
  <h1>Glossary</h1>
  <p>For terms and definitions used in the ART Bay Shoreline Flood Explorer, please see <a href="/glossary" class="site-link" goto="glossary">Glossary</a>.</p>
  
  <span class="spacer"></span>
  <h1>FAQ</h1>
  <p>For a list of frequently asked questions about the ART Bay Shoreline Flood Explorer, mapping methodology, sea level rise guidance, and more please see <a href="/faq" class="site-link" goto="faq">Frequently Asked Questions</a>.</p>

  <span class="spacer"></span>
  <h1>Program</h1>
  
  <h2>BCDC</h2>
  <p>The San Francisco Bay Conservation and Development Commission (BCDC) is a California state planning and regulatory agency with regional authority over the San Francisco Bay, the Bay’s shoreline band, and the Suisun Marsh. BCDC was created in 1965 and is the nation’s oldest coastal zone agency.</p>
  <p>BCDC's mission is to protect and enhance San Francisco Bay and to encourage the Bay’s responsible and productive use for current and future generations. State law requires sponsors of projects that propose to fill or extract materials from the Bay to apply for a BCDC permit. In addition to minimizing any fill required for an appropriate project and ensuring that the project is compatible with the conservation of Bay resources, BCDC is tasked with requiring maximum feasible public access within the Bay’s 100-foot shoreline band. Throughout its existence, BCDC has approved projects worth billions of dollars, and the Commission continues to work closely with all applicants – private and public – from a project’s initial stages to ensure that they comply with state law. In addition, the Commission leads the Bay Area’s ongoing multi-agency regional effort to address the impacts of rising sea level on shoreline communities and assets. Its authority is found in the McAteer-Petris Act, the San Francisco Bay Plan, and its corresponding regulations, policies, and special area plans.</p>
  <p>To learn more about BCDC, please visit <a href="//www.bcdc.ca.gov" target="_blank" rel="noopener" >www.bcdc.ca.gov</a>.</p>
  
  <h2>Adapting to Rising Tides Website</h2>
  <p>The Adapting to Rising Tides website contains planning guidance, tools, and information developed and refined by the Adapting to Rising Tides Program to address the specific challenges of sea level rise from climate change. This includes materials and resources to help you conduct your own planning process. You can also get updates about ongoing regional planning work through <a href="//www.adaptingtorisingtides.org/project/art-bay-area" target="_blank" rel="noopener" >ART Bay Area</a>.</p>
  <p>To learn more about the Adapting to Rising Tides Program, please visit <a href="//www.adaptingtorisingtides.org/" target="_blank" rel="noopener" >www.adaptingtorisingtides.org</a>.</p>
  
  <h2>County Assessments</h2>
  <p>ART Program staff have convened and led multiple adaptation planning efforts at the county and community scales, working closely with local and regional agencies and organizations. The ART Program has completed assessments in Alameda County, Contra Costa County, and is working on an assessment of Easter Contra Costa County. Additionally, the ART program has led focused resilience studies along the Hayward and Oakland/Alameda shorelines.</p>
  <p>To learn more, please visit the <a href="//www.adaptingtorisingtides.org/project-location/local" target="_blank" rel="noopener" >Adapating to Rising Tides Local Projects page</a>.</p>
  
  <h2>Adaptation Projects Around the Region</h2>
  <p>The Adapting to Rising Tides Program has led adaptation projects at various scales and locations around the region, additionally, many of ART’s partners have conducted or are currently conducting projects to address sea level rise in their communities.</p>
  <p>You can learn more about <a href="<?= $ini["urls"]["getInvolved"]; ?>" target="_blank" rel="noopener" >adaptation projects around the region</a>.</p>
  
  <span class="spacer"></span>
  <h1>Funding + Partners</h1>
  <img src="images/cci-cap-trade.png" alt="Cap and trade dollars at work" width="140" style="float:right;margin-left:0.6em;margin-bottom:0.3em;" />
  <p>Funding for the development of the ART Bay Shoreline Flood Explorer website comes from the California Air Resource Board, the Metropolitan Transportation Commission (MTC), and BCDC. This website was also prepared by BCDC using Federal funds under award NA16NOS4190123 from National Oceanic and Atmospheric Administration (NOAA), U.S. Department of Commerce. The statements, findings, conclusions, and recommendations are those of the author(s) and do not necessarily reflect the views of NOAA or the U.S. Department of Commerce. Website development was supported by the San Francisco Estuary Institute.</p>
  <p>The Flood Explorer hosts data developed through the Adapting to Rising Tides Bay Area Sea Level Rise Analysis and Mapping Project, which was funded by the Bay Area Toll Authority and MTC. AECOM, in collaboration with MTC and BCDC, created these sea level rise and shoreline analysis data for the entire Bay shoreline using methods and tools developed by BCDC, MTC, and partners in prior studies. As such, additional key contributors to these map products include: the Alameda County Flood Control and Water Conservation District, the San Francisco Public Utilities Commission, the California Department of Transportation – District Number 4, and San Francisco Estuary Institute. The project team also thanks DHI Group LLC., and the Federal Emergency Management Agency for the continued use and support of the maps developed for the San Francisco Bay Area Coastal Study.</p>
  <p>ART Bay Area analysis funding provided by a Caltrans Sustainable Transportation Planning Grant with additional funding by Metropolitan Transportation Commission (MTC), Bay Area Toll Authority (BATA) and Greenhouse Gas Reduction Fund (GGRF).</p>
  
  <span class="spacer"></span>
  <a name="a-accessibility"></a>
  <h1><span class="hide-in-nav">Web Content</span> Accessibility</h1>
  <p>The San Francisco Bay Conservation and Development Commission (BCDC) is strongly committed to improved accessibility for all.</p>
  
  <h2>Viewing PDFs on our Website</h2>
  <p>This web site contains links to PDF documents that require the most current version of Adobe Reader to view. The Adobe Acrobat Reader may already be installed on your computer as a "plug-in" or "helper application" for your web browser. To find out, click on the "PDF" link for the document you are interested in. If the Adobe Acrobat Reader is properly installed on your computer, the Reader will either download or automatically open a PDF copy of the document, depending on your browser and how it is configured. If the Adobe Acrobat Reader is not installed on your computer, it can be found, free of charge, at the <a href="http://www.adobe.com/products/acrobat/readstep2.html" target="_blank" rel="noopener">Adobe Acrobat Reader download page</a>.</p>
  <p>If you are using a screen reader, you may find it will not read some documents in PDF format. Adobe provides a website that will convert non-accessible PDF files to a format that is useable with a screen reader. The Adobe Access site is located at <a href="http://www.adobe.com/accessibility/index.html" target="_blank" rel="noopener">access.adobe.com</a>, and the tool can also be added to your computer as a "plug-in".</p>
  
  <h2>Difficulty Accessing Material</h2>
  <p>We will make every effort to correct errors or problems with accessibility brought to our attention.</p>
  <p>If you have difficulty accessing the information, to access documents, or if you would like to make alternative arrangements, please contact us. You can contact us by telephone, e-mail, or letter. To enable us to respond in a manner most helpful to you, please indicate the nature of your accessibility problem, the web address of the requested material, and your contact information. Please contact BCDC at:</p>
  <p>
    415-352-3600<br />
    San Francisco Bay Conservation & Development Commission<br />
    375 Beale Street, Suite 510, San Francisco, CA 94105<br />
    <a href="mailto:accessibility@bcdc.ca.gov">accessibility@bcdc.ca.gov</a><br />
  </p>
  
  <h2>Certification</h2>
  <p>This website (<a href="https://explorer.adaptingtorisingtides.org">https://explorer.adaptingtorisingtides.org</a>) does not currently conform to the Web Content Accessibility Guidelines 2.0, or a subsequent version, published by the Web Accessibility Initiative of the World Wide Web Consortium at a minimum Level AA success criteria, as compliance would fundamentally alter the inherent design of the website to the extent that it would no longer meet the needs of the agency and would impose an undue burden pursuant to Exception E202.6, Undue Burden or Fundamental Alteration (see 36 C.F.R. Part 1194, Appendix A).</p>
  
  <span class="spacer"></span>
</article>