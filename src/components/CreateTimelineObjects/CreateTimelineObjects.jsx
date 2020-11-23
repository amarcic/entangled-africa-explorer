import React from "react";
import { ReturnTimelineObject } from "..";

export const CreateTimelineObjects = (props) => {
    const { color, data, whichTimespan } = props;

    if (whichTimespan === "datingSpan") {
        return data && data.map((item, index) => {
            return item.datingSpan && item.datingSpan.map((ds, dsIndex) => {
                    return (
                        ds
                        && <ReturnTimelineObject
                            key={"datingSpan_" + index + "_" + dsIndex}
                            timespan={ds}
                            timespanIndex={dsIndex}
                            index={index}
                            item={item}
                            color={color}
                            whichTimespan={whichTimespan}
                        />
                    );
                }
            )
        })
    }
    //TODO: make less messy
    else if (whichTimespan === "temporal") {
        return data && data.map((item, index) => {
            return item.temporal && item.temporal.map((temporal, temporalIndex) => {
                    return temporal && temporal.map((temporalItem, temporalItemIndex) => {
                            return temporalItem.senses && temporalItem.senses.map((sense, senseIndex) => {
                                return (sense && sense.begin && sense.end
                                    && <ReturnTimelineObject
                                        key={"temporal_sense_" + index + "_" + temporalIndex + "_" + temporalItemIndex + "_" + senseIndex}
                                        timespan={[sense.begin, sense.end]}
                                        timespanIndex={senseIndex}
                                        index={index}
                                        item={temporalItem}
                                        color={color}
                                        whichTimespan={whichTimespan}
                                    />
                                );
                            })
                        }
                    )
                }
            )
        })
    }
}
