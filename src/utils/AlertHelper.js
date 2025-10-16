// utils/AlertHelper.js
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const showAlert = (type, title, message, mode = "light") => {
  const isDark = mode === "dark";

  MySwal.fire({
    title: `<span style="color:${isDark ? "#fff" : "#000"}">${title}</span>`,
    html: `<span style="color:${isDark ? "#ddd" : "#333"}">${message}</span>`,
    icon: type, // success | error | warning | info
    background: isDark ? "#1a202c" : "#fff",
    color: isDark ? "#fff" : "#000",
    confirmButtonColor: isDark ? "#3182ce" : "#2563eb",
    iconColor: isDark ? "#63b3ed" : "#3182ce",
  });
};
