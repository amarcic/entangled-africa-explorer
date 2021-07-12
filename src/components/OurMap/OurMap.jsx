import React, { useEffect, useRef } from "react";
import { Circle, Map, Rectangle, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { CreateMarkers } from '..'
import { useTranslation } from "react-i18next";
import { Card, FormLabel, Grid, Switch, Tooltip } from "@material-ui/core";
import { useStyles } from '../../styles';
import MapIcon from "@material-ui/icons/Map";
import { makeStyles } from "@material-ui/core/styles";
import { latLngBounds } from "leaflet";


const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OurMap = (props) => {
    const [input, dispatch] = props.reducer;
    const {
        handleRelatedObjects,
        data,
        dataType
    } = props;

    let markers = data;
    if(dataType.type === "related") markers = data.original;

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


    const resetMapBounds = () => {
        if(!markers) return;

        const newMapBounds = latLngBounds();
        markers.map( (item) => {
            if (item && item.coordinates) return newMapBounds.extend(item.coordinates.split(", ").reverse());
            else if (item && item.spatial) return item.spatial.map( (nestedItem) =>
                nestedItem && nestedItem.coordinates &&
                newMapBounds.extend(nestedItem.coordinates.split(", ").reverse()));
        });

        dispatch({type: "UPDATE_INPUT", payload: {field: "mapBounds", value: newMapBounds}});
    }

    useEffect(() => {
        mapRef.current.leafletElement.fitBounds(input.mapBounds);
    },[input.mapBounds])

    useEffect(() => {
        //this is needed to let the map adjust to its changed container size by loading more tiles and panning
        mapRef.current.leafletElement.invalidateSize();
    },[input.defaultLayout])


    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Map')}</h3>
                </Grid>
                <Grid item xs={5}>
                    <FormLabel>{t('Cluster nearby markers')}
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
                        onClick={() => resetMapBounds()}
                        style={{cursor: "pointer"}}
                    >
                        {`${t('Resize map on markers')}\t`}
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
                                {<CreateMarkers
                                    data={markers}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={dataType.handler === true && handleRelatedObjects}
                                    showRelatedObjects={dataType.handler === true && input.showRelatedObjects}
                                />}
                                {dataType.type === "related"
                                && <CreateMarkers
                                    data={data.related}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={dataType.handler === true && handleRelatedObjects}
                                    showRelatedObjects={dataType.handler === true && input.showRelatedObjects}
                                    opacity={0.5}
                                />}
                            </MarkerClusterGroup>
                        )
                        : (
                            <div>
                                {<CreateMarkers
                                    data={markers}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={dataType.handler === true && handleRelatedObjects}
                                    showRelatedObjects={dataType.handler === true && input.showRelatedObjects}
                                />}
                                {dataType.type === "related"
                                && <CreateMarkers
                                    data={data.related}
                                    selectedMarker={input.selectedMarker}
                                    handleRelatedObjects={dataType.handler === true && handleRelatedObjects}
                                    showRelatedObjects={dataType.handler === true && input.showRelatedObjects}
                                    opacity={0.5}
                                />}
                            </div>
                        )
                    }
                </Map>
            </Grid>
        </Card>
    )
}