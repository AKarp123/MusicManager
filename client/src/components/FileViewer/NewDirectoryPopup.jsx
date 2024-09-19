import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

const NewDirectoryPopup = ({
    createNewDirectory,
    newFolderPopup,
    handleClose,
}) => {
    const [folderName, setFolderName] = useState("");

    return (
        <Dialog open={newFolderPopup} onClose={handleClose}>
            <DialogTitle>New Folder</DialogTitle>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    createNewDirectory(folderName);
                }}
            >
                <DialogContent>
                    <TextField
                        label="Folder Name"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={() => createNewDirectory(folderName)}>
                        Create
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default NewDirectoryPopup;
