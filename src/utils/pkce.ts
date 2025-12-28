export const generatePkce = async (): Promise<{
  verifier: string;
  challenge: string;
  algorithm: string;
}> => {
  // Generate a random code verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64UrlEncode(array);

  // Create SHA-256 challenge
  const buffer = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const challenge = base64UrlEncode(new Uint8Array(digest));

  return {
    verifier,
    challenge,
    algorithm: "S256",
  };
};

// Helper: Base64 URL encoding (RFC 7636)
const base64UrlEncode = (array: Uint8Array) => {
  let str = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.subarray(i, i + chunkSize);
    str += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
