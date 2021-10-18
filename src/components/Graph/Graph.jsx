import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { getDimensions, getNodesAndLinks } from "../../utils";
import {
    drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, scaleOrdinal,
    schemeCategory10, select, zoom
} from "d3";


export const Graph = (props) => {
    const { data, maximizeTileButton } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    const svgRef = useRef();

    const [dimensions, setDimensions] = useState({width: 0, height: 0, margin: {top: 0, right: 0, left: 0, bottom: 0}});

    useEffect( () => {
        let currentDimensions = getDimensions("graphContainer");
        if (currentDimensions&&currentDimensions.width!==dimensions?.width)
            setDimensions(currentDimensions);
    }, []);

    const [svg, setSvg] = useState(select(svgRef.current));

    //setting up the svg after first render
    useEffect(() => {
        //const { width, height, margin } = dimensions;

        const updatedSvg = select(svgRef.current)
            .attr("viewBox", [-dimensions.width / 2, -dimensions.height / 2, dimensions.width, dimensions.height]);

        setSvg(updatedSvg);
    }, [dimensions]);

    //draw graph every time data or dimensions change
    useEffect( () => {
        drawGraph(data, dimensions)
    }, [data, dimensions] );


    // node colors
    const nodecolor = () => {
        const scale = scaleOrdinal(schemeCategory10)
            .domain(["arachne", "Bilder", "chronontology", "gazetteer"])
            .range(["red", "orange", "blue", "green"]);
        return (d) => scale(d.subtype && d.subtype === "Bilder" ? d.subtype : d.type);
    }

    // dragging functionality
    const dragging = simulation => {

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event,d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event,d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // draw graph
    const drawGraph = (data, dimensions) => {
        // return if there is no data
        if(!data||data.size===0) return;

        const {nodes, links} = getNodesAndLinks(data);

        const circleSize = 10,
            fontSize = 14;

        /*function boxingForce() {
            const xMax = dimensions.width/2 - (dimensions.margin.left + dimensions.margin.right)/2; //?
            const yMax = dimensions.height/2 - (dimensions.margin.top + dimensions.margin.bottom)/2; //?

            // if a node is outside the box, set its x/y to the boundary
            for (let node of nodes) {
                node.x = Math.max(-xMax, Math.min(xMax, node.x));
                node.y = Math.max(-yMax, Math.min(yMax, node.y));
            }
        }*/

        // create simulation with combination of forces
        const simulation = forceSimulation(nodes)
            .force("link", forceLink(links).id((d) => d.id))
            .force("separate", forceCollide((dimensions.height+dimensions.width) * 0.02)) //?
            .force("charge", forceManyBody().strength(-(dimensions.height+dimensions.width) * 0.2)) //?
            .force("x", forceX())
            .force("y", forceY())
            .force("center", forceCenter())
        //.force("bounds", boxingForce);

        //const svg = select(svgRef.current)
        //    .attr("viewBox", [-dimensions.width / 2, -dimensions.height / 2, dimensions.width, dimensions.height]);

        // define arrowhead to be used as marker-end
        svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", circleSize * 1.75)
            .attr("markerWidth", circleSize)
            .attr("markerHeight", circleSize)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#000");


        //set up zoom and pan
        const handleZoom = (event) => {
            //zoom and pan the entire graph
            svg.select(".graphGroup")
                .attr("transform", event.transform);

            updateLabels(event.transform.k);
        };

        const minZoom = 0.5,
            maxZoom = 3;

        const zimzoom = zoom()
            .scaleExtent([minZoom, maxZoom]) // if first value is set to 0 then zooming out will have no limit
            .translateExtent([[-dimensions.height, -dimensions.width], [dimensions.width, dimensions.height]])
            .on("zoom", handleZoom);

        const initZoom = () => {
            svg
                .call(zimzoom);
        };

        const startingZoom = () => {
            svg
                .transition()
                .duration(1500)
                .call(zimzoom.scaleTo, minZoom);
        };


        // create links
        //svg.selectAll(".line").remove(); // does not work
        const link = svg.select(".linkGroup")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("class", "line")
            .attr("stroke-width", 0.1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);
        //.attr("marker-end", "url(#arrowhead)");


        // create nodes
        const node = svg.select(".nodeGroup")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .style("opacity", 0)
            .call(dragging(simulation));

        // add circles to nodes
        svg.selectAll(".circle").remove();
        node.append("circle")
            .attr("class", "circle")
            .attr("r", circleSize)
            .attr("fill", nodecolor());

        // add labels to nodes
        svg.selectAll(".label").remove();
        node.append("text")
            .attr("class", "label")
            .text((d) => d.name)
            .attr("stroke", "none")
            .attr("text-anchor", "start")
            .attr("dx", (d) => d.weight + circleSize + fontSize * 0.1)
            .attr("dy", fontSize * (1/3))
            .attr("font-size", fontSize);

        // add title (shown on hovering) to nodes
        svg.selectAll(".title").remove();
        node.append("title")
            .attr("class", "title")
            .text((d) => d.id);


        // transitions
        node
            .transition()
            .duration(500)
            .style("opacity", 1);

        svg.selectAll(".circle")
            .transition()
            .duration(2000)
            .attr("r", (d) => {
                // set node circle radius based on weight of node, i.e. how many links are connected to it
                d.weight = link
                    .filter((l) => l.source.index === d.index || l.target.index === d.index)
                    .size();
                return circleSize + d.weight;
            });

        link
            .transition()
            .duration(1000)
            .attr("stroke-width", 2);


        // apply zoom
        startingZoom();
        initZoom();


        // the simulation will adjust itself according to the current data and specified forces for 300 ticks (default)
        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y);

            node.attr("transform", (d) => `translate(${d.x},${d.y})`);
        });

        return svg.node();
    }

    return (
        <>
            <Grid className={classes.dashboardTileHeader} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Graph')}</h3>
                </Grid>
                <Grid item xs={1}>
                    {maximizeTileButton}
                </Grid>
            </Grid>
            <Grid id="graphContainer" className={classes.dashboardTileContent} item container direction="column" spacing={2}>
                <Grid item>
                    <svg ref={svgRef}>
                        <g className="graphGroup">
                            <g className="linkGroup"></g>
                            <g className="nodeGroup"></g>
                        </g>
                    </svg>
                </Grid>
            </Grid>
        </>
    )
};
