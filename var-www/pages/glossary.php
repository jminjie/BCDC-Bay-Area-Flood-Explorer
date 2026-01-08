<?php
  require_once("../local_config.php");
  chdir(dirname(__FILE__));
?>
<div id="page-title">ART Bay Shoreline Flood Explorer: Glossary</div>
<article id="inner-stage">
  <h1>Glossary</h1>
  <ul id="glossary-ul">
    
    <li>
      <a name="a-100yearstormsurge"></a>
      <p><strong><span class="section-title">100-Year Storm Surge</span>:</strong> A flood with 1-percent chance of occurrence in any given year. This standard is used by the FEMA and the National Flood Insurance Program to determine the need for flood insurance. While many of the data inputs into the ART Flood Explorer are the same as those carefully vetted by FEMA, these maps are not the same as FEMA Flood Insurance Rate Maps and the Flood Explorer have no regulatory implications. Other storm recurrence intervals included in the Flood Viewer are summarized in the table below. In general, the higher the surge elevation, the lower the probability of occurrence in any given year. For further explanation of this concept, check out the <a class="site-link" href="/learn" goto="learn">“Learn” section</a> of the site.</p>
      <img src="images/100-year-flood-table.png" style="margin-left:10px;" alt="100 year flood probabilities" />
      <p class="caption"><a href="https://water.usgs.gov/edu/100yearflood.html" target="_blank" rel="noopener" >https://water.usgs.gov/edu/100yearflood.html</a>></p>
    </li>
    
    <li>
      <a name="a-aadt"></a>
      <p>
        <strong><span class="section-title">Annual Average Daily Traffic (AADT)</span>:</strong>
        The total volume of vehicle traffic on a highway for a year divided by the number of days in a year, 365. AADT represents the daily use of the highway to the general population, including commuters. This indicator was chosen because it is a standard measures of traffic flow used in transportation planning and is regionally available for the entire Bay Area.
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=21" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-aadtt"></a>
      <p>
        <strong><span class="section-title"></span>Annual Average Daily Truck Traffic (AADTT):</strong>
        The total volume of truck traffic on a highway for a year divided by the number of days in a year, 365. AADTT represents the daily use of the highway for cargo and freight transport. This indicator was chosen because it is a standard measures of traffic flow used in transportation planning and is regionally available for the entire Bay Area.
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=21" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-passenger-flow"></a>
      <p>
        <strong><span class="section-title">Commuter Rail Passenger Flow</span>:</strong>
        The total number of people who travel along a given stretch between two stations on an average weekday. This indicator was chosen because the primary users of the Bay Area’s rail transit are commuters, and interruptions to this system would have major impacts on both the economy and residents of the region. Although no single dataset of passenger flows exists for the Bay Area, the project team was able to make use of transit ridership data available from each operator to calculate or approximate ridership flows. A limitation of this indicator is that ridership data available for each operator were not always available for the same year or at the same level of quality.
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=12" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-station-ridership"></a>
      <p>
        <strong><span class="section-title">Commuter Rail Station Ridership</span>:</strong>
        The average weekday exits from each commuter rail station. This indicator represents the amount each station is used compared to others in the system. Like Commuter Rail Passenger Flow, ridership data available for each operator were not always available for the same year or at the same level of quality. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=15" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-contamvul"></a>
      <p>
        <strong><span class="section-title">Contamination Vulnerability</span>:</strong>
        Block groups vulnerable to pollutant contamination from flooding were identified using data from the Environmental Effects category of CalEnviroScreen 3.0 compiled by CalEPA Office of Environmental Health Hazard Assessment. Like social vulnerability, block groups were assigned different levels of vulnerability to contamination based on the number of indicators for which percentile-based thresholds were exceeded, based on state-wide percentiles. Block groups rated as having moderate, high, or highest vulnerability to contamination were considered vulnerable communities and the number of residential units in impacted parcels within them were assessed as consequence. To calculate consequence, a key assumption made in this analysis is that once a parcel is exposed to flooding, even marginally, the entire number of residential units in that parcel is considered impacted. This assumption reflects a conservative understanding that flooding has many direct and indirect impacts for a person’s ability to enjoy their home. Indirect impacts such as flooding of walkways, foundations, electrical systems may all contribute to an individual or family being displaced. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=53" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-depth-flooding"></a>
      <p><strong><span class="section-title">Depth of Flooding</span>:</strong> Indicates the depth of flooding over land. In these maps, the darker the blue the deeper the flooding. The depth of flooding can be greater than the total water level if the elevation of the flooded area is below Mean Higher High Water.</p>
      <a href="images/FloodConcepts_Glossary-DepthFlooding.jpg" target="_blank">
        <img class="glossary-link-img" src="images/FloodConcepts_Glossary-DepthFlooding.jpg" alt="Depth of flooding" />
      </a>
    </li>
    
    <li>
      <a name="a-job-spaces"></a>
      <p>
        <strong><span class="section-title">Job Spaces</span>:</strong>
        A job space is the jobs summed up for each parcel. To calculate consequence, a key assumption made in this analysis is that once a parcel is exposed to flooding, even marginally, the entire number of job spaces in that parcel is considered impacted. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=35" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-king-tides"></a>
      <p><strong><span class="section-title">King Tides</span>:</strong> Predictable, exceptionally high tides, typically occurring during a new or full moon and when the earth is closest to the earth. King Tides are represented on the Flood Explorer as 1-year storm surge.</p>
    </li>
    
    <li>
      <a name="a-lifeline-route"></a>
      <p>
        <strong><span class="section-title">Lifeline Routes</span>:</strong>
        Highways that are of critical importance to regional mobility in emergency response designated by MTC/ABAG. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=21" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-lowlying"></a>
      <p><strong><span class="section-title">Low-Lying Areas</span>:</strong> Areas below the total water level, but not hydraulically connected to the flooded areas due to protection by levees or other topographic features. While the maps do not currently show flooding in these areas, it is important to map them as potentially vulnerable to flooding because they may be connected through culverts, storm drains, or other features (that are not captured in the maps) to adjacent flooded areas. </p>
      <a href="images/glossary-low-lying-areas.png" target="_blank">
        <img class="glossary-link-img" src="images/glossary-low-lying-areas.png" alt="Low-lying area" />
      </a>
    </li>
    
    <li>
      <a name="a-mhhw"></a>
      <p><strong><span class="section-title">Mean Higher-High Water (MHHW)</span>:</strong> Average high tide to provide a base elevation from which to add water from sea level rise or storm surge. MHHW is chosen as the base elevation to ensure the flood maps help us plan for the highest water level we can expect to see on a daily basis (many assets will not be useable if they flood once per day). Specifically, MHHW is calculated by averaging the higher of the two high tides in daily tide cycle during the current National Tidal Datum Epoch, which is a specific 19-year period (1983 to 2001) adopted by NOAA to perform tidal computations and measure change.</p>
    </li>
    
    <li>
      <a name="a-ommf"></a>
      <p><strong><span class="section-title">One Map, Many Futures</span>:</strong> The "One Map, Many Futures" approach allows you to look at a map of a single total water level (TWL) and see flooding resulting from these different scenarios. For example, a TWL of 36-inches above today's high tide can result from scenarios such as: </p>
      <p class="indent"><strong>a.</strong> 50-year storm today, </p>
      <p class="indent"><strong>b.</strong> 6-inches of sea level rise plus a 25-year storm in the short term, or </p>
      <p class="indent"><strong>c.</strong> 36-inches of sea level rise in the long-term. </p>
      <p>This approach allows us to plan actions to address temporary impacts of today's winter storms while simultaneously planning to address permanent flooding from sea level rise.</p>
      <a href="images/FloodConcepts_Glossary_OMMF.jpg" target="_blank">
        <img class="glossary-link-img" src="images/FloodConcepts_Glossary_OMMF.jpg" alt="One map, many futures" />
      </a>
    </li>
    
    <li>
      <a name="a-pud"></a>
      <p>
        <strong><span class="section-title">Photo User Days (PUDs)</span>:</strong>
        Estimates of the number of unique visitors to a location over a ten year period using photos uploaded to social media. While only a portion of visitors to any given site take and post geotagged photographs and share them on Flickr, the use of photo user days as a proxy for recreational visitation of a site is reasonable given that this data is applied consistently across the entire the Bay Area; therefore, the bias introduced by this indicator is uniform for the region. In ART Bay Area, recreation consequence was aggregated by Priority Conservation Area (PCA), which is an MTC/ABAG tool used to define areas of conservation, but for the Shoreline Flood Explorer we use the same methods to aggregate at the county scale. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=47" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-res-units"></a>
      <p>
        <strong><span class="section-title">Residential Units</span>:</strong>
        Residential units refer to the number of physical apartments or homes, not the number of people, summed up for each parcel. To calculate consequence, a key assumption made in this analysis is that once a parcel is exposed to flooding, even marginally, the entire number of residential units in that parcel is considered impacted. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=35" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-resilience"></a>
      <p><strong><span class="section-title">Resilience</span>:</strong> The capacity of any entity – an individual, a community, an organization, or a natural system – to prepare for disruptions, to recover from shocks and stresses, and to adapt and grow from a disruptive experience, such as flooding (OPC 2018).</p>
    </li>
    
    <li>
      <a name="a-slr"></a>
      <p><strong><span class="section-title">Sea Level Rise</span>:</strong> The worldwide average rise in mean sea level, due to thermal expansion of sea water and the addition of water to the oceans from the melting of glaciers, ice caps, and ice sheets caused by climate change.</p>
      <p>Sea levels are not rising at the same rate across the globe, so scientists produce future projections for local sea level rise for different segments of coast, quantifying where the uncertainties lie in their models.</p>
      <p>The State of California Sea Level Rise Guidance adopted by the Ocean Protection Council (June 2024, at the time of writing) provides probabilistic projections for the height of sea-level rise over various timescales for several greenhouse gas emissions scenarios. The State Guidance recommends that jurisdictions and developers consider different projections depending on various factors, such as the project's lifespan, adaptive capacity, and risk tolerance/aversion. As such, sea level rise scenarios must be considered on a case by case basis. To learn more about applying the ART Bay Shoreline Flood Explorer to the California State Sea Level Rise Guidance, <a class="site-link" href="/about/a-projections" goto="about#a-projections">click here</a>. </p>
      <a href="images/FloodConcepts_Glossary_SLR.jpg" target="_blank">
        <img class="glossary-link-img" src="images/FloodConcepts_Glossary_SLR.jpg" alt="Sea level rise" />
      </a>
    </li>
    
    <li>
      <a name="a-overtopping"></a>
      <p><strong><span class="section-title">Shoreline Overtopping</span>:</strong> Shoreline overtopping refers to the condition where the total water level associated with a particular flood scenario exceeds the elevation of the shoreline, allowing water to flow inland. The overtopping mapping shows which segments of the shoreline are impacted. The depth to which each segment is overtopped under each flood scenario is displayed when you click on an individual shoreline segment. This information helps identify and target adaptation strategies to those spots that pose the greatest risk. Shoreline overtopping does not account for the physics of wave run-up.</p>
      <a href="images/FloodConcepts_Glossary-Overtopping.jpg" target="_blank">
        <img class="glossary-link-img" src="images/FloodConcepts_Glossary-Overtopping.jpg" alt="Shoreline overtopping" />
      </a>
    </li>
    
    <li>
      <a name="a-shoreline-type"></a>
      <p>
        <strong><span class="section-title">Shoreline Type</span>:</strong> The San Francisco Bay Shore Inventory was classified into ten primary categories to capture the diversity of today’s Bay shore. The categories reflect both features which were built for flood risk management (e.g., floodwalls) and natural features (e.g., wetlands) which could indirectly provide coastal protection but were not specifically designed for this purpose. Detailed descriptions of mapping methodologies can be found in the report: <br />
        <a href="//www.sfei.org/sites/default/files/biblio_files/SFBayShoreInventoryReport_SFEI_2016.pdf" target="_blank" rel="noopener" >SFEI 2016. San Francisco Bay Shore Inventory: Mapping for Sea Level Rise Planning. SFEI Publication #779. San Francisco Estuary Institute-Aquatic Science Center, Richmond, CA.</a>
      </p>
      <ul>
        
        <li>
          <p><strong><span class="section-title">Engineered Levee</span>:</strong> Features were designated as ‘Engineered’ if a feature 1) was assigned as ‘accredited’ or ‘once accredited’ by FEMA or 2) a city, county, or agency representative confirmed that the levee had been engineered for flood protection. Generally, these features have two slopes, a classic levee shape, but in some cases engineered levees only had one slope.</p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_EngineeredLevee.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_EngineeredLevee.jpg" alt="Engineered Levee" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Floodwall</span>:</strong> Floodwalls, with two distinct sides and vertical walls, are generally narrower than levees and were captured based on aerial imagery or local knowledge provided by stakeholders and/or agency representatives. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_Floodwall.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_Floodwall.jpg" alt="Floodwall" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Berm</span>:</strong> Features with a “levee” shape (two slopes), but not specifically engineered for flood risk management. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_Berm.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_Berm.jpg" alt="Berm" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Shoreline Protection Structure</span>:</strong> Features with only one sloped side, often protecting an area of fill and located in areas of heavy development along the Bay shoreline. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_ShorelineProtectionStructure.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_ShorelineProtectionStructure.jpg" alt="Shoreline Protection Structure" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Embankment</span>:</strong> Features which only have one sloped side and are inland of the Bay shoreline were classified as embankments. Embankments generally line creek banks and sloughs, however in some cases embankments were mapped along natural slopes inland of the Bay shoreline (if they are the first feature inland of mapped wetlands).</p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_Embankments.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_Embankments.jpg" alt="Embankment" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Transportation Structure</span>:</strong> Transportation structures were mapped on the edge (or centerline of narrower structures) of a railroad track or a major road. All railroads and a sub-set of major roads were classified as transportation structures regardless of the feature shape (e.g., one and two slopes). Only roads that were elevated from the surrounding landscape were mapped. If a road was part of an engineered levee, then the feature was mapped as an engineered levee.</p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_TransportationStructure.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_TransportationStructure.jpg" alt="Transportation Structure" />
         </a>
         </li>
        
        <li>
          <p><strong><span class="section-title">Natural Shoreline</span>:</strong> The edge of predominantly natural land (e.g., cliffs, bluffs) was mapped as natural shoreline at the first major slope break along the Bay shoreline. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_NaturalShoreline.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_NaturalShoreline.jpg" alt="Natural Shoreline" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Wetland</span>:</strong> Wetlands were mapped along the Bay shoreline and along major slough channels and tributaries to the Bay. The edge of wetlands were mapped corresponding to the marsh edge scarp in the digital elevation model. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_Wetland.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_Wetland.jpg" alt="Wetland" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Channel or Opening</span>:</strong> This class mainly identified breaks in mapped features where openings were not apparent in the digital elevation model, such as running under levees or berm features. This class was also used to map some passive water control structures and tidal channels. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_ChannelOpening.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_ChannelOpening.jpg" alt="Channel or Opening" />
          </a>
        </li>
        
        <li>
          <p><strong><span class="section-title">Water Control Structure</span>:</strong> This class identifies water control structures (e.g., tide gates, pump stations) based on aerial imagery or knowledge from agency representatives. </p>
          <a href="images/FloodConcepts_Glossary-ShorelineType_WaterControlStructure.jpg" target="_blank">
            <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary-ShorelineType_WaterControlStructure.jpg" alt="Water Control Structure" />
          </a>
        </li>
        
      </ul>
    </li>
    
    <li>
      <a name="a-socvul"></a>
      <p>
        <strong><span class="section-title">Social Vulnerability</span>:</strong>
        Refers to a community’s ability to plan for, respond to, and recover from a disaster. This assessment rated social vulnerability by block group based on a series of indicators from the American Communities Survey 2016 5-Year Estimates that were chosen and vetted through an extensive stakeholder engagement process. Block groups were assigned different levels of social vulnerability based on the number of indicators for which thresholds based on Bay-Area wide percentiles were exceeded. Block groups rated as having moderate, high, or highest social vulnerability were considered vulnerable communities and the number of residential units in impacted parcels within them were assessed as consequence. To calculate consequence, a key assumption made in this analysis is that once a parcel is exposed to flooding, even marginally, the entire number of residential units in that parcel is considered impacted. This assumption reflects a conservative understanding that flooding has many direct and indirect impacts for a person’s ability to enjoy their home. Indirect impacts such as flooding of walkways, foundations, electrical systems may all contribute to an individual or family being displaced. 
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=52" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-storm-surge"></a>
      <p><strong><span class="section-title">Storm Surge</span>:</strong> A storm surge is an abnormal rise of water generated by high winds and low atmospheric pressure in the presence of a storm that is over and above the predicted astronomical tide. Often times these storms are explained in terms of the probability that they will occur in a given year. For example: </p>
      <p class="indent">• 5-year storm surge has a 1-in-5 chance (20% chance) of occurring any given year</p>
      <p class="indent">• 50-year storm surge has a 1-in-50 chance (2% chance) of occurring any given year</p>
      <p>Just as you will have a 50% chance of getting heads each time you flip a coin, there is a 2% chance of 50-year major storm each year. Larger storm surges, like a 50-year storm, will produce greater flooding. However, even small storms can cause flooding and disruptions in low elevation areas.</p>
      <a href="images/FloodConcepts_Glossary_StormSurge.jpg" target="_blank">
        <img class="glossary-shoreline-img" src="images/FloodConcepts_Glossary_StormSurge.jpg" alt="Storm surge" />
      </a>
    </li>
    
    <li>
      <a name="a-tidal-datum"></a>
      <p><strong><span class="section-title">Tidal Datum</span>:</strong> A tidal datum is a base elevation used as a reference from which to measure local water levels. It is defined by a certain phase of the tide. The ART Flood Viewer applies the datum Mean Higher High Water (defined above).</p>
    </li>
    
    <li>
      <a name="a-tidal-marsh"></a>
      <p>
        <strong><span class="section-title">Tidal Marsh</span>:</strong>
        Consequence measured in acres. Tidal marshes are valued for their carbon sequestration potential, and also for the habitat, flood reduction, wave attenuation, and water quality improvement capabilities. In general, tidal marshes vary from saline to brackish. They exist as both large tracts of contiguous habitat and as small fringing areas along more urbanized shorelines. In ART Bay Area, tidal marsh consequence was aggregated by PCAs, but for the Shoreline Flood Explorer we use the same methods to aggregate at the county scale.
        <a href="<?= $ini["urls"]["artMethods"]; ?>#page=42" target="_blank" rel="noopener">Read more about data sources and methods</a>.
      </p>
    </li>
    
    <li>
      <a name="a-tidal-range"></a>
      <p><strong><span class="section-title">Tidal Range</span>:</strong> Tidal range is the difference between Mean Higher High Water (the long-term average of the higher of the two high tides that occur each day) and Mean Lower Low Water (the long-term average of the lower of the two low tides that occur each day).</p>
    </li>
    
    <li>
      <a name="a-tides"></a>
      <p><strong><span class="section-title">Tides</span>:</strong> The regular upward and downward movement of the level of the ocean due to the gravitational attraction of the moon and the sun and the rotation of the earth. This predictable movement in water is also called “astronomical tides.” San Francisco experiences two high tides and two low tides of unequal height each day.</p>
    </li>
    
    <li>
      <a name="a-twl"></a>
      <p><strong><span class="section-title">Total Water Level</span>:</strong> The combination of tides, storm surge, and sea level rise at the shoreline.</p>
      <a href="images/FloodConcepts_Glossary_TWL.jpg" target="_blank">
        <img class="glossary-link-img" src="images/FloodConcepts_Glossary_TWL.jpg" alt="One map, many futures" />
      </a>
    </li>
    
  </ul>
  <span class="spacer"></span>
</article>
