import { group } from "d3-array";
import {latLngBounds} from "leaflet";
//import { useTranslation } from 'react-i18next';

//const { t, i18n } = useTranslation();

const initialInput = {
    //search parameters / filters
    mode: "objects", //possible values: "objects", "sites", "sitesByRegion"
    searchStr: "brosche",
    arachneTypesCheckedIds: ["Bilder", "Einzelobjekte", "Topographien"],
    catalogsCheckedIds: [],
    gazetteerRegion: {id: null, label: ""},
    chronOntologyTerms: [],
    boundingBoxCorner1: [],
    boundingBoxCorner2: [],
    drawBBox: false,

    //for searching related objects or regions
    showRelatedObjects: false,
    selectedObjectId: 0,
    selectedRegionId: 0,

    //map
    mapBounds: latLngBounds([28.906303, -11.146792], [-3.355435, 47.564145]),
    zoomLevel: 5,
    clusterMarkers: true,
    selectedMarker: undefined,

    //timeline
    timelineSort: "period",
    highlightedTimelineObject: undefined,
    highlightedObjects: [],

    //dashboard layout
    areaA: 0,
    areaB: 0,
    bigTileArea: "",
};

//todo: change out translation keys for English terms, e.g. "Images" instead of "arachneTypeBilder" – because these
// keys will be shown as default if no translation exists
const arachneTypes = (t) => [ //todo: welche davon sollen angeboten werden? einige gibt es gar nicht für SPP/Afrika nehme ich an.
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

export {
    initialInput,
    arachneTypes,
    catalogs
};