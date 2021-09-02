import React, { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { latLngBounds } from 'leaflet';
import { useQuery } from "@apollo/react-hooks";
import {
    DashboardTile, DataSources, Histogram, ImageContents, Layout, OurMap, PageHeader, ResultsTable, ShowNext, Timeline
} from "..";
import { LinearProgress } from "@material-ui/core";
// Queries
import {
    byRegion as GET_SITES_BY_REGION, searchArchaeoSites as GET_ARCHAEOLOGICAL_SITES,
    searchObjectContext as GET_OBJECT_CONTEXT, searchObjects as GET_OBJECTS
} from "./queries.graphql";
import { timelineAdapter, timelineMapper, useDebounce } from "../../utils";
import { useStyles } from '../../styles';
import Container from "@material-ui/core/Container";

const initialInput = {
    mapBounds: latLngBounds([28.906303, -11.146792], [-3.355435, 47.564145]),
    zoomLevel: 5,
    clusterMarkers: true,
    objectId: 0,
    regionId: 0,
    regionTitle: null,
    searchStr: "brosche",
    catalogsCheckedIds: [],
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
    bigTileArea: "",
    arachneTypesCheckedIds: ["Bilder", "Einzelobjekte", "Topographien"],
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
                    searchTerm: debouncedSearchStr, catalogIds: input.catalogsCheckedIds,
                    // only send coordinates if entered values have valid format (floats with at least one decimal place)
                    bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                        ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                        : [],
                    periodTerm: input.chronOntologyTerm,
                    entityTypes: input.arachneTypesCheckedIds
                }
            }
            : {variables: {searchTerm: "", catalogIds: [], bbox: [], periodTerm: "", entityTypes: []}});

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


    //todo: the periods and regions should probably be queried via Hub and not like this

    const [periods, setPeriods] = useState(["Frühnubischer Horizont"]);

    //todo: error... this does not seem to be the correct URL
    /*fetch("https://chronontology.dainst.org/data/period/?fq=resource.provenance:%22SPP2143%22&q=*&from=0")
        .then(response => response.json())
        .then((jsonData) => {
            //let tempPeriods = jsonData.results.map(result => result && result.resource && {title: result.resource?.names?.de?.[0], id: result.resource?.id})
            //tempPeriods.sort((a, b) => {
            //    let ta = a.title.toLowerCase(), tb = b.title.toLowerCase();
            //    if (ta < tb) return -1;
            //    if (ta > tb) return 1;
            //    return 0;
            //});

            let tempPeriods = jsonData.results.map(result => result && result.resource?.names?.de?.[0] || result.resource?.names?.en?.[0])//.sort();

            setPeriods(tempPeriods)
        })
        .catch((error) => {
            console.error(error)
        });*/


    const [regions, setRegions] = useState([]);

    /*fetch("https://gazetteer.dainst.org/search.json?q=parent%3A2042601%20OR%20parent%3A2293101&fq=&limit=1000&type=&pretty=true")
        .then(response => response.json())
        .then((jsonData) => {
            let tempRegions = jsonData.result.map(result => result && {title: result.prefName.title, id: result.gazId})
            tempRegions.sort((a, b) => {
                let ta = a.title.toLowerCase(), tb = b.title.toLowerCase();
                if (ta < tb) return -1;
                if (ta > tb) return 1;
                return 0;
            });
            setRegions(tempRegions)
        })
        .catch((error) => {
            console.error(error)
        });*/

    //todo: change out translation keys for English terms, e.g. "Images" instead of "arachneTypeBilder" – because these
    // keys will be shown as default if no translation exists
    const arachneTypes = [ //todo: welche davon sollen angeboten werden? einige gibt es gar nicht für SPP/Afrika nehme ich an.
        {"label": t("arachneTypeEinzelobjekte"), "id": "Einzelobjekte"},
        {"label": t("arachneTypeMehrteilige Denkmäler"), "id": "MehrteiligeDenkmaeler"},
        {"label": t("arachneTypeBauwerke"), "id": "Bauwerke"},
        {"label": t("arachneTypeBauwerksteile"), "id": "Bauwerksteile"},
        {"label": t("arachneTypeBilder"), "id": "Bilder"},
        {"label": t("arachneTypeBücher"), "id": "Buecher"},
        {"label": t("arachneTypeBuchseiten"), "id": "Buchseiten"},
        {"label": t("arachneTypeEinzelmotive"), "id": "Einzelmotive"},
        {"label": t("arachneTypeGruppierungen"), "id": "Gruppierungen"},
        {"label": t("arachneTypeInschriften"), "id": "Inschriften"},
        {"label": t("arachneTypeLiteratur"), "id": "Literatur"},
        {"label": t("arachneTypeOrte"), "id": "Orte"},
        {"label": t("arachneTypeReproduktionen"), "id": "Reproduktionen"},
        {"label": t("arachneTypePersonen"), "id": "Personen"},
        {"label": t("arachneTypeRezeptionen"), "id": "Rezeptionen"},
        {"label": t("arachneTypeSammlungen"), "id": "Sammlungen"},
        {"label": t("arachneTypeSzenen"), "id": "Szenen"},
        {"label": t("arachneTypeTopographien"), "id": "Topographien"},
        {"label": t("arachneTypeTypen"), "id": "Typen"},
        {"label": t("arachneType3D-Modelle"), "id": "dreiDModelle"}
    ];

    const catalogs = [
        {"label": "All SPP 2143 Arachne data", "id": 123},
        {"label": "AAArC - Fundplätze", "id": 942}
    ]


    const handleRelatedObjects = (id) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "objectId", value: id ? Number(id) : input.objectId}});
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showSearchResults"}})
        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "showRelatedObjects"}})
        console.log("handleRelatedObjects!");
    };

    const openPopup = (index) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedMarker", value: index}});
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
        if (dataObjects && input.mode === "objects" && input.showSearchResults && (debouncedSearchStr || input.catalogsCheckedIds.length!==0 || input.chronOntologyTerm
            ||(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataObjects(dataObjects);
            console.log("rerender dataObjects!");
            console.log("rerender dataObjects --> dataObjects: ", dataObjects);
            console.log("rerender dataObjects --> input:", input);
        }
    }, [dataObjects, input.showSearchResults, debouncedSearchStr, input.catalogsCheckedIds, input.chronOntologyTerm, input.boundingBoxCorner1, input.boundingBoxCorner2, input.mode, input.arachneTypesCheckedIds]);

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
        && (debouncedSearchStr || input.catalogsCheckedIds.length!==0 || input.chronOntologyTerm
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

    const getMapData = () => {
        let mapData;

        if(renderingConditionObjects) mapData = mapDataObjects?.entitiesMultiFilter;
        else if(renderingConditionRelatedObjects) mapData = {original: mapDataContext?.entity?.spatial, related: mapDataContext?.entity?.related};
        else if(renderingConditionSites) mapData = mapDataArchaeoSites?.archaeologicalSites;
        else if(renderingConditionSitesByRegion) mapData = mapDataSitesByRegion?.sitesByRegion;

        return mapData;
    }

    const getMapDataType = () => {
        let type = null;
        let handler = false;

        if(renderingConditionObjects) handler = true;
        else if(renderingConditionRelatedObjects) {
            type = "related";
            handler = true;
        }

        return {type: type, handler: handler};
    }


    //const setWidth = () => window.innerWidth
    //const setOneTwelfthWidth = () => setWidth() / 12

    //window.addEventListener('resize', setOneTwelfthWidth)


    const renderAreaA = () => {
        const area = "areaA";

        return(
            <DashboardTile
                reducer={[input, dispatch]}
                area={area}
                content={
                    input[area]===0 && <ResultsTable
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
                    />
                    || input[area]===1 && <ImageContents
                        contents={dataObjects
                        && [dataObjects?.entitiesMultiFilter?.map(entity => entity?.categoryOfDepicted),
                            dataObjects?.entitiesMultiFilter?.map(entity => entity?.materialOfDepicted)]}
                    />
                    || input[area]===2 && <DataSources/>
                }
                showNext={
                    <ShowNext
                        area={area}
                        labels={["Results table", "Image contents", "Data sources"]}
                        reducer={[input, dispatch]}
                    />
                }
            />
        )
    }

    const renderAreaB = () => {
        const area = "areaB";

        return(
            <DashboardTile
                reducer={[input, dispatch]}
                area={area}
                content={
                    input[area]===0 && <Timeline
                        reducer={[input, dispatch]}
                        timelineObjectsData={dataObjects?.entitiesMultiFilter.flatMap(timelineAdapter)}
                    />
                    || input[area]===1 && <Histogram
                        timelineData={dataObjects?.entitiesMultiFilter.map(timelineMapper)}
                    />
                }
                showNext={
                    <ShowNext
                        area={area}
                        labels={["Timeline", "Histogram"]}
                        reducer={[input, dispatch]}
                    />
                }
            />
        )
    }

    const renderAreaC = () => {
        const area = "areaC";

        return(
            <DashboardTile
                reducer={[input, dispatch]}
                area={area}
                content={
                    <OurMap
                        handleRelatedObjects={handleRelatedObjects}
                        data={getMapData()}
                        dataType={getMapDataType()}
                        reducer={[input, dispatch]}
                    />
                }
            />
        )
    }

    return (
        /* Layout schema:
            F = filters, M = map, A = area A, B = area B; two rows = 100% height, four columns = 100 % width

            Size md/lg:
            default:      |    big M:        |    big A:        |    big B:        |    with expanded filters: (?)
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
        <>
            <PageHeader
                arachneTypes={arachneTypes}
                catalogs={catalogs}
                periods={periods}
                reducer={[input, dispatch]}
                regions={regions}
            />
            <Container maxWidth={"xl"}>
                <Layout
                    bigTile={
                        (input.bigTileArea === "areaA" && renderAreaA())
                        || (input.bigTileArea === "areaB" && renderAreaB())
                        || (input.bigTileArea === "areaC" && renderAreaC())
                    }
                    leftOrTopTile={
                        input.bigTileArea !== "areaC" && renderAreaC()
                    }
                    topRightOrMiddleTile={
                        input.bigTileArea !== "areaA"
                            ? renderAreaA()
                            : renderAreaB()
                    }
                    bottomRightOrBottomTile={
                        input.bigTileArea !== "areaA" && input.bigTileArea !== "areaB" && renderAreaB()
                    }
                    loadingIndicator={
                        (loadingContext || loadingObjects || loadingArchaeoSites || loadingSitesByRegion)
                        && <LinearProgress/>
                    }
                    rightTileIsMovedToBottomInstead={input.bigTileArea === "areaC" ? "true" : false}
                />
            </Container>
        </>
    )
};
