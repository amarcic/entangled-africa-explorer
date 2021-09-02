import React from "react";
import { Chip } from "@material-ui/core";
import { useStyles } from "../../styles";
import { useTranslation } from "react-i18next";


export const CollapsedFilters = (props) => {
    const { arachneTypes, catalogs, input } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <>
            {/*Chip for mode*/}
            <Chip label={input.mode === "archaeoSites"
                ? "Archaeological Sites"
                : "Objects"}
            />

            {/*Chip for entity types*/}
            {input.arachneTypesCheckedIds.length !== 0
            && <Chip variant="outlined" disabled={input.mode === "archaeoSites"}
                     label={
                         `${t("EntityType", {count: input.arachneTypesCheckedIds.length})}: 
                         ${arachneTypes.filter((type) => input.arachneTypesCheckedIds.includes(type.id)).map(type => type.label).join(", ")}`
                     }
            />}

            {/*Chip for for string query*/}
            {input.searchStr !== ""
            && <Chip variant="outlined" label={`Search term: ${input.searchStr}`}/>}

            {/*Chip for filter by period*/}
            {input.chronOntologyTerm !== null
            && <Chip variant="outlined" disabled={input.mode === "archaeoSites"} label={`Chronontology term: ${input.chronOntologyTerm}`}/>}

            {/*Chip for filter by region*/}
            {input.sitesMode === "region" && input.regionTitle !== null
            && <Chip variant="outlined"
                     label={`Region: ${input.regionTitle}`}
            />}

            {/*Chip for filter by coordinates*/}
            {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2)))
            && <Chip variant="outlined"
                     label={`Bounding box: [${input.boundingBoxCorner1}], [${input.boundingBoxCorner2}]`}
            />}

            {/*Chip for filter by catalogs*/}
            {input.catalogsCheckedIds.length !== 0
            && <Chip variant="outlined" disabled={input.mode === "archaeoSites"}
                     label={
                         `${t("Catalog", {count: input.catalogsCheckedIds.length})}: 
                         ${catalogs.filter((catalog) => input.catalogsCheckedIds.includes(catalog.id)).map(catalog => catalog.label).join(", ")}`
                     }
            />}
        </>
    );
};
