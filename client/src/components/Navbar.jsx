import { useState } from "react";
import { IconButton, Typography, Box, Menu, MenuItem, Link as MUILink} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";

const Navbar = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

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
                <MUILink component={Link} to="/profile" underline="none" color="inherit">
                    <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
                </MUILink>
                <MUILink component={Link} to="/settings" underline="none" color="inherit">
                    <MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
                </MUILink>
                <MUILink component={Link} to="/logout" underline="none" color="inherit">
                    <MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
                </MUILink>
            </Menu>
        </Box>
    );
};

export default Navbar;
