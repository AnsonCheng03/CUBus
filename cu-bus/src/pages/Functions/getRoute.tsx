import { TFunction } from "i18next";

export interface BusData {
  [busNumber: string]: {
    schedule?: [
      string, // Start time
      string, // End time
      string, // Frequency
      string, // Days type (e.g., "TD,NT")
      string, // Days of the week
      string // Additional notes
    ];
    stations?: {
      name: string[];
      attr: string[];
      time: number[];
    };
    stats?: {
      status: string;
      prevstatus: string | null;
    };
    warning?: string;
  };
}

// if (!isset($_POST))
//     die();
// include_once('../Essential/functions/loadenv.php');

// /* Init Program */
// date_default_timezone_set("Asia/Hong_Kong");
// include('../Essential/functions/functions.php');
// $initdataitems = array(
//     "Route" => true,
//     "Translate" => true,
//     "Station" => true,
// );
// include('../Essential/functions/initdatas.php');
// include_once('../realtime/getRealTimeFunc.php');

// //Bus Status
// $busservices = json_decode(file_get_contents(__DIR__ . '/../Data/Status.json'), true);
// $busschedule = json_decode(file_get_contents(__DIR__ . '/../Data/timetable.json'), true);

// $temp = array_slice($busservices, -30, 1);
// $thirtyminbusservice = array_pop($temp);
// $currentbusservices = end($busservices);
// if (isset($currentbusservices['ERROR'])) {
//     $fetcherror = true;
//     // alert("alert", $translation["fetch-error"][$lang]);
// } else {
//     foreach ($currentbusservices as $busnumber => $busstatus) {
//         $bus[$busnumber]["stats"]["status"] = $busstatus;
//         $bus[$busnumber]["stats"]["prevstatus"] = $thirtyminbusservice[$busnumber];
//         if (isset($bus[$busnumber . "#"])) {
//             $bus[$busnumber . "#"]["stats"]["status"] = $busstatus;
//             $bus[$busnumber . "#"]["stats"]["prevstatus"] = $thirtyminbusservice[$busnumber];
//         }
//     }
// }

// $noroute = 0;
// $lang = $_POST['language'];
// $poststart = $_POST['Start'];
// $postdest = $_POST['Dest'];
// $postmode = $_POST['mode'];
// $posttravwk = $_POST['Trav-wk'];
// $posttravdt = $_POST['Trav-dt'];
// $posttravhr = $_POST['Trav-hr'];
// $posttravmin = $_POST['Trav-min'];
// $departnowbtn = isset($_POST['deptnow']);

// try {
//     $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
//     if ($conn->connect_error)
//         die("Connection failed: " . $conn->connect_error);
//     $stmt = $conn->prepare("INSERT INTO `logs` (`Time`, `Webpage`, `Start`, `Dest`, `Mode`, `Departnow`, `Lang`)
//         VALUES (?, 'routesearch', ?, ?, ?, ?, ?);");
//     $stmt->bind_param("ssssss", $Time, $Startsql, $Destsql, $postmode, $departnowbtn, $lang);
//     $Time = (new DateTime())->format('Y-m-d H:i:s');
//     $Startsql = $postmode == "building" ? $_POST['Startbd'] : $_POST['Start'];
//     $Destsql = $postmode == "building" ? $_POST['Destbd'] : $_POST['Dest'];
//     $stmt->execute();
//     $stmt->close();
//     $conn->close();
// } catch (Exception $e) {
// }

// Get Available Buses
// if (!$departnowbtn) {
//     foreach ($bus as $index => $busarr) {
//         //Base on time
//         $currenttime = (DateTime::createFromFormat("H:i", $posttravhr . ":" . $posttravmin))->getTimestamp();
//         $starttime = (DateTime::createFromFormat("H:i", $busarr["schedule"][0]))->getTimestamp();
//         $endtime = (DateTime::createFromFormat("H:i", $busarr["schedule"][1]))->getTimestamp();
//         if ($currenttime < $starttime || $currenttime > $endtime)
//             unset($bus[$index]);

