<?php

// $inipath should be loaded from local config
global $iniPath;
if(!isset($iniPath)) { die("Local config path not set"); }
// load ini and parse types
$ini = parse_ini_file($iniPath);
foreach($ini as $key => $value) {
    if($value == "true" || $value == "false") {
        $ini[$key] = ($value == "true");
    } else if(is_numeric($value)) {
        $ini[$key] = floatval($value);
    }
}
// set all relative paths in ini file to realpaths (relative to main repo dir)
chdir(dirname(__FILE__) . "/../");
$ini["geo_upload_dir"] = realpath($ini["geo_upload_dir"]) . "/";
// load urls
$ini["urls"] = parse_ini_file($ini["urls_config"], false);
// debug options
if($ini['dev_debug_php']) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

?>