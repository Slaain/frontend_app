import '../styles/globals.css';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import storage from 'redux-persist/lib/storage';

// Exemple de reducers (à remplacer par vos reducers réels)
const userReducer = (state = {}, action) => state; // Remplacez par votre reducer
const projectReducer = (state = {}, action) => state; // Remplacez par votre reducer

// Combine reducers
const reducers = combineReducers({
    user: userReducer,
    project: projectReducer,
});

// Configurer redux-persist
const persistConfig = {
    key: 'teamboard',
    storage,
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
