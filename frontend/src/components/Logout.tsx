export const handleLogout = () => {
  window.location.replace(import.meta.env.VITE_API_PATH + "/logout");
};
