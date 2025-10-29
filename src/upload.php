<?php
/*
 * Copyright (C) 2025 San Francisco Estuary Institute (SFEI)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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