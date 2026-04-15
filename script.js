const portfolioData = {
  journal: [
    {
      title: "《求真》第一期",
      pdf: "./assets/journals/《求真》第一期.pdf",
      cover: "./assets/journals/cover-qiuzhen-1.jpg"
    },
    {
      title: "《求真》第二期",
      pdf: "./assets/journals/《求真》第二期.pdf",
      cover: "./assets/journals/cover-qiuzhen-2.png"
    },
    {
      title: "《求真》第三期",
      pdf: "./assets/journals/《求真》第三期.pdf",
      cover: "./assets/journals/cover-qiuzhen-3.png"
    },
    {
      title: "《求真》第四期",
      pdf: "./assets/journals/《求真》第四期.pdf",
      cover: "./assets/journals/cover-qiuzhen-4.jpg"
    },
    {
      title: "班刊集萃",
      pdf: "./assets/journals/班刊集萃.pdf",
      cover: "./assets/journals/cover-banji-jicui.png"
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
          <img class="journal-cover-image" src="${coverUrl}" alt="${item.title} 封面" />
        </div>
        <div class="journal-meta">
          <span>${item.title}</span>
          <span class="journal-hint">点击展开在线预览</span>
        </div>
      </button>
      <div class="journal-preview" aria-hidden="true">
        <div class="journal-preview-head">
          <strong>${item.title}</strong>
          <button type="button" class="journal-preview-close" aria-label="关闭预览">关闭</button>
        </div>
        <div class="journal-preview-pages"></div>
      </div>
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
    btn.addEventListener("click", async () => {
      const pdf = btn.dataset.pdf;
      const card = btn.closest(".journal-card");
      if (!pdf || !card) return;
      await toggleJournalPreview(card, pdf);
    });
  });

  scope.querySelectorAll(".journal-preview-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = closeBtn.closest(".journal-card");
      if (!card) return;
      closeJournalPreview(card);
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

function ensurePdfJsWorker() {
  if (!window.pdfjsLib) return false;
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js";
  }
  return true;
}

async function toggleJournalPreview(card, pdfUrl) {
  const preview = card.querySelector(".journal-preview");
  const pagesWrap = card.querySelector(".journal-preview-pages");
  if (!preview || !pagesWrap) return;

  const isOpen = card.classList.contains("expanded");
  if (isOpen) {
    closeJournalPreview(card);
    return;
  }

  document.querySelectorAll(".journal-card.expanded").forEach((otherCard) => {
    if (otherCard !== card) closeJournalPreview(otherCard);
  });

  card.classList.add("expanded");
  preview.setAttribute("aria-hidden", "false");

  if (pagesWrap.dataset.loaded === "true") return;
  if (!ensurePdfJsWorker()) {
    pagesWrap.innerHTML = '<p class="journal-preview-status">预览组件加载失败</p>';
    return;
  }

  pagesWrap.innerHTML = '<p class="journal-preview-status">页面加载中...</p>';
  try {
    const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
    const pdfDoc = await loadingTask.promise;
    pagesWrap.innerHTML = "";

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum += 1) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const targetWidth = 840;
      const scale = targetWidth / viewport.width;
      const renderViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.className = "journal-preview-page";
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvasContext: context, viewport: renderViewport }).promise;
      pagesWrap.appendChild(canvas);
    }

    pagesWrap.dataset.loaded = "true";
    await pdfDoc.destroy();
  } catch (error) {
    pagesWrap.innerHTML = '<p class="journal-preview-status">预览加载失败，请稍后重试。</p>';
  }
}

function closeJournalPreview(card) {
  const preview = card.querySelector(".journal-preview");
  if (!preview) return;
  card.classList.remove("expanded");
  preview.setAttribute("aria-hidden", "true");
}

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
