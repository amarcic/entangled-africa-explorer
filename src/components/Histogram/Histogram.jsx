import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { select } from "d3";
import {prepareHistogramData, binTimespanObjects} from "../../utils";

export const Histogram = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();
    //console.log(props.timelineData);
    const preparedData = prepareHistogramData(props.timelineData)?.filter( e => e&&e );
    const binnedData = binTimespanObjects({timespanObjects: preparedData, approxAmountBins: 20});
    console.log(binnedData);

    //svg dimensions
    //todo: make flexible for different screen and card sizes
    const margin = {top: 10, right: 20, left: 20, bottom: 30};
    const width = 400 - margin.left - margin.right,
          height = 100 - margin.top - margin.bottom;

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);
    const svg = select(svgRef.current);
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",`translate(${margin.left}, ${margin.top})`);

    useEffect(() => {

        binnedData
        &&svg.select("g").selectAll("rect").data(binnedData).join(
            enter => enter.append("rect")
        ).attr("y", value => height - value.values.length*5)
            .attr("x", (value, index) => index*20)
            .attr("height", value => value.values.length*5)
            .attr("width", 15)
            .attr("fill", "#69b3a2")
        ;
    }, [binnedData])

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
            </Grid>
            <Grid className={classes.gridContent} item container direction="column" spacing={2}>
                <Grid item>
                    <svg ref={svgRef}></svg>
                </Grid>
            </Grid>
        </Card>
    )
};
