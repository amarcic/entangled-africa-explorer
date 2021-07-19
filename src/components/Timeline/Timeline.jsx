import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import {select, scaleBand, axisBottom, axisLeft, scaleLinear, max, min} from "d3";
import {getTimeRangeOfTimelineData, newGroupByPeriods} from "../../utils";

export const Timeline = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const { timelineObjectsData } = props;
    const byPeriodData = newGroupByPeriods(timelineObjectsData);
    console.log(byPeriodData);

    //console.log(props.timelineData);

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);
    const [scale, setScale] = useState();

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
        if (!timelineObjectsData||!byPeriodData||byPeriodData.size===0) {
            svg.select(".bars")
                //.append("text")
                //.text("hier gibt es nichts zu sehen")
                .selectAll(".bar").remove()
            svg.select(".background").selectAll("rect").remove();
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
            //todo: remove this temporary cleanup of the background svg group
            svg.select(".background").selectAll("rect").remove();

            //add x axis to svg
            //todo: labels should explicitly convey the span of years the bin covers, not just the lower threshold
            svg.select(".xAxis")
                .attr("transform", `translate(0,${height})`)
                .call(axisBottom(xScale))

            //add y axis to svg
            /*svg.select(".yAxis")
                .call(axisLeft(yScale))
                .selectAll("text")
                    .text( value => value&&byPeriodData.get(value).periodName )*/

            //calculate and append histogram bars for each bin
            const bars = svg.select(".bars")
                .attr("transform",`translate(${margin.left}, ${margin.top})`)
                .selectAll("rect").data([...byPeriodData.values()]).join(
                    enter => enter.append("g").attr("class", "barGroup").append("rect")
                ).attr("class","bar")
                    .attr("y", (value,index) => yScale(periodIds[index]))
                    .attr("x", value => xScale(value.periodSpan?.[0]))
                    .attr("height", yScale.bandwidth())
                    /*.selectAll("text")
                        .text( value => value&&byPeriodData.get(value).periodName )*/
                    /*.on("click", function(event, value) {
                        svg.select(this)
                            .style("fill", "orange")
                    })*/

            const barGroups = bars.select( function() {return this.parentNode} );

            bars.on("click", (event, value) => {
                    console.log(value)

                    const element = svg.selectAll(".bar").nodes(),
                        index = element.indexOf(event.currentTarget);

                    const itemDatingMin = min(value.items, item => item.spanDated?.[0]),
                        itemDatingMax = max(value.items, item => item.spanDated?.[1]);

                    const xScaleDetail = scaleLinear()
                        .domain([itemDatingMin,itemDatingMax])
                        .range([0,width])

                    const yScaleDetail = scaleLinear()
                        .domain([0, value.items.length])
                        .range([height,0]);

                    //remove bars
                    svg.select(".bars").selectAll(".bar").remove();
                    //remove axis
                    svg.select(".xAxis").selectAll("*").remove();
                    svg.select(".yAxis").selectAll("*").remove();
                    //remove background
                    svg.select(".background").selectAll("rect").remove();

                    svg.select(".xAxis")
                        .attr("transform", `translate(0,${height})`)
                        .call(axisBottom(xScaleDetail))

                    /*svg.select(".yAxis")
                        .call(axisLeft(yScaleDetail))*/

                    svg.select(".bars")
                        .selectAll("rect").data(value.items).join(
                            enter => enter.append("rect")
                        ).attr("class","bar")
                        .attr("x", value => xScaleDetail(value.spanDated?.[0]))
                        .attr("y", (value,index) => yScaleDetail(index))
                        .attr("height", 5)
                        .transition()
                        .attr("width", value => Math.abs(xScaleDetail(value.spanDated?.[0])-xScaleDetail(value.spanDated?.[1]))+1||0)

                    svg.select(".background")
                        .selectAll("rect").data([value]).join("rect")
                        .attr("width", Math.abs(xScaleDetail(value.periodSpan?.[0])-xScaleDetail(value.periodSpan?.[1]))||0)
                        .attr("height", height)
                        .attr("x", xScaleDetail(value.periodSpan[0]))
                        .transition()
                        .attr("opacity", 0.3)
                })

                bars.transition()
                .attr("width", value => Math.abs(xScale(value.periodSpan?.[0])-xScale(value.periodSpan?.[1]))||0)
                .attr("fill", "#69b3a2");

            barGroups
                .append("text")
                    .text( value => value.periodName)
                    .attr("y", (value, index) => yScale(periodIds[index]))
                    .attr("x", value => xScale(value.periodSpan?.[0]))
            console.log(bars);
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
                        <g className="background" />
                    </svg>
                </Grid>
            </Grid>
        </Card>
    )
};
