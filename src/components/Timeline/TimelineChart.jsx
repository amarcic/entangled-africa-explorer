import React, {useEffect, useRef, useState} from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { select, scaleBand, axisBottom, scaleLinear, scaleQuantize, zoom, extent } from "d3";
import {getTimeRangeOfTimelineData, newGroupByPeriods,useResize} from "../../utils";

export const TimelineChart = (props) => {
    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const [input, dispatch] = props.reducer;

    const svgRef = useRef();
    const wrapperRef = useRef();
    console.log("dimensions", props.dimensions)

    const size = useResize(wrapperRef);
    const xDomain = getTimeRangeOfTimelineData(props.filteredTimelineData,"period");
    const dataUnsorted = newGroupByPeriods(props.filteredTimelineData);
    const data = dataUnsorted && new Map([...dataUnsorted.entries()]
        //sort by period start year
        .sort( (a,b) =>
            a[1].periodSpan?.[0] - b[1].periodSpan?.[0] ));

    const timelineData = { xDomain, data, svgRef };

    //console.log("filteredTimelineData: ", props.filteredTimelineData);
    console.log("grouped by periods and sorted: ", data)
    //console.log("sorted data: ", dataUnsorted)

    //setting up the svg after first render
    useEffect(() => {
        if (!size) return;
        const { margin } = props.dimensions;
        const {width, height} = size;
        //console.log("width", width)
        const svg = select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        svg.select('.timelineGroup')
            .attr("transform",`translate(${margin.left}, ${margin.top})`);

    }, [props.dimensions]);

    //draw timeline everytime filteredTimelineData changes
    useEffect( () => {
        if (!size) return;
        drawTimeline(timelineData, props.dimensions)
    }, [props.filteredTimelineData, props.dimensions, size, input] );

//todo: check if still depending on outer scope (like height, width, margin)
    const drawTimeline = (timelineConfig, dimensions) => {

        const { data, svgRef, xDomain } = timelineConfig;
        const { margin } = dimensions;
        const { width, height } = size;
        console.log("w&h: ", width, height)
        const svg = select(svgRef.current);
        //todo: change name to be more describing: limit of bar height for rendering labels in different ways
        const labelRenderLimit = 8;

        //empty canvas in case no data is found by query
        if(!data||data.size===0) {
            svg.selectAll(".bar").remove();
            svg.selectAll(".label").remove();
            return;
        }
        //console.log([...data.values()]);


        const selection = svg.select(".timelineGroup").selectAll("rect").data([...data.values()], data => data.periodId);
        const selectionLabels = svg.select(".timelineGroup").selectAll(".label").data([...data.values()], data => data.periodId);
        const periodIds = [...data.keys()];
        const itemQuantityExtent = extent([...data.values()].map( value => value.items.length));

        //scale for the x axis
        const xScale = scaleLinear()
            .domain(xDomain)
            .range([0,width])
        //scale for the y axis
        const yScale = scaleBand()
            .domain(periodIds)
            .range([height,0])
            .padding(0.2)

        //add x axis to svg
        const xAxis = axisBottom(xScale);
        const xAxisDraw = svg.select(".xAxis")
            .attr("transform", `translate(0,${height+margin.top})`)
            .call(xAxis);

        //todo: application wide color scale should be used; colors are not that great
        const colorScale = scaleQuantize()
            .domain(itemQuantityExtent)
            .range(["#5AE6BA","#4BC8A3","#3EAA8C","#318D75","#25725F"]);

        //function to add labels to the bars (when bandwidth is high enough for readable labels)
        //todo: remove outer dependency on selectionLabels?
        const addLabels = (bandwidth, renderLimit) => {
            if (bandwidth > renderLimit) {
                selectionLabels
                    .enter()
                    .append("text")
                    .attr("class", "label")
                    .attr("x", value => xScale(value.periodSpan?.[0]))
                    .attr("y", value => yScale(value.periodId))
                    .text(value => value.periodName);

                //position labels
                selectionLabels
                    .attr("x", value => xScale(value.periodSpan?.[0]))
                    .attr("y", value => yScale(value.periodId))

                //remove labels on exit
                selectionLabels
                    .exit()
                    .remove()
            } else {
                svg.selectAll(".label")
                    .remove();
            }
        }

        //add clip path to svg for later use
        if (document.getElementById("clip")===null&&height&&width) {
            svg.append("defs").append("clipPath")
                .attr("id","clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", 0)
                .attr("y", 0);
        }

        //apply the prepared clip path to the svg group containing the bars and labels
        svg.select(".timelineGroup")
            .attr("clip-path", "url(#clip)");

        //set up zoom and pan
        const handleZoom = (event) => {

            const transform = event.transform;
            //zoom and pan bars (geometric)
            svg.select(".timelineGroup").selectAll(".bar")
                .attr("transform", transform);

            const xScaleNew = transform.rescaleX(xScale);
            const yScaleNew = yScale.range([height,0].map( d => transform.applyY(d) ));

            xAxis.scale(xScaleNew);
            xAxisDraw.call(xAxis);

            addLabels(yScaleNew.bandwidth(), labelRenderLimit);

            svg.selectAll(".label")
                .attr("x", value => xScaleNew(value.periodSpan?.[0]))
                .attr("y", value => yScaleNew(value.periodId));
        };
        const zimzoom = zoom()
            .scaleExtent([1,5])
            .translateExtent([[0,0], [width, height+margin.bottom+margin.top]])
            .on("zoom", handleZoom);
        const initZoom = () => {
            svg
                .call(zimzoom);
        }

        //add bars (without extension) for each period on enter and return a selection of all entering and updating nodes
        const selectionEnteringAndUpdating = selection.join(
            enter => enter
                .append("rect")
                    .attr("class", "bar")
                    //.attr("fill", "#69b3a2")
        );

        console.log("new and updating: ", selectionEnteringAndUpdating);

        //position and extend bars according to temporal extent of period
        selectionEnteringAndUpdating
            .attr("height", yScale.bandwidth())
            .transition()
            .attr("x", value => xScale(value.periodSpan?.[0]))
            .attr("y", (value, index) => yScale(periodIds[index]))
            .attr("width", value => Math.abs(xScale(value.periodSpan?.[0])-xScale(value.periodSpan?.[1]))||0)
            .attr("class", value =>
                value.items.map( item =>
                    item.id ).some( id =>
                        input.highlightedObjects.indexOf(id) >-1 )
                            ? "bar highlighted"
                            : "bar")
            .attr("fill", value => colorScale(value.items.length))
            /*.attr("stroke", value => highlighted.objects.some( id =>
                value.items.map( item => item.id).indexOf(id) > -1)
                ? "black"
                : "red")*/

        //display tooltip when mouse enters bar on chart
        selectionEnteringAndUpdating
            .on("mouseenter", (event, value) => {
                select(event.currentTarget)
                    .attr("id", "mouse-target")
                    .on("mouseleave", () => {
                        select("#mouse-target")
                            .attr("id", null)
                    })
                svg
                    .selectAll(".tooltip")
                    .data([value])
                    .join("text")
                    .attr("class", "tooltip")
                    .text( value => yScale.bandwidth() <= labelRenderLimit
                        ? `${value.periodName}: ${value.items.length} ${t("Item", {count: value.items.length})}`
                        : `${value.items.length} ${t("Item", {count: value.items.length})}`)
                    .attr("text-anchor", "middle")
                    .attr("x", value => xScale(value.periodSpan?.[0]))
                    .attr("y", value => yScale(value.periodId)+yScale.bandwidth()/*+margin.top*/)
            });

        //remove tooltips when mouse leaves the svg
        svg
            .on("mouseleave", () => {
            svg
                .selectAll(".tooltip")
                .remove()
        } )

        selectionEnteringAndUpdating
            .on("click", (event, value) => {
                dispatch({
                    type: "UPDATE_INPUT",
                    payload: {field: "highlightedObjects", value: value.items.map( item => item.id)}
                });
            })

        addLabels(yScale.bandwidth(), labelRenderLimit);

        //apply zoom
        initZoom();
    }

    const updateTimeline = () => {

    }

    return (
        <div className="timeline" ref={wrapperRef}>
            <svg ref={svgRef}>
                <g className="timelineGroup">

                </g>
                <g className="xAxis"></g>
                <g className="yAxis"></g>
                <g className="background" />
            </svg>
        </div>
    )
};
