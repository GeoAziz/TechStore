import React, { ReactNode } from 'react';

const AppRouterContext = React.createContext<Record<string, any>>({});

const AppRouterProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AppRouterContext.Provider value={{}}>
            {children}
        </AppRouterContext.Provider>
    );
};

export { AppRouterContext, AppRouterProvider };