var map = L.map('map').setView([1.3521, 103.8198], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var sidebar = L.control.sidebar('sidebar').addTo(map);
var geoJsonLayer = L.geoJSON().addTo(map);
var markersLayerGroup = L.layerGroup().addTo(map);

function cracin_search() {
    var route_password = document.getElementById("route_password").value;
    

    $.ajax({
        url: '/cracin_search',
        method: 'POST',
        dataType: 'json',
        data: { 'route_pw': route_password },
        success: function(response) {
            var geojsonData = response["trips"][0]["geometry"];
            geoJsonLayer.addData(geojsonData);
            var waypoints = response["waypoints"];
            document.querySelector(".table tbody").innerHTML = "";
            waypoints.sort((a, b) => a.waypoint_index - b.waypoint_index);
            waypoints.forEach(function(waypoint) {
                var [lng, lat] = waypoint.location;
                var marker = L.marker([lat, lng], {}).addTo(markersLayerGroup);
                waypoint.waypoint_index += 1;

                    // Create a new table row
                var newRow = document.createElement("tr");

                // Create a new table header cell for the index
                var indexCell = document.createElement("th");
                indexCell.textContent = waypoint.waypoint_index;
                newRow.appendChild(indexCell);

                // Create a new table data cell for the waypoint name
                var nameCell = document.createElement("td");
                nameCell.textContent = waypoint.name ? waypoint.name : "No name for this point.";
                newRow.appendChild(nameCell);
                
                // var buttonCell = document.createElement("td");
                // var button = document.createElement("button");
                // button.textContent = "Zoom";
                // button.addEventListener("click", function() {
                //     map.flyTo([lat, lng], 20);
                // });
                // buttonCell.appendChild(button);
                // newRow.appendChild(buttonCell);

                // Append the new row to the table body
                document.querySelector(".table tbody").appendChild(newRow);
                
                if (waypoint.name) {
                    marker.bindTooltip("Stop " + waypoint.waypoint_index + ": " + waypoint.name).openTooltip();
                } else {
                    marker.bindTooltip("Stop " + waypoint.waypoint_index).openTooltip();
                }
                [lng, lat] = waypoints[0].location;
                map.flyTo([lat, lng], 16);
            });
        },
        error: function(error) {
            console.error("Error fetching GeoJSON data:", error);
        }
    });
}

function heatmap() {
    var route_password = document.getElementById("route_password").value;

    $.ajax({
        url: '/heatmap',
        method: 'POST',
        dataType: 'json',
        data: { 'route_pw': route_password },
        success: function(response) {
            var heat = L.heatLayer(response, {blur: 50, radius:100, gradient: {0.1: 'blue', 0.2: 'lime', 0.3: 'red'}}).addTo(markersLayerGroup);
        },
        error: function(error) {
            console.error("Error fetching heatmap data:", error);
        }
    });
}

function clear_route() {
    geoJsonLayer.clearLayers();
    markersLayerGroup.clearLayers();
}