import {Button, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import React from "react";

export const GazetteerEntry = (props) => {
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
                Show related sites
            </Button>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row">Namen:</TableCell>
                        <TableCell>{item.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Identifier:</TableCell>
                        <TableCell>{item.identifier}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Lage:</TableCell>
                        <TableCell>{item.coordinates || itemCoordinates}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Art:</TableCell>
                        <TableCell>?</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Kontexte:</TableCell>
                        <TableCell>?</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Liegt in:</TableCell>
                        <TableCell>{(item.locatedIn && item.locatedIn.name) || itemLocation}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Tags:</TableCell>
                        <TableCell>?</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Provenienz:</TableCell>
                        <TableCell>?</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">Datensatzgruppe:</TableCell>
                        <TableCell>?</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </React.Fragment>
    )
}