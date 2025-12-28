import getPkce from "oauth-pkce";

export const generatePkce = async (): Promise<{
  verifier: string;
  challenge: string;
  algorithm: string;
}> => {
  return new Promise((resolve, reject) => {
    getPkce(50, (error, { verifier, challenge }) => {
      if (error) reject(error);

      resolve({ verifier, challenge, algorithm: "S256" });
    });
  });
};
