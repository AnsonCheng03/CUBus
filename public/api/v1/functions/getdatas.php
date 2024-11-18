<?php

function pingAddress($ip)
{
    if ($socket = @fsockopen($ip, 443, $errno, $errstr, 30)) {
        return true;
        fclose($socket);
    } else {
        return false;
    }
}

if (isset($_SERVER['REMOTE_ADDR'])) {
    header('HTTP/1.0 403 Forbidden');
    die('No Permission');
}

$skippedAlertSha = array('9775994646898f87c18a42ae96ba19d6ecbbf6fe3227755c335e14088fb259ab');


date_default_timezone_set('Asia/Hong_Kong');
$host = 'www.transport.cuhk.edu.hk';
include('functions.php');

if (pingAddress(gethostbyname($host))) {
    $html = file_get_contents('https://' . $host . '/', 0, stream_context_create(["http" => ["timeout" => 20]]));
    if ($html === false) {
        $savestatus["ERROR"] = "fetch";
    } else {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);

        foreach ((new DOMXPath($dom))->query('//span[contains(@class, "hr-status")]') as $html) {
            try {
                //Bus name
                $busno = trim(str_replace('ROUTE', '', strtoupper($html->parentNode->nodeValue)));

                //Bus Status
                switch ($html->getAttribute('class')) {
                    case "hr-status hr-status-delayed":
                        $status = "delayed";
                        break;
                    case "hr-status hr-status-suspended":
                        $status = "suspended";
                        break;
                    case "hr-status hr-status-normal":
                        $status = "normal";
                        break;
                    default:
                        $status = "no";
                }

                //Save to array
                $savestatus[$busno] = $status;
                $bus[$busno]["stats"]["status"] = $status;
                if (isset($bus[$busno . "#"])) {
                    $bus[$busno . "#"]["stats"]["status"] = $status;
                }
            } catch (Exception $e) {
            }
        }

        // get .home-popup-text > p
        $homePopupText = (new DOMXPath($dom))->query('//div[contains(@class, "home-popup-text")]/p');
        if ($homePopupText->length >= 1) {
            $webWarning = "";
            foreach ($homePopupText as $item) {
                $webWarning .= $item->textContent . "\n";
            }
            if ($webWarning) {
                // also get chinese version(connect to /tc)
                try {
                    $html = file_get_contents('https://' . $host . '/tc/', 0, stream_context_create(["http" => ["timeout" => 20]]));
                    $dom = new DOMDocument();
                    libxml_use_internal_errors(true);
                    $dom->loadHTML($html);
                    $homePopupText = (new DOMXPath($dom))->query('//div[contains(@class, "home-popup-text")]/p');
                    // $webWarningTc = $homePopupText->item(0)->textContent;
                    $webWarningTc = "";
                    foreach ($homePopupText as $item) {
                        $webWarningTc .= $item->textContent . "\n";
                    }
                } catch (Exception $e) {
                    $webWarningTc = $webWarning;
                }


                $busAlert = [$webWarningTc, $webWarning];

            }
        }
        // get sha256 of current alert
        $currentAlertSha = hash('sha256', json_encode($busAlert ?? array(), JSON_PRETTY_PRINT));
        if (in_array($currentAlertSha, $skippedAlertSha)) {
            $busAlert = null;
        }

        // save current alert
        file_put_contents(__DIR__ . '/../../Data/Alert.json', json_encode($busAlert ?? array(), JSON_PRETTY_PRINT));
    }
} else {
    $savestatus["ERROR"] = "ping";
}




$tempArray = json_decode(file_get_contents(__DIR__ . '/../../Data/Status.json'), true);
$tempArray[(new DateTime())->format('Y-m-d H:i:s')] = $savestatus;
file_put_contents(__DIR__ . '/../../Data/Status.json', json_encode(array_slice($tempArray, -1500), JSON_PRETTY_PRINT));
file_put_contents(__DIR__ . '/../../Data/prev-status/' . (new DateTime())->format('Y-m-d') . '.json', json_encode(array_slice($tempArray, -1500), JSON_PRETTY_PRINT));

