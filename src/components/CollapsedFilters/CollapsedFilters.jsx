import React from "react";
import { Chip } from "@material-ui/core";
import { useStyles } from "../../styles";
import { useTranslation } from "react-i18next";


export const CollapsedFilters = (props) => {
    const { input } = props;

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
            {input.arachneTypesCheckedLabels.length !== 0
            && <Chip variant="outlined" label={`Entity types: ${input.arachneTypesCheckedLabels}`}/>}

            {/*Chip for for string query*/}
            {input.searchStr !== ""
            && <Chip variant="outlined" label={`Search term: ${input.searchStr}`}/>}

            {/*Chip for filter by period*/}
            {input.chronOntologyTerm !== null
            && <Chip variant="outlined" label={`Chronontology term: ${input.chronOntologyTerm}`}/>}

            {/*Chip for filter by region*/}
            {input.sitesMode === "region" && input.regionTitle !== null
            && <Chip variant="outlined"
                     label={`Region: ${input.regionTitle}`}
            />}

            {/*Chip for filter by coordinates*/}
            {(/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner1) && (/-?\d{1,2}\.\d+,-?\d{1,3}\.\d+/.test(input.boundingBoxCorner2)))
            && <Chip variant="outlined"
                     label={`Bounding box: [${input.boundingBoxCorner1}], [${input.boundingBoxCorner2}]`}/>}

            {/*Chip for filter by catalogs*/}
            {input.checkedCatalogLabels.length !== 0
            && <Chip variant="outlined" label={`Catalog: ${input.checkedCatalogLabels}`}/>}
        </>
    );
};
