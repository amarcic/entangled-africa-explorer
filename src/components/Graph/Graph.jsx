import React, { useEffect, useRef, useState } from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { getDimensions, getNodesAndLinks } from "../../utils";
import {
    drag, forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, scaleOrdinal, schemeCategory10, select
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
        //const svg = select(svgRef.current);
        //.attr("viewBox", [-dimensions.width / 2, -dimensions.height / 2, dimensions.width, dimensions.height]);

        // return if there is no data
        if(!data||data.size===0) return;

        const {nodes, links} = getNodesAndLinks(data);

        const circleSize = 8;
        const fontSize = 14;

        /*function boxingForce() {
            const xMax = dimensions.width/2 - (dimensions.margin.left + dimensions.margin.right)/2; //?
            const yMax = dimensions.height/2 - (dimensions.margin.top + dimensions.margin.bottom)/2; //?

            // if a node is outside the box, set its x/y to the boundary
            for (let node of nodes) {
                node.x = Math.max(-xMax, Math.min(xMax, node.x));
                node.y = Math.max(-yMax, Math.min(yMax, node.y));
            }
        }*/

        const simulation = forceSimulation(nodes)
            .force("link", forceLink(links).id((d) => d.id))
            .force("separate", forceCollide((dimensions.height+dimensions.width) * 0.02)) //?
            .force("charge", forceManyBody().strength(-(dimensions.height+dimensions.width) * 0.2)) //?
            //.force("x", forceX())
            //.force("y", forceY())
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

        // create links
        // TODO: parts of lines and arrows are hidden below larger node circles because links end in the circle centers
        const link = svg.select(".linkGroup")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrowhead)");

        // create nodes
        const node = svg.select(".nodeGroup")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(dragging(simulation));

        // set node circle radius based on weight of node, i.e. how many links are connected to it
        node.append("circle")
            .attr("r", (d) => {
                // re-calculate weight
                d.weight = link
                    .filter((l) => {
                        return l.source.index === d.index || l.target.index === d.index;
                    })
                    .size();
                return circleSize + d.weight;
            })
            .attr("fill", nodecolor());

        // add text to nodes
        node.append("text")
            .text((d) => d.name)
            .attr("stroke", "none")
            .attr("text-anchor", "start")
            .attr("dx", (d) => d.weight + circleSize + fontSize * 0.1)
            .attr("dy", fontSize * (1/3))
            .attr("font-size", fontSize);

        // add title (shown on hovering) to nodes
        node.append("title")
            .text((d) => d.id);

        //
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
                        <g className="linkGroup"></g>
                        <g className="nodeGroup"></g>
                    </svg>
                </Grid>
            </Grid>
        </>
    )
};
