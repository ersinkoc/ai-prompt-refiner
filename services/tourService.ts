export const getTourStatus = (): boolean => {
  try {
    return localStorage.getItem('prompt-refiner-tour-completed') === 'true';
  } catch (error) {
    console.error("Could not get tour status from localStorage.", error);
    // Default to true to avoid showing tour on error
    return true;
  }
};

export const setTourCompleted = (): void => {
  try {
    localStorage.setItem('prompt-refiner-tour-completed', 'true');
  } catch (error) {
    console.error("Could not set tour status in localStorage.", error);
  }
};