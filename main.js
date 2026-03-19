const SITE_DATA_KEY = "affiliate-site-data-v1";
const ADMIN_PASSWORD_KEY = "affiliate-site-admin-password-v1";
const DEFAULT_ADMIN_PASSWORD = "admin123";

const defaultSiteData = {
  brand: "Prime Vitrine",
  headline: "Produtos selecionados com links oficiais da Amazon",
  subheadline:
    "Escolha um produto, clique no botao e finalize sua compra com seguranca direto no seu link de associado.",
  heroImage:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
  ctaText: "Ver ofertas",
  ctaUrl: "#produtos",
  sectionTitle: "Ofertas em destaque",
  sectionSubtitle: "Atualize esta lista em tempo real pelo painel admin.",
  footerText: "Como associado da Amazon, posso receber comissoes por compras qualificadas.",
  theme: {
    bgFrom: "#020617",
    bgTo: "#111827",
    primary: "#f59e0b",
    accent: "#38bdf8",
  },
  products: [
    {
      id: crypto.randomUUID(),
      name: "Echo Dot (5a geracao)",
      description: "Som potente, Alexa integrada e automacao residencial simplificada.",
      imageUrl:
        "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=900&q=80",
      affiliateUrl: "https://www.amazon.com.br/",
      price: "R$ 379,90",
      badge: "Mais vendido",
    },
    {
      id: crypto.randomUUID(),
      name: "Kindle 11a geracao",
      description: "Leitura sem reflexo, bateria de longa duracao e ajuste de brilho.",
      imageUrl:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
      affiliateUrl: "https://www.amazon.com.br/",
      price: "R$ 499,00",
      badge: "Leitura",
    },
    {
      id: crypto.randomUUID(),
      name: "Fone Bluetooth Premium",
      description: "Cancelamento de ruido e ate 30 horas de bateria.",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      affiliateUrl: "https://www.amazon.com.br/",
      price: "R$ 289,90",
      badge: "Audio",
    },
  ],
};

let siteData = loadSiteData();
let adminPassword = localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_ADMIN_PASSWORD;
let isAdminOpen = false;
let isAdminAuthenticated = false;

const channel = "BroadcastChannel" in window ? new BroadcastChannel("affiliate-site-live") : null;

