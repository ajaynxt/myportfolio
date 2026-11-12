import {
  firebaseReady, auth, db, storage, googleProvider, ADMIN_EMAIL,
  signInWithPopup, signOut, onAuthStateChanged,
  collection, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch, deleteDoc,
  ref, uploadBytes, getDownloadURL, deleteObject
} from "./firebase-client.js";

const $ = (id) => document.getElementById(id);
const loginPanel = $("login-panel"), workspace = $("workspace");
const signInButton = $("sign-in"), signOutButton = $("sign-out");
const setupAlert = $("setup-alert"), loginAlert = $("login-alert");
const workspaceAlert = $("workspace-alert"), form = $("design-form");
const saveButton = $("save-button"), saveStatus = $("save-status");
const designList = $("design-list"), listCount = $("list-count");
const fileInput = $("visual"), preview = $("image-preview");
let currentUser = null, currentItems = [], currentImageUrl = "", currentImagePath = "";

function message(el, text, type = "") {
  el.textContent = text;
  el.className = "notice" + (type ? " " + type : "");
  el.hidden = !text;
}
function status(text) { saveStatus.textContent = text; }
function cleanText(value, max) { return String(value || "").trim().slice(0, max); }
function safeUrl(value) {
  try { const u = new URL(value, location.origin); return ["https:","http:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
}
function resetForm() {
  form.reset(); $("design-id").value = ""; $("active").checked = true;
  $("featured").checked = false; currentImageUrl = ""; currentImagePath = "";
  preview.replaceChildren(Object.assign(document.createElement("span"), { textContent: "Image preview will appear here" }));
  $("form-heading").textContent = "Add a design"; saveButton.textContent = "Save design"; status("");
}
function showImage(url) {
  preview.replaceChildren();
  if (!url) {
    preview.append(Object.assign(document.createElement("span"), {textContent:"Image preview will appear here"}));
    return;
  }
  const img = new Image(); img.alt = "Selected design preview"; img.src = url; preview.append(img);
}
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) { showImage(currentImageUrl); return; }
  const allowed = ["image/jpeg","image/png","image/webp"];
  if (!allowed.includes(file.type) || file.size > 8 * 1024 * 1024) {
    fileInput.value = ""; message(workspaceAlert, "Choose a JPG, PNG or WebP image smaller than 8 MB.", "warning"); showImage(currentImageUrl); return;
  }
  const localUrl = URL.createObjectURL(file); showImage(localUrl);
});

async function loadItems() {
  listCount.textContent = "Loading…";
  const snap = await getDocs(collection(db, "showcase_public"));
  currentItems = snap.docs.map((d) => ({id:d.id,...d.data()})).sort((a,b)=>(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0));
  listCount.textContent = currentItems.length + (currentItems.length === 1 ? " saved design" : " saved designs");
  designList.replaceChildren();
  if (!currentItems.length) {
    designList.append(Object.assign(document.createElement("p"), {className:"muted",textContent:"No designs saved yet. Add your first visual and private prompt."}));
    return;
  }
  currentItems.forEach((item) => {
    const card=document.createElement("div"); card.className="saved-item";
    const imageUrl=safeUrl(item.imageUrl);
    if (imageUrl) { const img=new Image(); img.src=imageUrl; img.alt=""; card.append(img); }
    else { const thumb=document.createElement("div"); thumb.className="saved-thumb-placeholder"; thumb.textContent="NO IMAGE"; card.append(thumb); }
    const info=document.createElement("div"); info.className="saved-info";
    const title=document.createElement("strong"); title.textContent=item.title || "Untitled design";
    const meta=document.createElement("span"); meta.className="saved-meta"; meta.textContent=[item.category,item.industry,item.active?"Published":"Hidden"].filter(Boolean).join(" · ");
    const actions=document.createElement("div"); actions.className="item-actions";
    const edit=document.createElement("button"); edit.type="button"; edit.textContent="Edit"; edit.dataset.action="edit"; edit.dataset.id=item.id;
    const remove=document.createElement("button"); remove.type="button"; remove.textContent="Delete"; remove.className="delete"; remove.dataset.action="delete"; remove.dataset.id=item.id;
    actions.append(edit,remove); info.append(title,meta,actions); card.append(info); designList.append(card);
  });
}

async function editItem(id) {
  const item=currentItems.find((entry)=>entry.id===id); if(!item) return;
  status("Loading private prompt…");
  const privateSnap=await getDoc(doc(db,"showcase_private",id));
  if(!privateSnap.exists()) throw new Error("The private prompt record is missing. This design cannot be edited until its prompt record is restored.");
  const secret=privateSnap.data();
  $("design-id").value=id; $("title").value=item.title||""; $("category").value=item.category||"Sites";
  $("industry").value=item.industry||""; $("summary").value=item.summary||"";
  $("prompt").value=secret.prompt||""; $("notes").value=secret.internalNotes||"";
  $("featured").checked=Boolean(item.featured); $("active").checked=Boolean(item.active);
  currentImageUrl=item.imageUrl||""; currentImagePath=item.imagePath||""; fileInput.value="";
  showImage(currentImageUrl); $("form-heading").textContent="Edit design"; saveButton.textContent="Update design";
  status("Private prompt loaded for admin only."); form.scrollIntoView({behavior:"smooth",block:"start"});
}

