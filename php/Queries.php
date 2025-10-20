<?php

class Queries {
    
    private static $dbconn = null;
    private static $instance;
    
    /** Get the existing instance of Queries (create if none exists).
     * @return Queries Singleton instance
     * @static */
    public static function getInstance() {
        chdir(dirname(__FILE__));
        if(is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // create connection
        if(!self::$dbconn) {
//            $ini = self::getConfigPrivate();
//            // locate database connection file
//            $dbConnPath = !$ini["dev_mode"] ? "/var/mapwork/dbconns/" : "../conns/";
//            $dbConnPath .= $ini["dev_db"] ? "bcdc_conns_dev.php" : "bcdc_conns.php";
//            require($dbConnPath);
//            self::$dbconn = new PDO("$dbtype:host=$host;port=$port;dbname=$dbname", $user, $pass);
//            if(!self::$dbconn) {
//                die('Could not connect to server');
//            }
            self::$dbconn = "not-needed-yet";
        }
    }
    
    private function getConfigPrivate() {
        global $ini;
        // if ini var is not empty, config was already called somewhere
        if(empty($ini)) {
            // otherwise call config.php in same directory (requires global $iniPath)
            require(dirname(__FILE__) . "/config.php");
        }
        return $ini;
    }
    
    public function getConfig($params) {
        $ini = self::getConfigPrivate();
        $toFloat = function($i) { return floatval($i); };
        return array(
            'mapServerUrls' => array(
                'local'       => $ini["local_mapserver_url"], 
                'cache'       => $ini["local_mapcache_url"], 
                'mapFilePath' => $ini["map_file_path"]
            ), 
            'mapOptions' => array(
                'basemapSelect' => intval($ini["basemap_index"]), 
                'initZoomLevel' => intval($ini["init_zoom"]), 
                'minMaxZoom'    => array_map($toFloat, explode(",", $ini["min_max_zoom"])), 
                'center'        => array_map($toFloat, explode(",", $ini["center"])), 
                'extent'        => array_map($toFloat, explode(",", $ini["extent"]))
            ), 
            'urls'           => $ini["urls"],
            'googleApiKey'   => $ini["google_api_key"], 
            'gAnalyticsId'   => $ini["g_analytics_id"]
        );
    }
    
    private function query($queryString, $paramArray=null) {
        // NOTE THIS WILL BREAK RIGHT NOW
        // However we don't actually query the DB directly, even querying the layers in PostGIS are handled 
        // through MapServer
        $query = self::$dbconn->prepare($queryString);
        $query->execute($paramArray);
        if($query->errorCode() != 0) {
            die("Query Error: " . $query->errorCode());
        }
        return $query;
    }
    
}