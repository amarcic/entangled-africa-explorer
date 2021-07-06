import React, {useEffect, useRef, useState} from "react";
import { Card, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import {select, scaleBand, axisBottom, axisLeft, scaleLinear, max} from "d3";
import {prepareHistogramData, binTimespanObjects} from "../../utils";

export const Histogram = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    //console.log(props.timelineData);
    const preparedData = prepareHistogramData(props.timelineData)?.filter( e => e&&e );
    //console.log(preparedData);
    const binnedData = binTimespanObjects({timespanObjects: preparedData, approxAmountBins: 20});
    //console.log(binnedData);

    const svgRef = useRef();
    //const [data, setData] = useState(binnedData);

    useEffect(() => {
        const svg = select(svgRef.current);
        //svg dimensions
        const containerHeight = parseInt(select("#histogramContainer").style("height")),
            containerWidth = parseInt(select("#histogramContainer").style("width"));

        const margin = {top: 5, right: 20, left: 20, bottom: 30};

        const width = containerWidth - margin.left - margin.right,
            height = containerHeight - margin.top - margin.bottom;

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        //remove previously rendered histogram bars in the case there is no current data from the current search
        if (!binnedData||preparedData.length===0) {
            svg.select(".bars")
                //.append("text")
                //.text("hier gibt es nichts zu sehen")
                .selectAll(".bar").remove()
        } else {
            //maximum value on y axis
            const maxYValue = max(binnedData.map( bin => bin.values.length));

            //calculate scale for x axis
            const x = scaleBand()
                .domain(binnedData.map( bin => bin.lower))
                //.domain(binnedData.map( bin => `${bin.lower} bis ${bin.upper}`))
                .range([0, width])
                .padding(0.2);

            //calculate scale for y axis
            const y = scaleLinear()
                .domain([0,maxYValue])
                .range([height, 0]);

            /* unused color scale
            const colorScale = scaleLinear()
                .domain([0,maxYValue])
                .range(["#69b3a2","red"]);
            */

            //add x axis to svg and rotate labels
            //todo: labels should explicitly convey the span of years the bin covers, not just the lower threshold
            svg.select(".xAxis")
                .attr("transform", `translate(0,${height})`)
                .call(axisBottom(x))
                .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

            //add y axis to svg
            svg.select(".yAxis")
                .call(axisLeft(y));

            //calculate and append histogram bars for each bin
            svg.select(".bars")
                .attr("transform",`translate(${margin.left}, ${margin.top})`)
                .selectAll("rect").data(binnedData).join(
                    enter => enter.append("rect")
                ).attr("class","bar")
                    //.attr("y", value => y(value.values.length))
                    .attr("y", height*-1)
                    .attr("x", value => x(value.lower))
                    //.attr("x", value => x(`${value.lower} bis ${value.upper}`))
                    .style("transform", "scale(1,-1)")
                    .attr("width", x.bandwidth())
                    .on("mouseenter", (event, value) => {
                        const element = svg.selectAll(".bar").nodes();
                        const index = element.indexOf(event.target);
                        console.log(value);
                        svg
                            .selectAll(".tooltip")
                            .data([value])
                            .join("text")
                            .attr("class","tooltip")
                            .text(`${value.lower}-${value.upper}: ${value.values.length}`)
                            .attr("x", x(value.lower)+x.bandwidth())
                            .attr("y", y(value.values.length)+3)
                            .attr("text-anchor","middle")
                    })
                    .transition()
                    .attr("height", value => height - y(value.values.length))
                    .attr("fill", "#69b3a2");
        }
    }, [binnedData, props.go])

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Temporal distribution')}</h3>
                </Grid>
            </Grid>
            <Grid id="histogramContainer" className={classes.gridContent} item container direction="column" spacing={2}>
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
