export async function isOnline(): Promise<boolean> {
  const res = await fetch('https://api.spacetraders.io/game/status');
  const json = await res.json();
  return json.status === 'spacetraders is currently online and available to play';
}

export async function status(): Promise<string> {
  const res = await fetch('https://api.spacetraders.io/game/status');
  const {status}: {status: string} = await res.json();
  return status;
}
