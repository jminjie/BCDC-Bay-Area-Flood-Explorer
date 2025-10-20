<?php require_once("local_config.php"); ?>
<!DOCTYPE html>
<html>
  <head>
    <title>Matrix</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    <style>
      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 2em;
      }
      #control {
        margin-bottom: 1em;
      }
      #control select {
        width: 15em;
        text-transform: capitalize;
      }
      #matrix {
        
      }
      th {
        line-height: 2.3em;
      }
      td {
        min-width: 45px;
        text-align: center;
        color: #000;
      }
      td.row-hdr {
        font-weight: bold;
      }
      td.s12 {
        background: rgb(254, 254, 121);
      }
      td.s24 {
        background: rgb(255, 204, 143);
      }
      td.s36 {
        background: rgb(240, 138, 91);
      }
      td.s48 {
        background: rgb(232, 99, 12);
      }
      td.s52 {
        background: rgb(249, 106, 106);
      }
      td.s66 {
        background: rgb(171, 75, 75);
      }
      td.s77 {
        background: rgb(154, 235, 246);
      }
      td.s84 {
        background: rgb(105, 216, 214);
      }
      td.s96 {
        background: rgb(22, 166, 169);
      }
      td.s108 {
        background: rgb(22, 108, 150);
      }
    </style>
  </head>
  <body>
    <div id="container">
      <div id="control">
        <select></select>
      </div>
      <div id="matrix"></div>
    </div>
    <?php if($ini["dev_mode"] && !$ini["dev_force_build"]) { ?> 
    <script src="js/lib/require.js"></script>
    <script src="js/init/rconfig.js"></script>
    <?php } else { ?>
    <script src="build/require.js"></script>
    <script src="build/rconfig.js"></script>
    <?php } ?>
    <script>
      require(['jquery', 'modules/slr-matrix'], function(jQuery, SLRMatrix) {
        var slrLevels     = [0, 12, 24, 36, 48, 52, 66, 77, 84, 96, 108], 
            slrLevelsFull = [0, 6, 12, 18, 24, 30, 36, 42, 48, 52, 54, 60, 66, 72, 77, 84, 90, 96, 102, 108], 
            matrix = window.matrix = new SLRMatrix(slrLevels, slrLevelsFull);
        matrix.init(function() {
          var select = $("#control select");
          for(var i = 0; i < matrix.counties.length; ++i) {
            select.append($("<option>", {
              value: i, 
              html: matrix.counties[i]
            }));
          }
          select.on("change", updateMatrix);
          updateMatrix();
        });
        var updateMatrix = function() {
          var county = matrix.counties[$("#control select").val()], 
              container = $("#matrix").html(""), 
              table = $("<table>").addClass("style-table").appendTo(container), 
              headers = $("<tr>").appendTo(table);
          
          var stormsurges = matrix.getStormSurgeLevels(county);
          headers.append($("<th>", {html: "SLR Scenario"}));
          for(var i = 0; i < stormsurges.length; ++i) {
            headers.append($("<th>", {html: stormsurges[i] ? stormsurges[i] + "-year" : "Daily Tide"}));
          }
          
          var thisMatrix = matrix.inundationMatrix[county];
          for(var r = 0; r < slrLevelsFull.length; ++r) {
            var slr = slrLevelsFull[r], 
                row = $("<tr>").attr("slr", slr).appendTo(table);
            var rowHead = $("<td>", {'class': "row-hdr", html: !slr ? "Existing Conditions" : "MHHW + " + slr + "\""}).appendTo(row);
            if(slrLevels.indexOf(slr) >= 0) {
              rowHead.addClass("s"+slr);
            }
            for(var c = 0; c < stormsurges.length; ++c) {
              var inundation = thisMatrix.getValue([r, c]);
              $("<td>", {html: inundation}).appendTo(row)
                    .attr("ss", stormsurges[c]);
            }
          }
          
          for(var i = 0; i < slrLevels.length; ++i) {
            var level = slrLevels[i], 
                scenarios = matrix.getInundationScenarions(county, level), 
                tdClass = "s"+level;
            for(var j = 0; j < scenarios.length; ++j) {
              var scenario = scenarios[j], 
                  row = table.find("tr[slr="+scenario.slr+"]");
              if(!row) continue;
              row.find("td[ss="+scenario.stormSurge+"]").addClass(tdClass);
            }
          }
        };
      });
    </script>
  </body>
</html>
