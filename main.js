/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true,
    maxZoom: 12
}).setView([ibk.lat, ibk.lng], 11);

// thematische Layer
let themaLayer = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    snow: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://lawinen.report">CC BY avalanche.report</a>`
    }).addTo(map),
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Wetterstationen": themaLayer.stations,//.addTo(map),
    "Temperatur": themaLayer.temperature.addTo(map),
    "Wind": themaLayer.wind.addTo(map),
    "Schnee": themaLayer.snow.addTo(map),
}).addTo(map);
layerControl.expand();

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

function getColor(value, ramp){
    for (let rule of ramp){
        if (value >= rule.min && value < rule.max){
            return rule.color;
        }
    }

}


function writeStationLayer(jsondata){
    // Wetterstationen mit Icons und Popups implementieren
    L.geoJSON(jsondata)//addTo(themaLayer.stops)
    //console.log(response, jsondata)
    L.geoJSON(jsondata, {
        pointToLayer: function(feature, latlng) {
             return L.marker(latlng, {
                 icon: L.icon({
                     iconUrl: "icons/icons.png",
                     iconAnchor: [16, 37],
                     popupAnchor: [0, -37],
                 })
             });
         },
        onEachFeature: function(feature, layer){
            let prop = feature.properties;
            let geom = feature.geometry;
            let pointInTime = new Date(prop.date);
        
        
            layer.bindPopup(`
            <h4>Station: ${prop.name}, Seehöhe: ${geom.coordinates[2]}m ü. NN</h4>
            <ul>
                <li>Lufttemperatur in °C: ${prop.LT || "nicht gemessen"}</li>
                <li>Relative Luftfeuchte in %: ${prop.RH || "nicht gemessen"}</li>
                <li>Windgeschwindigkeit in km/h: ${prop.WG ? (prop.WG * 3.6).toFixed(1) : "nicht gemessen"}</li>
                <li>Schneehöhe in cm: ${prop.HS || "nicht gemessen"}</li>
            </ul>
            <span>Datum, Uhrzeit: ${pointInTime.toLocaleString()}</span>
            `);
        
        }
    }).addTo(themaLayer.stations);
}

function writeTemperatureLayer(jsondata){
    L.geoJSON(jsondata, {
        filter: function(feature){
            if (feature.properties.LT > -50 && feature.properties.LT < 50){
                return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color: ${color}">${feature.properties.LT.toFixed(1)}</span>`
                })
            });
        },

    }).addTo(themaLayer.temperature);


}

function writeWindLayer(jsondata){
    L.geoJSON(jsondata, {
        filter: function(feature){
            if (feature.properties.WG > 0 && feature.properties.WG < 150){
                return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            let color = getColor((feature.properties.WG), COLORS.wind);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color: ${color}">${(feature.properties.WG).toFixed(1)}</span>`
                })
            });
        },

    }).addTo(themaLayer.wind);


}

function writeSnowLayer(jsondata){
    L.geoJSON(jsondata, {
        filter: function(feature){
            if (feature.properties.HS > 0 && feature.properties.HS < 999){
                return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            let color = getColor((feature.properties.HS), COLORS.snow);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color: ${color}">${(feature.properties.HS).toFixed(1)}</span>`
                })
            });
        },

    }).addTo(themaLayer.snow);
}
// Vienna Sightseeing Haltestellen
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    writeStationLayer(jsondata);
    writeTemperatureLayer(jsondata);
    writeWindLayer(jsondata);
    writeSnowLayer(jsondata);

}

L.control.rainviewer({ 
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");