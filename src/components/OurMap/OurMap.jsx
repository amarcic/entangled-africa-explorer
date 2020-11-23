import React from "react";
import { Map, TileLayer, Rectangle, Circle } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { CreateMarkers } from '..'
import {useTranslation} from "react-i18next";
import {Button} from "@material-ui/core";


const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OurMap = (props) => {
    const [input, dispatch] = props.reducer;

    const {
        handleRelatedObjects,
        mapDataObjects,
        mapDataContext,
        mapDataArchaeoSites,
        mapDataSitesByRegion,
        renderingConditionObjects,
        renderingConditionRelatedObjects,
        renderingConditionSites,
        renderingConditionSitesByRegion
    } = props;

    const { t, i18n } = useTranslation();

    return (
        <div>
            <h2>{t('Map')}</h2>
            <Map
                className="markercluster-map"
                //center={input.mapCenter}
                bounds={input.mapBounds}
                zoom={input.zoomLevel}
                minZoom={3}
                zoomSnap={0.5}
                onClick={(event) => {
                    if (input.drawBBox && (!(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) || !(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2)))) {
                        dispatch({type: "DRAW_BBOX", payload: event.latlng});
                    }
                }}
            >
                <TileLayer
                    className="map-tiles"
                    attribution={osmAttr}
                    url={osmTiles}
                    noWrap={true}
                />

                {/* Circles and Rectangles used for drawing bounding box */}
                {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1))
                &&<Circle
                    center={input.boundingBoxCorner1}
                    opacity={0.5}
                />}
                {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                &&<Circle
                    center={input.boundingBoxCorner2}
                    opacity={0.5}
                />}
                {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1))&&(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                &&<Rectangle
                    bounds={[input.boundingBoxCorner1,input.boundingBoxCorner2]}
                    weight={2}
                    opacity={0.25}
                    fillOpacity={0.05}
                />}

                {/* Markers */}
                {renderingConditionRelatedObjects
                && mapDataContext.entity.spatial
                && <CreateMarkers
                    data={mapDataContext.entity.spatial}
                    selectedMarker={input.selectedMarker}
                    handleRelatedObjects={handleRelatedObjects}
                    showRelatedObjects={input.showRelatedObjects}
                />}

                {/*TODO: find a way to use marker clustering while still being able to open popups inside cluster; double check that the numbers for disableClusteringAtZoom are okay*/}
                {input.clusterMarkers
                    ? (
                        <MarkerClusterGroup
                            disableClusteringAtZoom={input.clusterMarkers ? 20 : 1}
                        >
                            {renderingConditionRelatedObjects
                            && mapDataContext.entity.related
                            && <CreateMarkers
                                data={mapDataContext.entity.related}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                                //opacity={0.5}
                            />}
                            {renderingConditionObjects
                            && <CreateMarkers
                                data={mapDataObjects.entitiesMultiFilter}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                            />}
                            {renderingConditionSitesByRegion
                            && <CreateMarkers
                                data={mapDataSitesByRegion.sitesByRegion}
                                selectedMarker={input.selectedMarker}
                            />}
                            {renderingConditionSites
                            && <CreateMarkers
                                data={mapDataArchaeoSites.archaeologicalSites}
                                selectedMarker={input.selectedMarker}
                            />}
                        </MarkerClusterGroup>
                    )
                    : (<div>
                            {renderingConditionRelatedObjects
                            && mapDataContext.entity.related
                            && <CreateMarkers
                                data={mapDataContext.entity.related}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                                //opacity={0.5}
                            />}
                            {renderingConditionObjects
                            && <CreateMarkers
                                data={mapDataObjects.entitiesMultiFilter}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                            />}
                            {renderingConditionSitesByRegion
                            && <CreateMarkers
                                data={mapDataSitesByRegion.sitesByRegion}
                                selectedMarker={input.selectedMarker}
                            />}
                            {renderingConditionSites
                            && <CreateMarkers
                                data={mapDataArchaeoSites.archaeologicalSites}
                                selectedMarker={input.selectedMarker}
                            />}
                        </div>
                    )
                }
            </Map>
        </div>
    )
}