<?php

include_once(__DIR__ . '/loadenv.php');
include_once(__DIR__ . '/functions.php');
date_default_timezone_set("Asia/Hong_Kong");

// CORS to allow requests from any origin

$http_origin = $_SERVER['HTTP_ORIGIN'];
$allowed_http_origins = array(
    'capacitor://cu-bus.online',
    'ionic://cu-bus.online',
    "http://localhost:5173",
);
if (in_array($http_origin, $allowed_http_origins)) {
    @header("Access-Control-Allow-Origin: " . $http_origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");


$statusTmp = json_decode(file_get_contents(__DIR__ . "/../../Data/Status.json"), true);
$status = array_slice($statusTmp, -60, 60, true);
$output['Status.json'] = $status;
$output['reportedTime.json'] = renderTimetableReport();

header('Content-Type: application/json');
echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
