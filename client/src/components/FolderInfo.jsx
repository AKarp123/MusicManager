import { useState } from "react";
import {
    ListItem,
    ListItemText,
    Checkbox,
    IconButton,
    Collapse,
    Stack,
    Box
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const FolderInfo = ({ folder, selectedFolders, handleFolderSelect }) => {
    const [open, setOpen] = useState(false);
    return (
        <ListItem>
            <Stack direction={"column"} sx={{width: "100%"}}>
                <Box sx={{

                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%"
                }}>
                    <IconButton onClick={() => setOpen(!open)}>
                        <InfoIcon />
                    </IconButton>
                    <ListItemText primary={folder.folderName} />
                    <Checkbox
                        checked={selectedFolders.includes(folder.folderName)}
                        onChange={() => handleFolderSelect(folder.folderName)}
                    />
                </Box>
                <Collapse in={open}>
                    <ListItemText primary={"Album Artist: " + folder.albumArtist} />
                    <ListItemText primary={"Size: " + folder.size} />
                    <ListItemText primary={"Duration: " + folder.duration} />
                    <ListItemText
                        primary={"Average Bitrate: " + folder.avgBitrate}
                    />
                    <ListItemText
                        primary={"Sample Rate: " + folder.bitsPerSample}
                    />
                    <ListItemText primary={"Frequency: " + folder.frequency} />
                    <ListItemText primary={"Type: " + folder.type} />
                </Collapse>
            </Stack>
        </ListItem>
    );
};

export default FolderInfo;
