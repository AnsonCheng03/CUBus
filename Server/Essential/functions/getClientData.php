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
$translationTables = ['translateroute', 'translatewebsite', 'translatebuilding', 'translateattribute'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handle initial GET request
    $modificationDates = array();
    foreach ($tables as $table) {
        $modificationDates[$table] = getTableDate($conn, $table);
    }

    header('Content-Type: application/json');
    echo json_encode($modificationDates);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle POST request
    $clientDates = json_decode(file_get_contents('php://input'), true);

    $output = array();
    $outdatedTables = array();

    if ($clientDates === null) {
        // Client sent null, return all data
        $outdatedTables = $tables;
    } else {
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
        $bus = array();
        $stmt = $conn->prepare("SELECT * FROM Route");
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $busno = $row['BUSNO'];
            $bus[$busno]["schedule"] = array($row['StartTime'], $row['EndTime'], $row['Period'], $row['Days'], $row['Weekdays'], $row['Warning']);
            $stations = json_decode($row['Route'], true);
            foreach ($stations as $station) {
                $bus[$busno]["stations"]["name"][] = $station[0];
                $bus[$busno]["stations"]["attr"][] = $station[1] ?? "NULL";
                $bus[$busno]["stations"]["time"][] = floatval($station[2] ?? "0");
            }
        }
        $output['bus'] = $bus;
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
        $stmt = $conn->prepare("SELECT * FROM station");
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $station[$row['最近之車站']][] = $row['建築物'];
        }
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
            $notice[$index]["pref"]["type"] = $row['Type'];
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
        }
        $output['GPS'] = $GPS;
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
        $output['WebsiteLinks'] = $WebsiteLinks;
    }

    // Add modification dates to the output
    $output['modificationDates'] = array();
    foreach ($tables as $table) {
        $output['modificationDates'][$table] = getTableDate($conn, $table);
    }

    // Set the content type to JSON
    header('Content-Type: application/json');

    // Output the JSON
    echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

$conn->close();