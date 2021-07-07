import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import {select, scaleBand, axisBottom, axisLeft, scaleLinear, max} from "d3";
import {getTimeRangeOfTimelineData, groupByPeriods} from "../../utils";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const { timelineObjectsData } = props;
    const byPeriodData = groupByPeriods(timelineObjectsData);
    console.log(byPeriodData);

    //console.log(props.timelineData);
    const preparedData = []// prepareHistogramData(props.timelineData)?.filter( e => e&&e );
    //console.log(preparedData);
    const binnedData = [];//binTimespanObjects({timespanObjects: preparedData, approxAmountBins: 20});
    //console.log(binnedData);
    const maxYValue = "";

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);

    useEffect(() => {
        const svg = select(svgRef.current);
        //svg dimensions
        const containerHeight = parseInt(select("#timelineContainer").style("height")),
            containerWidth = parseInt(select("#timelineContainer").style("width"));

        const margin = {top: 5, right: 20, left: 20, bottom: 30};

        const width = containerWidth - margin.left - margin.right,
            height = containerHeight - margin.top - margin.bottom;

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        //remove previously rendered histogram bars in the case there is no current data from the current search
        if (!timelineObjectsData||!binnedData) {
            svg.select(".bars")
                //.append("text")
                //.text("hier gibt es nichts zu sehen")
                .selectAll(".bar").remove()
        } else {
            const periodIds = [...byPeriodData.keys()];

            const xScale = scaleLinear()
                .domain(getTimeRangeOfTimelineData(timelineObjectsData,"period"))
                .range([0,width])

            const yScale = scaleBand()
                .domain(periodIds)
                .range([height,0])
                .padding(0.2)
            //console.log(yScale("nKJfE4h8ViFn"));


            //add x axis to svg
            //todo: labels should explicitly convey the span of years the bin covers, not just the lower threshold
            svg.select(".xAxis")
                .attr("transform", `translate(0,${height})`)
                .call(axisBottom(xScale))

            //add y axis to svg
            svg.select(".yAxis")
                .call(axisLeft(yScale));

            //calculate and append histogram bars for each bin
            svg.select(".bars")
                .attr("transform",`translate(${margin.left}, ${margin.top})`)
                .selectAll("rect").data([...byPeriodData.values()]).join(
                    enter => enter.append("rect")
                ).attr("class","bar")
                    //.attr("y", value => y(value.values.length))
                    .attr("y", value => yScale(value[0].periodIds?.[0]))
                    .attr("x", value => xScale(value[0].periodSpans?.[0]?.[0]))
                    //.attr("x", value => x(`${value.lower} bis ${value.upper}`))
                    //.style("transform", "scale(1,-1)")
                    .attr("width", value => xScale(Math.abs(value[0].periodSpans?.[0]?.[0]-value[0].periodSpan?.[0]?.[1])||0))
                    .attr("height", yScale.bandwidth())
                    .transition()
                    .attr("fill", "#69b3a2");
        }
    }, [byPeriodData])

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
            </Grid>
            <Grid id="timelineContainer" className={classes.gridContent} item container direction="column" spacing={2}>
                <Grid item>
                    <svg ref={svgRef}>
                        <g className="bars">
                            <g className="xAxis"></g>
                            <g className="yAxis"></g>
                        </g>
                    </svg>
                </Grid>
            </Grid>
        </Card>
    )
};
