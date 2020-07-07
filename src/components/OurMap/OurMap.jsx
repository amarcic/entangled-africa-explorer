import React, {useState, useEffect, useReducer} from 'react';
import { FormGroup, FormControlLabel, Checkbox, FormLabel, Button, TextField, Switch, Grid, IconButton } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from "@material-ui/icons/Clear";
import { useTranslation } from 'react-i18next';
import {Map, TileLayer, Marker, Rectangle, Circle} from 'react-leaflet';
//import { Icon } from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { ReturnPopup } from '../../components'

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';

const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const mapCenter = [11.5024338, 17.7578122];
const zoomLevel = 4;

const GET_CONTEXT_BY_ID = gql`
    query giveInf($arachneId: ID!) {
        entity(id: $arachneId) {
            identifier
            name
            spatial {
                identifier
                name
                coordinates
            }
            temporalArachne {
                title
                begin
                end
            }
            related(types: [Einzelobjekte]) {
                identifier
                name
                type
                spatial {
                    identifier
                    name
                    coordinates
                }
            }
        }
    }
`;

const GET_OBJECTS = gql`
    query search ($searchTerm: String, $project: [String], $bbox: [String], $periodTerm: String) {
        entitiesMultiFilter(searchString: $searchTerm, projects: $project, coordinates: $bbox, period: $periodTerm, entityTypes: [Einzelobjekte]) {
            identifier
            name
            spatial {
                identifier
                name
                coordinates
            }
            periodName
        }
    }
`;

