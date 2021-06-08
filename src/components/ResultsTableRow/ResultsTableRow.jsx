import { Box, Collapse, TableCell, TableRow, Tooltip } from "@material-ui/core";
import RoomIcon from "@material-ui/icons/Room";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React, { useState } from 'react';
import { ArachneEntry, GazetteerEntry } from "..";


export const ResultsTableRow = (props) => {
    //itemCoordinates and itemLocation are used if this information is coming from a different field than for most items
    const { index, item, itemCoordinates, itemLocation, mode, openPopup } = props;

    //state used to open/close (expand/collapse) TableRows
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow
                onClick={() => setOpen(!open)}
                style={{cursor: "pointer"}}
            >
                <TableCell>
                    {(item.coordinates || itemCoordinates)
                        ? (<Tooltip title="Show on map" arrow placement="right">
                            <RoomIcon
                                fontSize="small"
                                onClick={() => openPopup(index)}
                            />
                        </Tooltip>)
                        : "(No coordinates)"}
                </TableCell>
                <TableCell>
                    {item.name}
                </TableCell>
                <TableCell>
                    {(item.locatedIn && item.locatedIn.name) || itemLocation}
                </TableCell>
                <TableCell>
                    <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                        <a href={
                            mode==="archaeoSites"
                                ? `https://gazetteer.dainst.org/place/${item.identifier}`
                                : `https://arachne.dainst.org/entity/${item.identifier}`
                        } target="_blank" rel="noreferrer">
                            <ExitToAppIcon/>
                        </a>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            {mode==="archaeoSites"
                                ? <GazetteerEntry
                                    item={item}
                                    itemCoordinates={itemCoordinates}
                                    itemLocation={itemLocation}
                                />
                                : <ArachneEntry
                                    item={item}
                                    itemCoordinates={itemCoordinates}
                                    itemLocation={itemLocation}
                                />
                            }
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};
