<?php

require_once("local_config.php");
require_once($rootPhpPath . '/serveDownload.php');

$request = filter_input(INPUT_POST, "r", FILTER_SANITIZE_STRING);
if($request == "prep") {
    $filekey = filter_input(INPUT_POST, "f", FILTER_SANITIZE_STRING);
    echo json_encode(prepareDownload($filekey));
} else if($request == "fetch") {
    serveDownload();
}
