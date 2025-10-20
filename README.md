# BCDC Bay Area Flood Explorer

Developed by [San Francisco Estuary Institute](https://sfei.org) for [BCDC](https://www.bcdc.ca.gov/).

## Environment

The application was first built in 2017. It's important to mention this because some of the tools the libraries used in its framework are somewhat outdated and on the short-list for future modernization.

Some information about general environment setup is detailed in [aws-current-setup](./_notes/aws-current-setup). However, some of this may differ based on your server environment.

### Server-side

Server-side processing is handled through PHP, with scripts in `php/`. PHP is used for server side rending of pages, passing the config parameters, processing spatial data (indirectly via ogr2ogr calls on the server), and handling downloads. In no cases does it actually query or connect to the database (all data queries are handled through MapServer and getFeatureInfo requests).

### Mapserver

[Mapserver](https://mapserver.org/) is used for display of spatial data on the webmap. Setup of the Mapserver instance is not documented here, as it may vary greatly based on how you choose to configure Mapserver, but the relevant mapfiles are provided in the folder `mapfiles/`. See [mapserver-notes](./_notes/mapserver-notes) for additional details.

### Build and Config

Once built, the root site folder is provided with the file `local_config.ini` which is a single-line, simply pointing to the filepath of the actual config ini file as well as the php script path. It's important to note these point outside of the build folder, back to the original repo. (Which means changing them in the repo path will affect any build created off of it.)

Besides the ini files providing basic site config files, `urls.ini` and `downloads.ini` provide data for dynamic substitution of links and downloads. These are referenced within the site configs by filepath. Combined with above caveat, this means link URLs and download paths can be updated without requiring a new build.

Node and RequireJS are used to build the application from the script at `build.js`. See [build-instructions](./_notes/build-instructions) for some specifics about how the build is setup and runs. See [require-build-detailed-info](./_notes/require-build-detailed-info) for in-depth descriptions of why the build is structured as it is and weird quirks necessitated during the application startup process. (RequireJS is a pretty outdated choice today, not what I would use anymore, but this app is almost a decade old..)
