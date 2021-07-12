import React, { useEffect, useRef, useState } from "react";
import { Circle, Map, Rectangle, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { CreateMarkers } from '..'
import { useTranslation } from "react-i18next";
import { Card, FormLabel, Grid, IconButton, Switch, Tooltip } from "@material-ui/core";
import { useStyles } from '../../styles';
import MapIcon from "@material-ui/icons/Map";
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import { makeStyles } from "@material-ui/core/styles";


const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OurMap = (props) => {
    const [input, dispatch] = props.reducer;
    const {
        extendMapBounds,
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

    // additional styling for this component only
    const localStyles = makeStyles(theme => ({
        leafletContainer: {
            height: "100%"
        }
    }));

    const localClasses = localStyles();
    const classes = useStyles();

    const mapRef = useRef(null);

    useEffect(() => {
        mapRef.current.leafletElement.invalidateSize()
    },[input.areaCDefaultSize])

    return (
        <Card className={classes.card}>
            {/*TODO: find good position for this button*/}
            <IconButton
                onClick={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "areaCDefaultSize"}})
                }
                style={{backgroundColor: "rgba(171,134,97,0.18)", position: "relative", right: "-90%", top: "0%"}}
            >
                {input.areaCDefaultSize
                    ? <ZoomInIcon/>
                    : <ZoomOutIcon/>
                }
            </IconButton>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Map')}</h3>
                </Grid>
                <Grid item xs={5}>
                    <FormLabel>{t('Turn on/off marker clustering')}
                        <Tooltip title="Switch between showing individual markers or clustered circles." arrow placement="right-start">
                            <Switch
                                name="drawBBox"
                                checked={input.clusterMarkers}
                                color="primary"
                                onChange={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "clusterMarkers"}})}
                            />
                        </Tooltip>
                    </FormLabel>
                </Grid>
                <Grid item xs={5}>
                    <FormLabel
                        onClick={() => extendMapBounds()}
                        style={{cursor: "pointer"}}
                    >
                        {`${t('Resize map to show all markers')}\t`}
                        <Tooltip title="Automatically adjust the size of the map so all markers are visible." arrow placement="right">
                            <MapIcon/>
                        </Tooltip>
                    </FormLabel>
                </Grid>
            </Grid>
            <Grid className={classes.gridContent} item>
                <Map
                    ref={mapRef}
                    className={`markercluster-map ${localClasses.leafletContainer}`}
                    //center={input.mapCenter}
                    bounds={input.mapBounds}
                    zoom={input.zoomLevel}
                    minZoom={2}
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
                    {/*TODO: find a way to use marker clustering while still being able to open popups inside cluster; double check that the numbers for disableClusteringAtZoom are okay*/}
                    {input.clusterMarkers
                        ? (
                            <MarkerClusterGroup
                                disableClusteringAtZoom={input.clusterMarkers ? 20 : 1}
                            >
                                {renderingConditionRelatedObjects
                                && mapDataContext.entity.spatial
                                && <CreateMarkers
                                    data={mapDataContext.entity.spatial}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={handleRelatedObjects}
                                    showRelatedObjects={input.showRelatedObjects}
                                />}
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
                                && mapDataContext.entity.spatial
                                && <CreateMarkers
                                    data={mapDataContext.entity.spatial}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={handleRelatedObjects}
                                    showRelatedObjects={input.showRelatedObjects}
                                />}
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
            </Grid>
        </Card>
    )
}