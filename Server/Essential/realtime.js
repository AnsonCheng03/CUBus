//Functions

var submitted = 0;

function getLocation(item) {
  globalThis.item = item;
  document.getElementById("details-box").style.display = "flex";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, Positionfailed, {
      timeout: 500,
    });
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
    GPSdata[i]["distance"] = distanceBetweenTwoPlace(
      position.coords.latitude,
      position.coords.longitude,
      GPSdata[i].lat,
      GPSdata[i].lng,
      "K"
    );
  }
  GPSdata.sort(function (a, b) {
    return parseFloat(a.distance) - parseFloat(b.distance);
  });
  if (GPSdata[0]["distance"] > 0.5) {
    document.getElementById("details-box").style.display = "none";
    window.alert(Translation["nearst_error"]);
  } else {
    printneareststation();
  }
}

function changevaluebyGPS(loccode) {
  document.querySelector(".select-box").value = loccode;
  sessionStorage.setItem("realtime-Dest", loccode);
  submitform(
    document.querySelector("form"),
    ".realtimeresult",
    "realtime/index.php"
  );
  document.getElementById("details-box").style.display = "none";
}

function printneareststation() {
  var htmlcode;
  document.getElementById("GPSresult").innerHTML = "";
  for (var i = 0; i < 3; i++) {
    htmlcode = "";
    htmlcode =
      htmlcode +
      '<div class="gpsOptions" onclick="changevaluebyGPS(\'' +
      GPSdata[i]["code"] +
      "');\"><div class=GpsText'>" +
      GPSdata[i]["location"];
    if (GPSdata[i]["attr"]) {
      htmlcode = htmlcode + "(" + GPSdata[i]["attr"] + ")";
    }
    GPSdata[i]["distance"].toFixed(3) * 1000 > 1000
      ? (GPSdatamodi = "> 9999")
      : (GPSdatamodi = GPSdata[i]["distance"].toFixed(3) * 1000);
    htmlcode =
      htmlcode +
      "</div><div class='gpsMeter'>" +
      GPSdatamodi +
      " m</div></div>";
    document.getElementById("GPSresult").innerHTML =
      document.getElementById("GPSresult").innerHTML + htmlcode;
  }
}

function distanceBetweenTwoPlace(
  firstLat,
  firstLon,
  secondLat,
  secondLon,
  unit
) {
  var firstRadlat = (Math.PI * firstLat) / 180;
  var secondRadlat = (Math.PI * secondLat) / 180;
  var theta = firstLon - secondLon;
  var radtheta = (Math.PI * theta) / 180;
  var distance =
    Math.sin(firstRadlat) * Math.sin(secondRadlat) +
    Math.cos(firstRadlat) * Math.cos(secondRadlat) * Math.cos(radtheta);
  if (distance > 1) {
    distance = 1;
  }
  distance = Math.acos(distance);
  distance = (distance * 180) / Math.PI;
  distance = distance * 60 * 1.1515;
  if (unit == "K") {
    distance = distance * 1.609344;
  }
  if (unit == "N") {
    distance = distance * 0.8684;
  }
  return distance;
}

