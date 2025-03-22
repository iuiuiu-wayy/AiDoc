import React from "react";
import { Badge, Form, Input, Layout, List, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { TPointsList, useAddAskPdfMutation } from "../../services/api";
import { useDispatch } from "react-redux";
import { setSelectedFile } from "./store";

interface TFormValues {
  query: string;
  limit: number;
  min_token_length: number;
}

const AskInput: React.FC = () => {
  const dispatch = useDispatch();
  const [addAskPdffn, error] = useAddAskPdfMutation();
  const [askResponses, setAskResponses] = React.useState<TPointsList[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(
    null,
  );
  const [err, setErr] = React.useState<string | null>(null);
  const [form] = Form.useForm<{
    query: string;
    limit: number;
    min_token_length: number;
  }>();

  React.useEffect(() => {
    if (error.isError) {
      setErr("Error in fetching data");
    } else {
      setErr(null);
    }
  }, [error.isError]);
  const handleAsk = async (formValue: TFormValues) => {
    const resp = await addAskPdffn({
      query: formValue.query,
      limit: formValue.limit,
      min_token_length: formValue.min_token_length,
    });
    setAskResponses(resp.data || []);
  };
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const onClick = (item: TPointsList) => {
    setSelectedItemId(item.id);
    dispatch(
      setSelectedFile({
        file_id: item.payload.file_id,
        page_number: item.payload.page_number,
      }),
    );
  };
  return (
    <div>
      <Layout style={{ padding: "10px" }}>
        <Form
          form={form}
          layout="horizontal"
          initialValues={{
            limit: 10,
            min_token_length: 30,
          }}
        >
          <Form.Item name="query" style={{ marginBottom: 10 }}>
            <Input
              addonBefore={<SearchOutlined />}
              placeholder="Prompt your question here"
              count={{
                show: true,
                max: 500,
              }}
              onPressEnter={() => {
                form.validateFields().then((values) => {
                  handleAsk({
                    query: values.query,
                    limit: values.limit,
                    min_token_length: values.min_token_length,
                  });
                });
              }}
            />
          </Form.Item>
          <Layout
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "left",
              gap: "10px",
            }}
          >
            <Tooltip title="Limit the number of responses">
              <Form.Item
                name="limit"
                rules={[{ required: true }]}
                style={{ margin: 0 }}
              >
                <Input addonBefore="Limit" type="number" />
              </Form.Item>
            </Tooltip>

            <Tooltip title="Minimum token length">
              <Form.Item
                name="min_token_length"
                rules={[{ required: true }]}
                style={{ margin: 0 }}
              >
                <Input addonBefore="Token" type="number" />
              </Form.Item>
            </Tooltip>
          </Layout>
        </Form>
        {err && <div>{err}</div>}
        <List
          dataSource={askResponses}
          renderItem={(item) => {
            const isSelected = selectedItemId === item.id;
            return (
              <Badge.Ribbon
                text={
                  <Tooltip title="Score">
                    {" "}
                    {(Math.round(item.score * 100) / 100).toString()}
                  </Tooltip>
                }
                color="green"
              >
                <List.Item
                  onClick={() => onClick(item)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e6f7ff" : "white",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <List.Item.Meta
                    title={
                      item.payload.file_name +
                      " - Page " +
                      item.payload.page_number
                    }
                    description={
                      <Tooltip title={item.payload.text}>
                        {truncateText(item.payload.text, 200)}
                      </Tooltip>
                    }
                  />
                </List.Item>
              </Badge.Ribbon>
            );
          }}
        />
      </Layout>
    </div>
  );
};

export default AskInput;
