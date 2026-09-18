# BCDC Bay Area Flood Explorer

A locally run client made by the Exploratorium for the BCDC Bay Area Flood
Explorer. Requires internet access to run because it queries BCDC's mapservers.
(Should not be a large server load, its basically equivalent to them having one
user with the website open.)

This client has a few modifications for our visitors -- several features are
hidden or removed, there are callouts and POIs added and some touchscreen
behavior.

# Building and serving
To rebuild, run `node build -env=development` or `node build -env=prod`. The
build process has occasionally had problems where certain libraries need to be
added manually. Go to the libraries directory nested undert the built directory
(likely `var-www/`, or wherever is configured in `build.js` and `configs/`) and
install with npx.

```
cd var-www/js/lib/common
npx clean-css-cli -o dist/common.min.css src/*.css
npx terser src/common.table.js -o dist/common.table.min.js
npx terser src/common.js -o dist/common.min.js
```

To serve, go to the built directory (`var-www/`) and run `php -S locahost:8000`.