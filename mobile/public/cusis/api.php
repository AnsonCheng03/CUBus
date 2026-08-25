<?php


session_start();
if (!$_SESSION['wrongpwcount'])
    $_SESSION['wrongpwcount'] = 0;
else 
        if ($_SESSION['wrongpwcount'] > 5) {
    http_response_code(201);
    die("<body style=\"margin:0;padding:0;display:flex;align-items: center;justify-content: center;font-size:2rem;\"><div style='text-align:center;'>密碼錯誤次數過多。<br>連線已被封鎖，請稍後再試。</div>" . ($_SERVER['REQUEST_METHOD'] == "POST" ? "<script>setTimeout(() => {window.location.replace(\"index.html\");},5000)</script>" : ""));
}

header('Access-Control-Allow-Origin: https://ansoncheng03.github.io');
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

function encrypt($plaintext)
{
    $password = "e3ded030ce294235047550b8f69f5a28";
    $iv = "e0b2ea987a832e24";
    return base64_encode(openssl_encrypt($plaintext, "AES-256-CBC", $password, OPENSSL_RAW_DATA, $iv));
}

function curldata($url, $xmlRequest)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $headers = [
        "Content-Type: text/xml; charset=utf-8",
        "User-Agent: ClassTT/2.4 CFNetwork/1333.0.4 Darwin/21.5.0"
    ];
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $xmlRequest);
    $resp = curl_exec($curl);
    curl_close($curl);
    return $resp;
}

if (!$_REQUEST['SID'] || !$_REQUEST['pwd']) {
    http_response_code(201);
    die("<body style=\"margin:0;padding:0;display:flex;align-items: center;justify-content: center;font-size:2rem;\"><div>請輸入SID及密碼</div>");
}

$xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><GetTimeTable xmlns=\"http://tempuri.org/\"><asP1>" . $_REQUEST['SID'] . "</asP1><asP2>" . $_REQUEST['pwd'] . "</asP2><asP3>hk.edu.cuhk.ClassTT</asP3></GetTimeTable></soap:Body></soap:Envelope>";
$responddata = json_decode(strip_tags(curldata("https://campusapps.itsc.cuhk.edu.hk/store/CLASSSCHD/STT.asmx", $xml)), true);

if (!$responddata) {
    $xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><GetTimeTable xmlns=\"http://tempuri.org/\"><asP1>" . encrypt($_REQUEST['SID']) . "</asP1><asP2>" . encrypt($_REQUEST['pwd']) . "</asP2><asP3>hk.edu.cuhk.ClassTT</asP3></GetTimeTable></soap:Body></soap:Envelope>";
    $responddata = json_decode(strip_tags(curldata("https://campusapps.itsc.cuhk.edu.hk/store/CLASSSCHD/STT.asmx", $xml)), true);
    if (!$responddata) {
        http_response_code(201);
        $_SESSION['wrongpwcount']++;
        if ($_SESSION['wrongpwcount'] > 5) {
            http_response_code(201);
            die("<body style=\"margin:0;padding:0;display:flex;align-items: center;justify-content: center;font-size:2rem;\"><div style='text-align:center;'>密碼錯誤次數過多。<br>連線已被封鎖，請稍後再試。</div>" . ($_SERVER['REQUEST_METHOD'] == "POST" ? "<script>setTimeout(() => {window.location.replace(\"index.html\");},5000)</script>" : ""));
        } else {
            die("<body style=\"margin:0;padding:0;display:flex;align-items: center;justify-content: center;font-size:2rem;\"><div>帳戶名稱或密碼錯誤</div>" . ($_SERVER['REQUEST_METHOD'] == "POST" ? "<script>setTimeout(() => {window.location.replace(\"index.html\");},2500)</script>" : ""));
        }
    }
}

