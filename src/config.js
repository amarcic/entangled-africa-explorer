import { group } from "d3-array";
import {latLngBounds} from "leaflet";

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
    highlightedObjects: [],
    areaA: 1,
    areaB: 0,
    bigTileArea: "",
    arachneTypesCheckedIds: ["Bilder", "Einzelobjekte", "Topographien"],
};

export {
    initialInput
};