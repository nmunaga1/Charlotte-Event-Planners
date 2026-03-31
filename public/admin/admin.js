const state = {
  content: null,
  originalContent: null,
  savedAt: "",
  configured: false,
  setupAllowed: false,
  authenticated: false,
  authChecked: false,
  mfaEnabled: false,
  username: "",
  isLoading: false,
  isSaving: false,
};

const schema = {
  seo: {
    label: "SEO & Social Sharing",
    description: "These fields drive the page title, meta description, sitemap, and social preview tags.",
    type: "group",
    fields: {
      siteUrl: { label: "Website URL", type: "url" },
      title: { label: "Page title", type: "text" },
      description: { label: "Meta description", type: "textarea" },
      keywords: { label: "Keywords", type: "textarea" },
      ogImage: { label: "Share image URL", type: "url" },
    },
  },
  brand: {
    label: "Brand",
    description: "Edit brand text used in the header and footer.",
    type: "group",
    fields: {
      mark: { label: "Brand mark", type: "text" },
      name: { label: "Brand name", type: "text" },
      footerDescription: { label: "Footer description", type: "textarea" },
    },
  },
  hero: {
    label: "Hero Section",
    description: "Main headline, calls-to-action, and hero background image.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Headline", type: "textarea" },
      text: { label: "Supporting copy", type: "textarea" },
      primaryCtaLabel: { label: "Primary CTA label", type: "text" },
      secondaryCtaLabel: { label: "Secondary CTA label", type: "text" },
      bookingLabel: { label: "Booking label", type: "text" },
      cardTitle: { label: "Hero card title", type: "textarea" },
      backgroundImage: { label: "Hero background image URL", type: "url" },
      cardList: {
        label: "Hero checklist",
        type: "list",
        item: { label: "Checklist item", type: "text" },
      },
      highlights: {
        label: "Hero highlight chips",
        type: "list",
        item: { label: "Highlight", type: "text" },
      },
    },
  },
  proof: {
    label: "Proof Strip",
    description: "Social proof headline and animated stats.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      stats: {
        label: "Stats",
        type: "list",
        item: {
          label: "Stat",
          type: "group",
          fields: {
            value: { label: "Value", type: "text" },
            suffix: { label: "Suffix", type: "text" },
            label: { label: "Label", type: "text" },
          },
        },
      },
    },
  },
  services: {
    label: "Services",
    description: "Service cards shown on the homepage.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      ctaLabel: { label: "CTA label", type: "text" },
      items: {
        label: "Service cards",
        type: "list",
        item: {
          label: "Service",
          type: "group",
          fields: {
            title: { label: "Title", type: "text" },
            description: { label: "Description", type: "textarea" },
            image: { label: "Image URL", type: "url" },
            alt: { label: "Image alt text", type: "text" },
          },
        },
      },
    },
  },
  portfolio: {
    label: "Portfolio",
    description: "Gallery cards. Layout options can be featured, tall, wide, or standard.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      ctaLabel: { label: "CTA label", type: "text" },
      items: {
        label: "Portfolio cards",
        type: "list",
        item: {
          label: "Portfolio item",
          type: "group",
          fields: {
            label: { label: "Overline", type: "text" },
            title: { label: "Title", type: "textarea" },
            image: { label: "Image URL", type: "url" },
            alt: { label: "Image alt text", type: "text" },
            layout: {
              label: "Layout",
              type: "text",
              help: "Use featured, tall, wide, or standard.",
            },
          },
        },
      },
    },
  },
  about: {
    label: "About",
    description: "Founder story, photo, and supporting value points.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      image: { label: "Image URL", type: "url" },
      alt: { label: "Image alt text", type: "text" },
      badgeEyebrow: { label: "Badge eyebrow", type: "text" },
      badgeTitle: { label: "Badge title", type: "text" },
      paragraphs: {
        label: "About paragraphs",
        type: "list",
        item: { label: "Paragraph", type: "textarea" },
      },
      points: {
        label: "Value points",
        type: "list",
        item: {
          label: "Point",
          type: "group",
          fields: {
            title: { label: "Title", type: "text" },
            description: { label: "Description", type: "textarea" },
          },
        },
      },
      ctaLabel: { label: "CTA label", type: "text" },
    },
  },
  benefits: {
    label: "Why Choose Us",
    description: "Benefit cards highlighting the planning experience.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      items: {
        label: "Benefit cards",
        type: "list",
        item: {
          label: "Benefit",
          type: "group",
          fields: {
            number: { label: "Number", type: "text" },
            title: { label: "Title", type: "text" },
            description: { label: "Description", type: "textarea" },
          },
        },
      },
    },
  },
  testimonials: {
    label: "Testimonials",
    description: "Client quotes shown in the testimonial grid.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      ctaLabel: { label: "CTA label", type: "text" },
      items: {
        label: "Testimonials",
        type: "list",
        item: {
          label: "Testimonial",
          type: "group",
          fields: {
            quote: { label: "Quote", type: "textarea" },
            name: { label: "Client name", type: "text" },
            subtitle: { label: "Subtitle", type: "text" },
          },
        },
      },
    },
  },
  process: {
    label: "Process",
    description: "Three-step process cards.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      items: {
        label: "Process steps",
        type: "list",
        item: {
          label: "Step",
          type: "group",
          fields: {
            number: { label: "Number", type: "text" },
            title: { label: "Title", type: "text" },
            description: { label: "Description", type: "textarea" },
          },
        },
      },
    },
  },
  ctaBanner: {
    label: "Closing Banner",
    description: "Large call-to-action banner near the bottom of the page.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      text: { label: "Supporting copy", type: "textarea" },
      ctaLabel: { label: "CTA label", type: "text" },
      backgroundImage: { label: "Background image URL", type: "url" },
    },
  },
  contact: {
    label: "Contact & Form",
    description: "Contact card details and the inquiry form labels.",
    type: "group",
    fields: {
      eyebrow: { label: "Eyebrow", type: "text" },
      title: { label: "Heading", type: "textarea" },
      text: { label: "Supporting copy", type: "textarea" },
      phone: { label: "Phone link value", type: "tel" },
      phoneLabel: { label: "Phone label", type: "text" },
      email: { label: "Email address", type: "email" },
      emailLabel: { label: "Email label", type: "text" },
      location: { label: "Location label", type: "text" },
      mapQuery: { label: "Map query", type: "text" },
      eventOptions: {
        label: "Event type options",
        type: "list",
        item: { label: "Event option", type: "text" },
      },
      form: {
        label: "Form labels",
        type: "group",
        fields: {
          nameLabel: { label: "Name label", type: "text" },
          namePlaceholder: { label: "Name placeholder", type: "text" },
          emailLabel: { label: "Email label", type: "text" },
          emailPlaceholder: { label: "Email placeholder", type: "text" },
          eventTypeLabel: { label: "Event type label", type: "text" },
          eventTypePlaceholder: { label: "Event type placeholder", type: "text" },
          messageLabel: { label: "Message label", type: "text" },
          messagePlaceholder: { label: "Message placeholder", type: "textarea" },
          submitLabel: { label: "Submit button label", type: "text" },
          successMessage: { label: "Success message", type: "textarea" },
        },
      },
    },
  },
  social: {
    label: "Social Links",
    description: "Footer social profiles.",
    type: "group",
    fields: {
      instagram: { label: "Instagram URL", type: "url" },
      facebook: { label: "Facebook URL", type: "url" },
    },
  },
};

