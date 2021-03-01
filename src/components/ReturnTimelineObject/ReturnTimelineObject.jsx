import React, {useEffect, useState} from "react";


export const ReturnTimelineObject = (props) => {
    const { color, index, item, timespan, timespanIndex, whichTimespan, dispatch, input } = props;

    const id = whichTimespan === "objectDating" ? item.itemId : item.periodIds[timespanIndex];

    //state used to focus timeline objects
    const [highlighted, setHighlighted] = useState(input.highlightedTimelineObject === id + "_" + whichTimespan);

    useEffect( () => {
        setHighlighted(input.highlightedTimelineObject === id + "_" + whichTimespan)
    }, [input.highlightedTimelineObject]);


    const calculatedWidth = Math.abs(timespan[1] - timespan[0]);

    const formatDate = (value) => {
        return value < 0 ? -value + " BC" : value !== 0 ? value + " AD" : 0
    }


    return (
        <g
            key={"timespan_" + index + "_" + timespanIndex}
            onMouseOver={
                () => {
                    dispatch({
                        type: "UPDATE_INPUT",
                        payload: {field: "highlightedTimelineObject", value: id + "_" + whichTimespan}
                    })
                }
            }
            onMouseOut={
                () => {
                    dispatch({
                        type: "UPDATE_INPUT",
                        payload: {field: "highlightedTimelineObject", value: undefined}
                    })
                }
            }
        >
            {calculatedWidth !== 0
                //draw a rect for each datingSpan:
                //starting point x of the rect = the first year of the timespan,
                //width of the rect = difference between first and second year of the timespan,
                //offset the rects along the y-axis using the index value; TODO: find better solution to avoid overlapping
                ? <rect
                    x={timespan[0]}
                    y={index * 25 + 10}
                    width={calculatedWidth}
                    height="14"
                    //rx="4"
                    //ry="4"
                    fill={highlighted ? color.darker() : color}
                    stroke={highlighted ? color.darker() : color}
                    strokeWidth={whichTimespan === "objectDating" ? "1" : "10"}
                    opacity={highlighted ? "1" : "0.35"}
                />
                //if the width of the rect would be 0 because timespan[0] === timespan[1], draw a circle instead
                : <circle
                    cx={timespan[0]}
                    cy={index * 25 + 17}
                    r="7"
                    fill={highlighted ? color.darker() : color}
                    stroke={highlighted ? color.darker() : color}
                    strokeWidth={whichTimespan === "objectDating" ? "1" : "10"}
                    opacity={highlighted ? "1" : "0.35"}

                />
            }
            <text
                transform={`translate(${timespan[1]} ${index * 25 + 15})`}
                x="0"
                y="0"
                fill={color.darker(2)}
                style={{
                    fontSize: "12px"
                }}
                opacity={highlighted ? "1" : "0"}
            >
                <tspan x="1">
                    {whichTimespan === "objectDating" ? `${item.itemName} (${id})` : item.periodNames}
                </tspan>
                <tspan x="1" dy="1.2em">
                    {
                        //format is either "yearA - yearB", or just one year if timespan[0] === timespan[1]
                        calculatedWidth !== 0
                            ? `(${formatDate(timespan[0])} - ${formatDate(timespan[1])})`
                            : `(${formatDate(timespan[0])})`
                    }
                </tspan>
            </text>
        </g>
    );
}
