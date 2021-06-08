import React from "react";
import { ReturnTimelineObject } from "..";

export const CreateTimelineObjects = (props) => {
    const { color, data, whichTimespan, dispatch, input } = props;

    if (whichTimespan === "objectDating") {
        return data && data.map((item, index) => {
                return (item.timespan
                    && <ReturnTimelineObject
                        key={"objectDating_" + index}
                        timespan={item.timespan}
                        timespanIndex={0}
                        index={index}
                        item={item}
                        itemHeight={1}
                        color={color}
                        whichTimespan={whichTimespan}
                        dispatch={dispatch}
                        input={input}
                    />)
            }
        )
    }
    else if (whichTimespan === "periodDating") {
        if(input.timelineSort === "period") {
            return data && data.map((itemGroup, itemGroupIndex) => {
                return (itemGroup && itemGroup[0]?.periodSpans?.[0]
                    && <ReturnTimelineObject
                        key={"period_group_" + itemGroupIndex}
                        timespan={itemGroup[0]?.periodSpans?.[0]}
                        timespanIndex={itemGroupIndex}
                        index={itemGroupIndex}
                        // adjustYPosition is the the sum of all previous period's heights / length of the previous period arrays
                        adjustYPosition={data.slice(0, itemGroupIndex).map(pg => pg.length).reduce((a, b) => a + b, 0)}
                        itemHeight={data[itemGroupIndex].length}
                        item={itemGroup[0]}
                        color={color}
                        whichTimespan={whichTimespan}
                        dispatch={dispatch}
                        input={input}
                    />)
            })
        }
        else if(input.timelineSort === "object") {
            return data && data.map((item, index) => {
                return item.periodSpans?.map((periodSpan, spanDex) => {
                    return (periodSpan
                        && <ReturnTimelineObject
                            key={"period_" + index + "_" + spanDex}
                            timespan={periodSpan}
                            timespanIndex={spanDex}
                            index={index}
                            item={item}
                            itemHeight={1}
                            color={color}
                            whichTimespan={whichTimespan}
                            dispatch={dispatch}
                            input={input}
                        />)
                })
            })
        }
    }
}
