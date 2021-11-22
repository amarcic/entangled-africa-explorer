import React from "react";
import { Chip } from "@material-ui/core";
import { useStyles } from "../../styles";
import { useTranslation } from "react-i18next";
import { arachneTypes } from "../../config";


export const CollapsedFilters = (props) => {
    const { catalogs, input } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <>
            {/*Chip for mode/search starting point*/}
            <Chip label={`${t("Searching in")}: ${input.mode === "objects" ? "iDAI.objects" : "iDAI.gazetteer"}`}/>

            {/*Chip for iDAI.objects entity types*/}
            {input.arachneTypesCheckedIds.length !== 0
            && <Chip variant="outlined" disabled={(input.mode === "sites" || input.mode === "sitesByRegion")}
                     label={
                         `${t("EntityType", {count: input.arachneTypesCheckedIds.length})}: 
                         ${arachneTypes(t).filter((type) => input.arachneTypesCheckedIds.includes(type.id)).map(type => type.label).join(", ")}`
                     }
            />}

            {/*Chip for for string query*/}
            {input.searchStr !== ""
            && <Chip variant="outlined" label={`${t("Search term")}: ${input.searchStr}`}/>}

            {/*Chip for filter by period*/}
            {input.chronOntologyTerms.length !== 0
            && <Chip variant="outlined" disabled={(input.mode === "sites" || input.mode === "sitesByRegion")} label={`${t("Chronontology term", {count: input.chronOntologyTerms.length})}: ${input.chronOntologyTerms.join(", ")}`}/>}

            {/*Chip for filter by region*/}
            {input.gazetteerRegion.id !== null
            && <Chip variant="outlined"
                     label={`${t("Region")}: ${input.gazetteerRegion.label}`}
                     disabled={input.mode === "objects"}
            />}

            {/*Chip for filter by coordinates*/}
            {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2)))
            && <Chip variant="outlined"
                     label={`${t("Bounding box")}: [${input.boundingBoxCorner1}], [${input.boundingBoxCorner2}]`}
            />}

            {/*Chip for filter by catalogs*/}
            {input.catalogsCheckedIds.length !== 0
            && <Chip variant="outlined" disabled={(input.mode === "sites" || input.mode === "sitesByRegion")}
                     label={
                         `${t("Catalog", {count: input.catalogsCheckedIds.length})}: 
                         ${catalogs.filter((catalog) => input.catalogsCheckedIds.includes(catalog.id)).map(catalog => catalog.label).join(", ")}`
                     }
            />}
        </>
    );
};
