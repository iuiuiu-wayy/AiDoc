import { Avatar, Menu } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { FilePdfOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { setSelectedFile } from "../components/ShowFile/store";
import { useGetFileListQuery, useGetProfileQuery } from "../services/api";

const SiderMenus: React.FC = () => {
  const { data, isSuccess, isLoading } = useGetFileListQuery();
  const dispatch = useDispatch();
  const selectedFile = useSelector((state: RootState) => state.selectedFile);
  const { data: loginData } = useGetProfileQuery();
  if (isLoading) return <>Loading.. </>;
  if (!isSuccess || !data) return <>Error.. </>;

  const onClick: MenuProps["onClick"] = (e) => {
    dispatch(setSelectedFile({ file_id: parseInt(e.key.toString()) }));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        marginTop: "10px",
      }}
    >
      {loginData && (
        <Avatar style={{ verticalAlign: "middle" }} size="large">
          {loginData.email[0].toUpperCase()}
        </Avatar>
      )}
      <Menu
        theme="dark"
        mode="inline"
        onClick={onClick}
        defaultOpenKeys={["filesMenu"]}
        defaultSelectedKeys={
          selectedFile.file_id ? [selectedFile.file_id.toString()] : []
        }
        items={[
          {
            key: "filesMenu",
            icon: <FilePdfOutlined />,
            label: "Files",
            children: data.map((file) => ({
              key: file.file_id.toString(),
              label: file.file_name,
            })),
          },
        ]}
      />
    </div>
  );
};

export default SiderMenus;
