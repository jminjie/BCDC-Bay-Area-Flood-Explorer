<?php

function checkValidExtension($ext) {
    // check extension is valid first
    $ext = strtolower($ext);
    if($ext !== "kml" && $ext !== "kmz" && $ext !== "zip") {
        throw new Exception("Uploaded data is NOT a kml, kmz, or zipped shapefile.");
    }
}

function getGeoDataTmpName() {
    // create uploads dir with timestamp and add random number
    $ts = strval(time()) . str_pad(strval(rand(0,99)), 2, "0", STR_PAD_LEFT);
    return $ts;
}

function getGeoDataDir($ts) {
    global $ini;
    $uploadDir = $ini["geo_upload_dir"] . "$ts/";
    if(!file_exists($ini["geo_upload_dir"])) {
        mkdir($ini["geo_upload_dir"]);
    }
    if(!mkdir($uploadDir)) {
        throw new Exception("Problem uploading file - unable to make tempdir for uploaded file: $uploadDir");
    }
    return $uploadDir;
}

function uploadGeoData($fileUp) {
    if(!isset($fileUp['name'])) {
        echo json_encode(array("error" => "<b>Problem uploading file - unable to move file to upload directory.</b>"));
        exit;
    }

    $fname  = $fileUp['name'];
    $ftmp   = $fileUp['tmp_name'];
    //$ftype  = $fileUp['type'];
    //$ferror = $fileUp['error'];
    $fextension = pathinfo($fname, PATHINFO_EXTENSION);
    
    global $ini;
    if($fileUp["size"] > $ini["max_file_size"]) {
        throw new Exception("File size (" . $fileUp["size"] . ") exceeds maximum allowed (" . $ini["max_file_size"] . ")");
    }

    $returnVal = array();
    
    checkValidExtension($fextension);
    $ts = getGeoDataTmpName($fextension);
    $uploadDir = getGeoDataDir($ts);
    $uploadPath = $uploadDir . "upload." . $fextension;
    
    $mvUpload = move_uploaded_file($ftmp, $uploadPath);
    if($mvUpload == 1) {
        $returnVal['ts'] = $ts;
        $returnVal['ext'] = $fextension;
    } else {
        $returnVal['error'] = "Problem uploading file - unable to move file to upload directory.";
    }
    return $returnVal;
}


function processGeoData($ts, $ext) {
    // check extension first
    checkValidExtension($ext);
    
    global $ini;
    $uploadDir = $ini["geo_upload_dir"] . "$ts/";
    $uploadPath = $uploadDir . "upload.$ext";

    $data = null;
    if($ext == "kml") {
        $data = file_get_contents($uploadPath);
    } else if($ext == "kmz") {
        //rename it
        $renameZipPath = $uploadDir . "upload.zip";
        if(copy($uploadPath, $renameZipPath)) {
            $zip = new ZipArchive;
            if($zip->open($renameZipPath) == TRUE && $zip->extractTo($uploadDir) == TRUE) {
                for($i = 0; $i < $zip->numFiles; $i++) {
                    $fn = $zip->getNameIndex($i);
                    if(strtolower(substr($fn, -4)) == ".kml") {
                        $data = file_get_contents($uploadDir.'/'.$fn);
                        break;
                    }
                }
                $zip->close();
                if(!$data) {
                    throw new Exception("Error extracting KML from KMZ file");
                }
            } else {
                $zip->close();
                throw new Exception("Error extracting KMZ file");
            }
        } else {
            throw new Exception("Error reading KMZ file");
        }
    } else if($ext == "zip") {
        // extract shapefile form zip
        $zip = new ZipArchive;
        if($zip->open($uploadPath) != TRUE) {
            $zip->close();
            throw new Exception("Unable to open zipfile");
        }
        // get basename and rename all files to lowercase
        $shpName = null;
        for($i = 0; $i < $zip->numFiles; $i++) {
            $oldname = $zip->getNameIndex($i);
            if(!$shpName) {
                $shpName = strtolower(basename($oldname, "." . pathinfo($oldname, PATHINFO_EXTENSION)));
            }
            $zip->renameName($oldname, strtolower($oldname));
        }
        // close and reopen zip after changes
        $zip->close();
        $zip->open($uploadPath);
        // extract zipfile
        if($zip->extractTo($uploadDir) != TRUE) {
            $zip->close();
            throw new Exception("Unable to extract zipfile");
        }
        $zip->close();
        
        $shpFiles = array(
            "shp" => $shpName . ".shp", 
            "dbf" => $shpName . ".dbf", 
            "shx" => $shpName . ".shx", 
            "prj" => $shpName . ".prj", 
        );
        foreach($shpFiles as $ext => $fn) {
            if(!file_exists($uploadDir . $fn)) {
                throw new Exception("Shapefile zip is missing one of the required files (all shp, shx, dbf, and prj files must be present)");
            }
        }
        
        // convert to kml
        $kmlFile = "$shpName.kml";
        $kmlPath = $uploadDir . $kmlFile;
        $ogrCommand = "ogr2ogr -t_srs EPSG:4326 -f kml " . escapeshellarg($kmlPath) . ' ' . escapeshellarg($uploadDir . $shpFiles["shp"]);
        $execOut = null; $execError = null;
        exec($ogrCommand, $execOut, $execError);
        if($execError) {
            throw new Exception("Error processing shapefile (ogr2ogr: $execError)");
        }
        $data = file_get_contents($kmlPath);
    }
    return $data;
}


function deleteDir($target) {
    if(is_dir($target)) {
        $files = glob($target . '*', GLOB_MARK);
        foreach($files as $file) { deleteDir($file); }
        rmdir($target);
    } else {
        unlink($target);
    }
}

function cleanGeoData($ts) {
    global $ini;
    deleteDir($uploadDir = $ini["geo_upload_dir"] . "$ts/");
}

?>