export const OurMap = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
    };

    //state
    function inputReducer(state, action) {
        const { type, payload } = action;
        switch(type) {
            case 'UPDATE_INPUT':
                return {
                    ...state,
                    [payload.field]: payload.value
                };
            case 'CHECK_ITEM':
                return {
                    ...state,
                    [payload.field]: [...state[payload.field], payload.toggledItem]
                };
            case 'UNCHECK_ITEM':
                return {
                    ...state,
                    [payload.field]: state[payload.field].filter(checked => checked !== payload.toggledItem)
                };
            case 'TOGGLE_STATE':
                return {
                    ...state,
                    [payload.toggledField]: !state[payload.toggledField]
                };
            case 'DRAW_BBOX':
                return {
                    ...state,
                    boundingBoxCorner1: state.boundingBoxCorner1.length===0 ? [String(payload.lat),String(payload.lng)] : state.boundingBoxCorner1,
                    boundingBoxCorner2: state.boundingBoxCorner1.length===0 ? state.boundingBoxCorner2 : [String(payload.lat),String(payload.lng)]
                };
            case 'MANUAL_BBOX':
                payload.value = payload.valueString.split(",").map( coordinateString => {
                    return parseFloat(coordinateString).toFixed(coordinateString.split(".")[1].length)
                });
                return {
                    ...state,
                    [payload.field]: payload.value
                };
            default:
                //return { ...state, [type]: payload };
        }
    }

    const initialInput = {
        objectId: 0,
        searchStr: "",
        projectList: [{"projectLabel": "African Archaeology Archive Cologne", "projectBestandsname": "AAArC"},
            {"projectLabel": "Syrian Heritage Archive Project", "projectBestandsname": "Syrian-Heritage-Archive-Project"},
            {"projectLabel": "Friedrich Rakob’s Bequest", "projectBestandsname": "dai-rom-nara"}],
        checkedProjects: [],
        showSearchResults: true,
        showRelatedObjects: false,
        chronOntologyTerm: "",
        boundingBoxCorner1: [],
        boundingBoxCorner2: [],
        drawBBox: false
    };

    const [input, dispatch] = useReducer(inputReducer, initialInput);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjectsByString, setMapDataObjectsByString] = useState({});

    //queries
    const { data: dataContext, loading: loadingContext, error: errorContext } = useQuery(GET_CONTEXT_BY_ID, {variables: { arachneId: input.objectId }});
    const { data: dataObjectsByString, loading: loadingObjectsByString, error: errorObjectsByString } =
        useQuery(GET_OBJECTS, {variables: {searchTerm: input.searchStr, project: input.checkedProjects,
                bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                    ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                    : [],
                periodTerm: input.chronOntologyTerm}});
    const chronOntologyTerms = [
        'antoninisch', 'archaisch', 'augusteisch', 'FM III', 'frühkaiserzeitlich', 'geometrisch', 'hadrianisch',
        'hellenistisch', 'hochhellenistisch', 'kaiserzeitlich',  'klassisch', 'MM II', 'MM IIB', 'römisch', 'SB II',
        'severisch', 'SH IIIB', 'SM I', 'SM IB', 'trajanisch'
    ];

    const handleRelatedObjects = (id) => {
        console.log(id);
        dispatch({type: "UPDATE_INPUT", payload: {field: "objectId", value: id ? Number(id) : input.objectId}});
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showRelatedObjects"}})
        console.log("handleRelatedObjects!");
    };

    useEffect( () => {
        if(dataContext&&input.showRelatedObjects) {
            setMapDataContext(dataContext);
            console.log("rerender dataContext!");
            console.log("rerender dataContext --> dataContext: ", dataContext);
            console.log("rerender dataContext --> input:", input);
        }
    }, [dataContext, input.showRelatedObjects]);

    useEffect( () => {
        if (dataObjectsByString && input.showSearchResults && (input.searchStr!==""||input.projectList.length!==0||input.chronOntologyTerm!==""
            ||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))) {
            setMapDataObjectsByString(dataObjectsByString);
            console.log("rerender dataObjectsByString!");
            console.log("rerender dataObjectsByString --> dataObjectsByString: ", dataObjectsByString);
            console.log("rerender dataObjectsByString --> input:", input);
        }
    }, [dataObjectsByString, input.showSearchResults, input.searchStr, input.checkedProjects, input.chronOntologyTerm, input.boundingBoxCorner1, input.boundingBoxCorner2]);


    return(
        <div>
            <h2>{t('Map')}</h2>
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <FormGroup>
                            <FormLabel component="legend">Filter by search term</FormLabel>
                            <input
                                type="text"
                                name="searchStr"
                                defaultValue={input.searchStr}
                                placeholder="*"
                                onChange={event => dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})}
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <FormGroup>
                            <FormLabel component="legend">Filter by projects</FormLabel>
                            {input.projectList && input.projectList.map(project => {
                                return (project
                                    && <FormControlLabel
                                        key={project.projectBestandsname}
                                        control={
                                            <Checkbox
                                                checked={input.checkedProjects.includes(project.projectBestandsname)}
                                                onChange={() => {
                                                    dispatch({
                                                        type: input.checkedProjects.includes(project.projectBestandsname) ? "UNCHECK_ITEM": "CHECK_ITEM",
                                                        payload: {field: "checkedProjects", toggledItem: project.projectBestandsname}
                                                    })
                                                }}
                                                name={project.projectBestandsname}
                                                key={project.projectBestandsname}
                                            />
                                        }
                                        label={project.projectLabel}
                                    />
                                )
                            })}
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <FormLabel component="legend">Filter by time</FormLabel>
                        <Autocomplete
                            name="chronOntologyTerm"
                            options={chronOntologyTerms}
                            onChange={(event, newValue) => {dispatch({type: "UPDATE_INPUT", payload: {field: "chronOntologyTerm", value: newValue}})}}
                            renderInput={(params) => <TextField {...params} label="iDAI.chronontology term" variant="outlined" />}
                            autoSelect={true}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <FormLabel component="legend">Filter by coordinates (bounding box)</FormLabel>
                        <FormGroup>
                            <TextField
                                type="text"
                                variant="outlined"
                                name="boundingBoxCorner1"
                                value={input.boundingBoxCorner1}
                                placeholder="North, East decimal degrees"
                                label="North, East decimal degrees"
                                onChange={(event) => {
                                    // check whether the entered value is in the valid format "float,float"
                                    if(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(event.currentTarget.value)) {
                                        dispatch({type: "MANUAL_BBOX", payload: {field: event.currentTarget.name, valueString: event.currentTarget.value}})
                                    }
                                    else {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        input.boundingBoxCorner1.length!==0
                                        &&<IconButton
                                            onClick={() => dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner1" ,value: []}})}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <TextField
                                type="text"
                                variant="outlined"
                                name="boundingBoxCorner2"
                                value={input.boundingBoxCorner2}
                                placeholder="South, West decimal degrees"
                                label="South, West decimal degrees"
                                onChange={(event) => {
                                    // check whether the entered value is in the valid format "float,float"
                                    if(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(event.currentTarget.value)) {
                                        dispatch({type: "MANUAL_BBOX", payload: {field: event.currentTarget.name, valueString: event.currentTarget.value}})
                                    }
                                    else {
                                        dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})

                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        input.boundingBoxCorner2.length!==0
                                        &&<IconButton
                                            onClick={() => dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner2" ,value: []}})}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                            <FormControlLabel control={
                                <Switch
                                    name="drawBBox"
                                    checked={input.drawBBox}
                                    color="primary"
                                    onChange={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "drawBBox"}})}
                                />
                            }
                                              label="Activate switch to select a bounding box directly on the map. Click the map in two places to select first the north-east corner, then the south-west corner."
                                              labelPlacement="start"
                            />
                        </FormGroup>
                    </Grid>
                </Grid>

                {input.showRelatedObjects&&mapDataContext&&mapDataContext.entity&&<p>{mapDataContext.entity.name}</p>}

                {input.showSearchResults && <span>Showing search results</span>}
                {input.showRelatedObjects && <span>Showing related objects</span>}

                {loadingContext && <span>...loadingContext</span>}
                {errorContext && <span>...errorContext: {errorContext.message}</span> && console.log(errorContext.message)}
                {loadingObjectsByString && <span>...loadingObjectsByString</span>}
                {errorObjectsByString && <span>...errorObjectsByString</span> && console.log(errorObjectsByString.message)}

                {input.showRelatedObjects && <Button
                    onClick={() => handleRelatedObjects()}
                    name="hideRelatedObjects"
                    variant="contained"
                    color="primary">
                    Return to search results (hide related objects)
                </Button>}
            </div>

            <Map
                className="markercluster-map"
                center={mapCenter}
                zoom={zoomLevel}
                minZoom={3}
                maxBounds={[[-90, -180], [90, 180]]}
                onClick={(event) => {
                    if (input.drawBBox && (!(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) || !(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2)))) {
                        dispatch({type: "DRAW_BBOX", payload: event.latlng});
                    }
                }}
            >
                <TileLayer
                    attribution={osmAttr}
                    url={osmTiles}
                    noWrap={true}
                />
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
                {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.spatial
                &&mapDataContext.entity.spatial.map( (place, indexPlace) =>
                {return(place
                    &&<Marker
                        key={`${place.identifier}-${indexPlace}`}
                        //coordinates need to be reversed because of different standards between geojson and leaflet
                        position={place.coordinates.split(", ").reverse()}
                        opacity={1}
                    >
                        <ReturnPopup object={mapDataContext.entity} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects}/>
                    </Marker>
                )})}
                <MarkerClusterGroup>
                    {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related
                    &&mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) =>
                    {
                        if(relatedObj===null) return;
                        return(relatedObj.spatial
                            &&relatedObj.spatial.map( (place, indexPlace) =>
                            {return(place
                                &&<Marker
                                    key={`${place.identifier}-${indexPlace}-${indexRelatedObj}`}
                                    //coordinates need to be reversed because of different standards between geojson and leaflet
                                    position={place.coordinates.split(", ").reverse()}
                                    opacity={0.5}
                                >
                                    <ReturnPopup object={relatedObj} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects}/>
                                </Marker>
                            )})
                        )
                    })}
                    {input.showSearchResults&&(input.searchStr!==""||input.projectList.length!==0||input.chronOntologyTerm!==""
                        ||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataObjectsByString
                    &&mapDataObjectsByString.entitiesMultiFilter&&mapDataObjectsByString.entitiesMultiFilter.map( (entity, indexEntity) =>
                    {return(entity.spatial
                        && entity.spatial.map( (place, indexPlace) =>
                            { return( place
                                && <Marker
                                    key={`${place.identifier}-${indexPlace}-${indexEntity}`}
                                    //coordinates need to be reversed because of different standards between geojson and leaflet
                                    position={place.coordinates.split(", ").reverse()}
                                >
                                    <ReturnPopup object={entity} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects}/>
                                </Marker>
                            )}
                        )
                    )})}
                </MarkerClusterGroup>
            </Map>
        </div>
    );
};