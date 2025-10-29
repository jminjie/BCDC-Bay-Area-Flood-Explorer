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