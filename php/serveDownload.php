<?php

if(session_status() == PHP_SESSION_NONE) {
    session_start();
}

function prepareDownload($filekey) {
    $response = array(false, "Server error", 0);
    try {
        // get download config
        global $ini;
        $dlini = parse_ini_file($ini["download_config"], true);
        $dlini["dir"] = realpath($dlini["Location"]["dir"]) . "/";
        // check file exists
        if(!array_key_exists($filekey, $dlini["Map"])) {
            throw new Exception("File not found (0).");
        }
        $filepath = $dlini["dir"] . $dlini["Map"][$filekey];
        if(!file_exists($filepath)) {
            throw new Exception("File not found (1).");
        }
        if(!is_readable($filepath)) {
            throw new Exception("File not found (2).");
        }
        // save filepath to session to ensure it's never revealed to user
        $_SESSION['download_filepath'] = $filepath;
        $response[0] = true;
        $response[1] = $dlini["Map"][$filekey];
        $response[2] = filesize($filepath);
    } catch(Exception $e) {
        $response[0] = false;
        $response[1] = $e->getMessage();
    } finally {
        return $response;
    }
}

function serveDownload() {
    if(isset($_SESSION['download_filepath'])) {
        $filepath = $_SESSION['download_filepath'];
        $_SESSION['download_filepath'] = null;
        header("X-Sendfile: $filepath");
        header("Content-type: application/octet-stream");
        header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
    } else {
        die("Download failed. Ensure cookies are enabled for the Flood Explorer webpage (cookies used to prevent download spamming) and that you were downloading directly from the Flood Explorer webpage, not an external link pointing to it.");
    }
}
