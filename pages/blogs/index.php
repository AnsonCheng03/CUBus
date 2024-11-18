<!doctype html>


<?php

include('../../Essential/functions/functions.php');

foreach (csv_to_array(__DIR__ . "/../../Data/Route") as $busno) {
    $bus[$busno[0]]["schedule"] = array($busno[1], $busno[2], $busno[3], $busno[4], $busno[5], $busno[6]);
    foreach (array_filter(array_slice($busno, 7)) as $key => $value) {
        $statnm = strstr($value, '|', true) ?: $value;
        $attr = substr(strstr($value, '|', false), 1) ?: "NULL";
        $time = substr(strstr($attr, '|', false), 1) ?: "0";
        $attr = strstr($attr, '|', true) ?: "NULL";
        $bus[$busno[0]]["stations"]["name"][] = $statnm;
        $bus[$busno[0]]["stations"]["attr"][] = $attr;
        $bus[$busno[0]]["stations"]["time"][] = floatval($time);
    }
}

?>

<html amp lang="zh">

<head>

    <head>
        <meta charset="utf-8">
        <script async src="/Essential/amp.js"></script>
        <title>校巴資訊 | 中大校巴資訊站 CU BUS INFOPAGE</title>
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
        <style amp-boilerplate>
            body {
                -webkit-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
                -moz-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
                -ms-animation: -amp-start 8s steps(1, end) 0s 1 normal both;
                animation: -amp-start 8s steps(1, end) 0s 1 normal both
            }

            @-webkit-keyframes -amp-start {
                from {
                    visibility: hidden
                }

                to {
                    visibility: visible
                }
            }

            @-moz-keyframes -amp-start {
                from {
                    visibility: hidden
                }

                to {
                    visibility: visible
                }
            }

            @-ms-keyframes -amp-start {
                from {
                    visibility: hidden
                }

                to {
                    visibility: visible
                }
            }

            @-o-keyframes -amp-start {
                from {
                    visibility: hidden
                }

                to {
                    visibility: visible
                }
            }

            @keyframes -amp-start {
                from {
                    visibility: hidden
                }

                to {
                    visibility: visible
                }
            }
        </style><noscript>
            <style amp-boilerplate>
                body {
                    -webkit-animation: none;
                    -moz-animation: none;
                    -ms-animation: none;
                    animation: none
                }
            </style>
        </noscript>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org/",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    <?php
                    $count = 1;
                    foreach ($bus as $busnumber => $busline) {
                        echo '
                            {
                                "@type": "ListItem",
                                "position": ' . $count . ',
                                "name": "' . $busnumber . '",
                                "item": "https://cu-bus.online/pages/blogs/routes/' . str_replace("#", "|ext|", $busnumber) . '/"
                            }
                        ';
                        if (count($bus) > $count)
                            echo ',';
                        $count++;
                    }
                    ?>

                ]
            }
        </script>
        <meta http-equiv="Content-Language" content="zh">
        <meta name="title" content="校巴資訊 | 中大校巴資訊站 CU BUS INFOPAGE">
        <meta name="description" content="你可在本頁搜尋到校巴之資訊，包括開出時間、是否允許行李等。">
        <meta name="keywords"
            content="CUHK, 中大, 香港中文大學, The Chinese University of Hong Kong, BUS, CUBUS, 巴士, 校巴, School Bus, 路線, route, 校巴站, busstop">
        <meta name="robots" content="index, follow">
        <?php
        if (urlquery('mode') !== 'norm')
            echo '<link rel="canonical" href="./&?mode=norm"/>';
        ?>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="author" content="Anson Cheng">
        <link rel="icon" href="Images/bus.ico" type="image/x-icon">
        <link rel="shortcut icon" href="Images/bus.ico" type="image/x-icon">
        <style amp-custom>
            body {
                font-family: Arial, Helvetica, sans-serif;
            }

            h1 {
                text-align: center;
            }

            .schbusinfo {
                width: 90%;
                margin: 50px auto;
                padding: 10px;
                border-radius: 10px;
                box-shadow: 0 3px 5px rgba(154, 160, 185, .05), 0 15px 40px rgba(166, 173, 201, .2);
                background-color: #fff;
            }

            .infotitle {
                color: #62529c;
                font-size: 1.5rem;
                text-align: left;
                margin: 5px 15px;
                border-left: 3px solid #2196F3;
                padding: 5px 5px 5px 15px;
                border-radius: 2px;
            }

            .routedetails {
                border-top: 1px solid #ddd;
                display: flex;
                width: 100%;
            }

            .routetitle {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 20%;
                min-width: 120px;
            }

            .routetitle p {
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                color: #222;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 80px;
                height: 80px;
                font-size: 2rem;
                border-radius: 5px;
            }

            .detailsitems {
                display: block;
                width: 60%;
            }

            .redirect {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 20%;
                min-width: 100px;
                text-decoration: none;
            }

            .redirect p {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 80%;
                height: 60%;
                color: #fff;
                background: rgba(130, 46, 107, 0.7);
                border-radius: 10px;
            }

            .navbtns {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100vw;
                margin: 30px 0;
            }

            .navbtns a {
                display: block;
                width: 40%;
                margin: 15px;
                text-align: center;
                background-color: #62529c;
                color: #fff;
                padding: 10px;
                text-decoration: none;
                border-radius: 5px;
            }
        </style>
    </head>