const alertElement = document.getElementById("cms-alert");
const cmsForm = document.getElementById("cms-form");
const authForm = document.getElementById("cms-auth-form");
const usernameInput = document.getElementById("cms-username");
const passwordInput = document.getElementById("cms-password");
const passwordConfirmInput = document.getElementById("cms-password-confirm");
const totpInput = document.getElementById("cms-totp");
const passwordConfirmWrap = document.getElementById("setup-password-confirm-wrap");
const setupMfaWrap = document.getElementById("setup-mfa-wrap");
const enableMfaInput = document.getElementById("cms-enable-mfa");
const totpFieldWrap = document.getElementById("totp-field-wrap");
const reloadButton = document.getElementById("reload-content");
const resetButton = document.getElementById("reset-changes");
const saveButton = document.getElementById("save-content");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const saveStatus = document.getElementById("save-status");
const saveDetails = document.getElementById("save-details");
const saveMeta = document.getElementById("save-meta");
const securityStatus = document.getElementById("security-status");
const authState = document.getElementById("auth-state");
const authHelp = document.getElementById("auth-help");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const pathToString = (pathParts) => pathParts.join(".");

const parsePath = (pathString) =>
  String(pathString)
    .split(".")
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));

const getByPath = (target, pathParts) =>
  pathParts.reduce((currentValue, key) => currentValue?.[key], target);

