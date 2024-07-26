import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { getUserInfo, isAuthenticated } from '../shared/helper';

export const AuthenticationContext = createContext();

function AuthContext({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [isLogin, setisLogin] = useState(false);
  const param = useMemo(() => ({ userInfo, isLogin }), [userInfo, isLogin]);

  useEffect(() => {
    setUserInfo(getUserInfo());
    setisLogin(isAuthenticated());
  }, [isAuthenticated()]);
  return (
    <AuthenticationContext.Provider value={param}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export default AuthContext;