</head>

<body>

    <div class="navbtns">
        <a href="/">校巴路線查詢</a>
        <a href="/?mode=realtime">校巴實時報站</a>
    </div>

    <h1>中大校巴資訊</h1>
    <div class="schbusinfo">
        <h2 class="infotitle">各校巴資訊</h2>

        <?php
        foreach ($bus as $busno => $busline) {

            switch ($busno) {
                case '1A':
                case '1B':
                    $busnocolor = 'background: linear-gradient(90deg, #fff149 0%, #f3b53a 100%)';
                    break;
                case '2':
                case '2#':
                    $busnocolor = 'background:linear-gradient(90deg, #F5A8BA 0%, #ec4790 100%)';
                    break;
                case '3':
                    $busnocolor = 'background: linear-gradient(90deg, #a4cc39 0%, #318761 100%);';
                    break;
                case '4':
                    $busnocolor = 'background: linear-gradient(90deg, #f1a63b 0%, #e75a24 100%);';
                    break;
                case '8':
                case '8#':
                    $busnocolor = 'background: linear-gradient(90deg, #ffe3a8 0%, #ffc55A 100%);';
                    break;
                case 'N':
                case 'N#':
                    $busnocolor = 'background: linear-gradient(90deg, #d1b4d5 0%, #7961a8 100%);';
                    break;
                case 'H':
                case 'H#':
                    $busnocolor = 'background: linear-gradient(90deg, #896391 0%, #453087 100%);';
                    break;
                case '5':
                case '5#':
                    $busnocolor = 'background: linear-gradient(90deg, #c2d6ea 0%, #29a1d8 100%);';
                    break;
                case '6A':
                    $busnocolor = 'background: linear-gradient(90deg, #7c8644 0%, #585823 100%);';
                    break;
                case '6B':
                    $busnocolor = 'background: linear-gradient(90deg, #4f88c1 0%, #3f438f 100%);';
                    break;
                case '7':
                    $busnocolor = 'background: linear-gradient(90deg, #c2c2c2 0%, #666666 100%);';
                    break;
            }

            switch ($busno) {
                case '1A':
                case '1B':
                case '2':
                case '3':
                case '4':
                case '8':
                case '8#':
                case 'N':
                case 'N#':
                case 'H':
                case 'H#':
                    $standing = '設有企位校巴';
                    break;
                case '5':
                case '5#':
                case '6A':
                case '6B':
                case '7':
                    $standing = '不設企位校巴';
                    break;
            }

            echo '

                <div class="routedetails">
                    <span class="routetitle">
                        <p style="' . $busnocolor . '">
                            ' . $busno . '
                        </p>
                    </span>
                    <div class="detailsitems">
                        <div class="details">
                            <h3>服務時間</h3>
                            <p class="time">' . $busline['schedule'][0] . ' - ' . $busline['schedule'][1] . '</p>
                            <p class="days">' . (strpos($busline["schedule"][3], "HD") !== false || $busline["schedule"][3] === "HD" ?
                    "假日" : (strpos($busline["schedule"][3], "TD") === false && $busline["schedule"][3] !== "TD" ?
                        "非教學日" : "教學日"
                    )) . '</p>
                        </div>
                        <div class="details">
                            <h3>開出時間</h3> 
                            <p>' . explode("(", $busline["schedule"][2])[0] . ' 分</p>
                        </div>
                        <div class="details">
                            <h3>乘客行李/物品</h3>
                            <p>' . $standing . '</p>
                        </div>
                    </div>
                    <a class="redirect" href="routes/' . str_replace("#", "|ext|", $busno) . '/">
                        <p>介紹</p>
                    </a>
                </div>
            ';
        }
        ?>

    </div>
</body>

</html>