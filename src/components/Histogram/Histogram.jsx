import React from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import {prepareHistogramData} from "../../utils";

export const Histogram = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();
    console.log(props.timelineData);

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
            </Grid>
            <Grid className={classes.gridContent} item container direction="column" spacing={2}>
                <Grid item>
                    Here will be the histogram...
                </Grid>
            </Grid>
        </Card>
    )
};
