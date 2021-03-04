const API = 'https://api.spacetraders.io';

export async function get(path: string) : Promise<Response> {
  return fetch(`${API}/${path}`);
}

export async function post(path: string, body?: Object, token?: string): Promise<Response> {
  let headers : Record<string, string> = {};
  if (body) {
    headers['Content-Type'] =  'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${API}/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}
