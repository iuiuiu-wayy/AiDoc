import { useEffect, useState } from "react";
import { useGetProfileQuery } from "../../services/api";
import { Modal } from "antd";
import { handleLogout } from "../../components/Logout";
import { handleLogin } from "../../components/Login";

interface LoginProps {
  children: React.ReactNode;
}

const Login: React.FC<LoginProps> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  const { isSuccess, isLoading, error } = useGetProfileQuery();

  useEffect(() => {
    if (!isLoading && !isSuccess) {
      setShowModal(true);
    }
  }, [isSuccess, isLoading]);
  if (isLoading) return <>Loading.. </>;
  if (error === undefined) return <>{children}</>;
  const cond = "status" in error ? (error.status === 403 ? 403 : 401) : 0;
  if (cond === 403) {
    return (
      <>
        {children}
        <Modal
          title="Require access"
          open={showModal}
          onOk={handleLogout}
          onCancel={() => setShowModal(false)}
          okText="Login as guest"
          cancelText="Cancel"
        >
          You currently don't have access to upload your data.
          <br />
          please please ask the developer to allow access to you account 😊.
        </Modal>
      </>
    );
  }
  if (cond === 401) {
    return (
      <>
        {children}
        <Modal
          title="Guest access"
          open={showModal}
          onOk={handleLogin}
          onCancel={() => setShowModal(false)}
          okText="Login"
          cancelText="Use guest"
        >
          You are currently logged in as a guest user and woudn't be able to
          upload your own data (example data are availabel).
          <br />
          please login and request access to the dev if you wish for full acess
          😊.
        </Modal>
      </>
    );
  }
  return <>{children}</>;
};

export default Login;
