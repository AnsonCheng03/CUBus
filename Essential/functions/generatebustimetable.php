<?php

date_default_timezone_set("Asia/Hong_Kong");

include(__DIR__ . '/functions.php');
include_once(__DIR__ . '/loadenv.php');

// Create connection
$conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
if ($conn->connect_error)
    die("Connection failed: " . $conn->connect_error);

// prepare and bind
$stmt = $conn->prepare("SELECT * FROM `Route`;");
$stmt->execute();

$result = $stmt->get_result();

for ($i = 0; $i < $result->num_rows; $i++) {
    $busResult = $result->fetch_assoc();
    $bus[$busResult["BUSNO"]]["schedule"] = array($busResult["StartTime"], $busResult["EndTime"], $busResult["Period"], $busResult["Days"], $busResult["Weekdays"], $busResult["AddTime"]);
    $stations = json_decode($busResult["Route"], true);
    foreach ($stations as $key => $value) {
        $bus[$busResult["BUSNO"]]["stations"]["name"][] = $value[0] ?: "NULL";
        $bus[$busResult["BUSNO"]]["stations"]["attr"][] = $value[1] ?: "NULL";
        $bus[$busResult["BUSNO"]]["stations"]["time"][] = $value[2] ?: 0;
    }
}



foreach ($bus as $busnum => $busno) {
    //Create Timeslots
    $starthr = intval(preg_replace('/[^0-9.]+/', '', strstr($busno["schedule"][0], ':', true)));
    $startmin = intval(preg_replace('/[^0-9.]+/', '', substr(strstr($busno["schedule"][0], ':', false), 1)));
    $endhr = intval(preg_replace('/[^0-9.]+/', '', strstr($busno["schedule"][1], ':', true)));
    $endmin = intval(preg_replace('/[^0-9.]+/', '', substr(strstr($busno["schedule"][1], ':', false), 1)));
    $alltime = explode(',', $busno["schedule"][2]);
    foreach ($alltime as $starttime) {
        $starttime = intval(preg_replace('/[^0-9.]+/', '', $starttime));
        for ($i = $starthr; $i <= $endhr; $i++) {
            if (($i !== $starthr && $i !== $endhr) || ($i == $endhr && $endmin >= $starttime) || ($i == $starthr && $startmin <= $starttime)) {
                $starthour = str_pad($i, 2, '0', STR_PAD_LEFT);
                $starttime = str_pad($starttime, 2, '0', STR_PAD_LEFT);
                $timetable[] = strtotime(DateTime::createFromFormat('H:i', $starthour . ":" . $starttime)->format('Y-m-d H:i:s'));
            }
        }
    }
    if ($busno["schedule"][5]) {
        foreach (explode("|", $busno["schedule"][5]) as $addtime) {
            $timetable[] = strtotime(DateTime::createFromFormat('H:i', $addtime)->format('Y-m-d H:i:s'));
        }
    }
    sort($timetable);
    foreach ($timetable as $timeindex => $timevalue) {
        foreach ($busno["stations"]["name"] as $index => $stationname) {
            if ($index == 0)
                $bus[$busnum]["stations"]["arrivaltime"][$index][$timeindex] = $timevalue;
            if ($index > 0)
                $bus[$busnum]["stations"]["arrivaltime"][$index][$timeindex] = $bus[$busnum]["stations"]["time"][$index - 1] + $bus[$busnum]["stations"]["arrivaltime"][$index - 1][$timeindex];
        }
    }
    unset($timetable);
}

$bustime = [];



if (isset($_SERVER['REMOTE_ADDR'])) {

    if (isset($_REQUEST['bystation'])) {
        foreach ($bus as $busno => $busline) {
            array_pop($busline["stations"]["arrivaltime"]);
            foreach ($busline["stations"]["arrivaltime"] as $index => $stationn) {
                foreach ($stationn as $indx => $times) {
                    $stopname = $busline["stations"]["name"][$index] . "|" . ($busline["stations"]["attr"][$index] == "NULL" ? "" : $busline["stations"]["attr"][$index]);
                    $bustime[$stopname][$busno][] = date("H:i:s", $times);
                }
            }
        }
        print_r("<pre>" . json_encode($bustime, JSON_PRETTY_PRINT) . "</pre>");
    } else {
        foreach ($bus as $busno => $busline) {
            foreach ($busline["stations"]["arrivaltime"] as $index => $stationn) {
                foreach ($stationn as $indx => $times) {
                    $stopname = $busline["stations"]["name"][$index] . "|" . ($busline["stations"]["attr"][$index] == "NULL" ? "" : $busline["stations"]["attr"][$index]);
                    $bustime[$busno][$stopname][] = date("H:i:s", intval($times));
                }
            }
        }
        print_r("<pre>" . json_encode($bustime, JSON_PRETTY_PRINT) . "</pre>");
    }
} else {
    foreach ($bus as $busno => $busline) {
        array_pop($busline["stations"]["arrivaltime"]);
        foreach ($busline["stations"]["arrivaltime"] as $index => $stationn) {
            foreach ($stationn as $indx => $times) {
                $stopname = $busline["stations"]["name"][$index] . "|" . ($busline["stations"]["attr"][$index] == "NULL" ? "" : $busline["stations"]["attr"][$index]);
                $bustime[$stopname][$busno][] = date("H:i:s", $times);
            }
        }
    }
    file_put_contents(__DIR__ . '/../../Data/timetable.json', json_encode($bustime, JSON_PRETTY_PRINT));
}
