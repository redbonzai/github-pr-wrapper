type HttpVerb =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT';

export const fetchData = async <T = any>(
  url: string,
  httpVerb: HttpVerb = 'GET',
  httpHeaders: { [key: string]: string } = {
    'Content-Type': 'application/json',
  },
  data: { [key: string]: any } | null = null,
): Promise<T> => {
  const options: RequestInit = {
    method: httpVerb,
    headers: { ...httpHeaders },
    credentials: 'same-origin',
  };

  if (data !== null) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      `HTTP error! Status: ${response.status}, Body: ${JSON.stringify(errorBody)}`,
    );
  }

  return await response.json();
};
