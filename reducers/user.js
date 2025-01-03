import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    username: null,
    roles: [], // Ajout de la clé 'roles' dans l'état initial
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token;
            state.username = action.payload.username;
            state.roles = action.payload.roles || []; // Assurer que 'roles' est toujours un tableau
        },
        logout: (state) => {
            state.token = null;
            state.username = null;
            state.roles = []; // Réinitialisation de 'roles' lors de la déconnexion
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
