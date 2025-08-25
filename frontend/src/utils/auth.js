export const requireLogin = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to do this!");
    window.location.href = "/login";
    return false;
  }
  return true;
};
