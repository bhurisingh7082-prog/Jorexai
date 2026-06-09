export type MessageNode = {
  id: string;
  role: "user" | "ai";
  content: string;
  type: "text" | "image" | "video" | "file";
  status?: "loading" | "done" | "error";
  intentMatched?: string;
  fileMetadata?: {
    name: string;
    size?: string;
  };
  attachments?: {
    name: string;
    type: string;
  }[];
};
