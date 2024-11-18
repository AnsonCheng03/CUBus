<?php

function consolelog($output, $with_script_tags = true)
{
  $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) .
    ');';
  if ($with_script_tags) {
    $js_code = '<script>' . $js_code . '</script>';
  }
  echo $js_code;
}

function urlquery($key, $default = '', $data_type = '')
{
  $param = (isset($_REQUEST[$key]) ? $_REQUEST[$key] : $default);

  if (!is_array($param) && $data_type == 'int') {
    $param = intval($param);
  }

  return $param;
}

function alert($img, $msg)
{
  $icon = glob("Images/" . strtolower($img) . ".*");
  $content = $msg;
  if (isset($icon[0]) && $content != "") {
    echo '<div class="alert-box">' .
      '<table><tr>' .
      '<td>' .
      '<img src="' . $icon[0] . '" width="50%">' .
      '</td>' .
      '<td>' .
      $content .
      '</td>' .
      '</tr></table></div>';
  }
}

function csv_to_array($filename)
{
  $arr = array();
  $row = -1;
  if (($handle = fopen($filename . ".csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $num = count($data);
      $row++;
      for ($c = 0; $c < $num; $c++) {
        $arr[$row][$c] = $data[$c];
      }
    }
    fclose($handle);
  }
  return $arr;
}

function slidingWindowGroupAndAverage($data)
{
  $result = [];
  $intervalInSeconds = 150; // ±2.5 minutes in seconds
  // $currentStrtoTime = strtotime(date()->modify('-10 minutes')->format('Y-m-d H:i:s'));
  $currentStrtoTime = strtotime('-10 minutes');
  foreach ($data as $busNo => $stations) {

    foreach ($stations as $stationIndex => $entries) {
      $groupedData = [];
      $window = [];
      $windowSum = 0;
      $windowCount = 0;
      $groupIndex = -1;

      foreach ($entries as $entry) {


        $entryTime = strtotime($entry['time']);
        if ($entryTime <= $currentStrtoTime) {
          continue;
        }

        // Remove outdated entries from the window
        while (!empty($window) && ($entryTime - $window[0]['time']) > $intervalInSeconds) {
          $removedEntry = array_shift($window);
          $windowSum -= $removedEntry['time'];
          $windowCount--;
        }

        // Add the current entry to the window
        $window[] = ['location' => $entry['location'], 'time' => $entryTime];
        $windowSum += $entryTime;
        $windowCount++;

        if (count($window) === 1) {
          $groupIndex++;
        }

        // Calculate the average time for the current window
        $averageTime = date('H:i:s', round($windowSum / $windowCount));

        $groupedData[$groupIndex] = [
          'count' => $windowCount,
          'average_time' => $averageTime,
        ];
      }

      // Store the grouped data by station index and bus number
      if (count($groupedData) > 0)
        $result[$entry['location']][$busNo] = $groupedData;
    }
  }
  return $result;
}

function renderTimetableReport()
{

  try {
    // Create connection
    $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
    if ($conn->connect_error)
      die("Connection failed: " . $conn->connect_error);

    $deleteStmt = $conn->prepare("
            DELETE FROM `reportArrival`
                WHERE Time < CONVERT_TZ(NOW(), '+00:00', '+08:00') - INTERVAL 30 MINUTE
                AND calculatedBaseTime IS NOT NULL;
        ");
    $deleteStmt->execute();
    $deleteStmt->close();

    // prepare and bind
    $stmt = $conn->prepare("
            SELECT * FROM `reportArrival`
        ");
    $stmt->execute();
    $result = $stmt->get_result();

    $bustime = array();

    while ($row = $result->fetch_assoc()) {
      $busno = $row['BusNo'];
      $location = $row['stationName'];
      $StationIndex = $row['StationIndex'];
      $time = new DateTime($row['Time']);
      $calculated = $row['calculatedBaseTime'];


      $bustime[$busno][$StationIndex][] = array(
        'location' => $location,
        'time' => $time->format('Y-m-d H:i:s'),
        'calculated' => $calculated
      );
    }

    return slidingWindowGroupAndAverage($bustime);

  } catch (Exception $e) {
    return array();
  } finally {
    $stmt->close();
    $conn->close();
  }
}

?>