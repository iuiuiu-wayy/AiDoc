import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface TProfile {
  user_id: string;
  email: string;
}

interface TFilelist {
  file_name: string;
  user_id: string;
  file_id: number;
}

interface TUploadFile {
  file_id: number;
}

interface TPointPayload {
  file_id: number;
  page_number: number;
  chunk_word_count: number;
  chunk_token_count: number;
  text: string;
  file_name: string;
}

export interface TPointsList {
  id: number;
  score: number;
  payload: TPointPayload;
}

interface TAskPdfReq {
  query: string;
  limit: number;
  min_token_length: number;
}
const baseQuery = fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_PATH });

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    console.log("Unauthorized access - 401");
  }
  return result;
};

export const base = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["TFilelist"],
  endpoints: (builder) => ({
    getFileList: builder.query<TFilelist[], void>({
      query: () => "pdf/list",
      providesTags: ["TFilelist"],
    }),
    addFile: builder.mutation<TUploadFile, { file: File | Blob }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "pdf",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["TFilelist"],
    }),
    getFilePdf: builder.query<Blob, number>({
      query: (file_id) => ({
        url: `pdf/${file_id}/blob`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    addAskPdf: builder.mutation<TPointsList[], TAskPdfReq>({
      query: (req) => ({
        url: `pdf/ask`,
        method: "POST",
        body: req,
      }),
    }),
    getProfile: builder.query<TProfile, void>({
      query: () => "profile",
    }),
    logout: builder.query({
      query: () => "logout",
    }),
  }),
});

export const {
  useGetProfileQuery,
  useAddFileMutation,
  useAddAskPdfMutation,
  useLogoutQuery,
  useGetFileListQuery,
  useGetFilePdfQuery,
} = base;
