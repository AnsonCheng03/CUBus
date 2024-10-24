<?php

include_once(__DIR__ . '/loadenv.php');

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
        default:
            throw new Exception('Invalid type');
    }
} catch (Exception $e) {
    echo $e->getMessage();
    // throw new Exception('Failed to log data' . $e->getMessage() . "|" . print_r($_POST, true));
} finally {
    $conn->close();
}