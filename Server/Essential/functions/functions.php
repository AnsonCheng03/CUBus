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


?>