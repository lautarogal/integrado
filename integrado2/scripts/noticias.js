document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("noticias-grid");
    const estado = document.getElementById("noticias-estado");

    if (!grid) return;

    // Informatec4 se ejecuta normalmente en Next.js sobre el puerto 3000.
    // Si más adelante cambiás el puerto o lo publicás, modificá solamente esta URL.
    const INFORMATEC_API = "http://localhost:3000/api/posts";
    const INFORMATEC_WEB = "http://localhost:3000";

    function escapeHTML(valor = "") {
        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        if (Number.isNaN(fecha.getTime())) return fechaISO || "";

        return fecha.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function obtenerCategoria(noticia) {
        return noticia?.categories?.[0]?.category?.name || "Institucional";
    }

    function obtenerImagen(noticia) {
        const imagen = noticia?.coverImage;

        if (!imagen) return "";

        // Si Informatec devuelve una ruta relativa, la resolvemos contra Informatec.
        if (imagen.startsWith("/")) {
            return `${INFORMATEC_WEB}${imagen}`;
        }

        return imagen;
    }

    function crearCardNoticia(noticia) {
        const card = document.createElement("article");
        card.className = "noticia-card";

        const titulo = escapeHTML(noticia.title || "Sin título");
        const resumen = escapeHTML(noticia.description || "");
        const categoria = escapeHTML(obtenerCategoria(noticia));
        const fecha = formatearFecha(noticia.createdAt || noticia.updatedAt);
        const imagen = obtenerImagen(noticia);
        const slug = encodeURIComponent(noticia.slug || "");
        const url = noticia.slug
            ? `${INFORMATEC_WEB}/posts/${slug}`
            : INFORMATEC_WEB;

        const imagenHTML = imagen
            ? `<img src="${escapeHTML(imagen)}" alt="${titulo}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\"noticia-imagen-fallback\"><span class=\"material-icons\">article</span></div>'">`
            : `<div class="noticia-imagen-fallback"><span class="material-icons">article</span></div>`;

        card.innerHTML = `
            <div class="noticia-imagen">
                ${imagenHTML}
            </div>
            <div class="noticia-body">
                <span class="noticia-categoria">${categoria}</span>
                <h3>${titulo}</h3>
                <span class="noticia-fecha">
                    <span class="material-icons" style="font-size:14px;">event</span>
                    ${escapeHTML(fecha)}
                </span>
                <p>${resumen}</p>
                <a class="noticia-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">
                    Leer más
                    <span class="material-icons">arrow_forward</span>
                </a>
            </div>
        `;

        return card;
    }

    function mostrarSkeletons(cantidad = 3) {
        grid.innerHTML = "";

        for (let i = 0; i < cantidad; i++) {
            const skeleton = document.createElement("article");
            skeleton.className = "noticia-card skeleton";
            skeleton.innerHTML = `
                <div class="noticia-imagen"></div>
                <div class="noticia-body">
                    <div class="skeleton-line" style="width:40%;"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            `;
            grid.appendChild(skeleton);
        }
    }

    function renderNoticias(noticias) {
        grid.innerHTML = "";

        if (!Array.isArray(noticias) || noticias.length === 0) {
            const vacio = document.createElement("div");
            vacio.className = "noticias-vacio";
            vacio.textContent = "Todavía no hay noticias publicadas.";
            grid.appendChild(vacio);
            return;
        }

        noticias.forEach((noticia) => {
            grid.appendChild(crearCardNoticia(noticia));
        });
    }

    async function obtenerNoticias() {
        mostrarSkeletons();

        try {
            const response = await fetch(`${INFORMATEC_API}?published=true&limit=6`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(`Informatec respondió con ${response.status}`);
            }

            const data = await response.json();
            renderNoticias(data.posts || []);

            if (estado) estado.hidden = true;
        } catch (error) {
            console.error("No se pudieron cargar las noticias desde Informatec4:", error);
            grid.innerHTML = "";

            if (estado) {
                estado.hidden = false;
            }
        }
    }

    obtenerNoticias();
});
