import React, { useState, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { latLngBounds } from 'leaflet';
import { useQuery } from "@apollo/react-hooks";
import gql from 'graphql-tag';
import { CollapsedFilters, Filters, OurMap, OurTimeline, ResultsTable } from "..";
import { Button, Divider, Grid, LinearProgress, Tooltip } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MapIcon from "@material-ui/icons/Map";


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
            #is temporal needed here?
            temporal {
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
            datingSpan
            temporal {
                title
                types
                senses(typeOfSense: political) {
                    title
                    identifier
                    begin
                    end
                }
            }
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

const initialInput = {
    mapBounds: latLngBounds([28.906303, -11.146792], [-3.355435, 47.564145]),
    zoomLevel: 5,
    clusterMarkers: true,
    objectId: 0,
    regionId: 0,
    regionTitle: null,
    searchStr: "spp2143",
    projectList: [{"projectLabel": "All available SPP 2143 data", "projectBestandsname": "spp2143"},
        {"projectLabel": "P01", "projectBestandsname": "P01"},
        {"projectLabel": "P02", "projectBestandsname": "P02"},
        {"projectLabel": "P03", "projectBestandsname": "P03"}],
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



export const AppContent = () => {
    const { t, i18n } = useTranslation();

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

    const [input, dispatch] = useReducer(inputReducer, initialInput);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjects, setMapDataObjects] = useState({});
    const [mapDataArchaeoSites, setMapDataArchaeoSites] = useState({});
    const [mapDataSitesByRegion, setMapDataSitesByRegion] = useState({});

    // Queries
    const {data: dataContext, loading: loadingContext, error: errorContext} = useQuery(GET_CONTEXT_BY_ID, input.mode === "objects"
        ? {variables: {arachneId: input.objectId}}
        : {variables: {arachneId: 0}});

    const {data: dataObjects, loading: loadingObjects, error: errorObjects} =
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
        'severisch', 'SH IIIB', 'SM I', 'SM IB', 'trajanisch',
        'Altes Reich', 'Neues Reich', 'Erste Zwischenzeit', 'Holocene', 'Early Holocene', 'Middle Holocene', 'Late Holocene', 'Pleistocene'
    ];

    const regions = [
        {title: 'Africa', id: 2042601},
        {title: 'Benin', id: 2353200},
        {title: 'East Africa', id: 2359915},
        {title: 'Egypt', id: 2042786},
        {title: 'Horn of Africa', id: 2379066},
        {title: 'Maghreb', id: 2042694},
        {title: 'Meroe', id: 2293921},
        {title: 'Nubien', id: 2042608},
        {title: 'Republic of Namibia', id: 2293917},
        {title: 'Senegambia', id: 2348444},
        {title: 'Sudan', id: 2042707},
        {title: 'Tschad', id: 2128989},
        {title: 'Wadi Howar Region Sudan', id: 2042736},
        {title: 'West Africa', id: 2379014}
    ];


    const handleRelatedObjects = (id) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "objectId", value: id ? Number(id) : input.objectId}});
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showRelatedObjects"}})
        console.log("handleRelatedObjects!");
    };

    const openPopup = (index) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedMarker", value: index}});
    }

    const extendMapBounds = () => {
        let markers;
        if(mapDataContext.entity) markers = mapDataContext.entity;
        else if(mapDataObjects.entitiesMultiFilter) markers = mapDataObjects.entitiesMultiFilter;
        else if(mapDataSitesByRegion.sitesByRegion) markers = mapDataSitesByRegion.sitesByRegion;
        else if(mapDataArchaeoSites.archaeologicalSites) markers = mapDataArchaeoSites.archaeologicalSites;
        const newMapBounds = latLngBounds();
        markers.map( (item) => {
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
        if (dataObjects && input.showSearchResults && (input.searchStr || input.checkedProjects.length!==0 || input.chronOntologyTerm
            ||(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataObjects(dataObjects);
            console.log("rerender dataObjects!");
            console.log("rerender dataObjects --> dataObjects: ", dataObjects);
            console.log("rerender dataObjects --> input:", input);
        }
    }, [dataObjects, input.showSearchResults, input.searchStr, input.checkedProjects, input.chronOntologyTerm, input.boundingBoxCorner1, input.boundingBoxCorner2]);

    useEffect( () => {
        if (dataArchaeoSites && input.showArchaeoSites && input.sitesMode!=="region" && (input.searchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataArchaeoSites(dataArchaeoSites);
            console.log("rerender dataArchaeoSites!");
            console.log("rerender dataArchaeoSites --> dataArchaeoSites: ", dataArchaeoSites);
            console.log("rerender dataArchaeoSites --> input:", input);
        }
    }, [dataArchaeoSites, input.showArchaeoSites, input.searchStr, input.boundingBoxCorner1, input.boundingBoxCorner2, input.sitesMode]);

    useEffect( () => {
        if (dataSitesByRegion && input.showArchaeoSites && input.sitesMode==="region" && (input.searchStr || input.regionId)) {
            setMapDataSitesByRegion(dataSitesByRegion);
            console.log("rerender dataSitesByRegion!");
            console.log("rerender dataSitesByRegion --> dataSitesByRegion: ", dataSitesByRegion);
            console.log("rerender dataSitesByRegion --> input:", input);
        }
    }, [dataSitesByRegion, input.showArchaeoSites, input.searchStr, input.regionId, input.sitesMode]);


    /* Conditions used to determine whether to render certain data (objects, related objects, sites, sites by region) */
    /* TODO: better names? use a function to check this instead? */
    const renderingConditionObjects =
        // this mode is selected
        input.showSearchResults
        // at least one relevant input not empty
        && (input.searchStr || input.projectList.length!==0 || input.chronOntologyTerm
        || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
        // query result not empty
        && mapDataObjects && mapDataObjects.entitiesMultiFilter;

    const renderingConditionRelatedObjects =
        // this mode is selected
        input.showRelatedObjects
        // relevant input not empty
        && input.objectId
        // query result not empty
        && mapDataContext && mapDataContext.entity;

    const renderingConditionSites =
        // this mode is selected
        input.showArchaeoSites && input.sitesMode!=="region"
        // at least one relevant input not empty
        && (input.searchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
        // query result not empty
        && mapDataArchaeoSites && mapDataArchaeoSites.archaeologicalSites;

    const renderingConditionSitesByRegion =
        // this mode is selected
        input.showArchaeoSites && input.sitesMode==="region"
        // at least one relevant input not empty
        && (input.searchStr || input.regionId)
        // query result not empty
        && mapDataSitesByRegion && mapDataSitesByRegion.sitesByRegion;


    return (
        <div>
            <h2>{t('Map')}</h2>

            <Grid className="grid-outer" container direction="row" spacing={1}>

                <Grid className="grid-controls" item container direction="column" xs={12}>
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
                    {/* Map controls = filters */}
                    {input.mapControlsExpanded
                        ? <Filters
                            chronOntologyTerms={chronOntologyTerms}
                            dispatch={dispatch}
                            extendMapBounds={extendMapBounds}
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
                    {loadingObjects && <span>...loadingObjects</span>}
                    {errorObjects && <span>...errorObjects</span> && console.log(errorObjects.message)}
                    {loadingArchaeoSites && <span>...loadingArchaeoSites</span>}
                    {errorArchaeoSites && <span>...errorArchaeoSites</span> && console.log(errorArchaeoSites.message)}
                    {loadingSitesByRegion && <span>...loadingSitesByRegion</span>}
                    {errorSitesByRegion && <span>...errorSitesByRegion</span> && console.log(errorSitesByRegion.message)}*/}

                    {(loadingContext||loadingObjects||loadingArchaeoSites||loadingSitesByRegion) && <LinearProgress />}

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
                    <OurMap
                        handleRelatedObjects={handleRelatedObjects}
                        mapDataObjects={mapDataObjects}
                        mapDataContext={mapDataContext}
                        mapDataArchaeoSites={mapDataArchaeoSites}
                        mapDataSitesByRegion={mapDataSitesByRegion}
                        reducer={[input, dispatch]}
                        renderingConditionObjects={renderingConditionObjects}
                        renderingConditionRelatedObjects={renderingConditionRelatedObjects}
                        renderingConditionSites={renderingConditionSites}
                        renderingConditionSitesByRegion={renderingConditionSitesByRegion}
                    />
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
                                    (renderingConditionObjects || renderingConditionRelatedObjects || renderingConditionSites || renderingConditionSitesByRegion )
                                        ? <ResultsTable
                                            mapDataObjects={mapDataObjects}
                                            mapDataContext={mapDataContext}
                                            mapDataArchaeoSites={mapDataArchaeoSites}
                                            mapDataSitesByRegion={mapDataSitesByRegion}
                                            renderingConditionObjects={renderingConditionObjects}
                                            renderingConditionRelatedObjects={renderingConditionRelatedObjects}
                                            renderingConditionSites={renderingConditionSites}
                                            renderingConditionSitesByRegion={renderingConditionSitesByRegion}
                                            openPopup={openPopup}
                                        />
                                        : "No results, try changing the filters"
                                }
                            </Grid>)
                            : (<Grid className="grid-results-list-collapsed" item>
                                {input.showRelatedObjects && mapDataContext.entity.related && `${mapDataContext.entity.related.length} results (related objects)`}
                                {input.showSearchResults && mapDataObjects.entitiesMultiFilter && `${mapDataObjects.entitiesMultiFilter.length} results (objects)`}
                                {input.showArchaeoSites && mapDataSitesByRegion.sitesByRegion && input.sitesMode==="region" && `${mapDataSitesByRegion.sitesByRegion.length} results (archaeological sites, by region)`}
                                {input.showArchaeoSites && mapDataArchaeoSites.archaeologicalSites && input.sitesMode!=="region" && `${mapDataArchaeoSites.archaeologicalSites.length} results (archaeological sites)`}
                            </Grid>)
                        }
                    </Grid>}
                </Grid>}
                {<Grid className="grid-timeline" item xs={12}>
                    {input.mode === "objects"
                        ? <OurTimeline
                            timelineData={dataObjects}
                        />
                        : "Timeline not available for this mode"}
                </Grid>}
            </Grid>
        </div>
    );
};
