


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
        case "MOVE_NEW_DIRECTORY":
            return {
                ...state,
                directoryList: [...state.directoryList, action.payload],
                currentDirectory: currentDirectory + "/" + action.payload,
            }
        default:
            return state;
        
    }



}

