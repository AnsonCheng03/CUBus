<?php
include_once(__DIR__ . '/loadenv.php');


if (!isset($initdataitems))
    $initdataitems = array(
        "Route" => true,
        "Translate" => true,
        "JSTranslate" => true,
        "Station" => true,
        "Notice" => true,
        "GPS" => true,
        "JSGPS" => true,
        "Websites" => true
    );

$conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
if ($conn->connect_error)
    die("Connection failed: " . $conn->connect_error);


if ($initdataitems["Route"] === true) {
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
}

if (isset($initdataitems["Translate"]) && $initdataitems["Translate"] === true) {
    $stmt = $conn->prepare("SELECT * FROM translateroute UNION SELECT * FROM translatebuilding");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $translation[$row['Code']] = array($row['ENG'], $row['中文']);
    }

    $stmt = $conn->prepare("SELECT * FROM translatewebsite UNION SELECT * FROM translatebuilding");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $translation[$row['Code']] = array($row['ENG'], $row['中文']);
    }

    $stmt = $conn->prepare("SELECT * FROM translatebuilding UNION SELECT * FROM translatebuilding");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $translation[$row['Code']] = array($row['ENG'], $row['中文']);
    }

    $stmt = $conn->prepare("SELECT * FROM translateattribute UNION SELECT * FROM translatebuilding");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $translation[$row['Code']] = array($row['ENG'], $row['中文']);
    }
}

if (isset($initdataitems["Station"]) && $initdataitems["Station"] === true) {
    $stmt = $conn->prepare("SELECT * FROM station");
    $stmt->execute();
    $result = $stmt->get_result();
    if (isset($station))
        unset($station);
    while ($row = $result->fetch_assoc()) {
        $station[$row['最近之車站']][] = $row['建築物'];
    }
}

if (isset($initdataitems["Notice"]) && $initdataitems["Notice"] === true) {
    $stmt = $conn->prepare("SELECT * FROM notice");
    $stmt->execute();
    $result = $stmt->get_result();
    $index = 0;
    while ($row = $result->fetch_assoc()) {
        $notice[$index]["content"] = [$row['CHINESE'], $row['ENGLISH']];
        $notice[$index]["pref"]["type"] = $row['Type'];
        $index++;
    }
}

if (isset($initdataitems["GPS"]) && $initdataitems["GPS"] === true) {
    $stmt = $conn->prepare("SELECT * FROM gps");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $GPS[$row['Location']]["Lat"] = $row['Lat'];
        $GPS[$row['Location']]["Lng"] = $row['Lng'];
    }
}

if (isset($initdataitems["Websites"]) && $initdataitems["Websites"] === true) {
    $stmt = $conn->prepare("SELECT * FROM website");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($row['URL'] !== "" && substr($row['URL'], 0, 2) !== "//") {
            $WebsiteLinks[] = [[$row['英文'], $row['中文']], $row['URL']];
        }
    }
}


//Load building name to js
if (
    isset($initdataitems["JSTranslate"]) &&
    $initdataitems["JSTranslate"] === true
) {
    echo "<script>const Translation = [];";

    foreach ($translation as $name => $value)
        if (end($value))
            echo 'Translation["' . $name . '"] = "' . $value[$lang] . '";' . "\n";

    echo "</script>";
}

if (
    isset($initdataitems["JSGPS"]) &&
    $initdataitems["JSGPS"] === true
) {
    echo "\n<script>const GPSdata = [";



    foreach ($GPS as $name => $location) {
        $nameattr = substr(strstr($name, '|', false), 1) ?: "";
        $name = strstr($name, '|', true) ?: $name;

        try {
            if ($location["Lat"] . $location["Lng"])
                echo "{ \"location\": \"" . $translation[$name][$lang] . "\",  \"lat\": \"" . $location["Lat"] . "\",  \"lng\": \"" . $location["Lng"] . "\", \"attr\" : \"" . (isset($translation[$nameattr][$lang]) ?? $translation[$nameattr][$lang]) . "\" , \"code\" : \"" . $name . "\"  }, \n";
        } catch (Exception $e) {
        }
    }

    echo "];</script>";
}
