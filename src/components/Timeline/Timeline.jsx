import React, {useEffect, useRef, useState} from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { TimelineChart } from "./TimelineChart";
//import {getDimensions} from "../../utils";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();
    //const [dimensions, setDimensions] = useState({width: 0, height: 0, margin: {top: 0, right: 0, left: 0, bottom: 0}});

    const { timelineObjectsData } = props;
    const [input, dispatch] = props.reducer;
    const filteredTimelineData = timelineObjectsData&&timelineObjectsData
        .filter( datapoint =>
            datapoint.periodSpans?.[0]!==undefined||datapoint.periodSpans?.length>1);

    /*useEffect( () => {
        let currentDimensions = getDimensions("timelineContainer");
        if (currentDimensions&&currentDimensions.width!==dimensions?.width)
            setDimensions(currentDimensions);
        console.log("state dimensions", dimensions)

    }, []);*/

    return (
        <>
            <Grid className={classes.dashboardTileHeader} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
            </Grid>
            <Grid id="timelineContainer" className={classes.dashboardTileContent} item container direction="column" spacing={2}>
                <Grid item>
                    <TimelineChart
                        reducer={[input, dispatch]}
                        filteredTimelineData={filteredTimelineData}
                        //dimensions={dimensions}
                    />
                </Grid>
            </Grid>
        </>
    )
};