const getSchemaByPath = (pathParts) => {
  let currentSchema = schema[pathParts[0]];

  for (let index = 1; index < pathParts.length; index += 1) {
    const pathPart = pathParts[index];

    if (!currentSchema) {
      return null;
    }

    if (currentSchema.type === "group" && typeof pathPart === "string") {
      currentSchema = currentSchema.fields[pathPart];
      continue;
    }

    if (currentSchema.type === "list") {
      currentSchema = currentSchema.item;

      if (typeof pathPart === "number") {
        continue;
      }

      if (currentSchema.type === "group") {
        currentSchema = currentSchema.fields[pathPart];
        continue;
      }
    }

    if (currentSchema.type === "group" && typeof pathPart === "number") {
      return null;
    }
  }

  return currentSchema || null;
};

const setByPath = (target, pathParts, value) => {
  let currentValue = target;

  for (let index = 0; index < pathParts.length - 1; index += 1) {
    currentValue = currentValue[pathParts[index]];
  }

  currentValue[pathParts[pathParts.length - 1]] = value;
};

const createValueFromSchema = (fieldSchema) => {
  if (fieldSchema.type === "group") {
    return Object.fromEntries(
      Object.entries(fieldSchema.fields).map(([key, childSchema]) => [
        key,
        createValueFromSchema(childSchema),
      ])
    );
  }

  if (fieldSchema.type === "list") {
    return [];
  }

  return fieldSchema.default ?? "";
};

const clearEditor = () => {
  state.content = null;
  state.originalContent = null;
  state.savedAt = "";
  cmsForm.innerHTML = "";
};

const getDirtyState = () =>
  state.content && state.originalContent
    ? JSON.stringify(state.content) !== JSON.stringify(state.originalContent)
    : false;

const showAlert = (message, stateName = "success") => {
  alertElement.textContent = message;
  alertElement.dataset.state = stateName;
  alertElement.classList.remove("hidden");
};

const hideAlert = () => {
  alertElement.textContent = "";
  delete alertElement.dataset.state;
  alertElement.classList.add("hidden");
};

const formatSavedTime = (value) => {
  if (!value) return "Not saved yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saved time unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getSetupSuccessMessage = (payload) => {
  if (!payload?.mfaEnabled || !payload?.totpSecret) {
    return "Owner access created. You are now signed in.";
  }

  return [
    "Owner access created and MFA is enabled.",
    `Authenticator secret: ${payload.totpSecret}`,
    payload.otpauthUrl ? `Authenticator setup URL: ${payload.otpauthUrl}` : "",
    "Save this in Google Authenticator, 1Password, or another authenticator app before signing out.",
  ]
    .filter(Boolean)
    .join("\n\n");
};