async function saveItem(event) {
  event.preventDefault();
  const id=$("design-id").value || crypto.randomUUID();
  const title=cleanText($("title").value,80);
  const category=$("category").value;
  const industry=cleanText($("industry").value,40);
  const summary=cleanText($("summary").value,220);
  const prompt=cleanText($("prompt").value,16000);
  const notes=cleanText($("notes").value,1000);
  const file=fileInput.files?.[0];
  if(!title||!industry||!summary||!prompt){message(workspaceAlert,"Title, industry, summary and private prompt are required.","warning");return;}
  if(!currentImageUrl && !file){message(workspaceAlert,"Add a visual preview image before saving this design.","warning");return;}
  if(file && (!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8*1024*1024)){message(workspaceAlert,"Image must be JPG, PNG or WebP and smaller than 8 MB.","warning");return;}
  saveButton.disabled=true;status("Saving securely…");
  let uploadedPath="";
  try{
    let imageUrl=currentImageUrl,imagePath=currentImagePath;
    if(file){
      uploadedPath=`showcase/${id}/${crypto.randomUUID()}`;
      const imageRef=ref(storage,uploadedPath);
      await uploadBytes(imageRef,file,{contentType:file.type,cacheControl:"public,max-age=31536000"});
      imageUrl=await getDownloadURL(imageRef);imagePath=uploadedPath;
    }
    const existing=currentItems.find((item)=>item.id===id);
    const publicData={
      title,category,industry,summary,imageUrl,imagePath,
      featured:$("featured").checked,active:$("active").checked,
      sortOrder:Number(existing?.sortOrder||Date.now()),
      createdAt:existing?.createdAt||serverTimestamp(),updatedAt:serverTimestamp()
    };
    const batch=writeBatch(db);
    batch.set(doc(db,"showcase_public",id),publicData,{merge:true});
    batch.set(doc(db,"showcase_private",id),{prompt,internalNotes:notes,updatedAt:serverTimestamp()},{merge:true});
    await batch.commit();
    if(file && currentImagePath && currentImagePath!==uploadedPath){
      try{await deleteObject(ref(storage,currentImagePath));}catch(cleanupError){console.warn("Old preview cleanup failed",cleanupError);}
    }
    currentImageUrl=imageUrl;currentImagePath=imagePath;
    resetForm();await loadItems();message(workspaceAlert,"Design saved. The prompt is private; only its visual card is public.");
  }catch(error){
    if(uploadedPath){try{await deleteObject(ref(storage,uploadedPath));}catch{}}
    console.error("[AJAYNXT Admin]",error);message(workspaceAlert,"Save failed. Check Firebase setup, billing, and security rules, then retry. "+(error.code||""),"warning");status("Not saved.");
  }finally{saveButton.disabled=false;}
}

async function deleteItem(id) {
  const item=currentItems.find((entry)=>entry.id===id);
  if(!item||!confirm(`Delete "${item.title}" and its private prompt? This cannot be undone.`))return;
  try{
    const batch=writeBatch(db);
    batch.delete(doc(db,"showcase_public",id));batch.delete(doc(db,"showcase_private",id));
    await batch.commit();
    if(item.imagePath){try{await deleteObject(ref(storage,item.imagePath));}catch(error){console.warn("Image cleanup failed",error);}}
    if($("design-id").value===id)resetForm();
    await loadItems();message(workspaceAlert,"Design and private prompt deleted.");
  }catch(error){console.error(error);message(workspaceAlert,"Delete failed. Check Firebase security rules and try again.","warning");}
}

designList.addEventListener("click",async(event)=>{
  const button=event.target.closest("button[data-action]");if(!button)return;
  button.disabled=true;
  try{if(button.dataset.action==="edit")await editItem(button.dataset.id);else await deleteItem(button.dataset.id);}
  catch(error){message(workspaceAlert,error.message||"This action failed.","warning");}
  finally{button.disabled=false;}
});
form.addEventListener("submit",saveItem);
$("reset-form").addEventListener("click",resetForm);
$("refresh-list").addEventListener("click",()=>loadItems().catch((error)=>message(workspaceAlert,"Could not refresh the list. "+(error.code||""),"warning")));
signInButton.addEventListener("click",async()=>{
  if(!firebaseReady){message(loginAlert,"Firebase configuration is incomplete. Follow FIREBASE_SETUP.md first.","warning");return;}
  signInButton.disabled=true;
  try{await signInWithPopup(auth,googleProvider);}
  catch(error){console.error(error);message(loginAlert,"Google sign-in was not completed. "+(error.code||"Please retry."),"warning");}
  finally{signInButton.disabled=false;}
});
signOutButton.addEventListener("click",()=>signOut(auth));

if(!firebaseReady){
  setupAlert.hidden=false;setupAlert.textContent="Firebase Web App settings are not configured yet. Add the project values in firebase-config.js and deploy Firestore/Storage security rules before using this panel.";
  signInButton.disabled=true;
}
onAuthStateChanged(auth,(user)=>{
  currentUser=user||null;
  if(!user){loginPanel.hidden=false;workspace.hidden=true;signOutButton.hidden=true;$("account-state").textContent="Not signed in";return;}
  if(user.email!==ADMIN_EMAIL||!user.emailVerified){
    signOut(auth).catch(()=>{});
    loginPanel.hidden=false;workspace.hidden=true;
    message(loginAlert,"Access denied. Sign in with the verified authorised owner account.","warning");
    return;
  }
  loginPanel.hidden=true;workspace.hidden=false;signOutButton.hidden=false;
  $("account-state").textContent=user.email;
  loadItems().catch((error)=>message(workspaceAlert,"Could not load designs. Check Firestore rules. "+(error.code||""),"warning"));
});
