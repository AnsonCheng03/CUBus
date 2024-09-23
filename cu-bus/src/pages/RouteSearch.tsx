import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import "./RouteSearch.css";
import "./routeComp.css";

const RouteSearch: React.FC<{ appData: any }> = ({ appData }) => {
  function handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  return (
    <IonPage>
      {/* <?php

<!--Fetch Busstop && Buildings to Array!-->
<!--Need Fix!-->
<?php

$busservices = json_decode(file_get_contents('Data/Status.json'), true);
$currentbusservices = $busservices ? end($busservices) : null;
$temp = array_slice($busservices, -30, 1);
$thirtyminbusservice = array_pop($temp);


if (isset($currentbusservices['ERROR'])) {
  $fetcherror = true;
  // alert("alert", $translation["fetch-error"][$lang]);
} else {
  foreach ($currentbusservices as $busnumber => $busstatus) {
    $bus[$busnumber]["stats"]["status"] = $busstatus;
    $bus[$busnumber]["stats"]["prevstatus"] = $thirtyminbusservice[$busnumber];
    if (isset($bus[$busnumber . "#"])) {
      $bus[$busnumber . "#"]["stats"]["status"] = $busstatus;
      $bus[$busnumber . "#"]["stats"]["prevstatus"] = $thirtyminbusservice[$busnumber];
    }
  }
}



//Alert Delay Bus
foreach ($bus as $busnum => $busline) {

  if ($busline["stats"]["status"] == "no" && $busline["stats"]["prevstatus"] == "normal")
    $buserrstat["justeos"][] = $busnum;

  if ($busline["stats"]["status"] == "delay")
    $buserrstat["delay"][] = $busnum;
  if ($busline["stats"]["status"] == "suspended")
    $buserrstat["suspended"][] = $busnum;
}

$finalerrbus = "";
if (isset($buserrstat["delay"]))
  $finalerrbus = $finalerrbus . $translation["delay-alert"][$lang] . implode(", ", $buserrstat["delay"]);
if (isset($buserrstat["delay"]) && isset($buserrstat["suspended"]))
  $finalerrbus = $finalerrbus . "<br>";
if (isset($buserrstat["suspended"]))
  $finalerrbus = $finalerrbus . $translation["suspended-alert"][$lang] . implode(", ", $buserrstat["suspended"]);
// if ($finalerrbus !== "")
//   alert("alert", $finalerrbus);


//Concat all bus stops
foreach ($bus as $busnum) {
  foreach ($busnum["stations"]["name"] as $busstops) {
    if (isset($busstops)) {
      $allbusstop[] = $busstops;
    }
  }
}
$allbusstop = array_filter(array_unique($allbusstop));

//Concat all Buildings
foreach ($station as $stoparr) {
  foreach ($stoparr as $buildings) {
    if (isset($busstops)) {
      $allbuildings[] = $buildings;
    }
  }
}
$allbuildings = array_filter(array_unique($allbuildings));


//Translate building names
foreach ($translation as $buildingcode => $buildingnamearr) {
  foreach ($allbuildings as $allbuildingcode) {
    if ($buildingcode == $allbuildingcode) {
      if ($buildingnamearr[$lang] == "" || $buildingcode == "") {
        $transbuilding[] = $buildingnamearr[$lang];
      } else {
        $transbuilding[] = $buildingnamearr[$lang] . " (" . strtoupper($buildingcode) . ")";
      }
    }
  }
}
?>

<!--Input form!-->
<form name="bussearch" method="post" onsubmit="return submitform(this,'.routeresult','routesearch/index.php')"
  autocomplete="off">
  <input hidden type="hidden" name="language" value="<?php echo $lang ?>"></input>

  <input id="building" name="mode" type="radio" value="building" checked hidden />

  <div class="search-boxes">
    <div class="info-box optionssel">


      <div class="locationchooser">
        <label for="Start" id="Start-label"><?php echo $translation["Form-Start"][$lang] ?></label>
        <div class="locationinput">
          <div mode="building" class="autocomplete">
            <input class="text-box" type="text" onclick="this.select();" id="Startbd" name="Startbd" autocomplete="off">
          </div>
          <select mode="station" class="select-box" name="Start" id="Start">
            <?php
            foreach ($allbusstop as $value)
              echo '<option value="' . $value . '">' . $translation[$value][$lang] . "</option>";
            ?>
          </select>
        </div>
        <div class="functionbuttons">
          <img alt="Get Current Location" width='20px' height='20px' class='image-wrapper' src='Images/GPS.jpg'
            id='Start-GPS-box' onclick='getLocation(this.id);'></img>
        </div>
      </div>

      <div class="locationchooser">
        <label for="Dest" id="Dest-label"> <?php echo $translation["Form-Dest"][$lang] ?></label>
        <div class="locationinput">
          <div mode="building" class="autocomplete">
            <input class="text-box" type="text" onclick="this.select();" id="Destbd" name="Destbd" autocomplete="off">
          </div>
          <select mode="station" class="select-box" name="Dest" id="Dest">
            <?php
            foreach ($allbusstop as $value)
              echo '<option value="' . $value . '">' . $translation[$value][$lang] . "</option>";
            ?>
          </select>
        </div>
        <div class="functionbuttons">
          <img alt="Get Current Location" width='20px' height='20px' class="image-wrapper" src="Images/GPS.jpg"
            id="Dest-GPS-box" onclick="getLocation(this.id);"></img>
        </div>
      </div>

      <div class="bus-options">
        <span class="slider-wrapper">
          <label for="deptnow"><?php echo $translation["info-deptnow"][$lang] ?></label>
          <div class="slider-container">
            <label class="switch"><input type="checkbox" id="deptnow" name="deptnow" checked onchange="time_change();">
              <span class="slider"></span>
            </label>
          </div>
        </span>
      </div>



      <!--手動時間!-->
      <div id="time-schedule" style="display: none;">
        <div class="time-schedule">
          <select class="select-date" name="Trav-wk" id="Trav-wk" onchange="date_change();">
            <?php
            $weekday = ["WK-Sun", "WK-Mon", "WK-Tue", "WK-Wed", "WK-Thu", "WK-Fri", "WK-Sat"];
            foreach ($weekday as $weekdays => $value)
              echo '<option ' . (date('N') == $weekdays ? 'selected ' : '') . 'value="' . $value . '" >' . $translation[$value][$lang] . "</option>";
            ?>
          </select>

          <select class="select-date" name="Trav-dt" id="Trav-dt">
            <?php
            $busdate = array_filter(array_unique(array_column(array_column($bus, 'schedule'), 3)));
            foreach ($busdate as $value)
              if (strpos($value, ",") == false)
                echo '<option value="' . $value . '">' . $translation[$value][$lang] . "</option>";
            ?>
          </select>

          <select class="select-time" name="Trav-hr" id="Trav-hr">
            <?php
            $hour = array("00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23");
            foreach ($hour as $value) {
              echo "<option " . (date('H') == $value ? 'selected ' : '') . 'value="' . $value . '">' . $value . "</option>";
            }
            ?>
          </select>
          :
          <select class="select-time" name="Trav-min" id="Trav-min">
            <?php
            $minute = array("00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55");
            foreach ($minute as $value) {
              echo "<option " . ($value >= date('i') && $value < date('i') + 5 ? ' selected ' : '') . 'value="' . $value . '">' . $value . "</option>";
            }
            ?>
          </select>
          <input id="routesubmitbtn" class="submit-btn" type="submit" name="submit"
            value=" <?php echo $translation["route-submit"][$lang] ?> " />
        </div>

        <!--自動時間!-->
        <?php
        if ($fetcherror) {
          echo '<div id="time-now" class="show-time" style="display: none;">';
          echo $translation["fetch-error"][$lang];
          echo "</div>";
        }

        ?>

      </div>
    </div>

  </div>
</form>

<script>
  // submit the form when the enter key is pressed or changed (event listener)
  const autoSubmitForm = () => {
    // log both locationinput and slider value
    const from = document.querySelector('#Startbd').value;
    const to = document.querySelector('#Destbd').value;
    const slider = document.querySelector('.slider-container input').checked;

    if (from === "" || to === "" || slider === false) {
      return;
    }
    // submit the form
    document.querySelector('#routesubmitbtn').click();
  }

  // add event listener to the form
  document.querySelector('form').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      autoSubmitForm();
    }
  });

  document.querySelectorAll('.slider-container').forEach(element => {
    // only 
    element.addEventListener('change', autoSubmitForm);
  });


</script>

<!--GPS Details Box!-->
<div id="details-box">
  <div class="details-box">
    <div class="showdetails">
      <h4 id="details-box-heading">
        <?php echo $translation["nearst_txt"][$lang] ?>
      </h4>
      <div class="map-submit-btn" onclick='document.getElementById("details-box").style.display="none"'>
        <?php echo $translation["cancel_btntxt"][$lang] ?>
      </div>
    </div>
    <div id="GPSresult"></div>
  </div>
</div>

<!--Output result!-->
<div class="routeresult">
  <div class='error-text'>
    <i class='fas fa-info-circle''></i>
    <p> <?php echo $translation["input-text-reminder"][$lang] ?></p>
  </div>
</div>

<div id="detail-route-container">
    <div id="close-button" onclick="closeRouteMap()">&times;</div>
    <div id="map-container"></div>
</div>

</body>

<footer> */}
    </IonPage>
  );
};

export default RouteSearch;
