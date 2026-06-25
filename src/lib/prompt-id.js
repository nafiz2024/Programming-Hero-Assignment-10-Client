export function getPromptId(prompt, paramsId = "") {
  return String(prompt?._id || prompt?.id || paramsId || "").trim();
}
