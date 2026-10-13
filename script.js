/**
 * ==============================================================================
 * DÍA DE MUERTOS EN MÉXICO - LÓGICA INTERACTIVA Y NAVEGACIÓN
 * Universidad Bancaria de México | LIAF1001
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCarousel();
  initPetalsEffect();
  initImageModal();
  initScrollTop();
  initDynamicYear();
  initSearchSystem();
});

/* ==============================================================================
 * 1. NAVEGACIÓN ENTRE PÁGINAS (VISTAS DINÁMICAS Y ENLACES)
 * ============================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const pageViews = document.querySelectorAll('.page-view');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  // Función para cambiar de página
  function switchPage(targetId) {
    if (!targetId) return;

    // Actualizar botones de navegación
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar vista visible
    pageViews.forEach(view => {
      if (view.id === targetId) {
        view.classList.add('active-view');
      } else {
        view.classList.remove('active-view');
      }
    });

    // Cerrar menú móvil si está abierto
    if (navLinks && navLinks.classList.contains('mobile-open')) {
      navLinks.classList.remove('mobile-open');
      if (mobileToggle) mobileToggle.classList.remove('active');
    }

    // Scroll suave hacia el inicio del contenido
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Actualizar hash de URL sin recargar
    if (window.location.hash !== `#${targetId}`) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  // Exponer para el buscador global
  window.switchPage = switchPage;

  // Eventos de clic en botones de navegación
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      switchPage(targetId);
    });
  });

  // Botón del logo (conduce a Inicio)
  const brandLogo = document.getElementById('brand-logo-btn');
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage('inicio');
    });
  }

  // Soporte para menú móvil hamburguesa
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
    });

    // Cerrar al hacer clic fuera del menú móvil
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target) && navLinks.classList.contains('mobile-open')) {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
      }
    });
  }

  // Cargar sección según el hash de la URL (soporte de recarga y enlaces directos)
  const currentHash = window.location.hash.replace('#', '');
  if (currentHash && document.getElementById(currentHash)) {
    switchPage(currentHash);
  } else {
    switchPage('inicio');
  }

  // Escuchar botón de atrás/adelante del navegador
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'inicio';
    if (document.getElementById(hash)) {
      switchPage(hash);
    }
  });
}

/* ==============================================================================
 * 2. CARRUSEL DE IMÁGENES REALES (PÁGINA PRINCIPAL)
 * ============================================================================== */
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicatorsContainer = document.getElementById('carousel-indicators');
  const carouselContainer = document.querySelector('.carousel-container');

  if (!slides.length || !indicatorsContainer) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const slideCount = slides.length;

  // Generar puntos indicadores dinámicamente
  indicatorsContainer.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Ir a foto ${idx + 1}`);
    dot.addEventListener('click', () => goToSlide(idx));
    indicatorsContainer.appendChild(dot);
  });

  const dots = indicatorsContainer.querySelectorAll('.indicator-dot');

  function updateSlideClasses() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active-slide', idx === currentIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateSlideClasses();
    resetAutoplay();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Autoplay cada 5 segundos
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pausar al pasar el ratón sobre el carrusel
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoplay);
    carouselContainer.addEventListener('mouseleave', startAutoplay);

    // Soporte para gestos táctiles (Swipe en móviles)
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });

    function handleGesture() {
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
  }

  // Teclas de flecha izquierda/derecha
  document.addEventListener('keydown', (e) => {
    const inicioView = document.getElementById('inicio');
    if (inicioView && inicioView.classList.contains('active-view')) {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
  });

  startAutoplay();
}

/* ==============================================================================
 * 3. EFECTO FLOTANTE DE PÉTALOS DE CEMPASÚCHIL
 * ============================================================================== */
function initPetalsEffect() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  const petalCount = 12; // Cantidad óptima y ligera para gran rendimiento

  for (let i = 0; i < petalCount; i++) {
    createPetal(container);
  }
}

function createPetal(container) {
  const petal = document.createElement('div');
  petal.className = 'petal';

  const size = Math.random() * 12 + 10; // 10px a 22px
  const left = Math.random() * 100; // 0% a 100% de ancho
  const duration = Math.random() * 8 + 6; // 6s a 14s
  const delay = Math.random() * 5; // 0s a 5s

  petal.style.width = `${size}px`;
  petal.style.height = `${size * 0.75}px`;
  petal.style.left = `${left}%`;
  petal.style.animationDuration = `${duration}s`;
  petal.style.animationDelay = `${delay}s`;

  container.appendChild(petal);
}

/* ==============================================================================
 * 4. MODAL / LIGHTBOX PARA AMPLIAR IMÁGENES
 * ============================================================================== */
function initImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  if (!modal || !modalImg) return;

  // Hacer clickeables todas las imágenes con clase inspectable
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.inspectable-img');
    if (target) {
      const src = target.getAttribute('src');
      const alt = target.getAttribute('alt') || 'Fotografía de Día de Muertos';
      modalImg.src = src;
      modalCaption.textContent = alt;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==============================================================================
 * 5. BOTÓN FLOTANTE "VOLVER ARRIBA"
 * ============================================================================== */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==============================================================================
 * 6. AÑO DINÁMICO EN EL PIE DE PÁGINA
 * ============================================================================== */
function initDynamicYear() {
  const yearElement = document.getElementById('year-span');
  if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
  }
}

/* ==============================================================================
 * 7. SISTEMA DE BÚSQUEDA INTERACTIVA EN EL SITIO
 * ============================================================================== */
function initSearchSystem() {
  const searchInput = document.getElementById('site-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchActionBtn = document.getElementById('search-action-btn');
  const searchResultsDropdown = document.getElementById('search-results-dropdown');
  const searchContainer = document.getElementById('search-container');

  if (!searchInput || !searchResultsDropdown) return;

  // Catálogo detallado de contenidos indexados para la búsqueda
  const searchData = [
    {
      title: 'El Origen Prehispánico y Mestizo',
      page: 'inicio',
      icon: '🏵️',
      badge: 'Inicio',
      targetSelector: '#inicio .cultural-card:nth-child(1)',
      snippet: 'Culto a Mictecacíhuatl, el Mictlán prehispánico y la unión con Todos los Santos.',
      keywords: ['origen', 'prehispanico', 'mestizo', 'mictlan', 'mictecacihuatl', 'historia', 'aztecas', 'mexicas', 'unesco', 'sincretismo']
    },
    {
      title: '¿Cómo se Celebra en México?',
      page: 'inicio',
      icon: '🎺',
      badge: 'Inicio',
      targetSelector: '#inicio .cultural-card:nth-child(2)',
      snippet: 'Velaciones nocturnas en panteones, música, alegría familiar y ofrendas.',
      keywords: ['celebracion', 'como se celebra', 'velacion', 'panteones', 'cementerios', 'mariachi', 'fiesta', 'janitzio', 'mixquic', 'tumbas']
    },
    {
      title: 'Galería y Carrusel de Fotografías Reales',
      page: 'inicio',
      icon: '📸',
      badge: 'Inicio',
      targetSelector: '.carousel-showcase',
      snippet: 'Fotos reales que capturan la mística de los panteones, altares y desfiles.',
      keywords: ['carrusel', 'fotos', 'fotografias', 'imagenes', 'galeria', 'panteon iluminado', 'desfile']
    },
    {
      title: 'Niveles del Altar (2, 3 y 7 escalones)',
      page: 'altar',
      icon: '🪜',
      badge: 'Altar',
      targetSelector: '.altar-levels-overview',
      snippet: 'Estructura ceremonial: cielo, tierra, purgatorio y los 7 pasos del Mictlán.',
      keywords: ['niveles', 'escalones', 'altar', 'ofrenda', 'estructura', 'purgatorio', 'cielo y tierra', '7 niveles', 'escalon']
    },
    {
      title: 'Velas y Veladoras',
      page: 'altar',
      icon: '🕯️',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(1)',
      snippet: 'La luz, fe y esperanza que ilumina el sendero para que las ánimas no se pierdan.',
      keywords: ['velas', 'veladoras', 'luz', 'fuego', 'sendero', 'esperanza', 'cirios', 'flama']
    },
    {
      title: 'Flor de Cempasúchil',
      page: 'altar',
      icon: '🌼',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(2)',
      snippet: 'Cempohualxochitl: aroma y color solar que marca el camino de vuelta al hogar.',
      keywords: ['cempasuchil', 'flor', 'flores', 'cempohualxochitl', 'aroma', 'petalos', 'amarillo', 'naranja']
    },
    {
      title: 'Fotografías de los Difuntos',
      page: 'altar',
      icon: '🖼️',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(3)',
      snippet: 'Colocadas en la cúspide para recordar y honrar el legado de los ancestros.',
      keywords: ['fotos', 'fotografias', 'difuntos', 'antepasados', 'seres queridos', 'memoria', 'cuadro', 'retrato']
    },
    {
      title: 'Papel Picado Mexicano',
      page: 'altar',
      icon: '🎏',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(4)',
      snippet: 'Representa el viento y la alegría festiva que anuncia la llegada de las almas.',
      keywords: ['papel picado', 'viento', 'adorno', 'colores', 'alegria', 'mexicano', 'artesania']
    },
    {
      title: 'Agua Pura y Sal',
      page: 'altar',
      icon: '💧',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(5)',
      snippet: 'Calma la sed del alma tras su viaje y purifica el espíritu para su retorno.',
      keywords: ['agua', 'sal', 'sed', 'purificacion', 'vaso de agua', 'plato con sal']
    },
    {
      title: 'Copal e Incienso',
      page: 'altar',
      icon: '💨',
      badge: 'Altar',
      targetSelector: '#altar .elements-grid .element-item:nth-child(6)',
      snippet: 'Resina aromática sagrada que limpia malas energías y consagra el hogar.',
      keywords: ['copal', 'incienso', 'humo', 'resina', 'purificar', 'sahumador', 'limpieza']
    },
    {
      title: 'Significado de los Colores del Altar',
      page: 'altar',
      icon: '🎨',
      badge: 'Altar',
      targetSelector: '.colors-significance',
      snippet: 'Naranja (luz solar), rosa mexicano (fiesta), morado (duelo) y blanco (pureza).',
      keywords: ['colores', 'significado', 'morado', 'duelo', 'rosa mexicano', 'blanco', 'naranja cempasuchil']
    },
    {
      title: 'La Catrina Mexicana',
      page: 'catrinas',
      icon: '🌹',
      badge: 'Catrinas',
      targetSelector: '#catrinas .dual-portrait-showcase .character-card:nth-child(1)',
      snippet: 'Dama de la eternidad: maquillaje de calavera, cuencas florales y vestido de gala.',
      keywords: ['catrina', 'catrinas', 'maquillaje', 'vestuario', 'flores', 'sombrero', 'corona', 'mujer']
    },
    {
      title: 'El Catrín (El Caballero Calavera)',
      page: 'catrinas',
      icon: '🎩',
      badge: 'Catrinas',
      targetSelector: '#catrinas .dual-portrait-showcase .character-card:nth-child(2)',
      snippet: 'Contraparte masculina elegante: frac, esmoquin, traje de charro, bastón y sombrero.',
      keywords: ['catrin', 'catrines', 'hombre', 'traje', 'charro', 'baston', 'sombrero de copa', 'dandi']
    },
    {
      title: 'Origen: José Guadalupe Posada y Diego Rivera',
      page: 'catrinas',
      icon: '📜',
      badge: 'Catrinas',
      targetSelector: '.history-origin-box',
      snippet: 'De la Calavera Garbancera satírica al icónico mural en la Alameda Central.',
      keywords: ['posada', 'jose guadalupe posada', 'diego rivera', 'garbancera', 'historia', 'mural', 'arte', 'satira']
    },
    {
      title: 'Calaveras Tradicionales de Azúcar',
      page: 'calaveras',
      icon: '💀',
      badge: 'Calaveritas',
      targetSelector: '#calaveras .skulls-grid .skull-variety-card:nth-child(1)',
      snippet: 'Técnica de alfeñique colonial con papel estaño en la frente para escribir el nombre.',
      keywords: ['calaveras', 'calaveritas', 'azucar', 'alfeñique', 'estaño', 'frente', 'nombre', 'toluca', 'dulce']
    },
    {
      title: 'Calaveras de Chocolate y Cacao',
      page: 'calaveras',
      icon: '🍫',
      badge: 'Calaveritas',
      targetSelector: '#calaveras .skulls-grid .skull-variety-card:nth-child(2)',
      snippet: 'Variedad de chocolate amargo o con leche aromatizado con canela y vainilla.',
      keywords: ['chocolate', 'cacao', 'dulce', 'calaveras de chocolate', 'oaxaca', 'tabasco']
    },
    {
      title: 'Calaveras de Amaranto (Alegrías)',
      page: 'calaveras',
      icon: '🌾',
      badge: 'Calaveritas',
      targetSelector: '#calaveras .skulls-grid .skull-variety-card:nth-child(3)',
      snippet: 'Grano sagrado mexica mezclado con miel virgen o piloncillo en moldes de calavera.',
      keywords: ['amaranto', 'alegria', 'miel', 'piloncillo', 'tulyehualco', 'xochimilco', 'grano sagrado']
    },
    {
      title: 'Pan de Muerto y su Anatomía',
      page: 'pan',
      icon: '🍞',
      badge: 'Pan',
      targetSelector: '.pan-anatomy-card',
      snippet: 'Forma circular (ciclo vital), coronilla (cráneo) y cuatro canillas (huesos y lágrimas).',
      keywords: ['pan', 'pan de muerto', 'anatomia', 'simbolismo', 'craneo', 'canillas', 'huesitos', 'azahar']
    },
    {
      title: 'Variedades Regionales de Pan de Muerto',
      page: 'pan',
      icon: '🥐',
      badge: 'Pan',
      targetSelector: '.pan-varieties-grid',
      snippet: 'Azúcar clásica, ajonjolí (Puebla), pan de yema con carita (Oaxaca) y golletes rosas.',
      keywords: ['variedades', 'ajonjoli', 'puebla', 'pan de yema', 'oaxaca', 'carita', 'golletes', 'azucar rosa']
    }
  ];

  // Normalizar texto (elimina acentos y pasa a minúsculas)
  function normalizeText(text) {
    return text.toString().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Resaltar coincidencias en texto
  function highlightMatches(text, query) {
    if (!query) return text;
    const cleanQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${cleanQuery})`, 'gi');
    return text.replace(regex, '<mark class="search-match-text">$1</mark>');
  }

  // Ejecutar búsqueda y mostrar resultados
  function performSearch() {
    const rawQuery = searchInput.value;
    const query = normalizeText(rawQuery);

    if (searchClearBtn) {
      searchClearBtn.style.display = rawQuery.length > 0 ? 'flex' : 'none';
    }

    if (!query) {
      searchResultsDropdown.innerHTML = '';
      searchResultsDropdown.style.display = 'none';
      return;
    }

    // Filtrar coincidencias
    const results = searchData.filter(item => {
      const titleClean = normalizeText(item.title);
      const snippetClean = normalizeText(item.snippet);
      const keywordsMatch = item.keywords.some(k => normalizeText(k).includes(query));
      return titleClean.includes(query) || snippetClean.includes(query) || keywordsMatch;
    });

    if (results.length === 0) {
      searchResultsDropdown.innerHTML = `
        <div class="search-no-results">
          <div class="search-no-results-icon">🔎</div>
          <p><strong>Sin coincidencias directas para "${rawQuery}"</strong></p>
          <p style="font-size: 0.8rem; margin-top: 0.3rem;">Prueba con: <em>Altar, Cempasúchil, Catrina, Pan, Velas, Azúcar...</em></p>
        </div>
      `;
      searchResultsDropdown.style.display = 'block';
      return;
    }

    // Renderizar resultados encontrados
    searchResultsDropdown.innerHTML = results.map((item, index) => `
      <div class="search-result-item" data-index="${index}" role="option" tabindex="0">
        <span class="result-icon">${item.icon}</span>
        <div class="result-info">
          <div class="result-header">
            <span class="result-title">${highlightMatches(item.title, rawQuery)}</span>
            <span class="result-badge">${item.badge}</span>
          </div>
          <p class="result-snippet">${highlightMatches(item.snippet, rawQuery)}</p>
        </div>
      </div>
    `).join('');

    searchResultsDropdown.style.display = 'block';

    // Asignar eventos de clic a cada resultado
    const itemElements = searchResultsDropdown.querySelectorAll('.search-result-item');
    itemElements.forEach((el, index) => {
      el.addEventListener('click', () => {
        selectSearchResult(results[index]);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          selectSearchResult(results[index]);
        }
      });
    });
  }

  // Navegar al elemento seleccionado
  function selectSearchResult(item) {
    if (!item) return;

    // Cambiar de vista usando la función global
    if (typeof window.switchPage === 'function') {
      window.switchPage(item.page);
    }

    // Cerrar buscador
    searchResultsDropdown.style.display = 'none';

    // Desplazar suavemente hasta el elemento en la página
    setTimeout(() => {
      const targetElement = document.querySelector(item.targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('search-target-highlight');
        setTimeout(() => {
          targetElement.classList.remove('search-target-highlight');
        }, 2600);
      }
    }, 280);
  }

  // Eventos de entrada
  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
      performSearch();
    }
  });

  // Botón limpiar
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      searchResultsDropdown.innerHTML = '';
      searchResultsDropdown.style.display = 'none';
      searchInput.focus();
    });
  }

  // Botón de acción buscar
  if (searchActionBtn) {
    searchActionBtn.addEventListener('click', () => {
      const firstItem = searchResultsDropdown.querySelector('.search-result-item');
      if (firstItem) {
        firstItem.click();
      } else {
        performSearch();
        searchInput.focus();
      }
    });
  }

  // Soporte de tecla Enter en el input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const firstItem = searchResultsDropdown.querySelector('.search-result-item');
      if (firstItem) {
        firstItem.click();
      }
    } else if (e.key === 'Escape') {
      searchResultsDropdown.style.display = 'none';
    }
  });

  // Cerrar desplegable al hacer clic fuera del buscador
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      searchResultsDropdown.style.display = 'none';
    }
  });
}
