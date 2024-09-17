import { List, ListItem, ListItemText, Checkbox, Button, Box, Typography, Divider } from '@mui/material';

const PreProcess = ({selectedFolders, setSelectedFolders, options, setOptions}) => {


    const handleCheck = (e) => {
        setOptions({...options, [e.target.name]: e.target.checked});
    }

    const handleFolderSelect = (folder) => {
        if (selectedFolders.includes(folder)) {
            setSelectedFolders(selectedFolders.filter(f => f !== folder));
        } else {
            setSelectedFolders([...selectedFolders, folder]);
        }
    }

    const handleFolderChange = (e) => {
        setSelectedFolders(e.target.value.split(","));
    }

    return (
        <Box>
            <Typography variant="h5">Pre Process</Typography>
            <List>
            {options.folders.map((folder, i) => (
                <ListItem key={i}>
                    <ListItemText primary={folder} />
                    <Checkbox checked={selectedFolders.includes(folder)} onChange={() => handleFolderSelect(folder)} />
                </ListItem>
            ))}
            </List>

            <Divider sx={{ margin: "10px 0" }} />
            <Typography variant="h6">Options</Typography>
            <List>
                <ListItem>
                    <ListItemText primary="Replay Gain" />
                    <Checkbox name="replayGain" checked={options.replayGain} onChange={handleCheck} />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Convert to MP3" />
                    <Checkbox name="convertToMp3" checked={options.convertToMp3} onChange={handleCheck} />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Convert Hi Res FLAC" />
                    <Checkbox name="convertHiResFlac" checked={options.convertHiResFlac} onChange={handleCheck} />
                </ListItem>
                
                <ListItem>
                    <Button variant="contained" color="primary">Pre Process</Button>
                </ListItem>
            </List>
        </Box>
    );




}

export default PreProcess;