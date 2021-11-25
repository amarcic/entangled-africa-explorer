import { group } from "d3-array";
import {latLngBounds} from "leaflet";
//import { useTranslation } from 'react-i18next';

//const { t, i18n } = useTranslation();

const initialInput = {
    //search parameters / filters
    mode: "objects", //possible values: "objects", "sites", "sitesByRegion"
    searchStr: "",
    arachneCategoriesCheckedIds: ["Bilder", "Einzelobjekte", "Topographien"],
    catalogsCheckedIds: [],
    gazetteerRegion: {id: null, label: ""},
    chronOntologyTerms: ["Holozän"],
    boundingBoxCorner1: [],
    boundingBoxCorner2: [],
    drawBBox: false,
    focusAfrica: true,

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

//todo: change out translation keys for English terms, e.g. "Images" instead of "arachneCategoryBilder" – because these
// keys will be shown as default if no translation exists
const arachneCategories = (t) => [ //todo: welche davon sollen angeboten werden? einige gibt es gar nicht für SPP/Afrika nehme ich an.
    {"label": t("arachneCategoryEinzelobjekte"), "id": "Einzelobjekte"},
    {"label": t("arachneCategoryMehrteilige Denkmäler"), "id": "MehrteiligeDenkmaeler"},
    {"label": t("arachneCategoryBauwerke"), "id": "Bauwerke"},
    {"label": t("arachneCategoryBauwerksteile"), "id": "Bauwerksteile"},
    {"label": t("arachneCategoryBilder"), "id": "Bilder"},
    {"label": t("arachneCategoryBücher"), "id": "Buecher"},
    {"label": t("arachneCategoryBuchseiten"), "id": "Buchseiten"},
    {"label": t("arachneCategoryEinzelmotive"), "id": "Einzelmotive"},
    {"label": t("arachneCategoryGruppierungen"), "id": "Gruppierungen"},
    {"label": t("arachneCategoryInschriften"), "id": "Inschriften"},
    {"label": t("arachneCategoryLiteratur"), "id": "Literatur"},
    {"label": t("arachneCategoryOrte"), "id": "Orte"},
    {"label": t("arachneCategoryReproduktionen"), "id": "Reproduktionen"},
    {"label": t("arachneCategoryPersonen"), "id": "Personen"},
    {"label": t("arachneCategoryRezeptionen"), "id": "Rezeptionen"},
    {"label": t("arachneCategorySammlungen"), "id": "Sammlungen"},
    {"label": t("arachneCategorySzenen"), "id": "Szenen"},
    {"label": t("arachneCategoryTopographien"), "id": "Topographien"},
    {"label": t("arachneCategoryTypen"), "id": "Typen"},
    {"label": t("arachneCategory3D-Modelle"), "id": "dreiDModelle"}
];

const catalogs = [
    //{"label": "All SPP 2143 Arachne data", "id": 0}, //no such catalog yet
    //{"label": "AAArC - Fundplätze", "id": 942}, //incomplete example catalog

    //todo: gewünschte Titel ggf. mit Projekten oder Bonn absprechen
    {"label": "Necked Axes (P01)", "id": 1071, "public": false}, //not public yet
    {"label": "The Lake Chad Region as a Crossroad (P04)", "id": 1073, "public": false}, //not public yet
    {"label": "Cultivated Landscapes (P05)", "id": 954, "public": true},
    {"label": "Routes of Interaction (P07)", "id": 987, "public": false}, //not public yet
    //{"label": " (P11)", "id": }, //no catalog yet
]

export {
    initialInput,
    arachneCategories,
    catalogs
};