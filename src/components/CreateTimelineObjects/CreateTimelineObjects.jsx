import React from "react";
import {ReturnTimelineObject} from "../ReturnTimelineObject/ReturnTimelineObject";

export const CreateTimelineObjects = (props) => {
    const { data } = props;

    return data && data.map((item, index) => {
        return item.datingSpan && item.datingSpan.map((ds, dsIndex) => {
                return (
                    ds
                    && <ReturnTimelineObject
                        key={"datingSpan_" + index + "_" + dsIndex}
                        datingSpan={ds}
                        datingSpanIndex={dsIndex}
                        index={index}
                        item={item}
                    />
                );
            }
        )
    })
}