const updateAuthUi = () => {
  const setupMode = !state.configured;
  const localSetupLocked = setupMode && !state.setupAllowed;

  passwordConfirmWrap.classList.toggle(
    "hidden",
    !setupMode || state.authenticated || !state.setupAllowed
  );
  setupMfaWrap.classList.toggle(
    "hidden",
    !setupMode || state.authenticated || !state.setupAllowed
  );
  totpFieldWrap.classList.toggle(
    "hidden",
    setupMode || !state.mfaEnabled || state.authenticated
  );
  logoutButton.classList.toggle("hidden", !state.authenticated);
  loginButton.classList.toggle("hidden", state.authenticated);
  loginButton.textContent = setupMode ? "Create Owner Access" : "Sign In";
  loginButton.disabled = state.isLoading || localSetupLocked;
  logoutButton.disabled = state.isLoading;

  const inputsDisabled = state.isLoading || state.authenticated || localSetupLocked;

  usernameInput.disabled = inputsDisabled;
  passwordInput.disabled = inputsDisabled;
  passwordConfirmInput.disabled =
    state.isLoading || state.authenticated || state.configured || !state.setupAllowed;
  enableMfaInput.disabled =
    state.isLoading || state.authenticated || state.configured || !state.setupAllowed;
  totpInput.disabled = state.isLoading || state.authenticated || setupMode || !state.mfaEnabled;
  usernameInput.placeholder = setupMode ? "Choose owner username" : "owner";
  passwordInput.placeholder = setupMode ? "Create a strong password" : "Enter password";
  passwordInput.autocomplete = setupMode ? "new-password" : "current-password";

  if (state.authenticated) {
    usernameInput.value = state.username;
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    totpInput.value = "";
  }

  if (!state.configured) {
    authHelp.innerHTML = state.setupAllowed
      ? "Create the first owner login here. Your password will be stored as a bcrypt hash, and you can leave MFA enabled to require a 6-digit authenticator app code for future sign-ins."
      : 'Secure admin access is not configured yet. Open this admin from <code>localhost</code> to create the owner login here, or add credentials through your server environment.';
  } else if (state.authenticated) {
    authHelp.textContent = state.mfaEnabled
      ? "You are signed in with password plus TOTP verification enabled."
      : "You are signed in with password-only authentication.";
  } else if (state.mfaEnabled) {
    authHelp.textContent =
      "Enter the owner username, password, and the current 6-digit verification code.";
  } else {
    authHelp.textContent = "Enter the owner username and password to unlock editing.";
  }

  securityStatus.textContent = !state.configured
    ? state.setupAllowed
      ? "No owner account exists yet. Create it here to protect the CMS with a hashed password and optional MFA."
      : "Admin auth is not configured yet. Initial setup is restricted to localhost, so editing stays locked for now."
    : state.mfaEnabled
      ? "This admin uses a hashed password, server-side session cookies, login rate limiting, and TOTP-based MFA."
      : "This admin uses a hashed password, server-side session cookies, and login rate limiting.";

  authState.textContent = state.authenticated
    ? `Signed in as ${state.username}.`
    : state.configured
      ? "Signed out. Login is required before content can be edited."
      : state.setupAllowed
        ? "Create the owner account to unlock editing."
        : "Waiting for initial owner setup from localhost or server-side credentials.";
};

const updateStatus = () => {
  const dirty = getDirtyState();

  if (!state.configured) {
    saveStatus.textContent = state.setupAllowed
      ? "Owner setup required"
      : "Admin setup required";
    saveDetails.textContent = state.setupAllowed
      ? "Create the first owner account to unlock the CMS on this device."
      : "Open the admin from localhost or configure credentials on the server before editing can be enabled.";
  } else if (!state.authenticated) {
    saveStatus.textContent = "Sign in required";
    saveDetails.textContent = "Authenticate with the owner account to load and edit content.";
  } else if (state.isLoading) {
    saveStatus.textContent = "Loading content...";
    saveDetails.textContent = "Pulling the latest site content from the server.";
  } else if (state.isSaving) {
    saveStatus.textContent = "Saving changes...";
    saveDetails.textContent = "Publishing your updates to the live site.";
  } else if (dirty) {
    saveStatus.textContent = "Unsaved changes";
    saveDetails.textContent = "Review your edits and save when you are ready.";
  } else {
    saveStatus.textContent = "All changes saved";
    saveDetails.textContent = "The editor is synced with the current published content.";
  }

  saveMeta.textContent = `Last saved: ${formatSavedTime(state.savedAt)}`;

  const editorLocked = !state.configured || !state.authenticated;

  saveButton.disabled = editorLocked || state.isLoading || state.isSaving || !state.content;
  resetButton.disabled =
    editorLocked || state.isLoading || state.isSaving || !getDirtyState();
  reloadButton.disabled = editorLocked || state.isLoading || state.isSaving;

  updateAuthUi();
};

