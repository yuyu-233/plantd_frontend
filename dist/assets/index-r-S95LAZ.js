(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const u of l.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&s(u)}).observe(document,{childList:!0,subtree:!0});function a(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(i){if(i.ep)return;i.ep=!0;const l=a(i);fetch(i.href,l)}})();const ge={"Content-Type":"application/json"};async function L(e,t={}){const a=await fetch(e,{credentials:"include",...t,headers:{...ge,...t.headers}});if(a.status===204)return null;const s=await a.text(),i=s?JSON.parse(s):null;if(!a.ok){const l=(i==null?void 0:i.message)||a.statusText;throw new Error(l)}return i}const f={register:e=>L("/api/v1/auth/register",{method:"POST",body:JSON.stringify(e)}),login:e=>L("/api/v1/auth/login",{method:"POST",body:JSON.stringify(e)}),logout:()=>L("/api/v1/auth/logout",{method:"POST"}),me:()=>L("/api/v1/auth/me"),updateProfile:e=>L("/api/v1/auth/me",{method:"PATCH",body:JSON.stringify(e)}),getPosts:e=>{const t=e?`?gardenerId=${encodeURIComponent(e)}`:"";return L(`/api/v1/seeds${t}`)},async searchPosts(e){const t=encodeURIComponent(e),[a,s]=await Promise.all([L(`/api/v1/seeds?postName=${t}`),L(`/api/v1/seeds?gardenerName=${t}`)]),i=new Map;for(const l of[...a,...s])i.set(l.id,l);return[...i.values()]},getPost:e=>L(`/api/v1/seeds/${e}`),createPost:e=>L("/api/v1/seeds",{method:"POST",body:JSON.stringify(e)}),updatePost:(e,t)=>L(`/api/v1/seeds/${e}`,{method:"PATCH",body:JSON.stringify(t)}),deletePost:e=>L(`/api/v1/seeds/${e}`,{method:"DELETE"}),getTags:e=>{const t=e!=null&&e.trim()?`?tag=${encodeURIComponent(e.trim())}`:"";return L(`/api/v1/tags${t}`)},createTags:e=>L("/api/v1/tags",{method:"POST",body:JSON.stringify({tagsName:e})}),uploadAvatar:async e=>{const t=new FormData;t.append("file",e);const a=await fetch("/api/v1/upload/avatar",{method:"POST",credentials:"include",body:t}),s=await a.json();if(!a.ok)throw new Error((s==null?void 0:s.message)||"头像上传失败");return s},uploadImage:async e=>{const t=new FormData;t.append("file",e);const a=await fetch("/api/v1/upload/image",{method:"POST",credentials:"include",body:t}),s=await a.json();if(!a.ok)throw new Error((s==null?void 0:s.message)||"上传失败");return s}};function T(e){if(!e)return null;if(e.startsWith("/avatars/"))return"/img/avatar/default.png";if(e.startsWith("http"))return e;const t=e.match(/^\/img\/([0-9a-f-]+\.[a-z]+)$/i);return t?`/img/post/${t[1]}`:e}const W=new Set,c={user:null,view:"garden",showLogin:!1,showPostDetail:null,settingsOpen:!1,route:null,postCount:0,searchQuery:""};function d(e){Object.assign(c,e),W.forEach(t=>t())}function pe(e){return W.add(e),()=>W.delete(e)}const $={logo:`<svg viewBox="0 0 32 32" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(16 16)">
      <g fill="#ef4d5a">
        <path d="M0,-2.5C-2.8,-6.2 -4.8,-11.2 -4.2,-15.8C-2,-18.8 2,-18.8 4.2,-15.8C4.8,-11.2 2.8,-6.2 0,-2.5z" transform="rotate(0)"/>
        <path d="M0,-2.5C-2.8,-6.2 -4.8,-11.2 -4.2,-15.8C-2,-18.8 2,-18.8 4.2,-15.8C4.8,-11.2 2.8,-6.2 0,-2.5z" transform="rotate(72)"/>
        <path d="M0,-2.5C-2.8,-6.2 -4.8,-11.2 -4.2,-15.8C-2,-18.8 2,-18.8 4.2,-15.8C4.8,-11.2 2.8,-6.2 0,-2.5z" transform="rotate(144)"/>
        <path d="M0,-2.5C-2.8,-6.2 -4.8,-11.2 -4.2,-15.8C-2,-18.8 2,-18.8 4.2,-15.8C4.8,-11.2 2.8,-6.2 0,-2.5z" transform="rotate(216)"/>
        <path d="M0,-2.5C-2.8,-6.2 -4.8,-11.2 -4.2,-15.8C-2,-18.8 2,-18.8 4.2,-15.8C4.8,-11.2 2.8,-6.2 0,-2.5z" transform="rotate(288)"/>
      </g>
      <g stroke="#ffe566" stroke-width="0.55" fill="none" stroke-linecap="round" opacity="0.9">
        <path d="M0,-5.5 L0,-12" transform="rotate(0)"/>
        <path d="M0,-5.5 L0,-12" transform="rotate(72)"/>
        <path d="M0,-5.5 L0,-12" transform="rotate(144)"/>
        <path d="M0,-5.5 L0,-12" transform="rotate(216)"/>
        <path d="M0,-5.5 L0,-12" transform="rotate(288)"/>
      </g>
    </g>
    <circle cx="16" cy="16" r="5.5" fill="#ffe566"/>
    <circle cx="16" cy="16" r="4" fill="#ffd84d"/>
  </svg>`,garden:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>',myplant:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',message:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',market:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'},S="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="#e0e0e0" width="80" height="80"/><circle cx="40" cy="30" r="14" fill="#bdbdbd"/><ellipse cx="40" cy="68" rx="22" ry="16" fill="#bdbdbd"/></svg>'),F="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#e8e8e8" width="400" height="300"/><text x="200" y="155" text-anchor="middle" fill="#bbb" font-size="18" font-family="sans-serif">No Image</text></svg>'),n={loading:"加载中...",noPosts:"暂无帖子",noSearchResults:"未找到相关帖子",loginFirst:"请先登录",goLogin:"去登录",noMyPosts:"你还没有发布帖子",notLoggedIn:"未登录",accountSettings:"账号设置",accountLogout:"账号登出",close:"关闭",loginTitle:"账号登录",username:"用户名",password:"密码",login:"登录",noAccount:"还没有账号？",register:"注册",accountInfoTitle:"账号信息设置",avatar:"头像",changeAvatar:"更换头像",avatarHint:"支持 jpeg、png、webp、gif，最大 5MB",nickname:"昵称",usernameHint:"4-30 个字符，支持中英文、数字",save:"保存",usernameRequired:"用户名不能为空",saveSuccess:"保存成功",back:"返回",title:"标题",seedNamePlaceholder:"给你的种子起个名字",content:"内容",contentPlaceholder:"分享你的种植心得...",getUrl:"获取链接",images:"图片",publish:"发布",cancel:"取消",editPost:"编辑帖子",addImages:"追加图片",delete:"删除",registerTitle:"注册账号",backToLogin:"返回登录",editForbidden:"无权编辑此帖子",confirmDelete:"确定删除这篇帖子？",registerSuccess:"注册成功，请登录",searchPlaceholder:"搜索帖子或用户名...",tagSearchPlaceholder:"搜索 tags...",newTag:"新建 Tag",tagNamePlaceholder:"输入 tag 名称",confirm:"确认",cover:"封面",uploading:"上传中...",titleRequired:"标题不能为空",noTags:"暂无 tags",navHome:"首页",navMarket:"市集",navMessages:"消息",navMe:"我",messagesEmpty:"暂无消息",plantBtn:"plant!"};function z(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}let te=0;function ae(){return te+=1,`img-${te}`}function oe({mode:e,post:t=null}={}){const a=e==="edit",s=(t==null?void 0:t.seedName)||"",i=(t==null?void 0:t.content)||"",l=a?n.save:n.plantBtn;return`
    <div class="post-editor">
      <header class="editor-topbar">
        <button type="button" class="editor-topbar-btn" id="editor-home" title="${n.back}">
          ${$.back}
        </button>
        <div class="editor-topbar-actions">
          ${a?`<button type="button" class="editor-topbar-btn editor-topbar-btn-danger" id="editor-delete" title="${n.delete}">${$.trash}</button>`:""}
          <button type="button" class="editor-topbar-btn editor-topbar-btn-accent editor-publish-desktop" id="editor-publish" title="${a?n.save:n.publish}">
            ${$.check}
          </button>
        </div>
      </header>
      <div class="editor-body">
        <section class="editor-section editor-images-section">
          <div class="editor-image-list editor-image-list--mobile" id="image-list"></div>
          <input type="file" id="image-file-input" accept="image/*" hidden />
        </section>
        <section class="editor-section editor-main-section">
          <input class="editor-title" id="editor-title" type="text" placeholder="${n.seedNamePlaceholder}" value="${z(s)}" maxlength="200" />
          <textarea class="editor-content" id="editor-content" placeholder="${n.contentPlaceholder}">${z(i)}</textarea>
          <p class="login-error editor-error" id="editor-error" hidden></p>
        </section>
        <section class="editor-section editor-tags-section">
          <div class="editor-tags-panel">
            <div class="editor-tag-search-row">
              <input type="search" class="editor-tag-search" id="tag-search" placeholder="${n.tagSearchPlaceholder}" autocomplete="off" />
              <button type="button" class="editor-tag-add-btn" id="tag-add-btn" title="${n.newTag}">${$.plus}</button>
            </div>
            <div class="editor-tag-list" id="tag-list"></div>
          </div>
        </section>
      </div>
      <footer class="editor-mobile-footer">
        <button type="button" class="btn-plant-mobile editor-publish-mobile" id="editor-publish-mobile">${l}</button>
      </footer>
    </div>
    <div class="overlay" id="new-tag-overlay" hidden>
      <div class="tag-modal">
        <div class="tag-modal-header">
          <span>${n.newTag}</span>
          <button type="button" class="tag-modal-close" id="new-tag-close">&times;</button>
        </div>
        <div class="tag-modal-body">
          <input type="text" id="new-tag-input" placeholder="${n.tagNamePlaceholder}" maxlength="50" />
        </div>
        <div class="tag-modal-footer">
          <button type="button" class="btn-primary tag-modal-confirm" id="new-tag-confirm">${n.confirm}</button>
        </div>
        <p class="login-error tag-modal-error" id="new-tag-error" hidden></p>
      </div>
    </div>
  `}function le(e,{mode:t,post:a=null}={}){var w,U,N,_,K,X,Y,Z,ee;const s=t==="edit",i=e.querySelector("#editor-error"),l=e.querySelector("#tag-list"),u=e.querySelector("#image-list"),h=e.querySelector("#image-file-input"),b=e.querySelector("#tag-search"),m=e.querySelector("#new-tag-overlay"),x=new Set(((a==null?void 0:a.varietyIds)||[]).map(Number));let H=[],y=[],E=null,j=null;(w=a==null?void 0:a.imageUrls)!=null&&w.length&&(y=a.imageUrls.map(r=>({id:ae(),url:r,preview:T(r),uploading:!1})));function C(r){i.textContent=r,i.hidden=!1}function B(){i.hidden=!0}function A(){if(!H.length){l.innerHTML=`<p class="editor-empty-hint">${n.noTags}</p>`;return}l.innerHTML=H.map(r=>`
      <button type="button" class="editor-tag-chip ${x.has(r.id)?"selected":""}" data-id="${r.id}">
        ${z(r.name)}
      </button>
    `).join("")}function M(){const r=y.map((o,p)=>{const P=o.preview||"";return`
        <div class="editor-image-item" draggable="true" data-index="${p}" data-id="${o.id}">
          <div class="editor-image-thumb">
            ${o.uploading?`<div class="editor-image-loading">${n.uploading}</div>`:`<img src="${z(P)}" alt="" />`}
            ${p===0&&y.length>0?`<span class="editor-cover-badge">${n.cover}</span>`:""}
            <button type="button" class="editor-image-remove" data-id="${o.id}">&times;</button>
          </div>
        </div>
      `}).join("");u.innerHTML=`
      ${r}
      <button type="button" class="editor-image-add" id="image-add-btn">${$.plus}</button>
    `}async function D(r=""){try{H=await f.getTags(r),A()}catch(o){l.innerHTML=`<p class="editor-empty-hint error-text">${z(o.message)}</p>`}}async function Q(r,o){r.uploading=!0,M();try{const p=await f.uploadImage(o);r.url=p.url,r.preview=T(p.url),r.uploading=!1}catch(p){y=y.filter(P=>P.id!==r.id),C(p.message)}M()}function g(r){if(!r)return;const o={id:ae(),url:null,preview:URL.createObjectURL(r),file:r,uploading:!0};y.push(o),M(),Q(o,r)}async function k(r){B();const o=e.querySelector("#editor-title").value.trim(),p=e.querySelector("#editor-content").value.trim();if(!o){C(n.titleRequired);return}if(y.some(R=>R.uploading)){C(n.uploading);return}const P=y.map(R=>R.url).filter(Boolean),O=[...x];r.disabled=!0;const I=e.querySelector("#editor-publish-mobile"),V=e.querySelector("#editor-publish");I&&(I.disabled=!0),V&&(V.disabled=!0);try{s?(await f.updatePost(a.id,{seedName:o,content:p,getUrl:a.getUrl||"",imageUrls:P,varietyIds:O}),window.location.hash="",d({route:null,view:"myplant"})):(await f.createPost({seedName:o,content:p,getUrl:"",imageUrls:P,varietyIds:O}),window.location.hash="",d({route:null,view:"myplant"}))}catch(R){C(R.message)}finally{r.disabled=!1,I&&(I.disabled=!1),V&&(V.disabled=!1)}}b==null||b.addEventListener("input",r=>{clearTimeout(j),j=setTimeout(()=>D(r.target.value),300)}),l==null||l.addEventListener("click",r=>{const o=r.target.closest(".editor-tag-chip");if(!o)return;const p=Number(o.dataset.id);x.has(p)?x.delete(p):x.add(p),A()}),(U=e.querySelector("#tag-add-btn"))==null||U.addEventListener("click",r=>{r.stopPropagation(),m.hidden=!1;const o=e.querySelector("#new-tag-input"),p=e.querySelector("#new-tag-error");o.value="",p.hidden=!0,o.focus()}),(N=e.querySelector("#new-tag-close"))==null||N.addEventListener("click",r=>{r.stopPropagation(),m.hidden=!0}),(_=e.querySelector(".tag-modal"))==null||_.addEventListener("click",r=>{r.stopPropagation()}),m==null||m.addEventListener("click",()=>{m.hidden=!0}),(K=e.querySelector("#new-tag-confirm"))==null||K.addEventListener("click",async()=>{const r=e.querySelector("#new-tag-input"),o=e.querySelector("#new-tag-error"),p=r.value.trim();if(!p){o.textContent=n.tagNamePlaceholder,o.hidden=!1;return}o.hidden=!0;const P=e.querySelector("#new-tag-confirm");P.disabled=!0;try{await f.createTags([p]),m.hidden=!0,await D(b.value);const O=H.find(I=>I.name===p);O&&x.add(O.id),A()}catch(O){o.textContent=O.message,o.hidden=!1}finally{P.disabled=!1}}),u==null||u.addEventListener("click",r=>{if(r.target.closest("#image-add-btn")){h.click();return}const o=r.target.closest(".editor-image-remove");if(o){const p=o.dataset.id;y=y.filter(P=>P.id!==p),M()}}),h==null||h.addEventListener("change",r=>{var p;const o=(p=r.target.files)==null?void 0:p[0];o&&g(o),h.value=""}),u==null||u.addEventListener("dragstart",r=>{const o=r.target.closest(".editor-image-item");o&&(E=Number(o.dataset.index),o.classList.add("dragging"),r.dataTransfer.effectAllowed="move")}),u==null||u.addEventListener("dragend",r=>{var o;(o=r.target.closest(".editor-image-item"))==null||o.classList.remove("dragging"),E=null}),u==null||u.addEventListener("dragover",r=>{r.preventDefault();const o=r.target.closest(".editor-image-item");o&&(r.dataTransfer.dropEffect="move",u.querySelectorAll(".editor-image-item").forEach(p=>p.classList.remove("drag-over")),o.classList.add("drag-over"))}),u==null||u.addEventListener("dragleave",r=>{var o;(o=r.target.closest(".editor-image-item"))==null||o.classList.remove("drag-over")}),u==null||u.addEventListener("drop",r=>{r.preventDefault();const o=r.target.closest(".editor-image-item");if(!o||E===null)return;const p=Number(o.dataset.index);if(E===p)return;const[P]=y.splice(E,1);y.splice(p,0,P),E=null,M()}),(X=e.querySelector("#editor-home"))==null||X.addEventListener("click",()=>{window.location.hash="",d({route:null,view:"garden"})}),(Y=e.querySelector("#editor-delete"))==null||Y.addEventListener("click",async()=>{if(confirm(n.confirmDelete)){B();try{await f.deletePost(a.id),d({route:null,view:"myplant"})}catch(r){C(r.message)}}}),(Z=e.querySelector("#editor-publish"))==null||Z.addEventListener("click",async r=>{await k(r.currentTarget)}),(ee=e.querySelector("#editor-publish-mobile"))==null||ee.addEventListener("click",async r=>{await k(r.currentTarget)}),D(),M()}function v(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function ve(e,{editMode:t=!1}={}){const a=(e.varieties||[]).filter(Boolean),s=T(e.seedImage)||F,i=T(e.authorAvatar)||S;return`
    <article class="post-card" data-id="${e.id}" data-edit="${t}">
      <div class="post-card-image">
        <img src="${v(s)}" alt="${v(e.title)}" loading="lazy"
          onerror="this.src='${F}'" />
      </div>
      <div class="post-card-body">
        <h3 class="post-card-title">${v(e.title)}</h3>
        <div class="post-card-tags">
          ${a.map(l=>`<span class="tag">${v(l)}</span>`).join("")}
        </div>
        <div class="post-card-author">
          <img src="${v(i)}" alt="" onerror="this.src='${S}'" />
          <span>${v(e.authorName)}</span>
        </div>
      </div>
    </article>
  `}function de(e,{editMode:t=!1,emptyText:a=n.noPosts}={}){return e.length?`<div class="post-grid">${e.map(s=>ve(s,{editMode:t})).join("")}</div>`:`<div class="center-message"><p>${a}</p></div>`}async function fe(e){var t;e.innerHTML=`<div class="loading">${n.loading}</div>`;try{const a=(t=c.searchQuery)==null?void 0:t.trim(),s=a?await f.searchPosts(a):await f.getPosts(),i=a?`Search: "${v(a)}"`:"Latest Feed";e.innerHTML=`
      <h2 class="content-title">${i}</h2>
      ${de(s,{emptyText:a?n.noSearchResults:n.noPosts})}
    `,ue(e,!1)}catch(a){e.innerHTML=`<p class="error-text">${v(a.message)}</p>`}}async function ce(){var e;if((e=c.user)!=null&&e.id)try{const t=await f.getPosts(c.user.id);c.postCount=t.length;const a=document.querySelector(".sidebar-stat-num");a&&(a.textContent=t.length)}catch{}}async function me(e){var t;if(!c.user){e.innerHTML=`
      <div class="center-message">
        <p>${n.loginFirst}</p>
        <button type="button" id="myplant-login-btn">${n.goLogin}</button>
      </div>
    `,(t=e.querySelector("#myplant-login-btn"))==null||t.addEventListener("click",()=>{d({showLogin:!0})});return}e.innerHTML=`<div class="loading">${n.loading}</div>`;try{const a=await f.getPosts(c.user.id);c.postCount=a.length;const s=document.querySelector(".sidebar-stat-num");s&&(s.textContent=a.length),e.innerHTML=`
      <h2 class="content-title">My Plants</h2>
      ${de(a,{editMode:!0,emptyText:n.noMyPosts})}
    `,ue(e,!0)}catch(a){e.innerHTML=`<p class="error-text">${v(a.message)}</p>`}}function ue(e,t){e.querySelectorAll(".post-card").forEach(a=>{a.addEventListener("click",()=>{const s=Number(a.dataset.id);t?(d({route:{page:"edit",id:s},showPostDetail:null}),window.location.hash=`#/edit/${s}`):he(s)})})}async function he(e){d({showPostDetail:{id:e,loading:!0,data:null,imageIndex:0}});try{const t=await f.getPost(e);d({showPostDetail:{id:e,loading:!1,data:t,imageIndex:0}})}catch(t){d({showPostDetail:{id:e,loading:!1,error:t.message}})}}function be(){const e=c.user,t=e&&T(e.avatar)||S,a=e?e.username:"Guest",s=c.view,i=[{id:"garden",label:"garden",icon:$.garden},{id:"myplant",label:"myplant",icon:$.myplant},{id:"settings",label:"settings",icon:$.settings}];return`
    <aside class="sidebar">
      <div class="sidebar-logo">
        ${$.logo}
        <span>Plantd</span>
      </div>
      <div class="sidebar-profile">
        <div class="sidebar-avatar-wrap">
          <img class="sidebar-avatar" src="${v(t)}" alt=""
            onerror="this.src='${S}'" />
        </div>
        <div class="sidebar-username">${v(a)}</div>
        <div class="sidebar-subtitle">${e?"Gardener":n.notLoggedIn}</div>
        ${e?`
          <div class="sidebar-stats">
            <div class="sidebar-stat">
              <div class="sidebar-stat-num">${c.postCount}</div>
              <div class="sidebar-stat-label">Posts</div>
            </div>
          </div>
        `:""}
      </div>
      <nav class="sidebar-nav">
        ${i.map(l=>l.id==="settings"?`
          <div class="settings-nav-wrap">
            <button class="nav-item ${s==="account"?"active":""} ${c.settingsOpen?"open":""}" data-view="settings" id="settings-nav-btn">
              ${l.icon}
              <span>${l.label}</span>
            </button>
            ${c.settingsOpen?`
              <div class="settings-dropdown" id="settings-dropdown">
                <button type="button" class="settings-dropdown-item" id="settings-account">${n.accountSettings}</button>
                <button type="button" class="settings-dropdown-item settings-dropdown-logout" id="settings-logout">${n.accountLogout}</button>
              </div>
            `:""}
          </div>
        `:`
          <button class="nav-item ${s===l.id?"active":""}" data-view="${l.id}">
            ${l.icon}
            <span>${l.label}</span>
          </button>
        `).join("")}
      </nav>
    </aside>
  `}function ye(){const e=c.user&&T(c.user.avatar)||S;return`
    <header class="topbar">
      <a class="topbar-logo mobile-only" href="#" id="topbar-logo" aria-label="Plantd">
        ${$.logo}
      </a>
      <form class="topbar-search" id="search-form">
        <input
          type="search"
          id="search-input"
          class="topbar-search-input"
          placeholder="${n.searchPlaceholder}"
          value="${v(c.searchQuery||"")}"
          autocomplete="off"
        />
      </form>
      <div class="topbar-actions desktop-only">
        <button class="btn-seed" id="btn-plant-seed" type="button">+ Plant A Seed</button>
        <img class="topbar-avatar" id="topbar-avatar" src="${v(e)}" alt="profile"
          onerror="this.src='${S}'" />
      </div>
    </header>
  `}function we(){const e=c.view;return`
    <nav class="bottom-nav mobile-only" id="bottom-nav">
      ${[{id:"garden",label:n.navHome,icon:$.garden},{id:"myplant",label:n.navMarket,icon:$.market},{id:"create",label:"",icon:$.plus,isCenter:!0},{id:"messages",label:n.navMessages,icon:$.message},{id:"account",label:n.navMe,icon:$.user}].map(a=>a.isCenter?`
          <button type="button" class="bottom-nav-item bottom-nav-create" id="bottom-nav-create" aria-label="Plant A Seed">
            <span class="bottom-nav-create-icon">${a.icon}</span>
          </button>
        `:`
          <button type="button" class="bottom-nav-item ${e===a.id?"active":""}" data-view="${a.id}">
            ${a.icon}
            <span>${a.label}</span>
          </button>
        `).join("")}
    </nav>
  `}function $e(){var u;const e=c.showPostDetail;if(!e)return"";if(e.loading)return`
      <div class="overlay" id="detail-overlay">
        <div class="dev-toast">${n.loading}</div>
      </div>
    `;if(e.error)return`
      <div class="overlay" id="detail-overlay">
        <div class="dev-toast">
          <p>${v(e.error)}</p>
          <button type="button" id="detail-close-btn">${n.close}</button>
        </div>
      </div>
    `;const t=e.data,a=(u=t.imageUrls)!=null&&u.length?t.imageUrls:[F],s=e.imageIndex||0,i=T(a[s])||F,l=T(t.authorAvatar)||S;return`
    <div class="overlay" id="detail-overlay">
      <div class="detail-modal">
        <button class="detail-close" id="detail-close-btn" type="button">&times;</button>
        <div class="detail-modal-media">
          <img src="${v(i)}" alt="" onerror="this.src='${F}'" />
          ${a.length>1?`
            <button class="carousel-btn prev" id="carousel-prev" type="button">&#8249;</button>
            <button class="carousel-btn next" id="carousel-next" type="button">&#8250;</button>
            <div class="carousel-dots">
              ${a.map((h,b)=>`<span class="carousel-dot ${b===s?"active":""}"></span>`).join("")}
            </div>
          `:""}
        </div>
        <div class="detail-modal-info">
          <div class="detail-header">
            <img src="${v(l)}" alt="" onerror="this.src='${S}'" />
            <span class="name">${v(t.authorName)}</span>
          </div>
          <div class="detail-body">
            <h2 class="detail-title">${v(t.seedName)}</h2>
            <p class="detail-content">${v(t.content||"")}</p>
          </div>
        </div>
      </div>
    </div>
  `}function ne(){return c.showLogin?`
    <div class="overlay" id="login-overlay">
      <div class="login-modal">
        <button class="login-close" id="login-close" type="button">&times;</button>
        <h2>${n.loginTitle}</h2>
        <form id="login-form">
          <div class="login-field">
            <input type="text" name="username" placeholder="${n.username}" required autocomplete="username" />
          </div>
          <div class="login-field">
            <input type="password" name="password" placeholder="${n.password}" required autocomplete="current-password" />
          </div>
          <button class="btn-login" type="submit">${n.login}</button>
          <p class="login-error" id="login-error" hidden></p>
        </form>
        <p class="login-footer">
          ${n.noAccount}<a href="#/register" id="go-register">${n.register}</a>
        </p>
      </div>
    </div>
  `:""}function Le(){const e=c.user,t=e&&T(e.avatar)||S;return`
    <div class="account-settings">
      <h2 class="account-settings-title">${n.accountInfoTitle}</h2>
      <form id="account-form" class="account-form">
        <div class="account-row account-avatar-row">
          <label class="account-label">${n.avatar}</label>
          <div class="account-avatar-block">
            <img class="account-avatar-preview" id="account-avatar-preview" src="${v(t)}"
              alt="" onerror="this.src='${S}'" />
            <label class="account-avatar-upload">
              <input type="file" id="account-avatar-input" accept="image/*" hidden />
              ${n.changeAvatar}
            </label>
            <p class="account-hint">${n.avatarHint}</p>
          </div>
        </div>
        <div class="account-row">
          <label class="account-label" for="account-username">${n.nickname}</label>
          <div class="account-field">
            <input id="account-username" name="username" type="text" required
              value="${v((e==null?void 0:e.username)||"")}" placeholder="${n.username}" maxlength="30" />
            <p class="account-hint">${n.usernameHint}</p>
          </div>
        </div>
        <p class="login-error" id="account-error" hidden></p>
        <div class="account-actions">
          <button class="btn-primary" type="submit">${n.save}</button>
          <button class="btn-logout mobile-only" type="button" id="account-logout">${n.accountLogout}</button>
        </div>
      </form>
    </div>
  `}function Se(e){e.innerHTML=`
    <div class="center-message messages-empty">
      <p>${n.messagesEmpty}</p>
    </div>
  `}function ke(e){var t;if(!c.user){e.innerHTML=`
      <div class="center-message">
        <p>${n.loginFirst}</p>
        <button type="button" id="account-login-btn">${n.goLogin}</button>
      </div>
    `,(t=e.querySelector("#account-login-btn"))==null||t.addEventListener("click",()=>{d({showLogin:!0})});return}e.innerHTML=Le(),Pe(e)}function Pe(e){var l;const t=e.querySelector("#account-form"),a=e.querySelector("#account-error"),s=e.querySelector("#account-avatar-preview"),i=e.querySelector("#account-avatar-input");i==null||i.addEventListener("change",async u=>{var b;const h=(b=u.target.files)==null?void 0:b[0];if(h){a.hidden=!0;try{const m=await f.uploadAvatar(h),x=await f.me();d({user:x}),s.src=T(m.url)||T(x.avatar)||S}catch(m){a.textContent=m.message,a.hidden=!1}finally{i.value=""}}}),t==null||t.addEventListener("submit",async u=>{u.preventDefault(),a.hidden=!0;const h=t.querySelector('[name="username"]').value.trim();if(!h){a.textContent=n.usernameRequired,a.hidden=!1;return}const b=t.querySelector(".btn-primary");b.disabled=!0;try{const m=await f.updateProfile({username:h});d({user:m}),a.style.color="#27ae60",a.textContent=n.saveSuccess,a.hidden=!1,setTimeout(()=>{a.hidden=!0,a.style.color=""},2e3)}catch(m){a.textContent=m.message,a.hidden=!1}finally{b.disabled=!1}}),(l=e.querySelector("#account-logout"))==null||l.addEventListener("click",async()=>{try{await f.logout()}catch{}d({user:null,view:"garden",settingsOpen:!1,route:null,searchQuery:""})})}async function xe(e,t){var a;if(!c.user){e.innerHTML=`
      <div class="center-message">
        <p>${n.loginFirst}</p>
        <button type="button" id="edit-login-btn">${n.goLogin}</button>
      </div>
    `,(a=e.querySelector("#edit-login-btn"))==null||a.addEventListener("click",()=>{d({showLogin:!0})});return}e.innerHTML=`<div class="loading">${n.loading}</div>`;try{const s=await f.getPost(t);if(s.authorName!==c.user.username){e.innerHTML=`<p class="error-text">${n.editForbidden}</p>`;return}e.innerHTML=oe({mode:"edit",post:s}),le(e,{mode:"edit",post:s})}catch(s){e.innerHTML=`<p class="error-text">${v(s.message)}</p>`}}function qe(){return`
    <div class="content" style="display:flex;align-items:center;justify-content:center;min-height:80vh;">
      <div class="page-form" style="width:100%;">
        <h1>${n.registerTitle}</h1>
        <form id="register-form">
          <div class="form-group">
            <label>${n.username} *</label>
            <input name="username" required placeholder="${n.username}" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>${n.password} *</label>
            <input type="password" name="password" required placeholder="${n.password}" autocomplete="new-password" />
          </div>
          <p class="login-error" id="form-error" hidden></p>
          <div class="form-actions">
            <button class="btn-primary" type="submit">${n.register}</button>
            <a class="btn-secondary" href="#" id="back-login" style="display:inline-flex;align-items:center;">${n.backToLogin}</a>
          </div>
        </form>
      </div>
    </div>
  `}function Te(e){var s;const t=e.querySelector("#register-form"),a=e.querySelector("#form-error");(s=e.querySelector("#back-login"))==null||s.addEventListener("click",i=>{i.preventDefault(),window.location.hash="",d({route:null,showLogin:!0})}),t==null||t.addEventListener("submit",async i=>{i.preventDefault(),a.hidden=!0;const l=new FormData(t);try{await f.register({username:l.get("username"),password:l.get("password")}),window.location.hash="",d({route:null,showLogin:!0}),alert(n.registerSuccess)}catch(u){a.textContent=u.message,a.hidden=!1}})}let se=null;function J(e){const t=e.trim();t!==(c.searchQuery||"")&&d({searchQuery:t,view:"garden",route:null})}function re(e){var i,l,u,h,b,m,x,H,y,E,j,C,B,A,M,D,Q;e.querySelectorAll("[data-view]").forEach(g=>{g.addEventListener("click",k=>{const w=g.dataset.view;if(w==="settings"){if(k.stopPropagation(),!c.user){d({showLogin:!0,settingsOpen:!1});return}d({settingsOpen:!c.settingsOpen});return}if(w==="account"&&!c.user){d({showLogin:!0,settingsOpen:!1});return}if(w==="messages"){d({view:"messages",route:null,settingsOpen:!1});return}d({view:w,route:null,settingsOpen:!1,searchQuery:w==="garden"?c.searchQuery:""})})}),(i=e.querySelector("#bottom-nav-create"))==null||i.addEventListener("click",()=>{if(!c.user){d({showLogin:!0});return}window.location.hash="#/create",d({route:{page:"create"},showPostDetail:null})}),(l=e.querySelector("#topbar-logo"))==null||l.addEventListener("click",g=>{g.preventDefault(),d({view:"garden",route:null,settingsOpen:!1})});const t=e.querySelector("#search-form"),a=e.querySelector("#search-input");t==null||t.addEventListener("submit",g=>{g.preventDefault(),J((a==null?void 0:a.value)||"")}),a==null||a.addEventListener("input",g=>{clearTimeout(se),se=setTimeout(()=>{J(g.target.value)},350)}),a==null||a.addEventListener("search",g=>{g.target.value===""&&J("")}),(u=e.querySelector("#settings-account"))==null||u.addEventListener("click",g=>{g.stopPropagation(),d({view:"account",settingsOpen:!1,route:null})}),(h=e.querySelector("#settings-logout"))==null||h.addEventListener("click",async g=>{g.stopPropagation();try{await f.logout()}catch{}d({user:null,view:"garden",settingsOpen:!1,route:null,searchQuery:""})}),c.settingsOpen&&(setTimeout(()=>{document.addEventListener("click",function g(){d({settingsOpen:!1}),document.removeEventListener("click",g)},{once:!0})},0),(b=e.querySelector("#settings-dropdown"))==null||b.addEventListener("click",g=>{g.stopPropagation()})),(m=e.querySelector("#btn-plant-seed"))==null||m.addEventListener("click",()=>{if(!c.user){d({showLogin:!0});return}window.location.hash="#/create",d({route:{page:"create"},showPostDetail:null})}),(x=e.querySelector("#topbar-avatar"))==null||x.addEventListener("click",()=>{c.user||d({showLogin:!0})}),(H=e.querySelector("#detail-overlay"))==null||H.addEventListener("click",g=>{g.target.id==="detail-overlay"&&d({showPostDetail:null})}),(y=e.querySelector("#detail-close-btn"))==null||y.addEventListener("click",()=>{d({showPostDetail:null})});const s=c.showPostDetail;((j=(E=s==null?void 0:s.data)==null?void 0:E.imageUrls)==null?void 0:j.length)>1&&((C=e.querySelector("#carousel-prev"))==null||C.addEventListener("click",g=>{g.stopPropagation();const k=s.data.imageUrls.length,w=((s.imageIndex||0)-1+k)%k;d({showPostDetail:{...s,imageIndex:w}})}),(B=e.querySelector("#carousel-next"))==null||B.addEventListener("click",g=>{g.stopPropagation();const k=s.data.imageUrls.length,w=((s.imageIndex||0)+1)%k;d({showPostDetail:{...s,imageIndex:w}})})),(A=e.querySelector("#login-overlay"))==null||A.addEventListener("click",g=>{g.target.id==="login-overlay"&&d({showLogin:!1})}),(M=e.querySelector("#login-close"))==null||M.addEventListener("click",()=>{d({showLogin:!1})}),(D=e.querySelector("#go-register"))==null||D.addEventListener("click",g=>{g.preventDefault(),d({showLogin:!1,route:{page:"register"}}),window.location.hash="#/register"}),(Q=e.querySelector("#login-form"))==null||Q.addEventListener("submit",async g=>{g.preventDefault();const k=e.querySelector("#login-error");k.hidden=!0;const w=new FormData(g.target),U=g.target.querySelector(".btn-login");U.disabled=!0;try{const N=await f.login({username:w.get("username"),password:w.get("password")});d({user:N,showLogin:!1}),await ce()}catch(N){k.textContent=N.message,k.hidden=!1}finally{U.disabled=!1}})}let q=null;function G(){var i;const e=document.getElementById("app"),t=c.route;if((t==null?void 0:t.page)==="register"||window.location.hash==="#/register"){e.innerHTML=qe(),Te(e);return}if((t==null?void 0:t.page)==="create"||(t==null?void 0:t.page)==="edit"){e.innerHTML=`
      <div id="main-content"></div>
      ${ne()}
    `,q=e.querySelector("#main-content"),re(e),(t==null?void 0:t.page)==="create"?c.user?(q.innerHTML=oe({mode:"create"}),le(q,{mode:"create"})):(q.innerHTML=`
          <div class="center-message">
            <p>${n.loginFirst}</p>
            <button type="button" id="create-login-btn">${n.goLogin}</button>
          </div>
        `,(i=q.querySelector("#create-login-btn"))==null||i.addEventListener("click",()=>{d({showLogin:!0})})):(t==null?void 0:t.page)==="edit"&&xe(q,t.id);return}e.innerHTML=`
    <div class="app-shell">
      ${be()}
      <div class="main-area">
        ${ye()}
        <div id="main-content"></div>
      </div>
    </div>
    ${we()}
    ${$e()}
    ${ne()}
  `,q=e.querySelector("#main-content"),q.className="content",re(e),c.view==="garden"?fe(q):c.view==="myplant"?me(q):c.view==="account"?ke(q):c.view==="messages"&&Se(q)}async function Ee(){try{const e=await f.me();d({user:e}),await ce()}catch{d({user:null})}}function ie(){const e=window.location.hash;if(e==="#/register")d({route:{page:"register"}});else if(e==="#/create")d({route:{page:"create"}});else if(e.startsWith("#/edit/")){const t=Number(e.replace("#/edit/",""));t&&d({route:{page:"edit",id:t}})}else d({route:null})}async function Me(){ie(),window.addEventListener("hashchange",()=>{ie(),G()}),pe(G),await Ee(),G()}Me();
