//Functions

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
    document.getElementById("GPSresult").innerHTML = '<div style="float:center; height:100px; display: flex; align-items: center;"><p id="details-box-heading" style="display:inline; color: black; margin: auto;">' + Translation["nearst_warning"] + '</p></div>' + '<div style="height:100px; text-align: center; margin-top: 20px"><span class="map-submit-btn" onclick=\'document.getElementById("details-box").style.display = "none"; \'>' + Translation["cancel_btntxt"] + '</span><span class="map-submit-btn" onclick=\'printneareststation();\'>' + Translation["continue_btntxt"] + '</span></div>' + '<br>';
  } else {
    printneareststation();
  }
}

function changevaluebyGPS(item, locname, loccode) {
  item = item.split('-')[0];
  if (document.querySelector('input[name="mode"]:checked').value == 'station') {
    document.getElementById(item).value = loccode;
  } else {
    item = item + "bd";
    document.getElementById(item).value = locname + " (" + loccode + ")";
  }

  document.getElementById('details-box').style.display = 'none';
}

function printneareststation() {
  var htmlcode;
  document.getElementById("GPSresult").innerHTML = "";
  for (var i = 0; i < 3; i++) {
    htmlcode = "";
    htmlcode = htmlcode + '<table width="70%" style="background-color: #145D90; color: #fff; border-radius: 20px; margin: 0px auto 20px auto; text-align: center;"><tr><td width="70%" height="100px"><a style="color: white" href="javascript:changevaluebyGPS(\'' + item + '\',\'' + GPSdata[i]["location"] + '\',\'' + GPSdata[i]["code"] + '\');">' + GPSdata[i]["location"];
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

function map_show_test(mode, text) {
  window.alert("不日推出 Coming Soon");
}

function map_area(elemid) {
  document.getElementById('map-search-txt').innerText = elemid.toString();
}

function map_show(mode, text) {
  switch (mode) {
    case 0:
      document.getElementById("map-search-heading").innerHTML = document.getElementById(text.split("-")[0] + "-label").innerText + "<br>";
      document.getElementById("map-search").style.display = 'unset';
      break;
    case 1:
      if (text == "submit") document.getElementById("map-search").style.display = 'none';
      if (text == "close") document.getElementById("map-search").style.display = 'none';
      break;
    default:
      break;
  }
}

function time_change() {
  if (document.getElementById("deptnow").checked) {
    if (document.getElementById("time-now")) document.getElementById("time-now").style.display = 'block';
    document.getElementById("time-schedule").style.display = 'none';
  } else {
    document.getElementById("time-schedule").style.display = 'block';
    if (document.getElementById("time-now")) document.getElementById("time-now").style.display = 'none';
  }
}

function date_change() {
  if (document.getElementById("Trav-wk")) {
    if (document.getElementById("Trav-wk").value == "WK-Sun") {
      document.getElementById("Trav-dt").style.display = 'none';
      document.getElementById("Trav-dt").value = 'HD';
    } else {
      document.getElementById("Trav-dt").style.display = 'inline';
    }
  }
}

function platformCheck() {
  const isiOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isiPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (isiOS || isiPadOS);
  //is iOS = true
};

function StandaloneCheck() {
  const isStandalone = "standalone" in window.navigator && window.navigator.standalone;
  return !isStandalone;
}

function comparetime() {
  if (localStorage.getItem("dismisshomescreen") == null) return false; else savedtime = localStorage.getItem("dismisshomescreen")
  var dissmisstime = Date.parse(savedtime), currenttime = new Date();
  currenttime.setHours(currenttime.getHours() - 24);
  return (dissmisstime - currenttime) > 0
}

function zoom(e, mode) {
  if (mode == "move") {
    document.getElementById('busmapimg').style.opacity = 0;
    var zoomer = e.currentTarget;
    e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
    e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
    x = offsetX / zoomer.offsetWidth * 100
    if (x < 0) x = 100 + x;
    y = offsetY / zoomer.offsetHeight * 100
    if (y < 0) y = 100 + y;
    zoomer.style.backgroundPosition = x + '% ' + y + '%';
  }
  if (mode == "leave") {
    document.getElementById('busmapimg').style.opacity = 1;
  }
}

function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function (e) {
    var a, b, i, val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = arr[i].substr(0, val.length);
        b.innerHTML += arr[i].substr(val.length);
        //
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          sessionStorage.setItem("routesearch-" + inp.name, inp.value);
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function submitform(form, replacecontent, target = "/") {
  const elm = document.querySelector(replacecontent);
  elm.innerHTML = "";
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
  sessionStorage.setItem("routesearch-submit", "submitted");
  return false;
}


function refreshinput() {
  document.querySelectorAll('input[type="text"], select').forEach(elm => {
    const v = "routesearch-" + elm.name;

    if (sessionStorage.getItem(v)) {
      elm.value = sessionStorage.getItem(v);
    }

    elm.addEventListener('change', () => {
      sessionStorage.setItem(v, elm.value);
    })
  })

  document.querySelectorAll('input[type="checkbox"], checkbox').forEach(elm => {
    const v = "routesearch-" + elm.name;
    if (sessionStorage.getItem(v)) {
      if (sessionStorage.getItem(v) == 'true')
        elm.checked = true;
      else if (sessionStorage.getItem(v) == 'false')
        elm.checked = false;
      elm.dispatchEvent(new Event('change'));
    }
    elm.addEventListener('change', () => {
      sessionStorage.setItem(v, elm.checked);
    })
  })

  document.querySelectorAll('input[type="radio"]').forEach(elm => {

    const v = "routesearch-" + elm.name;

    if (sessionStorage.getItem(v)) {
      document.querySelectorAll('input[name="' + elm.name + '"]').forEach(elem => {
        if (elem.value == sessionStorage.getItem(v))
          elem.checked = true;
        else
          elem.checked = false;
      })
      elm.dispatchEvent(new Event('change'));
    }

    elm.addEventListener('change', () => {
      sessionStorage.setItem(v, document.querySelector('input[name="' + elm.name + '"]:checked').value);
    })
  })

  if (sessionStorage.getItem('routesearch-submit'))
    if (sessionStorage.getItem('routesearch-submit') == "submitted")
      submitform(document.querySelector('form'), '.routeresult', 'routesearch/index.php')
}

window.addEventListener('load', () => {
  sessionStorage.setItem('loadstate', 'load');
  refreshinput();
});

window.addEventListener('pageshow', () => {
  if (!sessionStorage.getItem('loadstate'))
    location.reload();
  sessionStorage.removeItem('loadstate');
});