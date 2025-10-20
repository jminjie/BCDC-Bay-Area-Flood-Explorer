<?php

// set root dir here (NOTE this is not permanent so don't depend on it)
chdir(dirname(__FILE__));
// open local config
$config = parse_ini_file("local_config.ini", false);
// get ini and root php scripts paths
$iniPath = realpath($config["ini_path"]);
$rootPhpPath = realpath($config["root_php_path"]);
unset($config);
// begin config script
require_once($rootPhpPath . "/config.php");

?>
