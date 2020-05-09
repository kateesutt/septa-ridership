var map = L.map('map', {
  center: [40.0156, -75.2029],
  zoom: 12
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

//
// var loadData = function(route){
//   for(var i = 0; i < route.length - 1; i++){
//     console.log(route);
//     var pathOpts  = {'radius': Math.sqrt(route[i].Ridership)};
//     L.circleMarker([route[i].Lat, route[i].Long], pathOpts)
//     .addto(map);
//   }
// };
//
// var routePicker = document.querySelector('.route-picker');
//
// var checkRoutePicker = function(){
//   if (routePicker == 'route16_JSON'){
//     return route16_JSON;
//   } else {}
// };
//
// console.log(checkRoutePicker())
//
// routePicker.addEventListener('click', function(){
//   loadData(checkRoutePicker)}
// );



var routeStyle = {

  color: '#b1cee0',
  weight: 1,
  opacity: .5
};


fetch('https://opendata.arcgis.com/datasets/39f74b6d8b1b4b608933b5358d55be1c_0.geojson')
.then(function(response)
{
  return response.json();
})
.then(function(data){
  var routes = L.geoJson(data, routeStyle)
  .bindPopup(function (layer) {
    return '<div class = "popup">'
    + 'Route: ' + layer.feature.properties['Route']})
  routes.addTo(map);
});


//
// var addRoute = function(){
//   for(var i = 0; i < route16_JSON.length -1; i++){
//     var pathOpts = {'radius': Math.sqrt(route16_JSON[i].Ridership)};
//     L.circleMarker([route16_JSON[i].Lat, route16_JSON[i].Long], pathOpts)
//     .addTo(map)};
// }
//
// addRoute();
var getSize = function(num){
  if (num > 600){
    return 30;
  } else {
    return Math.sqrt(num/3);
  }};


// 'https://opendata.arcgis.com/datasets/e09e9f98bdf04eada214d2217f3adbf1_0.geojson'
// "https://services2.arcgis.com/9U43PSoL47wawX5S/arcgis/rest/services/Spring_2019_Stops_By_Route/FeatureServer/0/query?where=Mode='Highspeed'&returnGeometry=true&f=pgeojson&outFields=*"

// Route input event

var routeNumber = '' 
var modeFilter = ''



//Mode buttons
var allModesButton = document.getElementById('all-modes-button')
var trolleyButton = document.getElementById('trolley-button')
var railButton = document.getElementById('rail-button')

// route text input
var routeInput = document.getElementById('route-input')

// Calculate button
var calculateButton = document.getElementById('calculate')


trolleyButton.addEventListener('click', function(){
  modeFilter = 'Trolley'
})

allModesButton.addEventListener('click', function(){
  modeFilter = ''
})

railButton.addEventListener('click', function(){
  modeFilter = 'Highspeed'
})


routeInput.addEventListener('change', function(e) {
  routeNumber = e.target.value
})

// function() {
//   modeFilter = 'Trolley'
// }

var queryBase = "https://services2.arcgis.com/9U43PSoL47wawX5S/arcgis/rest/services/Spring_2019_Stops_By_Route/FeatureServer/0/query"
var queryEnd = "returnGeometry=true&f=pgeojson&outFields=*"



var stopsCurrent = null

function getQuery() {
 if (routeNumber && modeFilter) {
    return `${queryBase}?where=Route='${routeNumber} AND Mode=${modeFilter}&${queryEnd}`
  }
  if (routeNumber) {
    return `${queryBase}?where=Route='${routeNumber}'&${queryEnd}`
  }

  if (modeFilter) {
    return `${queryBase}?where=Mode='${modeFilter}'&${queryEnd}`
  } else {
    return 'https://opendata.arcgis.com/datasets/e09e9f98bdf04eada214d2217f3adbf1_0.geojson'
  }
}

function createStops() {
  fetch(getQuery())
  .then(function(response){
    return response.json();
  })
  .then(function(data){
    if (stopsCurrent) {
      stopsCurrent.clearLayers()
    }

    var fillOpacity = .25;
    if (routeNumber) {
       fillOpacity = .6;
     }

    // var pickacolor = function(){
    //   if (geoJsonFeature.properties.Route == BSL){
    //     return '#ff9900'
    //   } else {
    //     return '#11a381'
    //   }
    // }
    stopsCurrent = L.geoJson(data, {
      pointToLayer: function (geoJsonPoint, latlng){
        return L.circleMarker(latlng);
      },
      style: function(geoJsonFeature){
        if (geoJsonFeature.properties.Route == 'BSL') {console.log('yes')}
        var pickacolor = function(){
          if (geoJsonFeature.properties.Route == 'BSL'){
            console.log('should be orange');
            return '#ff9900'
          } else if (geoJsonFeature.properties.Route == 'MFL'){
            return '#0044ff'
          } else if (geoJsonFeature.properties.Route == 'NHSL'){
            return '#9502a8'
          } else if (geoJsonFeature.properties.Mode == 'Trolley'){
            return '#097d22'
          } else {
            return '#4bc6b9'
          }
        }
        return{
          fillColor: pickacolor(geoJsonFeature),
          radius: Math.sqrt((geoJsonFeature.properties.Weekday_Boards
            +geoJsonFeature.properties.Weekday_Leaves)),
          stroke: false,
          fillOpacity: fillOpacity
        };
      }
    })
    .bindPopup(function (layer) {
      console.log(layer.feature.properties);
      return '<div class = "popup">'
      + 'Route: ' + layer.feature.properties['Route'] + '<br>'
      + 'Stop Name: '+ layer.feature.properties['Stop_Name'] + '<br>'
      + 'Direction: '+ layer.feature.properties['Direction'] + '<br>'
      + 'Weekday Ons: '+ layer.feature.properties['Weekday_Boards'] + '<br>'
      + 'Weekday Offs: '+ layer.feature.properties['Weekday_Leaves'] + '<br>'
      + 'Saturday Ons: '+ layer.feature.properties['Saturday_Boards'] + '<br>'
      + 'Saturday Offs: '+ layer.feature.properties['Saturday_Leaves'] + '<br>'
    })
    .addTo(map);;
    map.fitBounds(stopsCurrent.getBounds());
  });
}





calculateButton.addEventListener('click', function() {
  createStops()
  modeFilter = ''
})

createStops()