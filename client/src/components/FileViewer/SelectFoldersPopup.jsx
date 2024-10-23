import { useState } from "react";
import {
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

const SelectFoldersPopup = ({
    folders,
    selectPopup,
    moveFolders,
    handleClose,
}) => {
    const [directories, setDirectories] = useState(folders);
    return (
        <Dialog open={selectPopup} onClose={handleClose}>
            <DialogTitle>Choose Folders to Move</DialogTitle>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    moveFolders(directories)
                    handleClose();
                }}
            >
                <DialogContent>
                    <List>
                    {folders.map((folder, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={folder} />
                            <Checkbox
                                checked={directories.includes(folder)}
                                onChange={() => {
                                    if (directories.includes(folder)) {
                                        setDirectories(directories.filter((dir) => dir !== folder));
                                    } else {
                                        setDirectories([...directories, folder]);
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Move</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SelectFoldersPopup;
