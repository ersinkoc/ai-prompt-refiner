export const saveApiKey = (key: string): void => {
  try {
    localStorage.setItem('gemini-api-key', key);
  } catch (error) {
    console.error("Could not save API key to localStorage.", error);
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem('gemini-api-key');
  } catch (error) {
    console.error("Could not retrieve API key from localStorage.", error);
    return null;
  }
};

export const removeApiKey = (): void => {
  try {
    localStorage.removeItem('gemini-api-key');
  } catch (error) {
    console.error("Could not remove API key from localStorage.", error);
  }
}