const inputMarkup = (fieldSchema, value, pathParts) => {
  const id = `field-${pathToString(pathParts)}`;
  const valueString = value ?? "";
  const helpMarkup = fieldSchema.help
    ? `<p class="field-help">${escapeHtml(fieldSchema.help)}</p>`
    : "";

  if (fieldSchema.type === "textarea") {
    return `
      <label for="${escapeHtml(id)}">${escapeHtml(fieldSchema.label || "Field")}</label>
      <textarea id="${escapeHtml(id)}" data-path="${escapeHtml(
        pathToString(pathParts)
      )}" rows="${escapeHtml(String(fieldSchema.rows || 4))}">${escapeHtml(
        valueString
      )}</textarea>
      ${helpMarkup}
    `;
  }

  return `
    <label for="${escapeHtml(id)}">${escapeHtml(fieldSchema.label || "Field")}</label>
    <input
      id="${escapeHtml(id)}"
      type="${escapeHtml(fieldSchema.type || "text")}"
      data-path="${escapeHtml(pathToString(pathParts))}"
      value="${escapeHtml(valueString)}"
    />
    ${helpMarkup}
  `;
};

const getArrayItemTitle = (itemValue, index, label) => {
  if (typeof itemValue === "string" && itemValue.trim()) {
    return itemValue;
  }

  if (itemValue && typeof itemValue === "object") {
    return (
      itemValue.title ||
      itemValue.name ||
      itemValue.label ||
      itemValue.number ||
      `${label || "Item"} ${index + 1}`
    );
  }

  return `${label || "Item"} ${index + 1}`;
};

const renderField = (fieldSchema, value, pathParts, nested = false) => {
  if (fieldSchema.type === "group") {
    const fieldMarkup = Object.entries(fieldSchema.fields)
      .map(([key, childSchema]) =>
        renderField(childSchema, value?.[key], [...pathParts, key], true)
      )
      .join("");

    if (nested) {
      return `<div class="nested-grid field-grid">${fieldMarkup}</div>`;
    }

    return `
      <section class="editor-card" id="section-${escapeHtml(pathParts[0])}">
        <header>
          <div>
            <p class="cms-eyebrow">Section</p>
            <h2>${escapeHtml(fieldSchema.label)}</h2>
            <p>${escapeHtml(fieldSchema.description || "")}</p>
          </div>
        </header>
        <div class="field-grid">${fieldMarkup}</div>
      </section>
    `;
  }

  if (fieldSchema.type === "list") {
    const items = Array.isArray(value) ? value : [];
    const arrayMarkup = items.length
      ? items
          .map((itemValue, index) => {
            const itemPath = [...pathParts, index];
            const itemBody =
              fieldSchema.item.type === "group"
                ? Object.entries(fieldSchema.item.fields)
                    .map(([key, childSchema]) =>
                      renderField(
                        childSchema,
                        itemValue?.[key],
                        [...itemPath, key],
                        true
                      )
                    )
                    .join("")
                : renderField(fieldSchema.item, itemValue, itemPath, true);

            return `
              <article class="array-item">
                <div class="array-item-header">
                  <strong class="array-item-title">${escapeHtml(
                    getArrayItemTitle(itemValue, index, fieldSchema.item.label)
                  )}</strong>
                  <div class="array-item-actions">
                    <button type="button" data-action="remove" data-path="${escapeHtml(
                      pathToString(itemPath)
                    )}">
                      Remove
                    </button>
                  </div>
                </div>
                <div class="field-grid">${itemBody}</div>
              </article>
            `;
          })
          .join("")
      : `<div class="empty-state">No items yet. Add the first one to this section.</div>`;

    return `
      <div class="field full-width field-list">
        <div class="field-list-header">
          <div>
            <p class="cms-eyebrow">List</p>
            <h3>${escapeHtml(fieldSchema.label)}</h3>
            ${
              fieldSchema.help
                ? `<p>${escapeHtml(fieldSchema.help)}</p>`
                : ""
            }
          </div>
          <button
            class="list-btn"
            type="button"
            data-action="add"
            data-path="${escapeHtml(pathToString(pathParts))}"
          >
            Add Item
          </button>
        </div>
        <div class="array-stack">${arrayMarkup}</div>
      </div>
    `;
  }

  return `
    <div class="field ${fieldSchema.fullWidth ? "full-width" : ""}">
      ${inputMarkup(fieldSchema, value, pathParts)}
    </div>
  `;
};

