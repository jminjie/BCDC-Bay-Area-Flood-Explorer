<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="page-title">ART Bay Shoreline Flood Explorer: FAQ</div>
<article id="inner-stage">
  <h1>Frequently Asked Questions</h1>
  <ul>
    <li>
      <p class="section-title">What are the intended uses of this tool?</p>
      <p>This tool and associated flooding and overtopping data is intended to be used as a planning guide to understand where our shoreline is at risk from flooding from sea level rise and storms. </p>
      <p>Although the products and information are not intended for use in the design of shoreline projects, they could inform planning and development of operational strategies, assist in identifying and managing climate-change-related risks, and help identify trigger points for implementing </p>
    </li>
    <li>
      <p class="section-title">How were the maps developed?</p>
      <p>This project, the Adapting to Rising Tides, Bay Area Sea Level Rise Analysis and Mapping Project, produces consistent inundation data and mapping products for all nine San Francisco Bay Area counties. This project was funded by the Bay Area Toll Authority (BATA) through the Metropolitan Transportation Commission (MTC); the project extends the tools and products that BCDC and MTC developed through prior efforts as part of the ART program and applies them Bay-wide. AECOM, in collaboration with MTC and BCDC, created these sea level rise and shoreline overtopping mapping products for the entire San Francisco Bay shoreline.</p>
      <p>The sea level rise mapping products capture permanent and temporary flooding impacts from sea level rise scenarios from 0 to 66 inches and extreme high tide events from the 1-year to the 100-year extreme tide. The mapping process included discussions with key stakeholders in each county, who reviewed the preliminary maps and provided on-the-ground verification and supplemental data as needed to improve the accuracy of the maps. The products and information produced through this effort can inform the planning and development of adaptation strategies, assist in managing climate change risks, and help identify trigger points for implementing adaptation strategies to address sea level rise and flooding hazards, at both local and regional scales.</p>
      <p>For more information see the <a href="<?= $ini["urls"]["report"]; ?>#page=51" target="_blank" rel="noopener" >Final Technical Methods Report</a>.</p>
    </li>
    <li>
      <a name="a-outside"></a>
      <p class="section-title">Where can I find sea level rise maps of the open coast (outside of the San Francisco Bay Estuary) and the Sacramento-San Joaquin Delta?</p>
      <p><a href="https://data.pointblue.org/apps/ocof/cms/" target="_blank" rel="noopener" >Our Coast, Our Future</a> is a great resource for visualizing sea level rise and flooding along the open coast and additional stretches of the west coast. <a href="https://cal-adapt.org/tools/slr-calflod-3d/" target="_blank" rel="noopener" >Cal-Adapt</a> provides resources for visualizing sea level rise and flooding in the Sacramento-San Joaquin Delta utilizing methods developed by <a href="https://v2.cal-adapt.org/media/files/CEC-500-2017-008.pdf" target="_blank" rel="noopener" >Radke et al., 2017</a>. The ART Program recently released maps of East Contra Costa county in partnership with the Delta Stewardship Council. You can explore these maps at <a href="<?= $ini["urls"]["eccexplorer"]; ?>" target="_blank">https://eccexplorer.adaptingtorisingtides.org/</a>.</p>
    </li>
    <li>
      <a name="a-differ"></a>
      <p class="section-title">How do these maps differ from other sea level rise maps?</p>
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
    </li>
    <li>
      <p class="section-title">How did you choose water levels to be mapped?</p>
      <p>The impacts of sea level rise (SLR) are often visualized using inundation maps. Typically, maps represent specific SLR scenarios (e.g., 16 inches of SLR above MHHW) or extreme tide water levels (e.g., the 1-percent-annual-chance tide). However, selecting the most appropriate SLR scenario to map in support of project planning, exposure analyses,  or SLR vulnerability and risk assessments is not simple. This approach requires pre-selecting appropriate SLR and extreme tide scenarios that meet all project needs. Rather than pre-selecting specific SLR scenarios for San Francisco Bay, the 10 individual sets of inundation maps selected for each county represent a range of possible scenarios associated with extreme tide levels and SLR ranging from 12 to 108 inches, representing combinations of 0 to 66 inches of SLR with extreme tides from the 1-year to the 100-year extreme tide. </p>
      <p>Because there are many possible SLR amounts in between 0 and 108 inches, the 10 water levels selected are flexible enough to accommodate future changes in SLR projections as the science evolves (while simultaneously allowing us to consider temporary storm-surge impacts). The 10 water levels are consistent among all counties, but because current water levels vary slightly throughout the Bay, each county has different sets of representative combinations of SLR and storm surge—this approach is described furhter under <a class="site-link" href="about/a-planning" goto="about#a-planning">"Planning Across Scales"</a> and in even more detail in this <a href="<?= $ini["urls"]["matrix"]; ?>" target="_blank" rel="noopener" >memo</a>.</p>
      <p>Each of the mapped scenarios approximates either (1) permanent inundation scenarios or (2) temporary flood conditions from specific combinations of SLR and extreme tides likely to occur before 2100. For example, in Marin County the water elevation associated with the MHHW + 36 inches of SLR scenario is similar to the water elevation associated with a combination of 24 inches of SLR and a 1-year extreme tide (king tide). Therefore, a single map can represent either event. Although inundation maps can approximate the temporary flood extent associated with an extreme tide, they illustrate neither the duration of flooding nor the potential mechanism(s) for draining floodwaters once the extreme tide recedes. </p>
    </li>
    <li>
      <p class="section-title">What is current State of California Sea Level Rise guidance?</p>
      <p>The California Ocean Protection Council (OPC) produces the State of California Sea Level Rise Guidance, which provides: 1) a synthesis of the best available science on sea-level rise projections and rates for California; 2) a stepwise process to apply sea level scenarios in planning and projects; and 3) general recommendations for sea level rise planning and adaptation.</p>
      <p>The State of California Sea Level Rise Guidance is updated every 5 years and provides probabilistic projections for the height of sea-level rise over various timescales for several greenhouse gas emissions scenarios. These scenarios are derived from those developed in the Intergovernmental Panel on Climate Change Sixth Assessment Report (IPCC AR6).</p>
      <p>You can read about using the ART maps to visualize the State of California Sea Level Rise Guidance <a class="site-link" href="about/a-projections" goto="about#a-projections">here</a>. You can learn more about the State of California Sea Level Rise Guidance <a href="https://opc.ca.gov/wp-content/uploads/2024/05/California-Sea-Level-Rise-Guidance-2024-508.pdf" target="_blank" rel="noopener" >here</a>.</p>
    </li>
    <li>
      <a name="a-riverine"></a>
      <p class="section-title">Do these maps account for riverine flooding or show impacts of sea level rise on tidal creeks and channels?</p>
      <p>Given that the San Francisco Bay Area Coastal Study includes historical inputs of freshwater into the Bay and the accompanying extreme tide during storms, these events are partially accounted for in our analysis.  The ART maps show how sea level rise and extreme tides will cause coastal flooding to move up tidally influenced rivers and creeks. However, the maps do not show combined coastal-riverine flooding which needs to be investigated on an individual creek-by-creek basis. In cases where flood managers have conducted flood analysis of individual creeks, their analysis will represent the best available data. Please see the report “Up a Creek? Guidance on assessing flood control risk” for guidance on assessing the vulnerability of tidal creeks and flood control channels to sea level rise.</p>
    </li>
    <li>
      <p class="section-title">What can I do if I have a question about the maps?</p>
      <p>If you have questions about the mapping process, how to use the tool, or think there might be errors in the mapping. Please email <a href="mailto:floodexplorer@bcdc.ca.gov?subject=Feedback">floodexplorer@bcdc.ca.gov</a> or fill out <a href="<?= $ini["urls"]["feedback"]; ?>" target="_blank" rel="noopener" >the review form here</a>.</p>
    </li>
    <li>
      <p class="section-title">What can I do if the maps are wrong?</p>
      <p>Through collecting the best available LIDAR and our stakeholder review process, we have compiled the best available digital elevation model.  That said, there may still be missing shoreline structure that impact flood patterns and the shoreline changes over time.  As such, if you think the maps might incorrectly be showing flooding in a particular area of the shoreline, please let us know by filling out the following form.  The simplest way to consider whether there may be a missing flood control structure or topographic feature is to review the maps of MHHW+12” or 24” flooding and then consider whether or not this reflects flood patterns you see during king tides and small storm surge events (1 to 5-year events).</p>
      <p>You can submit comments at <a href="<?= $ini["urls"]["feedback"]; ?>" target="_blank" rel="noopener" >our review form here</a>.</p>
    </li>
    <li>
      <p class="section-title">What planning efforts are happening around me?</p>
      <p>There are numerous shoreline adaptation planning and development projects occurring throughout the bay area. These projects are led citizen groups, county planners, regional agencies, and development advocates, Please see <a href="<?= $ini["urls"]["getInvolved"]; ?>" target="_blank" rel="noopener" >this page which lists ongoing projects by county</a>.</p>
    </li>
    <li>
      <p class="section-title">How can I get involved in adaptation planning?</p>
      <p>If you would like to learn more about ongoing planning projects or start your own project, please visit <a href="<?= $ini["urls"]["art"]; ?>" target="_blank" rel="noopener" >the ART portfolio page</a> for resources and instructions on how to lead a planning effort for your area. </p>
    </li>
    <li>
      <p class="section-title">How were Consequence Indicators chosen?</p>
      <p>In addition to evaluating the flooding exposure of assets within each of the four regional systems, ART Bay Area conducted an analysis based on factors that pointed to “regional significance” – impacts that would create rippling consequences that could be felt throughout the region. These factors – called Consequence Indicators – vary across each regional system but provide a measure of impact not captured by flood exposure alone. Thirty-two indicators across the four systems give a measure of impacts, or consequences, to people, the economy, and the environment that could happen as a rising sea leads to shoreline flooding and were chosen by the Project Team and confirmed by the Regional Working Group. Asset and indicator data used in the analysis was limited to that which was regionally available or possible to generate with available project resources. For example, transportation indicators of consequence vary from the number of average daily vehicles that would no longer be able to use a segment of a highway to the number of billions of dollars of cargo that would not be able to leave or enter a seaport. For vulnerable communities and future growth areas, residential housing units and jobs provide a measure of consequence, while for natural lands, endangered species habitat, stormwater services, recreation, carbon storage and other ecosystem services are used as indicators of consequences. </p>
      <p><a href="<?= $ini["urls"]["artReport"]; ?>" target="_blank" rel="noopener">Read the full ART Bay Area report to learn more</a>.</p>
    </li>
    <li>
      <p class="section-title">What are limitations to the Consequence analysis?</p>
      <p>A limitation of the overall approach to exposure and consequence analysis included the inability to field validate the elevation of individual ART Bay Area assets in relation to predicted water level to confirm the exposure indicated in our desktop analysis. Instead, given the highly accurate digital elevation model and ground truthing conducted in the development of the flood mapping, we assume the flood mapping accounts for and includes variation in the surface elevation of ART Bay Area assets. To this end, data preparation and quality control described above was key to ensure the most accurate results of the exposure modeling. </p>
      <p><a href="<?= $ini["urls"]["artAppendix"]; ?>" target="_blank" rel="noopener">Read more about ART Bay Area consequence analysis methods and limitations in the ART Bay Area Report Appendix</a>.</p>
    </li>
    <li>
      <p class="section-title">Where can I learn more about Consequence Indicator Methodology?</p>
      <p><a href="<?= $ini["urls"]["artAppendix"]; ?>" target="_blank" rel="noopener">Read more about ART Bay Area consequence analysis methods and limitations in the ART Bay Area Report Appendix</a>.</p>
    </li>
    <li>
      <p class="section-title">Is the full ART Bay Area exposure and consequence analysis data available for download?</p>
      <p>You can download the ART Bay Area exposure and consequence GIS data on this site and through the BCDC Open Data Platform.</p>
    </li>
  </ul>
  <span class="spacer"></span>
</article>