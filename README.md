## Targeting disaster relief from space

This project uses machine learning and satellite imagery to better target disaster relief efforts. I focused on Typhoon Haiyan, which hit the Philippines in November of 2013. It broke records for having the highest wind speeds upon landfall and destroyed over 1 million homes.

After natural disasters, it's important to understand which areas suffered the most damage in order to prioritize relief efforts. Often times damage assessment maps are created by volunteers with the Humanitarian Open Street Map team who compare satellite imagery before and after the disaster and manually label each building with their evaluation of damage. However these maps are time and labor intensive to create, and not always accurate.

Studies have found that Open Street Map data often over-estimates damage in areas that are talked about in the news and under-estimates damage elsewhere.

## Goal

My goal was to create a model that could more quickly and more accurately identify the hardest hit areas in order to better target disaster relief.

Using satellite imagery before and after Typhoon Haiyan in the Philippines, I built a neural network to detect damaged buildings. Using the predictions from the model, I then created density maps of damage, illustrating priority areas for relief efforts.

## Data

I used Landsat8 satellite imagery, which is at 15 meter resolution (and available freely through Google Earth Engine). This resolution is much lower than commercially available satellite imagery (which can get up to 30 cm per pixel!), but the success of this model using publicly available data demonstrates its applicability to organizations that may be limited in funding.

<p align="center">
<img src="https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/satellite.png?raw=true" alt="Pre and post typhoon satellite imagery" width="600">
</p>

Above is an example of satellite imagery pre and post typhoon for Tacloban City, one of the hardest hit areas. On the left, lighter color squares representing buildings are visible. On the right, there is much more grey as these buildings were destroyed.

My ground truth data on building damage came from the Copernicus Emergency Management Service. 

<p align="center">
<img src="https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/buildings.png?raw=true" alt="Building damage" width="300">
</p>

An example of my building damage data is shown above, with different colors squares indicating different levels of damage. Superimposing these polygons on my satellite imagery, I labeled each pixel in my satellite imagery as either being part of a damaged building or not.

## Random forest baseline model

My baseline model was a random forest pixel-wise classification (with each pixel either being damaged or not damaged). The model features came from the band information from my satellite data, i.e., for each pixel, how much red it has, how much blue, green, UV, infrared, etc.

I did a pixel wise subtraction between pre-typhoon and post-typhoon imagery given that it is a change detection model. I wanted to understand whether there was a building there before but isn't there anymore.

However many things can change — buildings can collapse and vegetation can bloom. Yet vegetation reflects infrared really highly whereas buildings do not. By including the pre and post pixel values in addition to the subtraction values, I was able to better identify buildings.

To deal with a class imbalance, I trained the model on a balanced sample. This made it more sensitive to damaged buildings.

When I trained a random forest on the top half of three satellite images and had it predict on the bottom half, it did very well as shown by the ROC curve which is very close to the upper left hand corner. However when I asked the model to predict on an image it hasn't seen before, the ROC curve dropped precipitously. This indicates that the model does a poor job of generalizing. The model is therefore hard to scale as it would be infeasible to train a model on every part of a country after a natural disaster.

![alt text](https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/random_forest.png?raw=true "Random forest ROC curves")

One reason why the model struggles to generalize may be that satellite images can be taken at different times of day and therefore can have different lighting (note the differences below) — meaning that the thresholds identified in one model may not apply to other imagery.

<p align="center">
<img src="https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/light_diffs.png?raw=true" alt="Satellite imagery comparison">
</p>

## A superior U-Net model

To create a model that is more generalizable, I built a neural net called a U-Net, named for its structure of convolutional layers. U-Nets are known to be good for object detection (segmentation).

This model did quite well with my data. The ROC on the left is for the validation set, which are images the model has seen. On the right is the ROC curve for the holdout set, which are images the model has never seen before. Unlike the random forest, the ROC curve didn't drop significantly. The fact that this model extends well to new images is important as one would want to feed in satellite imagery for an entire country to generate hotspot predictions after a natural disaster.

![alt text](https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/unet_roc.png?raw=true "U-Net ROC")

## Mapping the density of damage

The U-Net predictions identify where the damaged buildings are, and from this, I created a density map highlighting the areas with the greatest building damage.

![alt text](https://github.com/ejm714/disaster_relief_from_space/blob/master/imgs/ground_truth_and_prediction.png?raw=true "Ground truth and prediction")

On the left is the post-typhoon satellite imagery. In the middle is the ground truth data with the black marking damaged buildings — this aligns with the grey in the satellite imagery. On the right is a density map of damage based on predictions from the model with the darkest areas being the most damaged areas, and therefore priority areas for relief efforts. As the predictions are on a holdout set, the similarity between ground truth and prediction illustrates the model's ability to scale.

## Applications

This sort of change detection model has many applications. For example, it could be used to identify illegal deforestation, monitor rising sea levels caused by global warming, or identify crop loss due to droughts or floods.

In the case of disaster relief as I've written about today, this model enables targeting of limited resources to ensure that structural building assessments, food, water, and other aid are going to the people who need it most.

-----
**Languages**: Python, JavaScript
**Libraries**: Keras + TensorFlow, numpy, pandas, sklearn, rasterio, geopandas, shapely, opencv, matplotlib, seaborn
**Methods**: Deep learning, classification (supervised learning)

Replication notes:

- `google_earth_engine_satellite.js` pulls the satellite imagery from Google Earth Engine and should be run first.
- Building data shapefiles (grading maps) can be downloaded manually from the <a href="http://emergency.copernicus.eu/mapping/list-of-components/EMSR058">Copernicus Emergency Management Service website</a>.
- `0.0-data_prep.ipynb` is a precursor to two modeling notebooks. The latter two can be run independently of one another.
