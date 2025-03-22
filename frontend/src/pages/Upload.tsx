import { InboxOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import type { UploadProps } from "antd";
import { message, Upload } from "antd";
import { useAddFileMutation, useGetProfileQuery } from "../services/api";
import { pdfjs } from "../utils/pdfjsUtils";
const { Dragger } = Upload;

export const UploadPage = () => {
  const { isSuccess, isLoading } = useGetProfileQuery();
  const [addFilefn] = useAddFileMutation();
  if (isLoading) return <>Loading.. </>;
  if (!isSuccess) return;

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    if (file.type !== "application/pdf") {
      return Upload.LIST_IGNORE;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const pdf = await pdfjs.getDocument(uint8Array).promise;
      const numPages = pdf.numPages;

      if (numPages < 1) {
        return Upload.LIST_IGNORE;
      }
      return true;
    } catch (error) {
      console.error(error);
      return Upload.LIST_IGNORE;
    }
  };
  const onChange: UploadProps["onChange"] = (info) => {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    addFilefn({
      file: options.file as File,
    })
      .unwrap()
      .then((res) => {
        options.onSuccess?.(res, options.file);
      })
      .catch((err) => {
        options.onError?.(err);
      });
  };

  return (
    <Flex vertical={true} gap="middle">
      <Dragger
        beforeUpload={beforeUpload}
        onChange={onChange}
        name="file"
        customRequest={handleUpload}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag pdf files to this area to upload
        </p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
      </Dragger>
    </Flex>
  );
};
