// Escape HTML pour éviter injection
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    })[m];
  });
}

// MENU BURGER
const burger = document.querySelector(".burger");
const menu = document.querySelector(".menu");
if (burger) {
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", !open);
    menu.classList.toggle("open");
  });
}

// BOUTON RETOUR EN HAUT
const topBtn = document.getElementById("topBtn");
if (topBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) topBtn.classList.add("show");
    else topBtn.classList.remove("show");
  });
  topBtn.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));
}

// SERVICE AVIS
class AvisService {
  static async getAvis() {
    const jsonAvis = await fetch("data/avis.json").then(r => r.json());
    const localAvis = JSON.parse(localStorage.getItem("avis")) || [];
    return [...jsonAvis, ...localAvis];
  }

  static async envoyerAvis(avis) {
    const stock = JSON.parse(localStorage.getItem("avis")) || [];
    stock.push(avis);
    localStorage.setItem("avis", JSON.stringify(stock));
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}

// FORMULAIRE AVIS
const form = document.getElementById("avisForm");
const message = document.getElementById("message");
const avisList = document.getElementById("avisList");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    message.textContent = "";
    message.setAttribute("aria-live", "polite");

    const fields = ['nom','ville','avis','note'];
    let errors = [];

    // Vérifier les champs obligatoires
    fields.forEach(f => {
      const input = form.querySelector(`[name="${f}"]`);
      if (!input.value.trim()) errors.push(`${f.charAt(0).toUpperCase()+f.slice(1)} est obligatoire.`);
    });

    // Si erreurs sur champs obligatoires
    if (errors.length > 0) {
      message.textContent = errors.join(' ');
      return;
    }

    // Tout est rempli, envoyer
    try {
      const avisData = Object.fromEntries(new FormData(form));
      avisData.nom = escapeHTML(avisData.nom);
      avisData.prenom = escapeHTML(avisData.prenom);
      avisData.ville = escapeHTML(avisData.ville);
      avisData.avis = escapeHTML(avisData.avis);

      await AvisService.envoyerAvis(avisData);
      message.textContent = "Merci pour votre avis, il a bien été envoyé.";
      form.reset();
      afficherAvis();
    } catch (error) {
      message.textContent = "Une erreur est survenue lors de l’envoi. Veuillez réessayer.";
    }
  });
}

// AFFICHAGE DES AVIS
async function afficherAvis() {
  if (!avisList) return;
  const avis = await AvisService.getAvis();
  avisList.innerHTML = avis
    .map(a => `<li><strong>${a.prenom || "Anonyme"}</strong> (${a.note}/5) – ${a.avis}</li>`)
    .join("");
}
afficherAvis();

// PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
