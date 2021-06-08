import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { ResultsTableRow } from '..'

export const ResultsTable = (props) => {
    const {
        renderingConditionObjects, renderingConditionRelatedObjects, renderingConditionSites, renderingConditionSitesByRegion,
        mapDataObjects, mapDataContext, mapDataArchaeoSites, mapDataSitesByRegion,
        openPopup
    } = props;

    return (
        <Table size="small" stickyHeader aria-label="sticky table">

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
                && mapDataContext.entity.spatial.map( (place, indexPlace) => {
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
                && mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) => {
                        return (relatedObj
                            && relatedObj.spatial
                            && relatedObj.spatial.map( (place, indexPlace) => {
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
                {renderingConditionObjects && mapDataObjects.entitiesMultiFilter.map( (entity, indexEntity) => {
                        return (entity
                            && entity.spatial
                            && entity.spatial.map( (place, indexPlace) => {
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
                {renderingConditionSitesByRegion && mapDataSitesByRegion.sitesByRegion.map( (item, index) => {
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
                {renderingConditionSites && mapDataArchaeoSites.archaeologicalSites.map( (item, index) => {
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
        </Table>
    )
}