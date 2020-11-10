import React, { useMemo } from "react";
import * as d3 from "d3";

export const CreateTimelineAxis = (props) => {
    const { domain, range, position } = props;
    /*if ((Math.abs(range[0]) + range[1]) < 500) {
        console.log("yes")
        range = [range[0] - 1000, range[1] + 1000];
    }*/

    const ticks = useMemo(() => {
        const xScale = d3.scaleLinear()
            .domain(domain)
            .range(range);
        const pixelsPerTick = 30;
        const numberOfTicksTarget = Math.max(1, Math.floor(pixelsPerTick));
        return (
            xScale.ticks(numberOfTicksTarget)
                .map(value => ({
                    value,
                    xOffset: xScale(value)
                }))
        );
    }, [domain, range])

    //TODO: calculate positions with variables instead of hard coding numbers
    return (
        <>
            <path
                d={position === "top"
                    ? [
                        "M", range[0], 35,
                        "v", 10,
                        "H", range[1],
                        "v", -10
                    ].join(" ")
                    : [
                        "M", range[0], 15,
                        "v", -10,
                        "H", range[1],
                        "v", 10
                    ].join(" ")}
                fill="none"
                stroke="black"
            />
            {ticks.map(({ value, xOffset }) => (
                <g
                    key={value}
                    transform= {position === "top" ? `translate(${xOffset}, 35)` : `translate(${xOffset}, 5)`}
                >
                    <line
                        y2="10"
                        stroke="black"
                    />
                    <text
                        key={value}
                        style={{
                            fontSize: "14px",
                            textAnchor: "middle",
                            transform: position === "top" ? "translateY(-5px)" : "translateY(25px)"
                        }}
                    >
                        { value < 0 ? -value + "BC" : value !== 0 ? value + " AD" : 0 }
                    </text>
                </g>
            ))}
        </>
    );
}
