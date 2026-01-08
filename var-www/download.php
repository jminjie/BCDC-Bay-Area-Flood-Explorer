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
require_once($rootPhpPath . '/serveDownload.php');

$request = filter_input(INPUT_POST, "r", FILTER_SANITIZE_STRING);
if($request == "prep") {
    $filekey = filter_input(INPUT_POST, "f", FILTER_SANITIZE_STRING);
    echo json_encode(prepareDownload($filekey));
} else if($request == "fetch") {
    serveDownload();
}
