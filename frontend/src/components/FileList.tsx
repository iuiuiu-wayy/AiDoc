import { List } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { DeleteOutlined } from "@ant-design/icons";
import "./FileList.css";
import { setSelectedFile } from "../components/ShowFile/store";
import { useDeleteFileMutation, useGetFileListQuery } from "../services/api";

const FileList: React.FC = () => {
  const { data, isSuccess, isLoading } = useGetFileListQuery();
  const dispatch = useDispatch();
  const [deleteFile] = useDeleteFileMutation();
  const selectedFile = useSelector((state: RootState) => state.selectedFile);
  if (isLoading) return <>Loading.. </>;
  if (!isSuccess || !data) return <>Error.. </>;

  if (selectedFile.file_id == null && data.length > 0) {
    dispatch(setSelectedFile({ file_id: data[0].file_id, move_focus: false }));
  }
  return (
    <div style={{ width: "100%" }}>
      <h3> Files</h3>
      <div
        className="file-list-item"
        style={{
          width: "100%",
          maxHeight: "400px",
          overflowY: "auto",
          padding: "0 10px 10px 10px",
        }}
      >
        <List
          dataSource={data}
          renderItem={(file) => (
            <List.Item
              actions={[
                <DeleteOutlined
                  onClick={() => {
                    deleteFile(file.file_id);
                  }}
                />,
              ]}
              key={file.file_id}
              style={{
                width: "100%",
                padding: "0px",
                margin: "0px",
                backgroundColor:
                  file.file_id == selectedFile.file_id ? "#e6f7ff" : "white",
              }}
            >
              <div
                style={{
                  width: "100%",
                  cursor: "pointer",
                  padding: "0px 10px 10px 10px",
                }}
                onClick={() =>
                  dispatch(
                    setSelectedFile({
                      file_id: file.file_id,
                      move_focus: true,
                    }),
                  )
                }
              >
                <span>{file.file_name}</span>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default FileList;
