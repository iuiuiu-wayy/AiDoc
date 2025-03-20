import { useEffect } from "react";
import { useGetProfileQuery } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoggedIn } from "./authSlice";
import { RootState } from "../../store";
import { Button } from "antd";
import { LoginOutlined } from "@ant-design/icons";

interface LoginProps {
  children: React.ReactNode;
}

const Login: React.FC<LoginProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const dispatch = useDispatch();

  const handleLogin = () => {
    window.location.replace(
      "http://localhost/api/login?redirect_to=" + encodeURI("/ui"),
    );
  };
  const { data, isSuccess, isLoading } = useGetProfileQuery();
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setIsLoggedIn(true));
    } else {
      dispatch(setIsLoggedIn(false));
    }
  }, [data, isSuccess, dispatch]);
  if (isLoading) return <>Loading.. </>;
  if (!isLoggedIn)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <h1>Welcome to the App :)</h1>
        <Button
          type="primary"
          shape="round"
          icon={<LoginOutlined />}
          size="large"
          onClick={handleLogin}
          style={{
            marginTop: "20px",
            backgroundColor: "#A8AF50",
            borderColor: "#A3A355",
          }}
        >
          Login
        </Button>
      </div>
    );
  return <>{children}</>;
};

export default Login;
