<?php

include_once(__DIR__ . '/loadenv.php');

// CORS to allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to get last modification date of a table
function getTableDate($conn, $table)
{
    $stmt = $conn->prepare("SELECT UPDATE_TIME, CREATE_TIME FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?");
    $dbName = getenv('DB_NAME');
    $stmt->bind_param("ss", $dbName, $table);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return $row['UPDATE_TIME'] ?? $row['CREATE_TIME'] ?? null;
}

// Tables to check
$tables = ['Route', 'translateroute', 'translatewebsite', 'translatebuilding', 'translateattribute', 'station', 'notice', 'gps', 'website'];
$dataFiles = ['Status.json', 'timetable.json'];
$translationTables = ['translateroute', 'translatewebsite', 'translatebuilding', 'translateattribute'];

if (
    $_SERVER['REQUEST_METHOD'] === 'GET' && empty($_GET)
) {
    // Handle initial GET request
    $modificationDates = array();
    foreach ($tables as $table) {
        $modificationDates[$table] = getTableDate($conn, $table);
    }
    // Add modification dates for data files
    foreach ($dataFiles as $file) {
        $modificationDates[$file] = date("Y-m-d H:i:s", filemtime(__DIR__ . "/../../data/$file"));
    }

    header('Content-Type: application/json');
    echo json_encode($modificationDates);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['force'])) {
    // Handle POST request
    $clientDates = json_decode(file_get_contents('php://input'), true);

    $output = array();
    $outdatedTables = array();

    if ($clientDates === null) {
        // Client sent null, return all data
        $outdatedTables = $tables;
        // add data files
        $outdatedTables = array_merge($outdatedTables, $dataFiles);
    } else {
        // check files
        foreach ($dataFiles as $file) {
            if (!isset($clientDates[$file]) || $clientDates[$file] < date("Y-m-d H:i:s", filemtime(__DIR__ . "/../../data/$file"))) {
                $outdatedTables[] = $file;
            }
        }

        // Compare dates and determine which tables need updating
        foreach ($tables as $table) {
            $serverDate = getTableDate($conn, $table);
            if ($serverDate !== null && (!isset($clientDates[$table]) || $clientDates[$table] < $serverDate)) {
                $outdatedTables[] = $table;
            }
        }

        // Special handling for translation tables
        if (count(array_intersect($translationTables, $outdatedTables)) > 0) {
            $outdatedTables = array_merge($outdatedTables, $translationTables);
        }
        $outdatedTables = array_unique($outdatedTables);

    }

    // Fetch data for outdated tables
    if (in_array('Route', $outdatedTables)) {
        $stmt = $conn->prepare("
            SELECT r.BUSNO, r.StartTime, r.EndTime, r.Period, r.Days, r.Weekdays, r.Warning, r.colorCode,
                rs.Location, rs.Direction, rs.TravelTime
            FROM Route r
            LEFT JOIN RouteStops rs ON r.BUSNO = rs.BUSNO
            ORDER BY r.BUSNO, rs.StopOrder
        ");
        $stmt->execute();
        $result = $stmt->get_result();

        $bus = array();
        while ($row = $result->fetch_assoc()) {
            $busno = $row['BUSNO'];

            // Initialize bus info if not already done
            if (!isset($bus[$busno])) {
                $bus[$busno]["schedule"] = array($row['StartTime'], $row['EndTime'], $row['Period'], $row['Days'], $row['Weekdays'], $row['Warning']);
                $bus[$busno]['colorCode'] = $row['colorCode'] ?? "rgb(254, 250, 183)";
                $bus[$busno]["stations"] = [
                    "name" => [],
                    "attr" => [],
                    "time" => []
                ];
            }

            // Fetch station details
            if ($row['Location']) {
                $bus[$busno]["stations"]["name"][] = $row['Location'];
                $bus[$busno]["stations"]["attr"][] = $row['Direction'] ?? "NULL";
                $bus[$busno]["stations"]["time"][] = floatval($row['TravelTime'] ?? "0");
            }
        }
        $output['Route'] = $bus;
    }

    if (count(array_intersect($translationTables, $outdatedTables)) > 0) {
        $translation = array();
        foreach ($translationTables as $table) {
            $stmt = $conn->prepare("SELECT * FROM $table");
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $translation[$row['Code']] = array(
                    'en' => $row['ENG'],
                    'zh' => $row['中文']
                );
            }
        }

        // Create English translations
        $en_translations = array();
        $zh_translations = array();
        foreach ($translation as $code => $langs) {
            $en_translations[$code] = $langs['en'];
            $zh_translations[$code] = $langs['zh'];
        }

        // Prepare the final output
        $output['translation'] = array(
            'en' => $en_translations,
            'zh' => $zh_translations
        );
    }

    if (in_array('station', $outdatedTables)) {
        $station = array();

        // Updated SQL query with the new logic
        $stmt = $conn->prepare("
        SELECT s.建築物, 
        CASE 
            WHEN s.Area IS NOT NULL THEN gs.Station
            ELSE s.最近之車站
        END AS 最近之車站
        FROM station s
        LEFT JOIN groupedStation gs
        ON s.Area = gs.Area
    ");

        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            // Store data in the array, same as before
            $station[$row['最近之車站']][] = $row['建築物'];
        }

        // Save the output
        $output['station'] = $station;
    }

    if (in_array('notice', $outdatedTables)) {
        $notice = array();
        $stmt = $conn->prepare("SELECT * FROM notice");
        $stmt->execute();
        $result = $stmt->get_result();
        $index = 0;
        while ($row = $result->fetch_assoc()) {
            $notice[$index]["content"] = [$row['CHINESE'], $row['ENGLISH']];
            $notice[$index]["id"] = $row['ID'];
            $notice[$index]["pref"]["type"] = isset($row['type']) ? $row['type'] : "";
            $notice[$index]["pref"]["hide"] = isset($row['hide']) ? $row['hide'] : "";
            $notice[$index]["pref"]["link"] = isset($row['link']) ? $row['link'] : "";
            $notice[$index]["pref"]["dismissible"] = isset($row['dismissible']) ? $row['dismissible'] : "";
            $notice[$index]["pref"]["saveDismiss"] = isset($row['saveDismiss']) ? $row['saveDismiss'] : "";
            $notice[$index]["pref"]["duration"] = isset($row['duration']) ? $row['duration'] : "";
            $index++;
        }
        $output['notice'] = $notice;
    }

    if (in_array('gps', $outdatedTables)) {
        $GPS = array();
        $stmt = $conn->prepare("SELECT * FROM gps");
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $GPS[$row['Location']]["Lat"] = $row['Lat'];
            $GPS[$row['Location']]["Lng"] = $row['Lng'];
            $GPS[$row['Location']]["ImportantStation"] = $row['ImportantStation'];
        }
        $output['gps'] = $GPS;
    }

    if (in_array('website', $outdatedTables)) {
        $WebsiteLinks = array();
        $stmt = $conn->prepare("SELECT * FROM website");
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            if ($row['URL'] !== "" && substr($row['URL'], 0, 2) !== "//") {
                $WebsiteLinks[] = [[$row['英文'], $row['中文']], $row['URL']];
            }
        }
        $output['website'] = $WebsiteLinks;
    }

    // if (in_array('Status.json', $outdatedTables)) {
    $output['Status.json'] = json_decode(file_get_contents(__DIR__ . "/../../Data/Status.json"), true);
    // }

    if (in_array('timetable.json', $outdatedTables)) {
        $output['timetable.json'] = json_decode(file_get_contents(__DIR__ . "/../../Data/timetable.json"), true);
    }

    // Add modification dates to the output
    $output['modificationDates'] = array();
    foreach ($tables as $table) {
        $output['modificationDates'][$table] = getTableDate($conn, $table);
    }
    // Add modification dates for data files
    foreach ($dataFiles as $file) {
        $output['modificationDates'][$file] = date("Y-m-d H:i:s", filemtime(__DIR__ . "/../../data/$file"));
    }

    $output['fetchTime'] = date("Y-m-d H:i:s");

    // Set the content type to JSON
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json');

        // Output the JSON
        echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        // Download as separate files
        foreach ($output as $key => $value) {
            echo '<body><script>
                var a = document.createElement("a");    
                a.href = "data:application/json;charset=utf-8,' . rawurlencode(json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '";
                a.download = "' . $key . '";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            </script></body>';

        }
    }
}

$conn->close();