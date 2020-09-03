import {TableCell, TableRow, Tooltip} from "@material-ui/core";
import RoomIcon from "@material-ui/icons/Room";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import React from "react";

export const ResultsTableRow = (props) => {
    const { item, index, openPopup } = props;

    return (
        <TableRow>
            <TableCell>
                {item.coordinates
                    ? (<Tooltip title="Show on map" arrow placement="right">
                        <RoomIcon
                            fontSize="small"
                            onClick={() => openPopup(index)}
                        />
                    </Tooltip>)
                    : "no coordinates"}
            </TableCell>
            <TableCell>
                {item.name}
            </TableCell>
            <TableCell>
                {item.locatedIn && item.locatedIn.name}
            </TableCell>
            <TableCell>
                <Tooltip title="View original entry in iDAI.world" arrow placement="right">
                    <a href={`https://gazetteer.dainst.org/place/${item.identifier}`} target="_blank" rel="noreferrer">
                        <ExitToAppIcon/>
                    </a>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
};
