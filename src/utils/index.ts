export const createResponse = (data: any) => {
  return {
    code: 200,
    message: "success",
    data,
  };
};
export const createError = (message: string, code: number = 500) => {
  return {
    code,
    message,
  };
};