const renderEditor = () => {
  if (!state.content || !state.authenticated) {
    cmsForm.innerHTML = "";
    return;
  }

  cmsForm.innerHTML = Object.entries(schema)
    .map(([key, fieldSchema]) => renderField(fieldSchema, state.content[key], [key]))
    .join("");
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

const applyAuthPayload = (payload) => {
  state.configured = Boolean(payload.configured);
  state.setupAllowed = Boolean(payload.setupAllowed);
  state.authenticated = Boolean(payload.authenticated);
  state.authChecked = true;
  state.mfaEnabled = Boolean(payload.mfaEnabled);
  state.username = payload.username || "";

  if (!state.authenticated) {
    clearEditor();
  }

  updateStatus();
};

const setupAdmin = async () => {
  hideAlert();
  state.isLoading = true;
  updateStatus();

  try {
    const { response, payload } = await fetchJson("/api/admin/auth/setup", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        confirmPassword: passwordConfirmInput.value,
        enableMfa: enableMfaInput.checked,
      }),
    });

    if (!response.ok) {
      applyAuthPayload(payload);
      throw new Error(payload?.error || "The owner account could not be created.");
    }

    applyAuthPayload(payload);
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    totpInput.value = "";
    await loadContent();
    showAlert(getSetupSuccessMessage(payload), "success");
  } catch (error) {
    showAlert(
      error instanceof Error
        ? error.message
        : "The owner account could not be created.",
      "error"
    );
  } finally {
    state.isLoading = false;
    updateStatus();
  }
};

const loadContent = async ({ showSuccess = false } = {}) => {
  if (!state.authenticated) {
    clearEditor();
    updateStatus();
    return;
  }

  state.isLoading = true;
  updateStatus();
  hideAlert();

  try {
    const { response, payload } = await fetchJson("/api/admin/content");

    if (response.status === 401 || response.status === 503) {
      applyAuthPayload(payload);
      showAlert(
        payload.error || "Sign in again to continue editing.",
        "error"
      );
      return;
    }

    if (!response.ok || !payload?.content) {
      throw new Error(payload?.error || "The CMS could not load the site content.");
    }

    state.content = cloneValue(payload.content);
    state.originalContent = cloneValue(payload.content);
    state.savedAt = payload.savedAt || "";
    renderEditor();

    if (showSuccess) {
      showAlert("The latest published content has been reloaded.", "success");
    }
  } catch (error) {
    showAlert(
      error instanceof Error
        ? error.message
        : "The CMS could not load the site content.",
      "error"
    );
  } finally {
    state.isLoading = false;
    updateStatus();
  }
};

const loadSession = async () => {
  state.isLoading = true;
  updateStatus();

  try {
    const { response, payload } = await fetchJson("/api/admin/auth/session");

    if (!response.ok) {
      throw new Error(payload?.error || "Unable to check admin authentication.");
    }

    applyAuthPayload(payload);

    if (state.authenticated) {
      await loadContent();
    }
  } catch (error) {
    showAlert(
      error instanceof Error
        ? error.message
        : "Unable to check admin authentication.",
      "error"
    );
  } finally {
    state.isLoading = false;
    updateStatus();
  }
};

