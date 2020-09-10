import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import RoomIcon from "@material-ui/icons/Room";
import { ResultsTableRow } from '..'

export const ResultsTable = (props) => {
    const {
        renderingConditionObjects, renderingConditionRelatedObjects, renderingConditionSites, renderingConditionSitesByRegion,
        mapDataObjectsByString, mapDataContext, mapDataArchaeoSites, mapDataSitesByRegion,
        openPopup
    } = props;

    return (
        <Table size="small" stickyHeader aria-label="sticky table">
            {/* Table header */}
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

                {/* TODO: extract to ResultsTableRow? */}
                {/* Table row(s) for selected object */}
                {renderingConditionRelatedObjects
                && <TableRow>
                    <TableCell align="center" colSpan={4}>
                        Selected object:
                    </TableCell>
                </TableRow>}
                {renderingConditionRelatedObjects
                && mapDataContext.entity.spatial
                && mapDataContext.entity.spatial.map( (place, indexPlace) => {
                        return (place === null
                                ? (mapDataContext.entity
                                    && <TableRow>
                                        <TableCell>
                                            (No coordinates)
                                        </TableCell>
                                        <TableCell>
                                            {mapDataContext.entity.name}
                                        </TableCell>
                                        <TableCell>

                                        </TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title="View original entry in iDAI.world"
                                                arrow placement="right">
                                                <a href={`https://arachne.dainst.org/entity/${mapDataContext.entity.identifier}`}
                                                   target="_blank"
                                                   rel="noreferrer"><ExitToAppIcon/></a>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>)
                                : (place
                                    && <TableRow key={indexPlace}>
                                        <TableCell>
                                            {place.coordinates
                                                ? (<Tooltip title="Show on map" arrow placement="right">
                                                    <RoomIcon
                                                        fontSize="small"
                                                        onClick={() => openPopup(indexPlace)}
                                                    />
                                                </Tooltip>)
                                                : "(No coordinates)"}
                                        </TableCell>
                                        <TableCell>
                                            {mapDataContext.entity.name}
                                        </TableCell>
                                        <TableCell>
                                            {place.name}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title="View original entry in iDAI.world"
                                                arrow placement="right">
                                                <a href={`https://arachne.dainst.org/entity/${mapDataContext.entity.identifier}`}
                                                   target="_blank"
                                                   rel="noreferrer"><ExitToAppIcon/></a>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>)
                        )
                    }
                )}
                {/* Table row(s) for related objects */}
                {renderingConditionRelatedObjects
                && mapDataContext.entity.related
                && <TableRow>
                    <TableCell align="center" colSpan={4}>
                        Related objects:
                    </TableCell>
                </TableRow>}
                {renderingConditionRelatedObjects && mapDataContext.entity.related && mapDataContext.entity.related.map( (relatedObj, indexRelatedObj) => {
                        return ( relatedObj
                            && relatedObj.spatial
                            && relatedObj.spatial.map( (place, indexPlace) => {
                                    return (place === null
                                            ? (relatedObj
                                                && <TableRow key={indexRelatedObj + '.' + indexPlace}>
                                                    <TableCell>
                                                        (No coordinates)
                                                    </TableCell>
                                                    <TableCell>
                                                        {relatedObj.name}
                                                    </TableCell>
                                                    <TableCell>

                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip
                                                            title="View original entry in iDAI.world"
                                                            arrow placement="right">
                                                            <a href={`https://arachne.dainst.org/entity/${relatedObj.identifier}`}
                                                               target="_blank"
                                                               rel="noreferrer"><ExitToAppIcon/></a>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>)
                                            : (place
                                                && <TableRow key={indexRelatedObj + '.' + indexPlace}>
                                                    <TableCell>
                                                        {place.coordinates
                                                            ? (<Tooltip title="Show on map" arrow placement="right">
                                                                <RoomIcon
                                                                    fontSize="small"
                                                                    onClick={() => openPopup(indexRelatedObj + '.' + indexPlace)}
                                                                />
                                                            </Tooltip>)
                                                            : "(No coordinates)"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {relatedObj.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {place.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip
                                                            title="View original entry in iDAI.world"
                                                            arrow placement="right">
                                                            <a href={`https://arachne.dainst.org/entity/${relatedObj.identifier}`}
                                                               target="_blank"
                                                               rel="noreferrer"><ExitToAppIcon/></a>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>)
                                    )
                                }
                            )
                        )
                    }
                )}

                {/* TODO: extract to ResultsTableRow? */}
                {/* Table row(s) for objects in mapDataObjectsByString.entitiesMultiFilter */}
                {renderingConditionObjects && mapDataObjectsByString.entitiesMultiFilter.map( (entity, indexEntity) => {
                        return entity && entity.spatial && entity.spatial.map( (place, indexPlace) => {
                                return (place === null
                                        ? (entity
                                            && <TableRow key={indexEntity}>
                                                <TableCell>
                                                    (No coordinates)
                                                </TableCell>
                                                <TableCell>
                                                    {entity.name}
                                                </TableCell>
                                                <TableCell>

                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip
                                                        title="View original entry in iDAI.world"
                                                        arrow placement="right">
                                                        <a href={`https://arachne.dainst.org/entity/${entity.identifier}`}
                                                           target="_blank"
                                                           rel="noreferrer"><ExitToAppIcon/></a>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>)
                                        : (place
                                            && <TableRow
                                                key={`${indexEntity}.${indexPlace}`}>
                                                <TableCell>
                                                    {<Tooltip title="Show on map" arrow
                                                              placement="right">
                                                        <RoomIcon
                                                            fontSize="small"
                                                            onClick={() => openPopup(indexEntity + '.' + indexPlace)}
                                                        />
                                                    </Tooltip>}
                                                </TableCell>
                                                <TableCell>
                                                    {entity.name}
                                                </TableCell>
                                                <TableCell>
                                                    {place.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip
                                                        title="View original entry in iDAI.world"
                                                        arrow placement="right">
                                                        <a href={`https://arachne.dainst.org/entity/${entity.identifier}`}
                                                           target="_blank"
                                                           rel="noreferrer"><ExitToAppIcon/></a>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>)
                                )
                            }
                        )
                    }
                )}

                {/* Table row(s) for sites in mapDataSitesByRegion.sitesByRegion */}
                {renderingConditionSitesByRegion && mapDataSitesByRegion.sitesByRegion.map( (item, index) => {
                        return (item
                            && <ResultsTableRow
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