const dom = {
  brand: document.getElementById("brand"),
  headline: document.getElementById("headline"),
  subheadline: document.getElementById("subheadline"),
  heroImage: document.getElementById("heroImage"),
  cta: document.getElementById("cta"),
  sectionTitle: document.getElementById("sectionTitle"),
  sectionSubtitle: document.getElementById("sectionSubtitle"),
  productsGrid: document.getElementById("productsGrid"),
  footerText: document.getElementById("footerText"),

  toggleAdminBtn: document.getElementById("toggleAdminBtn"),
  adminModal: document.getElementById("adminModal"),
  closeAdminBtn: document.getElementById("closeAdminBtn"),
  adminLogin: document.getElementById("adminLogin"),
  adminEditor: document.getElementById("adminEditor"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  adminLoginBtn: document.getElementById("adminLoginBtn"),
  logoutAdminBtn: document.getElementById("logoutAdminBtn"),

  inputBrand: document.getElementById("inputBrand"),
  inputHeadline: document.getElementById("inputHeadline"),
  inputSubheadline: document.getElementById("inputSubheadline"),
  inputHeroImage: document.getElementById("inputHeroImage"),
  inputCtaText: document.getElementById("inputCtaText"),
  inputCtaUrl: document.getElementById("inputCtaUrl"),
  inputSectionTitle: document.getElementById("inputSectionTitle"),
  inputSectionSubtitle: document.getElementById("inputSectionSubtitle"),
  inputFooterText: document.getElementById("inputFooterText"),
  inputBgFrom: document.getElementById("inputBgFrom"),
  inputBgTo: document.getElementById("inputBgTo"),
  inputPrimary: document.getElementById("inputPrimary"),
  inputAccent: document.getElementById("inputAccent"),

  addProductBtn: document.getElementById("addProductBtn"),
  adminProductsList: document.getElementById("adminProductsList"),
  newPasswordInput: document.getElementById("newPasswordInput"),
  changePasswordBtn: document.getElementById("changePasswordBtn"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

start();

function start() {
  bindPublicActions();
  bindAdminActions();
  bindRealtimeSync();
  renderAll();
}

function bindPublicActions() {
  dom.toggleAdminBtn.addEventListener("click", () => {
    setAdminOpen(!isAdminOpen);
  });

  dom.closeAdminBtn.addEventListener("click", () => {
    setAdminOpen(false);
  });

  dom.adminModal.addEventListener("click", (event) => {
    if (event.target === dom.adminModal) {
      setAdminOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isAdminOpen) {
      setAdminOpen(false);
    }
  });
}

function bindAdminActions() {
  dom.adminLoginBtn.addEventListener("click", () => {
    if (dom.adminPasswordInput.value === adminPassword) {
      isAdminAuthenticated = true;
      dom.adminPasswordInput.value = "";
      renderAdminState();
      return;
    }
    alert("Senha incorreta.");
  });

  dom.logoutAdminBtn.addEventListener("click", () => {
    isAdminAuthenticated = false;
    renderAdminState();
  });

  bindField(dom.inputBrand, "brand");
  bindField(dom.inputHeadline, "headline");
  bindField(dom.inputSubheadline, "subheadline");
  bindField(dom.inputHeroImage, "heroImage");
  bindField(dom.inputCtaText, "ctaText");
  bindField(dom.inputCtaUrl, "ctaUrl");
  bindField(dom.inputSectionTitle, "sectionTitle");
  bindField(dom.inputSectionSubtitle, "sectionSubtitle");
  bindField(dom.inputFooterText, "footerText");

  bindThemeField(dom.inputBgFrom, "bgFrom");
  bindThemeField(dom.inputBgTo, "bgTo");
  bindThemeField(dom.inputPrimary, "primary");
  bindThemeField(dom.inputAccent, "accent");

  dom.addProductBtn.addEventListener("click", () => {
    siteData.products.push({
      id: crypto.randomUUID(),
      name: "Novo produto",
      description: "Descreva o produto em uma frase curta.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      affiliateUrl: "https://www.amazon.com.br/",
      price: "R$ 0,00",
      badge: "Novo",
    });
    saveAndRender();
  });

  dom.changePasswordBtn.addEventListener("click", () => {
    const next = dom.newPasswordInput.value.trim();
    if (!next) {
      alert("Digite uma senha valida.");
      return;
    }
    adminPassword = next;
    localStorage.setItem(ADMIN_PASSWORD_KEY, adminPassword);
    if (channel) channel.postMessage({ type: "admin-password", payload: adminPassword });
    dom.newPasswordInput.value = "";
    alert("Senha alterada com sucesso.");
  });

  dom.exportBtn.addEventListener("click", async () => {
    const text = JSON.stringify(siteData, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert("JSON copiado para a area de transferencia.");
    } catch {
      prompt("Copie o JSON abaixo:", text);
    }
  });

  dom.importBtn.addEventListener("click", () => {
    const text = prompt("Cole o JSON da configuracao:");
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.products) || !parsed.theme) {
        alert("JSON invalido.");
        return;
      }
      siteData = parsed;
      saveAndRender();
      alert("Configuracao importada com sucesso.");
    } catch {
      alert("JSON invalido.");
    }
  });

  dom.resetBtn.addEventListener("click", () => {
    if (!confirm("Deseja restaurar todo o site para o padrao?")) return;
    siteData = structuredClone(defaultSiteData);
    saveAndRender();
  });
}

function bindRealtimeSync() {
  window.addEventListener("storage", (event) => {
    if (event.key === SITE_DATA_KEY && event.newValue) {
      siteData = JSON.parse(event.newValue);
      renderAll();
    }
    if (event.key === ADMIN_PASSWORD_KEY && event.newValue) {
      adminPassword = event.newValue;
    }
  });

  if (!channel) return;

  channel.onmessage = (event) => {
    if (event.data?.type === "site-data") {
      siteData = event.data.payload;
      renderAll();
    }
    if (event.data?.type === "admin-password") {
      adminPassword = event.data.payload;
    }
  };
}

function bindField(input, key) {
  input.addEventListener("input", (event) => {
    siteData[key] = event.target.value;
    saveAndRender();
  });
}

function bindThemeField(input, key) {
  input.addEventListener("input", (event) => {
    siteData.theme[key] = event.target.value;
    saveAndRender();
  });
}

function setAdminOpen(open) {
  isAdminOpen = open;
  dom.adminModal.classList.toggle("open", isAdminOpen);
  dom.adminModal.setAttribute("aria-hidden", String(!isAdminOpen));
  dom.toggleAdminBtn.textContent = isAdminOpen ? "Fechar admin" : "Abrir admin";
}

function renderAll() {
  renderSite();
  renderAdminInputs();
  renderAdminProducts();
  renderAdminState();
}

