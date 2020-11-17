import React, {useEffect, useState} from "react";
import * as d3 from "d3";


export const ReturnTimelineObject = (props) => {
    const { color, index, item, timespan, timespanIndex, whichTimespan } = props;

    //state used to focus timeline objects
    const [highlighted, setHighlighted] = useState(false);

    //TODO: calculate in a better way, because e.g. [-100, 100] would not work right now
    const calculatedWidth = Math.abs(Math.abs(timespan[0]) - Math.abs(timespan[1]));

    const formatDate = (value) => {
        return value < 0 ? -value + " BC" : value !== 0 ? value + " AD" : 0
    }


    return (
        <g
            key={"timespan_" + index + "_" + timespanIndex}
            onMouseOver={
                () => setHighlighted(!highlighted)
            }
            onMouseOut={
                () => setHighlighted(!highlighted)
            }
        >
            {calculatedWidth !== 0
                //draw a rect for each datingSpan:
                //starting point x of the rect = the first year of the timespan,
                //width of the rect = difference between first and second year of the timespan,
                //offset the rects along the y-axis using the index value; TODO: find better solution to avoid overlapping
                ? <rect
                    x={timespan[0]}
                    y={index * 20 + 10}
                    width={calculatedWidth}
                    height="16"
                    rx="4"
                    ry="4"
                    fill={highlighted ? color.darker() : color}
                    stroke={highlighted ? color.darker() : color}
                    strokeWidth={whichTimespan === "datingSpan" ? "1" : "10"}
                    opacity={highlighted ? "1" : "0.5"}
                />
                //if the width of the rect would be 0 because timespan[0] === timespan[1], draw a circle instead
                : <circle
                    cx={timespan[0]}
                    cy={index * 20 + 18}
                    r="8"
                    fill={highlighted ? color.darker() : color}
                    stroke={highlighted ? color.darker() : color}
                    strokeWidth={whichTimespan === "datingSpan" ? "1" : "10"}
                    opacity={highlighted ? "1" : "0.5"}

                />
            }
            <text
                transform={`translate(${timespan[1]} ${index * 20 + 13})`}
                x="0"
                y="0"
                fill={color.darker(2)}
                style={{
                    fontSize: "12px"
                }}
                opacity={highlighted ? "1" : "0"}
            >
                <tspan x="1">
                    {whichTimespan === "datingSpan" ? item.name : item.title}
                </tspan>
                <tspan x="1" dy="1.2em">
                    {`(${formatDate(timespan[0])} - ${formatDate(timespan[1])})`}
                </tspan>
            </text>
        </g>
    );
}
