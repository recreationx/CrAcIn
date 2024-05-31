var map = L.map('map').setView([1.3521, 103.8198], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var sidebar = L.control.sidebar('sidebar').addTo(map);

var geoJsonLayer = L.geoJSON().addTo(map);
var markersLayerGroup = L.layerGroup().addTo(map);

function cracin_search() {

    $.ajax({
        url: '/cracin_search',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  }),
        success: function(response) {
            var geojsonData = response["trips"][0]["geometry"];
            geoJsonLayer.addData(geojsonData);
            var waypoints = response["waypoints"];
            waypoints.forEach(function(waypoint) {
                var [lng, lat] = waypoint.location;
                var marker = L.marker([lat, lng], {}).addTo(markersLayerGroup);
                
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
    $.ajax({
        url: '/heatmap',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({  }),
        success: function(response) {
            var heat = L.heatLayer(response, {blur: 50, radius:100, gradient: {0.1: 'blue', 0.2: 'lime', 0.3: 'red'}}).addTo(map);
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