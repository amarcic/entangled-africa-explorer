import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    dashboardHeader: {
        justifyContent:"space-between",
        alignItems:"stretch",
        height: "12vh",
        zIndex: 100
    },
    dashboardBody: {
        height: "calc(100vh - 12vh - 12px)"
    },
    dashboardFooter: {
        height: "12px"
    },

    dashboardTileHeader: {
        //minHeight: "5%",
        //justifyContent: "flex-start",
        //alignItems: "center"
    },
    dashboardTileContent: {
        height: "85%",
        overflow: "scroll"
    },
    cardOfTileWithShowNext: {
        padding: theme.spacing(2),
        height: "calc(100% - 35px)", //35px is the height of the ShowNext bar
        width: "100%"
    },
    cardOfTileWithoutShowNext: {
        padding: theme.spacing(2),
        height: "100% ",
        width: "100%"
    },

    fullHeightTile: {
        height: "calc(100vh - 12vh - 12px)",
        //padding: theme.spacing(2)
    },
    halfHeightTile: {
        height: "calc(50vh - 6vh - 6px)", // half of the dashboardBody/dashboardHeader/dashboardFooter height
        // this class will take the same height as fullHeightTile if the screen is size "xs":
        [theme.breakpoints.down("xs")]: {
            height: "calc(100vh - 12vh - 12px)",
        }
    },
    "dashboardBody || fullHeightTile || halfHeightTile": {
        //justifyContent: "space-between",
        //alignItems: "center"
    },

    h1: {
        fontSize: "1.25rem"
    },
    h2: {
        fontSize: "1rem"
    },
    h3: {
        fontSize: "0.8rem",
        textTransform: "uppercase"
    },
    paper: {
        marginRight: theme.spacing(2),
    },
}));

export { useStyles };