function refreshform(form, replacecontent, target = "/") {
  const elm = document.querySelector(replacecontent);
  const xhr = new XMLHttpRequest();
  const formData = new FormData(form);
  xhr.withCredentials = true;
  xhr.open("POST", target);
  xhr.onreadystatechange = function () {
    if (
      document.querySelector(replacecontent) &&
      this.response !== "" &&
      this.readyState == 4
    ) {
      elm.innerHTML = this.response;
      Array.from(elm.querySelectorAll("script")).forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  };
  xhr.send(formData);
  return false;
}

function submitform(form, replacecontent, target = "/") {
  if (!window.navigator.onLine) window.location.reload();
  sessionStorage.setItem("realtime-submit", "submitted");
  document.querySelector('input[name="loop"]').value = "0";
  refreshform(form, replacecontent, target);
  document.querySelector('input[name="loop"]').value = "loop";
  if (submitted != 0) clearInterval(submitted);
  submitted = setInterval(() => {
    refreshform(form, replacecontent, target);
  }, 5000);
}

function realtimesubmit(objbtn) {
  if (!confirm("確認提交？ \nDo you really want to submit?")) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!window.navigator.onLine) window.location.reload();
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("positionlat", position.coords.latitude);
        formData.append("positionlng", position.coords.longitude);
        formData.append("linename", objbtn.getAttribute("data"));
        formData.append("CSRF", objbtn.getAttribute("tk"));
        formData.append("stop", objbtn.getAttribute("stop"));
        formData.append("lang", objbtn.getAttribute("lang"));
        xhr.withCredentials = true;
        xhr.open("POST", "realtime/report.php");
        xhr.onreadystatechange = function () {
          if (this.response !== "" && this.readyState == 4)
            window.alert(this.response);
        };
        xhr.send(formData);
        submitform(
          document.querySelector("form"),
          ".realtimeresult",
          "realtime/index.php"
        );
      },
      () => {
        window.alert(
          "無法獲取地址，不能確認你是否在校巴站附近。\n We cannot verity that you are close to the bus stop."
        );
        return;
      },
      { timeout: 500 }
    );
  }
  return false;
}

function refreshinput() {
  document.querySelectorAll('input[type="text"], select').forEach((elm) => {
    const v = "realtime-" + elm.name;

    if (sessionStorage.getItem(v)) {
      elm.value = sessionStorage.getItem(v);
    }

    elm.addEventListener("change", () => {
      sessionStorage.setItem(v, elm.value);
    });
  });

  document
    .querySelectorAll('input[type="checkbox"], checkbox')
    .forEach((elm) => {
      const v = "realtime-" + elm.name;
      if (sessionStorage.getItem(v)) {
        if (sessionStorage.getItem(v) == "true") elm.checked = true;
        else if (sessionStorage.getItem(v) == "false") elm.checked = false;
        elm.dispatchEvent(new Event("change"));
      }
      elm.addEventListener("change", () => {
        sessionStorage.setItem(v, elm.checked);
      });
    });

  document.querySelectorAll('input[type="radio"]').forEach((elm) => {
    const v = "realtime-" + elm.name;
    if (sessionStorage.getItem(v)) {
      document
        .querySelectorAll('input[name="' + elm.name + '"]')
        .forEach((elem) => {
          if (elem.value == sessionStorage.getItem(v)) elem.checked = true;
          else elem.checked = false;
        });
      elm.dispatchEvent(new Event("change"));
    }

    elm.addEventListener("change", () => {
      sessionStorage.setItem(
        v,
        document.querySelector('input[name="' + elm.name + '"]:checked').value
      );
    });
  });

  if (sessionStorage.getItem("realtime-submit"))
    if (sessionStorage.getItem("realtime-submit") == "submitted")
      submitform(
        document.querySelector("form"),
        ".realtimeresult",
        "realtime/index.php"
      );
}

window.addEventListener("load", () => {
  if (localStorage.getItem("startingpt")) {
    const startingpt = localStorage.getItem("startingpt").split(" (")[0];
    document.querySelectorAll(".select-box option").forEach((ele) => {
      if (startingpt == ele.textContent)
        document.querySelector(".select-box").value = ele.value;
    });
    sessionStorage.setItem(
      "realtime-Dest",
      document.querySelector(".select-box").value
    );
    submitform(
      document.querySelector(".stopselector"),
      ".realtimeresult",
      "realtime/index.php"
    );
    localStorage.removeItem("startingpt");
  } else {
    refreshinput();
    submitform(
      document.querySelector(".stopselector"),
      ".realtimeresult",
      "realtime/index.php"
    );
  }
  sessionStorage.setItem("loadstate", "load");
});

window.addEventListener("pageshow", () => {
  if (!sessionStorage.getItem("loadstate")) location.reload();
  sessionStorage.removeItem("loadstate");
});
