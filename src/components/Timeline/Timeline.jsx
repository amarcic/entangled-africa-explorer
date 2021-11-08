import React from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { TimelineChart } from "./TimelineChart";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const { timelineObjectsData, maximizeTileButton } = props;
    const [input, dispatch] = props.reducer;
    const filteredTimelineData = timelineObjectsData&&timelineObjectsData
        .filter( datapoint =>
            datapoint.periodSpans?.[0]!==undefined||datapoint.periodSpans?.length>1);

    return (
        <>
            <Grid className={classes.dashboardTileHeader} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
                <Grid item xs={1}>
                    {maximizeTileButton}
                </Grid>
            </Grid>
            <Grid id="timelineContainer" className={classes.dashboardTileContent} item container direction="column" spacing={2}>
                <TimelineChart
                    reducer={[input, dispatch]}
                    filteredTimelineData={filteredTimelineData}
                />
            </Grid>
        </>
    )
};
