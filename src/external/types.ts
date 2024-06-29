type ErrorResponse = {
  ok: false;
  error: string;
};

type SuccessResponse<t> = {
  ok: true;
  data: t;
};

type SnowResponse<T> = ErrorResponse | SuccessResponse<T>;
