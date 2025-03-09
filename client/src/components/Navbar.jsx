import { useContext, useState } from "react";
import {
    IconButton,
    Typography,
    Box,
    Menu,
    MenuItem,
    Link as MUILink,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import axios from "axios";
import ErrorContext from "../ErrorContext";
import UserContext from "../UserProvider";

const Navbar = () => {
    const { setUser } = useContext(UserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const setError = useContext(ErrorContext);

    const handleLogout = () => {
        axios.post("/api/logout").then((res) => {
            if (!res.data.success) {
                setError(res.data.message, "error");
                return;
            }
        });
        setUser(null);
        setError("Logged out", "success");
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
            }}
        >
            <MUILink component={Link} to="/" underline="none" color="inherit">
                <Typography variant="h5">Music Manager</Typography>
            </MUILink>
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <AccountCircle />
            </IconButton>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <MUILink
                    component={Link}
                    to="/profile"
                    underline="none"
                    color="inherit"
                >
                    <MenuItem onClick={() => setAnchorEl(null)}>
                        Profile
                    </MenuItem>
                </MUILink>
                <MUILink
                    component={Link}
                    to="/settings"
                    underline="none"
                    color="inherit"
                >
                    <MenuItem onClick={() => setAnchorEl(null)}>
                        Settings
                    </MenuItem>
                </MUILink>
                <MUILink underline="none" color="inherit">
                    <MenuItem onClick={() => handleLogout()}>Logout</MenuItem>
                </MUILink>
            </Menu>
        </Box>
    );
};

export default Navbar;