$_SESSION['wrongpwcount'] = 0;
if ($_SERVER['REQUEST_METHOD'] == "POST") {
    header('Content-Type: text/calendar; charset=utf-8');
    header('Content-Disposition: attachment; filename=cuhktimetable.ics');
    $currentdatetime = (new DateTime(''))->format("Ymd\THis\Z");

    echo "BEGIN:VCALENDAR\nPRODID:-//CUSIS//Timetable//EN\nDESCRIPTION:CUSIS Timetable\nCALSCALE:GREGORIAN\nVERSION:2.0\nTZID:Asia/Hong_Kong\nX-WR-TIMEZONE:Asia/Hong_Kong\nX-LIC-LOCATION:Asia/Hong_Kong\nX-APPLE-CALENDAR-COLOR:#FF2968\nX-WR-CALNAME:CUHK Timetable\nBEGIN:VTIMEZONE\nTZID:Asia/Hong_Kong\nX-LIC-LOCATION:Asia/Hong_Kong\nBEGIN:STANDARD\nTZOFFSETFROM:+073636\nTZOFFSETTO:+0800\nTZNAME:HKT\nDTSTART:19041030T000000\nRDATE:19041030T000000\nEND:STANDARD\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+0800\nTZOFFSETTO:+0900\nTZNAME:HKST\nDTSTART:19460420T033000\nRDATE:19460420T033000\nRDATE:19470413T033000\nRDATE:19480502T033000\nRDATE:19490403T033000\nRDATE:19500402T033000\nRDATE:19510401T033000\nRDATE:19520406T033000\nRDATE:19530405T033000\nRDATE:19540321T033000\nRDATE:19550320T033000\nRDATE:19560318T033000\nRDATE:19570324T033000\nRDATE:19580323T033000\nRDATE:19590322T033000\nRDATE:19600320T033000\nRDATE:19610319T033000\nRDATE:19620318T033000\nRDATE:19630324T033000\nRDATE:19640322T033000\nRDATE:19650418T033000\nRDATE:19660417T033000\nRDATE:19670416T033000\nRDATE:19680421T033000\nRDATE:19690420T033000\nRDATE:19700419T033000\nRDATE:19710418T033000\nRDATE:19720416T033000\nRDATE:19730422T033000\nRDATE:19740421T033000\nRDATE:19750420T033000\nRDATE:19760418T033000\nRDATE:19770417T033000\nRDATE:19790513T033000\nRDATE:19800511T033000\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+0900\nTZOFFSETTO:+0800\nTZNAME:HKT\nDTSTART:19461201T033000\nRDATE:19461201T033000\nRDATE:19471230T033000\nRDATE:19481031T033000\nRDATE:19491030T033000\nRDATE:19501029T033000\nRDATE:19511028T033000\nRDATE:19521026T033000\nRDATE:19531101T033000\nRDATE:19541031T033000\nRDATE:19551106T033000\nRDATE:19561104T033000\nRDATE:19571103T033000\nRDATE:19581102T033000\nRDATE:19591101T033000\nRDATE:19601106T033000\nRDATE:19611105T033000\nRDATE:19621104T033000\nRDATE:19631103T033000\nRDATE:19641101T033000\nRDATE:19651017T033000\nRDATE:19661016T033000\nRDATE:19671022T033000\nRDATE:19681020T033000\nRDATE:19691019T033000\nRDATE:19701018T033000\nRDATE:19711017T033000\nRDATE:19721022T033000\nRDATE:19731021T033000\nRDATE:19741020T033000\nRDATE:19751019T033000\nRDATE:19761017T033000\nRDATE:19771016T033000\nRDATE:19791021T033000\nRDATE:19801019T033000\nEND:STANDARD\nEND:VTIMEZONE\n";
    foreach ($responddata as $index => $value) {
        try {
            echo "BEGIN:VEVENT\nCREATED:" . $currentdatetime . "\nDESCRIPTION:Instructors: " . $value["INSTRUCTORS"] . "\\nCourse: " . $value["DESCR"] . "\nDTEND;TZID=Asia/Hong_Kong:" . (new DateTime($value["START_DT"] . ' ' . $value["MEETING_TIME_END"] . ':00'))->format("Ymd\THis") . "\nDTSTAMP:" . $currentdatetime . "\nDTSTART;TZID=Asia/Hong_Kong:" . (new DateTime($value["START_DT"] . ' ' . $value["MEETING_TIME_START"] . ':00'))->format("Ymd\THis") . "\nLAST-MODIFIED:" . $currentdatetime . "\nLOCATION:" . $value["FDESCR"] . "\nGEO:" . round(trim($value["LAT"]), 6) . ";" . round(trim($value["LNG"]), 6) . "\nSEQUENCE:0\nSUMMARY:" . "[" . $value["COMDESC"] . "] " . $value["SUBJECT"] . $value["CATALOG_NBR"] . "-" . $value["CLASS_SECTION"] . "\nTRANSP:OPAQUE\nRRULE:FREQ=WEEKLY;UNTIL=" . $value["END_DT"] . "T235959Z\nUID:" . uniqid() . "\nEND:VEVENT\n";
        } catch (Exception $e) {
        }
    }
    echo "END:VCALENDAR";
} else {
    echo json_encode($responddata, JSON_PRETTY_PRINT);
}
