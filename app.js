async function loadCV() {
  const res = await fetch("./cv.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cv.json");
  return res.json();
}

function normalizeTechSkills(technicalSkills) {
  // Safe normalizer that supports:
  // - array: ["SQL", "Python"]
  // - object: { flat: ["SQL", "Python"] } but NEVER renders the .flat function itself
  // - string: "SQL, Python"
  // Prevents rendering "function flat() { [native code] }"
  if (!technicalSkills) return [];

  // If it's an array, return it directly
  if (Array.isArray(technicalSkills)) return technicalSkills;

  // If it's a string, split and trim
  if (typeof technicalSkills === "string") {
    return technicalSkills.split(",").map(s => s.trim()).filter(Boolean);
  }

  // If it's an object, look for an array property (NOT the function itself)
  if (typeof technicalSkills === "object" && technicalSkills !== null) {
    // Check if there's a 'flat' array property (but never call the function)
    if (Array.isArray(technicalSkills.flat)) {
      return technicalSkills.flat;
    }
    // Try other common property names
    if (Array.isArray(technicalSkills.skills)) return technicalSkills.skills;
    if (Array.isArray(technicalSkills.items)) return technicalSkills.items;
  }

  return [];
}

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else n.setAttribute(k, v);
  });
  children.forEach(c => n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return n;
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function renderSkillsGrid(container, items) {
  container.innerHTML = "";
  asArray(items).filter(Boolean).forEach(s => {
    container.appendChild(el("div", { class: "skill-box" }, [String(s)]));
  });
}

function renderList(container, items) {
  container.innerHTML = "";
  asArray(items).forEach(it => {
    const text = typeof it === "string" ? it : (it.description || it.title || JSON.stringify(it));
    if (text) container.appendChild(el("li", {}, [text]));
  });
}

function renderEducation(container, education) {
  container.innerHTML = "";
  
  // Education entries with images
  const eduEntries = [
    {
      institution: "Copenhagen Business School",
      degree: "Master of Business Administration (MBA), Finance, General",
      dates: "Oct 2020 – Sep 2021",
      grade: null,
      description: "Copenhagen Business School is a triple-accredited full-time MBA, ranked #24 globally by QS Top MBA (2021). The class consists of 43 talented and ambitious individuals from 19 nationalities.",
      activities: ["Leadership development program (LDP)", "Integrated strategy project (ISP)", "Entrepreneurial Reverse A-board"],
      areasOfStudy: ["Leadership development process", "Analytics and Big Data", "Financial and Management Accounting", "Human Resources Management", "Change Management", "Sustainable Business Practices", "Strategic Management", "Corporate Finance"],
      image: "cbs.png"
    },
    {
      institution: "Savitribai Phule Pune University",
      degree: "Bachelor of Engineering (B.E.), Mechanical Engineering",
      dates: "Jun 2005 – Jul 2009",
      grade: "First class (Among top 10% of class)",
      activities: ["Mechanical engineering student association (MESA)", "College Campus student committee", "Firodiya"],
      highlights: [
        "Graduated in First Class, B.E in Mechanical Engineering",
        "Campus Placement Representative, 2008–2009",
        "Head, College cultural head for two consecutive years, 2007–2009",
        "Research Project on a hydraulic system",
        "Won first prize for paper presentation on space elevator",
        "Founding member of the College Firodiya community (prestigious Marathi drama competition)"
      ],
      image: "pune.png"
    }
  ];
  
  eduEntries.forEach(edu => {
    const headerContent = [
      el("h3", {}, [edu.institution]),
      el("p", { class: "edu-degree" }, [edu.degree]),
      el("p", { class: "edu-dates" }, [edu.dates])
    ];
    
    if (edu.image) {
      headerContent.push(el("img", { src: `./${edu.image}`, alt: edu.institution, class: "edu-image" }));
    }
    
    const card = el("div", { class: "edu-card-detailed" }, [
      el("div", { class: "edu-header" }, headerContent)
    ]);
    
    if (edu.grade) {
      card.appendChild(el("p", { class: "edu-grade" }, ["Grade: " + edu.grade]));
    }
    
    if (edu.description) {
      card.appendChild(el("p", { class: "edu-description" }, [edu.description]));
    }
    
    if (edu.activities && edu.activities.length) {
      card.appendChild(el("div", { class: "edu-section" }, [
        el("h4", {}, ["Activities & Societies"]),
        createList(edu.activities)
      ]));
    }
    
    if (edu.areasOfStudy && edu.areasOfStudy.length) {
      card.appendChild(el("div", { class: "edu-section" }, [
        el("h4", {}, ["Areas of Study"]),
        createList(edu.areasOfStudy)
      ]));
    }
    
    if (edu.highlights && edu.highlights.length) {
      card.appendChild(el("div", { class: "edu-section" }, [
        el("h4", {}, ["Highlights"]),
        createList(edu.highlights)
      ]));
    }
    
    container.appendChild(card);
  });
}

function createList(items) {
  const ul = el("ul", {});
  items.forEach(item => ul.appendChild(el("li", {}, [item])));
  return ul;
}

function renderCertifications(container, certs) {
  container.innerHTML = "";
  asArray(certs).forEach(cert => {
    const text = typeof cert === "string" ? cert : (cert.description || cert.title || JSON.stringify(cert));
    if (text) {
      container.appendChild(el("span", { class: "cert-badge" }, [text]));
    }
  });
}

function getCompanyLogo(company) {
  if (company.includes("Egmont")) return "./egmont.png";
  if (company.includes("SAS")) return "./SAS.png";
  if (company.includes("Army")) return "./army.jpeg";
  return null;
}

function renderExperienceCards(container, experience) {
  container.innerHTML = "";
  asArray(experience).forEach(job => {
    const title = job.title || job.role || "";
    const company = job.company || "";
    const location = job.location || "";
    const dates = job.dates || [job.startDate, job.endDate].filter(Boolean).join(" – ");
    const logo = getCompanyLogo(company);

    const jobNode = el("div", { class: "job-card" }, []);

    // Add logo if available
    if (logo) {
      const logoDiv = el("div", { class: "job-logo" }, [
        el("img", { src: logo, alt: company })
      ]);
      jobNode.appendChild(logoDiv);
    }

    // Add content
    const contentDiv = el("div", { class: "job-content" }, [
      el("div", { class: "job-title" }, [title]),
      el("div", { class: "job-meta" }, [
        el("span", {}, [company]),
        el("span", {}, [location]),
        el("span", {}, [dates])
      ])
    ]);

    const highlights = asArray(job.highlights).filter(Boolean);
    if (highlights.length) {
      const ul = el("ul", {});
      highlights.forEach(h => ul.appendChild(el("li", {}, [h])));
      contentDiv.appendChild(ul);
    } else if (job.description) {
      contentDiv.appendChild(el("p", {}, [job.description]));
    }

    jobNode.appendChild(contentDiv);
    container.appendChild(jobNode);
  });
}

function handleContactSubmit(e, cvEmail) {
  e.preventDefault();
  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;
  
  const subject = `New message from ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  
  const mailtoLink = `mailto:${cvEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}

// Cert media from Certification folder
const CERT_MEDIA = [
  { name: "Microsoft AI-900", file: "Certification/Microsoft AI-900.jpg", type: "image" },
  { name: "Microsoft Azure Data Fundamentals", file: "Certification/Microsoft Azure data fundamentals.jpg", type: "image" },
  { name: "Power BI Data Analyst Associate", file: "Certification/Power bi data analyst associate.jpg", type: "image" },
  { name: "PRINCE2 Certification", file: "Certification/PRINCE2 certification.png", type: "image" },
  { name: "Certified Scrum Master", file: "Certification/Certified Scrum Master.png", type: "image" },
  { name: "Certified Product Owner", file: "Certification/Certified Product Owner.png", type: "image" }
];

function renderCertifications(container, certs) {
  container.innerHTML = "";
  
  // Render all cert media full-size one below another
  CERT_MEDIA.forEach(media => {
    if (media.type === "image") {
      const section = el("div", { class: "cert-display" }, [
        el("h3", { class: "cert-name" }, [media.name]),
        el("img", { src: `./${media.file}`, alt: media.name, class: "cert-full-image" })
      ]);
      container.appendChild(section);
    }
  });
}

function showCertModal(media) {
  const modal = document.getElementById("certModal") || createCertModal();
  const content = modal.querySelector(".modal-content");
  content.innerHTML = `<span class="modal-close" onclick="document.getElementById('certModal').classList.remove('open')">✕</span><img src="./${media.file}" alt="${media.name}" />`;
  modal.classList.add("open");
}

function createCertModal() {
  const modal = el("div", { id: "certModal", class: "modal" }, []);
  modal.innerHTML = '<div class="modal-content"><span class="modal-close" onclick="document.getElementById(\'certModal\').classList.remove(\'open\')">✕</span></div>';
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
  document.body.appendChild(modal);
  return modal;
}

function renderTechSkillsWithCategories(container, skills) {
  container.innerHTML = "";
  asArray(skills).forEach(skill => {
    const skillStr = String(skill);
    if (skillStr.includes(":")) {
      const [category, items] = skillStr.split(":").map(s => s.trim());
      const categoryGroup = el("div", { class: "skill-category-group" }, [
        el("h3", { class: "skill-category" }, [category])
      ]);
      const skillsWrapper = el("div", { class: "skills-sub-grid" });
      items.split(",").forEach(item => {
        const trimmed = item.trim();
        if (trimmed) {
          skillsWrapper.appendChild(el("div", { class: "skill-box" }, [trimmed]));
        }
      });
      categoryGroup.appendChild(skillsWrapper);
      container.appendChild(categoryGroup);
    } else {
      container.appendChild(el("div", { class: "skill-box" }, [skillStr]));
    }
  });
}

function createFooter() {
  const year = new Date().getFullYear();
  const footer = el("footer", { class: "footer" }, [
    el("div", { class: "footer-content" }, [
      el("div", { class: "footer-section" }, [
        el("h4", {}, ["Govinda Prasad"]),
        el("p", {}, ["Eremitageparken 215", el("br", {}), "Lyngby, Denmark"])
      ]),
      el("div", { class: "footer-section" }, [
        el("h4", {}, ["Connect"]),
        el("p", {}, [el("a", { href: "mailto:adnivog02@gmail.com", style: "color: var(--primary); text-decoration: none;" }, ["Email"]), " • ", el("a", { href: "https://linkedin.com/in/govindaprasad", target: "_blank", style: "color: var(--primary); text-decoration: none;" }, ["LinkedIn"])])
      ])
    ]),
    el("div", { class: "footer-bottom" }, [
      `© ${year} Govinda Prasad. All rights reserved.`
    ])
  ]);
  return footer;
}

(async function main() {
  try {
    const cv = await loadCV();
    const basics = cv.basics || {};
    const page = document.body.getAttribute("data-page");

    if (page === "home") {
      const nameEl = document.getElementById("name");
      const taglineEl = document.getElementById("tagline");
      const buttonsEl = document.getElementById("heroButtons");
      const highlightsEl = document.getElementById("highlights");

      if (nameEl) nameEl.textContent = basics.name || "Your Name";
      
      if (taglineEl) {
        taglineEl.textContent = cv.summary || "";
      }

      if (buttonsEl) {
        buttonsEl.appendChild(el("a", { href: "./contact.html", class: "btn" }, ["Contact Me"]));
        buttonsEl.appendChild(el("a", { href: "./experience.html", class: "btn btn-secondary" }, ["View Projects"]));
        buttonsEl.appendChild(el("a", { href: "./cv.json", class: "btn btn-secondary", download: "Govinda_Prasad_CV.json" }, ["Download CV"]));
      }

      if (highlightsEl) {
        const highlights = [];
        if (cv.coreSkills && cv.coreSkills.length) {
          highlights.push(el("div", { class: "highlight-card" }, [
            el("h3", {}, ["Core Expertise"]),
            el("p", {}, [cv.coreSkills.slice(0, 5).join(" • ")])
          ]));
        }
        if (cv.experience && cv.experience.length) {
          const years = cv.experience.length;
          highlights.push(el("div", { class: "highlight-card" }, [
            el("h3", {}, [`${years}+ Roles`]),
            el("p", {}, ["Delivered digital transformation, automation, and data solutions across global teams"])
          ]));
        }
        if (cv.certifications && cv.certifications.length) {
          highlights.push(el("div", { class: "highlight-card" }, [
            el("h3", {}, [`${cv.certifications.length} Certifications`]),
            el("p", {}, [cv.certifications.slice(0, 3).join(" • ")])
          ]));
        }
        highlights.forEach(h => highlightsEl.appendChild(h));
      }
    } else if (page === "experience") {
      const expEl = document.getElementById("experience");
      if (expEl) renderExperienceCards(expEl, cv.experience || []);
    } else if (page === "skills") {
      const coreEl = document.getElementById("coreSkills");
      const techEl = document.getElementById("technicalSkills");
      if (coreEl) renderSkillsGrid(coreEl, cv.coreSkills || []);
      if (techEl) {
        const tech = normalizeTechSkills(cv.technicalSkills);
        renderTechSkillsWithCategories(techEl, tech);
      }
    } else if (page === "education") {
      const eduEl = document.getElementById("education");
      if (eduEl) renderEducation(eduEl, []);
    } else if (page === "certifications") {
      const certEl = document.getElementById("certifications");
      if (certEl) renderCertifications(certEl, cv.certifications || []);
      const form = document.getElementById("contactForm");
      if (form) {
        form.addEventListener("submit", (e) => handleContactSubmit(e, basics.email));
      }
      const infoEl = document.getElementById("contactInfo");
      if (infoEl) {
        if (basics.email) {
          infoEl.appendChild(el("div", { class: "contact-item" }, [
            el("div", {}, [
              el("div", { class: "contact-label" }, ["Email"]),
              el("a", { href: `mailto:${basics.email}` }, [basics.email])
            ])
          ]));
        }
        if (basics.phone) {
          infoEl.appendChild(el("div", { class: "contact-item" }, [
            el("div", {}, [
              el("div", { class: "contact-label" }, ["Phone"]),
              el("a", { href: `tel:${basics.phone}` }, [basics.phone])
            ])
          ]));
        }
        const profiles = asArray(basics.profiles);
        profiles.forEach(p => {
          if (p?.url) {
            infoEl.appendChild(el("div", { class: "contact-item" }, [
              el("a", { href: p.url, target: "_blank", rel: "noreferrer" }, [p.network || "Link"])
            ]));
          }
        });
      }
    }
  } catch (err) {
    const errorMsg = document.querySelector(".error-msg") || document.body;
    if (errorMsg) {
      errorMsg.style.display = "block";
      errorMsg.textContent = `Error loading data: ${err.message}`;
    }
  }
})();
