import React from "react";

export const ReturnTimelineObject = (props) => {
    const { color, index, item, timespan, timespanIndex, whichTimespan } = props;

    const calculatedWidth = Math.abs(Math.abs(timespan[0]) - Math.abs(timespan[1])); //TODO: calculate in a better way, because e.g. [-100, 100] would not work right now

    const label = whichTimespan === "datingSpan" ? item.name : item.title;

    return (calculatedWidth !== 0
            //draw a rect for each datingSpan:
            //starting point x of the rect = the first element/year of the timespan,
            //width of the rect = difference between first and second year of the timespan,
            //offset the rects along the y-axis using the index value; TODO: find better solution to avoid overlapping
            ? <g key={"timespan_" + index + "_" + timespanIndex}>
                <rect
                    x={timespan[0]}
                    y={index * 20 + 10}
                    width={calculatedWidth}
                    height="16"
                    rx="4"
                    ry="4"
                    fill={color}
                    stroke={color}
                    strokeWidth={whichTimespan === "datingSpan" ? "1" : "10"}
                    opacity="0.5"
                />
                <text
                    x={timespan[0]}
                    y={index * 20 + 23}
                    fill="black"
                >
                    {label}
                </text>
            </g>
            //if the width of the rect would be 0 because timespan[0] === timespan[1], draw a circle instead
            : <g key={"datingSpan_" + index + "_" + timespanIndex}>
                <circle
                    cx={timespan[0]}
                    cy={index * 20 + 20}
                    r="8"
                    fill={color}
                    stroke={color}
                    strokeWidth={whichTimespan === "datingSpan" ? "1" : "10"}
                    opacity="0.5"
                />
                <text
                    x={timespan[0]}
                    y={index * 20 + 23}
                    fill="black"
                >
                    {label}
                </text>
            </g>
    )
}
