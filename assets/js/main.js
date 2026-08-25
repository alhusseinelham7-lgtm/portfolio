
const cms = getCMS();
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const bind=(sel,val)=>{const e=$(sel);if(e&&val!==undefined)e.textContent=val};
const site=cms.site||{};
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
$$("[data-contact-link]").forEach(a=>a.href="mailto:"+(site.contactEmail||"hello@example.com"));
bind("[data-nav-branding]",site.navBranding);bind("[data-nav-carousels]",site.navCarousels);bind("[data-nav-about]",site.navAbout);bind("[data-nav-contact]",site.navContact);

const mobile=matchMedia("(max-width:900px)").matches, reduced=matchMedia("(prefers-reduced-motion:reduce)").matches;
// loader
addEventListener("load",()=>setTimeout(()=>$(".loader")?.classList.add("hide"),420));
// cursor
const cursor=$(".custom-cursor"), label=$(".cursor-label");
if(cursor&&!mobile&&!document.body.classList.contains("admin-body")){
  document.documentElement.classList.add("custom-pointer");
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,lx=mx,ly=my;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;});
  const raf=()=>{cx+=(mx-cx)*.72;
cy+=(my-cy)*.72;;cursor.style.transform=`translate3d(${cx-12}px,${cy-12}px,0)`;label&&(label.style.transform=`translate3d(${mx+18}px,${my+18}px,0)`);requestAnimationFrame(raf)};raf();
  const refreshCursor=()=>$$("a,button,[data-hover-label]").forEach(el=>{
    if(el.dataset.cursorBound)return;el.dataset.cursorBound="1";
    el.addEventListener("mouseenter",()=>{cursor.classList.add("active");if(el.dataset.hoverLabel&&label){label.textContent=el.dataset.hoverLabel;label.classList.add("show")}});
    el.addEventListener("mouseleave",()=>{cursor.classList.remove("active");label?.classList.remove("show")});
  });window.refreshCursor=refreshCursor;refreshCursor();
}
// reveals
if(!reduced){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});
  $$(".reveal").forEach(e=>io.observe(e));
}

// magnetic
if(!mobile&&!reduced){
  $$(".magnetic").forEach(el=>{
    el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate3d(${x*.14}px,${y*.14}px,0)`});
    el.addEventListener("mouseleave",()=>el.style.transform="");
  });
}
// page wipe
const wipe=$(".page-wipe");
const bindTransitions=()=>$$("a[data-transition]").forEach(a=>{if(a.dataset.wipeBound)return;a.dataset.wipeBound="1";a.addEventListener("click",e=>{const h=a.getAttribute("href");if(!h||h.startsWith("#")||h.startsWith("mailto")||e.metaKey||e.ctrlKey)return;e.preventDefault();wipe?.classList.add("go");setTimeout(()=>location.href=h,390)})});
window.bindTransitions=bindTransitions;bindTransitions();

const visibleProjects=()=>cms.projects.filter(p=>p.published).sort((a,b)=>(a.order||99)-(b.order||99));
function projectURL(p){return `project.html?id=${encodeURIComponent(p.id)}`}

// homepage branding
const brandingFeature=$("[data-branding-feature]");
if(brandingFeature){
  const p=visibleProjects().find(x=>x.type==="branding");
  if(p)brandingFeature.innerHTML=`<div class="branding-image"><img src="${p.cover}" alt="${p.title}" decoding="async"></div>
    <a class="branding-copy" href="${projectURL(p)}" data-transition data-hover-label="عرض المشروع">
      <div><div class="kicker">${p.category} / ${p.year}</div><h3>${p.title}</h3><p>${p.short||""}</p></div>
      <div class="feature-link"><span>شوف المشروع كامل</span><span>←</span></div>
    </a>`;
}
// homepage carousel cards
const strip=$("[data-carousel-strip]");
if(strip){
  const arr=visibleProjects().filter(p=>p.type==="carousel");
  strip.innerHTML=arr.map((p,i)=>`<a class="carousel-card" href="${projectURL(p)}" data-transition data-hover-label="افتح الكاروسيل">
    <img src="${p.cover}" alt="${p.title}" loading="${i<2?'eager':'lazy'}" decoding="async"><div class="carousel-card-info"><h3>${p.title}</h3><small>${p.category} — ${p.year}</small></div></a>`).join("");
}
// list pages
function row(p,i){return `<a class="archive-row" href="${projectURL(p)}" data-transition data-preview="${p.cover}" data-hover-label="عرض">
<span>${String(i+1).padStart(2,"0")}</span><h3>${p.title}</h3><span class="hide-mobile">${p.category}</span><span class="hide-mobile">${p.year}</span></a>`}
const bList=$("[data-branding-list]"); if(bList)bList.innerHTML=visibleProjects().filter(p=>p.type==="branding").map(row).join("");
const cList=$("[data-carousel-list]"); if(cList)cList.innerHTML=visibleProjects().filter(p=>p.type==="carousel").map(row).join("");
// floating preview
const fp=$(".floating-preview");
if(fp){
  const img=$("img",fp);$$(".archive-row").forEach(r=>{r.addEventListener("mouseenter",()=>{img.src=r.dataset.preview;fp.classList.add("show")});r.addEventListener("mouseleave",()=>fp.classList.remove("show"))});
}
// project dynamic
const detail=$("[data-project-detail]");
if(detail){
  const id=new URLSearchParams(location.search).get("id"), p=cms.projects.find(x=>x.id===id)||visibleProjects()[0];
  if(p){
    document.title=`${p.title} — معرض الأعمال`;
    bind("[data-project-eyebrow]",p.eyebrow||p.category);bind("[data-project-year]",p.year);bind("[data-project-title]",p.title);
    bind("[data-project-intro]",p.intro||p.short);bind("[data-project-role]",p.role);bind("[data-project-services]",p.services);
    const cover=$("[data-project-cover]"),coverWrap=cover?.closest(".project-cover");
    if(p.type==="carousel"){coverWrap?.remove()}else if(cover){cover.src=p.cover;cover.alt=p.title}
    const sections=$("[data-project-sections]");
    if(sections)sections.innerHTML=(p.sections||[]).map(s=>`<section class="project-section"><div class="container project-copy reveal"><div class="label">${s.label||""}</div><div><h2>${s.title||""}</h2><p>${s.text||""}</p></div></div></section>`).join("");
    const gallery=$("[data-project-gallery]"), viewer=$("[data-slide-viewer]");
    if(p.type==="branding"){
      if(viewer)viewer.remove();
      if(gallery)gallery.innerHTML=(p.images||[]).map((im,i)=>`<img src="${im}" alt="${p.title} ${i+1}" loading="lazy" decoding="async">`).join("");
    }else{
      if(gallery)gallery.remove();
      if(viewer){const track=$(".slide-track",viewer);track.innerHTML=(p.images||[]).map((im,i)=>`<div class="slide"><img src="${im}" alt="${p.title} - شريحة ${i+1}" loading="${i<3?'eager':'lazy'}" decoding="async"></div>`).join("")}
    }
    const all=visibleProjects(), idx=all.findIndex(x=>x.id===p.id), next=all[(idx+1)%all.length], na=$("[data-next-project]");
    if(na){na.textContent=`التالي: ${next.title} ←`;na.href=projectURL(next)}
  }
}
// after dynamic inserts
bindTransitions();window.refreshCursor?.();
