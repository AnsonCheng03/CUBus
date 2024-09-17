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








function connectToDatabase()
{
    $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $conn->query("SET SESSION time_zone = '+8:00'");
    return $conn;
}

