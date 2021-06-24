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
    //console.log(binnedData);

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);

    useEffect(() => {
        const svg = select(svgRef.current);
        binnedData
        &&svg.selectAll("rect").data(binnedData).join(
            enter => enter.append("rect")
        ).attr("height", value => value.values.length*10)
            .attr("width", 15)
            .attr("y", 15)
            .attr("x", (value, index) => index*20)
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