const login = async () => {
  hideAlert();
  state.isLoading = true;
  updateStatus();

  try {
    const { response, payload } = await fetchJson("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        totpCode: totpInput.value.trim(),
      }),
    });

    if (!response.ok) {
      applyAuthPayload(payload);
      throw new Error(payload?.error || "Sign-in failed.");
    }

    applyAuthPayload(payload);
    passwordInput.value = "";
    totpInput.value = "";
    await loadContent();
    showAlert("Signed in successfully.", "success");
  } catch (error) {
    showAlert(
      error instanceof Error ? error.message : "Sign-in failed.",
      "error"
    );
  } finally {
    state.isLoading = false;
    updateStatus();
  }
};

const logout = async () => {
  hideAlert();
  state.isLoading = true;
  updateStatus();

  try {
    const { payload } = await fetchJson("/api/admin/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });

    applyAuthPayload(payload);
    usernameInput.value = "";
    passwordInput.value = "";
    passwordConfirmInput.value = "";
    totpInput.value = "";
    renderEditor();
    showAlert("Signed out successfully.", "success");
  } catch (error) {
    showAlert(
      error instanceof Error ? error.message : "Sign-out failed.",
      "error"
    );
  } finally {
    state.isLoading = false;
    updateStatus();
  }
};

const saveContent = async () => {
  if (!state.content || !state.authenticated) return;

  state.isSaving = true;
  updateStatus();
  hideAlert();

  try {
    const { response, payload } = await fetchJson("/api/admin/content", {
      method: "PUT",
      body: JSON.stringify({ content: state.content }),
    });

    if (response.status === 401 || response.status === 503) {
      applyAuthPayload(payload);
      throw new Error(payload?.error || "Sign in again to save changes.");
    }

    if (!response.ok || !payload?.content) {
      throw new Error(payload?.error || "The updated content could not be saved.");
    }

    state.content = cloneValue(payload.content);
    state.originalContent = cloneValue(payload.content);
    state.savedAt = payload.savedAt || "";
    renderEditor();
    showAlert("Changes saved and published to the site.", "success");
  } catch (error) {
    showAlert(
      error instanceof Error ? error.message : "The changes could not be saved.",
      "error"
    );
  } finally {
    state.isSaving = false;
    updateStatus();
  }
};

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.authenticated) return;

  if (!state.configured) {
    await setupAdmin();
    return;
  }

  await login();
});

reloadButton.addEventListener("click", async () => {
  await loadContent({ showSuccess: true });
});

resetButton.addEventListener("click", () => {
  if (!state.originalContent || !state.authenticated) return;
  state.content = cloneValue(state.originalContent);
  renderEditor();
  hideAlert();
  updateStatus();
});

saveButton.addEventListener("click", async () => {
  await saveContent();
});

logoutButton.addEventListener("click", async () => {
  await logout();
});

cmsForm.addEventListener("input", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  if (!target.dataset.path || !state.content || !state.authenticated) {
    return;
  }

  setByPath(state.content, parsePath(target.dataset.path), target.value);
  updateStatus();
});

cmsForm.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement) || !state.content || !state.authenticated) {
    return;
  }

  const button = target.closest("button[data-action]");

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const path = button.dataset.path;
  const action = button.dataset.action;

  if (!path || !action) return;

  const pathParts = parsePath(path);

  if (action === "add") {
    const fieldSchema = getSchemaByPath(pathParts);
    const currentArray = getByPath(state.content, pathParts);

    if (!fieldSchema || fieldSchema.type !== "list" || !Array.isArray(currentArray)) {
      return;
    }

    currentArray.push(createValueFromSchema(fieldSchema.item));
    renderEditor();
    updateStatus();
    return;
  }

  if (action === "remove") {
    const parentPath = pathParts.slice(0, -1);
    const itemIndex = pathParts[pathParts.length - 1];
    const currentArray = getByPath(state.content, parentPath);

    if (!Array.isArray(currentArray) || typeof itemIndex !== "number") {
      return;
    }

    currentArray.splice(itemIndex, 1);
    renderEditor();
    updateStatus();
  }
});

updateStatus();
loadSession();
