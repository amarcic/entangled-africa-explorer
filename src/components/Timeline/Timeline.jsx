import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { TimelineChart } from "./TimelineChart";
//import {select, scaleBand, axisBottom, axisLeft, scaleLinear, max, min, ascending, descending} from "d3";
//import {getTimeRangeOfTimelineData, newGroupByPeriods} from "../../utils";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const { timelineObjectsData, maximizeTileButton } = props;
    const filteredTimelineData = timelineObjectsData&&timelineObjectsData.filter( datapoint => datapoint.periodSpans?.[0]!==undefined||datapoint.periodSpans?.length>1);


    //svg dimensions
    const margin = {top: 5, right: 20, left: 20, bottom: 30};

    //todo: read current dimensions on window resize
    //console.log("tlc", document.getElementById("timelineContainer"));
    const timelineContainer = document.getElementById("timelineContainer");
    const containerHeight = timelineContainer?.clientHeight,
        containerWidth = timelineContainer?.clientWidth;


    const width = containerWidth - margin.left - margin.right,
        height = containerHeight - margin.top - margin.bottom;

    const dimensions = {margin: margin, width: width, height: height};

    /*useEffect( () => {
        console.log("tlc", document.getElementById("timelineContainer").clientWidth);
    },[] )*/


    /*useEffect(() => {

        //svg dimensions
        const containerHeight = parseInt(select("#timelineContainer").style("height")),
            containerWidth = parseInt(select("#timelineContainer").style("width"));

        const width = containerWidth - margin.left - margin.right,
            height = containerHeight - margin.top - margin.bottom;

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
...deleted the rest, kept this for reference
*/


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
                <Grid item>
                    <TimelineChart filteredTimelineData={filteredTimelineData} dimensions={dimensions} />
                </Grid>
            </Grid>
        </>
    )
};
