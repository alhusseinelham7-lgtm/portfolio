
(async()=>{
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const STORE="portfolio_admin_v1";
  let base={site:{},projects:[]};

  try{
    if(typeof loadCMS==="function") base=await loadCMS({publicOnly:false});
  }catch(e){}

  let cms;
  try{
    const saved=JSON.parse(localStorage.getItem(STORE)||"null");
    cms=saved||base;
  }catch(e){cms=base}
  if(!cms.site)cms.site={};
  if(!Array.isArray(cms.projects))cms.projects=[];

  const persist=()=>{
    localStorage.setItem(STORE,JSON.stringify(cms));
    try{ if(typeof saveLocalCMS==="function") saveLocalCMS(cms); }catch(e){}
  };

  // Tabs
  $$(".admin-tab").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".admin-tab").forEach(x=>x.classList.remove("active"));
    $$(".admin-screen").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    $("#"+btn.dataset.panel)?.classList.add("active");
    $(".admin-side")?.classList.remove("mobile-open");
  }));
  $("#adminMobileMenu")?.addEventListener("click",()=>$(".admin-side")?.classList.toggle("mobile-open"));

  // Content
  const contentForm=$("#contentForm");
  if(contentForm){
    [...contentForm.elements].forEach(el=>{ if(el.name) el.value=cms.site[el.name]??""; });
    contentForm.addEventListener("submit",e=>{
      e.preventDefault();
      [...contentForm.elements].forEach(el=>{if(el.name)cms.site[el.name]=el.value});
      persist(); toast("تم حفظ محتوى الموقع");
    });
  }

  const seoForm=$("#seoForm");
  if(seoForm){
    [...seoForm.elements].forEach(el=>{ if(el.name) el.value=cms.site[el.name]??""; });
    seoForm.addEventListener("submit",e=>{
      e.preventDefault();
      [...seoForm.elements].forEach(el=>{if(el.name)cms.site[el.name]=el.value});
      persist(); toast("تم حفظ إعدادات SEO");
    });
  }

  let activeFilter="all";
  let searchTerm="";
  const typeKey=p=>{
    if(p.section==="branding"||p.type==="branding")return "branding";
    const w=(p.workType||p.category||"").toLowerCase();
    if(w.includes("إعلان")||w.includes("اعلان")||w.includes("ads")||w.includes("advert"))return "ads";
    return "carousel";
  };
  const typeLabel=p=>({branding:"هوية بصرية",carousel:"كاروسيل",ads:"إعلان"})[typeKey(p)];

  function renderStats(){
    $("#statAll").textContent=cms.projects.length;
    $("#statBranding").textContent=cms.projects.filter(p=>typeKey(p)==="branding").length;
    $("#statCarousel").textContent=cms.projects.filter(p=>typeKey(p)==="carousel").length;
    $("#statAds").textContent=cms.projects.filter(p=>typeKey(p)==="ads").length;
  }
  function renderProjects(){
    renderStats();
    const grid=$("#adminProjectGrid");
    let list=[...cms.projects].sort((a,b)=>(a.order||99)-(b.order||99));
    if(activeFilter!=="all")list=list.filter(p=>typeKey(p)===activeFilter);
    if(searchTerm)list=list.filter(p=>(p.title||"").toLowerCase().includes(searchTerm));
    grid.innerHTML=list.map(p=>`
      <article class="admin-project-card">
        <div class="admin-project-cover">
          ${p.cover?`<img src="${p.cover}" alt="">`:""}
          <span class="admin-project-badge">${typeLabel(p)}</span>
        </div>
        <div class="admin-project-info">
          <h3>${p.title||"بدون اسم"}</h3>
          <p>${p.year||""} ${p.published===false?"— مخفي":"— منشور"}</p>
          <div class="admin-project-actions">
            <button data-edit="${p.id}">تعديل</button>
            <button class="delete" data-delete="${p.id}">حذف</button>
          </div>
        </div>
      </article>`).join("");
    $("#adminEmpty").hidden=list.length!==0;
    $$("[data-edit]").forEach(b=>b.onclick=()=>openEditor(b.dataset.edit));
    $$("[data-delete]").forEach(b=>b.onclick=()=>deleteProject(b.dataset.delete));
  }

  $("#projectSearch")?.addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderProjects()});
  $$("[data-filter]",$("#projectFilters")).forEach(btn=>btn.onclick=()=>{
    activeFilter=btn.dataset.filter;
    $$("[data-filter]",$("#projectFilters")).forEach(x=>x.classList.toggle("active",x===btn));
    renderProjects();
  });

  // Modal / creator
  const modal=$("#projectCreator"), form=$("#projectCreatorForm"), fileInput=$("#adminProjectFiles"), drop=$("#adminDropzone"), sort=$("#adminImageSort");
  let files=[]; // {id,src,name,file}
  let coverIndex=0;

  const makeId=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
  const fileToDataURL=file=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)});

  async function ingest(fileList){
    for(const file of [...fileList]){
      if(!file.type.startsWith("image/"))continue;
      const src=await fileToDataURL(file);
      files.push({id:makeId(),src,name:file.name});
    }
    if(files.length&&coverIndex>=files.length)coverIndex=0;
    renderImageSort();
  }
  function renderImageSort(){
    $("#uploadCount").textContent=`${files.length} صور`;
    sort.innerHTML=files.map((it,i)=>`
      <div class="admin-sort-item ${i===coverIndex?"cover":""}" draggable="true" data-index="${i}">
        <img src="${it.src}" alt="">
        ${i===coverIndex?'<span class="admin-cover-label">الغلاف</span>':""}
        <div class="admin-sort-tools">
          <button type="button" data-cover="${i}">غلاف</button>
          <button type="button" data-remove="${i}">حذف</button>
        </div>
      </div>`).join("");
    $$("[data-cover]",sort).forEach(b=>b.onclick=()=>{coverIndex=Number(b.dataset.cover);renderImageSort()});
    $$("[data-remove]",sort).forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.remove);files.splice(i,1);
      if(coverIndex===i)coverIndex=0; else if(coverIndex>i)coverIndex--;
      renderImageSort();
    });
    let dragFrom=null;
    $$(".admin-sort-item",sort).forEach(item=>{
      item.ondragstart=()=>{dragFrom=Number(item.dataset.index);item.classList.add("dragging")};
      item.ondragend=()=>item.classList.remove("dragging");
      item.ondragover=e=>e.preventDefault();
      item.ondrop=e=>{
        e.preventDefault();const to=Number(item.dataset.index);
        if(dragFrom===null||dragFrom===to)return;
        const coverId=files[coverIndex]?.id;
        const [moved]=files.splice(dragFrom,1);files.splice(to,0,moved);
        coverIndex=Math.max(0,files.findIndex(x=>x.id===coverId));
        renderImageSort();
      };
    });
  }
  function resetCreator(){
    form.reset();form.elements.editingId.value="";form.elements.year.value=new Date().getFullYear();form.elements.published.checked=true;
    files=[];coverIndex=0;renderImageSort();$("#projectModalTitle").textContent="إضافة مشروع.";
  }
  function openCreator(){resetCreator();modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
  function closeCreator(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}
  $("#openProjectCreator")?.addEventListener("click",openCreator);
  $$("[data-close-project]").forEach(x=>x.onclick=closeCreator);
  fileInput?.addEventListener("change",()=>ingest(fileInput.files));
  ["dragenter","dragover"].forEach(ev=>drop?.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("dragover")}));
  ["dragleave","drop"].forEach(ev=>drop?.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("dragover")}));
  drop?.addEventListener("drop",e=>ingest(e.dataTransfer.files));

  function kindProps(kind){
    if(kind==="branding")return {type:"branding",section:"branding",workType:"هوية بصرية",category:"هوية بصرية"};
    if(kind==="ads")return {type:"visual",section:"visual",workType:"إعلانات",category:"إعلان"};
    return {type:"visual",section:"visual",workType:"كاروسيلات",category:"كاروسيل"};
  }

  form?.addEventListener("submit",e=>{
    e.preventDefault();
    const fd=new FormData(form), editingId=fd.get("editingId"), kind=fd.get("kind");
    if(!files.length){toast("ارفع صورة واحدة على الأقل");return}
    const props=kindProps(kind);
    const old=editingId?cms.projects.find(p=>p.id===editingId):null;
    const project={
      ...(old||{}),
      id:editingId||("project-"+Date.now()),
      title:String(fd.get("title")||"").trim(),
      year:String(fd.get("year")||"").trim(),
      short:String(fd.get("short")||"").trim(),
      intro:String(fd.get("short")||"").trim(),
      services:String(fd.get("services")||"").trim(),
      published:fd.get("published")==="on",
      ...props,
      images:files.map(x=>x.src),
      cover:files[coverIndex]?.src||files[0]?.src,
      order:old?.order||cms.projects.length+1
    };
    if(old) Object.assign(old,project); else cms.projects.push(project);
    persist();renderProjects();closeCreator();toast(old?"تم تعديل المشروع":"تمت إضافة المشروع");
  });

  function openEditor(id){
    const p=cms.projects.find(x=>x.id===id);if(!p)return;
    modal.classList.add("open");modal.setAttribute("aria-hidden","false");$("#projectModalTitle").textContent="تعديل المشروع.";
    form.elements.editingId.value=p.id;
    form.elements.title.value=p.title||"";
    form.elements.year.value=p.year||"";
    form.elements.short.value=p.short||p.intro||"";
    form.elements.services.value=p.services||"";
    form.elements.published.checked=p.published!==false;
    form.elements.kind.value=typeKey(p);
    files=(p.images||[p.cover]).filter(Boolean).map((src,i)=>({id:makeId(),src,name:`image-${i+1}`}));
    coverIndex=Math.max(0,files.findIndex(x=>x.src===p.cover));
    renderImageSort();
  }
  function deleteProject(id){
    const p=cms.projects.find(x=>x.id===id);
    if(!confirm(`حذف "${p?.title||"المشروع"}"؟`))return;
    cms.projects=cms.projects.filter(x=>x.id!==id);persist();renderProjects();toast("تم حذف المشروع");
  }
  function toast(msg){
    const t=$("#adminToastV1");t.textContent=msg;t.classList.add("show");
    clearTimeout(window.__at);window.__at=setTimeout(()=>t.classList.remove("show"),2200);
  }
  renderProjects();
})();
