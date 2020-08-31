import React, { useState, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import {
    Button, Divider, Grid, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Tooltip
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MapIcon from '@material-ui/icons/Map';
import RoomIcon from '@material-ui/icons/Room';

import { Map, TileLayer, Rectangle, Circle } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";

import { CreateMarkers, Filters, CollapsedFilters } from '..'

import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';


// Queries
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


const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';


export const OurMap = () => {
    const {t, i18n} = useTranslation();

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
    };

    // State
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
        mapBounds: latLngBounds([28.906303, -11.146792], [-3.355435, 47.564145]),
        zoomLevel: 5,
        objectId: 0,
        regionId: 0,
        regionTitle: null,
        searchStr: "80",
        projectList: [{"projectLabel": "African Archaeology Archive Cologne", "projectBestandsname": "AAArC"},
            {"projectLabel": "Friedrich Rakob’s Bequest", "projectBestandsname": "dai-rom-nara"},
            {"projectLabel": "Syrian Heritage Archive Project", "projectBestandsname": "Syrian-Heritage-Archive-Project"}],
        checkedProjects: [],
        checkedProjectsLabels: [],
        mode: "archaeoSites",
        sitesMode: "",
        showSearchResults: false,
        showArchaeoSites: true,
        showRelatedObjects: false,
        chronOntologyTerm: null,
        boundingBoxCorner1: [],
        boundingBoxCorner2: [],
        drawBBox: false,
        mapControlsExpanded: true,
        resultsListExpanded: true,
        selectedMarker: undefined
    };

    const [input, dispatch] = useReducer(inputReducer, initialInput);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjectsByString, setMapDataObjectsByString] = useState({});
    const [mapDataArchaeoSites, setMapDataArchaeoSites] = useState({});
    const [mapDataSitesByRegion, setMapDataSitesByRegion] = useState({});

    // Queries
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

    function openPopup(index) {
        console.log("openPopup...");
        console.log("selected index / marker:", index);
        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedMarker", value: index}});
    }

    const extendMapBounds = () => {
        let markers;
        if(mapDataContext.entity) markers = mapDataContext.entity;
        else if(mapDataObjectsByString.entitiesMultiFilter) markers = mapDataObjectsByString.entitiesMultiFilter;
        else if(mapDataSitesByRegion.sitesByRegion) markers = mapDataSitesByRegion.sitesByRegion;
        else if(mapDataArchaeoSites.archaeologicalSites) markers = mapDataArchaeoSites.archaeologicalSites;
        const newMapBounds = latLngBounds();
        markers.map((item) => {
            if (item && item.coordinates) return newMapBounds.extend(item.coordinates.split(", ").reverse());
            else if (item && item.spatial) return item.spatial.map( (nestedItem) =>
                nestedItem &&
                newMapBounds.extend(nestedItem.coordinates.split(", ").reverse()));
        });
        dispatch({type: "UPDATE_INPUT", payload: {field: "mapBounds", value: newMapBounds}});
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
        if (dataObjectsByString && input.showSearchResults && (input.searchStr!==""||input.checkedProjects.length!==0||input.chronOntologyTerm!==null
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
            <Grid className="grid-outer" container direction="row" spacing={1}>
                <Grid className="grid-map-controls" item container direction="column" xs={12}>
                    <Divider/>
                    <Button
                        size="small"
                        onClick={() => {
                            dispatch({type: "TOGGLE_STATE", payload: {toggledField: "mapControlsExpanded"}})
                        }}
                    >
                        <h3>Filters</h3>
                        {input.mapControlsExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                    </Button>
                    {input.mapControlsExpanded
                        ? <Filters
                            chronOntologyTerms={chronOntologyTerms}
                            dispatch={dispatch}
                            input={input}
                            regions={regions}
                        />
                        : (/*summary of active filters when control panel is closed*/
                            <CollapsedFilters
                                input={input}
                            />
                        )
                    }
                </Grid>
                <Grid item className="grid-loading-indicator" xs={12}>
                    {/*{input.showSearchResults && <span>Showing search results</span>}
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
                    {errorSitesByRegion && <span>...errorSitesByRegion</span> && console.log(errorSitesByRegion.message)}*/}

                    {(loadingContext||loadingObjectsByString||loadingArchaeoSites||loadingSitesByRegion) && <LinearProgress />}

                    {input.showRelatedObjects && <Button
                        onClick={() => handleRelatedObjects()}
                        name="hideRelatedObjects"
                        variant="contained"
                        color="primary"
                        size="small">
                        Return to search results (hide related objects)
                    </Button>}
                </Grid>
                <Grid className="grid-map" item xs={12} lg={9}>
                    <Map
                        className="markercluster-map"
                        //center={input.mapCenter}
                        bounds={input.mapBounds}
                        zoom={input.zoomLevel}
                        minZoom={3}
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
                        {input.showRelatedObjects
                        && input.objectId
                        && mapDataContext
                        && mapDataContext.entity
                        && mapDataContext.entity.spatial
                        && <CreateMarkers
                            data={mapDataContext.entity.spatial}
                            selectedMarker={input.selectedMarker}
                            handleRelatedObjects={handleRelatedObjects}
                            showRelatedObjects={input.showRelatedObjects}
                        />}
                        {/*<MarkerClusterGroup>*/ /*TODO: find a way to use marker clustering while still being able to open popups inside cluster*/}
                            {input.showRelatedObjects
                            && input.objectId
                            && mapDataContext
                            && mapDataContext.entity
                            && mapDataContext.entity.related
                            && <CreateMarkers
                                data={mapDataContext.entity.related}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                                //opacity={0.5}
                            />}
                            {input.showSearchResults
                            && (input.searchStr!==""
                                || input.projectList.length!==0
                                || input.chronOntologyTerm!==null
                                || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
                            && mapDataObjectsByString
                            && mapDataObjectsByString.entitiesMultiFilter
                            && <CreateMarkers
                                data={mapDataObjectsByString.entitiesMultiFilter}
                                selectedMarker={input.selectedMarker}
                                handleRelatedObjects={handleRelatedObjects}
                                showRelatedObjects={input.showRelatedObjects}
                            />}
                            {input.showArchaeoSites
                            && input.sitesMode==="region"
                            && (input.searchStr!=="" || input.regionId!==0)
                            && mapDataSitesByRegion
                            && mapDataSitesByRegion.sitesByRegion
                            && <CreateMarkers
                                data={mapDataSitesByRegion.sitesByRegion}
                                selectedMarker={input.selectedMarker}
                            />}
                            {input.showArchaeoSites
                            && input.sitesMode!=="region"
                            && (input.searchStr!==""
                                || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
                            && mapDataArchaeoSites
                            && mapDataArchaeoSites.archaeologicalSites
                            && <CreateMarkers
                                data={mapDataArchaeoSites.archaeologicalSites}
                                selectedMarker={input.selectedMarker}
                            />}
                        {/*</MarkerClusterGroup>*/}
                    </Map>
                </Grid>
                {<Grid className="grid-results-list-outer" item xs={12} lg={3} container direction="column">
                    {<Grid className="grid-results-list" item container direction="column">
                        <Divider/>
                        <Button
                            size="small"
                            onClick={() => {
                                dispatch({type: "TOGGLE_STATE", payload: {toggledField: "resultsListExpanded"}})
                            }}
                        >
                            <h3>Search Results</h3>
                            {input.resultsListExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                        </Button>
                        <Tooltip title="Show all markers" arrow placement="right">
                            <MapIcon onClick={() => extendMapBounds()}/>
                        </Tooltip>
                        {input.resultsListExpanded
                            ? (<Grid className="grid-results-list-expanded" item>
                                {/* Conditions for rendering a table */
                                    (
                                        (
                                            input.showRelatedObjects
                                            && input.objectId
                                            && mapDataContext
                                            && mapDataContext.entity
                                        )
                                        ||
                                        (
                                            input.showSearchResults
                                            && (
                                                input.searchStr!==""
                                                || input.projectList.length!==0
                                                || input.chronOntologyTerm!==null
                                                || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0)
                                            )
                                            && mapDataObjectsByString
                                            && mapDataObjectsByString.entitiesMultiFilter
                                        )
                                        || (
                                            input.showArchaeoSites
                                            && input.sitesMode==="region"
                                            && (
                                                input.searchStr!==""
                                                || input.regionId!==0
                                            )
                                            && mapDataSitesByRegion
                                            && mapDataSitesByRegion.sitesByRegion
                                        )
                                        || (
                                            input.showArchaeoSites
                                            && input.sitesMode!=="region"
                                            && (
                                                input.searchStr!==""
                                                || (input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0)
                                            )
                                            && mapDataArchaeoSites
                                            && mapDataArchaeoSites.archaeologicalSites
                                        )
                                    )
                                        ? /* Yes, render a table */
                                        (<Table size="small" stickyHeader aria-label="sticky table">
                                            {/* Table header */}
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
                                            {/* Table body */}
                                            <TableBody>
                                                {/* Table row(s) for selected object */}
                                                {input.showRelatedObjects
                                                && input.objectId
                                                && mapDataContext
                                                && mapDataContext.entity
                                                && <TableRow>
                                                    <TableCell align="center" colSpan={4}>
                                                        Selected object:
                                                    </TableCell>
                                                </TableRow>}
                                                {input.showRelatedObjects
                                                && input.objectId
                                                && mapDataContext
                                                && mapDataContext.entity
                                                && mapDataContext.entity.spatial
                                                && mapDataContext.entity.spatial.map( (place, indexPlace) => {
                                                        return (place === null
                                                                ? (mapDataContext.entity
                                                                    && <TableRow>
                                                                        <TableCell>
                                                                            (No coordinates)
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {mapDataContext.entity.name}
                                                                        </TableCell>
                                                                        <TableCell>

                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Tooltip
                                                                                title="View original entry in iDAI.world"
                                                                                arrow placement="right">
                                                                                <a href={`https://arachne.dainst.org/entity/${mapDataContext.entity.identifier}`}
                                                                                   target="_blank"
                                                                                   rel="noreferrer"><ExitToAppIcon/></a>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>)
                                                                : (place
                                                                    && <TableRow key={indexPlace}>
                                                                        <TableCell>
                                                                            {place.coordinates
                                                                                ? (<Tooltip title="Show on map" arrow placement="right">
                                                                                    <RoomIcon
                                                                                        fontSize="small"
                                                                                        onClick={() => openPopup(indexPlace)}
                                                                                    />
                                                                                </Tooltip>)
                                                                                : "(No coordinates)"}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {mapDataContext.entity.name}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {place.name}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Tooltip
                                                                                title="View original entry in iDAI.world"
                                                                                arrow placement="right">
                                                                                <a href={`https://arachne.dainst.org/entity/${mapDataContext.entity.identifier}`}
                                                                                   target="_blank"
                                                                                   rel="noreferrer"><ExitToAppIcon/></a>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>)
                                                        )
                                                    }
                                                )}
                                                {/* Table row(s) for related objects */}
                                                {input.showRelatedObjects
                                                && input.objectId
                                                && mapDataContext
                                                && mapDataContext.entity
                                                && mapDataContext.entity.related
                                                && <TableRow>
                                                    <TableCell align="center" colSpan={4}>
                                                        Related objects:
                                                    </TableCell>
                                                </TableRow>}
                                                {input.showRelatedObjects
                                                && input.objectId
                                                && mapDataContext
                                                && mapDataContext.entity
                                                && mapDataContext.entity.related
                                                && mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) => {
                                                        return ( relatedObj
                                                            && relatedObj.spatial
                                                            && relatedObj.spatial.map( (place, indexPlace) => {
                                                                    return (place === null
                                                                            ? (relatedObj
                                                                                && <TableRow key={indexRelatedObj + '.' + indexPlace}>
                                                                                    <TableCell>
                                                                                        (No coordinates)
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {relatedObj.name}
                                                                                    </TableCell>
                                                                                    <TableCell>

                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Tooltip
                                                                                            title="View original entry in iDAI.world"
                                                                                            arrow placement="right">
                                                                                            <a href={`https://arachne.dainst.org/entity/${relatedObj.identifier}`}
                                                                                               target="_blank"
                                                                                               rel="noreferrer"><ExitToAppIcon/></a>
                                                                                        </Tooltip>
                                                                                    </TableCell>
                                                                                </TableRow>)
                                                                            : (place
                                                                                && <TableRow key={indexRelatedObj + '.' + indexPlace}>
                                                                                    <TableCell>
                                                                                        {place.coordinates
                                                                                            ? (<Tooltip title="Show on map" arrow placement="right">
                                                                                                <RoomIcon
                                                                                                    fontSize="small"
                                                                                                    onClick={() => openPopup(indexRelatedObj + '.' + indexPlace)}
                                                                                                />
                                                                                            </Tooltip>)
                                                                                            : "(No coordinates)"}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {relatedObj.name}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {place.name}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Tooltip
                                                                                            title="View original entry in iDAI.world"
                                                                                            arrow placement="right">
                                                                                            <a href={`https://arachne.dainst.org/entity/${relatedObj.identifier}`}
                                                                                               target="_blank"
                                                                                               rel="noreferrer"><ExitToAppIcon/></a>
                                                                                        </Tooltip>
                                                                                    </TableCell>
                                                                                </TableRow>)
                                                                    )
                                                                }
                                                            )
                                                        )
                                                    }
                                                )}
                                                {/* Table row(s) for objects in mapDataObjectsByString.entitiesMultiFilter */}
                                                {input.showSearchResults
                                                && (input.searchStr!==""
                                                    || input.projectList.length!==0
                                                    || input.chronOntologyTerm!==null
                                                    || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0)
                                                )
                                                && mapDataObjectsByString
                                                && mapDataObjectsByString.entitiesMultiFilter
                                                && mapDataObjectsByString.entitiesMultiFilter.map( (entity, indexEntity) => {
                                                        return entity && entity.spatial && entity.spatial.map( (place, indexPlace) => {
                                                                return (place === null
                                                                        ? (entity
                                                                            && <TableRow key={indexEntity}>
                                                                                <TableCell>
                                                                                    (No coordinates)
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {entity.name}
                                                                                </TableCell>
                                                                                <TableCell>

                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Tooltip
                                                                                        title="View original entry in iDAI.world"
                                                                                        arrow placement="right">
                                                                                        <a href={`https://arachne.dainst.org/entity/${entity.identifier}`}
                                                                                           target="_blank"
                                                                                           rel="noreferrer"><ExitToAppIcon/></a>
                                                                                    </Tooltip>
                                                                                </TableCell>
                                                                            </TableRow>)
                                                                        : (place
                                                                            && <TableRow
                                                                                key={`${indexEntity}.${indexPlace}`}>
                                                                                <TableCell>
                                                                                    {<Tooltip title="Show on map" arrow
                                                                                              placement="right">
                                                                                        <RoomIcon
                                                                                            fontSize="small"
                                                                                            onClick={() => openPopup(indexEntity + '.' + indexPlace)}
                                                                                        />
                                                                                    </Tooltip>}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {entity.name}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {place.name}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Tooltip
                                                                                        title="View original entry in iDAI.world"
                                                                                        arrow placement="right">
                                                                                        <a href={`https://arachne.dainst.org/entity/${entity.identifier}`}
                                                                                           target="_blank"
                                                                                           rel="noreferrer"><ExitToAppIcon/></a>
                                                                                    </Tooltip>
                                                                                </TableCell>
                                                                            </TableRow>)
                                                                )
                                                            }
                                                        )
                                                    }
                                                )}
                                                {/* Table row(s) for sites in mapDataSitesByRegion.sitesByRegion */}
                                                {input.showArchaeoSites
                                                && input.sitesMode==="region"
                                                && (
                                                    input.searchStr!==""
                                                    ||input.regionId!==0
                                                )
                                                && mapDataSitesByRegion
                                                && mapDataSitesByRegion.sitesByRegion
                                                && mapDataSitesByRegion.sitesByRegion.map( (site, indexSite) => {
                                                        return (site
                                                            && <TableRow key={indexSite}>
                                                                <TableCell>
                                                                    {site.coordinates
                                                                        ? (<Tooltip title="Show on map" arrow placement="right">
                                                                            <RoomIcon
                                                                                fontSize="small"
                                                                                onClick={() => openPopup(indexSite)}
                                                                            />
                                                                        </Tooltip>)
                                                                        : "no coordinates"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {site.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {site.locatedIn&&site.locatedIn.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                        <a href={`https://gazetteer.dainst.org/place/${site.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                )}
                                                {/* Table row(s) for sites in mapDataArchaeoSites.archaeologicalSites */}
                                                {input.showArchaeoSites
                                                && input.sitesMode!=="region"
                                                && (
                                                    input.searchStr!==""
                                                    || (input.boundingBoxCorner1.length!==0&&input.boundingBoxCorner2.length!==0)
                                                )
                                                && mapDataArchaeoSites
                                                && mapDataArchaeoSites.archaeologicalSites
                                                && mapDataArchaeoSites.archaeologicalSites.map((site, indexSite) => {
                                                        return (site
                                                            && <TableRow key={indexSite}>
                                                                <TableCell>
                                                                    {site.coordinates
                                                                        ? (<Tooltip title="Show on map" arrow placement="right">
                                                                            <RoomIcon
                                                                                fontSize="small"
                                                                                onClick={() => openPopup(indexSite)}
                                                                            />
                                                                        </Tooltip>)
                                                                        : "no coordinates"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {site.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {site.locatedIn&&site.locatedIn.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                                                                        <a href={`https://gazetteer.dainst.org/place/${site.identifier}`} target="_blank" rel="noreferrer"><ExitToAppIcon/></a>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                )}
                                            </TableBody>
                                        </Table>)
                                        : /* No, do not render a table */
                                        ("No results, try changing the filters")
                                }
                            </Grid>)
                            : (<Grid className="grid-results-list-collapsed" item>
                                {input.showRelatedObjects && mapDataContext.entity.related && `${mapDataContext.entity.related.length} results (related objects)`}
                                {input.showSearchResults && mapDataObjectsByString.entitiesMultiFilter && `${mapDataObjectsByString.entitiesMultiFilter.length} results (objects)`}
                                {input.showArchaeoSites && mapDataSitesByRegion.sitesByRegion && input.sitesMode==="region" && `${mapDataSitesByRegion.sitesByRegion.length} results (archaeological sites, by region)`}
                                {input.showArchaeoSites && mapDataArchaeoSites.archaeologicalSites && input.sitesMode!=="region" && `${mapDataArchaeoSites.archaeologicalSites.length} results (archaeological sites)`}
                            </Grid>)
                        }
                    </Grid>}
                </Grid>}
            </Grid>
        </div>
    );
};
