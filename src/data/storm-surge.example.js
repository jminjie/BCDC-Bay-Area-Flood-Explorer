{
  // county name or "regional"
  "regional": {
    // for each county list of storm-surges (by year) that are added on top of SLR
    "1": 14,  // this is 14" additional flooding for 1-year (or king tide) storm surge
    "2": 18,  // this is 18" additonal flooding for 2-year storm surge
    "5": 23,  // etc.
    "10": 27, 
    "25": 32, 
    "50": 37, 
    "100": 42, 
    // By default, flooding matrix searches a default range (usually -2 to +3) to match scenarios to the total
    // flooding. E.g., in this example, 12" of SLR plus 5-year storm surge (listed as additional 23" above), 
    // would result in total flooding of 35". However this isn't one of the intervals in the slider value, so 
    // it's matched to the preset interval of 36" as it's only -1 from the interval.
    //
    // So, when selecting 36" (or whatever value) on the slider, any scenario resulting in total flooding from
    // 34" to 39" are considering matching (using default search range of -2 to +3). To override this, set 
    // specific search ranges by one of the preset flooding intervals below.
    //
    // E.g., the first item below overrides the search range on total flooding of 36" to instead only be from 
    // 34" to 38" by changing the search interval from -2 to +2.
    "exceptions": {
      "36": [-2, 2], 
      "66": [-2, 2], 
      "77": [-1, 3], 
      "84": [-3, 2], 
      "96": [-2, 2], 
      "108": [-2, 2]
    }, 
    // Still, sometimes you have two combinations that match within the above intervals. E.g. 5-year storm 
    // surge with no SLR (23" total inundation) and 10-year storm surge with no SLR (27" total inundation), 
    // both match the preset interval of 24" (with default -2 to +3 search range). 
    // 
    // By default, the code avoidsshowing combinations that share the SLR or storm-surge. So the in example, 
    // it would pick the closest, thus showing the 5-year storm surge with no SLR but not the 10-year storm 
    // surge.
    // 
    // If we wanted to force it to pick the opposite in that situation we could either force it to add or 
    // remove specific combinations.
    "force": {
      // forcings for 24" total inundation
      "24": [
          // forces not selecting combination of 5-year storm surge with 0" SLR
          [5, 0, false], 
          // forces selecting combination of 10-year storm surge with 0" SLR
          [10, 0, true]
          // having both above is redundant, only one needs to be set, but just to demonstrate
      ]
    }
  }
}