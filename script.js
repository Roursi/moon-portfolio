const portfolioData = {
  journal: [
    {
      title: "《求真》第一期",
      pdf: "./assets/journals/《求真》第一期.pdf",
      cover: "./assets/posters/封面定稿.jpg"
    },
    {
      title: "《求真》第二期",
      pdf: "./assets/journals/《求真》第二期.pdf",
      cover: "./assets/posters/廉洁文集封面.png"
    },
    {
      title: "《求真》第三期",
      pdf: "./assets/journals/《求真》第三期.pdf",
      cover: "./assets/posters/国庆海报.png"
    },
    {
      title: "《求真》第四期",
      pdf: "./assets/journals/《求真》第四期.pdf",
      cover: "./assets/posters/兔年迎春海报.jpg"
    },
    {
      title: "班刊集萃",
      pdf: "./assets/journals/班刊集萃.pdf",
      cover: "./assets/posters/培训会议背景 海报.png"
    }
  ],
  poster: [
    {
      title: "封面定稿",
      image: "./assets/posters/封面定稿.jpg"
    },
    {
      title: "兔年迎春海报",
      image: "./assets/posters/兔年迎春海报.jpg"
    },
    {
      title: "国庆海报",
      image: "./assets/posters/国庆海报.png"
    },
    {
      title: "新生宣传海报",
      image: "./assets/posters/新生宣传海报.jpg"
    },
    {
      title: "讲座海报（jpg）",
      image: "./assets/posters/讲座海报.jpg"
    },
    {
      title: "讲座海报（png）",
      image: "./assets/posters/讲座海报.png"
    },
    {
      title: "廉洁文集封面",
      image: "./assets/posters/廉洁文集封面.png"
    },
    {
      title: "学术培训海报",
      image: "./assets/posters/学术培训海报.jpg"
    },
    {
      title: "雷锋建设活动海报",
      image: "./assets/posters/雷锋建设活动海报.png"
    },
    {
      title: "培训会议背景 海报",
      image: "./assets/posters/培训会议背景 海报.png"
    }
  ],
  board: [
    {
      title: "54cm",
      image: "./assets/boards/54cm.jpg"
    },
    {
      title: "55cm",
      image: "./assets/boards/55cm.jpg"
    },
    {
      title: "65-55",
      image: "./assets/boards/65-55.jpg"
    },
    {
      title: "65cm",
      image: "./assets/boards/65cm.jpg"
    }
  ],
  logo: [
    {
      title: "启古文化传播平台logo",
      image: "./assets/logos/启古文化传播平台logo.png"
    },
    {
      title: "班徽logo",
      image: "./assets/logos/班徽logo.png"
    },
    {
      title: "班徽logo",
      image: "./assets/logos/透明底班徽2.png"
    }
  ]
};
const journalGrid = document.getElementById("journalGrid");
const posterGrid = document.getElementById("posterGrid");
const boardGrid = document.getElementById("boardGrid");
const logoGrid = document.getElementById("logoGrid");

function normalizeAssetUrl(url) {
  if (!url) return "";
  return encodeURI(url).replace(/%5C/g, "/");
}

function createJournalCard(item) {
  const pdfUrl = normalizeAssetUrl(item.pdf);
  const coverUrl = normalizeAssetUrl(item.cover);
  return `
    <article class="journal-card">
      <button class="journal-btn" type="button" data-pdf="${pdfUrl}" data-title="${item.title}">
        <div class="journal-cover">
          <img src="${coverUrl}" alt="${item.title} 封面" />
        </div>
        <div class="journal-meta">
          <span>${item.title}</span>
          <span class="journal-hint">点击在线预览</span>
        </div>
      </button>
    </article>
  `;
}

function createStandardCard(item) {
  const imageUrl = normalizeAssetUrl(item.image);
  return `
    <article class="portfolio-card">
      <img src="${imageUrl}" alt="${item.title}" />
      <div class="label">${item.title}</div>
    </article>
  `;
}

function bindJournalClicks(scope) {
  scope.querySelectorAll(".journal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pdf = btn.dataset.pdf;
      const title = btn.dataset.title || "期刊预览";
      if (!pdf) return;
      openPdfModal(pdf, title);
    });
  });
}