function renderSite() {
  dom.brand.textContent = siteData.brand;
  dom.headline.textContent = siteData.headline;
  dom.subheadline.textContent = siteData.subheadline;
  dom.heroImage.src = siteData.heroImage;
  dom.cta.textContent = siteData.ctaText;
  dom.cta.href = siteData.ctaUrl;
  dom.sectionTitle.textContent = siteData.sectionTitle;
  dom.sectionSubtitle.textContent = siteData.sectionSubtitle;
  dom.footerText.textContent = siteData.footerText;

  document.documentElement.style.setProperty("--bg-from", siteData.theme.bgFrom);
  document.documentElement.style.setProperty("--bg-to", siteData.theme.bgTo);
  document.documentElement.style.setProperty("--primary", siteData.theme.primary);
  document.documentElement.style.setProperty("--accent", siteData.theme.accent);

  dom.productsGrid.innerHTML = siteData.products
    .map(
      (product) => `
      <article class="product-item">
        <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />
        <div class="product-body">
          <div class="product-top">
            <span class="badge">${escapeHtml(product.badge)}</span>
            <span class="price">${escapeHtml(product.price)}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.description)}</p>
          <a class="button button-primary" target="_blank" rel="noreferrer" href="${escapeHtml(product.affiliateUrl)}">
            Comprar na Amazon
          </a>
        </div>
      </article>
    `,
    )
    .join("");
}

function renderAdminInputs() {
  dom.inputBrand.value = siteData.brand;
  dom.inputHeadline.value = siteData.headline;
  dom.inputSubheadline.value = siteData.subheadline;
  dom.inputHeroImage.value = siteData.heroImage;
  dom.inputCtaText.value = siteData.ctaText;
  dom.inputCtaUrl.value = siteData.ctaUrl;
  dom.inputSectionTitle.value = siteData.sectionTitle;
  dom.inputSectionSubtitle.value = siteData.sectionSubtitle;
  dom.inputFooterText.value = siteData.footerText;
  dom.inputBgFrom.value = siteData.theme.bgFrom;
  dom.inputBgTo.value = siteData.theme.bgTo;
  dom.inputPrimary.value = siteData.theme.primary;
  dom.inputAccent.value = siteData.theme.accent;
}

function renderAdminState() {
  dom.adminLogin.classList.toggle("hidden", isAdminAuthenticated);
  dom.adminEditor.classList.toggle("hidden", !isAdminAuthenticated);
}

function renderAdminProducts() {
  dom.adminProductsList.innerHTML = siteData.products
    .map(
      (product, index) => `
      <article class="admin-product" data-id="${product.id}">
        <div class="admin-product-head">
          <strong>Produto ${index + 1}</strong>
          <div class="admin-product-actions">
            <button class="button button-ghost" type="button" data-action="up">Subir</button>
            <button class="button button-ghost" type="button" data-action="down">Descer</button>
            <button class="button button-danger" type="button" data-action="delete">Excluir</button>
          </div>
        </div>
        <label><span>Nome</span><input type="text" data-field="name" value="${escapeAttr(product.name)}" /></label>
        <label><span>Descricao</span><textarea data-field="description" rows="2">${escapeHtml(product.description)}</textarea></label>
        <label><span>Preco</span><input type="text" data-field="price" value="${escapeAttr(product.price)}" /></label>
        <label><span>Selo</span><input type="text" data-field="badge" value="${escapeAttr(product.badge)}" /></label>
        <label><span>Imagem (URL)</span><input type="url" data-field="imageUrl" value="${escapeAttr(product.imageUrl)}" /></label>
        <label><span>Link afiliado Amazon</span><input type="url" data-field="affiliateUrl" value="${escapeAttr(product.affiliateUrl)}" /></label>
      </article>
    `,
    )
    .join("");

  dom.adminProductsList.querySelectorAll(".admin-product").forEach((node) => {
    const id = node.getAttribute("data-id");

    node.querySelectorAll("input[data-field], textarea[data-field]").forEach((input) => {
      input.addEventListener("input", (event) => {
        const field = event.target.getAttribute("data-field");
        const product = siteData.products.find((item) => item.id === id);
        if (!product || !field) return;
        product[field] = event.target.value;
        saveAndRender();
      });
    });

    node.querySelector("[data-action='delete']").addEventListener("click", () => {
      siteData.products = siteData.products.filter((item) => item.id !== id);
      saveAndRender();
    });

    node.querySelector("[data-action='up']").addEventListener("click", () => {
      moveProduct(id, -1);
    });

    node.querySelector("[data-action='down']").addEventListener("click", () => {
      moveProduct(id, 1);
    });
  });
}

function moveProduct(id, delta) {
  const index = siteData.products.findIndex((item) => item.id === id);
  if (index < 0) return;
  const next = index + delta;
  if (next < 0 || next >= siteData.products.length) return;
  const list = [...siteData.products];
  const [item] = list.splice(index, 1);
  list.splice(next, 0, item);
  siteData.products = list;
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem(SITE_DATA_KEY, JSON.stringify(siteData));
  if (channel) {
    channel.postMessage({ type: "site-data", payload: siteData });
  }
  renderAll();
}

function loadSiteData() {
  try {
    const raw = localStorage.getItem(SITE_DATA_KEY);
    if (!raw) return structuredClone(defaultSiteData);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.products) || !parsed.theme) {
      return structuredClone(defaultSiteData);
    }
    return parsed;
  } catch {
    return structuredClone(defaultSiteData);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}