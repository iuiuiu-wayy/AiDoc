export const handleLogin = () => {
  window.location.replace(
    import.meta.env.VITE_API_PATH +
      "/login?redirect_to=" +
      encodeURI("/" + import.meta.env.VITE_UI_POSTFIX),
  );
};
