function append_query(query, value) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  query_arr = Object.keys(params).map((key) => [key.toString()]);
  value_arr = Object.keys(params).map((key) => [params[key]]);
  index = query_arr.findIndex((element) => element == query);
  if (index < 0) {
    var loc = location.href;
    loc += location.href.indexOf("?") === -1 ? "?" : "&";
    location.href = loc + query + "=" + value;
  } else {
    value_arr[index] = value;
    var querypath = "";
    query_arr.forEach((element, index) => {
      querypath = querypath + "&" + element + "=" + value_arr[index];
    });
    var finalurl = location.href.split("?")[0] + "?" + querypath;
    location.href = finalurl;
  }
}

function createRouteMap(route, selectedStationIndex = 2) {
  const container = document.getElementById("detail-route-container");

  // Close the map if it's already open
  if (container.classList.contains("show")) {
    closeRouteMap();
    // Use setTimeout to ensure the closing animation completes before reopening
    setTimeout(() => populateAndShowMap(route, selectedStationIndex), 300);
  } else {
    populateAndShowMap(route, selectedStationIndex);
  }
}

function populateAndShowMap(route, selectedStationIndex) {
  const container = document.getElementById("detail-route-container");
  const mapContainer = document.getElementById("map-container");

  // Clear previous content
  mapContainer.innerHTML = "";

  route.forEach((station, index) => {
    const stationContainerWrapper = document.createElement("div");
    stationContainerWrapper.className = "station-container-wrapper";
    if (index < selectedStationIndex)
      stationContainerWrapper.classList.add("completed");

    const stationContainer = document.createElement("div");
    stationContainer.className = "station-container";

    const stationNumber = document.createElement("div");
    stationNumber.className = "station-number";
    stationNumber.textContent = index + 1;

    const stationName = document.createElement("div");
    stationName.className = "station-name";
    stationName.textContent = station;

    stationContainer.appendChild(stationNumber);
    stationContainer.appendChild(stationName);
    stationContainerWrapper.appendChild(stationContainer);
    mapContainer.appendChild(stationContainerWrapper);
  });

  // Show the container
  container.classList.add("show");

  // scroll to current station
  const currentStation =
    document.querySelectorAll(".station-container")[
      selectedStationIndex - 1 < 0 ? 0 : selectedStationIndex - 1
    ];
  currentStation.scrollIntoView({ behavior: "smooth" });
}

function closeRouteMap() {
  const container = document.getElementById("detail-route-container");
  container.classList.remove("show");
}
