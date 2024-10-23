


export const reducer = (state, action) => {

    switch(action.type) {
        case "SET_DIRECTORY_LIST":
            return {
                ...state,
                directoryList: action.payload,
            };
        case "SET_CURRENT_DIRECTORY":
            return {
                ...state,
                currentDirectory: action.payload,
            };
        case "TOGGLE_NEW_FOLDER_POPUP":
            return {
                ...state,
                directoryPopup: !state.directoryPopup,
            };
        case "TOGGLE_SELECT_POPUP":
            return {
                ...state,
                selectPopup: !state.selectPopup,
            };
        case "SET_FOLDERS":
            return {
                ...state,
                folders: action.payload,
            };
        default:
            return state;
        
    }



}

