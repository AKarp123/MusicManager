


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
        default:
            return state;
        
    }



}

