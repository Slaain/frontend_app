import '../styles/globals.css';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';
import user from '../reducers/user'; // Votre reducer utilisateur

// Combine reducers
const reducers = combineReducers({
    user: user,
    // Ajoutez d'autres reducers ici si nécessaire
});

// Configurer redux-persist
const persistConfig = {
    key: 'teamboard',
    storage,
    whitelist: ['user'], // Persist uniquement l'état utilisateur
};

const persistedReducer = persistReducer(persistConfig, reducers);

// Configurer le store Redux
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Nécessaire pour redux-persist
        }),
});

const persistor = persistStore(store);

function App({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <Head>
                    <title>TeamBoard</title>
                </Head>
                <Component {...pageProps} />
            </PersistGate>
        </Provider>
    );
}

export default App;
