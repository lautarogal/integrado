document.addEventListener("navbarCargado", () => {
    const item = document.querySelector(".has-dropdown");
    if (!item) return;

    const toggle = item.querySelector(".dropdown-toggle");
    const menu = item.querySelector(".dropdown-menu");
    const menuBtn = document.querySelector(".menu-btn");
    

    // Estado inicial siempre cerrado, forzado por JS (no depende de CSS/hover/clases heredadas)
    item.classList.remove("dropdown-open");
    if (menu) menu.style.maxHeight = "";
    toggle.setAttribute("aria-expanded", "false");

    function abrirDropdown() {
        item.classList.add("dropdown-open");
        if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
        toggle.setAttribute("aria-expanded", "true");
    }

    function cerrarDropdown() {
        item.classList.remove("dropdown-open");
        if (menu) menu.style.maxHeight = "";
        toggle.setAttribute("aria-expanded", "false");
    }

    function toggleDropdown() {
        if (item.classList.contains("dropdown-open")) {
            cerrarDropdown();
        } else {
            abrirDropdown();
        }
    }

    toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });

    // Soporte de teclado: el toggle ya no es un <a href>, así que Enter/Espacio
    // deben activarlo manualmente para mantener la accesibilidad.
    toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown();
        }
    });

    // Cada vez que se toca el botón hamburguesa principal, el desplegable
    // "Internas" arranca siempre cerrado.
    if (menuBtn) {
        menuBtn.addEventListener("click", cerrarDropdown);
    }

    document.addEventListener("click", (e) => {
        if (item.classList.contains("dropdown-open") && !item.contains(e.target)) {
            cerrarDropdown();
        }
    });
});