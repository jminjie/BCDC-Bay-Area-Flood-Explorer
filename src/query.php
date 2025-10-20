<?php

$request = array(
    'query' => filter_input(INPUT_GET, 'q', FILTER_SANITIZE_STRING)
);
if(!$request["query"]) { return; }

require_once("local_config.php");
require_once($rootPhpPath . '/Queries.php');

$instance = Queries::getInstance();

$result = null;
$callbackArray = array($instance, $request['query']);
if(is_callable($callbackArray)) {
    $result = call_user_func($callbackArray, $request);
}

// getWaterbodiesAsGeojson() returns already in JSON so check if we need to encode or not first
echo is_array($result) ? json_encode($result, JSON_NUMERIC_CHECK) : $result;

?>