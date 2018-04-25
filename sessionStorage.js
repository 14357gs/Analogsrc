export const loadState = (initialState) => {
    try {
        const serializedState = sessionStorage.getItem('state');
        if(serializedState === null) {
            return initialState;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem('state', serializedState);
    } catch (err) {
        //IGNORE write errors
    }
}
