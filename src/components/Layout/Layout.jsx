import React from 'react';
import { Grid } from '@material-ui/core'
import { useStyles } from '../../styles';


export const Layout = (props) => {
    const {menu, bigTile, leftOrTopTile, topRightOrMiddleTile, bottomRightOrBottomTile, loadingIndicator, rightTileIsMovedToBottomInstead} = props;

    const classes = useStyles();

    /* Default breakpoints (inclusive-exclusive):
             xs = extra-small: 0px-600px
             sm = small: 600px-960px
             md = medium: 960px-1280px
             lg = large: 1280px-1920px
             xl = extra-large: 1920px-...
    */

    return (
        // container for dashboard
        <Grid
            className={classes.gridBody}

            container
            direction="row"
            spacing={2}
        >

            <Grid
                item
                xs={12}
                md={12}
                lg={12}

                container
                direction="column"
            >
                {
                    // collapsed or expanded filters
                    menu
                }
            </Grid>

            {bigTile && <Grid
                className={classes.fullHeightTile}

                item
                xs={12}
                md={12}
                lg={12}

                container
                direction="row"
                spacing={0}
            >
                {
                    // whichever tile was enlarged by the user
                    bigTile
                }
            </Grid>}

            {leftOrTopTile && <Grid
                className={classes.fullHeightTile}

                item
                xs={12}
                md={rightTileIsMovedToBottomInstead ? 12 : 6}
                lg={rightTileIsMovedToBottomInstead ? 12 : 4}

                container
            >
                {
                    // map (if not enlarged)
                    leftOrTopTile
                }
            </Grid>}

            {/*container for the right or bottom area (= areaA and areaB)*/}
            <Grid
                //className={rightTileIsMovedToBottomInstead ? classes.halfHeightTile : classes.fullHeightTile}

                item
                xs={12}
                md={rightTileIsMovedToBottomInstead ? 12 : 6}
                lg={rightTileIsMovedToBottomInstead ? 12 : 8}

                container
                direction={/*TODO: needs something like 'if not small screen' && */"row"}
                spacing={rightTileIsMovedToBottomInstead ? 2 : 0}
            >

                <Grid
                    className={classes.halfHeightTile}

                    item
                    xs={12}
                    md={rightTileIsMovedToBottomInstead ? 6 : 12}

                    container
                    direction="row"
                >
                    {
                        // areaA (if not enlarged, in that case areaB moves here)
                        topRightOrMiddleTile
                    }
                </Grid>

                <Grid
                    className={classes.halfHeightTile}

                    item
                    xs={12}
                    md={rightTileIsMovedToBottomInstead ? 6 : 12}

                    container
                    direction="row"
                >
                    {
                        // areaB (if not enlarged)
                        bottomRightOrBottomTile
                    }
                </Grid>
            </Grid>

            <Grid item
                  xs={12}
                  md={12}
                  lg={12}

                  style={{height: "12px"}}
            >
                {
                    // loading symbol (if current query result is still loading)
                    loadingIndicator
                }
            </Grid>
        </Grid>
    );
}