//         // Base on weekday or day
//         if (strpos($busarr["schedule"][3], $posttravdt) === false && $busarr["schedule"][3] !== $posttravdt)
//             unset($bus[$index]);
//         if (strpos($busarr["schedule"][4], $posttravwk) === false)
//             unset($bus[$index]);
//     }
// } else {
//     foreach ($bus as $index => $busarr)
//         if (($busarr["stats"]["status"] == "no" && $busarr["stats"]["prevstatus"] != "normal") || ($busarr["stats"]["status"] == "suspended" && $busarr["stats"]["prevstatus"] != "normal"))
//             unset($bus[$index]);
// }
// $bus = array_filter($bus);

//Init
// $totalstart = $currstart = $totaldest = $currdest = 0;

// if ($postmode == "building") {

//     $poststartbd = strstr($_POST['Startbd'], ' (', true) ?: $_POST['Startbd'];
//     $postdestbd = strstr($_POST['Destbd'], ' (', true) ?: $_POST['Destbd'];

//     if ($poststartbd == "" || $postdestbd == "")
//         die("<div class='error-text'>" .
//             "<i class='fas fa-exclamation-triangle'></i>" .
//             "<p>" . $translation["warning-noinput"][$lang] . "</p></div>");

//     //Building name to Building Code
//     $flag[0] = $flag[1] = 0;
//     foreach (array_reverse($translation) as $buildingcode => $buildingname) {
//         foreach ($buildingname as $readablename) {
//             if ($readablename == $poststartbd) {
//                 $poststartbd = $buildingcode;
//                 $flag[0]++;
//             }
//             if ($readablename == $postdestbd) {
//                 $postdestbd = $buildingcode;
//                 $flag[1]++;
//             }
//             if ($flag[0] == 1 && $flag[1] == 1)
//                 break 2;
//         }
//     }

//     //Building to Station
//     $startstation = [];
//     $deststation = [];
//     foreach ($station as $stationcode => $val) {
//         foreach ($val as $building) {
//             if ($building == $poststartbd) {
//                 $totalstart++;
//                 $startstation[] = $stationcode;
//             }
//             if ($building == $postdestbd) {
//                 $totaldest++;
//                 $deststation[] = $stationcode;
//             }
//         }
//     }

//     $startstation = array_values(array_filter(array_unique($startstation)));
//     $deststation = array_values(array_filter(array_unique($deststation)));

//     //Check Error
//     if ($totalstart <= 0 || $totaldest <= 0)
//         die("<div class='error-text'>" .
//             "<i class='fas fa-exclamation-triangle'></i>" .
//             "<p>" . $translation["building-error"][$lang] . "</p></div>");
// } else {
//     $startstation = [$poststart];
//     $deststation = [$postdest];
// }

// function searchRoutes($startstation, $deststation, $bus, $translation, $lang)
// {
//     $totaldest = count($deststation);
//     $totalstart = count($startstation);
//     $samestation = false;
//     $routeresult = [
//         "busno" => [],
//         "start" => [],
//         "end" => [],
//         "time" => [],
//         "route" => [],
//         "routeIndex" => []
//     ];

//     for ($currdest = 0; $currdest < $totaldest; $currdest++) {
//         for ($currstart = 0; $currstart < $totalstart; $currstart++) {
//             if ($startstation[$currstart] == $deststation[$currdest]) {
//                 $samestation = true;
//                 continue;
//             }

//             foreach ($bus as $busno => $line) {
//                 $result = searchDirection($startstation[$currstart], $deststation[$currdest], $busno, $line["stations"]["name"], $line["stations"]["attr"], $line["stations"]["time"], $translation, $lang);
//                 foreach ($result as $newresult) {
//                     $routeresult = mergeRouteResults($routeresult, $newresult);
//                 }
//             }
//         }
//     }

//     return [
//         'samestation' => $samestation,
//         'routeresult' => $routeresult
//     ];
// }

// function searchDirection($start, $dest, $busno, $line, $attrline, $timeline, $translation, $lang)
// {
//     $possibilities = [];

