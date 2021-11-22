import React, { useEffect, useReducer, useState } from 'react';
import { useQuery } from "@apollo/react-hooks";
import {
    DashboardTile, DataSources, Graph, Histogram, ImageContents, Layout, MaximizeTileButton, OurMap, PageHeader,
    ResultsTable, ShowNext, Timeline
} from "..";
import { LinearProgress } from "@material-ui/core";
// Queries
import {
    byRegion as GET_SITES_BY_REGION, searchArchaeoSites as GET_ARCHAEOLOGICAL_SITES,
    searchObjectContext as GET_OBJECT_CONTEXT, searchObjects as GET_OBJECTS
} from "./queries.graphql";
import { inputReducer } from "./inputReducer";
import { timelineAdapter, timelineMapper, useDebounce } from "../../utils";
import Container from "@material-ui/core/Container";
import { catalogs, initialInput } from "../../config";
import { useTranslation } from "react-i18next";

export const AppContent = () => {
    const { t, i18n } = useTranslation();

    // state update logic
    const [input, dispatch] = useReducer(inputReducer, initialInput);

    // debounce input.searchStr
    const debouncedSearchStr = useDebounce(input.searchStr, 500);

    const [mapDataContext, setMapDataContext] = useState({});
    const [mapDataObjects, setMapDataObjects] = useState({});
    const [mapDataArchaeoSites, setMapDataArchaeoSites] = useState({});
    const [mapDataSitesByRegion, setMapDataSitesByRegion] = useState({});

    // Queries
    const {data: dataContext, loading: loadingContext, error: errorContext} = useQuery(GET_OBJECT_CONTEXT, input.mode === "objects"
        ? {variables: {arachneId: input.selectedObjectId}, lang: t("current language code")}
        : {variables: {arachneId: 0}, lang: t("current language code")});

    const {data: dataObjects, loading: loadingObjects, error: errorObjects} =
        useQuery(GET_OBJECTS, input.mode === "objects"
            ? {
                variables: {
                    searchTerm: debouncedSearchStr, catalogIds: input.catalogsCheckedIds,
                    // only send coordinates if entered values have valid format (floats with at least one decimal place)
                    bbox: (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1)) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2))
                        ? input.boundingBoxCorner1.concat(input.boundingBoxCorner2)
                        : [],
                    periodTerms: input.chronOntologyTerms,
                    entityTypes: input.arachneTypesCheckedIds,
                    focusAfrica: input.focusAfrica,
                    lang: t("current language code")
                }
            }
            : {variables: {searchTerm: "", catalogIds: [], bbox: [], periodTerms: [], entityTypes: []}});

    const {data: dataArchaeoSites, loading: loadingArchaeoSites, error: errorArchaeoSites} = useQuery(GET_ARCHAEOLOGICAL_SITES, input.mode === "sites"
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

    const {data: dataSitesByRegion, loading: loadingSitesByRegion, error: errorSitesByRegion} = useQuery(GET_SITES_BY_REGION, input.mode === "sitesByRegion"
        ? {variables: {searchTerm: debouncedSearchStr, idOfRegion: input.selectedRegionId}}
        : {variables: {searchTerm: "", idOfRegion: 0}});


    //todo: the periods and regions should probably be queried via Hub and not like this
    //todo: extract either to utils or to config

    const [periods, setPeriods] = useState(["some period", "some other period"]);

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


    const [regions, setRegions] = useState([{id: 123, label: "some region"}, {id: 456, label: "some other region"}]);

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

    const handleRelatedObjects = (id) => {
        dispatch({type: "UPDATE_INPUT", payload: {field: "selectedObjectId", value: id ? Number(id) : input.selectedObjectId}});
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
        if (dataObjects && input.mode === "objects" && (debouncedSearchStr || input.catalogsCheckedIds.length!==0 || input.chronOntologyTerms
            ||(input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataObjects(dataObjects);
            console.log("rerender dataObjects!");
            console.log("rerender dataObjects --> dataObjects: ", dataObjects);
            console.log("rerender dataObjects --> input:", input);
        }
    }, [dataObjects, debouncedSearchStr, input.catalogsCheckedIds, input.chronOntologyTerms, input.boundingBoxCorner1, input.boundingBoxCorner2, input.mode, input.arachneTypesCheckedIds]);

    useEffect( () => {
        if (dataArchaeoSites && input.mode === "sites" && (debouncedSearchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))) {
            setMapDataArchaeoSites(dataArchaeoSites);
            console.log("rerender dataArchaeoSites!");
            console.log("rerender dataArchaeoSites --> dataArchaeoSites: ", dataArchaeoSites);
            console.log("rerender dataArchaeoSites --> input:", input);
        }
    }, [dataArchaeoSites, debouncedSearchStr, input.boundingBoxCorner1, input.boundingBoxCorner2, input.mode]);

    useEffect( () => {
        if (dataSitesByRegion && input.mode === "sitesByRegion" && (debouncedSearchStr || input.gazetteerRegion.id)) {
            setMapDataSitesByRegion(dataSitesByRegion);
            console.log("rerender dataSitesByRegion!");
            console.log("rerender dataSitesByRegion --> dataSitesByRegion: ", dataSitesByRegion);
            console.log("rerender dataSitesByRegion --> input:", input);
        }
    }, [dataSitesByRegion, debouncedSearchStr, input.gazetteerRegion.id, input.mode]);


    /* Conditions used to determine whether to render certain data (objects, related objects, sites, sites by region) */
    /* TODO: better names? use a function to check this instead? */
    const renderingConditionObjects =
        // this mode is selected
        input.mode === "objects"
        // at least one relevant input not empty
        && (debouncedSearchStr || input.catalogsCheckedIds.length!==0 || input.chronOntologyTerms
            || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
        // query result not empty
        && mapDataObjects && mapDataObjects.entitiesMultiFilter;

    const renderingConditionRelatedObjects =
        // this mode is selected
        input.showRelatedObjects
        // relevant input not empty
        && input.selectedObjectId
        // query result not empty
        && mapDataContext && mapDataContext.entity;

    const renderingConditionSites =
        // this mode is selected
        input.mode === "sites"
        // at least one relevant input not empty
        && (debouncedSearchStr || (input.boundingBoxCorner1.length!==0 && input.boundingBoxCorner2.length!==0))
        // query result not empty
        && mapDataArchaeoSites && mapDataArchaeoSites.archaeologicalSites;

    const renderingConditionSitesByRegion =
        // this mode is selected
        input.mode === "sitesByRegion"
        // at least one relevant input not empty
        && (debouncedSearchStr || input.gazetteerRegion.id)
        // query result not empty
        && mapDataSitesByRegion && mapDataSitesByRegion.sitesByRegion;

    const getCurrentData = () => {
        let currentData;

        if(renderingConditionObjects) currentData = mapDataObjects?.entitiesMultiFilter;
        else if(renderingConditionRelatedObjects) currentData = {original: mapDataContext?.entity?.spatial, related: mapDataContext?.entity?.related};
        else if(renderingConditionSites) currentData = mapDataArchaeoSites?.archaeologicalSites;
        else if(renderingConditionSitesByRegion) currentData = mapDataSitesByRegion?.sitesByRegion;

        return currentData;
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


    const renderAreaA = () => {
        const area = "areaA";

        const maximizeTileButton = (
            <MaximizeTileButton
                area={area}
                reducer={[input, dispatch]}
            />
        );

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
                        maximizeTileButton={maximizeTileButton}
                    />
                    || input[area]===1 && <ImageContents
                        contents={dataObjects
                        && [dataObjects?.entitiesMultiFilter?.map(entity => entity?.categoryOfDepicted),
                            dataObjects?.entitiesMultiFilter?.map(entity => entity?.materialOfDepicted)]}
                        maximizeTileButton={maximizeTileButton}
                    />
                    || input[area]===2 && <DataSources
                        maximizeTileButton={maximizeTileButton}
                    />
                    || input[area]===3 && <Graph
                        data={getCurrentData()}
                        maximizeTileButton={maximizeTileButton}
                    />
                }
                showNext={
                    <ShowNext
                        area={area}
                        labels={["Results table", "Image contents", "Data sources", "Graph"]}
                        reducer={[input, dispatch]}
                    />
                }
            />
        )
    }

    const renderAreaB = () => {
        const area = "areaB";

        const maximizeTileButton = (
            <MaximizeTileButton
                area={area}
                reducer={[input, dispatch]}
            />
        );

        return(
            <DashboardTile
                reducer={[input, dispatch]}
                area={area}
                content={
                    input[area]===0 && <Timeline
                        reducer={[input, dispatch]}
                        timelineObjectsData={dataObjects?.entitiesMultiFilter.flatMap(timelineAdapter)}
                        maximizeTileButton={maximizeTileButton}
                    />
                    || input[area]===1 && <Histogram
                        reducer={[input, dispatch]}
                        timelineData={dataObjects?.entitiesMultiFilter.map(timelineMapper)}
                        maximizeTileButton={maximizeTileButton}
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

        const maximizeTileButton = (
            <MaximizeTileButton
                area={area}
                reducer={[input, dispatch]}
            />
        );

        return(
            <DashboardTile
                reducer={[input, dispatch]}
                area={area}
                content={
                    <OurMap
                        handleRelatedObjects={handleRelatedObjects}
                        data={getCurrentData()}
                        dataType={getMapDataType()}
                        reducer={[input, dispatch]}
                        maximizeTileButton={maximizeTileButton}
                    />
                }
            />
        )
    }

    return (
        <>
            <PageHeader
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
