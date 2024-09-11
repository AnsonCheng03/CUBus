<!doctype html>

<?php
include('../../../Essential/functions/functions.php');

foreach (csv_to_array(__DIR__ . "/../../../Data/Route") as $busno) {
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

//Website Translation
foreach (array_slice(csv_to_array(__DIR__ . "/../../../Data/Translate"), 1) as $row) {
    if ($row[0] !== "" && substr($row[0], 0, 2) !== "//") {
        $translation[$row[0]] = array($row[2], $row[3]);
        $translation[$row[0]][] = $row[1];
    }
}

$lang = 0;
$busno = str_replace("|ext|", "#", explode("/", $_GET['route'])[0]);
if (!isset($bus[$busno])) {
    http_response_code(404);
    die('<script>window.location.replace("../");</script>');
}


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
    case '2#':
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
?>


<html amp lang="zh">

<head>

    <head>
        <meta charset="utf-8">
        <script async src="/Essential/amp.js"></script>
        <title>校巴資訊 - <?php echo $busno ?> | 中大校巴資訊站 CU BUS INFOPAGE</title>
        <?php
        if (urlquery('mode') !== 'norm')
            echo '<link rel="canonical" href="./&?mode=norm"/>';
        ?>
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
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [{
                    "@type": "Question",
                    "name": "服務時間",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "<?php echo $bus[$busno]['schedule'][0] . ' - ' . $bus[$busno]['schedule'][1] ?>"
                    }
                }, {
                    "@type": "Question",
                    "name": "服務日子",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "<?php echo (strpos($bus[$busno]["schedule"][3], "HD") !== false || $bus[$busno]["schedule"][3] === "HD" ?
                            "假日" : (strpos($bus[$busno]["schedule"][3], "TD") === false && $bus[$busno]["schedule"][3] !== "TD" ?
                            "非教學日" : "教學日"
                        )) ?>"
                    }
                }, {
                    "@type": "Question",
                    "name": "開出時間",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "<?php echo explode("(", $bus[$busno]["schedule"][2])[0] ?> 分"
                    }
                }, {
                    "@type": "Question",
                    "name": "乘客行李/物品",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "<?php echo $standing ?>"
                    }
                }]
            }
        </script>
        <meta http-equiv="Content-Language" content="zh">
        <meta name="title" content="校巴資訊 - <?php echo $busno ?> | 中大校巴資訊站 CU BUS INFOPAGE">
        <meta name="description" content="你可在本頁搜尋到 <?php echo $busno ?> 校巴之資訊，包括開出時間、是否允許行李、路線等。">
        <meta name="keywords"
            content="CUHK, 中大, 香港中文大學, The Chinese University of Hong Kong, BUS, CUBUS, 巴士, 校巴, School Bus, 路線, route, 校巴站, busstop, <?php echo $busno ?>">
        <meta name="robots" content="index, follow">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="author" content="Anson Cheng">
        <link rel="icon" href="Images/bus.ico" type="image/x-icon">
        <link rel="shortcut icon" href="Images/bus.ico" type="image/x-icon">
        <style amp-custom>
            body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
            }

            h1 {
                text-align: center;
                margin: 50px auto;
                padding: 10px;
                width: 200px;
                background: rgba(71, 188, 212, 0.5);
                border-radius: 10px;
            }

            .navbtns {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100vw;
                margin-top: 30px;
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
                margin: 25px 30px;

                border: solid #47bcd4 5px;
                border-width: 0 0 0 5px;

                padding: 5px 0 5px 50px;
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
                width: 30%;
                min-width: 120px;
            }

            .routetitle p {
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
                color: #111;
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
                width: 70%;
            }

            .busroutemap {
                width: 100%;
            }

            .busroutemap span {
                display: block;
                padding: 0vh 30px 5vh 30px;
                border: solid #47bcd4 5px;
                border-width: 0 0 0 5px;
                z-index: -1;
                margin: 0 20px;
            }

            .busroutemap span h2 {
                color: #62529c;
                font-size: 1.5rem;
                text-align: left;
                margin: 5px 15px;
                padding: 35px 5px 5px 15px;
                border-radius: 2px;
            }

            .card {
                position: relative;
                padding: 30px 0;
                margin: 0 20px;
            }

            .card::before {
                content: "";
                position: absolute;
                width: 50%;
                border: solid #47bcd4;
                right: 0;
                top: 0;
                bottom: 0;
                border-width: 5px 5px 5px 0;
                border-radius: 0 50px 50px 0;
            }

            .card:nth-child(even)::before {
                right: unset;
                left: 0px;
                top: -5px;
                bottom: -5px;
                border-width: 5px 0 5px 5px;
                border-radius: 50px 0 0 50px;
            }

            .card:nth-child(2)::before {
                border-top: 0;
                border-top-left-radius: 0;
            }

            .card h3::before {
                content: "";
                position: absolute;
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 999px;
                border: 3px solid #cd5b9f;
            }

            .card:nth-child(odd)>.card-content {
                text-align: right;
            }

            .card:nth-child(odd)>.card-content>h3::before {
                right: calc(-18px - 12.5%);
            }

            .card:nth-child(even)>.card-content>h3::before {
                left: calc(-18px - 12.5%);
            }

            .busroutemap span:last-child {
                padding: 0 0 10vh 0;
                margin: 0 0 0 50%;
                border-width: 5px 0 0 0;
            }

            .busroutemap span:nth-child(even) {
                margin: -5px 50% 0 0;
            }

            .card-content {
                display: flex;
                flex-direction: column;
                color: #000;
                font-size: 13px;
                border-radius: 5px;

                margin: 25px 10% 25px 10%;
                padding: 15px 10px;
                box-shadow: 0px 30px 40px -20px hsl(229, 6%, 66%);
                border: solid;
                border-width: 3px 0 0 0;
            }

            .card .card-content p {
                width: 100%;
                overflow: hidden;
                white-space: nowrap;
            }

            .card:hover .card-content {
                background-color: rgb(236, 236, 236);
            }

            .card:nth-child(5n-1) .card-content {
                border-color: hsl(0, 78%, 62%);
            }

            .card:nth-child(5n-2) .card-content {
                border-color: hsl(180, 62%, 55%);
            }

            .card:nth-child(5n-3) .card-content {
                border-color: hsl(34, 97%, 64%);
            }

            .card:nth-child(5n-4) .card-content {
                border-color: hsl(212, 86%, 64%);
            }

            .busroutemap h3 {
                color: hsl(234, 12%, 34%);
                position: relative;
            }

            .busroutemap h4 {
                display: inline-block;
                background: #5e76bf;
                border-radius: 5px;
                font-size: 12px;
                margin: 0;
                color: #fff;
                padding: 5px 10px;
                text-transform: uppercase;
            }
        </style>
    </head>
