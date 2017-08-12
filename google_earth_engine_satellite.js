// pre-typhoon

// this is TOA
//var l8 = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')

// center on area of interest
Map.setCenter(124.5, 11, 9);

// Using raw in order to do simple composite (automatically converts to TOA)
var L8 = ee.ImageCollection('LANDSAT/LC8_L1T');

// filter to pre typhoon and area of interest
// "asFloat: true" gives proper (floating-point) TOA output instead of
// the mangled-to-UINT8 outputs of the original simpleComposite().
var composite = ee.Algorithms.Landsat.simpleComposite({
  collection: L8.filterDate('2013-06-01', '2013-11-01').filterBounds(polygon),
  asFloat: true});

// print true color
var visParams = {bands: ['B4', 'B3', 'B2'], max: 0.3};

Map.addLayer(composite, visParams, 'cloud-free');

//print(composite)

// Convert the raw data to top-of-atmosphere reflectance.
//var toa = ee.Algorithms.Landsat.TOA(composite);

// Convert the RGB bands to the HSV color space.
var hsv = composite.select(['B4', 'B3', 'B2']).rgbToHsv();

// Swap in the panchromatic band and convert back to RGB.
var sharpened = ee.Image.cat([
  hsv.select('hue'), hsv.select('saturation'), composite.select('B8')
]).hsvToRgb();

Map.addLayer(sharpened, {min: 0, max: 0.25, gamma: [1.3, 1.3, 1.3]},
             'pan-sharpened')

// Export the pre-sharpened image to Cloud Storage.
Export.image.toCloudStorage({
  image: composite,
  description: 'pre-typhoon_pre-sharpened_4326',
  bucket: 'kodak',
  scale: 15,
  maxPixels: 169806315,
//  crs: 'EPSG:3857',
  region: polygon
});

// Export the sharpened image to Cloud Storage.
Export.image.toCloudStorage({
  image: sharpened,
  description: 'pre-typhoon_4326',
  bucket: 'kodak',
  scale: 15,
  maxPixels: 169806315,
//  crs: 'EPSG:3857',
  region: polygon
});

// Export the sharpened image to an Earth Engine asset.
Export.image.toAsset({
  image: sharpened,
  description: 'sharpened_pre',
  assetId: 'sharpened_pre',
  scale: 15,
  maxPixels: 169806315,
  region: polygon,
   pyramidingPolicy: {
   '.default': 'sample'
   }
});

////////////////////////////////////////////////////////////////////////////

//post typhoon

// center on area of interest
Map.setCenter(124.5, 11, 9);

// Using raw in order to do simple composite (automatically converts to TOA)
var L8 = ee.ImageCollection('LANDSAT/LC8_L1T');

// filter to pre typhoon and area of interest
// "asFloat: true" gives proper (floating-point) TOA output instead of
// the mangled-to-UINT8 outputs of the original simpleComposite().
var composite = ee.Algorithms.Landsat.simpleComposite({
  collection: L8.filterDate('2013-11-11', '2014-06-01').filterBounds(polygon),
  asFloat: true});

// print true color
var visParams = {bands: ['B4', 'B3', 'B2'], max: 0.3};

Map.addLayer(composite, visParams, 'cloud-free');

//print(composite)

// Convert the raw data to top-of-atmosphere reflectance.
//var toa = ee.Algorithms.Landsat.TOA(composite);


// Convert the RGB bands to the HSV color space.
var hsv = composite.select(['B4', 'B3', 'B2']).rgbToHsv();

// Swap in the panchromatic band and convert back to RGB.
var sharpened = ee.Image.cat([
  hsv.select('hue'), hsv.select('saturation'), composite.select('B8')
]).hsvToRgb();

Map.addLayer(sharpened, {min: 0, max: 0.25, gamma: [1.3, 1.3, 1.3]},
             'pan-sharpened')


// Export the pre-sharpened image to Cloud Storage.
Export.image.toCloudStorage({
  image: composite,
  description: 'post-typhoon_pre-sharpened_4326',
  bucket: 'kodak',
  scale: 15,
  maxPixels: 169806315,
//  crs: 'EPSG:3857',
  region: polygon
});

// Export the sharpened image to Cloud Storage.
Export.image.toCloudStorage({
  image: sharpened,
  description: 'post-typhoon_4326',
  bucket: 'kodak',
  scale: 15,
  maxPixels: 169806315,
//  crs: 'EPSG:3857',
  region: polygon
});

// Export the sharpened image to an Earth Engine asset.
Export.image.toAsset({
  image: sharpened,
  description: 'sharpened_post',
  assetId: 'sharpened_post',
  scale: 15,
  maxPixels: 169806315,
  region: polygon,
   pyramidingPolicy: {
   '.default': 'sample'
   }
});

////////////////////////////////////////////////////////////////////////////

// difference between images saved as Earth Engine Assets

Map.setCenter(124.5, 11, 9);

// Compute the multi-band difference image.
var diff = sharpened_post.subtract(sharpened_pre);
// think of gamma as a shadows adjuster
Map.addLayer(diff, {min: 0, max: 0.25, gamma: [1.3, 1.3, 1.3]})
