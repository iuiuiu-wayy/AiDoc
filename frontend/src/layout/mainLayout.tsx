import React, { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Layout, Menu, MenuProps, Modal, theme } from "antd";
import { useGetProfileQuery } from "../services/api";
import { handleLogout } from "../components/Logout";
import { handleLogin } from "../components/Login";

const { Header, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { data: loginData } = useGetProfileQuery();
  const handleLoginout = () => {
    if (loginData) {
      handleLogout();
    } else {
      handleLogin();
    }
  };
  const onClick: MenuProps["onClick"] = (e) => {
    if (e.key === "About") {
      setShowModal(true);
    }
  };

  return (
    <Layout>
      <Modal
        title="About AiDoc"
        open={showModal}
        footer={[]}
        onCancel={() => setShowModal(false)}
      >
        <p>
          AiDoc is a web-based application designed to assist users in
          extracting information from PDF documents. It provides a user-friendly
          interface for uploading, viewing, and processing PDF files.
        </p>
        <p>
          The application leverages RAG (Retrieval-Augmented Generation)
          technology to quickly and accurately extract relevant information from
          the uploaded.
        </p>
        <p>
          AiDoc is developed by{" "}
          <a href="https://iuiuiu-wayy.github.io/" target="_blank">
            iuiuiu-wayy
          </a>
          .
        </p>
      </Modal>
      <Header
        style={{
          background: colorBgContainer,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 50px",
          margin: "0px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={import.meta.env.VITE_UI_POSTFIX + "/AiDocLogo.png"}
            alt="logo"
            width={60}
            style={{ marginRight: "10px" }}
          />
          <h1 style={{ fontSize: "24px", margin: 0 }}>AiDoc</h1>
        </div>
        <Menu
          onClick={onClick}
          mode="horizontal"
          style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}
          items={[
            {
              key: "About",
              label: <span>About</span>,
            },
            {
              key: "profile",
              label: <span> {loginData ? loginData.email : "Guest"} </span>,
              icon: <UserOutlined />,
              children: [
                {
                  key: "loginout",
                  label: <span>{loginData ? "logout" : "Login"}</span>,
                  onClick: handleLoginout,
                },
              ],
            },
          ]}
        />
      </Header>
      <Layout
        style={{
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",

          // margin: "0px auto",

          // maxWidth: "1600px",
        }}
      >
        <Content
          style={{
            margin: "18px 16px",
            padding: 24,
            // display: "flex",
            // maxWidth: "1000px",
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
