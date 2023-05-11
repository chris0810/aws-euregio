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
    "Wetterstationen": themaLayer.stations,
    "Temperatur": themaLayer.temperature.addTo(map),
}).addTo(map);

layerControl.expand()
// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function getColor(value, ramp){
for(let rule of ramp) {
    if(value >= rule.min && value < rule.max){
        return rule.color;
    }
}

}
console.log(getColor(-40, COLORS.temperature));

//


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
                            <b>Windgeschwindigkeit:</b> ${feature.properties.WG ? (feature.properties.WG*3.6).toFixed(1) + " km/h" : "keine verfügbaren Messdaten"} <br>
                            <b>Schneehöhe: </b>${feature.properties.HS ? feature.properties.HS + " cm" : "keine verfügbaren Messdaten"}
                            <span>Datum, Uhrzeit${pointInTime.toLocateString()}</span>`
                            );
                            
                        }
        
    }).addTo(themaLayer.stations);
   


function writeTemperatureLayer(jsondata){
    L.geoJSON(jsondata, {
        filter: function(feature){
            if(feature.properites.LT > -50 && feature.properites.LT <50){
               return true; 
            }
        },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: "aws-div-icon",
                html: `<span>${feature.properties.LT.toFixed}</span>`
            })
            });
        },
    }).addTo(themaLayer.temperature);
} 

     // Weatherstations
     async function loadStations(url) {
        let response = await fetch(url);
        let jsondata = await response.json();
        //console.log(jsondata.features);
        writeStationLayer(jsondata);
        writeTemperatureLayer(jsondata);

     }       
loadStations("https://static.avalanche.report/weather_stations/stations.geojson")}
