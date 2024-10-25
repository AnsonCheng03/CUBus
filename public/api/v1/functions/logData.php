<?php

include_once(__DIR__ . '/loadenv.php');

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Invalid request method');
}

$_POST = json_decode(file_get_contents("php://input"), true);

session_start();

if (
    isset($_POST['Token']) && $_POST['Token'] !== $_SESSION['token'] && $_POST['Token'] !== ""
) {
    die('Invalid token');
}


try {
    $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    if (!isset($_POST['type'])) {
        throw new Exception('Missing type');
    }

    switch ($_POST['type']) {
        case 'realtime':
            if (!isset($_POST['Dest']) || !isset($_POST['Lang'])) {
                throw new Exception('Missing parameters');
            }
            $stmt = $conn->prepare("INSERT INTO `logs` (`Time`, `Webpage`, `Dest`, `Lang`)
VALUES (?, 'realtime', ?, ?);");
            $stmt->bind_param("sss", $Time, $_POST['Dest'], $_POST['Lang']);
            $Time = (new DateTime())->format('Y-m-d H:i:s');
            $stmt->execute();
            $stmt->close();
            break;
        case 'search':
            if (!isset($_POST['Start']) || !isset($_POST['Dest']) || !isset($_POST['Departnow']) || !isset($_POST['Lang'])) {
                throw new Exception('Missing parameters');
            }
            $stmt = $conn->prepare("INSERT INTO `logs` (`Time`, `Webpage`, `Start`, `Dest`, `Departnow`, `Lang`)
                VALUES (?, 'routesearch', ?, ?, ?, ?);");
            $Time = (new DateTime())->format('Y-m-d H:i:s');
            $Startsql = $_POST['Start'];
            $Destsql = $_POST['Dest'];
            $stmt->bind_param("sssss", $Time, $Startsql, $Destsql, $_POST['Departnow'], $_POST['Lang']);
            $stmt->execute();
            $stmt->close();
            break;
        case 'reportArrival':
            if (!isset($_POST['Details']) || !isset($_POST['Details']['busNo']) || !isset($_POST['Details']['stationIndex'])) {
                throw new Exception('Missing parameters');
            }

            $Time = new DateTime();
            $BusNo = $_POST['Details']['busNo'];
            $StationIndex = $_POST['Details']['stationIndex'] + 1;

            echo "BusNo: $BusNo, StationIndex: $StationIndex";

            $stmt = $conn->prepare("SELECT * FROM RouteStops WHERE BUSNO = ? AND StopOrder >= ?");
            $stmt->bind_param("si", $BusNo, $StationIndex);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows == 0) {
                echo "No data found";
                $stmt->close();
                return;
            }
            $stmt->close();

            $values = [];
            $params = [];
            $reportedTime = clone $Time;
            $formattedTime = $Time->format('Y-m-d H:i:s');
            $firstEntry = true;

            // Construct query placeholders dynamically
            for (
                $i = 0, $row = $result->fetch_assoc();
                $i < $result->num_rows - 1;
                $i++, $row = $result->fetch_assoc()
            ) {
                $stationName = $row['Location'] . "|" . ($row['Direction'] ?? "");
                $stopOrder = $row['StopOrder'];
                $travelTime = $row['TravelTime'];

                // Calculate the new arrival time
                $reportedTime->modify("+" . floor($travelTime) . " seconds");
                $calculatedTimeStr = $reportedTime->format('Y-m-d H:i:s');

                // Set calculated flag: 0 for the first entry, 1 for others
                $calculatedBaseTime = $i == 0 ? NULL : $formattedTime;


                // Add placeholders for this row
                $values[] = "(?, ?, ?, ?, ?)";

                // Add each value to the params array
                $params[] = $calculatedTimeStr;
                $params[] = $BusNo;
                $params[] = $stationName;
                $params[] = $stopOrder;
                $params[] = $calculatedBaseTime;
            }

            // Only insert if we have values
            if (!empty($values)) {
                // Prepare the SQL statement with placeholders
                $insertSQL = "INSERT INTO reportArrival (Time, BusNo, stationName, StationIndex, calculatedBaseTime) VALUES " . implode(", ", $values);
                $stmt = $conn->prepare($insertSQL);

                // Dynamically bind all parameters
                $types = str_repeat("sssis", count($params) / 5); // 'ssii' for each row (string, string, integer, integer)
                $stmt->bind_param($types, ...$params);

                // Execute the prepared statement
                $stmt->execute();
                $stmt->close();
            }
            break;
        default:
            throw new Exception('Invalid type');
    }
} catch (Exception $e) {
    echo $e->getMessage();
    // throw new Exception('Failed to log data' . $e->getMessage() . "|" . print_r($_POST, true));
} finally {
    $conn->close();
}