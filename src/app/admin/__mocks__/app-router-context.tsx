import React from 'react';

const AppRouterContext = React.createContext();

const AppRouterProvider = ({ children }) => {
    return (
        <AppRouterContext.Provider value={{}}>
            {children}
        </AppRouterContext.Provider>
    );
};

export { AppRouterContext, AppRouterProvider };