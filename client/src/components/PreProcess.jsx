import { List, ListItem, ListItemText, Checkbox, Button, Box, Typography, Divider } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Status from './Status';
import ErrorContext from '../ErrorContext';

const PreProcess = ({ options, setView}) => {
    const [selectedFolders, setSelectedFolders] = useState([]); 
    const [localOptions, setLocalOptions] = useState(options);
    const [isProcessing, setIsProcessing] = useState(0); // 0 = not processing, 1 = processing, 2 = done processing 
    const [statusMessage, setStatusMessage] = useState("");
    const setError = useContext(ErrorContext);


    useEffect(() => {
        if(!isProcessing) {
            return;
        }
        const eventSource = new EventSource("/api/status");
        eventSource.onmessage = (e) => {
            
            const data = JSON.parse(e.data);
            console.log(data)
            if(data.message === 'Files Processed successfully!') {
                setIsProcessing(2);
                eventSource.close();
            }
            setStatusMessage(data.message);


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
        setIsProcessing(1);
        axios.post("/api/process", {options: localOptions, selectedFolders})
            .then(res => {
                if(res.data.success) {
                    setError("Files Processed successfully!", "success");
                    
                    
                }
                else {
                    setError(res.data.message);
                }
                
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
            {isProcessing === 1 && <Status statusMessage={statusMessage}/>}
            {isProcessing === 2 && <Button variant="contained" color="primary" onClick={() => setView(2)}>Move Folders</Button>}
            
        </Box>
    );




}

export default PreProcess;