//     // Find all occurrences of the start station
//     $startPositions = array_keys($line, $start);

//     foreach ($startPositions as $startPos) {
//         // Search for destination stations after each start position
//         $searchLine = array_slice($line, $startPos + 1);
//         $destPositions = array_keys($searchLine, $dest);

//         foreach ($destPositions as $relativeDestPos) {
//             // Build route result for this possibility
//             $routeResult = buildRouteResult(
//                 $busno,
//                 $start,
//                 $dest,
//                 $line,
//                 $attrline,
//                 $timeline,
//                 $startPos,
//                 $relativeDestPos,
//                 $translation,
//                 $lang,
//             );

//             if ($routeResult) {
//                 $possibilities[] = $routeResult;
//             }
//         }
//     }

//     return $possibilities;
// }

// function buildRouteResult($busno, $start, $dest, $line, $attrline, $timeline, $startIndex, $endIndex, $translation, $lang)
// {
//     // Build start position string
//     $startpos = $translation[$start][$lang];
//     if (isset($translation[$attrline[$startIndex] ?? ""][$lang])) {
//         $startpos .= " ({$translation[$attrline[$startIndex] ?? ""][$lang]})";
//     }

//     // Build end position string
//     $endpos = $translation[$dest][$lang];
//     $endposattr = "";
//     if (isset($translation[$attrline[$startIndex + $endIndex + 1] ?? ""][$lang])) {
//         $endposattr = " ({$translation[$attrline[$startIndex + $endIndex + 1] ?? ""][$lang]})";
//     }

//     // Build route
//     $route = json_encode(array_map(function ($index) use ($line, $attrline, $translation, $lang) {
//         return $translation[$line[$index]][$lang] .
//             ($attrline[$index] != "NULL" ? " (" . $translation[$attrline[$index]][$lang] . ")" : "");
//     }, range(0, $startIndex + $endIndex + 1)));

//     // Calculate total time
//     $totalTime = array_sum(array_slice($timeline, $startIndex, $endIndex - $startIndex + 1));

//     return [
//         "busno" => [$busno],
//         "start" => [[$startpos, $start, $attrline[$startIndex] ?? null]],
//         "end" => [$endpos . $endposattr],
//         "time" => [array_sum(array_slice($timeline, $startIndex, $endIndex + 2, true))],
//         "route" => [$route],
//         "routeIndex" => [$startIndex]
//     ];
// }

// function mergeRouteResults($existing, $new)
// {
//     foreach ($new as $key => $value) {
//         $existing[$key] = array_merge($existing[$key], $value);
//     }
//     return $existing;
// }

// $searchResult = searchRoutes($startstation, $deststation, $bus, $translation, $lang);

// if (empty($searchResult['routeresult'])) {
//     $searchResult['routeresult']["busno"] = array("N/A");
//     $searchResult['routeresult']["route"] = array($translation["No-BUS"][$lang] . ($departnowbtn ? "<br><br>" . ($bus ? $translation["warning-showbus"][$lang] . implode(", ", array_keys($bus)) : $translation['stop-running'][$lang]) : ""));
//     $noroute = 1;
// }

// //Group Result
// foreach ($searchResult['routeresult']["busno"] as $index => $startloc) {
//     //time process
//     ($searchResult['routeresult']["time"][$index] == 0) ? $timeoutput = "N/A" : $timeoutput = round($searchResult['routeresult']["time"][$index] / 60);
//     $routegroupresult[
//         $searchResult['routeresult']["start"][$index][1]
//     ][
//         $searchResult['routeresult']["busno"][$index]
//     ][] = array(
//         "end" => $searchResult['routeresult']["end"][$index],
//         "start" => array(
//             "translatedName" => $searchResult['routeresult']["start"][$index][0],
//             "attr" => $searchResult['routeresult']["start"][$index][2]
//         ),
//         "route" => $searchResult['routeresult']["route"][$index],
//         "routeIndex" => $searchResult['routeresult']["routeIndex"][$index],
//         "timeused" => $timeoutput
//     );
// }

