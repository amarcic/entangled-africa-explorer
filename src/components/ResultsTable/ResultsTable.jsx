import React from 'react';
import { Button, Card, Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { ResultsTableRow } from '..'
import { useTranslation } from "react-i18next";
import { useStyles } from '../../styles';

export const ResultsTable = (props) => {
    const [input, dispatch] = props.reducer;

    const {
        handleRelatedObjects, mapDataObjects, mapDataContext, mapDataArchaeoSites, mapDataSitesByRegion, openPopup,
        renderingConditionObjects, renderingConditionRelatedObjects, renderingConditionSites, renderingConditionSitesByRegion
    } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    return (
        <Card className={classes.card}>
            {<Grid className={classes.gridHead} item xs={12} container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Search Results')}</h3>
                </Grid>
                <Grid item>
                    {input.showRelatedObjects && <Button
                        onClick={() => handleRelatedObjects()}
                        name="hideRelatedObjects"
                        variant="contained"
                        color="primary"
                        size="small">
                        Return to search results (hide related objects)
                    </Button>}
                </Grid>
                <Grid item>
                    {input.showRelatedObjects && mapDataContext.entity.related && `${mapDataContext.entity.related.length} results (related objects)`}
                    {input.showSearchResults && mapDataObjects.entitiesMultiFilter && `${mapDataObjects.entitiesMultiFilter.length} results (objects)`}
                    {input.showArchaeoSites && mapDataSitesByRegion.sitesByRegion && input.sitesMode === "region" && `${mapDataSitesByRegion.sitesByRegion.length} results (archaeological sites, by region)`}
                    {input.showArchaeoSites && mapDataArchaeoSites.archaeologicalSites && input.sitesMode !== "region" && `${mapDataArchaeoSites.archaeologicalSites.length} results (archaeological sites)`}
                </Grid>
            </Grid>}
            {<Grid className={classes.gridContent} item xs={12} container>
                {<Grid item xs={12}>
                    {// Conditions for rendering a table
                        (renderingConditionObjects || renderingConditionRelatedObjects || renderingConditionSites || renderingConditionSitesByRegion)
                        && <Table size="small" stickyHeader aria-label="sticky table">

                            {/* Table head */}
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Show on map
                                    </TableCell>
                                    <TableCell>
                                        Title
                                    </TableCell>
                                    <TableCell>
                                        Located in
                                    </TableCell>
                                    <TableCell>
                                        iDAI.world link
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            {/* Table body */}
                            <TableBody>

                                {/* Headline over selected objects */}
                                {renderingConditionRelatedObjects
                                && <TableRow>
                                    <TableCell align="center" colSpan={4}>
                                        Selected object:
                                    </TableCell>
                                </TableRow>}
                                {/* Table row(s) for selected object */}
                                {renderingConditionRelatedObjects
                                && mapDataContext.entity.spatial
                                && mapDataContext.entity.spatial.map((place, indexPlace) => {
                                        return (
                                            //"mapDataContext.entity &&" or "place &&" needed?
                                            <ResultsTableRow
                                                key={indexPlace}
                                                index={indexPlace}
                                                item={mapDataContext.entity}
                                                itemCoordinates={place === null ? null : place.coordinates}
                                                itemLocation={place === null ? null : place.name}
                                                mode={"objects"}
                                                openPopup={openPopup}
                                            />
                                        )
                                    }
                                )}

                                {/* Headlines over related objects */}
                                {renderingConditionRelatedObjects
                                && mapDataContext.entity.related
                                && <TableRow>
                                    <TableCell align="center" colSpan={4}>
                                        Related objects:
                                    </TableCell>
                                </TableRow>}

                                {/* Table row(s) for related objects */}
                                {renderingConditionRelatedObjects
                                && mapDataContext.entity.related
                                && mapDataContext.entity.related.map((relatedObj, indexRelatedObj) => {
                                        return (relatedObj
                                            && relatedObj.spatial
                                            && relatedObj.spatial.map((place, indexPlace) => {
                                                    return (
                                                        //"relatedObj &&" or "place &&" needed?
                                                        <ResultsTableRow
                                                            key={`${indexRelatedObj}.${indexPlace}`}
                                                            index={`${indexRelatedObj}.${indexPlace}`}
                                                            item={relatedObj}
                                                            itemCoordinates={place && place.coordinates}
                                                            itemLocation={place && place.name}
                                                            mode={"objects"}
                                                            openPopup={openPopup}
                                                        />
                                                    )
                                                }
                                            )
                                        )
                                    }
                                )}

                                {/* Table row(s) for objects in mapDataObjects.entitiesMultiFilter */}
                                {renderingConditionObjects && mapDataObjects.entitiesMultiFilter.map((entity, indexEntity) => {
                                        return (entity
                                            && entity.spatial
                                            && entity.spatial.map((place, indexPlace) => {
                                                    return (
                                                        //"entity &&" or "place &&" needed?
                                                        <ResultsTableRow
                                                            key={place === null ? indexEntity : `${indexEntity}.${indexPlace}`}
                                                            index={place === null ? indexEntity : `${indexEntity}.${indexPlace}`}
                                                            item={entity}
                                                            itemCoordinates={place && place.coordinates}
                                                            itemLocation={place && place.name}
                                                            mode={"objects"}
                                                            openPopup={openPopup}
                                                        />
                                                    )
                                                }
                                            )
                                        )
                                    }
                                )}

                                {/* Table row(s) for sites in mapDataSitesByRegion.sitesByRegion */}
                                {renderingConditionSitesByRegion && mapDataSitesByRegion.sitesByRegion.map((item, index) => {
                                        return (item
                                            && <ResultsTableRow
                                                mode={"archaeoSites"}
                                                item={item}
                                                key={index}
                                                index={index}
                                                openPopup={openPopup}
                                            />
                                        )
                                    }
                                )}

                                {/* Table row(s) for sites in mapDataArchaeoSites.archaeologicalSites */}
                                {renderingConditionSites && mapDataArchaeoSites.archaeologicalSites.map((item, index) => {
                                        return (item
                                            && <ResultsTableRow
                                                mode={"archaeoSites"}
                                                item={item}
                                                key={index}
                                                index={index}
                                                openPopup={openPopup}
                                            />
                                        )
                                    }
                                )}
                            </TableBody>
                        </Table>}
                </Grid>}
            </Grid>}
        </Card>
    )
}