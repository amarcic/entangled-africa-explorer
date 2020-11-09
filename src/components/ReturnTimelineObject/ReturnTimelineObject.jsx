import React from "react";

export const ReturnTimelineObject = (props) => {
    const { datingSpan, datingSpanIndex, index, item } = props;

    const calculatedWidth = Math.abs(Math.abs(datingSpan[0]) - Math.abs(datingSpan[1])); //TODO: calculate in a better way, because e.g. [-100, 100] would not work right now

    return (calculatedWidth !== 0
            //draw a rect for each datingSpan:
            //starting point x of the rect = the first element/year of the datingSpan,
            //width of the rect = difference between first and second year of the datingSpan,
            //offset the rects along the y-axis using the index value; TODO: find better solution to avoid overlapping
            ? <g key={"datingSpan_" + index + "_" + datingSpanIndex}>
                <rect
                    x={datingSpan[0]}
                    y={index * 10}
                    width={calculatedWidth}
                    height="10"
                    strokeWidth="1"
                    stroke="black"
                    rx="2"
                    ry="2"
                    fill="gold"
                />
                <text
                    x={datingSpan[0]}
                    y={index * 10 + 10}
                    fill="black"
                >
                    {item.name}
                </text>
            </g>
            //if the width of the rect would be 0 because datingSpan[0] === datingSpan[1], draw a circle instead
            : <g key={"datingSpan_" + index + "_" + datingSpanIndex}>
                <circle
                    cx={datingSpan[0]}
                    cy={index * 10}
                    r="5"
                    strokeWidth="1"
                    stroke="black"
                    fill="gold"
                />
                <text
                    x={datingSpan[0]}
                    y={index * 10 + 10}
                    fill="black"
                >
                    {item.name}
                </text>
            </g>
    )
}
