var gju = require('geojson-utils');
var jsonfile = require('jsonfile');
var util = require('util');
var _ = require('lodash');
 
var geojsonFile = 'sl-sections.geojson';
var placesFile = 'places.json';

jsonfile.readFile(geojsonFile, function(err, geoJson) {

  jsonfile.readFile(placesFile, function(err, places) {
    var noMatchCount = 0;

    output = _.map(places.elements, function (place) {
      var result = {
        lon: place.lon,
        lat: place.lat,
        osm_id: place.id
      };
      result = _.merge(result, place.tags);


      var matchedGeoJson = _.find(geoJson.features, function(feature) {
        return gju.pointInPolygon({"type":"Point","coordinates":[place.lon,place.lat]},feature.geometry);
      });

      if (matchedGeoJson) {
        var properties = _.omit(matchedGeoJson.properties, ["CNTRY_NAME", "CNTRY_CODE", "WHO_CODE"]);
        result = _.merge(result, properties);
      } else {
        console.log("no match for ", place);
        noMatchCount++;
      }
      return result;
    });

    console.log("Processed " + output.length + " places. No matches for " + noMatchCount + " places");

    jsonfile.writeFile('villages.json', output, function (err) {
      console.error(err);
    });
  });
});
