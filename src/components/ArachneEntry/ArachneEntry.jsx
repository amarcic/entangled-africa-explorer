import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React from "react";
import Button from "@material-ui/core/Button";

export const ArachneEntry = (props) => {
    //itemCoordinates and itemLocation are used if this information is coming from a different field than for most items
    const { item, itemCoordinates, itemLocation } = props;

    return (
        <React.Fragment>
            <h4>{item.name}</h4>
            <Button
                //onClick={() => {handleRelatedObjects(item.identifier)}}
                //name="showRelatedObjects"
                //disabled={showRelatedObjects}
                variant="contained"
                color="primary"
                size="small"
                style={{float: "right"}}
            >
                Show related objects
            </Button>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row">Name:</TableCell>
                        <TableCell>{item.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Identifier:</TableCell>
                        <TableCell>{item.identifier}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Lokalisierung:</TableCell>
                        <TableCell>{item.coordinates || itemCoordinates}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Datierung:</TableCell>
                        <TableCell>{item.periodName}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </React.Fragment>
    )
}