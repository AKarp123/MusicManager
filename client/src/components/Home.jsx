import PageBackdrop from "./PageBackdrop";
import { Typography } from "@mui/material";

const Home = () => {
    return (
        <div>
            <PageBackdrop>
                <Typography variant="h3" sx={{textAlign: "center"}}>Music Manager!</Typography>
            </PageBackdrop>
        </div>
    );
};

export default Home;
