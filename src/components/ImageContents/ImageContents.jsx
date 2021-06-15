import React from "react";
import { useTranslation } from "react-i18next";
import { useStyles } from "../../styles";
import { Card, Grid, List, ListItem } from "@material-ui/core";

export const ImageContents = (props) => {
    const { contents } = props;

    const { t, i18n } = useTranslation();

    const classes = useStyles();

    //not sure if this format is okay as input for word cloud
    const countStuff = (stuff) => {
        let stuffCounts = {};
        if(stuff) {
            for (let i = 0; i < stuff.length; i++) {
                const num = stuff[i];
                stuffCounts[num] = stuffCounts[num] ? stuffCounts[num] + 1 : 1;
            }
        }
        return stuffCounts;
    }

    return (
        <Card className={classes.card}>
            <Grid className={classes.gridHead} item container direction="row" spacing={2}>
                <Grid item>
                    <h3 className={classes.h3}>{t('Image contents')}</h3>
                </Grid>
            </Grid>
            <Grid className={classes.gridContent} item container direction="column" spacing={2}>
                <Grid item>
                    Here could be a word cloud maybe...
                    {/*Something basic with the image contents*/}
                    {contents && contents.map((content, idx) => {
                            const countedContent = countStuff(content);
                            return (countedContent
                                && <List key={idx}>
                                    <h4>{`Image contents list ${idx}:`}</h4>
                                    {Object.keys(countedContent).map(c => {
                                            return (c
                                                && <ListItem key={c}>
                                                    {`${c}: ${countedContent[c]}`}
                                                </ListItem>

                                            )
                                        }
                                    )}
                                </List>
                            )
                        }
                    )}
                </Grid>
            </Grid>
        </Card>
    )
};
