import React from "react";
import { Button, Card, Chip, Grid } from "@material-ui/core";
import { useStyles } from "../../styles";
import { useTranslation } from "react-i18next";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";


export const CollapsedFilters = (props) => {
    const [input, dispatch] = props.reducer;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item>
                <Button
                    onClick={() => {
                        dispatch({type: "TOGGLE_STATE", payload: {toggledField: "mapControlsExpanded"}})
                    }}
                >
                    <h3 className={classes.h3}>{t('Filters')}</h3>
                    {input.mapControlsExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </Button>

                {/*Chip for mode*/}
                <Chip label={input.mode === "archaeoSites"
                    ? "Archaeological Sites"
                    : "Objects"}
                />

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
            </Grid>
        </Card>
    )
};
