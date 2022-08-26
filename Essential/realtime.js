//Functions

var submitted = 0;

function append_query(query, value) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  query_arr = Object.keys(params).map((key) => [key.toString()]);
  value_arr = Object.keys(params).map((key) => [params[key]]);
  index = query_arr.findIndex(element => element == query);
  if (index < 0) {
    var loc = location.href;
    loc += location.href.indexOf("?") === -1 ? "?" : "&";
    location.href = loc + query + "=" + value;
  } else {
    value_arr[index] = value;
    var querypath = "";
    query_arr.forEach((element, index) => {
      querypath = querypath + "&" + element + "=" + value_arr[index]
    });
    var finalurl = location.href.split('?')[0] + "?" + querypath;
    location.href = finalurl;
  }
}

function getLocation(item) {
  globalThis.item = item;
  document.getElementById("details-box").style.display = 'flex';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, Positionfailed, { timeout: 500 });
  } else {
    window.alert(Translation["GPS-notsupp"]);
    document.getElementById("details-box").style.display = "none";
  }
}

function Positionfailed(position) {
  window.alert(Translation["GPS-error"]);
  document.getElementById("details-box").style.display = "none";
}

function showPosition(position) {
  for (var i = 0; i < GPSdata.length; i++) {
    GPSdata[i]["distance"] = distanceBetweenTwoPlace(position.coords.latitude, position.coords.longitude, GPSdata[i].lat, GPSdata[i].lng, "K")
  }
  GPSdata.sort(function (a, b) { return parseFloat(a.distance) - parseFloat(b.distance); });
  if (GPSdata[0]["distance"] > 0.5) {
    document.getElementById('details-box').style.display = 'none';
    window.alert(Translation["nearst_error"]);
  } else {
    printneareststation();
  }
}

function changevaluebyGPS(loccode) {
  document.querySelector('.select-box').value = loccode;
  document.getElementById('details-box').style.display = 'none';
}

function printneareststation() {
  var htmlcode;
  document.getElementById("GPSresult").innerHTML = "";
  for (var i = 0; i < 3; i++) {
    htmlcode = "";
    htmlcode = htmlcode + '<table width="70%" style="background-color: #145D90; color: #fff; border-radius: 20px; margin: 0px auto 20px auto; text-align: center;"><tr><td width="70%" height="100px"><a style="color: white" href="javascript:changevaluebyGPS(\'' + GPSdata[i]["code"] + '\');">' + GPSdata[i]["location"];
    if (GPSdata[i]["attr"]) { htmlcode = htmlcode + "(" + GPSdata[i]["attr"] + ")"; }
    (GPSdata[i]["distance"].toFixed(3) * 1000 > 1000) ? GPSdatamodi = "> 9999" : GPSdatamodi = GPSdata[i]["distance"].toFixed(3) * 1000
    htmlcode = htmlcode + '</a></td><td>' + GPSdatamodi + ' m</td></tr></table>';
    document.getElementById("GPSresult").innerHTML = document.getElementById("GPSresult").innerHTML + htmlcode
  }
  document.getElementById("GPSresult").innerHTML = document.getElementById("GPSresult").innerHTML + '<div style="height:100px; text-align: center; margin-top: 50px"><span class="map-submit-btn" onclick=\'document.getElementById("details-box").style.display = "none"; \'>' + Translation["cancel_btntxt"] + '</span></div>';
}

function distanceBetweenTwoPlace(firstLat, firstLon, secondLat, secondLon, unit) {
  var firstRadlat = Math.PI * firstLat / 180
  var secondRadlat = Math.PI * secondLat / 180
  var theta = firstLon - secondLon;
  var radtheta = Math.PI * theta / 180
  var distance = Math.sin(firstRadlat) * Math.sin(secondRadlat) + Math.cos(firstRadlat) * Math.cos(secondRadlat) * Math.cos(radtheta);
  if (distance > 1) {
    distance = 1;
  }
  distance = Math.acos(distance)
  distance = distance * 180 / Math.PI
  distance = distance * 60 * 1.1515
  if (unit == "K") { distance = distance * 1.609344 }
  if (unit == "N") { distance = distance * 0.8684 }
  return distance
}

function refreshform(form, replacecontent, target = "/") {
  const elm = document.querySelector(replacecontent);
  const xhr = new XMLHttpRequest();
  const formData = new FormData(form);
  xhr.withCredentials = true;
  xhr.open("POST", target);
  xhr.onreadystatechange = function () {
    if (document.querySelector(replacecontent) && this.response !== "" && this.readyState == 4) {
      elm.innerHTML = this.response;
      Array.from(elm.querySelectorAll("script")).forEach(oldScript => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes)
          .forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }
  xhr.send(formData);
  return false;
}

function submitform(form, replacecontent, target = "/") {
  refreshform(form, replacecontent, target)
  if (submitted != 0) clearInterval(submitted);
  submitted = setInterval(() => {
    refreshform(form, replacecontent, target)
  }, 5000)
}

function realtimesubmit(objbtn) {
  if (!confirm("確認提交？ \nDo you really want to submit?"))
    return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('linename', objbtn.getAttribute('data'));
      formData.append('CSRF', objbtn.getAttribute('tk'));
      formData.append('stop', objbtn.getAttribute('stop'));
      formData.append('lang', objbtn.getAttribute('lang'));
      xhr.withCredentials = true;
      xhr.open("POST", 'realtime/report.php');
      xhr.onreadystatechange = function () {
        if (this.response !== "" && this.readyState == 4)
          window.alert(this.response);
      }
      xhr.send(formData);
    }, () => {
      window.alert('無法獲取地址，不能確認你是否在校巴站附近。\n We cannot verity that you are close to the bus stop.');
      return;
    }, { timeout: 500 })};



  return false;
}

window.addEventListener('load', () => {
  try {
    const startingpt = localStorage.getItem('startingpt').split(" (")[0]
    document.querySelectorAll('.select-box option').forEach(ele => {
      if (startingpt == ele.textContent)
        document.querySelector('.select-box').value = ele.value;
    })
    submitform(document.querySelector('.stopselector'), '.realtimeresult', 'realtime/index.php');
    localStorage.removeItem('startingpt');
  } catch (e) {
    
  }
})