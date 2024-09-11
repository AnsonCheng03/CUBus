<?php
function logRealtimeRequest($dest, $lang)
{
    $conn = connectToDatabase();
    $stmt = $conn->prepare("INSERT INTO `logs` (`Time`, `Webpage`, `Dest`, `Lang`) VALUES (NOW(), 'realtime', ?, ?)");
    $stmt->bind_param("ss", $dest, $lang);
    $stmt->execute();
    $stmt->close();
    $conn->close();
}

function filterBusesBySchedule($bus)
{
    return array_filter($bus, function ($busarr) {
        $weekday = "WK-" . date('D');
        return strpos($busarr["schedule"][4], $weekday) !== false;
    });
}

function processBusStatus($currentbusservices, $thirtyminbusservice, $bus)
{
    foreach ($currentbusservices as $busnumber => $busstatus) {
        $bus[$busnumber]["stats"] = [
            "status" => $busstatus,
            "prevstatus" => $thirtyminbusservice[$busnumber] ?? null
        ];
        if (isset($bus[$busnumber . "#"])) {
            $bus[$busnumber . "#"]["stats"] = $bus[$busnumber]["stats"];
        }
    }
    // Instead of filtering out buses, we'll keep them all and add a warning flag
    foreach ($bus as $busnumber => &$busarr) {
        if ($busarr["stats"]["status"] == "no" && $busarr["stats"]["prevstatus"] != "normal") {
            $busarr["warning"] = "No-bus-available";
        } else if ($busarr["stats"]["status"] != "normal") {
            $busarr["warning"] = "Bus-status-unusual";
        }
    }
    return $bus;
}

function processAndSortBuses($outputschedule, $bus, $lang, $translation, $pref = null)
{
    // pref: [currtime: string(H:i:s), busno: string]
    $allBuses = [];
    $nowtime = date('H:i:s');
    $currtime = isset($pref['currtime']) ? $pref['currtime'] : date('H:i:s', strtotime("-5 minutes"));

    foreach ($outputschedule as $stationname => $schedule) {
        foreach ($schedule as $busno => $timetable) {
            if (
                isset($pref['busno'])
                && $busno != $pref['busno']
            ) {
                continue;
            }

            if (isset($bus[$busno]) && $timetable) {
                $warning = $bus[$busno]['warning'] ?? false;
                $nextStation = getNextStation($bus[$busno]['stations'] ?? [], $stationname, $translation, $lang);
                $allBuses = array_merge($allBuses, getScheduledTimes($timetable, $busno, $stationname, $currtime, $nowtime, $lang, $translation, $warning, $nextStation));
            }
        }
    }

    usort($allBuses, fn($a, $b) => strtotime($a['time']) - strtotime($b['time']));
    return $allBuses;
}

function getNextStation($stations, $currentStation, $translation, $lang)
{
    [$currentStationName, $currentStationAttr] = explode('|', $currentStation) + [1 => null];

    $foundIndex = -1;

    if (isset($stations['name']))
        foreach ($stations['name'] as $index => $name) {
            if (
                $name === $currentStationName &&
                ($currentStationAttr == null || $stations['attr'][$index] === $currentStationAttr)
            ) {
                $foundIndex = $index;
                break;
            }
        }

    if ($foundIndex === -1 || $foundIndex === count($stations['name']) - 1) {
        return null;
    }

    // return array_slice($stations['name'], $foundIndex + 1, count($stations['name']) - $foundIndex);
    $route = array_map(function ($index) use ($stations, $translation, $lang) {
        return $translation[$stations['name'][$index]][$lang]
            . ($stations['attr'][$index] != "NULL" ? " (" . $translation[$stations['attr'][$index]][$lang] . ")" : "");

    }, array_keys($stations['name']));

    return array(
        'route' => $route,
        'stationName' => $stations['name'][$foundIndex + 1],
        'startIndex' => $foundIndex
    );
}
function connectToDatabase()
{
    $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $conn->query("SET SESSION time_zone = '+8:00'");
    return $conn;
}


function getScheduledTimes($timetable, $busno, $stationname, $currtime, $nowtime, $lang, $translation, $warning, $nextStation)
{
    $scheduledTimes = [];
    foreach ($timetable as $time) {
        if ($time >= $currtime) {
            // use array_push instead of $scheduledTimes[] to avoid reindexing
            array_push($scheduledTimes, [
                'busno' => $busno,
                'direction' => (explode("|", $stationname)[1] ? $translation[explode("|", $stationname)[1]][$lang] : $translation["mode-realtime"][$lang]),
                'time' => substr($time, 0, -3),
                'arrived' => ($time <= $nowtime),
                'warning' => $warning,
                'nextStation' => $nextStation
            ]);
        }
    }
    return $scheduledTimes;
}

function displayBuses($allBuses, $lang, $translation)
{
    echo "<div class='bus-grid'>";
    $countoutput = 0;

    foreach ($allBuses as $bus) {
        if ($countoutput >= 10)
            break;

        $busName = $bus['busno'];
        $direction = $bus['direction'] !== $translation["mode-realtime"][$lang] ? "<br>" . $bus['direction'] : "";
        $arrivalTime = $bus['time'];

        echo "<div class='bus-row" . ($bus['arrived'] ? ' arrived' : '') . "' 
            onclick='createRouteMap(" . json_encode($bus['nextStation']['route']) . ", " . $bus['nextStation']['startIndex'] . ")'>";
        echo "<div class='bus-info'><span class='bus-name'>" . $busName . "</span><span class='direction'>$direction</span></div>";
        echo "<div class='next-station-display'>";
        echo "<p class='next-station-text'>" . $translation["next-station"][$lang] . "</p>";
        if ($bus['nextStation']) {
            echo "<p class='next-station'>" . $translation[$bus['nextStation']['stationName']][$lang] . "</p>";
        }
        if ($bus['warning']) {
            echo "<span></span><span class='warning'>" . htmlspecialchars($translation[$bus['warning']][$lang]) . "</span>";
        }
        echo "</div>";
        echo "<div class='arrival-time'>" . htmlspecialchars($arrivalTime) . "</div>";
        echo "</div>";

        if (!$bus['arrived'])
            $countoutput++;
    }
    echo "</div>";

    if ($countoutput == 0) {
        echo '<div class="no-bus"><div class="no-bus-icon"><i class="fa-solid fa-ban"></i></div>';
        echo '<p>' . htmlspecialchars($translation["No-bus-time"][$lang]) . '</p></div>';
    }
}