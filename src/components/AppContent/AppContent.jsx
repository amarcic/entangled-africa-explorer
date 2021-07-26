import React, { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { latLngBounds } from 'leaflet';
import { useQuery } from "@apollo/react-hooks";
import {
    CollapsedFilters, DataSources, Filters, Histogram, ImageContents, Layout, OurMap, OurTimeline, ResultsTable,
    ShowNext
} from "..";
import { IconButton, LinearProgress } from "@material-ui/core";
import ZoomInIcon from "@material-ui/icons/ZoomIn";
import ZoomOutIcon from "@material-ui/icons/ZoomOut";
// Queries
import {
    byRegion as GET_SITES_BY_REGION, searchArchaeoSites as GET_ARCHAEOLOGICAL_SITES,
    searchObjectContext as GET_OBJECT_CONTEXT, searchObjects as GET_OBJECTS
} from "./queries.graphql";
import { timelineAdapter, useDebounce } from "../../utils";
import { useStyles } from '../../styles';

const initialInput = {
    mapBounds: latLngBounds([28.906303, -11.146792], [-3.355435, 47.564145]),
    zoomLevel: 5,
    clusterMarkers: true,
    objectId: 0,
    regionId: 0,
    regionTitle: null,
    searchStr: "spp2143",
    catalogIdsList: [{"catalogLabel": "All SPP 2143 Arachne data", "catalogId": 123},
        {"catalogLabel": "AAArC - Fundplätze", "catalogId": 942},],
    checkedCatalogIds: [],
    checkedCatalogLabels: [],
    mode: "objects",
    sitesMode: "",
    showSearchResults: true,
    showArchaeoSites: false,
    showRelatedObjects: false,
    chronOntologyTerm: null,
    boundingBoxCorner1: [],
    boundingBoxCorner2: [],
    drawBBox: false,
    mapControlsExpanded: false,
    resultsListExpanded: true,
    selectedMarker: undefined,
    timelineSort: "period",
    highlightedTimelineObject: undefined,
    areaA: 1,
    areaB: 0,
    areaAIsBig: false,
    areaBIsBig: false,
    areaCIsBig: false
};


export const AppContent = () => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

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

    // debounce input.searchStr
    const debouncedSearchStr = useDebounce(input.searchStr, 500);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjects, setMapDataObjects] = useState({});
    const [mapDataArchaeoSites, setMapDataArchaeoSites] = useState({});
    const [mapDataSitesByRegion, setMapDataSitesByRegion] = useState({});

    // Queries
    const {data: dataContext, loading: loadingContext, error: errorContext} = useQuery(GET_OBJECT_CONTEXT, input.mode === "objects"
        ? {variables: {arachneId: input.objectId}}
        : {variables: {arachneId: 0}});

    const {data: dataObjects, loading: loadingObjects, error: errorObjects} =
        useQuery(GET_OBJECTS, input.mode === "objects"
            ? {
                variables: {
                    searchTerm: debouncedSearchStr, catalogIds: input.checkedCatalogIds,
                    // only send coordinates if entered values have valid format (floats with at least one decimal place)
                    bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                        ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                        : [],
                    periodTerm: input.chronOntologyTerm
                }
            }
            : {variables: {searchTerm: "", catalogIds: [], bbox: [], periodTerm: ""}});

    const {data: dataArchaeoSites, loading: loadingArchaeoSites, error: errorArchaeoSites} = useQuery(GET_ARCHAEOLOGICAL_SITES, input.mode === "archaeoSites"
        ? {
            variables: {
                searchTerm: debouncedSearchStr,
                // only send coordinates if entered values have valid format (floats with at least one decimal place)
                bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                    ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                    : []
            }
        }
        //: {variables: {searchTerm: "", bbox: []}});
        : {variables: {searchTerm: "''", bbox: []}});

    const {data: dataSitesByRegion, loading: loadingSitesByRegion, error: errorSitesByRegion} = useQuery(GET_SITES_BY_REGION, input.sitesMode === "region"
        ? {variables: {searchTerm: debouncedSearchStr, idOfRegion: input.regionId}}
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

    //TODO: not possible to change map view twice in a row if markers have not changed
    const extendMapBounds = () => {
        let markers;
        if(mapDataContext.entity) markers = mapDataContext.entity;
        else if(mapDataObjects.entitiesMultiFilter) markers = mapDataObjects.entitiesMultiFilter;
        else if(mapDataSitesByRegion.sitesByRegion) markers = mapDataSitesByRegion.sitesByRegion;
        else if(mapDataArchaeoSites.archaeologicalSites) markers = mapDataArchaeoSites.archaeologicalSites;
        if(!markers) return;
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
        if(dataContext && input.mode === "objects" && input.showRelatedObjects) {
            setMapDataContext(dataContext);
            console.log("rerender dataContext!");
            console.log("rerender dataContext --> dataContext: ", dataContext);
            console.log("rerender dataContext --> input:", input);
        }
    }, [dataContext, input.showRelatedObjects, input.mode]);

    useEffect( () => {
        if (dataObjects && input.mode === "objects" && input.showSearchResults && (debouncedSearchStr || input.checkedCatalogIds.length!==0 || input.chronOntologyTerm
            ||(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataObjects(dataObjects);
            console.log("rerender dataObjects!");
            console.log("rerender dataObjects --> dataObjects: ", dataObjects);
            console.log("rerender dataObjects --> input:", input);
        }
    }, [dataObjects, input.showSearchResults, debouncedSearchStr, input.checkedCatalogIds, input.chronOntologyTerm, input.boundingBoxCorner1, input.boundingBoxCorner2, input.mode]);

    useEffect( () => {
        if (dataArchaeoSites && input.showArchaeoSites && input.mode === "archaeoSites" && input.sitesMode!=="region" && (debouncedSearchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataArchaeoSites(dataArchaeoSites);
            console.log("rerender dataArchaeoSites!");
            console.log("rerender dataArchaeoSites --> dataArchaeoSites: ", dataArchaeoSites);
            console.log("rerender dataArchaeoSites --> input:", input);
        }
    }, [dataArchaeoSites, input.showArchaeoSites, debouncedSearchStr, input.boundingBoxCorner1, input.boundingBoxCorner2, input.sitesMode, input.mode]);

    useEffect( () => {
        if (dataSitesByRegion && input.showArchaeoSites && input.mode === "archaeoSites" && input.sitesMode==="region" && (debouncedSearchStr || input.regionId)) {
            setMapDataSitesByRegion(dataSitesByRegion);
            console.log("rerender dataSitesByRegion!");
            console.log("rerender dataSitesByRegion --> dataSitesByRegion: ", dataSitesByRegion);
            console.log("rerender dataSitesByRegion --> input:", input);
        }
    }, [dataSitesByRegion, input.showArchaeoSites, debouncedSearchStr, input.regionId, input.sitesMode, input.mode]);


    /* Conditions used to determine whether to render certain data (objects, related objects, sites, sites by region) */
    /* TODO: better names? use a function to check this instead? */
    const renderingConditionObjects =
        // this mode is selected
        input.showSearchResults
        // at least one relevant input not empty
        && (debouncedSearchStr || input.checkedCatalogIds.length!==0 || input.chronOntologyTerm
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
        && (debouncedSearchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
        // query result not empty
        && mapDataArchaeoSites && mapDataArchaeoSites.archaeologicalSites;

    const renderingConditionSitesByRegion =
        // this mode is selected
        input.showArchaeoSites && input.sitesMode==="region"
        // at least one relevant input not empty
        && (debouncedSearchStr || input.regionId)
        // query result not empty
        && mapDataSitesByRegion && mapDataSitesByRegion.sitesByRegion;

    const setWidth = () => window.innerWidth
    const setOneTwelfthWidth = () => setWidth() / 12

    window.addEventListener('resize', setOneTwelfthWidth)


    {/*TODO: find good position for the IconButtons,
        toggle other areas back to default size if an area is enlarged while another currently already is enlarged */}
    const renderAreaA = () => {
        return (
            <>
                <IconButton
                    onClick={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "areaAIsBig"}})
                    }
                    style={{backgroundColor: "rgba(171,134,97,0.18)", position: "relative", left: "20px", top: "70px"}}
                >
                    {input.areaAIsBig
                        ? <ZoomOutIcon/>
                        : <ZoomInIcon/>
                    }
                </IconButton>
                {input.areaA===0
                && <ResultsTable
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
                    openPopup={openPopup}
                />}
                {input.areaA===1
                && <ImageContents
                    contents={dataObjects
                    && [dataObjects?.entitiesMultiFilter?.map(entity => entity?.categoryOfDepicted),
                        dataObjects?.entitiesMultiFilter?.map(entity => entity?.materialOfDepicted)]}
                />}
                {input.areaA===2
                && <DataSources/>}
                <ShowNext
                    area={"areaA"}
                    labels={["Results table", "Image contents", "Data sources"]}
                    reducer={[input, dispatch]}
                />
            </>
        )
    }

    const renderAreaB = () => {
        return (
            <>
                <IconButton
                    onClick={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "areaBIsBig"}})
                    }
                    style={{backgroundColor: "rgba(171,134,97,0.18)", position: "relative", left: "20px", top: "70px"}}
                >
                    {input.areaBIsBig
                        ? <ZoomOutIcon/>
                        : <ZoomInIcon/>
                    }
                </IconButton>
                {input.areaB===0 && <OurTimeline
                    reducer={[input, dispatch]}
                    timelineObjectsData={dataObjects?.entitiesMultiFilter.flatMap(timelineAdapter)}
                />}
                {input.areaB===1 && <Histogram/>}
                <ShowNext
                    area={"areaB"}
                    labels={["Timeline", "Histogram"]}
                    reducer={[input, dispatch]}
                />
            </>
        )
    }

    const renderAreaC = () => {
        return (
            <>
                <IconButton
                    onClick={() => dispatch({type: "TOGGLE_STATE", payload: {toggledField: "areaCIsBig"}})
                    }
                    style={{backgroundColor: "rgba(171,134,97,0.18)", position: "relative", left: "20px", top: "70px"}}
                >
                    {input.areaCIsBig
                        ? <ZoomOutIcon/>
                        : <ZoomInIcon/>
                    }
                </IconButton>
                <OurMap
                    extendMapBounds={extendMapBounds}
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
            </>
        )
    }

    return (
        /* Layout schema:
            F = filters, M = map, A = area A, B = area B; two rows = 100% height, four columns = 100 % width

            Size md/lg:
            default:      |    big c:        |    big a:        |    big b:        |    with expanded filters: (?)
            ------------------------------------------------------------------------------------------------------
            F             |    F             |    F             |    F             |    F  F  F  F
            M  M  A  A    |    M  M  M  M    |    A  A  A  A    |    B  B  B  B    |    ...
            M  M  B  B    |    M  M  M  M    |    A  A  A  A    |    B  B  B  B    |
                          |    A  A  B  B    |    M  M  B  B    |    M  M  A  A    |
                          |                  |    M  M          |    M  M          |
            Size xs:
            default: (?)  |   with expanded filters: (?)
            --------------------------------------------
            F  .  .  .    |    F  F  F  F
            M  M  M  M    |    F  F  F  F
            M  M  M  M    |    M  M  M  M
            A  A  A  A    |    M  M  M  M
            A  A  A  A    |    A  A  A  A
            B  B  B  B    |    A  A  A  A
            B  B  B  B    |    B  B  B  B
                          |    B  B  B  B
        */

        <Layout
            menu={input.mapControlsExpanded
                ? <Filters
                    chronOntologyTerms={chronOntologyTerms}
                    reducer={[input, dispatch]}
                    input={input}
                    regions={regions}
                />
                : (
                    <CollapsedFilters
                        reducer={[input, dispatch]}
                    />
                )
            }
            bigTile={
                (input.areaAIsBig && renderAreaA()) || (input.areaBIsBig && renderAreaB()) || (input.areaCIsBig && renderAreaC())
            }
            leftOrTopTile={
                !input.areaCIsBig && renderAreaC()
            }
            topRightOrMiddleTile={
                !input.areaAIsBig ? renderAreaA() : renderAreaB()
            }
            bottomRightOrBottomTile={
                !input.areaAIsBig && !input.areaBIsBig && renderAreaB()
            }
            loadingIndicator={
                (loadingContext || loadingObjects || loadingArchaeoSites || loadingSitesByRegion)
                && <LinearProgress/>
            }
            rightTileIsMovedToBottomInstead={input.areaCIsBig ? "true" : false}
        />
    )
};
