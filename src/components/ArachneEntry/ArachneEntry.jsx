//detailed table entry that is shown when a results table row is clicked
//todo: show related objects etc. on opening the row?

import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

export const ArachneEntry = (props) => {
    //itemCoordinates are used if this information is coming from a different field than for most items
    const { item, itemCoordinates } = props;

    const { t, i18n } = useTranslation();

    return (
        <>
            <h4>{item.name}</h4>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell component="th" scope="row">{t("ArachneEntryIdentifier")}:</TableCell>
                        <TableCell>{item.identifier}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">{t("ArachneEntryLocalization")}:</TableCell>
                        <TableCell>{item.coordinates || itemCoordinates}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">{t("ArachneEntryDating")}:</TableCell>
                        <TableCell>{item?.datingSets?.map(dS => dS?.datingItems.join("; ")).filter(Boolean).join("; ")}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell component="th" scope="row">{t("ArachneEntryPeriod")}:</TableCell>
                        <TableCell>{item?.temporal?.map(temp => temp.map(t => t?.title).join("–")).filter(Boolean).join("; ")}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}