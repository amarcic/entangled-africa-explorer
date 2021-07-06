import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    card: {
        padding: theme.spacing(2),
        height: "100%",
        width: "100%"
    },
    gridBody: {
        height: "85vh",
        justifyContent: "space-between"
    },
    gridContent: {
        height: "85%",
        overflow: "scroll"
    },
    gridFullHeightItem: {
        height: "100%"
    },
    gridHalfHeightItem: {
        height: "45%",
        justifyContent: "space-between",
        alignItems: "center"
    },
    gridHead: {
        maxHeight: "15%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    h1: {
        fontSize: "1.25rem"
    },
    h2: {
        fontSize: "1rem"
    },
    h3: {
        fontSize: "0.95rem",
        textTransform: "uppercase"
    },
    paper: {
        marginRight: theme.spacing(2),
    },
}));

export { useStyles };