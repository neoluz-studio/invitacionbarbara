(() => {
    "use strict";

    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const config = window.INVITATION_CONFIG;

    if (!config) {
        console.error(
            "No se encontró INVITATION_CONFIG. Revisá que config.js cargue antes que app.js."
        );
        return;
    }


    /* =====================================================
       UTILIDADES
    ===================================================== */

    const $ = (selector, context = document) =>
        context.querySelector(selector);

    const $$ = (selector, context = document) =>
        [...context.querySelectorAll(selector)];

    const setText = (selector, value = "") => {
        const element = $(selector);

        if (element) {
            element.textContent = value ?? "";
        }
    };

    const imagePath = (filename) => {
        if (!filename) {
            return "";
        }

        return `assets/images/${filename}`;
    };

    const sanitizePhone = (phone) =>
        String(phone || "").replace(/\D/g, "");

    const formatDateTime = (date = new Date()) =>
        new Intl.DateTimeFormat("es-AR", {
            dateStyle: "short",
            timeStyle: "medium"
        }).format(date);

    const setElementsDisabled = (container, disabled) => {
        if (!container) {
            return;
        }

        $$("input, select, textarea, button", container).forEach((element) => {
            element.disabled = disabled;
        });
    };


    /* =====================================================
       ELEMENTOS PRINCIPALES
    ===================================================== */

    const welcome = $("#welcome");
    const enterButton = $("#enterBtn");
    const invitation = $("#invitation");

    const music = $("#music");
    const musicButton = $("#musicBtn");

    const giftDialog = $("#giftDialog");
    const giftOpenButton = $("#giftOpen");
    const giftCloseButton = $("#giftClose");
    const copyAliasButton = $("#copyAlias");

    const rsvpForm = $("#rsvpForm");
    const rsvpStatus = $("#rsvpStatus");
    const rsvpSubmitButton = $("#rsvpSubmit");

    const attendanceFields = $("#attendanceFields");
    const attendanceInputs = $$('input[name="asistencia"]');

   const guestCount = $("#guestCount");
const additionalGuestsContainer = $("#additionalGuestsContainer");
const mainGuestCard = $("#mainGuestCard");

    /* =====================================================
       CARGA DE TEXTOS
    ===================================================== */

    setText("#welcomeTitle", config.welcome?.title);
    setText("#welcomeSubtitle", config.welcome?.subtitle);
    setText("#enterBtn", config.welcome?.button || "INGRESAR");

    setText("#heroEyebrow", config.event?.eyebrow);
    setText("#heroName", config.event?.name);

    setText("#firstPhrase", config.texts?.firstPhrase);
    setText("#middlePhrase", config.texts?.middlePhrase);
    setText("#closingText", config.texts?.closing);

    setText("#dateLabel", config.venue?.dateLabel);
    setText("#timeLabel", config.venue?.timeLabel);
    setText("#venueName", config.venue?.name);

    setText("#dressCode", config.dressCode);

    setText("#giftIntro", config.gifts?.intro);
    setText("#giftAlias", config.gifts?.alias);
    setText("#giftHolder", config.gifts?.holder);

    setText("#hashtag", config.social?.hashtag);
    setText("#deadline", config.event?.deadline);


    /* =====================================================
       TÍTULO Y DESCRIPCIÓN
    ===================================================== */

    if (config.event?.name) {
        document.title = `Mis XV ${config.event.name}`;

        const description = $('meta[name="description"]');

        if (description) {
            description.content =
                `Invitación digital para los XV de ${config.event.name}.`;
        }
    }


    /* =====================================================
       COLORES CONFIGURABLES
    ===================================================== */

    if (config.colors) {
        const root = document.documentElement;

        if (config.colors.primary) {
            root.style.setProperty("--accent", config.colors.primary);
        }

        if (config.colors.dark) {
            root.style.setProperty("--black", config.colors.dark);
        }

        if (config.colors.light) {
            root.style.setProperty("--paper", config.colors.light);
        }
    }


    /* =====================================================
       CARGA DE IMÁGENES
    ===================================================== */

    const heroImage = $("#heroImage");
    const closingImage = $("#closingImage");

    if (heroImage && config.images?.hero) {
        heroImage.src = imagePath(config.images.hero);
        heroImage.alt =
            `Fotografía de portada de ${config.event?.name || "la quinceañera"}`;
    }

    if (closingImage && config.images?.closing) {
        closingImage.src = imagePath(config.images.closing);
        closingImage.alt =
            `Fotografía final de ${config.event?.name || "la quinceañera"}`;
    }


    /* =====================================================
       ENLACES
    ===================================================== */

    const mapsLink = $("#mapsLink");

    if (mapsLink) {
        mapsLink.href = config.venue?.mapsUrl || "#";

        if (!config.venue?.mapsUrl || config.venue.mapsUrl === "#") {
            mapsLink.setAttribute("aria-disabled", "true");
        }
    }

    const hashtagLink = $("#hashtag");

    if (hashtagLink) {
        hashtagLink.href = config.social?.instagramUrl || "#";

        if (
            !config.social?.instagramUrl ||
            config.social.instagramUrl === "#"
        ) {
            hashtagLink.setAttribute("aria-disabled", "true");
        }
    }

    const oldRsvpLink = $("#rsvpLink");

    if (oldRsvpLink) {
        const phone = sanitizePhone(config.rsvp?.phone);
        const message = config.rsvp?.message || "";

        if (phone) {
            oldRsvpLink.href =
                `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        } else {
            oldRsvpLink.href = "#";
            oldRsvpLink.setAttribute("aria-disabled", "true");
        }
    }


    /* =====================================================
       MÚSICA
    ===================================================== */

    if (music) {
        music.src = config.music?.src || "";

        music.volume = Math.min(
            1,
            Math.max(
                0,
                Number(config.music?.volume ?? 0.55)
            )
        );
    }

    const updateMusicButton = () => {
        if (!musicButton || !music) {
            return;
        }

        const isPlaying = !music.paused;

        musicButton.classList.toggle("is-playing", isPlaying);
        musicButton.setAttribute("aria-pressed", String(isPlaying));
        musicButton.setAttribute(
            "aria-label",
            isPlaying ? "Pausar música" : "Reproducir música"
        );

        const icon = $("span", musicButton);

        if (icon) {
            icon.textContent = isPlaying ? "❚❚" : "♪";
        }
    };

    const playMusic = async () => {
        if (!music || !config.music?.src) {
            return;
        }

        try {
            await music.play();
        } catch (error) {
            console.info(
                "El navegador no permitió reproducir la música.",
                error
            );
        }

        updateMusicButton();
    };

    const pauseMusic = () => {
        if (!music) {
            return;
        }

        music.pause();
        updateMusicButton();
    };

    if (musicButton && music) {
        musicButton.addEventListener("click", async () => {
            if (music.paused) {
                await playMusic();
            } else {
                pauseMusic();
            }
        });

        music.addEventListener("play", updateMusicButton);
        music.addEventListener("pause", updateMusicButton);
        music.addEventListener("ended", updateMusicButton);
    }


    /* =====================================================
       INGRESO A LA INVITACIÓN
    ===================================================== */

    const enterInvitation = async () => {
        if (welcome) {
            welcome.classList.add("is-hidden");
            welcome.setAttribute("aria-hidden", "true");
        }

        document.body.classList.remove("no-scroll");

        if (invitation) {
            invitation.setAttribute("aria-hidden", "false");
        }

        if (musicButton) {
            musicButton.hidden = false;
        }

        await playMusic();

        window.setTimeout(() => {
            welcome?.remove();
        }, 1100);
    };

    if (enterButton) {
        enterButton.addEventListener("click", enterInvitation);
    }


    /* =====================================================
       CUENTA REGRESIVA
    ===================================================== */

    let countdownInterval = null;

    const renderCountdownFinished = () => {
        const countdownElement = $("#countdown");

        if (!countdownElement) {
            return;
        }

        countdownElement.innerHTML = `
            <p class="countdown__finished">
                ¡Llegó el gran día!
            </p>
        `;
    };

    const updateCountdown = () => {
        const eventDate = new Date(config.event?.date);
        const distance = eventDate.getTime() - Date.now();

        if (
            Number.isNaN(eventDate.getTime()) ||
            distance <= 0
        ) {
            renderCountdownFinished();

            if (countdownInterval) {
                window.clearInterval(countdownInterval);
            }

            return;
        }

        const days = Math.floor(distance / 86_400_000);
        const hours = Math.floor(
            (distance % 86_400_000) / 3_600_000
        );
        const minutes = Math.floor(
            (distance % 3_600_000) / 60_000
        );
        const seconds = Math.floor(
            (distance % 60_000) / 1_000
        );

        setText("#days", String(days).padStart(2, "0"));
        setText("#hours", String(hours).padStart(2, "0"));
        setText("#minutes", String(minutes).padStart(2, "0"));
        setText("#seconds", String(seconds).padStart(2, "0"));
    };

    updateCountdown();

    countdownInterval = window.setInterval(
        updateCountdown,
        1000
    );


    /* =====================================================
       GALERÍAS
    ===================================================== */

    const createGallery = (
        filenames,
        targetSelector,
        startIndex = 0
    ) => {
        const gallery = $(targetSelector);

        if (!gallery || !Array.isArray(filenames)) {
            return;
        }

        gallery.innerHTML = "";

        filenames.forEach((filename, index) => {
            if (!filename) {
                return;
            }

            const figure = document.createElement("figure");
            figure.className = "reveal";

            const image = document.createElement("img");

            image.src = imagePath(filename);
            image.alt =
                `Fotografía ${startIndex + index + 1} de ${
                    config.event?.name || "la quinceañera"
                }`;

            image.loading = "lazy";
            image.decoding = "async";

            figure.appendChild(image);
            gallery.appendChild(figure);
        });
    };

    const galleryImages =
        Array.isArray(config.images?.gallery)
            ? config.images.gallery
            : [];

    createGallery(
        galleryImages.slice(0, 5),
        "#galleryOne",
        0
    );

    createGallery(
        galleryImages.slice(5),
        "#galleryTwo",
        5
    );


    /* =====================================================
       ANIMACIONES AL HACER SCROLL
    ===================================================== */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
        $$(".reveal").forEach((element) => {
            element.classList.add("is-visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        $$(".reveal").forEach((element) => {
            revealObserver.observe(element);
        });
    }


    /* =====================================================
       MODAL DE REGALOS
    ===================================================== */

    const closeGiftDialog = () => {
        if (!giftDialog) {
            return;
        }

        if (
            typeof giftDialog.close === "function" &&
            giftDialog.open
        ) {
            giftDialog.close();
        } else {
            giftDialog.removeAttribute("open");
        }
    };

    if (
        giftDialog &&
        giftOpenButton &&
        giftCloseButton
    ) {
        giftOpenButton.addEventListener("click", () => {
            if (typeof giftDialog.showModal === "function") {
                giftDialog.showModal();
            } else {
                giftDialog.setAttribute("open", "");
            }
        });

        giftCloseButton.addEventListener(
            "click",
            closeGiftDialog
        );

        giftDialog.addEventListener("click", (event) => {
            const rect = giftDialog.getBoundingClientRect();

            const clickedOutside =
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom;

            if (clickedOutside) {
                closeGiftDialog();
            }
        });

        giftDialog.addEventListener("close", () => {
            setText("#copyStatus", "");
        });
    }


    /* =====================================================
       COPIAR ALIAS
    ===================================================== */

    const copyAliasFallback = (text) => {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(
            0,
            textarea.value.length
        );

        const successful = document.execCommand("copy");

        textarea.remove();

        return successful;
    };

    if (copyAliasButton) {
        copyAliasButton.addEventListener("click", async () => {
            const alias = config.gifts?.alias || "";

            if (!alias) {
                setText(
                    "#copyStatus",
                    "No hay un alias configurado."
                );
                return;
            }

            try {
                if (
                    navigator.clipboard &&
                    window.isSecureContext
                ) {
                    await navigator.clipboard.writeText(alias);
                } else {
                    const copied = copyAliasFallback(alias);

                    if (!copied) {
                        throw new Error(
                            "No se pudo copiar."
                        );
                    }
                }

                setText(
                    "#copyStatus",
                    "Alias copiado correctamente"
                );
            } catch (error) {
                console.error(error);

                setText(
                    "#copyStatus",
                    "Copiá el alias manualmente"
                );
            }
        });
    }


    /* =====================================================
       PERSONAS DINÁMICAS
    ===================================================== */

    const createAdditionalGuestCard = (personNumber) => {
        const card = document.createElement("div");

        card.className = "guest-card is-entering";
        card.dataset.person = String(personNumber);

        card.innerHTML = `
            <p class="guest-card__title">
                Persona ${personNumber}
            </p>

            <div class="guest-card__grid">

                <div class="form-field">
                    <label for="guestName_${personNumber}">
                        Nombre y apellido
                    </label>

                    <input
                        id="guestName_${personNumber}"
                        name="nombrePersona${personNumber}"
                        type="text"
                        maxlength="80"
                        autocomplete="off"
                        required
                    >
                </div>

                <div class="form-field">
                    <label for="guestMenu_${personNumber}">
                        Opción de menú
                    </label>

                    <select
                        id="guestMenu_${personNumber}"
                        name="menuPersona${personNumber}"
                        required
                    >
                        <option value="Menú tradicional">
                            Menú tradicional
                        </option>

                        <option value="Menú vegetariano">
                            Menú vegetariano
                        </option>

                        <option value="Menú vegano">
                            Menú vegano
                        </option>

                        <option value="Menú infantil">
                            Menú infantil
                        </option>
                    </select>
                </div>

                <div class="form-field form-field--full">
                    <label for="guestRestriction_${personNumber}">
                        Restricción alimentaria
                    </label>

                    <textarea
                        id="guestRestriction_${personNumber}"
                        name="restriccionPersona${personNumber}"
                        rows="2"
                        maxlength="300"
                        placeholder="Opcional"
                    ></textarea>
                </div>

            </div>
        `;

        return card;
    };

   const renderGuests = () => {
    if (
        !guestCount ||
        !additionalGuestsContainer
    ) {
        return;
    }

    const totalPeople =
        Number(guestCount.value);

    additionalGuestsContainer.innerHTML = "";

    if (!totalPeople) {
        if (mainGuestCard) {
            mainGuestCard.hidden = true;

            setElementsDisabled(
                mainGuestCard,
                true
            );
        }

        return;
    }

    if (mainGuestCard) {
        mainGuestCard.hidden = false;

        setElementsDisabled(
            mainGuestCard,
            false
        );
    }

    for (
        let personNumber = 2;
        personNumber <= totalPeople;
        personNumber += 1
    ) {
        additionalGuestsContainer.appendChild(
            createAdditionalGuestCard(
                personNumber
            )
        );
    }
};

if (guestCount) {
    guestCount.addEventListener(
        "change",
        renderGuests
    );
}
    
    /* =====================================================
       MOSTRAR U OCULTAR CAMPOS DE ASISTENCIA
    ===================================================== */

    const updateAttendanceFields = () => {
    const selected = $(
        'input[name="asistencia"]:checked'
    );

    const attends =
        selected?.value === "Sí";

    if (attendanceFields) {
        attendanceFields.hidden = !attends;

        attendanceFields.classList.toggle(
            "is-hidden",
            !attends
        );
    }

    if (guestCount) {
        guestCount.disabled = !attends;
        guestCount.required = attends;

        if (!attends) {
            guestCount.value = "";
        }
    }

    if (mainGuestCard) {
        mainGuestCard.hidden = true;

        setElementsDisabled(
            mainGuestCard,
            true
        );
    }

    if (additionalGuestsContainer) {
        additionalGuestsContainer.innerHTML = "";
        additionalGuestsContainer.hidden = !attends;
    }

    if (attends) {
        renderGuests();
    }
};
attendanceInputs.forEach((input) => {
    input.addEventListener(
        "change",
        updateAttendanceFields
    );
});

if (guestCount) {
    guestCount.value = "";
}

updateAttendanceFields();

    /* =====================================================
       CAMPOS INTERNOS DEL FORMULARIO
    ===================================================== */

    const eventNameField = $("#eventNameField");
    const eventDateField = $("#eventDateField");
    const submittedAtField = $("#submittedAtField");

    const fillHiddenFields = () => {
        if (eventNameField) {
            eventNameField.value =
                config.event?.name || "";
        }

        if (eventDateField) {
            eventDateField.value =
                config.event?.date || "";
        }

        if (submittedAtField) {
            submittedAtField.value =
                formatDateTime();
        }
    };

    fillHiddenFields();


    /* =====================================================
       ESTADO DEL FORMULARIO
    ===================================================== */

    const setRsvpStatus = (
        message,
        type = ""
    ) => {
        if (!rsvpStatus) {
            return;
        }

        rsvpStatus.textContent = message;

        rsvpStatus.classList.remove(
            "is-success",
            "is-error"
        );

        if (type) {
            rsvpStatus.classList.add(`is-${type}`);
        }
    };

    const setRsvpLoading = (loading) => {
        if (!rsvpForm) {
            return;
        }

        rsvpForm.classList.toggle(
            "is-loading",
            loading
        );

        if (rsvpSubmitButton) {
            rsvpSubmitButton.disabled = loading;
        }
    };


    /* =====================================================
       CREAR LISTA ORDENADA DE PERSONAS
    ===================================================== */

    const collectGuests = () => {
        const totalPeople = Number(
    guestCount?.value || 0
);
if (!totalPeople) {
    return [];
}
        const mainName =
            $("#guestName")?.value.trim() || "";

        const mainMenu =
            $("#mainGuestMenu")?.value || "";

        const mainRestriction =
            $("#mainGuestRestriction")?.value.trim() || "";

        const guests = [
            {
                numero: 1,
                nombre: mainName,
                menu: mainMenu,
                restriccion: mainRestriction
            }
        ];

        for (
            let personNumber = 2;
            personNumber <= totalPeople;
            personNumber += 1
        ) {
            guests.push({
                numero: personNumber,

                nombre:
                    $(`#guestName_${personNumber}`)
                        ?.value.trim() || "",

                menu:
                    $(`#guestMenu_${personNumber}`)
                        ?.value || "",

                restriccion:
                    $(`#guestRestriction_${personNumber}`)
                        ?.value.trim() || ""
            });
        }

        return guests;
    };


    /* =====================================================
       ENVÍO A GOOGLE SHEETS
    ===================================================== */

    if (rsvpForm) {
        rsvpForm.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                setRsvpStatus("");

                const honeypot = $("#website");

                if (honeypot?.value) {
                    return;
                }

                if (!rsvpForm.checkValidity()) {
                    rsvpForm.reportValidity();

                    setRsvpStatus(
                        "Revisá los campos obligatorios.",
                        "error"
                    );

                    return;
                }

                const endpoint = config.rsvp?.endpoint;

                if (
                    !endpoint ||
                    endpoint.includes("PEGAR_ACA")
                ) {
                    setRsvpStatus(
                        "Todavía no está configurada la conexión con Google Sheets.",
                        "error"
                    );

                    return;
                }

                const selectedAttendance = $(
                    'input[name="asistencia"]:checked'
                )?.value || "";

                fillHiddenFields();

                const formData = new FormData(rsvpForm);

                const payload = {
                    evento:
                        config.event?.name || "",

                    fechaEvento:
                        config.event?.date || "",

                    fechaConfirmacion:
                        formatDateTime(),

                    nombre:
                        formData.get("nombre") || "",

                    telefono:
                        formData.get("telefono") || "",

                    asistencia:
                        selectedAttendance,

                    cantidadPersonas:
                        selectedAttendance === "Sí"
                            ? Number(
                                guestCount?.value || 0
                            )
                            : 0,

                    musica:
                        formData.get("musica") ||
                        formData.get("mensaje") ||
                        "",

                    personas:
                        selectedAttendance === "Sí"
                            ? collectGuests()
                            : []
                };

                setRsvpLoading(true);

                setRsvpStatus(
                    "Enviando confirmación..."
                );

                try {
                    await fetch(endpoint, {
                        method: "POST",
                        mode: "no-cors",
                        body: JSON.stringify(payload)
                    });

                    setRsvpStatus(
                        "¡Confirmación enviada correctamente!",
                        "success"
                    );

                    rsvpForm.reset();

                    if (guestCount) {
                        guestCount.value = "";
                    }

                    if (mainGuestCard) {
                        mainGuestCard.hidden = true;

                        setElementsDisabled(
                            mainGuestCard,
                            true
                        );
                    }

                    if (additionalGuestsContainer) {
                        additionalGuestsContainer.innerHTML = "";
                    }
                    updateAttendanceFields();
                    fillHiddenFields();
                } catch (error) {
                    console.error(
                        "Error enviando RSVP:",
                        error
                    );

                    setRsvpStatus(
                        "No pudimos enviar la confirmación. Probá nuevamente.",
                        "error"
                    );
                } finally {
                    setRsvpLoading(false);
                }
            }
        );
    }


    /* =====================================================
       ENLACES DESHABILITADOS
    ===================================================== */

    $$('[aria-disabled="true"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });

})();