<?php

date_default_timezone_set("Asia/Hong_Kong");
include('../Essential/functions/functions.php');
include_once('../Essential/functions/loadenv.php');
include_once('./getRealTimeFunc.php');

$lang = $_POST['lang'] ?? 'en';
$dest = $_POST['Dest'] ?? '';


$initdataitems = [
    "Route" => true,
    "Translate" => true,
];
include('../Essential/functions/initdatas.php');

$busschedule = json_decode(file_get_contents('../Data/timetable.json'), true);
$busservices = json_decode(file_get_contents('../Data/Status.json'), true);

if ($_POST['loop'] !== 'loop') {
    logRealtimeRequest($dest, $lang);
}

$currentbusservices = end($busservices);
$thirtyminbusservice = array_slice($busservices, -60, 1)[0] ?? [];

if (isset($currentbusservices['ERROR'])) {
    // alert("alert", $translation["fetch-error"][$lang]);
    $bus = filterBusesBySchedule($bus);
} else {
    $bus = filterBusesBySchedule($bus);
    $bus = processBusStatus($currentbusservices, $thirtyminbusservice, $bus);
}

$outputschedule = array_filter($busschedule, fn($key) => explode("|", $key)[0] == $dest, ARRAY_FILTER_USE_KEY);

$allBuses = processAndSortBuses($outputschedule, $bus, $lang, $translation);

displayBuses($allBuses, $lang, $translation);

