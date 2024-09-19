import { List, ListItem, ListItemText, Checkbox, Button, Box, Typography, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Status from './Status';

const PreProcess = ({ options, setOptions}) => {
    const [selectedFolders, setSelectedFolders] = useState([]); 
    const [localOptions, setLocalOptions] = useState(options);
    const [isProcessing, setIsProcessing] = useState(false);    
    const [statusMessage, setStatusMessage] = useState("");


    useEffect(() => {
        if(!isProcessing) {
            return;
        }
        const eventSource = new EventSource("/api/status");
        eventSource.onmessage = (e) => {
            
            const data = JSON.parse(e.data);
            setStatusMessage(data.message);

            if(message === 'Files Processed successfully!') {
                setIsProcessing(false);
                eventSource.close();
            }

        }
        return () => {
            eventSource.close();
        }
    }, [isProcessing]);

    const handleCheck = (e) => {
        // console.log(localOptions)
        setLocalOptions({...localOptions, [e.target.name]: e.target.checked});
        console.log(localOptions)
    }

    const handleFolderSelect = (folder) => {
        if (selectedFolders.includes(folder)) {
            setSelectedFolders(selectedFolders.filter(f => f !== folder));
        } else {
            setSelectedFolders([...selectedFolders, folder]);
        }
    }

    

    const process = () => {
        setIsProcessing(true);
        axios.post("/api/process", {options: localOptions})
            .then(res => {
                console.log(res.data);
            })

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
                    <Checkbox name="replayGain" checked={localOptions.replayGain} onChange={handleCheck} disabled/>
                </ListItem>
                <ListItem>
                    <ListItemText primary="Convert to MP3" />
                    <Checkbox name="convertToMp3" checked={localOptions.convertToMp3} onChange={handleCheck} />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Convert Hi Res FLAC" />
                    <Checkbox name="convertHiResFlac" checked={localOptions.convertHiResFlac} onChange={handleCheck} />
                </ListItem>
                
                <ListItem>
                    <Button variant="contained" color="primary" onClick={process}>Pre Process</Button>
                </ListItem>
            </List>

            <Status statusMessage={statusMessage}/>
        </Box>
    );




}

export default PreProcess;