</head>

<body>
    <div class="navbtns">
        <a href="/">校巴路線查詢</a>
        <a href="/?mode=realtime">校巴實時報站</a>
        <a href="../../">查看其他路線</a>
    </div>

    <h1>校巴 - <?php echo $busno ?></h1>
    <div class="schbusinfo">
        <h2 class="infotitle">校巴資訊</h2>

        <?php

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
                            <p class="time">' . $bus[$busno]['schedule'][0] . ' - ' . $bus[$busno]['schedule'][1] . '</p>
                            <p class="days">' . (strpos($bus[$busno]["schedule"][3], "HD") !== false || $bus[$busno]["schedule"][3] === "HD" ?
                "假日" : (strpos($bus[$busno]["schedule"][3], "TD") === false && $bus[$busno]["schedule"][3] !== "TD" ?
                "非教學日" : "教學日"
            )) . '</p>
                        </div>
                        <div class="details">
                            <h3>開出時間</h3> 
                            <p>' . explode("(", $bus[$busno]["schedule"][2])[0] . ' 分</p>
                        </div>
                        <div class="details">
                            <h3>乘客行李/物品</h3>
                            <p>' . $standing . '</p>
                        </div>
                    </div>
                </div>
                </div>
            ';
        ?>



        <div class="schbusinfo">
            <section class="busroutemap">
                <span>
                    <h2>校巴路線</h2>
                </span>

                <?php

                foreach ($bus[$busno]['stations']['name'] as $index => $stopname)
                    echo '
                    
                        <div class="card">
                            <div class="card-content">
                                <h3>第' . ($index + 1) . '站' .
                    ($bus[$busno]['stations']['attr'][$index] !== "NULL" ? '（' . $translation[$bus[$busno]['stations']['attr'][$index]][$lang] . '）</h3>' : "</h3>") .
                        '<h4>' . $translation[$stopname][$lang] . '</h4>
                            </div>
                        </div>

                    ';

                ?>
                <span></span>
            </section>
        </div>
</body>

</html>