import React, {useState, useEffect, useReducer} from 'react';
import {
    FormGroup, FormControlLabel, Checkbox, FormLabel, Button, TextField, Switch, Grid, IconButton, LinearProgress,
    Divider, RadioGroup, Radio, Chip, Paper, Tooltip, Table, TableHead, TableBody, TableRow, TableCell
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ClearIcon from "@material-ui/icons/Clear";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MapIcon from '@material-ui/icons/Map';
import RoomIcon from '@material-ui/icons/Room';
import { useTranslation } from 'react-i18next';
import {Map, TileLayer, Marker, Rectangle, Circle} from 'react-leaflet';
//import { Icon } from 'leaflet';
import { latLngBounds } from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import { ReturnPopup } from '../../components'

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';

const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
//const mapCenter = [11.5024338, 17.7578122];
//const zoomLevel = 4;

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

const GET_ARCHAEOLOGICAL_SITES = gql`
    query searchArchaeoSites($searchTerm: String, $bbox: [String]) {
        archaeologicalSites(searchString: $searchTerm, coordinates: $bbox) {
            identifier
            name
            coordinates
            types
            locatedIn {
                identifier
                name
            }
        }
    }
`;

const GET_SITES_BY_REGION = gql`
    query byRegion($searchTerm: String, $idOfRegion: ID!) {
        sitesByRegion(searchString: $searchTerm, id: $idOfRegion) {
            identifier
            name
            coordinates
            types
            locatedIn {
                identifier
                name
            }
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
        const {type, payload} = action;
        switch (type) {
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
                    boundingBoxCorner1: state.boundingBoxCorner1.length === 0 ? [String(payload.lat), String(payload.lng)] : state.boundingBoxCorner1,
                    boundingBoxCorner2: state.boundingBoxCorner1.length === 0 ? state.boundingBoxCorner2 : [String(payload.lat), String(payload.lng)]
                };
            case 'MANUAL_BBOX':
                payload.value = payload.valueString.split(",").map(coordinateString => {
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
        mapCenter: [11.5024338, 17.7578122],
        mapBounds: latLngBounds([35,-14], [-34,41]),
        zoomLevel: 4,
        objectId: 0,
        regionId: 0,
        searchStr: "",
        projectList: [{"projectLabel": "African Archaeology Archive Cologne", "projectBestandsname": "AAArC"},
            {"projectLabel": "Friedrich Rakob’s Bequest", "projectBestandsname": "dai-rom-nara"},
            {"projectLabel": "Syrian Heritage Archive Project", "projectBestandsname": "Syrian-Heritage-Archive-Project"}],
        checkedProjects: [],
        mode: "archaeoSites",
        sitesMode: "",
        showSearchResults: false,
        showArchaeoSites: true,
        showRelatedObjects: false,
        chronOntologyTerm: "",
        boundingBoxCorner1: [],
        boundingBoxCorner2: [],
        drawBBox: false,
        mapControlsExpanded: true,
        resultsListExpanded: true
    };

    const [input, dispatch] = useReducer(inputReducer, initialInput);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjectsByString, setMapDataObjectsByString] = useState({});
    const [mapDataArchaeoSites, setMapDataArchaeoSites] = useState({});
    const [mapDataSitesByRegion, setMapDataSitesByRegion] = useState({});

    //queries
    const {data: dataContext, loading: loadingContext, error: errorContext} = useQuery(GET_CONTEXT_BY_ID, input.mode === "objects"
        ? {variables: {arachneId: input.objectId}}
        : {variables: {arachneId: 0}});

    const {data: dataObjectsByString, loading: loadingObjectsByString, error: errorObjectsByString} =
        useQuery(GET_OBJECTS, input.mode === "objects"
            ? {
                variables: {
                    searchTerm: input.searchStr, project: input.checkedProjects,
                    // only send coordinates if entered values have valid format (floats with at least one decimal place)
                    bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                        ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                        : [],
                    periodTerm: input.chronOntologyTerm
                }
            }
            : {variables: {searchTerm: "", project: [], bbox: [], periodTerm: ""}});

    const {data: dataArchaeoSites, loading: loadingArchaeoSites, error: errorArchaeoSites} = useQuery(GET_ARCHAEOLOGICAL_SITES, input.mode === "archaeoSites"
        ? {
            variables: {
                searchTerm: input.searchStr,
                // only send coordinates if entered values have valid format (floats with at least one decimal place)
                bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                    ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                    : []
            }
        }
        : {variables: {searchTerm: "", bbox: []}});

    const {data: dataSitesByRegion, loading: loadingSitesByRegion, error: errorSitesByRegion} = useQuery(GET_SITES_BY_REGION, input.sitesMode === "region"
        ? {variables: {searchTerm: input.searchStr, idOfRegion: input.regionId}}
        : {variables: {searchTerm: "", idOfRegion: 0}});

    const chronOntologyTerms = [
        'antoninisch', 'archaisch', 'augusteisch', 'FM III', 'frühkaiserzeitlich', 'geometrisch', 'hadrianisch',
        'hellenistisch', 'hochhellenistisch', 'kaiserzeitlich', 'klassisch', 'MM II', 'MM IIB', 'römisch', 'SB II',
        'severisch', 'SH IIIB', 'SM I', 'SM IB', 'trajanisch'
    ];

    const regions = [
        {title: 'Africa', id: 2042601},
        {title: 'Egypt', id: 2042786},
        {title: 'Meroe', id: 2293921},
        {title: 'Republic of Namibia', id: 2293917},
        {title: 'Sudan', id: 2042707},
        {title: 'Tschad', id: 2128989},
        {title: 'Wadi Howar Region Sudan', id: 2042736},
    ];

    const handleRelatedObjects = (id) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "objectId", value: id ? Number(id) : input.objectId}});
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showRelatedObjects"}})
        console.log("handleRelatedObjects!");
    };

    const panToAllMarkers = () => {
        const newMapBounds = latLngBounds(input.mapBounds);
        mapDataArchaeoSites.archaeologicalSites && mapDataArchaeoSites.archaeologicalSites.map((site, indexSite) => {
            return (site && newMapBounds.extend(site.coordinates.split(", ").reverse()))
        });
        dispatch({type: "UPDATE_INPUT", payload: {field: "mapCenter", value: newMapBounds.getCenter()}});
        dispatch({type: "UPDATE_INPUT", payload: {field: "zoomLevel", value: 3}});
    }

    const panToMarker = (id) => {
        const marker = mapDataArchaeoSites.archaeologicalSites.filter((site, indexSite) => `${site.identifier}-${indexSite}` === id)[0];
        const markerPosition = marker.coordinates.split(", ").reverse();
        dispatch({type: "UPDATE_INPUT", payload: {field: "mapCenter", value: markerPosition}});
        dispatch({type: "UPDATE_INPUT", payload: {field: "zoomLevel", value: 5}});
    }

    useEffect( () => {
        if(dataContext&&input.showRelatedObjects) {
            setMapDataContext(dataContext);
            console.log("rerender dataContext!");
            console.log("rerender dataContext --> dataContext: ", dataContext);
            console.log("rerender dataContext --> input:", input);
        }
    }, [dataContext, input.showRelatedObjects]);

    useEffect( () => {
        if (dataObjectsByString && input.showSearchResults && (input.searchStr!==""||input.checkedProjects.length!==0||input.chronOntologyTerm!==""
            ||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))) {
            setMapDataObjectsByString(dataObjectsByString);
            console.log("rerender dataObjectsByString!");
            console.log("rerender dataObjectsByString --> dataObjectsByString: ", dataObjectsByString);
            console.log("rerender dataObjectsByString --> input:", input);
        }
    }, [dataObjectsByString, input.showSearchResults, input.searchStr, input.checkedProjects, input.chronOntologyTerm, input.boundingBoxCorner1, input.boundingBoxCorner2]);

    useEffect( () => {
        if (dataArchaeoSites && input.showArchaeoSites && input.sitesMode!=="region" && (input.searchStr!==""||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))) {
            setMapDataArchaeoSites(dataArchaeoSites);
            console.log("rerender dataArchaeoSites!");
            console.log("rerender dataArchaeoSites --> dataArchaeoSites: ", dataArchaeoSites);
            console.log("rerender dataArchaeoSites --> input:", input);
        }
    }, [dataArchaeoSites, input.showArchaeoSites, input.searchStr, input.boundingBoxCorner1, input.boundingBoxCorner2, input.sitesMode]);

    useEffect( () => {
        if (dataSitesByRegion && input.showArchaeoSites && input.sitesMode==="region" && (input.searchStr!==""||(input.regionId!==0))) {
            setMapDataSitesByRegion(dataSitesByRegion);
            console.log("rerender dataSitesByRegion!");
            console.log("rerender dataSitesByRegion --> dataSitesByRegion: ", dataSitesByRegion);
            console.log("rerender dataSitesByRegion --> input:", input);
        }
    }, [dataSitesByRegion, input.showArchaeoSites, input.searchStr, input.regionId, input.sitesMode]);


    return(
        <div>
            <h2>{t('Map')}</h2>
            <div>
                {input.showSearchResults && <span>Showing search results</span>}
                {input.showRelatedObjects && <span>Showing related objects of </span>}
                {input.showRelatedObjects&&mapDataContext&&mapDataContext.entity&&<p>{mapDataContext.entity.name}</p>}
                {input.showArchaeoSites && <span>Showing archaeological sites</span>}
                {input.showArchaeoSites && mapDataSitesByRegion&& mapDataSitesByRegion.sitesByRegion&&mapDataSitesByRegion.sitesByRegion.length!==0 && <span> (by region)</span>}

                {loadingContext && <span>...loadingContext</span>}
                {errorContext && <span>...errorContext: {errorContext.message}</span> && console.log(errorContext.message)}
                {loadingObjectsByString && <span>...loadingObjectsByString</span>}
                {errorObjectsByString && <span>...errorObjectsByString</span> && console.log(errorObjectsByString.message)}
                {loadingArchaeoSites && <span>...loadingArchaeoSites</span>}
                {errorArchaeoSites && <span>...errorArchaeoSites</span> && console.log(errorArchaeoSites.message)}
                {loadingSitesByRegion && <span>...loadingSitesByRegion</span>}
                {errorSitesByRegion && <span>...errorSitesByRegion</span> && console.log(errorSitesByRegion.message)}
                {(loadingContext||loadingObjectsByString||loadingArchaeoSites||loadingSitesByRegion) && <LinearProgress />}

                {input.showRelatedObjects && <Button
                    onClick={() => handleRelatedObjects()}
                    name="hideRelatedObjects"
                    variant="contained"
                    color="primary">
                    Return to search results (hide related objects)
                </Button>}
            </div>
            <Grid className="grid-outer" container direction="row" spacing={2}>
                <Grid className="grid-map" item xs={12} lg={9}>
                    <Map
                        className="markercluster-map"
                        center={input.mapCenter}
                        //bounds={input.mapBounds}
                        zoom={input.zoomLevel}
                        minZoom={3}
                        //maxBounds={[[-90, -180], [90, 180]]}
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
                                <ReturnPopup object={mapDataContext.entity} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects} mapDataContextEntity={mapDataContext.entity}/>
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
                                            <ReturnPopup object={relatedObj} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects} mapDataContextEntity={mapDataContext.entity}/>
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
                                            <ReturnPopup object={entity} place={place} handleRelatedObjects={handleRelatedObjects} showRelatedObjects={input.showRelatedObjects} mapDataContextEntity={mapDataContext.entity}/>
                                        </Marker>
                                    )}
                                )
                            )})}
                            {input.showArchaeoSites&&(input.searchStr!==""||input.regionId!==0)&&mapDataSitesByRegion
                            && mapDataSitesByRegion.sitesByRegion && mapDataSitesByRegion.sitesByRegion.map((site, indexSite) => {
                                    return (site
                                        && <Marker
                                            key={`${site.identifier}-${indexSite}`}
                                            //coordinates need to be reversed because of different standards between geojson and leaflet
                                            position={site.coordinates.split(", ").reverse()}
                                        >
                                            <ReturnPopup object={site}/>
                                        </Marker>
                                    )
                                }
                            )
                            }
                            {input.showArchaeoSites&&(input.searchStr!==""||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataArchaeoSites
                            && mapDataArchaeoSites.archaeologicalSites && mapDataArchaeoSites.archaeologicalSites.map((site, indexSite) => {
                                    return (site
                                        && <Marker
                                            key={`${site.identifier}-${indexSite}`}
                                            //coordinates need to be reversed because of different standards between geojson and leaflet
                                            position={site.coordinates.split(", ").reverse()}
                                        >
                                            <ReturnPopup object={site}/>
                                        </Marker>
                                    )
                                }
                            )
                            }
                        </MarkerClusterGroup>
                    </Map>
                </Grid>
                {<Grid className="grid-next-to-map" item xs={12} lg={3} container direction="column">
                    <Paper>
                        <Grid className="grid-map-controls" item container direction="column">
                            <Divider/>
                            <Button
                                onClick={() => {
                                    dispatch({type: "TOGGLE_STATE", payload: {toggledField: "mapControlsExpanded"}})
                                }}
                            >
                                <h3>Filters</h3>
                                {input.mapControlsExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                            </Button>
                            {input.mapControlsExpanded
                                ? (<Grid className="grid-map-controls-expanded" item>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend">Search mode</FormLabel>
                                            <RadioGroup
                                                name="mapMode"
                                                value={input.mode}
                                                onChange={(event, newValue) => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "mode", value: newValue}})
                                                    dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showArchaeoSites"}})
                                                    dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
                                                }}
                                            >
                                                <FormControlLabel value="archaeoSites" control={<Radio />} label="Archaeological Sites"/>
                                                <FormControlLabel value="objects" control={<Radio />} label="Objects"/>
                                            </RadioGroup>
                                        </FormGroup>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend">Filter by search term</FormLabel>
                                            <TextField
                                                type="text"
                                                variant="outlined"
                                                name="searchStr"
                                                value={input.searchStr}
                                                placeholder="*"
                                                onChange={event => dispatch({type: "UPDATE_INPUT", payload: {field: event.currentTarget.name, value: event.currentTarget.value}})}
                                                InputProps={{
                                                    endAdornment: (
                                                        input.searchStr!==""
                                                        &&<IconButton
                                                            onClick={() => {
                                                                dispatch({type: "UPDATE_INPUT", payload: {field: "searchStr", value: ""}});
                                                            }}
                                                        >
                                                            <ClearIcon />
                                                        </IconButton>
                                                    )
                                                }}
                                            />
                                        </FormGroup>
                                    </Grid>
                                    {!input.showArchaeoSites && <Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend" disabled={input.showArchaeoSites}>Filter by projects</FormLabel>
                                            {input.projectList && input.projectList.map(project => {
                                                return (project
                                                    && <FormControlLabel
                                                        key={project.projectBestandsname}
                                                        control={
                                                            <Checkbox
                                                                checked={input.checkedProjects.includes(project.projectBestandsname)}
                                                                onChange={() => {
                                                                    dispatch({
                                                                        type: input.checkedProjects.includes(project.projectBestandsname) ? "UNCHECK_ITEM" : "CHECK_ITEM",
                                                                        payload: {field: "checkedProjects", toggledItem: project.projectBestandsname}
                                                                    })
                                                                }}
                                                                name={project.projectBestandsname}
                                                                key={project.projectBestandsname}
                                                                disabled={input.showArchaeoSites}
                                                            />
                                                        }
                                                        label={project.projectLabel}
                                                    />
                                                )
                                            })}
                                        </FormGroup>
                                    </Grid>}
                                    {!input.showArchaeoSites && <Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend" disabled={input.showArchaeoSites}>Filter by time</FormLabel>
                                            <Autocomplete
                                                name="chronOntologyTerm"
                                                options={chronOntologyTerms}
                                                onChange={(event, newValue) => {dispatch({type: "UPDATE_INPUT", payload: {field: "chronOntologyTerm", value: newValue}})}}
                                                renderInput={(params) => <TextField {...params} label="iDAI.chronontology term" variant="outlined" />}
                                                autoSelect={true}
                                                disabled={input.showArchaeoSites}
                                            />
                                        </FormGroup>
                                    </Grid>}
                                    {!input.showSearchResults && <Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend">Filter by region</FormLabel>
                                            <Autocomplete
                                                name="regionId"
                                                options={regions}
                                                getOptionLabel={(option) => option.title}
                                                getOptionSelected={(option, value) => {
                                                    return (option.id === value.id)
                                                }}
                                                onChange={(event, newValue) => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "region"}})
                                                    newValue===null
                                                        ? (dispatch({type: "UPDATE_INPUT", payload: {field: "regionId", value: 0}}), dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}}))
                                                        : dispatch({type: "UPDATE_INPUT", payload: {field: "regionId", value: newValue.id}});
                                                }}
                                                renderInput={(params) => <TextField {...params} label="" variant="outlined" />}
                                                autoSelect={true}
                                                disabled={input.sitesMode==="bbox"}
                                            />
                                        </FormGroup>
                                    </Grid>}
                                    {<Grid item xs={12}>
                                        <FormGroup>
                                            <FormLabel component="legend">Filter by coordinates (bounding box)</FormLabel>
                                            <TextField
                                                type="text"
                                                variant="outlined"
                                                name="boundingBoxCorner1"
                                                value={input.boundingBoxCorner1}
                                                placeholder="North, East decimal degrees"
                                                label="North, East decimal degrees"
                                                onChange={(event) => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "bbox"}});
                                                    // only create bbox if entered values have valid format (floats with at least one decimal place)
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
                                                            onClick={() => {
                                                                dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}});
                                                                dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner1", value: []}})}
                                                            }
                                                        >
                                                            <ClearIcon />
                                                        </IconButton>
                                                    )
                                                }}
                                                disabled={input.sitesMode==="region"}
                                            />
                                            <TextField
                                                type="text"
                                                variant="outlined"
                                                name="boundingBoxCorner2"
                                                value={input.boundingBoxCorner2}
                                                placeholder="South, West decimal degrees"
                                                label="South, West decimal degrees"
                                                onChange={(event) => {
                                                    dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: "bbox"}});

                                                    // only create bbox if entered values have valid format (floats with at least one decimal place)
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
                                                            onClick={() => {
                                                                dispatch({type: "UPDATE_INPUT", payload: {field: "sitesMode", value: ""}});
                                                                dispatch({type: "UPDATE_INPUT", payload: {field: "boundingBoxCorner2", value: []}})
                                                            }}
                                                        >
                                                            <ClearIcon />
                                                        </IconButton>
                                                    )
                                                }}
                                                disabled={input.sitesMode==="region"}
                                            />
                                            <FormControlLabel control={
                                                <Switch
                                                    name="drawBBox"
                                                    checked={input.drawBBox}
                                                    color="primary"
                                                    onChange={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "drawBBox"}})}
                                                    disabled={input.sitesMode==="region"}
                                                />
                                            }
                                                              label="Activate switch to select a bounding box directly on the map. Click the map in two places to select first the north-east corner, then the south-west corner."
                                                              labelPlacement="start"
                                            />
                                        </FormGroup>
                                    </Grid>}
                                </Grid>)
                                : (<Grid className="grid-map-controls-collapsed" item>
                                    <Chip label={input.mode === "archaeoSites" ? "Archaeological Sites" : "Objects"}/>
                                    {input.searchStr !== "" ? <Chip variant="outlined" label={`Search term: ${input.searchStr}`}/> : ""}
                                    {input.checkedProjects.length !== 0 ? <Chip variant="outlined" label={`Project: ${input.checkedProjects}`}/> : ""}
                                    {input.chronOntologyTerm !== "" ? <Chip variant="outlined" label={`Chronontology term: ${input.chronOntologyTerm}`}/> : ""}
                                    {input.sitesMode==="region" ? <Chip variant="outlined" label={`Region: ${regions[0].title}`}/> : ""/* TODO: replace with actually selected region title */}
                                    {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)&&(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))) ? <Chip variant="outlined" label={`Bounding box: [${input.boundingBoxCorner1}], [${input.boundingBoxCorner2}]`}/> : ""}
                                </Grid>)
                            }
                        </Grid>
                        <Grid className="grid-results-list" item container direction="column">
                            <Divider/>
                            <Button
                                onClick={() => {
                                    dispatch({type: "TOGGLE_STATE", payload: {toggledField: "resultsListExpanded"}})
                                }}
                            >
                                <h3>Search Results</h3>
                                {input.resultsListExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                            </Button>
                            <Tooltip title="Show all markers" arrow placement="right">
                                <MapIcon onClick={() => panToAllMarkers()}/>
                            </Tooltip>
                            {input.resultsListExpanded
                                ? (<Grid className="grid-results-list-expanded" item>
                                    { ((input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related)||(input.showSearchResults&&(input.searchStr!==""||input.projectList.length!==0||input.chronOntologyTerm!==""
                                        ||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataObjectsByString
                                        && mapDataObjectsByString.entitiesMultiFilter)||(input.showArchaeoSites&&(input.searchStr!==""||input.regionId!==0)&&mapDataSitesByRegion
                                        && mapDataSitesByRegion.sitesByRegion)||(input.showArchaeoSites&&(input.searchStr!==""||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataArchaeoSites
                                        && mapDataArchaeoSites.archaeologicalSites))
                                        ? (<Table size="small" stickyHeader aria-label="sticky table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Show on map
                                                    </TableCell>
                                                    <TableCell>
                                                        Title
                                                    </TableCell>
                                                    <TableCell>
                                                        Located in
                                                    </TableCell>
                                                    <TableCell>
                                                        iDAI.world link
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {input.showRelatedObjects&&input.objectId&&mapDataContext&&mapDataContext.entity&&mapDataContext.entity.related
                                                &&mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) =>
                                                {
                                                    if(relatedObj===null) return;
                                                    return(relatedObj.spatial
                                                        &&relatedObj.spatial.map( (place, indexPlace) =>
                                                        {return(place
                                                            && <TableRow key={`${place.identifier}-${indexPlace}-${indexRelatedObj}`}>
                                                                <TableCell>
                                                                    {place.coordinates
                                                                        ? (<Tooltip title="Show on map" arrow placement="right">
                                                                            <RoomIcon fontSize="small" onClick={() => panToMarker(`${place.identifier}-${indexPlace}-${indexRelatedObj}`)}/>
                                                                        </Tooltip>)
                                                                        : "no coordinates"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {relatedObj.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {place.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                        <a href={`https://arachne.dainst.org/entity/${relatedObj.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        )})
                                                    )
                                                })}
                                                {input.showSearchResults&&(input.searchStr!==""||input.projectList.length!==0||input.chronOntologyTerm!==""
                                                    ||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataObjectsByString
                                                && mapDataObjectsByString.entitiesMultiFilter && mapDataObjectsByString.entitiesMultiFilter.map( (entity, indexEntity) =>
                                                {return(entity.spatial
                                                    && entity.spatial.map( (place, indexPlace) =>
                                                        { return( place
                                                            && <TableRow key={`${place.identifier}-${indexPlace}-${indexEntity}`}>
                                                                <TableCell>
                                                                    {place.coordinates
                                                                        ? (<Tooltip title="Show on map" arrow placement="right">
                                                                            <RoomIcon fontSize="small" onClick={() => panToMarker(`${place.identifier}-${indexPlace}-${indexEntity}`)}/>
                                                                        </Tooltip>)
                                                                        : "no coordinates"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {entity.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {place.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                        <a href={`https://arachne.dainst.org/entity/${entity.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    )
                                                )})}
                                                {input.showArchaeoSites&&(input.searchStr!==""||input.regionId!==0)&&mapDataSitesByRegion
                                                && mapDataSitesByRegion.sitesByRegion && mapDataSitesByRegion.sitesByRegion.map( (site, indexSite) => {
                                                        return (site
                                                            &&
                                                    <TableRow key={`${site.identifier}-${indexSite}`}>
                                                        <TableCell>
                                                            {site.coordinates
                                                                ? (<Tooltip title="Show on map" arrow placement="right">
                                                                    <RoomIcon fontSize="small" onClick={() => panToMarker(`${site.identifier}-${indexSite}`)}/>
                                                                </Tooltip>)
                                                                : "no coordinates"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {site.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {site.locatedIn.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                <a href={`https://arachne.dainst.org/entity/${site.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                        )
                                                    }
                                                )}
                                                {input.showArchaeoSites&&(input.searchStr!==""||(input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0))&&mapDataArchaeoSites
                                                && mapDataArchaeoSites.archaeologicalSites && mapDataArchaeoSites.archaeologicalSites.map((site, indexSite) => {
                                                    return (site
                                                        &&
                                                        <TableRow key={`${site.identifier}-${indexSite}`}>
                                                            <TableCell>
                                                                {site.coordinates
                                                                    ? (<Tooltip title="Show on map" arrow placement="right">
                                                                        <RoomIcon fontSize="small" onClick={() => panToMarker(`${site.identifier}-${indexSite}`)}/>
                                                                    </Tooltip>)
                                                                    : "no coordinates"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {site.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {site.locatedIn.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                    <a href={`https://arachne.dainst.org/entity/${site.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                    )})}
                                            </TableBody>
                                        </Table>)
                                        : ("No results, try changing the filters")
                                    }
                                </Grid>)
                                : (<Grid className="grid-results-list-collapsed" item>
                                    {input.showRelatedObjects && mapDataContext.entity.related && `${mapDataContext.entity.related.length} results (related objects)`}
                                    {input.showSearchResults && mapDataObjectsByString.entitiesMultiFilter && `${mapDataObjectsByString.entitiesMultiFilter.length} results (objects)`}
                                    {input.showArchaeoSites && mapDataSitesByRegion.sitesByRegion && `${mapDataSitesByRegion.sitesByRegion.length} results (archaeological sites, by region)`}
                                    {input.showArchaeoSites && mapDataArchaeoSites.archaeologicalSites && `${mapDataArchaeoSites.archaeologicalSites.length} results (archaeological sites)`}
                                </Grid>)
                            }
                        </Grid>
                    </Paper>
                </Grid>}
            </Grid>
        </div>
    );
};