function renderAllPortfolios() {
  journalGrid.innerHTML = portfolioData.journal.map(createJournalCard).join("");
  posterGrid.innerHTML = portfolioData.poster.map(createStandardCard).join("");
  boardGrid.innerHTML = portfolioData.board.map(createStandardCard).join("");
  logoGrid.innerHTML = portfolioData.logo.map(createStandardCard).join("");
  bindJournalClicks(journalGrid);
}

renderAllPortfolios();

const pdfModal = document.getElementById("pdfModal");
const pdfTitle = document.getElementById("pdfTitle");
const pdfPageInfo = document.getElementById("pdfPageInfo");
const pdfCanvas = document.getElementById("pdfCanvas");
const pdfPrev = document.getElementById("pdfPrev");
const pdfNext = document.getElementById("pdfNext");
const pdfClose = document.getElementById("pdfClose");

let pdfDoc = null;
let pdfPageNum = 1;
let pdfRendering = false;
let pdfPendingPage = null;
let pdfScale = 1.2;
let pdfUrlCurrent = "";

function ensurePdfJsWorker() {
  if (!window.pdfjsLib) return false;
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js";
  }
  return true;
}

function setModalOpen(open) {
  pdfModal.setAttribute("aria-hidden", open ? "false" : "true");
  document.body.style.overflow = open ? "hidden" : "";
}

async function renderPdfPage(num) {
  if (!pdfDoc) return;
  pdfRendering = true;
  const page = await pdfDoc.getPage(num);

  const viewport = page.getViewport({ scale: pdfScale });
  const context = pdfCanvas.getContext("2d");
  pdfCanvas.height = viewport.height;
  pdfCanvas.width = viewport.width;

  const renderContext = { canvasContext: context, viewport };
  const renderTask = page.render(renderContext);
  await renderTask.promise;

  pdfRendering = false;
  if (pdfPendingPage !== null) {
    const next = pdfPendingPage;
    pdfPendingPage = null;
    await renderPdfPage(next);
  }
}

function queueRenderPdfPage(num) {
  if (pdfRendering) {
    pdfPendingPage = num;
    return;
  }
  renderPdfPage(num);
}

function updatePdfControls() {
  if (!pdfDoc) return;
  pdfPageInfo.textContent = `第 ${pdfPageNum} / ${pdfDoc.numPages} 页`;
  pdfPrev.disabled = pdfPageNum <= 1;
  pdfNext.disabled = pdfPageNum >= pdfDoc.numPages;
}

async function openPdfModal(url, title) {
  if (!ensurePdfJsWorker()) {
    alert("PDF 预览组件加载失败，请检查网络或稍后重试。");
    return;
  }
  const pdfUrl = normalizeAssetUrl(url);
  pdfUrlCurrent = pdfUrl;
  pdfTitle.textContent = title;
  setModalOpen(true);

  try {
    const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
    pdfDoc = await loadingTask.promise;
    pdfPageNum = 1;
    updatePdfControls();
    await renderPdfPage(pdfPageNum);
  } catch (e) {
    pdfDoc = null;
    pdfCanvas.width = 1;
    pdfCanvas.height = 1;
    pdfPageInfo.textContent = "加载失败";
  }
}

function closePdfModal() {
  setModalOpen(false);
  pdfDoc = null;
  pdfPageNum = 1;
  pdfPendingPage = null;
  pdfRendering = false;
  pdfUrlCurrent = "";
}

pdfPrev.addEventListener("click", () => {
  if (!pdfDoc || pdfPageNum <= 1) return;
  pdfPageNum -= 1;
  updatePdfControls();
  queueRenderPdfPage(pdfPageNum);
});

pdfNext.addEventListener("click", () => {
  if (!pdfDoc || pdfPageNum >= pdfDoc.numPages) return;
  pdfPageNum += 1;
  updatePdfControls();
  queueRenderPdfPage(pdfPageNum);
});

pdfClose.addEventListener("click", closePdfModal);

pdfModal.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.dataset && target.dataset.close === "true") {
    closePdfModal();
  }
});

window.addEventListener("keydown", (e) => {
  if (pdfModal.getAttribute("aria-hidden") !== "false") return;
  if (e.key === "Escape") closePdfModal();
  if (e.key === "ArrowLeft") pdfPrev.click();
  if (e.key === "ArrowRight") pdfNext.click();
});

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 420) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".fade-in-section").forEach((section) => {
  observer.observe(section);
});
