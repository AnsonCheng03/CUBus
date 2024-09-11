<?php

include_once(__DIR__ . '/loadenv.php');

// CORS to allow requests from any origin
header("Access-Control-Allow-Origin: *");


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

if (isset($initdataitems["Translate"]) && $initdataitems["Translate"] === true) {
    $translation = array();
    $tables = array("translateroute", "translatewebsite", "translatebuilding", "translateattribute");

    foreach ($tables as $table) {
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
    foreach ($translation as $code => $langs) {
        $en_translations[$code] = $langs['en'];
    }

    // Create Chinese translations
    $zh_translations = array();
    foreach ($translation as $code => $langs) {
        $zh_translations[$code] = $langs['zh'];
    }

    // Prepare the final output
    $output = array(
        'en' => $en_translations,
        'zh' => $zh_translations
    );

    // Set the content type to JSON
    header('Content-Type: application/json');

    // Output the JSON
    echo json_encode($output, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