// // Sort the results by time
// $sortedResults = [];
// if (isset($routegroupresult))
//     foreach ($routegroupresult as $start => $temp) {
//         // get all bus arrival times
//         $outputschedule = array_filter($busschedule, fn($key) => explode("|", $key)[0] == $start, ARRAY_FILTER_USE_KEY);

//         foreach ($temp as $busno => $busWithSameNo) {
//             foreach ($busWithSameNo as $busarray) {
//                 $time = $busarray["timeused"];
//                 if ($time == "N/A") {
//                     $time = PHP_INT_MAX; // Put "N/A" times at the end
//                 }

//                 // Get each bus arrival time
//                 $allBuses = processAndSortBuses($outputschedule, $bus, $lang, $translation, array(
//                     'busno' => $busno,
//                     'currtime' => $departnowbtn ? date('H:i:s') : date('H:i:s', strtotime($posttravhr . ":" . $posttravmin))
//                 ));

//                 foreach ($allBuses as $busdata) {
//                     $waitTime = (
//                         strtotime($busdata['time']) -
//                         ($departnowbtn ? strtotime(date('H:i:s')) : strtotime($posttravhr . ":" . $posttravmin))
//                     ) / 60;
//                     $waitTime = $waitTime < 0 ? 0 : intval($waitTime);

//                     if ($waitTime > 30) {
//                         continue;
//                     }

//                     $busarray["arrivalTime"] = date('H:i', strtotime($busdata['time']));

//                     $sortedResults[] = [
//                         'time' => $time + $waitTime,
//                         'busno' => $busno,
//                         'start' => $busarray["start"]["translatedName"],
//                         'end' => $busarray["end"],
//                         'route' => $busarray["route"],
//                         'timeDisplay' => $busarray["timeused"],
//                         'routeIndex' => $busarray["routeIndex"],
//                         'arrivalTime' => $busarray["arrivalTime"]
//                     ];
//                 }

//             }
//         }
//     }

// // Sort the results
// usort($sortedResults, function ($a, $b) {
//     if ($a['time'] == $b['time']) {
//         return strtotime($a['arrivalTime']) <=> strtotime($b['arrivalTime']);
//     }
//     return $a['time'] <=> $b['time'];
// });

// if ($searchResult['samestation']) {
//     echo '<p class="samestation-info">' . $translation["samestation-info"][$lang] . '</p>';
// }

// if ($sortedResults == null || $noroute) {
//     echo "<div class='error-text'>" .
//         "<i class='fas fa-exclamation-triangle'></i>" .
//         "<p>" . $translation["No-BUS"][$lang] . "</p></div>";
// } else {
//     echo "<div class='route-result'>";

//     foreach ($sortedResults as $result) {
//         $busnostr = explode("→", $result['busno']);
//         echo "<div class='route-result-busno'
//             onclick='createRouteMap(" . $result['route'] . ", " . $result['routeIndex'] . ")'>";
//         echo "<div class='route-result-busno-number'>" . $result['busno'] . "</div>";
//         echo "<div class='route-result-busno-details'>";
//         echo "<div class='route-result-busno-details-time'>";
//         echo "<div class='route-result-busno-details-totaltime'><p class='route-result-busno-details-totaltime-text'>" . $result['time'] . "</p> min</div>";
//         echo "<div class='route-result-busno-details-arrivaltime'>" . $translation["next-bus-arrival-info"][$lang] . $result['arrivalTime'] . ", " . $result['timeDisplay'] . $translation["bus-length-info"][$lang] . "</div>";
//         echo "</div>";
//         echo "<div class='route-result-busno-simple-route'>";
//         echo "<div class='route-result-busno-simple-route-start'>" . $result['start'] . "</div>";
//         echo "<div class='route-result-busno-simple-route-arrow'>➤</div>";
//         echo "<div class='route-result-busno-simple-route-end'>" . $result['end'] . "</div>";
//         echo "</div>";
//         // echo "<div class='route-result-busno-details-route'>" . $result['route'] . "</div>";
//         echo "</div>";
//         echo "</div>";
//     }
//     echo "</div>";
// }
