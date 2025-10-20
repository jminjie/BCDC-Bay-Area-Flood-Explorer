<?php

require_once("local_config.php");
require_once($rootPhpPath . '/processGeoData.php');
/**
 * Scripts for uploading and processing spatial data (kml, kmz, or shp [zipped])
 * 
 * PARAMETERS:
 *   If uploading:
 *     $_FILES["upgeo"] - Uploaded file
 *   If processing recently uploaded data:
 *     $_REQUEST["ts"] - Timestamp of upload
 *     $_REQUEST["ext"] - File extension of recently uploaded data
 * 
 * RETURNS:
 *   If uploading:
 *     JSON with following values:
 *       "ts" - Timestamp of upload
 *       "ext" - File extension of recently uploaded data
 *       "error" - If error during uploading
 *   If processing recently uploaded data:
 *     JSON encoded KML if processed sucessfully or..
 *     JSON with "error" value if error during processing.
 */
$exp = null;
try {
    if(isset($_FILES['up'])) {
        $result = uploadGeoData($_FILES['up']);
    } else if(isset($_REQUEST["ts"]) && isset($_REQUEST["ext"])) {
        $ts  = filter_input(INPUT_GET, "ts", FILTER_SANITIZE_NUMBER_INT);
        $ext = filter_input(INPUT_GET, "ext", FILTER_SANITIZE_STRING);
        try {
            $result = processGeoData($ts, $ext);
        } catch(Excpetion $e) {
            $exp = $e;
        }
        // finally block may not be handled in older versions of php
        cleanGeoData($ts);
    } else {
        die("null");
    }
} catch(Exception $e) {
    $exp = $e;
}
if($exp) {
    $result = array("error" => $exp->getMessage());
}
echo json_encode($result);

?>