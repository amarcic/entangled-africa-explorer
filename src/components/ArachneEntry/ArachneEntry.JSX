import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React from "react";

export const ArachneEntry = (props) => {
    //itemCoordinates and itemLocation are used if this information is coming from a different field than for most items
    const { item, itemCoordinates, itemLocation } = props;

    return (
        <React.Fragment>
            <h4>{item.name}</h4>
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
    );
}