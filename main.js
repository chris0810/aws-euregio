/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true,
    

}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature:L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`,
        maxZoom: 12,
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations.addTo(map),
    "Temperatur": themaLayer.temperature.addTo(map),
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function writeStationLayer(jsondata){

    
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/icons.png',
                    iconSize: [37, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },

        onEachFeature: function (feature, layer) {
        
            let pointInTime= new Date(feature.properties.date);
            //console.log(pointInTime);

            
            layer.bindPopup(`<h3>${feature.properties.name}, ${feature.geometry.coordinates[2]} m ü.A. </h3><br> 
                            <b>Lufttemperatur: </b> ${feature.properties.LT ? feature.properties.LT + " °C" : "keine verfügbaren Messdaten"} <br>
                            <b>Relative Luftfeuchte: </b>${feature.properties.RH ? feature.properties.RH + " %" : "keine verfügbaren Messdaten"} <br>
                            <b>Windgeschwindigkeit:</b> ${feature.properties.WG ? feature.properties.WG + " km/h" : "keine verfügbaren Messdaten"} <br>
                            <b>Schneehöhe: </b>${feature.properties.HS ? feature.properties.HS + " cm" : "keine verfügbaren Messdaten"}
                            <span>${pointInTime.toLocateString}</span>`
                            );
                            
                        }
        
    }).addTo(themaLayer.stations);
   

}
     // Weatherstations
     async function loadStations(url) {
        let response = await fetch(url);
        let jsondata = await response.json();
        //console.log(jsondata.features);
        writeStationLayer(jsondata);

     }       
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");
