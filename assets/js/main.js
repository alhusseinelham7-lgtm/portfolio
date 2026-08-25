(async () => {
  // The loader must never depend on Supabase/network timing.
  const hideInitialLoader = () => document.querySelector(".loader")?.classList.add("hide");
  if (document.readyState === "complete") {
    setTimeout(hideInitialLoader, 180);
  } else {
    window.addEventListener("load", () => setTimeout(hideInitialLoader, 180), { once:true });
  }
  // Absolute fallback: even with a failed/slow request, never trap the visitor.
  setTimeout(hideInitialLoader, 4200);

  const cms = await loadCMS({ publicOnly: true });

  // If the window load event happened while awaiting Supabase, hide it now.
  if (document.readyState === "complete") setTimeout(hideInitialLoader, 80);
  const $ = (s,p=document) => p.querySelector(s);
  const $$ = (s,p=document) => [...p.querySelectorAll(s)];
  const site = cms.site || {};
  const bind = (s,v) => { const e=$(s); if(e && v !== undefined && v !== null) e.textContent=v; };

  Object.entries({
    "[data-brand]":site.brandName,"[data-role]":site.role,"[data-hero1]":site.hero1,
    "[data-hero2]":site.hero2,"[data-hero3]":site.hero3,"[data-hero-copy]":site.heroDescription,
    "[data-tag1]":site.heroTag1,"[data-tag2]":site.heroTag2,"[data-branding-title]":site.brandingTitle,
    "[data-branding-text]":site.brandingText,"[data-carousel-title]":site.carouselTitle,
    "[data-carousel-text]":site.carouselText,"[data-about-title]":site.aboutTitle,
    "[data-about-text]":site.aboutText,"[data-service1]":site.service1,"[data-service2]":site.service2,
    "[data-service3]":site.service3,"[data-contact-title]":site.contactTitle,
    "[data-contact-text]":site.contactText,"[data-contact-button]":site.contactButton
  }).forEach(([s,v])=>bind(s,v));
  bind("[data-nav-branding]",site.navBranding); bind("[data-nav-carousels]",site.navCarousels);
  bind("[data-nav-about]",site.navAbout); bind("[data-nav-contact]",site.navContact);
  $$("[data-contact-link]").forEach(a=>a.href="mailto:"+(site.contactEmail||"hello@example.com"));


  // SEO: update metadata from actual content instead of keyword stuffing.
  const siteUrl=(site.siteUrl||location.origin+location.pathname).replace(/\/?$/,"/");
  function setMeta(name,content,property=false){
    if(!content)return;
    const key=property?"property":"name";
    let el=document.head.querySelector(`meta[${key}="${name}"]`);
    if(!el){el=document.createElement("meta");el.setAttribute(key,name);document.head.appendChild(el);}
    el.setAttribute("content",content);
  }
  function setCanonical(url){
    let el=document.head.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement("link");el.rel="canonical";document.head.appendChild(el);}
    el.href=url;
  }
  function addStructuredData(obj,id="site-schema"){
    let s=document.getElementById(id);
    if(!s){s=document.createElement("script");s.type="application/ld+json";s.id=id;document.head.appendChild(s);}
    s.textContent=JSON.stringify(obj);
  }
  document.title=site.seoTitle||document.title;
  setMeta("description",site.seoDescription);
  setMeta("robots","index,follow,max-image-preview:large");
  setMeta("og:title",site.seoTitle||document.title,true);
  setMeta("og:description",site.seoDescription||"",true);
  setMeta("og:type","website",true);
  setMeta("og:locale","ar_AR",true);
  setCanonical(siteUrl);
  addStructuredData({
    "@context":"https://schema.org",
    "@type":"Person",
    "name":site.ownerName||site.brandName||"مصمم بصري",
    "url":siteUrl,
    "jobTitle":site.role||"مصمم بصري ومدير فني",
    "knowsAbout":["الهوية البصرية","التصميم التحريري","الإعلانات","الدمج البصري","تصميم السوشال ميديا","الإدارة الفنية"]
  });

  // GA4 loads only after you add a valid G-XXXX ID in Admin/Supabase settings.
  if(/^G-[A-Z0-9]+$/i.test(site.gaMeasurementId||"")){
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    const g=document.createElement("script");g.async=true;g.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(site.gaMeasurementId)}`;
    document.head.appendChild(g);
    gtag("js",new Date());gtag("config",site.gaMeasurementId,{anonymize_ip:true});
  }

  const mobile = matchMedia("(max-width:900px)").matches;
  const coarse = matchMedia("(pointer:coarse)").matches;
  const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;

  if (document.readyState === "complete") setTimeout(hideInitialLoader, 80);

  // Lightweight cursor: only updates when the mouse actually moves.
  const cursor=$(".custom-cursor"), label=$(".cursor-label");
  if(cursor && !mobile && !coarse && !document.body.classList.contains("admin-body")){
    document.documentElement.classList.add("custom-pointer");
    let pending=false, mx=0, my=0;
    addEventListener("mousemove",e=>{
      mx=e.clientX; my=e.clientY;
      if(!pending){
        pending=true;
        requestAnimationFrame(()=>{
          cursor.style.transform=`translate3d(${mx-12}px,${my-12}px,0)`;
          if(label) label.style.transform=`translate3d(${mx+18}px,${my+18}px,0)`;
          pending=false;
        });
      }
    },{passive:true});
    const refreshCursor=()=>$$("a,button,[data-hover-label]").forEach(el=>{
      if(el.dataset.cursorBound)return;
      el.dataset.cursorBound="1";
      el.addEventListener("mouseenter",()=>{
        cursor.classList.add("active");
        if(el.dataset.hoverLabel&&label){label.textContent=el.dataset.hoverLabel;label.classList.add("show")}
      });
      el.addEventListener("mouseleave",()=>{cursor.classList.remove("active");label?.classList.remove("show")});
    });
    window.refreshCursor=refreshCursor; refreshCursor();
  }

  if(!reduced){
    const io=new IntersectionObserver(entries=>{
      for(const e of entries) if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}
    },{threshold:.08,rootMargin:"0px 0px -30px 0px"});
    $$(".reveal").forEach(e=>io.observe(e));
  } else {
    $$(".reveal").forEach(e=>e.classList.add("visible"));
  }

  // Magnetic effect only on a few small controls.
  if(!mobile&&!coarse&&!reduced){
    $$(".magnetic").forEach(el=>{
      let pending=false,x=0,y=0;
      el.addEventListener("mousemove",e=>{
        const r=el.getBoundingClientRect();
        x=(e.clientX-r.left-r.width/2)*.11; y=(e.clientY-r.top-r.height/2)*.11;
        if(!pending){pending=true;requestAnimationFrame(()=>{el.style.transform=`translate3d(${x}px,${y}px,0)`;pending=false;});}
      },{passive:true});
      el.addEventListener("mouseleave",()=>el.style.transform="");
    });
  }

  const wipe=$(".page-wipe");
  const bindTransitions=()=>$$("a[data-transition]").forEach(a=>{
    if(a.dataset.wipeBound)return;
    a.dataset.wipeBound="1";
    a.addEventListener("click",e=>{
      const h=a.getAttribute("href");
      if(!h||h.startsWith("#")||h.startsWith("mailto")||e.metaKey||e.ctrlKey)return;
      e.preventDefault(); wipe?.classList.add("go"); setTimeout(()=>location.href=h,300);
    });
  });
  window.bindTransitions=bindTransitions;

  const visibleProjects=()=>cms.projects.filter(p=>p.published!==false).sort((a,b)=>(a.order||99)-(b.order||99));
  const projectURL=p=>`project.html?id=${encodeURIComponent(p.id)}`;

  const brandingFeature=$("[data-branding-feature]");
  if(brandingFeature){
    const p=visibleProjects().find(x=>x.type==="branding");
    if(p) brandingFeature.innerHTML=`<div class="branding-image"><img src="${p.cover}" alt="${p.title}" decoding="async" fetchpriority="high"></div>
      <a class="branding-copy" href="${projectURL(p)}" data-transition data-hover-label="عرض المشروع">
        <div><div class="kicker">${p.category||""} / ${p.year||""}</div><h3>${p.title}</h3><p>${p.short||""}</p></div>
        <div class="feature-link"><span>شوف المشروع كامل</span><span>←</span></div>
      </a>`;
  }

  const visualGrid=$("[data-visual-grid]");
  const visualFilters=$("[data-visual-filters]");
  const visualCount=$("[data-visual-count]");
  const visualMore=$("[data-visual-more]");
  let visualLimit=12;
  let activeFilter="الكل";

  function visualProjects(){
    return visibleProjects().filter(p => (p.section || (p.type==="branding"?"branding":"visual")) === "visual");
  }
  function categories(){ return ["الكل","كاروسيلات","إعلانات"]; }
  function renderVisualGrid(){
    if(!visualGrid)return;
    const all=visualProjects();
    const filtered=activeFilter==="الكل"?all:all.filter(p=>(p.workType||"كاروسيلات")===activeFilter);
    const shown=filtered.slice(0,visualLimit);
    visualGrid.innerHTML=shown.map((p,i)=>{const preview=(p.workType||"كاروسيلات")==="كاروسيلات"?(p.images?.[0]||p.cover):p.cover;return `<a class="visual-card" href="${projectURL(p)}" data-transition data-hover-label="${p.title}">
      <img src="${preview}" alt="${p.title} — ${p.workType||"كاروسيلات"}" loading="${i<6?'eager':'lazy'}" decoding="async">
      <div class="visual-card-overlay"><div class="visual-card-copy"><h3>${p.title}</h3><p>${p.workType||""} ${p.year?`— ${p.year}`:""}</p></div></div>
    </a>`}).join("");
    if(visualCount)visualCount.textContent=`${filtered.length} مشروع`;
    if(visualMore){
      visualMore.hidden=shown.length>=filtered.length;
      visualMore.onclick=()=>{visualLimit+=12;renderVisualGrid();bindTransitions();window.refreshCursor?.();};
    }
    bindTransitions();window.refreshCursor?.();
  }
  if(visualGrid){
    if(visualFilters){
      visualFilters.innerHTML=categories().map((c,i)=>`<button class="visual-filter ${i===0?"active":""}" data-filter="${c}">${c}</button>`).join("");
      $$("[data-filter]",visualFilters).forEach(btn=>btn.onclick=()=>{
        activeFilter=btn.dataset.filter;visualLimit=12;
        $$("[data-filter]",visualFilters).forEach(x=>x.classList.toggle("active",x===btn));
        renderVisualGrid();
      });
    }
    renderVisualGrid();
  }

  function row(p,i){return `<a class="archive-row" href="${projectURL(p)}" data-transition data-hover-label="عرض">
    <span>${String(i+1).padStart(2,"0")}</span><h3>${p.title}</h3>
    <span class="hide-mobile">${p.category||""}</span><span class="hide-mobile">${p.year||""}</span></a>`}
  const bList=$("[data-branding-list]"); if(bList)bList.innerHTML=visibleProjects().filter(p=>p.type==="branding").map(row).join("");

  const detail=$("[data-project-detail]");
  if(detail){
    const id=new URLSearchParams(location.search).get("id");
    const p=cms.projects.find(x=>x.id===id)||visibleProjects()[0];
    if(p){
      document.title=`${p.title} — ${site.brandName||"معرض الأعمال"}`;
      const projectCanonical=`${siteUrl}project.html?id=${encodeURIComponent(p.id)}`;
      setMeta("description",p.short||p.intro||site.seoDescription);
      setMeta("og:title",document.title,true);
      setMeta("og:description",p.short||p.intro||"",true);
      setMeta("og:image",p.cover,true);
      setMeta("og:type","article",true);
      setCanonical(projectCanonical);
      addStructuredData({
        "@context":"https://schema.org",
        "@type":"CreativeWork",
        "name":p.title,
        "description":p.short||p.intro||"",
        "image":p.cover,
        "dateCreated":p.year||undefined,
        "creator":{"@type":"Person","name":site.ownerName||site.brandName||"مصمم بصري"},
        "url":projectCanonical,
        "keywords":[p.workType,p.category,"تصميم بصري","Art Direction"].filter(Boolean)
      },"project-schema");
      bind("[data-project-eyebrow]",p.eyebrow||p.category); bind("[data-project-year]",p.year);
      bind("[data-project-title]",p.title); bind("[data-project-intro]",p.intro||p.short);
      bind("[data-project-role]",p.role); bind("[data-project-services]",p.services);
      const cover=$("[data-project-cover]"),coverWrap=cover?.closest(".project-cover");
      if(p.type==="branding" || p.section==="branding"){
        if(cover){cover.src=p.cover;cover.alt=p.title}
      }else{
        coverWrap?.remove();
      }
      const sections=$("[data-project-sections]");
      if(sections)sections.innerHTML=(p.sections||[]).map(s=>`<section class="project-section"><div class="container project-copy">
        <div class="label">${s.label||""}</div><div><h2>${s.title||""}</h2><p>${s.text||""}</p></div></div></section>`).join("");
      const gallery=$("[data-project-gallery]"), viewer=$("[data-slide-viewer]");
      if(p.type==="branding" || p.section==="branding"){
  viewer?.remove();

  if(gallery){
    gallery.className = "branding-gallery";
    gallery.innerHTML = (p.images || []).map((im,i)=>`
      <img
        src="${im}"
        alt="${p.title} ${i+1}"
        loading="${i<3 ? "eager" : "lazy"}"
        decoding="async"
      >
    `).join("");
  }

} else {

  gallery?.remove();

  if(viewer){
    viewer.className = "project-slides-grid";

    viewer.innerHTML = (p.images || []).map((im,i)=>`
      <figure class="project-slide-card">
        <img
          src="${im}"
          alt="${p.title} — الشريحة ${i+1}"
          loading="${i<6 ? "eager" : "lazy"}"
          decoding="async"
        >
        <figcaption class="project-slide-index">
          ${String(i+1).padStart(2,"0")}
        </figcaption>
      </figure>
    `).join("");
  }

}
      
      const all=visibleProjects(), idx=all.findIndex(x=>x.id===p.id), next=all[(idx+1)%all.length], na=$("[data-next-project]");
      if(na){na.textContent=`التالي: ${next.title} ←`;na.href=projectURL(next)}
    }
  }

  bindTransitions(); window.refreshCursor?.();
})();
