/* Water Footprint Decision Tool - extracted application logic */

// ===== inline-script-3 =====
// ══════════════════════════════════════════
//  AUTH SYSTEM — كل البيانات في localStorage
// ══════════════════════════════════════════
(function(){
  const STORE_KEY = 'iwf_users_v1';
  const SESSION_KEY = 'iwf_session_v1';

  // المستخدم الافتراضي
  function getUsers(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    // Default admin
    return [{username:'admin', password:'admin123', role:'admin'}];
  }

  function saveUsers(users){
    localStorage.setItem(STORE_KEY, JSON.stringify(users));
  }

  function getSession(){
    try{ return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }catch(e){ return null; }
  }

  function setSession(user){
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({username:user.username, role:user.role}));
  }

  // hash بسيط (XOR + base64) — كافي للحماية offline
  function simpleHash(str){
    let h = 0;
    for(let i=0;i<str.length;i++) h = (Math.imul(31,h)+str.charCodeAt(i))|0;
    return h.toString(36);
  }

  window.doLogin = function(){
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const err = document.getElementById('loginError');
    if(!u||!p){ showErr('يرجى إدخال اسم المستخدم وكلمة المرور'); return; }
    const users = getUsers();
    const found = users.find(x => x.username===u && x.password===p);
    if(!found){ showErr('اسم المستخدم أو كلمة المرور غير صحيحة'); return; }
    setSession(found);
    document.getElementById('loginOverlay').style.display='none';
    // Show admin button if admin
    if(found.role==='admin') showAdminBtn();
  };

  function showErr(msg){
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(()=>el.style.display='none', 3500);
  }

  window.togglePass = function(){
    const inp = document.getElementById('loginPass');
    const eye = document.getElementById('passEye');
    if(inp.type==='password'){ inp.type='text'; eye.textContent='🙈'; }
    else { inp.type='password'; eye.textContent='👁️'; }
  };

  function showAdminBtn(){
    if(document.getElementById('adminFloatBtn')) return;
    const btn = document.createElement('button');
    btn.id='adminFloatBtn';
    btn.textContent=((localStorage.getItem('programLang')||'ar')==='ar')?'⚙️ المستخدمين':'⚙️ Users';
    btn.style.cssText=`
      position:fixed;bottom:20px;left:20px;z-index:9999;
      background:linear-gradient(135deg,#0b3b43,#0f766e);
      color:white;border:none;border-radius:999px;
      padding:10px 16px;font-size:13px;font-weight:900;
      box-shadow:0 8px 24px rgba(15,118,110,.35);cursor:pointer;
      font-family:'Segoe UI',Tahoma,Arial,sans-serif;
    `;
    btn.onclick = openAdmin;
    document.body.appendChild(btn);

    // Logout button
    const logBtn = document.createElement('button');
    logBtn.id='logoutFloatBtn';
    logBtn.textContent=((localStorage.getItem('programLang')||'ar')==='ar')?'🚪 خروج':'🚪 Logout';
    logBtn.style.cssText=`
      position:fixed;bottom:20px;right:20px;z-index:9999;
      background:rgba(220,38,38,.9);
      color:white;border:none;border-radius:999px;
      padding:10px 16px;font-size:13px;font-weight:900;
      box-shadow:0 8px 24px rgba(220,38,38,.3);cursor:pointer;
      font-family:'Segoe UI',Tahoma,Arial,sans-serif;
    `;
    logBtn.onclick = doLogout;
    document.body.appendChild(logBtn);
  }

  window.doLogout = function(){
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  };

  window.openAdmin = function(){
    if(!checkAdmin()) return;
    renderUsersList();
    const p = document.getElementById('adminPanel');
    p.style.display='flex';
  };

  window.closeAdmin = function(){
    document.getElementById('adminPanel').style.display='none';
  };

  function checkAdmin(){
    const s = getSession();
    return s && s.role==='admin';
  }

  window.addUser = function(){
    if(!checkAdmin()) return;
    const u = document.getElementById('newUsername').value.trim();
    const p = document.getElementById('newPassword').value;
    const r = document.getElementById('newRole').value;
    const msg = document.getElementById('addUserMsg');
    if(!u||!p){ msg.style.color='#dc2626'; msg.textContent='⚠️ أدخل الاسم وكلمة المرور'; return; }
    const users = getUsers();
    if(users.find(x=>x.username===u)){ msg.style.color='#dc2626'; msg.textContent='⚠️ الاسم موجود بالفعل'; return; }
    users.push({username:u, password:p, role:r});
    saveUsers(users);
    document.getElementById('newUsername').value='';
    document.getElementById('newPassword').value='';
    msg.style.color='#16a34a'; msg.textContent='✅ تمت الإضافة';
    setTimeout(()=>msg.textContent='', 2500);
    renderUsersList();
  };

  window.deleteUser = function(uname){
    if(!checkAdmin()) return;
    const s = getSession();
    if(s && s.username===uname){ alert('لا يمكن حذف حسابك الحالي'); return; }
    let users = getUsers().filter(x=>x.username!==uname);
    saveUsers(users);
    renderUsersList();
  };

  function renderUsersList(){
    const users = getUsers();
    const wrap = document.getElementById('usersList');
    if(!wrap) return;
    wrap.innerHTML = users.map(u=>`
      <div style="display:flex;align-items:center;justify-content:space-between;
        border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;margin-bottom:8px;background:#fafafa;">
        <div>
          <span style="font-weight:900;font-size:14px;">${u.username}</span>
          <span style="margin-right:8px;background:${u.role==='admin'?'#dcfce7':'#f1f5f9'};
            color:${u.role==='admin'?'#166534':'#475569'};
            border-radius:999px;padding:2px 8px;font-size:11px;font-weight:900;">${u.role==='admin'?'مدير':'مستخدم'}</span>
        </div>
        <button onclick="deleteUser('${u.username}')" style="
          background:#fee2e2;color:#dc2626;border:none;border-radius:8px;
          padding:6px 10px;font-size:12px;cursor:pointer;font-weight:900;
          min-height:unset;box-shadow:none;
        ">حذف</button>
      </div>
    `).join('');
  }

  // Enter key on login
  document.addEventListener('DOMContentLoaded', function(){
    ['loginUser','loginPass'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.addEventListener('keydown', e=>{ if(e.key==='Enter') window.doLogin(); });
    });
    // Focus input styles
    document.querySelectorAll('#loginUser,#loginPass').forEach(inp=>{
      inp.addEventListener('focus',()=>inp.style.borderColor='#0f766e');
      inp.addEventListener('blur',()=>inp.style.borderColor='#cbd5e1');
    });
  });

  // Check session on load
  const session = getSession();
  if(session){
    document.getElementById('loginOverlay').style.display='none';
    if(session.role==='admin'){
      document.addEventListener('DOMContentLoaded', showAdminBtn);
    }
  }

})();


// ===== inline-script-4 =====
const governorates = [
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "station": "Aswan",
    "region": "Upper Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 24.0889,
    "lon": 32.8998,
    "elev": 194,
    "peffFraction": 0.05,
    "et0": 6.005,
    "annualETo": 2197.8,
    "maxMonthlyETo": 278.6,
    "minMonthlyETo": 97.1,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 318885,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "station": "Luxor",
    "region": "Upper Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 25.6872,
    "lon": 32.6396,
    "elev": 76,
    "peffFraction": 0.05,
    "et0": 5.733,
    "annualETo": 2098.3,
    "maxMonthlyETo": 269.5,
    "minMonthlyETo": 90.6,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 146245,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "station": "Qena",
    "region": "Upper Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 26.1551,
    "lon": 32.716,
    "elev": 75,
    "peffFraction": 0.05,
    "et0": 5.652,
    "annualETo": 2068.4,
    "maxMonthlyETo": 266.2,
    "minMonthlyETo": 88.9,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 270449,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "station": "Sohag",
    "region": "Upper Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 26.5591,
    "lon": 31.6957,
    "elev": 61,
    "peffFraction": 0.05,
    "et0": 5.591,
    "annualETo": 2046.3,
    "maxMonthlyETo": 263.8,
    "minMonthlyETo": 87.4,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 359681,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "station": "Assiut",
    "region": "Upper Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 27.1801,
    "lon": 31.1893,
    "elev": 70,
    "peffFraction": 0.05,
    "et0": 5.468,
    "annualETo": 2001.3,
    "maxMonthlyETo": 259.9,
    "minMonthlyETo": 84.4,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 354744,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "station": "Kharga",
    "region": "Western Desert",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 25.439,
    "lon": 30.5586,
    "elev": 73,
    "peffFraction": 0.04,
    "et0": 6.645,
    "annualETo": 2431.7,
    "maxMonthlyETo": 304.8,
    "minMonthlyETo": 109.6,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 33,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 512304,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "station": "Hurghada",
    "region": "Red Sea Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 27.2579,
    "lon": 33.8116,
    "elev": 14,
    "peffFraction": 0.08,
    "et0": 5.774,
    "annualETo": 2113.3,
    "maxMonthlyETo": 279.2,
    "minMonthlyETo": 87.3,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 11,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 560,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "station": "Minya",
    "region": "Middle Egypt",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 28.1099,
    "lon": 30.7503,
    "elev": 47,
    "peffFraction": 0.06,
    "et0": 4.621,
    "annualETo": 1691.4,
    "maxMonthlyETo": 223.5,
    "minMonthlyETo": 68.5,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 524821,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "station": "Beni Suef",
    "region": "Nile Valley",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 29.0661,
    "lon": 31.0994,
    "elev": 28,
    "peffFraction": 0.08,
    "et0": 4.466,
    "annualETo": 1634.7,
    "maxMonthlyETo": 217.8,
    "minMonthlyETo": 65.6,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 324113,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "station": "Fayoum",
    "region": "Nile Valley",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 29.3084,
    "lon": 30.8428,
    "elev": 22,
    "peffFraction": 0.08,
    "et0": 4.433,
    "annualETo": 1622.5,
    "maxMonthlyETo": 216.4,
    "minMonthlyETo": 64.2,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 374464,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "station": "Giza",
    "region": "Nile Valley",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.0131,
    "lon": 31.2089,
    "elev": 30,
    "peffFraction": 0.08,
    "et0": 4.317,
    "annualETo": 1580.0,
    "maxMonthlyETo": 211.6,
    "minMonthlyETo": 62.0,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 222865,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "station": "Cairo",
    "region": "Urban/Nile",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.0444,
    "lon": 31.2357,
    "elev": 23,
    "peffFraction": 0.1,
    "et0": 4.313,
    "annualETo": 1578.8,
    "maxMonthlyETo": 211.6,
    "minMonthlyETo": 61.9,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 20484,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "station": "Banha",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.4663,
    "lon": 31.1848,
    "elev": 16,
    "peffFraction": 0.35,
    "et0": 3.942,
    "annualETo": 1443.2,
    "maxMonthlyETo": 198.2,
    "minMonthlyETo": 53.4,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 268116,
    "arablePrivateFeddan": 235260,
    "arableGovernmentFeddan": 32856,
    "arableSource": "CAPMAS 2015 Table 6",
    "arableReferenceUrl": "https://censusinfo.capmas.gov.eg/Metadata-en-v4.2/index.php/catalog/299/download/583",
    "arableNote": "قيمة منشورة تفصيليًا في النشرة الرسمية المتاحة"
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "station": "Zagazig",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.5877,
    "lon": 31.502,
    "elev": 13,
    "peffFraction": 0.35,
    "et0": 3.923,
    "annualETo": 1436.1,
    "maxMonthlyETo": 197.7,
    "minMonthlyETo": 53.0,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 893510,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "station": "Ismailia",
    "region": "Canal/Sinai Edge",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.5965,
    "lon": 32.2715,
    "elev": 13,
    "peffFraction": 0.26,
    "et0": 4.083,
    "annualETo": 1494.7,
    "maxMonthlyETo": 203.7,
    "minMonthlyETo": 55.9,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 377515,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "station": "Suez",
    "region": "Canal/Suez Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 29.9668,
    "lon": 32.5498,
    "elev": 8,
    "peffFraction": 0.12,
    "et0": 4.18,
    "annualETo": 1530.1,
    "maxMonthlyETo": 207.5,
    "minMonthlyETo": 58.1,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 11,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 42608,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "station": "El Tor",
    "region": "Sinai/Red Sea",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 28.2417,
    "lon": 33.6222,
    "elev": 20,
    "peffFraction": 0.15,
    "et0": 5.558,
    "annualETo": 2034.5,
    "maxMonthlyETo": 271.1,
    "minMonthlyETo": 82.6,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 47,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 31134,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "station": "El Arish",
    "region": "Mediterranean/Sinai",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.1316,
    "lon": 33.7984,
    "elev": 32,
    "peffFraction": 0.35,
    "et0": 3.559,
    "annualETo": 1302.8,
    "maxMonthlyETo": 179.7,
    "minMonthlyETo": 49.8,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 47,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 24567,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "station": "Mansoura",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.0409,
    "lon": 31.3785,
    "elev": 12,
    "peffFraction": 0.35,
    "et0": 3.857,
    "annualETo": 1411.9,
    "maxMonthlyETo": 194.7,
    "minMonthlyETo": 50.9,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 645422,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "station": "Tanta",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.7865,
    "lon": 31.0004,
    "elev": 15,
    "peffFraction": 0.35,
    "et0": 3.892,
    "annualETo": 1424.9,
    "maxMonthlyETo": 195.7,
    "minMonthlyETo": 51.7,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 379616,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "station": "Shibin El Kom",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.5586,
    "lon": 31.01,
    "elev": 18,
    "peffFraction": 0.35,
    "et0": 3.927,
    "annualETo": 1437.6,
    "maxMonthlyETo": 197.8,
    "minMonthlyETo": 53.3,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 415976,
    "arablePrivateFeddan": 357994,
    "arableGovernmentFeddan": 57982,
    "arableSource": "CAPMAS 2015 Table 6",
    "arableReferenceUrl": "https://censusinfo.capmas.gov.eg/Metadata-en-v4.2/index.php/catalog/299/download/583",
    "arableNote": "قيمة منشورة تفصيليًا في النشرة الرسمية المتاحة"
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "station": "Kafr El Sheikh",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.1107,
    "lon": 30.9388,
    "elev": 6,
    "peffFraction": 0.35,
    "et0": 3.844,
    "annualETo": 1407.3,
    "maxMonthlyETo": 194.2,
    "minMonthlyETo": 50.6,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 543138,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "station": "Damanhur",
    "region": "Delta",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.0341,
    "lon": 30.4682,
    "elev": 9,
    "peffFraction": 0.35,
    "et0": 3.857,
    "annualETo": 1411.9,
    "maxMonthlyETo": 194.7,
    "minMonthlyETo": 50.9,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 922716,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "station": "Damietta",
    "region": "Mediterranean Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.4165,
    "lon": 31.8133,
    "elev": 5,
    "peffFraction": 0.48,
    "et0": 3.513,
    "annualETo": 1286.1,
    "maxMonthlyETo": 178.6,
    "minMonthlyETo": 49.0,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 112524,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "station": "Port Said",
    "region": "Mediterranean Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.2653,
    "lon": 32.3019,
    "elev": 3,
    "peffFraction": 0.48,
    "et0": 3.539,
    "annualETo": 1295.3,
    "maxMonthlyETo": 179.1,
    "minMonthlyETo": 49.4,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 60102,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "station": "Marsa Matruh",
    "region": "Mediterranean Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.3543,
    "lon": 27.2373,
    "elev": 30,
    "peffFraction": 0.48,
    "et0": 3.525,
    "annualETo": 1290.5,
    "maxMonthlyETo": 178.7,
    "minMonthlyETo": 49.1,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 489525,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "station": "Alexandria",
    "region": "Mediterranean Coast",
    "climateSourceRegion": "WorldData rainfall region + Uploaded ETo file",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 31.2001,
    "lon": 29.9187,
    "elev": 5,
    "peffFraction": 0.48,
    "et0": 3.544,
    "annualETo": 1297.5,
    "maxMonthlyETo": 179.2,
    "minMonthlyETo": 49.7,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "ETo calibrated from uploaded 10-year file (2016-2025); rainfall remains regionalized and editable. Peak ETo month: يوليو.",
    "arableTotalFeddan": 151030,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "إجمالي المساحة المنزرعة الرسمي (أراضٍ قديمة + أراضٍ جديدة) للسنة الزراعية 2020/2021؛ تم تحديثها لتطابق الخريطة الزراعية الجديدة.",
    "cultivatedAreaType": "Official total cultivated area",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Updated Egypt agricultural crop, medicinal/aromatic plants, clusters and projects map"
  }
  ,
  {
    "governorate": "Nubaria Agricultural Cluster",
    "arabic": "تجمع النوبارية الزراعي",
    "station": "Nubaria / Beheira proxy",
    "region": "Agricultural Cluster - Western Delta",
    "climateSourceRegion": "Proxy climate: Beheira/Alexandria western Delta fringe + uploaded ETo layer",
    "years": "2016-2025",
    "nYears": 10,
    "lat": 30.75,
    "lon": 30.10,
    "elev": 20,
    "peffFraction": 0.35,
    "et0": 3.857,
    "annualETo": 1411.9,
    "maxMonthlyETo": 194.7,
    "minMonthlyETo": 50.9,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 91,
    "note": "Agricultural cluster added to the governorate selector. Climate values use Beheira/Alexandria western Delta proxy and remain editable.",
    "arableTotalFeddan": 998526,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17 - Nubaria listing",
    "arableReferenceUrl": "https://www.agri.gov.eg/uploads/topics/16692385498467.pdf",
    "arableNote": "Official cultivated-area listing for Nubaria; not a standard governorate. Added to selector as an agricultural cluster for planning comparison.",
    "cultivatedAreaType": "Agricultural cluster cultivated area - not a standard governorate",
    "cultivatedAreaYear": "2020/2021",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "cluster",
    "agriZoneCategory": "Agricultural Cluster",
    "mainCrops": "wheat, maize, potatoes, vegetables, orchards",
    "medicinalAromatic": "mint, basil, aromatic herbs",
    "projectLocation": "West of the old Delta / northwest desert fringe"
  },
  {
    "governorate": "New Delta Project",
    "arabic": "مشروع الدلتا الجديدة",
    "station": "Western Desert / Dabaa Axis proxy",
    "region": "National Agricultural Project - Western Desert",
    "climateSourceRegion": "Proxy climate: Matrouh/Western Delta desert fringe + editable user inputs",
    "years": "2016-2025 proxy",
    "nYears": 10,
    "lat": 30.45,
    "lon": 29.30,
    "elev": 60,
    "peffFraction": 0.30,
    "et0": 4.10,
    "annualETo": 1498.0,
    "maxMonthlyETo": 205.0,
    "minMonthlyETo": 55.0,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 70,
    "note": "National project added to the governorate selector. Area is project/reclamation target area, not governorate cultivated area. Climate is a regional proxy and should be replaced with field data when available.",
    "arableTotalFeddan": 2200000,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "Official Presidency / State Information Service project pages - New Delta target area",
    "arableReferenceUrl": "https://www.presidency.eg/",
    "arableNote": "Project target/reclamation area; added to selector for planning scenarios, not counted as a standard governorate.",
    "cultivatedAreaType": "Major national agricultural project target area",
    "cultivatedAreaYear": "Project target",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "project",
    "agriZoneCategory": "Major New Agricultural Project",
    "mainCrops": "strategic crops, wheat, maize, vegetables, orchards",
    "medicinalAromatic": "site-specific; user input recommended",
    "projectLocation": "Western Desert, west of the old Delta, along and south of El Dabaa axis"
  },
  {
    "governorate": "Future of Egypt Project",
    "arabic": "مشروع مستقبل مصر",
    "station": "Rod El Farag-El Dabaa Axis proxy",
    "region": "National Agricultural Project - New Delta",
    "climateSourceRegion": "Proxy climate: Western Delta / Dabaa axis + editable user inputs",
    "years": "2016-2025 proxy",
    "nYears": 10,
    "lat": 30.35,
    "lon": 30.00,
    "elev": 55,
    "peffFraction": 0.30,
    "et0": 4.05,
    "annualETo": 1480.0,
    "maxMonthlyETo": 203.0,
    "minMonthlyETo": 54.0,
    "peakMonth": "يوليو",
    "alpha": 0.12,
    "rain": 70,
    "note": "First project within the New Delta scheme. Added to governorate selector as a planning zone; climate is proxy and editable.",
    "arableTotalFeddan": 1050000,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "Official Presidency / SIS pages - Future of Egypt target area",
    "arableReferenceUrl": "https://www.presidency.eg/",
    "arableNote": "Target area within New Delta; not a standard governorate.",
    "cultivatedAreaType": "Major national agricultural project target area",
    "cultivatedAreaYear": "Project target",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "project",
    "agriZoneCategory": "Major New Agricultural Project",
    "mainCrops": "wheat, maize, sunflower, alfalfa, vegetables",
    "medicinalAromatic": "site-specific; user input recommended",
    "projectLocation": "Along Rod El Farag-El Dabaa axis, northwest of Cairo"
  },
  {
    "governorate": "Toshka Al-Khair Project",
    "arabic": "مشروع توشكى الخير",
    "station": "Toshka / Aswan proxy",
    "region": "National Agricultural Project - South Valley",
    "climateSourceRegion": "Proxy climate: Aswan / Toshka desert + editable user inputs",
    "years": "2016-2025 proxy",
    "nYears": 10,
    "lat": 22.65,
    "lon": 31.35,
    "elev": 190,
    "peffFraction": 0.05,
    "et0": 6.005,
    "annualETo": 2197.8,
    "maxMonthlyETo": 278.6,
    "minMonthlyETo": 97.1,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 4,
    "note": "Toshka / South Valley project. Climate values use Aswan proxy and are editable.",
    "arableTotalFeddan": 1100000,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "State Information Service / official agriculture strategy pages - Toshka Al-Khair area",
    "arableReferenceUrl": "https://sis.gov.eg/",
    "arableNote": "Project/reclamation area; not a standard governorate.",
    "cultivatedAreaType": "Major national agricultural project target area",
    "cultivatedAreaYear": "Project target",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "project",
    "agriZoneCategory": "Major New Agricultural Project",
    "mainCrops": "wheat, dates, sugar crops, strategic crops",
    "medicinalAromatic": "hibiscus, medicinal herbs",
    "projectLocation": "Toshka / South Valley, south of Aswan near Lake Nasser"
  },
  {
    "governorate": "North & Central Sinai Development Project",
    "arabic": "مشروع تنمية شمال ووسط سيناء",
    "station": "North/Central Sinai proxy",
    "region": "National Agricultural Project - Sinai",
    "climateSourceRegion": "Proxy climate: North Sinai / Canal-Sinai edge + editable user inputs",
    "years": "2016-2025 proxy",
    "nYears": 10,
    "lat": 30.65,
    "lon": 33.80,
    "elev": 120,
    "peffFraction": 0.18,
    "et0": 4.45,
    "annualETo": 1624.0,
    "maxMonthlyETo": 220.0,
    "minMonthlyETo": 62.0,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 55,
    "note": "North and Central Sinai development zone. Climate values are proxy and should be checked locally.",
    "arableTotalFeddan": 456000,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "Official Presidency / SIS pages - Sinai agricultural development area",
    "arableReferenceUrl": "https://www.presidency.eg/",
    "arableNote": "Project/reclamation area linked to treated-water development; not a standard governorate.",
    "cultivatedAreaType": "Major national agricultural project target area",
    "cultivatedAreaYear": "Project target",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "project",
    "agriZoneCategory": "Major New Agricultural Project",
    "mainCrops": "olives, barley, wheat, vegetables",
    "medicinalAromatic": "medicinal herbs",
    "projectLocation": "North and Central Sinai; linked to treated-water development"
  },
  {
    "governorate": "Future of Egypt - East Owainat",
    "arabic": "مستقبل مصر - شرق العوينات",
    "station": "East Owainat / New Valley proxy",
    "region": "National Agricultural Project - Southwestern New Valley",
    "climateSourceRegion": "Proxy climate: New Valley / East Owainat desert + editable user inputs",
    "years": "2016-2025 proxy",
    "nYears": 10,
    "lat": 22.45,
    "lon": 28.70,
    "elev": 260,
    "peffFraction": 0.04,
    "et0": 6.645,
    "annualETo": 2431.7,
    "maxMonthlyETo": 304.8,
    "minMonthlyETo": 109.6,
    "peakMonth": "يوليو",
    "alpha": 0.15,
    "rain": 20,
    "note": "Future of Egypt - East Owainat phase added to selector as a planning zone; climate values use New Valley desert proxy and are editable.",
    "arableTotalFeddan": 230000,
    "arablePrivateFeddan": null,
    "arableGovernmentFeddan": null,
    "arableSource": "Official Presidency national projects page - East Owainat target area",
    "arableReferenceUrl": "https://www.presidency.eg/",
    "arableNote": "Project target area; Phase I completed on part of the area; not a standard governorate.",
    "cultivatedAreaType": "Major national agricultural project target area",
    "cultivatedAreaYear": "Project target",
    "cropMapLayer": "Old map with added agricultural clusters and national projects",
    "isAgriZone": true,
    "agriZoneType": "project",
    "agriZoneCategory": "Major New Agricultural Project",
    "mainCrops": "corn, wheat, sunflower, alfalfa",
    "medicinalAromatic": "site-specific; user input recommended",
    "projectLocation": "Southwestern New Valley near East Owainat / Al-Dakhla-Owainat axis"
  }

];

const monthlyEToAverages = [
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.609,
    "etoMonth": 49.9,
    "tmin": 8.7,
    "tmax": 14.7,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 1.994,
    "etoMonth": 56.4,
    "tmin": 9.3,
    "tmax": 15.3,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.694,
    "etoMonth": 83.5,
    "tmin": 11.7,
    "tmax": 17.7,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 3.76,
    "etoMonth": 112.8,
    "tmin": 15.2,
    "tmax": 21.2,
    "rh": 74.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 4.829,
    "etoMonth": 149.7,
    "tmin": 18.9,
    "tmax": 24.9,
    "rh": 70.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 5.584,
    "etoMonth": 167.5,
    "tmin": 21.9,
    "tmax": 27.9,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 5.779,
    "etoMonth": 179.2,
    "tmin": 23.2,
    "tmax": 29.2,
    "rh": 66.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.323,
    "etoMonth": 165.0,
    "tmin": 22.6,
    "tmax": 28.6,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.299,
    "etoMonth": 129.0,
    "tmin": 20.3,
    "tmax": 26.3,
    "rh": 69.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.019,
    "etoMonth": 93.6,
    "tmin": 16.7,
    "tmax": 22.7,
    "rh": 73.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.039,
    "etoMonth": 61.2,
    "tmin": 13.0,
    "tmax": 19.0,
    "rh": 76.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Alexandria",
    "arabic": "الإسكندرية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.602,
    "etoMonth": 49.7,
    "tmin": 10.1,
    "tmax": 16.1,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.721,
    "etoMonth": 84.4,
    "tmin": 10.1,
    "tmax": 21.1,
    "rh": 56.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.246,
    "etoMonth": 91.9,
    "tmin": 10.9,
    "tmax": 21.9,
    "rh": 55.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.289,
    "etoMonth": 133.0,
    "tmin": 14.2,
    "tmax": 25.2,
    "rh": 52.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.737,
    "etoMonth": 172.1,
    "tmin": 19.0,
    "tmax": 30.0,
    "rh": 47.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.126,
    "etoMonth": 220.9,
    "tmin": 24.2,
    "tmax": 35.2,
    "rh": 42.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.066,
    "etoMonth": 242.0,
    "tmin": 28.2,
    "tmax": 39.2,
    "rh": 38.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.385,
    "etoMonth": 259.9,
    "tmin": 30.1,
    "tmax": 41.1,
    "rh": 36.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 7.908,
    "etoMonth": 245.1,
    "tmin": 29.3,
    "tmax": 40.3,
    "rh": 37.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 6.649,
    "etoMonth": 199.5,
    "tmin": 26.0,
    "tmax": 37.0,
    "rh": 40.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.019,
    "etoMonth": 155.6,
    "tmin": 21.1,
    "tmax": 32.1,
    "rh": 45.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.624,
    "etoMonth": 108.7,
    "tmin": 16.0,
    "tmax": 27.0,
    "rh": 50.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Assiut",
    "arabic": "أسيوط",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.846,
    "etoMonth": 88.2,
    "tmin": 12.0,
    "tmax": 23.0,
    "rh": 54.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 3.131,
    "etoMonth": 97.1,
    "tmin": 12.1,
    "tmax": 23.1,
    "rh": 54.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.664,
    "etoMonth": 103.7,
    "tmin": 12.9,
    "tmax": 23.9,
    "rh": 53.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.781,
    "etoMonth": 148.2,
    "tmin": 16.4,
    "tmax": 27.4,
    "rh": 49.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 6.278,
    "etoMonth": 188.3,
    "tmin": 21.6,
    "tmax": 32.6,
    "rh": 44.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.676,
    "etoMonth": 238.0,
    "tmin": 27.1,
    "tmax": 38.1,
    "rh": 39.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.653,
    "etoMonth": 259.6,
    "tmin": 31.4,
    "tmax": 42.4,
    "rh": 34.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.987,
    "etoMonth": 278.6,
    "tmin": 33.4,
    "tmax": 44.4,
    "rh": 32.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.545,
    "etoMonth": 264.9,
    "tmin": 32.5,
    "tmax": 43.5,
    "rh": 33.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 7.284,
    "etoMonth": 218.5,
    "tmin": 29.0,
    "tmax": 40.0,
    "rh": 37.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.623,
    "etoMonth": 174.3,
    "tmin": 23.8,
    "tmax": 34.8,
    "rh": 42.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 4.162,
    "etoMonth": 124.8,
    "tmin": 18.4,
    "tmax": 29.4,
    "rh": 47.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Aswan",
    "arabic": "أسوان",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 3.282,
    "etoMonth": 101.7,
    "tmin": 14.1,
    "tmax": 25.1,
    "rh": 52.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.643,
    "etoMonth": 50.9,
    "tmin": 9.0,
    "tmax": 16.0,
    "rh": 75.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.109,
    "etoMonth": 59.7,
    "tmin": 9.6,
    "tmax": 16.6,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.953,
    "etoMonth": 91.5,
    "tmin": 12.3,
    "tmax": 19.3,
    "rh": 72.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.14,
    "etoMonth": 124.2,
    "tmin": 16.2,
    "tmax": 23.2,
    "rh": 68.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.3,
    "etoMonth": 164.3,
    "tmin": 20.3,
    "tmax": 27.3,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.077,
    "etoMonth": 182.3,
    "tmin": 23.6,
    "tmax": 30.6,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.282,
    "etoMonth": 194.7,
    "tmin": 25.1,
    "tmax": 32.1,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.827,
    "etoMonth": 180.6,
    "tmin": 24.4,
    "tmax": 31.4,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.693,
    "etoMonth": 140.8,
    "tmin": 21.8,
    "tmax": 28.8,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.337,
    "etoMonth": 103.4,
    "tmin": 17.9,
    "tmax": 24.9,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.235,
    "etoMonth": 67.1,
    "tmin": 13.7,
    "tmax": 20.7,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Beheira",
    "arabic": "البحيرة",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.687,
    "etoMonth": 52.3,
    "tmin": 10.5,
    "tmax": 17.5,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.116,
    "etoMonth": 65.6,
    "tmin": 9.9,
    "tmax": 17.9,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.58,
    "etoMonth": 73.0,
    "tmin": 10.6,
    "tmax": 18.6,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.509,
    "etoMonth": 108.8,
    "tmin": 13.5,
    "tmax": 21.5,
    "rh": 61.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.761,
    "etoMonth": 142.8,
    "tmin": 17.7,
    "tmax": 25.7,
    "rh": 57.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.965,
    "etoMonth": 184.9,
    "tmin": 22.1,
    "tmax": 30.1,
    "rh": 52.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.761,
    "etoMonth": 202.8,
    "tmin": 25.6,
    "tmax": 33.6,
    "rh": 49.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 7.027,
    "etoMonth": 217.8,
    "tmin": 27.3,
    "tmax": 35.3,
    "rh": 47.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.543,
    "etoMonth": 202.8,
    "tmin": 26.5,
    "tmax": 34.5,
    "rh": 48.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.391,
    "etoMonth": 161.7,
    "tmin": 23.7,
    "tmax": 31.7,
    "rh": 51.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.976,
    "etoMonth": 123.3,
    "tmin": 19.5,
    "tmax": 27.5,
    "rh": 55.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.805,
    "etoMonth": 84.2,
    "tmin": 15.1,
    "tmax": 23.1,
    "rh": 59.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Beni Suef",
    "arabic": "بني سويف",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.161,
    "etoMonth": 67.0,
    "tmin": 11.6,
    "tmax": 19.6,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.998,
    "etoMonth": 61.9,
    "tmin": 9.3,
    "tmax": 17.3,
    "rh": 65.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.486,
    "etoMonth": 70.4,
    "tmin": 10.0,
    "tmax": 18.0,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.369,
    "etoMonth": 104.5,
    "tmin": 12.8,
    "tmax": 20.8,
    "rh": 62.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.635,
    "etoMonth": 139.0,
    "tmin": 16.9,
    "tmax": 24.9,
    "rh": 57.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.796,
    "etoMonth": 179.7,
    "tmin": 21.2,
    "tmax": 29.2,
    "rh": 53.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.58,
    "etoMonth": 197.4,
    "tmin": 24.6,
    "tmax": 32.6,
    "rh": 50.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.827,
    "etoMonth": 211.6,
    "tmin": 26.2,
    "tmax": 34.2,
    "rh": 48.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.347,
    "etoMonth": 196.8,
    "tmin": 25.5,
    "tmax": 33.5,
    "rh": 49.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.204,
    "etoMonth": 156.1,
    "tmin": 22.8,
    "tmax": 30.8,
    "rh": 52.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.807,
    "etoMonth": 118.0,
    "tmin": 18.7,
    "tmax": 26.7,
    "rh": 56.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.651,
    "etoMonth": 79.5,
    "tmin": 14.3,
    "tmax": 22.3,
    "rh": 60.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Cairo",
    "arabic": "القاهرة",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.058,
    "etoMonth": 63.8,
    "tmin": 10.9,
    "tmax": 18.9,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.643,
    "etoMonth": 50.9,
    "tmin": 9.0,
    "tmax": 16.0,
    "rh": 75.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.109,
    "etoMonth": 59.7,
    "tmin": 9.6,
    "tmax": 16.6,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.953,
    "etoMonth": 91.6,
    "tmin": 12.3,
    "tmax": 19.3,
    "rh": 72.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.14,
    "etoMonth": 124.2,
    "tmin": 16.2,
    "tmax": 23.2,
    "rh": 68.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.3,
    "etoMonth": 164.3,
    "tmin": 20.3,
    "tmax": 27.3,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.077,
    "etoMonth": 182.3,
    "tmin": 23.6,
    "tmax": 30.6,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.282,
    "etoMonth": 194.7,
    "tmin": 25.1,
    "tmax": 32.1,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.827,
    "etoMonth": 180.6,
    "tmin": 24.4,
    "tmax": 31.4,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.692,
    "etoMonth": 140.8,
    "tmin": 21.8,
    "tmax": 28.8,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.337,
    "etoMonth": 103.4,
    "tmin": 17.9,
    "tmax": 24.9,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.235,
    "etoMonth": 67.1,
    "tmin": 13.7,
    "tmax": 20.7,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Dakahlia",
    "arabic": "الدقهلية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.686,
    "etoMonth": 52.3,
    "tmin": 10.5,
    "tmax": 17.5,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.587,
    "etoMonth": 49.2,
    "tmin": 8.5,
    "tmax": 14.5,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 1.97,
    "etoMonth": 55.8,
    "tmin": 9.1,
    "tmax": 15.1,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.668,
    "etoMonth": 82.7,
    "tmin": 11.5,
    "tmax": 17.5,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 3.731,
    "etoMonth": 111.9,
    "tmin": 15.0,
    "tmax": 21.0,
    "rh": 74.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 4.771,
    "etoMonth": 147.9,
    "tmin": 18.8,
    "tmax": 24.8,
    "rh": 71.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 5.508,
    "etoMonth": 165.2,
    "tmin": 21.7,
    "tmax": 27.7,
    "rh": 68.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 5.763,
    "etoMonth": 178.6,
    "tmin": 23.1,
    "tmax": 29.1,
    "rh": 66.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.304,
    "etoMonth": 164.4,
    "tmin": 22.5,
    "tmax": 28.5,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.266,
    "etoMonth": 128.0,
    "tmin": 20.1,
    "tmax": 26.1,
    "rh": 69.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 2.999,
    "etoMonth": 93.0,
    "tmin": 16.6,
    "tmax": 22.6,
    "rh": 73.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.014,
    "etoMonth": 60.4,
    "tmin": 12.8,
    "tmax": 18.8,
    "rh": 76.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Damietta",
    "arabic": "دمياط",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.579,
    "etoMonth": 49.0,
    "tmin": 9.9,
    "tmax": 15.9,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.07,
    "etoMonth": 64.2,
    "tmin": 9.8,
    "tmax": 17.8,
    "rh": 65.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.56,
    "etoMonth": 72.5,
    "tmin": 10.5,
    "tmax": 18.5,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.478,
    "etoMonth": 107.8,
    "tmin": 13.3,
    "tmax": 21.3,
    "rh": 61.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.729,
    "etoMonth": 141.9,
    "tmin": 17.5,
    "tmax": 25.5,
    "rh": 57.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.934,
    "etoMonth": 183.9,
    "tmin": 21.9,
    "tmax": 29.9,
    "rh": 52.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.731,
    "etoMonth": 201.9,
    "tmin": 25.4,
    "tmax": 33.4,
    "rh": 49.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.981,
    "etoMonth": 216.4,
    "tmin": 27.0,
    "tmax": 35.0,
    "rh": 47.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.508,
    "etoMonth": 201.8,
    "tmin": 26.3,
    "tmax": 34.3,
    "rh": 48.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.355,
    "etoMonth": 160.7,
    "tmin": 23.5,
    "tmax": 31.5,
    "rh": 51.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.942,
    "etoMonth": 122.2,
    "tmin": 19.3,
    "tmax": 27.3,
    "rh": 55.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.773,
    "etoMonth": 83.2,
    "tmin": 14.9,
    "tmax": 22.9,
    "rh": 59.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Fayoum",
    "arabic": "الفيوم",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.133,
    "etoMonth": 66.1,
    "tmin": 11.4,
    "tmax": 19.4,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.667,
    "etoMonth": 51.7,
    "tmin": 9.2,
    "tmax": 16.2,
    "rh": 75.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.135,
    "etoMonth": 60.5,
    "tmin": 9.8,
    "tmax": 16.8,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.012,
    "etoMonth": 93.4,
    "tmin": 12.5,
    "tmax": 19.5,
    "rh": 71.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.203,
    "etoMonth": 126.1,
    "tmin": 16.4,
    "tmax": 23.4,
    "rh": 67.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.331,
    "etoMonth": 165.3,
    "tmin": 20.5,
    "tmax": 27.5,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.108,
    "etoMonth": 183.2,
    "tmin": 23.8,
    "tmax": 30.8,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.314,
    "etoMonth": 195.7,
    "tmin": 25.3,
    "tmax": 32.3,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.862,
    "etoMonth": 181.7,
    "tmin": 24.6,
    "tmax": 31.6,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.728,
    "etoMonth": 141.9,
    "tmin": 22.0,
    "tmax": 29.0,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.371,
    "etoMonth": 104.5,
    "tmin": 18.1,
    "tmax": 25.1,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.264,
    "etoMonth": 67.9,
    "tmin": 13.9,
    "tmax": 20.9,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Gharbia",
    "arabic": "الغربية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.712,
    "etoMonth": 53.1,
    "tmin": 10.7,
    "tmax": 17.7,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.0,
    "etoMonth": 62.0,
    "tmin": 9.3,
    "tmax": 17.3,
    "rh": 65.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.487,
    "etoMonth": 70.4,
    "tmin": 10.0,
    "tmax": 18.0,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.371,
    "etoMonth": 104.5,
    "tmin": 12.8,
    "tmax": 20.8,
    "rh": 62.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.636,
    "etoMonth": 139.1,
    "tmin": 16.9,
    "tmax": 24.9,
    "rh": 57.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.797,
    "etoMonth": 179.7,
    "tmin": 21.2,
    "tmax": 29.2,
    "rh": 53.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.595,
    "etoMonth": 197.9,
    "tmin": 24.7,
    "tmax": 32.7,
    "rh": 50.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.827,
    "etoMonth": 211.6,
    "tmin": 26.2,
    "tmax": 34.2,
    "rh": 48.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.362,
    "etoMonth": 197.2,
    "tmin": 25.6,
    "tmax": 33.6,
    "rh": 49.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.205,
    "etoMonth": 156.1,
    "tmin": 22.8,
    "tmax": 30.8,
    "rh": 52.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.809,
    "etoMonth": 118.1,
    "tmin": 18.7,
    "tmax": 26.7,
    "rh": 56.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.653,
    "etoMonth": 79.6,
    "tmin": 14.3,
    "tmax": 22.3,
    "rh": 60.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Giza",
    "arabic": "الجيزة",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.06,
    "etoMonth": 63.8,
    "tmin": 10.9,
    "tmax": 18.9,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.804,
    "etoMonth": 55.9,
    "tmin": 8.8,
    "tmax": 16.8,
    "rh": 70.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.258,
    "etoMonth": 63.9,
    "tmin": 9.5,
    "tmax": 17.5,
    "rh": 70.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.154,
    "etoMonth": 97.8,
    "tmin": 12.3,
    "tmax": 20.3,
    "rh": 67.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.377,
    "etoMonth": 131.3,
    "tmin": 16.4,
    "tmax": 24.4,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.549,
    "etoMonth": 172.0,
    "tmin": 20.8,
    "tmax": 28.8,
    "rh": 59.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.367,
    "etoMonth": 191.0,
    "tmin": 24.2,
    "tmax": 32.2,
    "rh": 55.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.569,
    "etoMonth": 203.7,
    "tmin": 25.7,
    "tmax": 33.7,
    "rh": 54.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.127,
    "etoMonth": 189.9,
    "tmin": 25.1,
    "tmax": 33.1,
    "rh": 54.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.962,
    "etoMonth": 148.9,
    "tmin": 22.3,
    "tmax": 30.3,
    "rh": 57.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.571,
    "etoMonth": 110.7,
    "tmin": 18.2,
    "tmax": 26.2,
    "rh": 61.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.432,
    "etoMonth": 73.0,
    "tmin": 13.8,
    "tmax": 21.8,
    "rh": 65.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Ismailia",
    "arabic": "الإسماعيلية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.829,
    "etoMonth": 56.7,
    "tmin": 10.4,
    "tmax": 18.4,
    "rh": 69.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.633,
    "etoMonth": 50.6,
    "tmin": 8.9,
    "tmax": 15.9,
    "rh": 75.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.106,
    "etoMonth": 59.6,
    "tmin": 9.6,
    "tmax": 16.6,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.94,
    "etoMonth": 91.2,
    "tmin": 12.2,
    "tmax": 19.2,
    "rh": 72.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.125,
    "etoMonth": 123.8,
    "tmin": 16.1,
    "tmax": 23.1,
    "rh": 68.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.266,
    "etoMonth": 163.3,
    "tmin": 20.3,
    "tmax": 27.3,
    "rh": 64.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.061,
    "etoMonth": 181.8,
    "tmin": 23.5,
    "tmax": 30.5,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.266,
    "etoMonth": 194.2,
    "tmin": 25.0,
    "tmax": 32.0,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.825,
    "etoMonth": 180.6,
    "tmin": 24.4,
    "tmax": 31.4,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.677,
    "etoMonth": 140.3,
    "tmin": 21.7,
    "tmax": 28.7,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.323,
    "etoMonth": 103.0,
    "tmin": 17.8,
    "tmax": 24.8,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.231,
    "etoMonth": 66.9,
    "tmin": 13.7,
    "tmax": 20.7,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Kafr El Sheikh",
    "arabic": "كفر الشيخ",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.676,
    "etoMonth": 52.0,
    "tmin": 10.4,
    "tmax": 17.4,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.921,
    "etoMonth": 90.6,
    "tmin": 11.1,
    "tmax": 22.1,
    "rh": 55.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.45,
    "etoMonth": 97.7,
    "tmin": 11.9,
    "tmax": 22.9,
    "rh": 54.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.514,
    "etoMonth": 140.0,
    "tmin": 15.3,
    "tmax": 26.3,
    "rh": 51.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.99,
    "etoMonth": 179.7,
    "tmin": 20.3,
    "tmax": 31.3,
    "rh": 46.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.415,
    "etoMonth": 229.9,
    "tmin": 25.6,
    "tmax": 36.6,
    "rh": 40.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.356,
    "etoMonth": 250.7,
    "tmin": 29.7,
    "tmax": 40.7,
    "rh": 36.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.693,
    "etoMonth": 269.5,
    "tmin": 31.7,
    "tmax": 42.7,
    "rh": 34.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.223,
    "etoMonth": 254.9,
    "tmin": 30.8,
    "tmax": 41.8,
    "rh": 35.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 6.973,
    "etoMonth": 209.2,
    "tmin": 27.4,
    "tmax": 38.4,
    "rh": 38.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.332,
    "etoMonth": 165.3,
    "tmin": 22.4,
    "tmax": 33.4,
    "rh": 43.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.873,
    "etoMonth": 116.2,
    "tmin": 17.2,
    "tmax": 28.2,
    "rh": 49.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Luxor",
    "arabic": "الأقصر",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 3.055,
    "etoMonth": 94.7,
    "tmin": 13.0,
    "tmax": 24.0,
    "rh": 53.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.597,
    "etoMonth": 49.5,
    "tmin": 8.6,
    "tmax": 14.6,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 1.982,
    "etoMonth": 56.1,
    "tmin": 9.2,
    "tmax": 15.2,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.682,
    "etoMonth": 83.2,
    "tmin": 11.6,
    "tmax": 17.6,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 3.748,
    "etoMonth": 112.4,
    "tmin": 15.1,
    "tmax": 21.1,
    "rh": 74.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 4.816,
    "etoMonth": 149.3,
    "tmin": 18.8,
    "tmax": 24.8,
    "rh": 70.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 5.526,
    "etoMonth": 165.8,
    "tmin": 21.8,
    "tmax": 27.8,
    "rh": 68.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 5.765,
    "etoMonth": 178.7,
    "tmin": 23.1,
    "tmax": 29.1,
    "rh": 66.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.307,
    "etoMonth": 164.5,
    "tmin": 22.5,
    "tmax": 28.5,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.269,
    "etoMonth": 128.1,
    "tmin": 20.1,
    "tmax": 26.1,
    "rh": 69.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.003,
    "etoMonth": 93.1,
    "tmin": 16.6,
    "tmax": 22.6,
    "rh": 73.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.025,
    "etoMonth": 60.8,
    "tmin": 12.9,
    "tmax": 18.9,
    "rh": 76.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Matrouh",
    "arabic": "مطروح",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.583,
    "etoMonth": 49.1,
    "tmin": 9.9,
    "tmax": 15.9,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.719,
    "etoMonth": 53.3,
    "tmin": 9.4,
    "tmax": 16.4,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.161,
    "etoMonth": 61.2,
    "tmin": 10.0,
    "tmax": 17.0,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.041,
    "etoMonth": 94.2,
    "tmin": 12.7,
    "tmax": 19.7,
    "rh": 71.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.233,
    "etoMonth": 127.0,
    "tmin": 16.6,
    "tmax": 23.6,
    "rh": 67.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.362,
    "etoMonth": 166.2,
    "tmin": 20.7,
    "tmax": 27.7,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.138,
    "etoMonth": 184.2,
    "tmin": 24.0,
    "tmax": 31.0,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.379,
    "etoMonth": 197.8,
    "tmin": 25.5,
    "tmax": 32.5,
    "rh": 58.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.896,
    "etoMonth": 182.8,
    "tmin": 24.8,
    "tmax": 31.8,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.763,
    "etoMonth": 142.9,
    "tmin": 22.2,
    "tmax": 29.2,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.403,
    "etoMonth": 105.5,
    "tmin": 18.3,
    "tmax": 25.3,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.292,
    "etoMonth": 68.8,
    "tmin": 14.1,
    "tmax": 21.1,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Menofia",
    "arabic": "المنوفية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.737,
    "etoMonth": 53.8,
    "tmin": 10.9,
    "tmax": 17.9,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.209,
    "etoMonth": 68.5,
    "tmin": 10.5,
    "tmax": 18.5,
    "rh": 64.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.712,
    "etoMonth": 76.8,
    "tmin": 11.3,
    "tmax": 19.3,
    "rh": 63.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.65,
    "etoMonth": 113.1,
    "tmin": 14.2,
    "tmax": 22.2,
    "rh": 60.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.918,
    "etoMonth": 147.5,
    "tmin": 18.5,
    "tmax": 26.5,
    "rh": 56.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 6.133,
    "etoMonth": 190.1,
    "tmin": 23.0,
    "tmax": 31.0,
    "rh": 51.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.94,
    "etoMonth": 208.2,
    "tmin": 26.6,
    "tmax": 34.6,
    "rh": 48.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 7.211,
    "etoMonth": 223.5,
    "tmin": 28.3,
    "tmax": 36.3,
    "rh": 46.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.752,
    "etoMonth": 209.3,
    "tmin": 27.6,
    "tmax": 35.6,
    "rh": 47.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.579,
    "etoMonth": 167.3,
    "tmin": 24.6,
    "tmax": 32.6,
    "rh": 50.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 4.146,
    "etoMonth": 128.5,
    "tmin": 20.3,
    "tmax": 28.3,
    "rh": 54.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.921,
    "etoMonth": 87.6,
    "tmin": 15.8,
    "tmax": 23.8,
    "rh": 59.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Minya",
    "arabic": "المنيا",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.286,
    "etoMonth": 70.9,
    "tmin": 12.2,
    "tmax": 20.2,
    "rh": 62.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 3.536,
    "etoMonth": 109.6,
    "tmin": 10.2,
    "tmax": 23.2,
    "rh": 44.5,
    "wind": 2.5,
    "sunshine": 6.8
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 4.083,
    "etoMonth": 115.6,
    "tmin": 11.1,
    "tmax": 24.1,
    "rh": 43.5,
    "wind": 2.5,
    "sunshine": 7.3
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 5.282,
    "etoMonth": 163.7,
    "tmin": 14.8,
    "tmax": 27.8,
    "rh": 39.5,
    "wind": 2.5,
    "sunshine": 8.3
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 6.886,
    "etoMonth": 206.6,
    "tmin": 20.1,
    "tmax": 33.1,
    "rh": 34.5,
    "wind": 2.5,
    "sunshine": 9.5
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 8.444,
    "etoMonth": 261.8,
    "tmin": 25.8,
    "tmax": 38.8,
    "rh": 28.5,
    "wind": 2.5,
    "sunshine": 10.5
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 9.473,
    "etoMonth": 284.2,
    "tmin": 30.3,
    "tmax": 43.3,
    "rh": 24.5,
    "wind": 2.5,
    "sunshine": 11.0
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 9.832,
    "etoMonth": 304.8,
    "tmin": 32.3,
    "tmax": 45.3,
    "rh": 21.5,
    "wind": 2.5,
    "sunshine": 11.0
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 9.37,
    "etoMonth": 290.4,
    "tmin": 31.4,
    "tmax": 44.4,
    "rh": 22.5,
    "wind": 2.5,
    "sunshine": 10.5
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 8.063,
    "etoMonth": 241.9,
    "tmin": 27.8,
    "tmax": 40.8,
    "rh": 26.5,
    "wind": 2.5,
    "sunshine": 9.5
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 6.317,
    "etoMonth": 195.8,
    "tmin": 22.4,
    "tmax": 35.4,
    "rh": 31.5,
    "wind": 2.5,
    "sunshine": 8.3
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 4.715,
    "etoMonth": 141.4,
    "tmin": 16.8,
    "tmax": 29.8,
    "rh": 37.5,
    "wind": 2.5,
    "sunshine": 7.3
  },
  {
    "governorate": "New Valley",
    "arabic": "الوادي الجديد",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 3.738,
    "etoMonth": 115.9,
    "tmin": 12.3,
    "tmax": 25.3,
    "rh": 42.5,
    "wind": 2.5,
    "sunshine": 6.8
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.619,
    "etoMonth": 50.2,
    "tmin": 8.8,
    "tmax": 14.8,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.006,
    "etoMonth": 56.8,
    "tmin": 9.4,
    "tmax": 15.4,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.699,
    "etoMonth": 83.7,
    "tmin": 11.7,
    "tmax": 17.7,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 3.777,
    "etoMonth": 113.3,
    "tmin": 15.3,
    "tmax": 21.3,
    "rh": 74.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 4.847,
    "etoMonth": 150.2,
    "tmin": 19.0,
    "tmax": 25.0,
    "rh": 70.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 5.586,
    "etoMonth": 167.6,
    "tmin": 21.9,
    "tmax": 27.9,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 5.797,
    "etoMonth": 179.7,
    "tmin": 23.3,
    "tmax": 29.3,
    "rh": 66.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.341,
    "etoMonth": 165.6,
    "tmin": 22.7,
    "tmax": 28.7,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.303,
    "etoMonth": 129.1,
    "tmin": 20.3,
    "tmax": 26.3,
    "rh": 69.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.074,
    "etoMonth": 95.3,
    "tmin": 16.8,
    "tmax": 22.8,
    "rh": 72.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.051,
    "etoMonth": 61.5,
    "tmin": 13.1,
    "tmax": 19.1,
    "rh": 76.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "North Sinai",
    "arabic": "شمال سيناء",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.606,
    "etoMonth": 49.8,
    "tmin": 10.1,
    "tmax": 16.1,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.606,
    "etoMonth": 49.8,
    "tmin": 8.7,
    "tmax": 14.7,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 1.991,
    "etoMonth": 56.4,
    "tmin": 9.3,
    "tmax": 15.3,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 2.683,
    "etoMonth": 83.2,
    "tmin": 11.6,
    "tmax": 17.6,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 3.759,
    "etoMonth": 112.7,
    "tmin": 15.2,
    "tmax": 21.2,
    "rh": 74.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 4.828,
    "etoMonth": 149.7,
    "tmin": 18.9,
    "tmax": 24.9,
    "rh": 70.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 5.568,
    "etoMonth": 167.0,
    "tmin": 21.8,
    "tmax": 27.8,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 5.779,
    "etoMonth": 179.1,
    "tmin": 23.2,
    "tmax": 29.2,
    "rh": 66.5,
    "wind": 2.7,
    "sunshine": 10.3
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.321,
    "etoMonth": 165.0,
    "tmin": 22.6,
    "tmax": 28.6,
    "rh": 67.5,
    "wind": 2.7,
    "sunshine": 9.8
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.284,
    "etoMonth": 128.5,
    "tmin": 20.2,
    "tmax": 26.2,
    "rh": 69.5,
    "wind": 2.7,
    "sunshine": 8.8
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.016,
    "etoMonth": 93.5,
    "tmin": 16.7,
    "tmax": 22.7,
    "rh": 73.5,
    "wind": 2.7,
    "sunshine": 7.6
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.036,
    "etoMonth": 61.1,
    "tmin": 13.0,
    "tmax": 19.0,
    "rh": 76.5,
    "wind": 2.7,
    "sunshine": 6.6
  },
  {
    "governorate": "Port Said",
    "arabic": "بورسعيد",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.593,
    "etoMonth": 49.4,
    "tmin": 10.0,
    "tmax": 16.0,
    "rh": 77.5,
    "wind": 2.7,
    "sunshine": 6.4
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.723,
    "etoMonth": 53.4,
    "tmin": 9.4,
    "tmax": 16.4,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.172,
    "etoMonth": 61.5,
    "tmin": 10.1,
    "tmax": 17.1,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.044,
    "etoMonth": 94.3,
    "tmin": 12.7,
    "tmax": 19.7,
    "rh": 71.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.248,
    "etoMonth": 127.4,
    "tmin": 16.7,
    "tmax": 23.7,
    "rh": 67.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.377,
    "etoMonth": 166.7,
    "tmin": 20.8,
    "tmax": 27.8,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.154,
    "etoMonth": 184.6,
    "tmin": 24.1,
    "tmax": 31.1,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.395,
    "etoMonth": 198.2,
    "tmin": 25.6,
    "tmax": 32.6,
    "rh": 58.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.912,
    "etoMonth": 183.3,
    "tmin": 24.9,
    "tmax": 31.9,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.78,
    "etoMonth": 143.4,
    "tmin": 22.3,
    "tmax": 29.3,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.451,
    "etoMonth": 107.0,
    "tmin": 18.4,
    "tmax": 25.4,
    "rh": 65.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.305,
    "etoMonth": 69.2,
    "tmin": 14.2,
    "tmax": 21.2,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Qaliubiya",
    "arabic": "القليوبية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.748,
    "etoMonth": 54.2,
    "tmin": 11.0,
    "tmax": 18.0,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.869,
    "etoMonth": 88.9,
    "tmin": 10.8,
    "tmax": 21.8,
    "rh": 55.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.397,
    "etoMonth": 96.2,
    "tmin": 11.6,
    "tmax": 22.6,
    "rh": 54.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.447,
    "etoMonth": 137.9,
    "tmin": 14.9,
    "tmax": 25.9,
    "rh": 51.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.923,
    "etoMonth": 177.7,
    "tmin": 19.9,
    "tmax": 30.9,
    "rh": 46.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.303,
    "etoMonth": 226.4,
    "tmin": 25.1,
    "tmax": 36.1,
    "rh": 41.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.267,
    "etoMonth": 248.0,
    "tmin": 29.3,
    "tmax": 40.3,
    "rh": 37.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.588,
    "etoMonth": 266.2,
    "tmin": 31.2,
    "tmax": 42.2,
    "rh": 35.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.137,
    "etoMonth": 252.2,
    "tmin": 30.3,
    "tmax": 41.3,
    "rh": 35.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 6.866,
    "etoMonth": 206.0,
    "tmin": 27.0,
    "tmax": 38.0,
    "rh": 39.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.222,
    "etoMonth": 161.9,
    "tmin": 22.0,
    "tmax": 33.0,
    "rh": 44.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.803,
    "etoMonth": 114.1,
    "tmin": 16.8,
    "tmax": 27.8,
    "rh": 49.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Qena",
    "arabic": "قنا",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 3.0,
    "etoMonth": 93.0,
    "tmin": 12.7,
    "tmax": 23.7,
    "rh": 53.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.816,
    "etoMonth": 87.3,
    "tmin": 11.9,
    "tmax": 20.4,
    "rh": 65.5,
    "wind": 3.4,
    "sunshine": 6.8
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.329,
    "etoMonth": 94.2,
    "tmin": 12.7,
    "tmax": 21.2,
    "rh": 64.5,
    "wind": 3.4,
    "sunshine": 7.3
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.4,
    "etoMonth": 136.4,
    "tmin": 15.8,
    "tmax": 24.3,
    "rh": 61.5,
    "wind": 3.4,
    "sunshine": 8.3
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.897,
    "etoMonth": 176.9,
    "tmin": 20.3,
    "tmax": 28.8,
    "rh": 57.5,
    "wind": 3.4,
    "sunshine": 9.5
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.448,
    "etoMonth": 230.9,
    "tmin": 25.1,
    "tmax": 33.6,
    "rh": 52.5,
    "wind": 3.4,
    "sunshine": 10.5
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.589,
    "etoMonth": 257.7,
    "tmin": 28.9,
    "tmax": 37.4,
    "rh": 48.5,
    "wind": 3.4,
    "sunshine": 11.0
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 9.008,
    "etoMonth": 279.2,
    "tmin": 30.6,
    "tmax": 39.1,
    "rh": 46.5,
    "wind": 3.4,
    "sunshine": 11.0
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.509,
    "etoMonth": 263.8,
    "tmin": 29.9,
    "tmax": 38.4,
    "rh": 47.5,
    "wind": 3.4,
    "sunshine": 10.5
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 7.124,
    "etoMonth": 213.7,
    "tmin": 26.8,
    "tmax": 35.3,
    "rh": 50.5,
    "wind": 3.4,
    "sunshine": 9.5
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.344,
    "etoMonth": 165.7,
    "tmin": 22.3,
    "tmax": 30.8,
    "rh": 55.5,
    "wind": 3.4,
    "sunshine": 8.3
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.82,
    "etoMonth": 114.6,
    "tmin": 17.5,
    "tmax": 26.0,
    "rh": 60.5,
    "wind": 3.4,
    "sunshine": 7.3
  },
  {
    "governorate": "Red Sea",
    "arabic": "البحر الأحمر",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.998,
    "etoMonth": 93.0,
    "tmin": 13.7,
    "tmax": 22.2,
    "rh": 63.5,
    "wind": 3.4,
    "sunshine": 6.8
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.711,
    "etoMonth": 53.0,
    "tmin": 9.3,
    "tmax": 16.3,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.159,
    "etoMonth": 61.1,
    "tmin": 10.0,
    "tmax": 17.0,
    "rh": 74.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.029,
    "etoMonth": 93.9,
    "tmin": 12.6,
    "tmax": 19.6,
    "rh": 71.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.232,
    "etoMonth": 126.9,
    "tmin": 16.6,
    "tmax": 23.6,
    "rh": 67.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.361,
    "etoMonth": 166.2,
    "tmin": 20.7,
    "tmax": 27.7,
    "rh": 63.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.138,
    "etoMonth": 184.1,
    "tmin": 24.0,
    "tmax": 31.0,
    "rh": 60.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.379,
    "etoMonth": 197.7,
    "tmin": 25.5,
    "tmax": 32.5,
    "rh": 58.5,
    "wind": 2.1,
    "sunshine": 10.7
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 5.895,
    "etoMonth": 182.8,
    "tmin": 24.8,
    "tmax": 31.8,
    "rh": 59.5,
    "wind": 2.1,
    "sunshine": 10.2
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 4.762,
    "etoMonth": 142.9,
    "tmin": 22.2,
    "tmax": 29.2,
    "rh": 62.5,
    "wind": 2.1,
    "sunshine": 9.2
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.391,
    "etoMonth": 105.1,
    "tmin": 18.2,
    "tmax": 25.2,
    "rh": 66.5,
    "wind": 2.1,
    "sunshine": 8.0
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.291,
    "etoMonth": 68.7,
    "tmin": 14.1,
    "tmax": 21.1,
    "rh": 70.5,
    "wind": 2.1,
    "sunshine": 7.0
  },
  {
    "governorate": "Sharkia",
    "arabic": "الشرقية",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.729,
    "etoMonth": 53.6,
    "tmin": 10.8,
    "tmax": 17.8,
    "rh": 73.5,
    "wind": 2.1,
    "sunshine": 6.5
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.821,
    "etoMonth": 87.4,
    "tmin": 10.5,
    "tmax": 21.5,
    "rh": 55.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.347,
    "etoMonth": 94.7,
    "tmin": 11.3,
    "tmax": 22.3,
    "rh": 54.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.407,
    "etoMonth": 136.6,
    "tmin": 14.7,
    "tmax": 25.7,
    "rh": 51.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.871,
    "etoMonth": 176.1,
    "tmin": 19.6,
    "tmax": 30.6,
    "rh": 46.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.256,
    "etoMonth": 224.9,
    "tmin": 24.8,
    "tmax": 35.8,
    "rh": 41.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.19,
    "etoMonth": 245.7,
    "tmin": 28.8,
    "tmax": 39.8,
    "rh": 37.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.51,
    "etoMonth": 263.8,
    "tmin": 30.7,
    "tmax": 41.7,
    "rh": 35.5,
    "wind": 2.2,
    "sunshine": 11.0
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.042,
    "etoMonth": 249.3,
    "tmin": 29.9,
    "tmax": 40.9,
    "rh": 36.5,
    "wind": 2.2,
    "sunshine": 10.5
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 6.793,
    "etoMonth": 203.8,
    "tmin": 26.6,
    "tmax": 37.6,
    "rh": 39.5,
    "wind": 2.2,
    "sunshine": 9.5
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.163,
    "etoMonth": 160.1,
    "tmin": 21.7,
    "tmax": 32.7,
    "rh": 44.5,
    "wind": 2.2,
    "sunshine": 8.3
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.748,
    "etoMonth": 112.4,
    "tmin": 16.5,
    "tmax": 27.5,
    "rh": 49.5,
    "wind": 2.2,
    "sunshine": 7.3
  },
  {
    "governorate": "Sohag",
    "arabic": "سوهاج",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.95,
    "etoMonth": 91.5,
    "tmin": 12.4,
    "tmax": 23.4,
    "rh": 53.5,
    "wind": 2.2,
    "sunshine": 6.8
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 2.665,
    "etoMonth": 82.6,
    "tmin": 11.3,
    "tmax": 19.8,
    "rh": 66.5,
    "wind": 3.4,
    "sunshine": 6.8
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 3.174,
    "etoMonth": 89.8,
    "tmin": 12.1,
    "tmax": 20.6,
    "rh": 65.5,
    "wind": 3.4,
    "sunshine": 7.3
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 4.205,
    "etoMonth": 130.3,
    "tmin": 15.0,
    "tmax": 23.5,
    "rh": 62.5,
    "wind": 3.4,
    "sunshine": 8.3
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 5.688,
    "etoMonth": 170.6,
    "tmin": 19.5,
    "tmax": 28.0,
    "rh": 58.5,
    "wind": 3.4,
    "sunshine": 9.5
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 7.215,
    "etoMonth": 223.7,
    "tmin": 24.2,
    "tmax": 32.7,
    "rh": 53.5,
    "wind": 3.4,
    "sunshine": 10.5
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 8.334,
    "etoMonth": 250.0,
    "tmin": 27.9,
    "tmax": 36.4,
    "rh": 49.5,
    "wind": 3.4,
    "sunshine": 11.0
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 8.745,
    "etoMonth": 271.1,
    "tmin": 29.6,
    "tmax": 38.1,
    "rh": 47.5,
    "wind": 3.4,
    "sunshine": 11.0
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 8.217,
    "etoMonth": 254.7,
    "tmin": 28.8,
    "tmax": 37.3,
    "rh": 48.5,
    "wind": 3.4,
    "sunshine": 10.5
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 6.851,
    "etoMonth": 205.6,
    "tmin": 25.8,
    "tmax": 34.3,
    "rh": 51.5,
    "wind": 3.4,
    "sunshine": 9.5
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 5.103,
    "etoMonth": 158.2,
    "tmin": 21.4,
    "tmax": 29.9,
    "rh": 56.5,
    "wind": 3.4,
    "sunshine": 8.3
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 3.671,
    "etoMonth": 110.1,
    "tmin": 16.7,
    "tmax": 25.2,
    "rh": 60.5,
    "wind": 3.4,
    "sunshine": 7.3
  },
  {
    "governorate": "South Sinai",
    "arabic": "جنوب سيناء",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 2.829,
    "etoMonth": 87.7,
    "tmin": 13.0,
    "tmax": 21.5,
    "rh": 64.5,
    "wind": 3.4,
    "sunshine": 6.8
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 1,
    "monthAR": "يناير",
    "etoDay": 1.874,
    "etoMonth": 58.1,
    "tmin": 9.4,
    "tmax": 17.4,
    "rh": 70.5,
    "wind": 2.0,
    "sunshine": 6.5
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 2,
    "monthAR": "فبراير",
    "etoDay": 2.36,
    "etoMonth": 66.8,
    "tmin": 10.1,
    "tmax": 18.1,
    "rh": 69.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 3,
    "monthAR": "مارس",
    "etoDay": 3.256,
    "etoMonth": 100.9,
    "tmin": 12.8,
    "tmax": 20.8,
    "rh": 66.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 4,
    "monthAR": "أبريل",
    "etoDay": 4.484,
    "etoMonth": 134.5,
    "tmin": 16.9,
    "tmax": 24.9,
    "rh": 62.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 5,
    "monthAR": "مايو",
    "etoDay": 5.657,
    "etoMonth": 175.4,
    "tmin": 21.3,
    "tmax": 29.3,
    "rh": 58.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 6,
    "monthAR": "يونيو",
    "etoDay": 6.442,
    "etoMonth": 193.3,
    "tmin": 24.7,
    "tmax": 32.7,
    "rh": 55.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 7,
    "monthAR": "يوليو",
    "etoDay": 6.694,
    "etoMonth": 207.5,
    "tmin": 26.3,
    "tmax": 34.3,
    "rh": 53.5,
    "wind": 2.0,
    "sunshine": 10.7
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 8,
    "monthAR": "أغسطس",
    "etoDay": 6.213,
    "etoMonth": 192.6,
    "tmin": 25.6,
    "tmax": 33.6,
    "rh": 54.5,
    "wind": 2.0,
    "sunshine": 10.2
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 9,
    "monthAR": "سبتمبر",
    "etoDay": 5.083,
    "etoMonth": 152.5,
    "tmin": 22.8,
    "tmax": 30.8,
    "rh": 56.5,
    "wind": 2.0,
    "sunshine": 9.2
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 10,
    "monthAR": "أكتوبر",
    "etoDay": 3.656,
    "etoMonth": 113.3,
    "tmin": 18.7,
    "tmax": 26.7,
    "rh": 61.5,
    "wind": 2.0,
    "sunshine": 8.0
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 11,
    "monthAR": "نوفمبر",
    "etoDay": 2.516,
    "etoMonth": 75.5,
    "tmin": 14.4,
    "tmax": 22.4,
    "rh": 65.5,
    "wind": 2.0,
    "sunshine": 7.0
  },
  {
    "governorate": "Suez",
    "arabic": "السويس",
    "monthNo": 12,
    "monthAR": "ديسمبر",
    "etoDay": 1.923,
    "etoMonth": 59.6,
    "tmin": 10.9,
    "tmax": 18.9,
    "rh": 68.5,
    "wind": 2.0,
    "sunshine": 6.5
  }
];

const crops = [
  {
    "crop": "Wheat",
    "arabic": "قمح",
    "group": "Cereal",
    "groupAr": "حبوب",
    "days": 120,
    "kc": 0.95,
    "yield": 6.786,
    "yieldFeddan": 2.85,
    "yieldMinFeddan": 2.7,
    "yieldMaxFeddan": 3.0,
    "yieldUnit": "طن حبوب/فدان",
    "mainProduct": "حبوب",
    "additionalProducts": "تبن/قش: 2.5–4.0 طن/فدان",
    "bestGovernorates": "الدلتا، مصر الوسطى، الأراضي القديمة",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "حبوب",
        "unit": "طن حبوب/فدان",
        "yieldFeddan": 2.85,
        "yieldMinFeddan": 2.7,
        "yieldMaxFeddan": 3.0,
        "yield": 6.786,
        "kind": "main",
        "yieldNative": 2.85,
        "yieldNativeMin": 2.7,
        "yieldNativeMax": 3.0,
        "nativeUnit": "طن حبوب/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Barley",
    "arabic": "شعير",
    "group": "Cereal",
    "groupAr": "حبوب",
    "days": 110,
    "kc": 0.8,
    "yield": 3.929,
    "yieldFeddan": 1.65,
    "yieldMinFeddan": 1.5,
    "yieldMaxFeddan": 1.8,
    "yieldUnit": "طن حبوب/فدان",
    "mainProduct": "حبوب",
    "additionalProducts": "تبن: 1.5–2.5 طن/فدان",
    "bestGovernorates": "مطروح، الساحل الشمالي، الأراضي المطرية",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 120,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "حبوب",
        "unit": "طن حبوب/فدان",
        "yieldFeddan": 1.65,
        "yieldMinFeddan": 1.5,
        "yieldMaxFeddan": 1.8,
        "yield": 3.929,
        "kind": "main",
        "yieldNative": 1.65,
        "yieldNativeMin": 1.5,
        "yieldNativeMax": 1.8,
        "nativeUnit": "طن حبوب/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Rice",
    "arabic": "أرز",
    "group": "Cereal",
    "groupAr": "حبوب",
    "days": 140,
    "kc": 1.1,
    "yield": 8.81,
    "yieldFeddan": 3.7,
    "yieldMinFeddan": 3.2,
    "yieldMaxFeddan": 4.2,
    "yieldUnit": "طن أرز شعير/فدان",
    "mainProduct": "أرز شعير",
    "additionalProducts": "قش أرز: 3–5 طن/فدان؛ أرز أبيض بعد التبييض: 60–70%؛ سرسة",
    "bestGovernorates": "كفر الشيخ، الدقهلية، البحيرة، الشرقية",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 160,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أرز شعير",
        "unit": "طن أرز شعير/فدان",
        "yieldFeddan": 3.7,
        "yieldMinFeddan": 3.2,
        "yieldMaxFeddan": 4.2,
        "yield": 8.81,
        "kind": "main",
        "yieldNative": 3.7,
        "yieldNativeMin": 3.2,
        "yieldNativeMax": 4.2,
        "nativeUnit": "طن أرز شعير/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Maize / Corn",
    "arabic": "ذرة شامية",
    "group": "Cereal / feed",
    "groupAr": "حبوب",
    "days": 125,
    "kc": 1.0,
    "yield": 8.333,
    "yieldFeddan": 3.5,
    "yieldMinFeddan": 3.2,
    "yieldMaxFeddan": 3.8,
    "yieldUnit": "طن حبوب/فدان",
    "mainProduct": "حبوب",
    "additionalProducts": "سيلاج: 12–25 طن/فدان؛ عيدان: 4–7 طن/فدان؛ قوالح",
    "bestGovernorates": "البحيرة، الشرقية، المنيا، الدقهلية",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 220,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "حبوب",
        "unit": "طن حبوب/فدان",
        "yieldFeddan": 3.5,
        "yieldMinFeddan": 3.2,
        "yieldMaxFeddan": 3.8,
        "yield": 8.333,
        "kind": "main",
        "yieldNative": 3.5,
        "yieldNativeMin": 3.2,
        "yieldNativeMax": 3.8,
        "nativeUnit": "طن حبوب/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "سيلاج",
        "unit": "طن/فدان",
        "yieldFeddan": 18,
        "yieldMinFeddan": 12,
        "yieldMaxFeddan": 25,
        "yield": 42.857,
        "kind": "secondary",
        "yieldNative": 18,
        "yieldNativeMin": 12,
        "yieldNativeMax": 25,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Sorghum",
    "arabic": "ذرة رفيعة",
    "group": "Cereal",
    "groupAr": "حبوب",
    "days": 120,
    "kc": 0.9,
    "yield": 5.476,
    "yieldFeddan": 2.3,
    "yieldMinFeddan": 2.0,
    "yieldMaxFeddan": 2.6,
    "yieldUnit": "طن حبوب/فدان",
    "mainProduct": "حبوب",
    "additionalProducts": "علف أخضر: 8–15 طن/فدان؛ عيدان",
    "bestGovernorates": "أسيوط، سوهاج، قنا",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 140,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "حبوب",
        "unit": "طن حبوب/فدان",
        "yieldFeddan": 2.3,
        "yieldMinFeddan": 2.0,
        "yieldMaxFeddan": 2.6,
        "yield": 5.476,
        "kind": "main",
        "yieldNative": 2.3,
        "yieldNativeMin": 2.0,
        "yieldNativeMax": 2.6,
        "nativeUnit": "طن حبوب/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Faba bean",
    "arabic": "فول بلدي",
    "group": "Legume",
    "groupAr": "بقوليات",
    "days": 110,
    "kc": 0.85,
    "yield": 3.452,
    "yieldFeddan": 1.45,
    "yieldMinFeddan": 1.3,
    "yieldMaxFeddan": 1.6,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "عروش/تبن: 1.5–3 طن/فدان؛ قرون خضراء",
    "bestGovernorates": "البحيرة، الدقهلية، الشرقية، المنيا",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 60,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.45,
        "yieldMinFeddan": 1.3,
        "yieldMaxFeddan": 1.6,
        "yield": 3.452,
        "kind": "main",
        "yieldNative": 1.45,
        "yieldNativeMin": 1.3,
        "yieldNativeMax": 1.6,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Lentil",
    "arabic": "عدس",
    "group": "Legume",
    "groupAr": "بقوليات",
    "days": 100,
    "kc": 0.75,
    "yield": 2.5,
    "yieldFeddan": 1.05,
    "yieldMinFeddan": 0.9,
    "yieldMaxFeddan": 1.2,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "تبن عدس: 1–2 طن/فدان",
    "bestGovernorates": "المنيا، أسيوط، الفيوم",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 50,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.05,
        "yieldMinFeddan": 0.9,
        "yieldMaxFeddan": 1.2,
        "yield": 2.5,
        "kind": "main",
        "yieldNative": 1.05,
        "yieldNativeMin": 0.9,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Chickpea",
    "arabic": "حمص",
    "group": "Legume",
    "groupAr": "بقوليات",
    "days": 110,
    "kc": 0.75,
    "yield": 2.5,
    "yieldFeddan": 1.05,
    "yieldMinFeddan": 0.9,
    "yieldMaxFeddan": 1.2,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "عروش جافة: 1–2 طن/فدان",
    "bestGovernorates": "المنيا، أسيوط، سوهاج",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 50,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.05,
        "yieldMinFeddan": 0.9,
        "yieldMaxFeddan": 1.2,
        "yield": 2.5,
        "kind": "main",
        "yieldNative": 1.05,
        "yieldNativeMin": 0.9,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Fenugreek",
    "arabic": "حلبة",
    "group": "Legume / medicinal",
    "groupAr": "بقوليات/طبية",
    "days": 110,
    "kc": 0.75,
    "yield": 2.262,
    "yieldFeddan": 0.95,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.1,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "عشب أخضر: 5–10 طن/فدان؛ عشب جاف: 1–2 طن/فدان",
    "bestGovernorates": "الفيوم، المنيا، أسيوط",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats + Indicative",
    "ar": 60,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.95,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.1,
        "yield": 2.262,
        "kind": "main",
        "yieldNative": 0.95,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.1,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Sugar beet",
    "arabic": "بنجر السكر",
    "group": "Sugar crop",
    "groupAr": "سكرية",
    "days": 180,
    "kc": 0.9,
    "yield": 54.762,
    "yieldFeddan": 23.0,
    "yieldMinFeddan": 22.0,
    "yieldMaxFeddan": 24.0,
    "yieldUnit": "طن جذور/فدان",
    "mainProduct": "جذور",
    "additionalProducts": "عروش: 5–10 طن/فدان؛ سكر/مولاس/لب بنجر صناعيًا حسب نسبة السكر",
    "bestGovernorates": "كفر الشيخ، الدقهلية، البحيرة، الفيوم، المنيا",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "جذور",
        "unit": "طن جذور/فدان",
        "yieldFeddan": 23.0,
        "yieldMinFeddan": 22.0,
        "yieldMaxFeddan": 24.0,
        "yield": 54.762,
        "kind": "main",
        "yieldNative": 23.0,
        "yieldNativeMin": 22.0,
        "yieldNativeMax": 24.0,
        "nativeUnit": "طن جذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Sugarcane",
    "arabic": "قصب السكر",
    "group": "Sugar crop",
    "groupAr": "سكرية",
    "days": 365,
    "kc": 1.15,
    "yield": 107.143,
    "yieldFeddan": 45.0,
    "yieldMinFeddan": 40.0,
    "yieldMaxFeddan": 50.0,
    "yieldUnit": "طن عيدان/فدان",
    "mainProduct": "عيدان",
    "additionalProducts": "مخلفات/أوراق: 8–15 طن/فدان؛ مصاصة؛ مولاس؛ سكر حسب الاستخلاص",
    "bestGovernorates": "قنا، الأقصر، أسوان، سوهاج",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 250,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عيدان",
        "unit": "طن عيدان/فدان",
        "yieldFeddan": 45.0,
        "yieldMinFeddan": 40.0,
        "yieldMaxFeddan": 50.0,
        "yield": 107.143,
        "kind": "main",
        "yieldNative": 45.0,
        "yieldNativeMin": 40.0,
        "yieldNativeMax": 50.0,
        "nativeUnit": "طن عيدان/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Berseem / Egyptian clover",
    "arabic": "برسيم مستديم",
    "group": "Fodder",
    "groupAr": "علف",
    "days": 160,
    "kc": 0.95,
    "yield": 75.0,
    "yieldFeddan": 31.5,
    "yieldMinFeddan": 28.0,
    "yieldMaxFeddan": 35.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "علف أخضر",
    "additionalProducts": "دريس: 5–8 طن/فدان تقريبًا؛ بذور عند التقاوي",
    "bestGovernorates": "الدلتا، مصر الوسطى",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 80,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "علف أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 31.5,
        "yieldMinFeddan": 28.0,
        "yieldMaxFeddan": 35.0,
        "yield": 75.0,
        "kind": "main",
        "yieldNative": 31.5,
        "yieldNativeMin": 28.0,
        "yieldNativeMax": 35.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "دريس",
        "unit": "طن/فدان",
        "yieldFeddan": 5,
        "yieldMinFeddan": 2,
        "yieldMaxFeddan": 12,
        "yield": 11.905,
        "kind": "secondary",
        "yieldNative": 5,
        "yieldNativeMin": 2,
        "yieldNativeMax": 12,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Berseem short season",
    "arabic": "برسيم تحريش",
    "group": "Fodder",
    "groupAr": "علف",
    "days": 90,
    "kc": 0.9,
    "yield": 28.571,
    "yieldFeddan": 12.0,
    "yieldMinFeddan": 10.0,
    "yieldMaxFeddan": 14.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "علف أخضر",
    "additionalProducts": "دريس: 2–3 طن/فدان",
    "bestGovernorates": "الدلتا، الفيوم، بني سويف",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 70,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "علف أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 12.0,
        "yieldMinFeddan": 10.0,
        "yieldMaxFeddan": 14.0,
        "yield": 28.571,
        "kind": "main",
        "yieldNative": 12.0,
        "yieldNativeMin": 10.0,
        "yieldNativeMax": 14.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "دريس",
        "unit": "طن/فدان",
        "yieldFeddan": 5,
        "yieldMinFeddan": 2,
        "yieldMaxFeddan": 12,
        "yield": 11.905,
        "kind": "secondary",
        "yieldNative": 5,
        "yieldNativeMin": 2,
        "yieldNativeMax": 12,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Alfalfa",
    "arabic": "برسيم حجازي",
    "group": "Perennial fodder",
    "groupAr": "علف معمر",
    "days": 365,
    "kc": 0.95,
    "yield": 107.143,
    "yieldFeddan": 45.0,
    "yieldMinFeddan": 35.0,
    "yieldMaxFeddan": 55.0,
    "yieldUnit": "طن أخضر/فدان/سنة",
    "mainProduct": "علف أخضر سنوي",
    "additionalProducts": "دريس: 7–12 طن/فدان/سنة؛ بذور",
    "bestGovernorates": "الأراضي الجديدة، الوادي الجديد، النوبارية",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "علف أخضر سنوي",
        "unit": "طن أخضر/فدان/سنة",
        "yieldFeddan": 45.0,
        "yieldMinFeddan": 35.0,
        "yieldMaxFeddan": 55.0,
        "yield": 107.143,
        "kind": "main",
        "yieldNative": 45.0,
        "yieldNativeMin": 35.0,
        "yieldNativeMax": 55.0,
        "nativeUnit": "طن أخضر/فدان/سنة",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "دريس",
        "unit": "طن/فدان",
        "yieldFeddan": 5,
        "yieldMinFeddan": 2,
        "yieldMaxFeddan": 12,
        "yield": 11.905,
        "kind": "secondary",
        "yieldNative": 5,
        "yieldNativeMin": 2,
        "yieldNativeMax": 12,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Cotton",
    "arabic": "قطن",
    "group": "Fiber crop",
    "groupAr": "ألياف",
    "days": 180,
    "kc": 0.9,
    "yield": 4.405,
    "yieldFeddan": 1.85,
    "yieldMinFeddan": 1.5,
    "yieldMaxFeddan": 2.2,
    "yieldUnit": "طن زهر/فدان",
    "mainProduct": "قطن زهر",
    "additionalProducts": "شعر قطن: 30–40%؛ بذرة قطن: 55–65%؛ حطب",
    "bestGovernorates": "كفر الشيخ، الدقهلية، الشرقية، البحيرة",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "قطن زهر",
        "unit": "طن زهر/فدان",
        "yieldFeddan": 1.85,
        "yieldMinFeddan": 1.5,
        "yieldMaxFeddan": 2.2,
        "yield": 4.405,
        "kind": "main",
        "yieldNative": 1.85,
        "yieldNativeMin": 1.5,
        "yieldNativeMax": 2.2,
        "nativeUnit": "طن زهر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Flax",
    "arabic": "كتان",
    "group": "Fiber / oilseed",
    "groupAr": "ألياف/زيت",
    "days": 150,
    "kc": 0.75,
    "yield": 9.881,
    "yieldFeddan": 4.15,
    "yieldMinFeddan": 3.8,
    "yieldMaxFeddan": 4.5,
    "yieldUnit": "طن قش/فدان",
    "mainProduct": "قش",
    "additionalProducts": "بذور: 0.6–0.8 طن/فدان؛ ألياف؛ زيت بذرة",
    "bestGovernorates": "الغربية، الدقهلية، كفر الشيخ",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 80,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "قش",
        "unit": "طن قش/فدان",
        "yieldFeddan": 4.15,
        "yieldMinFeddan": 3.8,
        "yieldMaxFeddan": 4.5,
        "yield": 9.881,
        "kind": "main",
        "yieldNative": 4.15,
        "yieldNativeMin": 3.8,
        "yieldNativeMax": 4.5,
        "nativeUnit": "طن قش/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Soybean",
    "arabic": "فول الصويا",
    "group": "Oilseed",
    "groupAr": "زيتي",
    "days": 120,
    "kc": 0.85,
    "yield": 3.333,
    "yieldFeddan": 1.4,
    "yieldMinFeddan": 1.2,
    "yieldMaxFeddan": 1.6,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "زيت: 18–22% تقريبًا؛ كسب",
    "bestGovernorates": "المنيا، بني سويف، البحيرة",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 160,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.4,
        "yieldMinFeddan": 1.2,
        "yieldMaxFeddan": 1.6,
        "yield": 3.333,
        "kind": "main",
        "yieldNative": 1.4,
        "yieldNativeMin": 1.2,
        "yieldNativeMax": 1.6,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 280.0,
        "yieldNativeMin": 216.0,
        "yieldNativeMax": 352.0,
        "yieldFeddan": 0.28,
        "yieldMinFeddan": 0.216,
        "yieldMaxFeddan": 0.352,
        "yield": 0.667,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Peanut",
    "arabic": "فول سوداني",
    "group": "Oilseed / legume",
    "groupAr": "زيتي/بقوليات",
    "days": 120,
    "kc": 0.75,
    "yield": 4.048,
    "yieldFeddan": 1.7,
    "yieldMinFeddan": 1.4,
    "yieldMaxFeddan": 2.0,
    "yieldUnit": "طن قرون/فدان",
    "mainProduct": "قرون",
    "additionalProducts": "بذور مقشرة: 65–75% من القرون؛ زيت: 40–50% من البذور؛ عروش",
    "bestGovernorates": "الإسماعيلية، الشرقية، النوبارية، الوادي الجديد",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 70,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "قرون",
        "unit": "طن قرون/فدان",
        "yieldFeddan": 1.7,
        "yieldMinFeddan": 1.4,
        "yieldMaxFeddan": 2.0,
        "yield": 4.048,
        "kind": "main",
        "yieldNative": 1.7,
        "yieldNativeMin": 1.4,
        "yieldNativeMax": 2.0,
        "nativeUnit": "طن قرون/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 765.0,
        "yieldNativeMin": 560.0,
        "yieldNativeMax": 1000.0,
        "yieldFeddan": 0.765,
        "yieldMinFeddan": 0.56,
        "yieldMaxFeddan": 1.0,
        "yield": 1.821,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Sesame",
    "arabic": "سمسم",
    "group": "Oilseed crop",
    "groupAr": "زيتي",
    "days": 105,
    "kc": 0.75,
    "yield": 1.429,
    "yieldFeddan": 0.6,
    "yieldMinFeddan": 0.4,
    "yieldMaxFeddan": 0.8,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "زيت: 45–55% من البذور؛ كسب؛ عيدان",
    "bestGovernorates": "أسيوط، سوهاج، قنا، الوادي الجديد",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.6,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 0.8,
        "yield": 1.429,
        "kind": "main",
        "yieldNative": 0.6,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 0.8,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 300.0,
        "yieldNativeMin": 180.0,
        "yieldNativeMax": 440.0,
        "yieldFeddan": 0.3,
        "yieldMinFeddan": 0.18,
        "yieldMaxFeddan": 0.44,
        "yield": 0.714,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Sunflower",
    "arabic": "عباد الشمس",
    "group": "Oilseed",
    "groupAr": "زيتي",
    "days": 100,
    "kc": 0.75,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور",
    "additionalProducts": "زيت: 35–45% من البذور؛ كسب؛ سيقان",
    "bestGovernorates": "الأراضي الجديدة، المنيا، بني سويف",
    "dataType": "رسمي/تصنيعي",
    "source": "MALR-Stats",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 460.0,
        "yieldNativeMin": 280.0,
        "yieldNativeMax": 675.0,
        "yieldFeddan": 0.46,
        "yieldMinFeddan": 0.28,
        "yieldMaxFeddan": 0.675,
        "yield": 1.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Potato",
    "arabic": "بطاطس",
    "group": "Vegetable / tuber",
    "groupAr": "خضر",
    "days": 110,
    "kc": 0.85,
    "yield": 30.952,
    "yieldFeddan": 13.0,
    "yieldMinFeddan": 11.0,
    "yieldMaxFeddan": 15.0,
    "yieldUnit": "طن درنات/فدان",
    "mainProduct": "درنات تسويقية",
    "additionalProducts": "درنات تقاوي؛ فرزة: 5–15% حسب الجودة؛ عرش",
    "bestGovernorates": "النوبارية، البحيرة، المنيا، الدقهلية",
    "dataType": "رسمي",
    "source": "MALR-Stats",
    "ar": 200,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "درنات تسويقية",
        "unit": "طن درنات/فدان",
        "yieldFeddan": 13.0,
        "yieldMinFeddan": 11.0,
        "yieldMaxFeddan": 15.0,
        "yield": 30.952,
        "kind": "main",
        "yieldNative": 13.0,
        "yieldNativeMin": 11.0,
        "yieldNativeMax": 15.0,
        "nativeUnit": "طن درنات/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Tomato",
    "arabic": "طماطم",
    "group": "Vegetable",
    "groupAr": "خضر",
    "days": 120,
    "kc": 0.9,
    "yield": 45.238,
    "yieldFeddan": 19.0,
    "yieldMinFeddan": 16.0,
    "yieldMaxFeddan": 22.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ثمار تصنيع/فرزة: 10–30% حسب السوق؛ بذور تقاوي؛ مخلفات",
    "bestGovernorates": "البحيرة، النوبارية، الإسماعيلية، الفيوم، الشرقية",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 220,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 19.0,
        "yieldMinFeddan": 16.0,
        "yieldMaxFeddan": 22.0,
        "yield": 45.238,
        "kind": "main",
        "yieldNative": 19.0,
        "yieldNativeMin": 16.0,
        "yieldNativeMax": 22.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 3.8,
        "yieldMinFeddan": 1.9,
        "yieldMaxFeddan": 5.7,
        "yield": 9.048,
        "kind": "secondary",
        "yieldNative": 3.8,
        "yieldNativeMin": 1.9,
        "yieldNativeMax": 5.7,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Onion",
    "arabic": "بصل",
    "group": "Vegetable / export",
    "groupAr": "خضر/تصديري",
    "days": 120,
    "kc": 0.8,
    "yield": 38.095,
    "yieldFeddan": 16.0,
    "yieldMinFeddan": 14.0,
    "yieldMaxFeddan": 18.0,
    "yieldUnit": "طن أبصال/فدان",
    "mainProduct": "أبصال جافة",
    "additionalProducts": "بصل أخضر؛ بذور: 0.4–0.8 طن/فدان عند إنتاج التقاوي؛ عروش",
    "bestGovernorates": "الدقهلية، الغربية، سوهاج، المنيا",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أبصال جافة",
        "unit": "طن أبصال/فدان",
        "yieldFeddan": 16.0,
        "yieldMinFeddan": 14.0,
        "yieldMaxFeddan": 18.0,
        "yield": 38.095,
        "kind": "main",
        "yieldNative": 16.0,
        "yieldNativeMin": 14.0,
        "yieldNativeMax": 18.0,
        "nativeUnit": "طن أبصال/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Garlic",
    "arabic": "ثوم",
    "group": "Vegetable / export",
    "groupAr": "خضر/تصديري",
    "days": 140,
    "kc": 0.8,
    "yield": 22.619,
    "yieldFeddan": 9.5,
    "yieldMinFeddan": 8.0,
    "yieldMaxFeddan": 11.0,
    "yieldUnit": "طن رؤوس/فدان",
    "mainProduct": "رؤوس",
    "additionalProducts": "فصوص تقاوي؛ عروش؛ فرزة 5–10% حسب الصنف",
    "bestGovernorates": "المنيا، بني سويف، الفيوم، الدقهلية",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 160,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "رؤوس",
        "unit": "طن رؤوس/فدان",
        "yieldFeddan": 9.5,
        "yieldMinFeddan": 8.0,
        "yieldMaxFeddan": 11.0,
        "yield": 22.619,
        "kind": "main",
        "yieldNative": 9.5,
        "yieldNativeMin": 8.0,
        "yieldNativeMax": 11.0,
        "nativeUnit": "طن رؤوس/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Cucumber",
    "arabic": "خيار",
    "group": "Vegetable",
    "groupAr": "خضر",
    "days": 90,
    "kc": 0.85,
    "yield": 40.476,
    "yieldFeddan": 17.0,
    "yieldMinFeddan": 12.0,
    "yieldMaxFeddan": 22.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ثمار تخليل؛ بذور تقاوي",
    "bestGovernorates": "الدلتا، الصوب، النوبارية",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 17.0,
        "yieldMinFeddan": 12.0,
        "yieldMaxFeddan": 22.0,
        "yield": 40.476,
        "kind": "main",
        "yieldNative": 17.0,
        "yieldNativeMin": 12.0,
        "yieldNativeMax": 22.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Eggplant",
    "arabic": "باذنجان",
    "group": "Vegetable",
    "groupAr": "خضر",
    "days": 120,
    "kc": 0.85,
    "yield": 38.095,
    "yieldFeddan": 16.0,
    "yieldMinFeddan": 12.0,
    "yieldMaxFeddan": 20.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "بذور تقاوي؛ مخلفات نباتية",
    "bestGovernorates": "البحيرة، الشرقية، الفيوم، المنيا",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 16.0,
        "yieldMinFeddan": 12.0,
        "yieldMaxFeddan": 20.0,
        "yield": 38.095,
        "kind": "main",
        "yieldNative": 16.0,
        "yieldNativeMin": 12.0,
        "yieldNativeMax": 20.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Dill",
    "arabic": "شبت",
    "group": "Vegetable / medicinal",
    "groupAr": "خضر/طبي عطري",
    "days": 90,
    "kc": 0.75,
    "yield": 27.381,
    "yieldFeddan": 11.5,
    "yieldMinFeddan": 8.0,
    "yieldMaxFeddan": 15.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "عشب أخضر",
    "additionalProducts": "عشب جاف: 1–2 طن/فدان؛ بذور: 0.5–0.9 طن/فدان؛ زيت عطري",
    "bestGovernorates": "الدلتا، الفيوم، بني سويف، المنيا",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 11.5,
        "yieldMinFeddan": 8.0,
        "yieldMaxFeddan": 15.0,
        "yield": 27.381,
        "kind": "main",
        "yieldNative": 11.5,
        "yieldNativeMin": 8.0,
        "yieldNativeMax": 15.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Chamomile",
    "arabic": "كاموميل / بابونج",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.7,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن أزهار جافة/فدان",
    "mainProduct": "أزهار جافة",
    "additionalProducts": "أزهار طازجة: 3–6 طن/فدان؛ زيت عطري؛ مخلفات نباتية",
    "bestGovernorates": "الفيوم، بني سويف، المنيا، أسيوط",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 80,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أزهار جافة",
        "unit": "طن أزهار جافة/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن أزهار جافة/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Marjoram",
    "arabic": "بردقوش",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.75,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن جاف/فدان",
    "mainProduct": "عشب جاف",
    "additionalProducts": "عشب أخضر: 5–10 طن/فدان؛ أوراق جافة؛ زيت عطري",
    "bestGovernorates": "المنيا، بني سويف، الفيوم",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Thyme",
    "arabic": "زعتر",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.75,
    "yield": 4.762,
    "yieldFeddan": 2.0,
    "yieldMinFeddan": 1.0,
    "yieldMaxFeddan": 3.0,
    "yieldUnit": "طن جاف/فدان",
    "mainProduct": "عشب جاف",
    "additionalProducts": "عشب أخضر: 5–12 طن/فدان؛ أوراق مجروشة؛ زيت عطري",
    "bestGovernorates": "المنيا، بني سويف، الأراضي الجديدة",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 2.0,
        "yieldMinFeddan": 1.0,
        "yieldMaxFeddan": 3.0,
        "yield": 4.762,
        "kind": "main",
        "yieldNative": 2.0,
        "yieldNativeMin": 1.0,
        "yieldNativeMax": 3.0,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 42,
        "yieldNativeMin": 25,
        "yieldNativeMax": 60,
        "yieldFeddan": 0.042,
        "yieldMinFeddan": 0.025,
        "yieldMaxFeddan": 0.06,
        "yield": 0.1,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Geranium",
    "arabic": "عتر / جيرانيوم",
    "group": "Aromatic oil crop",
    "groupAr": "عطري زيتي",
    "days": 180,
    "kc": 0.8,
    "yield": 47.619,
    "yieldFeddan": 20.0,
    "yieldMinFeddan": 15.0,
    "yieldMaxFeddan": 25.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "عشب أخضر للتقطير",
    "additionalProducts": "زيت عطري: 25–60 كجم/فدان؛ ماء عطري؛ مخلفات تقطير",
    "bestGovernorates": "بني سويف، الفيوم، المنيا",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 120,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب أخضر للتقطير",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 20.0,
        "yieldMinFeddan": 15.0,
        "yieldMaxFeddan": 25.0,
        "yield": 47.619,
        "kind": "main",
        "yieldNative": 20.0,
        "yieldNativeMin": 15.0,
        "yieldNativeMax": 25.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 42,
        "yieldNativeMin": 25,
        "yieldNativeMax": 60,
        "yieldFeddan": 0.042,
        "yieldMinFeddan": 0.025,
        "yieldMaxFeddan": 0.06,
        "yield": 0.1,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Mint",
    "arabic": "نعناع",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.85,
    "yield": 44.048,
    "yieldFeddan": 18.5,
    "yieldMinFeddan": 12.0,
    "yieldMaxFeddan": 25.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "عشب أخضر",
    "additionalProducts": "عشب جاف: 2–4 طن/فدان؛ أوراق جافة؛ زيت نعناع",
    "bestGovernorates": "الفيوم، بني سويف، المنيا",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 140,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 18.5,
        "yieldMinFeddan": 12.0,
        "yieldMaxFeddan": 25.0,
        "yield": 44.048,
        "kind": "main",
        "yieldNative": 18.5,
        "yieldNativeMin": 12.0,
        "yieldNativeMax": 25.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Basil",
    "arabic": "ريحان",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 100,
    "kc": 0.8,
    "yield": 35.714,
    "yieldFeddan": 15.0,
    "yieldMinFeddan": 10.0,
    "yieldMaxFeddan": 20.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "عشب أخضر",
    "additionalProducts": "عشب جاف: 1.5–2.5 طن/فدان؛ أوراق جافة؛ زيت ريحان",
    "bestGovernorates": "بني سويف، الفيوم، المنيا",
    "dataType": "شبه رسمي/إرشادي",
    "source": "MALR-Cost + Indicative",
    "ar": 120,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 15.0,
        "yieldMinFeddan": 10.0,
        "yieldMaxFeddan": 20.0,
        "yield": 35.714,
        "kind": "main",
        "yieldNative": 15.0,
        "yieldNativeMin": 10.0,
        "yieldNativeMax": 20.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Fennel",
    "arabic": "شمر",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 140,
    "kc": 0.75,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "عشب أخضر؛ زيت بذور؛ زيت عشب",
    "bestGovernorates": "المنيا، أسيوط، سوهاج، الفيوم",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 70,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Caraway",
    "arabic": "كراوية",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 130,
    "kc": 0.7,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "زيت عطري؛ مخلفات غربلة",
    "bestGovernorates": "المنيا، الفيوم، بني سويف",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 60,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Anise",
    "arabic": "ينسون",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.7,
    "yield": 1.905,
    "yieldFeddan": 0.8,
    "yieldMinFeddan": 0.6,
    "yieldMaxFeddan": 1.0,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "زيت يانسون؛ مخلفات غربلة",
    "bestGovernorates": "المنيا، أسيوط، الفيوم",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 60,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.8,
        "yieldMinFeddan": 0.6,
        "yieldMaxFeddan": 1.0,
        "yield": 1.905,
        "kind": "main",
        "yieldNative": 0.8,
        "yieldNativeMin": 0.6,
        "yieldNativeMax": 1.0,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Cumin",
    "arabic": "كمون",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.65,
    "yield": 1.667,
    "yieldFeddan": 0.7,
    "yieldMinFeddan": 0.5,
    "yieldMaxFeddan": 0.9,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "زيت كمون؛ مخلفات غربلة",
    "bestGovernorates": "المنيا، أسيوط، الفيوم",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 50,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.5,
        "yieldMaxFeddan": 0.9,
        "yield": 1.667,
        "kind": "main",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.5,
        "yieldNativeMax": 0.9,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Coriander",
    "arabic": "كزبرة",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 120,
    "kc": 0.7,
    "yield": 2.381,
    "yieldFeddan": 1.0,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.2,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "عشب أخضر؛ زيت كزبرة",
    "bestGovernorates": "الفيوم، بني سويف، المنيا",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 60,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 1.0,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.2,
        "yield": 2.381,
        "kind": "main",
        "yieldNative": 1.0,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Black cumin",
    "arabic": "حبة البركة",
    "group": "Medicinal / oilseed",
    "groupAr": "طبي عطري/زيتي",
    "days": 120,
    "kc": 0.65,
    "yield": 1.667,
    "yieldFeddan": 0.7,
    "yieldMinFeddan": 0.5,
    "yieldMaxFeddan": 0.9,
    "yieldUnit": "طن بذور/فدان",
    "mainProduct": "بذور جافة",
    "additionalProducts": "زيت ثابت: 25–35% تقريبًا؛ كسب بعد العصر",
    "bestGovernorates": "المنيا، الفيوم، بني سويف",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 50,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "بذور جافة",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.5,
        "yieldMaxFeddan": 0.9,
        "yield": 1.667,
        "kind": "main",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.5,
        "yieldNativeMax": 0.9,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 210.0,
        "yieldNativeMin": 125.0,
        "yieldNativeMax": 315.0,
        "yieldFeddan": 0.21,
        "yieldMinFeddan": 0.125,
        "yieldMaxFeddan": 0.315,
        "yield": 0.5,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Hibiscus",
    "arabic": "كركديه",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 160,
    "kc": 0.75,
    "yield": 1.786,
    "yieldFeddan": 0.75,
    "yieldMinFeddan": 0.5,
    "yieldMaxFeddan": 1.0,
    "yieldUnit": "طن كؤوس جافة/فدان",
    "mainProduct": "كؤوس جافة",
    "additionalProducts": "كؤوس طازجة: 2–4 طن/فدان؛ بذور؛ سيقان",
    "bestGovernorates": "أسوان، قنا، سوهاج، المنيا",
    "dataType": "شبه رسمي/إرشادي",
    "source": "MALR-Cost + Indicative",
    "ar": 80,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "كؤوس جافة",
        "unit": "طن كؤوس جافة/فدان",
        "yieldFeddan": 0.75,
        "yieldMinFeddan": 0.5,
        "yieldMaxFeddan": 1.0,
        "yield": 1.786,
        "kind": "main",
        "yieldNative": 0.75,
        "yieldNativeMin": 0.5,
        "yieldNativeMax": 1.0,
        "nativeUnit": "طن كؤوس جافة/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Henna",
    "arabic": "حناء",
    "group": "Medicinal / dye",
    "groupAr": "طبي/صبغي",
    "days": 240,
    "kc": 0.8,
    "yield": 3.571,
    "yieldFeddan": 1.5,
    "yieldMinFeddan": 1.0,
    "yieldMaxFeddan": 2.0,
    "yieldUnit": "طن أوراق جافة/فدان",
    "mainProduct": "أوراق جافة",
    "additionalProducts": "أوراق خضراء: 4–8 طن/فدان؛ مسحوق حناء؛ سيقان",
    "bestGovernorates": "أسوان، قنا، الأقصر",
    "dataType": "شبه رسمي/إرشادي",
    "source": "MALR-Cost + Indicative",
    "ar": 90,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أوراق جافة",
        "unit": "طن أوراق جافة/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1.0,
        "yieldMaxFeddan": 2.0,
        "yield": 3.571,
        "kind": "main",
        "yieldNative": 1.5,
        "yieldNativeMin": 1.0,
        "yieldNativeMax": 2.0,
        "nativeUnit": "طن أوراق جافة/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Sage",
    "arabic": "مريمية",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 140,
    "kc": 0.75,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن جاف/فدان",
    "mainProduct": "عشب جاف",
    "additionalProducts": "عشب أخضر: 4–8 طن/فدان؛ أوراق جافة؛ زيت عطري",
    "bestGovernorates": "الأراضي الجديدة، بني سويف، المنيا",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 80,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Lavender",
    "arabic": "لافندر",
    "group": "Aromatic oil crop",
    "groupAr": "عطري زيتي",
    "days": 180,
    "kc": 0.65,
    "yield": 2.024,
    "yieldFeddan": 0.85,
    "yieldMinFeddan": 0.5,
    "yieldMaxFeddan": 1.2,
    "yieldUnit": "طن أزهار جافة/فدان",
    "mainProduct": "أزهار جافة",
    "additionalProducts": "أزهار طازجة؛ زيت عطري حسب الصنف",
    "bestGovernorates": "الأراضي الجديدة، المناطق الأقل حرارة",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 70,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أزهار جافة",
        "unit": "طن أزهار جافة/فدان",
        "yieldFeddan": 0.85,
        "yieldMinFeddan": 0.5,
        "yieldMaxFeddan": 1.2,
        "yield": 2.024,
        "kind": "main",
        "yieldNative": 0.85,
        "yieldNativeMin": 0.5,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن أزهار جافة/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Lemongrass",
    "arabic": "ليمون جراس",
    "group": "Aromatic oil crop",
    "groupAr": "عطري زيتي",
    "days": 180,
    "kc": 0.9,
    "yield": 53.571,
    "yieldFeddan": 22.5,
    "yieldMinFeddan": 15.0,
    "yieldMaxFeddan": 30.0,
    "yieldUnit": "طن أخضر/فدان",
    "mainProduct": "عشب أخضر",
    "additionalProducts": "عشب جاف: 3–6 طن/فدان؛ زيت عطري",
    "bestGovernorates": "بني سويف، الفيوم، الأراضي الجديدة",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 120,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 22.5,
        "yieldMinFeddan": 15.0,
        "yieldMaxFeddan": 30.0,
        "yield": 53.571,
        "kind": "main",
        "yieldNative": 22.5,
        "yieldNativeMin": 15.0,
        "yieldNativeMax": 30.0,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Moringa",
    "arabic": "مورينجا",
    "group": "Medicinal / food",
    "groupAr": "طبي/غذائي",
    "days": 240,
    "kc": 0.75,
    "yield": 4.762,
    "yieldFeddan": 2.0,
    "yieldMinFeddan": 1.0,
    "yieldMaxFeddan": 3.0,
    "yieldUnit": "طن أوراق جافة/فدان",
    "mainProduct": "أوراق جافة",
    "additionalProducts": "أوراق خضراء؛ مسحوق أوراق؛ بذور؛ زيت بذور؛ قرون",
    "bestGovernorates": "الوادي الجديد، أسوان، الأراضي الجديدة",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 100,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "أوراق جافة",
        "unit": "طن أوراق جافة/فدان",
        "yieldFeddan": 2.0,
        "yieldMinFeddan": 1.0,
        "yieldMaxFeddan": 3.0,
        "yield": 4.762,
        "kind": "main",
        "yieldNative": 2.0,
        "yieldNativeMin": 1.0,
        "yieldNativeMax": 3.0,
        "nativeUnit": "طن أوراق جافة/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Wormwood",
    "arabic": "شيح",
    "group": "Medicinal & aromatic",
    "groupAr": "طبي عطري",
    "days": 150,
    "kc": 0.6,
    "yield": 2.738,
    "yieldFeddan": 1.15,
    "yieldMinFeddan": 0.8,
    "yieldMaxFeddan": 1.5,
    "yieldUnit": "طن جاف/فدان",
    "mainProduct": "عشب جاف",
    "additionalProducts": "عشب أخضر: 4–8 طن/فدان؛ زيت عطري",
    "bestGovernorates": "مطروح، سيناء، الأراضي الجديدة",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 50,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عشب جاف",
        "unit": "طن جاف/فدان",
        "yieldFeddan": 1.15,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 1.5,
        "yield": 2.738,
        "kind": "main",
        "yieldNative": 1.15,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 1.5,
        "nativeUnit": "طن جاف/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عشب أخضر",
        "unit": "طن أخضر/فدان",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 4,
        "yieldMaxFeddan": 12,
        "yield": 17.857,
        "kind": "secondary",
        "yieldNative": 7.5,
        "yieldNativeMin": 4,
        "yieldNativeMax": 12,
        "nativeUnit": "طن أخضر/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 35,
        "yieldNativeMin": 15,
        "yieldNativeMax": 70,
        "yieldFeddan": 0.035,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.07,
        "yield": 0.083,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Mango",
    "arabic": "مانجو",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.8,
    "yield": 16.667,
    "yieldFeddan": 7.0,
    "yieldMinFeddan": 4.0,
    "yieldMaxFeddan": 10.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ثمار تصنيع/لب/عصير؛ قشر؛ نوى؛ فرزة 10–30% حسب الجودة",
    "bestGovernorates": "الإسماعيلية، الشرقية، الجيزة، أسوان، النوبارية",
    "dataType": "رسمي/إرشادي",
    "source": "CAPMAS + MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 7.0,
        "yieldMinFeddan": 4.0,
        "yieldMaxFeddan": 10.0,
        "yield": 16.667,
        "kind": "main",
        "yieldNative": 7.0,
        "yieldNativeMin": 4.0,
        "yieldNativeMax": 10.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 1.4,
        "yieldMinFeddan": 0.7,
        "yieldMaxFeddan": 2.1,
        "yield": 3.333,
        "kind": "secondary",
        "yieldNative": 1.4,
        "yieldNativeMin": 0.7,
        "yieldNativeMax": 2.1,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Banana",
    "arabic": "موز",
    "group": "Fruit",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 1.05,
    "yield": 65.476,
    "yieldFeddan": 27.5,
    "yieldMinFeddan": 20.0,
    "yieldMaxFeddan": 35.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ورق؛ ساق كاذبة؛ مخلفات كمبوست/علف",
    "bestGovernorates": "القليوبية، البحيرة، المنوفية، الشرقية، الأقصر، أسوان",
    "dataType": "رسمي/إرشادي",
    "source": "CAPMAS",
    "ar": 260,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 27.5,
        "yieldMinFeddan": 20.0,
        "yieldMaxFeddan": 35.0,
        "yield": 65.476,
        "kind": "main",
        "yieldNative": 27.5,
        "yieldNativeMin": 20.0,
        "yieldNativeMax": 35.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Date palm - general",
    "arabic": "نخيل البلح عام",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.9,
    "yield": 21.429,
    "yieldFeddan": 9.0,
    "yieldMinFeddan": 6.0,
    "yieldMaxFeddan": 12.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار بلح/تمر",
    "additionalProducts": "نوى؛ جريد؛ ليف؛ كرب؛ سباطات",
    "bestGovernorates": "الوادي الجديد، أسوان، الجيزة، مطروح، شمال سيناء",
    "dataType": "رسمي/إرشادي",
    "source": "CAPMAS + MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار بلح/تمر",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 9.0,
        "yieldMinFeddan": 6.0,
        "yieldMaxFeddan": 12.0,
        "yield": 21.429,
        "kind": "main",
        "yieldNative": 9.0,
        "yieldNativeMin": 6.0,
        "yieldNativeMax": 12.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Date palm - Barhi",
    "arabic": "نخيل برحي",
    "group": "Date palm",
    "groupAr": "نخيل",
    "days": 365,
    "kc": 0.9,
    "yield": 22.619,
    "yieldFeddan": 9.5,
    "yieldMinFeddan": 7.0,
    "yieldMaxFeddan": 12.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "رطب برحي",
    "additionalProducts": "تمر نصف جاف؛ نوى؛ جريد",
    "bestGovernorates": "الوادي الجديد، توشكى، شرق العوينات، النوبارية",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "رطب برحي",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 9.5,
        "yieldMinFeddan": 7.0,
        "yieldMaxFeddan": 12.0,
        "yield": 22.619,
        "kind": "main",
        "yieldNative": 9.5,
        "yieldNativeMin": 7.0,
        "yieldNativeMax": 12.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Date palm - Siwi",
    "arabic": "نخيل سيوي",
    "group": "Date palm",
    "groupAr": "نخيل",
    "days": 365,
    "kc": 0.85,
    "yield": 19.048,
    "yieldFeddan": 8.0,
    "yieldMinFeddan": 6.0,
    "yieldMaxFeddan": 10.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "تمر نصف جاف",
    "additionalProducts": "عجوة/تصنيع؛ نوى؛ جريد",
    "bestGovernorates": "الواحات، الوادي الجديد، مطروح، الفيوم",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 170,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "تمر نصف جاف",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 8.0,
        "yieldMinFeddan": 6.0,
        "yieldMaxFeddan": 10.0,
        "yield": 19.048,
        "kind": "main",
        "yieldNative": 8.0,
        "yieldNativeMin": 6.0,
        "yieldNativeMax": 10.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 1.6,
        "yieldMinFeddan": 0.8,
        "yieldMaxFeddan": 2.4,
        "yield": 3.81,
        "kind": "secondary",
        "yieldNative": 1.6,
        "yieldNativeMin": 0.8,
        "yieldNativeMax": 2.4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Date palm - Saidi",
    "arabic": "نخيل صعيدي",
    "group": "Date palm",
    "groupAr": "نخيل",
    "days": 365,
    "kc": 0.85,
    "yield": 22.619,
    "yieldFeddan": 9.5,
    "yieldMinFeddan": 7.0,
    "yieldMaxFeddan": 12.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "تمر جاف/نصف جاف",
    "additionalProducts": "نوى؛ جريد؛ مخلفات نخيل",
    "bestGovernorates": "أسوان، قنا، الأقصر، الوادي الجديد",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 170,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "تمر جاف/نصف جاف",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 9.5,
        "yieldMinFeddan": 7.0,
        "yieldMaxFeddan": 12.0,
        "yield": 22.619,
        "kind": "main",
        "yieldNative": 9.5,
        "yieldNativeMin": 7.0,
        "yieldNativeMax": 12.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Date palm - Medjool",
    "arabic": "نخيل مجدول",
    "group": "Date palm",
    "groupAr": "نخيل",
    "days": 365,
    "kc": 0.9,
    "yield": 16.667,
    "yieldFeddan": 7.0,
    "yieldMinFeddan": 5.0,
    "yieldMaxFeddan": 9.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "تمر فاخر",
    "additionalProducts": "فرزة ثانية للتصنيع؛ نوى؛ جريد",
    "bestGovernorates": "الوادي الجديد، توشكى، شرق العوينات، النوبارية",
    "dataType": "إرشادي",
    "source": "Indicative/Extension",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "تمر فاخر",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 7.0,
        "yieldMinFeddan": 5.0,
        "yieldMaxFeddan": 9.0,
        "yield": 16.667,
        "kind": "main",
        "yieldNative": 7.0,
        "yieldNativeMin": 5.0,
        "yieldNativeMax": 9.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 1.4,
        "yieldMinFeddan": 0.7,
        "yieldMaxFeddan": 2.1,
        "yield": 3.333,
        "kind": "secondary",
        "yieldNative": 1.4,
        "yieldNativeMin": 0.7,
        "yieldNativeMax": 2.1,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Grapes",
    "arabic": "عنب",
    "group": "Fruit / export",
    "groupAr": "فاكهة",
    "days": 220,
    "kc": 0.7,
    "yield": 26.19,
    "yieldFeddan": 11.0,
    "yieldMinFeddan": 8.0,
    "yieldMaxFeddan": 14.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "عنب مائدة",
    "additionalProducts": "زبيب: 20–25% من العنب الطازج تقريبًا؛ عصير؛ دبس؛ مخلفات تقليم",
    "bestGovernorates": "النوبارية، البحيرة، المنيا، بني سويف، الدقهلية",
    "dataType": "رسمي/تصنيعي",
    "source": "CAPMAS + MALR-Stats",
    "ar": 150,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "عنب مائدة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 11.0,
        "yieldMinFeddan": 8.0,
        "yieldMaxFeddan": 14.0,
        "yield": 26.19,
        "kind": "main",
        "yieldNative": 11.0,
        "yieldNativeMin": 8.0,
        "yieldNativeMax": 14.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زبيب",
        "unit": "طن/فدان",
        "yieldFeddan": 2.48,
        "yieldMinFeddan": 1.6,
        "yieldMaxFeddan": 3.5,
        "yield": 5.905,
        "kind": "secondary",
        "yieldNative": 2.48,
        "yieldNativeMin": 1.6,
        "yieldNativeMax": 3.5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Pear",
    "arabic": "كمثرى",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.75,
    "yield": 21.429,
    "yieldFeddan": 9.0,
    "yieldMinFeddan": 6.0,
    "yieldMaxFeddan": 12.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ثمار تصنيع؛ عصير؛ مخلفات تقليم؛ فرزة 10–25%",
    "bestGovernorates": "البحيرة، النوبارية، الجيزة، القليوبية",
    "dataType": "رسمي/إرشادي",
    "source": "CAPMAS",
    "ar": 150,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 9.0,
        "yieldMinFeddan": 6.0,
        "yieldMaxFeddan": 12.0,
        "yield": 21.429,
        "kind": "main",
        "yieldNative": 9.0,
        "yieldNativeMin": 6.0,
        "yieldNativeMax": 12.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 1.8,
        "yieldMinFeddan": 0.9,
        "yieldMaxFeddan": 2.7,
        "yield": 4.286,
        "kind": "secondary",
        "yieldNative": 1.8,
        "yieldNativeMin": 0.9,
        "yieldNativeMax": 2.7,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Apple",
    "arabic": "تفاح",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.75,
    "yield": 17.857,
    "yieldFeddan": 7.5,
    "yieldMinFeddan": 5.0,
    "yieldMaxFeddan": 10.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "عصير؛ خل؛ ثمار تصنيع؛ مخلفات تقليم؛ فرزة 10–30%",
    "bestGovernorates": "النوبارية، البحيرة، مطروح، الأراضي الجديدة",
    "dataType": "رسمي/إرشادي",
    "source": "CAPMAS",
    "ar": 150,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 7.5,
        "yieldMinFeddan": 5.0,
        "yieldMaxFeddan": 10.0,
        "yield": 17.857,
        "kind": "main",
        "yieldNative": 7.5,
        "yieldNativeMin": 5.0,
        "yieldNativeMax": 10.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 1.5,
        "yieldMinFeddan": 0.75,
        "yieldMaxFeddan": 2.25,
        "yield": 3.571,
        "kind": "secondary",
        "yieldNative": 1.5,
        "yieldNativeMin": 0.75,
        "yieldNativeMax": 2.25,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Citrus / Orange",
    "arabic": "برتقال",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.75,
    "yield": 29.762,
    "yieldFeddan": 12.5,
    "yieldMinFeddan": 10.0,
    "yieldMaxFeddan": 15.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "عصير؛ قشر؛ زيت قشر؛ تفل",
    "bestGovernorates": "البحيرة، النوبارية، الشرقية، الإسماعيلية",
    "dataType": "رسمي/تصنيعي",
    "source": "CAPMAS + MALR-Stats",
    "ar": 220,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 12.5,
        "yieldMinFeddan": 10.0,
        "yieldMaxFeddan": 15.0,
        "yield": 29.762,
        "kind": "main",
        "yieldNative": 12.5,
        "yieldNativeMin": 10.0,
        "yieldNativeMax": 15.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Lemon",
    "arabic": "ليمون",
    "group": "Fruit tree",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.75,
    "yield": 26.19,
    "yieldFeddan": 11.0,
    "yieldMinFeddan": 8.0,
    "yieldMaxFeddan": 14.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "عصير؛ قشر؛ زيت قشر",
    "bestGovernorates": "الشرقية، البحيرة، الفيوم، بني سويف",
    "dataType": "رسمي/تصنيعي",
    "source": "CAPMAS",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 11.0,
        "yieldMinFeddan": 8.0,
        "yieldMaxFeddan": 14.0,
        "yield": 26.19,
        "kind": "main",
        "yieldNative": 11.0,
        "yieldNativeMin": 8.0,
        "yieldNativeMax": 14.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 40,
        "yieldNativeMin": 15,
        "yieldNativeMax": 80,
        "yieldFeddan": 0.04,
        "yieldMinFeddan": 0.015,
        "yieldMaxFeddan": 0.08,
        "yield": 0.095,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Olive",
    "arabic": "زيتون",
    "group": "Fruit / oil",
    "groupAr": "فاكهة/زيت",
    "days": 365,
    "kc": 0.65,
    "yield": 9.524,
    "yieldFeddan": 4.0,
    "yieldMinFeddan": 2.0,
    "yieldMaxFeddan": 6.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار زيتون",
    "additionalProducts": "زيت زيتون: 15–25%؛ زيتون مائدة؛ تفل؛ نوى",
    "bestGovernorates": "مطروح، سيناء، النوبارية، الفيوم، الوادي الجديد",
    "dataType": "رسمي/تصنيعي",
    "source": "CAPMAS + MALR-Stats",
    "ar": 120,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار زيتون",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 4.0,
        "yieldMinFeddan": 2.0,
        "yieldMaxFeddan": 6.0,
        "yield": 9.524,
        "kind": "main",
        "yieldNative": 4.0,
        "yieldNativeMin": 2.0,
        "yieldNativeMax": 6.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "زيت/زيت عطري",
        "unit": "كجم زيت/فدان",
        "nativeUnit": "كجم زيت/فدان",
        "yieldNative": 800.0,
        "yieldNativeMin": 300.0,
        "yieldNativeMax": 1500.0,
        "yieldFeddan": 0.8,
        "yieldMinFeddan": 0.3,
        "yieldMaxFeddan": 1.5,
        "yield": 1.905,
        "kind": "processed",
        "calcNote": "للحسابات تم تحويل كجم الزيت/فدان إلى طن زيت/فدان ثم طن/هكتار."
      }
    ]
  },
  {
    "crop": "Pomegranate",
    "arabic": "رمان",
    "group": "Fruit / export",
    "groupAr": "فاكهة",
    "days": 365,
    "kc": 0.7,
    "yield": 26.19,
    "yieldFeddan": 11.0,
    "yieldMinFeddan": 8.0,
    "yieldMaxFeddan": 14.0,
    "yieldUnit": "طن ثمار/فدان مثمر",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "عصير؛ قشر؛ بذور/أريل؛ دبس",
    "bestGovernorates": "أسيوط، المنيا، بني سويف، الأراضي الجديدة",
    "dataType": "رسمي/تصنيعي",
    "source": "CAPMAS",
    "ar": 150,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان مثمر",
        "yieldFeddan": 11.0,
        "yieldMinFeddan": 8.0,
        "yieldMaxFeddan": 14.0,
        "yield": 26.19,
        "kind": "main",
        "yieldNative": 11.0,
        "yieldNativeMin": 8.0,
        "yieldNativeMax": 14.0,
        "nativeUnit": "طن ثمار/فدان مثمر",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "قش/تبن",
        "unit": "طن/فدان",
        "yieldFeddan": 3,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 5,
        "yield": 7.143,
        "kind": "secondary",
        "yieldNative": 3,
        "yieldNativeMin": 1,
        "yieldNativeMax": 5,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "بذور",
        "unit": "طن بذور/فدان",
        "yieldFeddan": 0.7,
        "yieldMinFeddan": 0.4,
        "yieldMaxFeddan": 1.2,
        "yield": 1.667,
        "kind": "secondary",
        "yieldNative": 0.7,
        "yieldNativeMin": 0.4,
        "yieldNativeMax": 1.2,
        "nativeUnit": "طن بذور/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Strawberry",
    "arabic": "فراولة",
    "group": "Fruit / export",
    "groupAr": "فاكهة/تصديري",
    "days": 150,
    "kc": 0.75,
    "yield": 34.524,
    "yieldFeddan": 14.5,
    "yieldMinFeddan": 10.0,
    "yieldMaxFeddan": 18.0,
    "yieldUnit": "طن ثمار/فدان",
    "mainProduct": "ثمار طازجة",
    "additionalProducts": "ثمار تصنيع/تجميد؛ فرزة؛ شتلات",
    "bestGovernorates": "البحيرة، الإسماعيلية، القليوبية، النوبارية",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 180,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "ثمار طازجة",
        "unit": "طن ثمار/فدان",
        "yieldFeddan": 14.5,
        "yieldMinFeddan": 10.0,
        "yieldMaxFeddan": 18.0,
        "yield": 34.524,
        "kind": "main",
        "yieldNative": 14.5,
        "yieldNativeMin": 10.0,
        "yieldNativeMax": 18.0,
        "nativeUnit": "طن ثمار/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "ثمار تصنيع/فرزة",
        "unit": "طن/فدان",
        "yieldFeddan": 2.9,
        "yieldMinFeddan": 1.45,
        "yieldMaxFeddan": 4.35,
        "yield": 6.905,
        "kind": "secondary",
        "yieldNative": 2.9,
        "yieldNativeMin": 1.45,
        "yieldNativeMax": 4.35,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  },
  {
    "crop": "Sweet potato",
    "arabic": "بطاطا",
    "group": "Vegetable / export",
    "groupAr": "خضر/تصديري",
    "days": 140,
    "kc": 0.85,
    "yield": 34.524,
    "yieldFeddan": 14.5,
    "yieldMinFeddan": 12.0,
    "yieldMaxFeddan": 17.0,
    "yieldUnit": "طن درنات/فدان",
    "mainProduct": "درنات",
    "additionalProducts": "عرش أخضر/علف؛ فرزة؛ تقاوي",
    "bestGovernorates": "البحيرة، المنوفية، الشرقية، كفر الشيخ",
    "dataType": "رسمي/إرشادي",
    "source": "MALR-Stats",
    "ar": 140,
    "cmax": 0.05,
    "cnat": 0,
    "products": [
      {
        "name": "درنات",
        "unit": "طن درنات/فدان",
        "yieldFeddan": 14.5,
        "yieldMinFeddan": 12.0,
        "yieldMaxFeddan": 17.0,
        "yield": 34.524,
        "kind": "main",
        "yieldNative": 14.5,
        "yieldNativeMin": 12.0,
        "yieldNativeMax": 17.0,
        "nativeUnit": "طن درنات/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      },
      {
        "name": "عروش/مخلفات",
        "unit": "طن/فدان",
        "yieldFeddan": 2,
        "yieldMinFeddan": 1,
        "yieldMaxFeddan": 4,
        "yield": 4.762,
        "kind": "secondary",
        "yieldNative": 2,
        "yieldNativeMin": 1,
        "yieldNativeMax": 4,
        "nativeUnit": "طن/فدان",
        "calcNote": "محسوبة كطن/هكتار من وحدة المنتج"
      }
    ]
  }
];

const methods = [
  { name:'Flood / surface irrigation', arabic:'ري بالغمر / ري سطحي', ea:0.50 },
  { name:'Sprinkler irrigation', arabic:'ري بالرش', ea:0.75 },
  { name:'Drip irrigation', arabic:'ري بالتنقيط', ea:0.85 },
  { name:'Manual / edit value', arabic:'يدوي / تعديل القيمة', ea:0.75 }
];


let pieChart, barChart, etoMonthlyChart, sensitivityChart, monteCarloChart, govScoreChart;
let latestComparison = [];
let latestOptimal = [];
let latestIrrigationComparison = [];

const $ = id => document.getElementById(id);
let currentLang = localStorage.getItem('programLang') || 'ar';
const DEVELOPER_PASSWORD = '3M-DEV-2026';
const developerUnlocked = {eto10years:false, database:false};
const i18n = {
  ar:{
    tabCountries:'الدول', tabAdvanced:'التحليل العلمي المتقدم', tabEconomicsRisk:'اقتصاديات المياه والمخاطر', tabMethodology:'المنهجية والمصادر', overviewSuitability:'درجة الملاءمة', overviewAppliedWF:'إجمالي البصمة التطبيقية',
    countrySourceChip:'80 دولة — حاسبة سيناريوهات يدوية لبيانات الدولة والمحصول الموثقة', countrySelectLabel:'اختر الدولة', countryInfoInitial:'اختر دولة لعرض بياناتها المختصرة.', openCountryBtn:'فتح الدولة', calculateCountryNowBtn:'احسب نتائج الدولة كاملة الآن', resetCountryInputsBtn:'تفريغ قيم الإدخال اليدوي', countryManualNote:'اختيار أي دولة من الـ80 دولة يفتح نفس حاسبة البصمة المائية الكاملة المستخدمة للمحافظات المصرية، لكن في وضع <strong>Manual — User Input</strong>. كل الأرقام اللازمة للحسابات للدولة المختارة — المناخ، المحصول، الإنتاجية، الري، المساحة، النيتروجين والحدود البيئية — تكون من إدخالك أنت فقط، ويمكن استخدام بيانات منشورة في أوراق علمية، FAO، تقارير حكومية، أو قياسات محلية موثقة.<br><br><strong>تنبيه منهجي:</strong> صفحة الدول ليست قاعدة بيانات عالمية مغلقة؛ هي حاسبة دولية يدوية عالية المصداقية لأنها لا تفترض قيمًا عامة لدول تختلف بشدة في المناخ والمحاصيل والإنتاجية والإدارة. يمكن حساب أهم المحاصيل في كل دولة بعد إدخال البيانات وتوثيق مصدرها، بينما تظل مصر حالة الدراسة والتحقق الآلي.',
    countryManualInputsTitle:'مدخلات الدولة اليدوية للحساب الكامل', countryCropLabel:'المحصول المقترح للدولة', countryCropSelectFirst:'اختر الدولة أولًا', countryManualCropLabel:'محصول يدوي آخر', countryProductLabel:'المنتج المستخدم في الحساب', countryCropNotesLabel:'ملاحظات مصدر بيانات المحصول', countryEToDayLabel:'ETo مم/يوم', countryAnnualEToLabel:'ETo السنوي مم/سنة', countryRainLabel:'الأمطار P مم/موسم', countryEaLabel:'كفاءة الري Ea', countryDaysLabel:'مدة النمو بالأيام', countryYieldLabel:'الإنتاجية طن/هكتار', countryAreaLabel:'المساحة بالفدان', countryNLabel:'معدل النيتروجين كجم/هكتار', countryCmaxLabel:'Cmax كجم/م³', countryCnatLabel:'Cnat كجم/م³', countryAppliedWaterLabel:'المياه المطبقة م³/هكتار', countryAfterInputNote:'<strong>بعد إدخال بيانات الدولة والمحصول:</strong> اضغط زر <strong>«احسب نتائج الدولة كاملة الآن»</strong>. ستظهر النتائج داخل صفحة <strong>الدول</strong> نفسها، ويمكنك أيضًا فتح نفس السيناريو في صفحة الحسابات التفصيلية.', countryResultsTitle:'نتائج حساب الدولة المختارة', countryScenarioInitial:'لم يتم الحساب بعد. اختر الدولة والمحصول وأدخل القيم اليدوية ثم اضغط زر الحساب.', statusLabel:'الحالة', countryWaitingCalc:'في انتظار إدخال البيانات والحساب.', openDetailedCalcBtn:'فتح نفس النتائج في صفحة الحسابات التفصيلية', countryNoHeader:'م', continentHeader:'القارة', countryHeader:'الدولة', priorityHeader:'الأولوية', mainCropsHeader:'أهم المحاصيل', wfRelevanceHeader:'صلة البصمة المائية',
    methodologyTitle:'المنهجية والمعادلات والمصادر', exportScenarioJSON:'تصدير سيناريو JSON', saveScenario:'حفظ السيناريو', loadScenario:'استرجاع السيناريو', coreEquationsTitle:'المعادلات الأساسية', dataLayersTitle:'طبقات البيانات', currentScenarioAuditTitle:'تدقيق السيناريو الحالي', sourceConfidenceTitle:'مصفوفة ثقة المصادر', limitationsValidationTitle:'حدود الاستخدام والتحقق', natureReadinessTitle:'جاهزية Nature Water وإعادة الإنتاج المفتوح', scenarioManagementTitle:'إدارة السيناريوهات', scenarioManagementNote:'يمكنك تصدير السيناريو كاملًا JSON أو Excel، حفظ آخر سيناريو داخل المتصفح، واستيراده لاحقًا لإعادة نفس الحسابات.', scenarioStatusInitial:'لم يتم استيراد أو حفظ أي سيناريو في هذه الجلسة.',
    languageLabel:'اللغة', tabCalculator:'الحاسبة الرئيسية', tabComparison:'مقارنة المحافظات', tabEgyptAgriMap:'الخريطة الزراعية المحدثة', tabETo:'ETo 10 Years', tabDatabase:'قواعد البيانات',
    inputsTitle:'المدخلات', resetBtn:'إعادة ضبط', labelGovernorate:'المحافظة', labelCrop:'المحصول', labelMethod:'طريقة الري', labelRain:'الأمطار الموسمية P (مم)', labelEa:'كفاءة الري Ea', labelEt0:'متوسط ET0 لعشر سنوات (مم/يوم)', labelAnnualETo:'ETo السنوي (مم/سنة)', labelKc:'معامل المحصول Kc', labelYield:'الإنتاجية للمنتج المختار (طن/هكتار)', labelDays:'مدة النمو (يوم)', labelPeffMode:'طريقة المطر الفعال', labelManualPeff:'المطر الفعال اليدوي Peff (مم)', peffAuto:'تلقائي من أمطار المحافظة', peffManual:'إدخال يدوي', coreFormulas:'المعادلات الأساسية',
    greenWF:'البصمة الخضراء', blueWF:'البصمة الزرقاء', greyWF:'البصمة الرمادية', totalWF:'إجمالي البصمة المائية', wfComponents:'مكونات البصمة المائية', detailedCalcs:'الحسابات التفصيلية',
    exportCSV:'تصدير CSV', comparisonTitle:'مقارنة المحافظات', optimalTitle:'التوزيع الأمثل للمحافظات للمحصول المختار', optimalSubtitle:'توزيع مقترح لأفضل المحافظات لزراعة المحصول المختار بناءً على أقل إجمالي بصمة مائية، ثم توزيع المساحة المطلوبة حسب مساحة الأراضي القابلة للزراعة بكل محافظة.', exportOptimal:'تصدير التوزيع CSV', targetAreaLabel:'المساحة المطلوب زراعتها (فدان)', topNLabel:'عدد أفضل المحافظات', distributionLogic:'منطق التوزيع: يتم ترتيب المحافظات مائيًا حسب أقل Total applied WF، ثم اختيار أفضل N محافظات، ثم توزيع المساحة المطلوبة بينها بنسبة مساحة الأراضي القابلة للزراعة لكل محافظة. إذا كان المطلوب أكبر من إجمالي المساحة المتاحة يتم إظهار العجز.', bestGovCard:'أفضل محافظة', bestAllocatedCard:'المساحة المخصصة لأفضل محافظة', selectedCapacityCard:'إجمالي المساحة المتاحة المختارة', uncoveredCard:'المساحة غير المغطاة',
    etoTitle:'قاعدة بيانات ETo لعشر سنوات حسب المحافظة', etoSubtitle:'البيانات مستخرجة من الملف المرفق: متوسطات ETo الشهرية والسنوية لكل محافظة خلال الفترة 2016–2025.', exportETo:'تصدير ETo الشهري CSV', datasetPeriod:'فترة البيانات', governoratesCard:'عدد المحافظات', monthlyRecords:'السجلات الشهرية', usedInCalculator:'مستخدم في الحاسبة', monthlyProfile:'منحنى ETo الشهري', monthlyAverages:'جدول المتوسطات الشهرية', annualSummary:'ملخص ETo السنوي المستخدم في البرنامج',
    govDbTitle:'قاعدة بيانات المناخ والمساحات القابلة للزراعة', cropDbTitle:'قاعدة بيانات المحاصيل', developerOnlyNote:'هذا القسم مخصص للمطور فقط ومحمي بكلمة مرور.', databaseNote:'مصدر ETo: ملف العمل المرفق ETo_Egypt_Governorates_10_Years. مصدر المساحات: نشرة الإحصاءات الزراعية، وزارة الزراعة واستصلاح الأراضي، قطاع الشئون الاقتصادية، 2020/2021، جدول 17 (إجمالي المساحة المنزرعة)، مع إدراج النوبارية والمشروعات الزراعية الكبرى ضمن قائمة المحافظات كمناطق تخطيط غير محافظات قياسية. بيانات الأمطار إقليمية افتراضية ويجب مراجعتها بمحطات محلية قبل التخطيط النهائي.', footerText:'تم تطوير البرنامج لتقييم البصمة المائية للمحاصيل على مستوى محافظات مصر، مع تحديث طبقة المساحات والخريطة الزراعية طبقًا لإجمالي المساحة المنزرعة الرسمية 2020/2021 ومشروعات الاستصلاح الجديدة. قيم ETo معايرة من ملف المحافظات لعشر سنوات، ويجب التحقق من بيانات الأمطار وETo محليًا قبل التخطيط النهائي.',
    egyptMapTitle:'خريطة مصر الزراعية المحدثة', egyptMapSubtitle:'تجمع هذه الخريطة بين توزيع المحاصيل، النباتات الطبية والعطرية، إجمالي المساحة المنزرعة الرسمية لكل محافظة، تجمع النوبارية غير المحافظاتي، وأهم مشروعات الاستصلاح والتنمية الزراعية الجديدة.', passwordPrompt:'هذا القسم مخصص للمطور فقط. من فضلك أدخل كلمة المرور:', passwordWrong:'كلمة المرور غير صحيحة.', unitFeddan:'فدان', region:'الإقليم', arableCapacity:'إجمالي المساحة المنزرعة الرسمية', arableSource:'مصدر المساحة', noPublished:'لا توجد قيمة منشورة بالمصدر', available:'متاح',
    tableRank:'الترتيب', tableGovernorate:'المحافظة', tableRegion:'الإقليم', tableTotalWF:'إجمالي WF', tableWPI:'مؤشر إنتاجية المياه', tableArable:'إجمالي المساحة المنزرعة', tableCapacityShare:'نسبة السعة', tableAllocated:'المساحة المخصصة', tableAllocationShare:'نسبة التوزيع', tableVisual:'مؤشر بصري',
    calcETc:'الاحتياج المائي للمحصول ETc', calcPeff:'المطر الفعال Peff', calcETGreen:'ET الأخضر', calcETBlue:'ET الأزرق', calcCWUGreen:'استهلاك المياه الخضراء CWU', calcCWUBlue:'استهلاك المياه الزرقاء الإجمالي CWUblue gross', calcNIR:'صافي احتياجات الري NIR', calcGIR:'إجمالي احتياجات الري GIR', calcGIRVol:'حجم مياه الري الإجمالي', labelArea:'المساحة المزروعة (فدان)', labelScenario:'سيناريو الأمطار', scenarioDry:'جاف', scenarioNormal:'متوسط', scenarioWet:'رطب', labelCustomYield:'إنتاجية قابلة للتعديل للمنتج المختار (طن/هكتار)', labelNitrogen:'معدل التسميد N / AR (كجم/هكتار)', netBlueWF:'البصمة الزرقاء الصافية', grossBlueWF:'البصمة الزرقاء المعدلة بكفاءة الري', waterSaving:'توفير المياه مقارنة بالغمر', decisionTitle:'ملخص القرار والتوصية', printReport:'طباعة / حفظ PDF', exportIrrigation:'تصدير مقارنة الري CSV', classificationTitle:'التصنيف', farmScaleTitle:'تقدير على مستوى المساحة', recommendationTitle:'توصية مختصرة',
    noteRegion:'الإقليم', noteArable:'إجمالي المساحة المنزرعة الرسمية', notePeak:'شهر الذروة', sourceText:'المصدر', bestGov:'أفضل محافظة', monthHeader:'الشهر', stationHeader:'المحطة', yearsHeader:'السنوات', maxMonthlyHeader:'أعلى ETo شهري', minMonthlyHeader:'أقل ETo شهري', peakMonthHeader:'شهر الذروة'
  },
  en:{
    tabCountries:'Countries', tabAdvanced:'Advanced Scientific Analysis', tabEconomicsRisk:'Water Economics & Risk', tabMethodology:'Methodology & Sources', overviewSuitability:'Suitability Score', overviewAppliedWF:'Total Applied WF',
    countrySourceChip:'80 Countries — Manual-input scenario calculator for documented country-crop data', countrySelectLabel:'Select country', countryInfoInitial:'Select a country to display its brief profile.', openCountryBtn:'Open country', calculateCountryNowBtn:'Calculate full country results now', resetCountryInputsBtn:'Clear manual input values', countryManualNote:'Selecting any of the 80 countries opens the same full water-footprint calculator used for Egyptian governorates, but in <strong>Manual — User Input</strong> mode. All country-specific values required for calculation — climate, crop, yield, irrigation, area, nitrogen and environmental limits — are entered by the user only, using documented data from scientific papers, FAO, government reports, or verified local measurements.<br><br><strong>Methodological note:</strong> the countries page is not a closed global default database. It is a documented international manual calculator that avoids assuming generic values for countries that differ strongly in climate, crops, yield and management. Major crops in any country can be calculated after data entry and source documentation, while Egypt remains the automated validation case study.',
    countryManualInputsTitle:'Manual country inputs for the full calculation', countryCropLabel:'Suggested country crop', countryCropSelectFirst:'Select country first', countryManualCropLabel:'Other manual crop name', countryProductLabel:'Product used in calculation', countryCropNotesLabel:'Crop data source notes', countryEToDayLabel:'ETo mm/day', countryAnnualEToLabel:'Annual ETo mm/year', countryRainLabel:'Rain P mm/season', countryEaLabel:'Irrigation efficiency Ea', countryDaysLabel:'Growing days', countryYieldLabel:'Yield ton/ha', countryAreaLabel:'Area feddan', countryNLabel:'N application kg/ha', countryCmaxLabel:'Cmax kg/m³', countryCnatLabel:'Cnat kg/m³', countryAppliedWaterLabel:'Applied water m³/ha', countryAfterInputNote:'<strong>After entering country and crop data:</strong> click <strong>“Calculate full country results now”</strong>. Results will appear inside the <strong>Countries</strong> page, and the same scenario can also be opened in the detailed calculator page.', countryResultsTitle:'Selected Country Calculation Results', countryScenarioInitial:'No calculation yet. Select the country and crop, enter manual values, then press calculate.', statusLabel:'Status', countryWaitingCalc:'Waiting for data entry and calculation.', openDetailedCalcBtn:'Open the same results in the detailed calculator page', countryNoHeader:'No.', continentHeader:'Continent', countryHeader:'Country', priorityHeader:'Priority', mainCropsHeader:'Main crops', wfRelevanceHeader:'WF relevance',
    methodologyTitle:'Methodology, Equations & Sources', exportScenarioJSON:'Export scenario JSON', saveScenario:'Save scenario', loadScenario:'Load scenario', coreEquationsTitle:'Core equations', dataLayersTitle:'Data layers', currentScenarioAuditTitle:'Current scenario audit', sourceConfidenceTitle:'Source confidence matrix', limitationsValidationTitle:'Limitations & validation checklist', natureReadinessTitle:'Nature Water readiness & open reproducibility', scenarioManagementTitle:'Scenario management', scenarioManagementNote:'You can export the full scenario as JSON or Excel, save the latest scenario in the browser, and import it later to reproduce the same calculations.', scenarioStatusInitial:'No scenario has been imported or saved in this session.',
    languageLabel:'Language', tabCalculator:'Main Calculator', tabComparison:'Governorate Comparison', tabEgyptAgriMap:'Updated Egypt Agri Map', tabETo:'ETo 10 Years', tabDatabase:'Databases',
    inputsTitle:'Inputs', resetBtn:'Reset', labelGovernorate:'Governorate', labelCrop:'Crop', labelMethod:'Irrigation method', labelRain:'Seasonal rainfall P (mm)', labelEa:'Irrigation efficiency Ea', labelEt0:'10-year average ET0 (mm/day)', labelAnnualETo:'Annual ETo (mm/year)', labelKc:'Crop coefficient Kc', labelYield:'Selected product yield (ton/ha)', labelDays:'Growing period (days)', labelPeffMode:'Effective rainfall mode', labelManualPeff:'Manual Peff (mm)', peffAuto:'Auto from governorate rainfall', peffManual:'Manual override', coreFormulas:'Core formulas',
    greenWF:'Green WF', blueWF:'Blue WF', greyWF:'Grey WF', totalWF:'Total applied WF', wfComponents:'Water footprint components', detailedCalcs:'Detailed calculations',
    exportCSV:'Export CSV', comparisonTitle:'Governorate comparison', optimalTitle:'Optimal governorate distribution for selected crop', optimalSubtitle:'Suggested distribution among the best governorates for the selected crop based on the lowest total water footprint, then allocating the requested area according to each governorate’s available arable land.', exportOptimal:'Export allocation CSV', targetAreaLabel:'Target cultivated area (feddan)', topNLabel:'Number of best governorates', distributionLogic:'Allocation logic: governorates are ranked by the lowest Total applied WF. The best N governorates are selected, then the requested area is distributed in proportion to available arable land in each governorate. If the target exceeds the selected capacity, the uncovered area is shown.', bestGovCard:'Best governorate', bestAllocatedCard:'Best allocated area', selectedCapacityCard:'Selected arable capacity', uncoveredCard:'Uncovered target area',
    etoTitle:'10-Year ETo dataset by governorate', etoSubtitle:'Data from the uploaded workbook: monthly and annual ETo averages for each governorate over 2016–2025.', exportETo:'Export monthly ETo CSV', datasetPeriod:'Dataset period', governoratesCard:'Governorates', monthlyRecords:'Monthly records', usedInCalculator:'Used in calculator', monthlyProfile:'Monthly ETo profile', monthlyAverages:'Monthly averages table', annualSummary:'Annual ETo summary used by the program',
    govDbTitle:'Climate and arable land database', cropDbTitle:'Crop database', developerOnlyNote:'This section is for the developer only and is password protected.', databaseNote:'ETo source: uploaded ETo_Egypt_Governorates_10_Years workbook. Area source: Ministry of Agriculture and Land Reclamation, Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17 (official total cultivated area), with Nubaria and major national projects added to the governorate selector as planning zones, clearly flagged as non-standard governorates. Rainfall values are regional defaults and should be checked with local stations before final planning.', footerText:'Developed for crop water footprint assessment at Egypt governorate level, with the agricultural map and area layer updated using official 2020/2021 total cultivated area values and major new reclamation projects. ETo values are calibrated from the uploaded 10-year governorate workbook; rainfall and ETo should be verified locally before final planning.',
    egyptMapTitle:'Updated Egypt Agricultural Map', egyptMapSubtitle:'This map combines crop distribution, medicinal and aromatic plants, official cultivated area totals by governorate, the non-governorate Nubaria agricultural cluster, and major new agricultural reclamation projects.', passwordPrompt:'This section is for the developer only. Please enter the password:', passwordWrong:'Wrong password.', unitFeddan:'feddan', region:'Region', arableCapacity:'Official cultivated area', arableSource:'Area source', noPublished:'No published value in source', available:'Available',
    tableRank:'Rank', tableGovernorate:'Governorate', tableRegion:'Region', tableTotalWF:'Total applied WF', tableWPI:'Water Productivity Index', tableArable:'Official cultivated area', tableCapacityShare:'Capacity share', tableAllocated:'Allocated area', tableAllocationShare:'Allocation share', tableVisual:'Visual share',
    calcETc:'Crop evapotranspiration ETc', calcPeff:'Effective rainfall Peff', calcETGreen:'Green ET', calcETBlue:'Blue ET', calcCWUGreen:'Green water use CWU', calcCWUBlue:'Gross blue water use CWU', calcNIR:'Net irrigation requirement NIR', calcGIR:'Gross irrigation requirement GIR', calcGIRVol:'Gross irrigation volume', labelArea:'Cultivated area (feddan)', labelScenario:'Rainfall scenario', scenarioDry:'Dry', scenarioNormal:'Normal', scenarioWet:'Wet', labelCustomYield:'Editable selected-product yield (ton/ha)', labelNitrogen:'N fertilizer rate / AR (kg/ha)', netBlueWF:'Net Blue WF', grossBlueWF:'Irrigation-efficiency-adjusted Blue WF', waterSaving:'Water saving vs flood', decisionTitle:'Decision summary and recommendation', printReport:'Print / Save PDF', exportIrrigation:'Export irrigation CSV', classificationTitle:'Classification', farmScaleTitle:'Farm-scale estimate', recommendationTitle:'Short recommendation',
    noteRegion:'Region', noteArable:'Official cultivated area', notePeak:'Peak month', sourceText:'Source', bestGov:'Best governorate', monthHeader:'Month', stationHeader:'Station', yearsHeader:'Years', maxMonthlyHeader:'Max monthly ETo', minMonthlyHeader:'Min monthly ETo', peakMonthHeader:'Peak month'
  }
};
const tr = key => (i18n[currentLang] && i18n[currentLang][key]) || i18n.en[key] || key;
const fmt = (n,d=1) => Number.isFinite(n) ? Number(n).toLocaleString(currentLang === 'ar' ? 'ar-EG' : 'en-US',{minimumFractionDigits:d,maximumFractionDigits:d}) : '-';
// quick bilingual helper for inline strings
const T = (ar,en) => currentLang === 'ar' ? ar : en;
// ===== Arabic -> English translation for data content (product names, units, types, planning phrases) =====
const AR_EN = {
  // product names / main products
  'حبوب':'grain','قش':'straw','قش/تبن':'straw/hay','تبن':'hay','أرز شعير':'paddy rice',
  'بذور':'seeds','بذور جافة':'dry seeds','عروش':'tops','عروش/مخلفات':'tops/residues','مخلفات':'residues',
  'زيت':'oil','زيت/زيت عطري':'oil / essential oil','زيت عطري':'essential oil',
  'درنات':'tubers','درنات تسويقية':'marketable tubers','جذور':'roots','ثمار':'fruit',
  'ثمار طازجة':'fresh fruit','ثمار زيتون':'olive fruit','ثمار تصنيع/فرزة':'processing / cull fruit',
  'ثمار بلح/تمر':'date fruit','أبصال':'bulbs','أبصال جافة':'dry bulbs','رؤوس':'heads','قرون':'pods',
  'أزهار جافة':'dried flowers','كؤوس جافة':'dried calyces','أوراق جافة':'dried leaves','عيدان':'canes',
  'زهر':'lint','قطن زهر':'seed cotton','عشب أخضر':'green herbage','عشب أخضر للتقطير':'green herbage for distillation',
  'عشب جاف':'dry herbage','علف أخضر':'green fodder','علف أخضر سنوي':'annual green fodder','دريس':'hay',
  'سيلاج':'silage','زبيب':'raisins','عنب مائدة':'table grapes','تمر فاخر':'premium dates',
  'تمر نصف جاف':'semi-dry dates','تمر جاف/نصف جاف':'dry / semi-dry dates','رطب برحي':'Barhi fresh dates',
  // groups
  'ألياف':'fiber','ألياف/زيت':'fiber / oil','بقوليات':'legumes','بقوليات/طبية':'legumes / medicinal',
  'خضر':'vegetables','خضر/تصديري':'vegetables / export','خضر/طبي عطري':'vegetables / medicinal-aromatic',
  'زيتي':'oilseed','زيتي/بقوليات':'oilseed / legume','سكرية':'sugar','طبي عطري':'medicinal & aromatic',
  'طبي عطري/زيتي':'medicinal-aromatic / oil','طبي/صبغي':'medicinal / dye','طبي/غذائي':'medicinal / food',
  'عطري زيتي':'aromatic-oil','علف':'fodder','علف معمر':'perennial fodder','فاكهة':'fruit',
  'فاكهة/تصديري':'fruit / export','فاكهة/زيت':'fruit / oil','نخيل':'palm',
  // data types
  'رسمي':'Official','إرشادي':'Indicative','رسمي/إرشادي':'Official / Indicative',
  'رسمي/تصنيعي':'Official / Processing','شبه رسمي/إرشادي':'Semi-official / Indicative',
  // planning / demand phrases
  'مياه متاحة':'Available water','تحقق إنتاج ومياه':'Production & water check','احتياج إنتاجي':'Production requirement',
  'المياه المتاحة تكفي الاحتياج':'Available water meets the requirement',
  'المياه المتاحة لا تكفي الاحتياج':'Available water does not meet the requirement',
  'لم يتم إدخال مياه متاحة للتحقق':'No available water entered to check',
  'احتياج ري منخفض/متوسط':'Low / moderate irrigation need','احتياج ري متوسط':'Moderate irrigation need','احتياج ري مرتفع':'High irrigation need',
  'طن/فدان':'ton/feddan',
  'طن حبوب/فدان':'ton grain/feddan','طن قش/فدان':'ton straw/feddan','طن أرز شعير/فدان':'ton paddy rice/feddan',
  'طن بذور/فدان':'ton seeds/feddan','طن جذور/فدان':'ton roots/feddan','طن ثمار/فدان':'ton fruit/feddan',
  'طن ثمار/فدان مثمر':'ton fruit/bearing feddan','طن درنات/فدان':'ton tubers/feddan','طن أبصال/فدان':'ton bulbs/feddan',
  'طن رؤوس/فدان':'ton heads/feddan','طن قرون/فدان':'ton pods/feddan','طن أزهار جافة/فدان':'ton dried flowers/feddan',
  'طن كؤوس جافة/فدان':'ton dried calyces/feddan','طن أوراق جافة/فدان':'ton dried leaves/feddan','طن عيدان/فدان':'ton canes/feddan',
  'طن زهر/فدان':'ton seed cotton/feddan','طن أخضر/فدان':'ton green/feddan','طن أخضر/فدان/سنة':'ton green/feddan/year',
  'طن جاف/فدان':'ton dry/feddan','كجم زيت/فدان':'kg oil/feddan'
};
// word-level vocabulary for free text fallback (units, additional products, notes)
const AR_EN_WORDS = {
  'طن':'ton','كجم':'kg','فدان':'feddan','هكتار':'ha','سنة':'year','مثمر':'bearing','تقريبًا':'approx.',
  'حبوب':'grain','قش':'straw','تبن':'hay','بذور':'seeds','بذرة':'seed','أرز':'rice','شعير':'barley',
  'عروش':'tops','عرش':'haulm','مخلفات':'residues','زيت':'oil','عطري':'essential','عطرية':'aromatic',
  'درنات':'tubers','جذور':'roots','ثمار':'fruit','تصنيع':'processing','طازجة':'fresh','طازج':'fresh',
  'زيتون':'olive','أبصال':'bulbs','بصل':'onion','رؤوس':'heads','قرون':'pods','خضراء':'green',
  'أزهار':'flowers','كؤوس':'calyces','أوراق':'leaves','ورق':'leaves','عيدان':'canes','زهر':'lint',
  'قطن':'cotton','عشب':'herbage','أخضر':'green','جاف':'dry','جافة':'dry','علف':'fodder','دريس':'hay',
  'سيلاج':'silage','زبيب':'raisins','عنب':'grapes','مائدة':'table','تمر':'dates','رطب':'fresh-dates',
  'نوى':'pits','جريد':'fronds','ليف':'fiber','كرب':'leaf-bases','سباطات':'bunches','مولاس':'molasses',
  'سكر':'sugar','مصاصة':'bagasse','قوالح':'cobs','تقاوي':'seed-stock','فرزة':'culls','شتلات':'seedlings',
  'عصير':'juice','قشر':'peel','دبس':'molasses','خل':'vinegar','كسب':'meal-cake','تفل':'pomace',
  'مسحوق':'powder','حناء':'henna','ماء':'water','تقطير':'distillation','غربلة':'screening','تقليم':'pruning',
  'ساق':'stem','كاذبة':'pseudo','كمبوست':'compost','حطب':'stalks','سرسة':'broken-rice','أريل':'aril',
  'فصوص':'cloves','نباتية':'plant','نصف':'semi','صنف':'variety','الصنف':'variety','حسب':'by','من':'of',
  'عند':'at','إنتاج':'production','الطازج':'fresh','ثابت':'fixed','أبيض':'white','عدس':'lentil','ريحان':'basil',
  'نعناع':'mint','كزبرة':'coriander','كمون':'cumin','يانسون':'anise','السوق':'market','الجودة':'quality',
  'الاستخلاص':'extraction','الاستخدام':'use','بعد':'after','التبييض':'milling','العصر':'pressing','مجروشة':'crushed',
  'مقشرة':'shelled','أرز أبيض':'white rice','شعر':'lint'
};
function arWords(str){
  return String(str).replace(/[\u0600-\u06FF]+(?:[\u0640]| [\u0600-\u06FF]+)*/g, run =>
    run.split(/\s+/).map(w => AR_EN_WORDS[w] || w).join(' ')
  );
}
// returns English content in EN mode (exact map first, then word fallback); unchanged in AR mode
function enC(str){
  if(currentLang === 'ar' || str == null || str === '') return str;
  const t = String(str).trim();
  if(AR_EN[str] !== undefined) return AR_EN[str];
  if(AR_EN[t] !== undefined) return AR_EN[t];
  if(!/[\u0621-\u064A]/.test(str)) return str;
  return arWords(str);
}
function applyBilingualLabels(){
  // Auto-handles static labels written as "Arabic / English" (or "English / Arabic")
  // so they show only the selected language instead of both at once.
  const hasAr = s => /[\u0621-\u064A]/.test(s);
  document.querySelectorAll('span,h1,h2,h3,h4,button,option,th').forEach(el => {
    if(el.hasAttribute('data-i18n') || el.hasAttribute('data-i18n-html')) return;
    if(el.children.length) return; // process leaf text only
    let ar = el.dataset.biAr, en = el.dataset.biEn;
    if(ar === undefined || en === undefined){
      const txt = (el.textContent || '').trim();
      const parts = txt.split(/\s+\/\s+/); // require spaces around slash (skips units like طن/فدان, m³/ton)
      if(parts.length !== 2) return;
      const p0 = parts[0].trim(), p1 = parts[1].trim();
      const a0 = hasAr(p0), a1 = hasAr(p1);
      if(a0 === a1) return; // need exactly one Arabic side and one non-Arabic side
      ar = a0 ? p0 : p1;
      en = a0 ? p1 : p0;
      el.dataset.biAr = ar;
      el.dataset.biEn = en;
    }
    el.textContent = currentLang === 'ar' ? ar : en;
  });
}
function applyLanguage(){
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = tr(el.dataset.i18nHtml); });
  document.querySelectorAll('option[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  applyBilingualLabels();
  document.querySelectorAll('[data-ph-ar][data-ph-en]').forEach(el => { el.placeholder = currentLang === 'ar' ? el.dataset.phAr : el.dataset.phEn; });
  if(typeof window.refreshCountryLanguage === 'function') window.refreshCountryLanguage();
  const _ab=document.getElementById('adminFloatBtn'); if(_ab) _ab.textContent = currentLang==='ar'?'⚙️ المستخدمين':'⚙️ Users';
  const _lb=document.getElementById('logoutFloatBtn'); if(_lb) _lb.textContent = currentLang==='ar'?'🚪 خروج':'🚪 Logout';
  if($('languageSelect')) $('languageSelect').value = currentLang;
  updateSelectLabels();
}
function displayGov(g){
  const tag = g.isAgriZone ? (currentLang === 'ar' ? ` (${g.agriZoneType === 'cluster' ? 'تجمع زراعي' : 'مشروع زراعي'})` : ` (${g.agriZoneType === 'cluster' ? 'Agricultural cluster' : 'Agricultural project'})`) : '';
  return (currentLang === 'ar' ? (g.arabic || g.governorate) : (g.governorate || g.arabic)) + tag;
}
function displayCrop(c){ return currentLang === 'ar' ? (c.arabic || c.crop) : (c.crop || c.arabic); }
function updateSelectLabels(){
  const gv=$('govSelect')?.value, cp=$('cropSelect')?.value, md=$('methodSelect')?.value, eg=$('etoGovSelect')?.value, pr=$('productSelect')?.value;
  if($('govSelect')){
    const govOptions = governorates.map(g => `<option value="${g.governorate}">${displayGov(g)}</option>`).join('');
    $('govSelect').innerHTML = govOptions;
    if(gv) $('govSelect').value = gv;
  }
  if($('cropSelect')){ $('cropSelect').innerHTML = crops.map(c => `<option value="${c.crop}">${displayCrop(c)}</option>`).join(''); if(cp) $('cropSelect').value = cp; }
  updateProductOptions(pr);
  if($('methodSelect')){ $('methodSelect').innerHTML = methods.map(m => `<option value="${m.name}">${currentLang === 'ar' ? (m.arabic || m.name) : m.name}</option>`).join(''); if(md) $('methodSelect').value = md; }
  if($('etoGovSelect')){ $('etoGovSelect').innerHTML = governorates.map(g => `<option value="${g.governorate}">${displayGov(g)}</option>`).join(''); if(eg) $('etoGovSelect').value = eg; }
}
function requireDeveloperAccess(tab){
  if(!['eto10years','database'].includes(tab) || developerUnlocked[tab]) return true;
  const pass = window.prompt(tr('passwordPrompt'));
  if(pass === DEVELOPER_PASSWORD){ developerUnlocked[tab] = true; return true; }
  if(pass !== null) window.alert(tr('passwordWrong'));
  return false;
}

function compute(input){
  const manualETc = Number(input.manualETc) || 0;
  const etc = manualETc > 0 ? manualETc : input.days * input.et0 * input.kc;
  const scenarioFactor = Number(input.rainScenario) || 1;
  const rawPeff = input.peffMode === 'Manual' ? input.manualPeff : input.rain * scenarioFactor * input.peffFraction;
  const peff = Math.max(0, Math.min(etc, rawPeff));
  let etGreen = Math.min(etc, peff);
  let etBlue = Math.max(0, etc - peff);

  if(input.manualETBlue > 0){
    etBlue = Math.max(0, Number(input.manualETBlue));
    etGreen = Math.max(0, etc - etBlue);
  }

  // Yield can be entered directly, derived from total production and area, or read from the database.
  const derivedYield = (input.manualProduction > 0 && input.areaFeddan > 0) ? input.manualProduction / (input.areaFeddan * 0.42) : 0;
  const effectiveYield = derivedYield > 0 ? derivedYield : input.yield;

  const cwuGreen = etGreen * 10;
  const nir = etBlue;
  let gir = input.ea ? etBlue / input.ea : 0;
  if(input.manualAppliedWater > 0){
    gir = Number(input.manualAppliedWater) / 10; // m³/ha ÷ 10 = mm
    etBlue = gir * (input.ea || 1);
  }
  const cwuBlueNet = etBlue * 10;
  const cwuBlue = gir * 10;

  const greenWF = effectiveYield > 0 ? cwuGreen / effectiveYield : 0;
  const netBlueWF = effectiveYield > 0 ? cwuBlueNet / effectiveYield : 0;
  const blueWF = effectiveYield > 0 ? cwuBlue / effectiveYield : 0;
  const greyWF = effectiveYield > 0 && input.cmax > input.cnat ? (input.alpha * input.ar) / ((input.cmax - input.cnat) * effectiveYield) : 0;
  const totalWF = greenWF + blueWF + greyWF;
  const netTotalWF = greenWF + netBlueWF + greyWF;
  const floodGIR = etBlue / 0.50;
  const waterSaving = floodGIR > 0 ? Math.max(0, (floodGIR - gir) / floodGIR * 100) : 0;
  const productionTon = input.areaFeddan * 0.42 * effectiveYield;
  const grossIrrigationVolume = input.areaFeddan * 0.42 * gir * 10;
  const netIrrigationVolume = input.areaFeddan * 0.42 * nir * 10;
  return {etc, peff, etGreen, etBlue, cwuGreen, cwuBlueNet, cwuBlue, greenWF, netBlueWF, blueWF, greyWF, totalWF, netTotalWF, nir, gir, girVol:gir*10, floodGIR, waterSaving, productionTon, grossIrrigationVolume, netIrrigationVolume, effectiveYield, derivedYield};
}

function computeDemandPlanning(base, r){
  const safety = Math.max(0, Number(base.planningSafetyMargin) || 0) / 100;
  const yieldPerFeddan = (Number(r.effectiveYield) || Number(base.yield) || 0) * 0.42;
  const grossWaterPerFeddan = (Number(r.gir) || 0) * 0.42 * 10;
  const netWaterPerFeddan = (Number(r.nir) || 0) * 0.42 * 10;
  const targetProduction = Math.max(0, Number(base.targetProductionDemand) || 0);
  const availableWater = Math.max(0, Number(base.availableWaterDemand) || 0);
  const areaForProductionRaw = yieldPerFeddan > 0 ? targetProduction / yieldPerFeddan : 0;
  const areaForProduction = areaForProductionRaw * (1 + safety);
  const waterForProduction = areaForProduction * grossWaterPerFeddan;
  const netWaterForProduction = areaForProduction * netWaterPerFeddan;
  const areaByWater = grossWaterPerFeddan > 0 && availableWater > 0 ? availableWater / grossWaterPerFeddan : 0;
  const productionByWater = areaByWater * yieldPerFeddan;
  const waterBalance = availableWater > 0 ? availableWater - waterForProduction : 0;
  const feasible = availableWater <= 0 || waterBalance >= 0;
  const selectedArea = base.demandTargetType === 'water' ? areaByWater : areaForProduction;
  const selectedProduction = selectedArea * yieldPerFeddan;
  const selectedGrossWater = selectedArea * grossWaterPerFeddan;
  const selectedNetWater = selectedArea * netWaterPerFeddan;
  const greenVolume = selectedProduction * (Number(r.greenWF) || 0);
  const blueGrossVolume = selectedProduction * (Number(r.blueWF) || 0);
  const greyVolume = selectedProduction * (Number(r.greyWF) || 0);
  const totalWFVolume = selectedProduction * (Number(r.totalWF) || 0);
  return {safety, yieldPerFeddan, grossWaterPerFeddan, netWaterPerFeddan, targetProduction, availableWater, areaForProduction, waterForProduction, netWaterForProduction, areaByWater, productionByWater, waterBalance, feasible, selectedArea, selectedProduction, selectedGrossWater, selectedNetWater, greenVolume, blueGrossVolume, greyVolume, totalWFVolume};
}

function renderDemandPlanning(base, r){
  const box = $('demandPlannerSummary');
  if(!box) return;
  const d = computeDemandPlanning(base, r);
  const modeText = enC(base.demandTargetType === 'water' ? 'مياه متاحة' : base.demandTargetType === 'both' ? 'تحقق إنتاج ومياه' : 'احتياج إنتاجي');
  const balanceClass = d.feasible ? 'good-badge' : 'danger-badge';
  const balanceText = enC(d.availableWater > 0 ? (d.feasible ? 'المياه المتاحة تكفي الاحتياج' : 'المياه المتاحة لا تكفي الاحتياج') : 'لم يتم إدخال مياه متاحة للتحقق');
  box.innerHTML = `
    <div class="triple-grid">
      <div class="metric-card"><div class="m-label">${T('المساحة المطلوبة','Required area')}</div><div class="m-value">${fmt(d.areaForProduction,1)}</div><div class="m-label">${T('فدان لتحقيق','feddan to reach')} ${fmt(d.targetProduction,1)} ${T('طن مع هامش','ton with margin')} ${fmt(d.safety*100,0)}%</div></div>
      <div class="metric-card"><div class="m-label">${T('المياه المطلوبة للإنتاج','Water required for production')}</div><div class="m-value">${fmt(d.waterForProduction,0)}</div><div class="m-label">${T('م³ مياه ري إجمالية','m³ gross irrigation water')}</div></div>
      <div class="metric-card"><div class="m-label">${T('إنتاجية الفدان المستخدمة','Feddan yield used')}</div><div class="m-value">${fmt(d.yieldPerFeddan,2)}</div><div class="m-label">${T('طن/فدان طبقًا للمدخلات الحالية','ton/feddan per current inputs')}</div></div>
    </div>
    <div class="table-wrap" style="margin-top:12px"><table><tbody>
      <tr><td><strong>${T('نوع التخطيط','Planning type')}</strong></td><td>${modeText}</td></tr>
      <tr><td><strong>${T('مياه الري/فدان','Irrigation water/feddan')}</strong></td><td>${fmt(d.grossWaterPerFeddan,1)} ${T('م³/فدان','m³/feddan')} Gross — ${fmt(d.netWaterPerFeddan,1)} ${T('م³/فدان','m³/feddan')} Net</td></tr>
      <tr><td><strong>${T('المساحة الممكن زراعتها حسب المياه المتاحة','Plantable area by available water')}</strong></td><td>${d.availableWater>0 ? fmt(d.areaByWater,1)+' '+T('فدان','feddan') : '-'}</td></tr>
      <tr><td><strong>${T('الإنتاج الممكن حسب المياه المتاحة','Possible production by available water')}</strong></td><td>${d.availableWater>0 ? fmt(d.productionByWater,1)+' '+T('طن','ton') : '-'}</td></tr>
      <tr><td><strong>${T('عجز/فائض المياه','Water deficit/surplus')}</strong></td><td><span class="badge ${balanceClass}">${balanceText}</span> ${d.availableWater>0 ? fmt(d.waterBalance,0)+' m³' : ''}</td></tr>
      <tr><td><strong>${T('البصمة الخضراء لحجم الإنتاج المختار','Green WF of selected production volume')}</strong></td><td>${fmt(d.greenVolume,0)} m³</td></tr>
      <tr><td><strong>${T('البصمة الزرقاء الإجمالية لحجم الإنتاج المختار','Gross blue WF of selected production volume')}</strong></td><td>${fmt(d.blueGrossVolume,0)} m³</td></tr>
      <tr><td><strong>${T('البصمة الرمادية لحجم الإنتاج المختار','Grey WF of selected production volume')}</strong></td><td>${fmt(d.greyVolume,0)} m³</td></tr>
      <tr><td><strong>${T('إجمالي حجم البصمة المائية','Total water footprint volume')}</strong></td><td><strong>${fmt(d.totalWFVolume,0)} m³</strong></td></tr>
    </tbody></table></div>`;
  if($('demandPlannerMiniBox')){
    $('demandPlannerMiniBox').innerHTML = `${T('المساحة حسب الاحتياج','Area by requirement')}: <strong>${fmt(d.areaForProduction,1)}</strong> ${T('فدان','feddan')}<br>${T('المياه المطلوبة','Water required')}: <strong>${fmt(d.waterForProduction,0)}</strong> m³<br><span class="badge ${balanceClass}">${balanceText}</span>`;
  }
}



function cropProductForPlanning(crop){
  const products = crop.products && crop.products.length ? crop.products : [{name:crop.mainProduct || crop.arabic, unit:crop.yieldUnit || 'طن/فدان', yield:crop.yield, yieldFeddan:crop.yieldFeddan, kind:'main'}];
  return products[0] || {};
}

function baseForCropGov(base, crop, gov){
  const product = cropProductForPlanning(crop);
  const yieldFallback = Number(product.yield) || Number(crop.yield) || 1;
  return {
    ...base,
    cropName: crop.crop,
    cropArabic: crop.arabic,
    cropGroup: crop.group,
    productName: product.name || crop.mainProduct || crop.arabic,
    productUnit: product.unit || crop.yieldUnit || 'طن/فدان',
    productYieldFeddan: product.yieldFeddan || crop.yieldFeddan || (yieldFallback*0.42),
    days: Number(crop.days) || base.days,
    kc: Number(crop.kc) || base.kc,
    yield: yieldFallback,
    ar: Number(crop.ar) || base.ar,
    cmax: Number(crop.cmax) || base.cmax,
    cnat: Number(crop.cnat) || base.cnat,
    et0: Number(gov.et0) || base.et0,
    rain: Number(gov.rain) || base.rain,
    annualETo: Number(gov.annualETo) || base.annualETo,
    peffFraction: Number(gov.peffFraction) || base.peffFraction,
    alpha: Number(gov.alpha) || base.alpha,
    areaFeddan: 1,
    manualProduction: 0
  };
}

function suitabilityReason(score, wf, gir, arable){
  const parts=[];
  if(score >= 75) parts.push(T('ملاءمة مرتفعة','High suitability')); else if(score >= 55) parts.push(T('ملاءمة متوسطة','Moderate suitability')); else parts.push(T('ملاءمة منخفضة','Low suitability'));
  if(wf < 1500) parts.push(T('بصمة مائية مناسبة','Suitable water footprint')); else if(wf < 2500) parts.push(T('بصمة مائية مرتفعة نسبيًا','Relatively high water footprint')); else parts.push(T('بصمة مائية عالية','Very high water footprint'));
  if(gir < 500) parts.push(enC('احتياج ري منخفض/متوسط')); else if(gir < 900) parts.push(enC('احتياج ري متوسط')); else parts.push(enC('احتياج ري مرتفع'));
  if(arable <= 0) parts.push(T('لا توجد مساحة قابلة للزراعة منشورة','No published arable area'));
  return parts.join(T('، ', ', '));
}

function buildCropAreaAllocation(base){
  const targetArea = Math.max(0, Number($('multiCropTargetArea')?.value) || 0);
  const availableWater = Math.max(0, Number($('multiCropAvailableWater')?.value) || 0);
  const minScore = Math.max(0, Math.min(100, Number($('minSuitabilityAllocation')?.value) || 55));
  const maxRows = Math.max(1, Math.min(80, Math.round(Number($('maxAllocationOptions')?.value) || 12)));
  const candidates=[];
  governorates.forEach(g=>{
    crops.forEach(c=>{
      const input = baseForCropGov(base,c,g);
      const r = compute(input);
      const s = calculateSuitabilityFor(g,input).score;
      const arable = Math.max(0, Number(g.arableTotalFeddan) || 0);
      const waterPerFeddan = Math.max(0, (Number(r.gir)||0) * 0.42 * 10);
      const yieldPerFeddan = Math.max(0, (Number(r.effectiveYield)||Number(input.yield)||0) * 0.42);
      const suitable = s >= minScore && arable > 0 && Number.isFinite(r.totalWF) && r.totalWF > 0;
      candidates.push({gov:g, crop:c, input, result:r, score:s, arable, waterPerFeddan, yieldPerFeddan, suitable, reason:suitabilityReason(s,r.totalWF,r.gir,arable)});
    });
  });
  const ranked = candidates.filter(x=>x.suitable).sort((a,b)=>{
    if(Math.abs(b.score-a.score)>0.001) return b.score-a.score;
    return a.result.totalWF-b.result.totalWF;
  });
  const usedByGov = new Map();
  let remainingArea = targetArea;
  let remainingWater = availableWater;
  const rows=[];
  for(const x of ranked){
    if(rows.length >= maxRows || remainingArea <= 0) break;
    const used = usedByGov.get(x.gov.governorate) || 0;
    const govCapacity = Math.max(0, x.arable - used);
    if(govCapacity <= 0) continue;
    let possibleByWater = Infinity;
    if(availableWater > 0){
      if(x.waterPerFeddan <= 0) continue;
      possibleByWater = remainingWater / x.waterPerFeddan;
    }
    const allocatedArea = Math.max(0, Math.min(remainingArea, govCapacity, possibleByWater));
    if(allocatedArea <= 0) continue;
    const waterNeeded = allocatedArea * x.waterPerFeddan;
    const production = allocatedArea * x.yieldPerFeddan;
    rows.push({...x, allocatedArea, waterNeeded, production, rank:rows.length+1});
    usedByGov.set(x.gov.governorate, used + allocatedArea);
    remainingArea -= allocatedArea;
    if(availableWater > 0) remainingWater -= waterNeeded;
  }
  const unsuitable = candidates.filter(x=>!x.suitable).sort((a,b)=>b.score-a.score).slice(0,20);
  return {targetArea, availableWater, minScore, maxRows, rows, unsuitable, allocatedArea:rows.reduce((s,x)=>s+x.allocatedArea,0), waterNeeded:rows.reduce((s,x)=>s+x.waterNeeded,0), production:rows.reduce((s,x)=>s+x.production,0), remainingArea:Math.max(0,remainingArea), remainingWater:availableWater>0?Math.max(0,remainingWater):0};
}

function renderCropAreaAllocation(){
  if(!$('cropAllocationRows')) return [];
  const allocation = buildCropAreaAllocation(getInput());
  $('allocatedCropAreaCard').textContent = fmt(allocation.allocatedArea,0);
  $('unallocatedCropAreaCard').textContent = fmt(allocation.remainingArea,0);
  $('allocationWaterCard').textContent = fmt(allocation.waterNeeded,0);
  $('bestCropAllocationCard').textContent = allocation.rows.length ? `${currentLang==='ar'?allocation.rows[0].crop.arabic:allocation.rows[0].crop.crop} — ${displayGov(allocation.rows[0].gov)}` : '-';
  $('cropAllocationRows').innerHTML = allocation.rows.map(x=>`
    <tr>
      <td><strong>${x.rank}</strong></td>
      <td><strong>${displayGov(x.gov)}</strong></td>
      <td>${displayCrop(x.crop)}</td>
      <td><span class="badge ${x.score>=75?'good-badge':x.score>=55?'warn-badge':'danger-badge'}">${scoreClass(x.score)}</span></td>
      <td><strong>${fmt(x.score,1)}/100</strong></td>
      <td>${fmt(x.result.totalWF,1)}</td>
      <td>${fmt(x.result.gir,1)} mm</td>
      <td><strong>${fmt(x.allocatedArea,0)}</strong> ${T('فدان','feddan')}</td>
      <td>${fmt(x.waterNeeded,0)} m³</td>
      <td>${fmt(x.production,1)} ${T('طن','ton')}</td>
      <td>${x.reason}</td>
    </tr>`).join('') || `<tr><td colspan="11">${T('لا توجد تركيبات تحقق الحد الأدنى للملاءمة أو قيود المياه/المساحة الحالية.','No combinations meet the minimum suitability or current water/area constraints.')}</td></tr>`;
  $('cropUnsuitableRows').innerHTML = allocation.unsuitable.map(x=>`
    <tr>
      <td>${displayCrop(x.crop)}</td>
      <td>${displayGov(x.gov)}</td>
      <td><span class="badge ${x.score>=55?'warn-badge':'danger-badge'}">${fmt(x.score,1)}/100</span></td>
      <td>${fmt(x.result.totalWF,1)}</td>
      <td>${x.arable<=0?T('لا توجد مساحة منشورة','No published area'):x.score<allocation.minScore?T('أقل من حد الملاءمة المحدد','Below the set suitability threshold'):T('بيانات غير كافية أو بصمة غير صالحة','Insufficient data or invalid footprint')}</td>
    </tr>`).join('') || `<tr><td colspan="5">${T('لا توجد تركيبات مستبعدة ضمن أعلى النتائج.','No excluded combinations among the top results.')}</td></tr>`;
  window.latestCropAllocation = allocation.rows.map(x=>({rank:x.rank, governorate:x.gov.governorate, governorateArabic:x.gov.arabic, crop:x.crop.crop, cropArabic:x.crop.arabic, suitability:x.score, totalWF:x.result.totalWF, GIR_mm:x.result.gir, allocatedFeddan:x.allocatedArea, waterNeeded_m3:x.waterNeeded, production_ton:x.production, reason:x.reason}));
  return window.latestCropAllocation;
}

function exportCropAllocationCSV(){
  const rows = renderCropAreaAllocation();
  downloadCSV(rows || [], 'multi_crop_area_allocation.csv');
}

function classifyTotalWF(value){
  if(value < 800) return {text: currentLang === 'ar' ? 'منخفضة' : 'Low', cls:'good-badge'};
  if(value < 1500) return {text: currentLang === 'ar' ? 'متوسطة' : 'Moderate', cls:'good-badge'};
  if(value < 2500) return {text: currentLang === 'ar' ? 'مرتفعة' : 'High', cls:'warn-badge'};
  return {text: currentLang === 'ar' ? 'مرتفعة جدًا' : 'Very high', cls:'danger-badge'};
}
function classifySaving(value){
  if(value >= 35) return {text: currentLang === 'ar' ? 'توفير مرتفع' : 'High saving', cls:'good-badge'};
  if(value >= 15) return {text: currentLang === 'ar' ? 'توفير متوسط' : 'Moderate saving', cls:'warn-badge'};
  return {text: currentLang === 'ar' ? 'توفير محدود' : 'Limited saving', cls:'danger-badge'};
}
function methodLabel(m){ return currentLang === 'ar' ? (m.arabic || m.name) : m.name; }
function buildIrrigationComparison(base){
  const flood = compute({...base, ea:0.50});
  latestIrrigationComparison = methods.filter(m => !m.name.startsWith('Manual')).map(m => {
    const r = compute({...base, ea:m.ea});
    return {method:methodLabel(m), ea:m.ea, greenWF:r.greenWF, netBlueWF:r.netBlueWF, grossBlueWF:r.blueWF, greyWF:r.greyWF, totalWF:r.totalWF, gir:r.gir, grossIrrigationVolume:r.grossIrrigationVolume, waterSaving:flood.gir > 0 ? (flood.gir - r.gir) / flood.gir * 100 : 0};
  });
  return latestIrrigationComparison;
}

function selectedGov(){
  const countryScope = localStorage.getItem('countryCalculationScope') === 'country_manual';
  const countryName = localStorage.getItem('selectedCountryName') || 'Egypt';
  const countryData = (window.countriesData80 || []).find(c => c.country === countryName);
  if(countryScope && countryData){
    return {
      governorate: countryData.country,
      arabic: countryData.country,
      region: countryData.continent,
      arableTotalFeddan: Number($('areaInput')?.value) || 0,
      et0: 0,
      annualETo: 0,
      rain: 0,
      peffFraction: 1,
      alpha: 0.10,
      peakMonth: '-',
      note: 'Country-level manual mode: all climate, crop, irrigation, productivity and environmental inputs must be entered manually by the user.',
      arableSource: 'Manual user input'
    };
  }
  return governorates.find(g => g.governorate === $('govSelect').value) || governorates[0];
}
function updateProductOptions(preferredValue){
  const el = $('productSelect');
  if(!el) return;
  const crop = crops.find(c => c.crop === $('cropSelect')?.value) || crops[0];
  const products = crop.products && crop.products.length ? crop.products : [{name:crop.mainProduct || crop.arabic, unit:crop.yieldUnit || 'طن/فدان', yield:crop.yield, yieldFeddan:crop.yieldFeddan, kind:'main'}];
  el.innerHTML = products.map((p,i) => {
    const nativeYield = p.yieldNative !== undefined ? p.yieldNative : p.yieldFeddan;
    const label = `${enC(p.name)} — ${nativeYield ? fmt(nativeYield,2) + ' ' : ''}${enC(p.nativeUnit || p.unit || 'طن/فدان')}${p.kind === 'secondary' ? T(' / منتج ثانوي',' / secondary product') : p.kind === 'processed' ? T(' / منتج تصنيعي',' / processed product') : ''}`;
    return `<option value="${i}">${label}</option>`;
  }).join('');
  if(preferredValue !== undefined && preferredValue !== null && products[Number(preferredValue)]) el.value = preferredValue;
  else el.value = '0';
}
function selectedProduct(crop = selectedCrop()){
  const idx = Number($('productSelect')?.value || 0);
  const products = crop.products && crop.products.length ? crop.products : [{name:crop.mainProduct || crop.arabic, unit:crop.yieldUnit || 'طن/فدان', yield:crop.yield, yieldFeddan:crop.yieldFeddan, kind:'main'}];
  return products[idx] || products[0];
}
function selectedCrop(){return crops.find(c => c.crop === $('cropSelect').value) || crops[0];}

function getInput(){
  const g = selectedGov(), crop = selectedCrop(), product = selectedProduct(crop);
  const mode = $('dataMode')?.value || 'automatic';
  const isManual = mode === 'manual';
  const fieldValue = (id, fallback) => {
    const el = $(id);
    if(!el) return fallback;
    const v = Number(el.value);
    // Automatic mode always reads from the internal database.
    // Manual mode uses the value visible in the user field; empty fields fall back only to prevent calculation failure.
    return isManual && Number.isFinite(v) && el.value !== '' ? v : fallback;
  };
  const yieldFallback = Number(product.yield) || Number(crop.yield) || 1;
  return {
    dataMode: mode,
    dataSourceType: $('dataSourceType')?.value || 'database',
    dataReferenceNote: $('dataReferenceNote')?.value || '',
    cropName: crop.crop,
    cropArabic: crop.arabic,
    cropGroup: crop.group,
    productName: product.name || crop.mainProduct || crop.arabic,
    productUnit: product.unit || crop.yieldUnit || 'طن/فدان',
    productKind: product.kind || 'main',
    productYieldFeddan: product.yieldFeddan || crop.yieldFeddan || (yieldFallback*0.42),
    productYieldNative: product.yieldNative !== undefined ? product.yieldNative : (product.yieldFeddan || crop.yieldFeddan || (yieldFallback*0.42)),
    productNativeUnit: product.nativeUnit || product.unit || crop.yieldUnit || 'طن/فدان',
    productCalcNote: product.calcNote || '',
    days:fieldValue('daysInput', crop.days),
    et0:fieldValue('et0Input', g.et0),
    kc:fieldValue('kcInput', crop.kc),
    rain:fieldValue('rainInput', g.rain),
    annualETo:fieldValue('annualEToInput', g.annualETo),
    peffFraction:g.peffFraction,
    peffMode:$('peffMode').value,
    manualPeff:Number($('manualPeff').value) || 0,
    manualETc: isManual ? (Number($('manualETc')?.value) || 0) : 0,
    manualETBlue: isManual ? (Number($('manualETBlue')?.value) || 0) : 0,
    manualAppliedWater: isManual ? (Number($('manualAppliedWater')?.value) || 0) : 0,
    manualProduction: isManual ? (Number($('manualProduction')?.value) || 0) : 0,
    rainScenario:Number($('rainScenario')?.value) || 1,
    ea:Number($('eaInput').value) || 0.75,
    areaFeddan:Number($('areaInput')?.value) || 0,
    demandTargetType:$('demandTargetType')?.value || 'production',
    targetProductionDemand:Number($('targetProductionDemand')?.value) || 0,
    availableWaterDemand:Number($('availableWaterDemand')?.value) || 0,
    planningSafetyMargin:Number($('planningSafetyMargin')?.value) || 0,
    yield:fieldValue('customYieldInput', yieldFallback),
    ar:fieldValue('nitrogenInput', crop.ar),
    alpha:g.alpha,
    cmax:fieldValue('cmaxInput', crop.cmax),
    cnat:fieldValue('cnatInput', crop.cnat)
  };
}

function calculateDataQuality(base){
  const modeScore = {automatic:82, manual:88}[base.dataMode] || 82;
  const sourceBonus = {field:15, published:12, database:5, estimated:-8, assumption:-15}[base.dataSourceType] || 0;
  let completeness = 0;
  ['et0','kc','days','yield','ea','rain','ar','cmax','cnat'].forEach(k => { if(Number.isFinite(Number(base[k])) && Number(base[k]) > 0) completeness += 3; });
  if(base.manualETc > 0 || (base.et0 > 0 && base.kc > 0 && base.days > 0)) completeness += 6;
  const score = Math.max(0, Math.min(100, modeScore + sourceBonus + completeness - 15));
  return score;
}

function validateInput(base, r){
  const w = [];
  if(base.kc < 0.2 || base.kc > 1.4) w.push(T('Kc خارج النطاق المعتاد؛ راجع قيمة معامل المحصول.','Kc is outside the usual range; review the crop coefficient value.'));
  if(base.ea <= 0 || base.ea > 1) w.push(T('Ea يجب أن تكون بين 0 و 1.','Ea must be between 0 and 1.'));
  if(base.yield <= 0) w.push(T('الإنتاجية يجب أن تكون أكبر من صفر لحساب البصمة المائية.','Yield must be greater than zero to compute the water footprint.'));
  if(base.cnat >= base.cmax) w.push(T('Cnat يجب أن تكون أقل من Cmax لحساب البصمة الرمادية.','Cnat must be lower than Cmax to compute the grey footprint.'));
  if(base.days < 20 || base.days > 365) w.push(T('مدة النمو غير معتادة؛ راجع عدد الأيام.','Unusual growing period; review the number of days.'));
  if(base.peffMode === 'Manual' && base.manualPeff > r.etc) w.push(T('Peff اليدوي أكبر من ETc؛ تم تقليله داخليًا إلى ETc.','Manual Peff exceeds ETc; it was internally capped at ETc.'));
  if(base.manualAppliedWater > 0) w.push(T('تم استخدام مياه الري التطبيقية المدخلة يدويًا بدل حساب GIR من ETblue/Ea.','Manually entered applied irrigation water was used instead of computing GIR from ETblue/Ea.'));
  if(base.manualETc > 0) w.push(T('تم استخدام ETc المباشر بدل ET0 × Kc × days.','Direct ETc was used instead of ET0 × Kc × days.'));
  if(base.manualETBlue > 0) w.push(T('تم استخدام ETblue المباشر بدل ETc - Peff.','Direct ETblue was used instead of ETc - Peff.'));
  return w;
}

function renderDataQuality(base, r){
  if(!$('dataQualityScore')) return;
  const q = calculateDataQuality(base);
  $('dataQualityScore').textContent = fmt(q,0);
  $('dataQualityBar').style.width = `${q}%`;
  const modeLabel = {automatic:T('وضع قاعدة البيانات التلقائي','Automatic database mode'), manual:T('وضع الإدخال اليدوي','Manual user-input mode')}[base.dataMode] || base.dataMode;
  $('dataModeChip').textContent = modeLabel;
  const warnings = validateInput(base, r);
  if(warnings.length){
    $('validationWarnings').classList.remove('hidden');
    $('validationWarnings').innerHTML = '<strong>'+T('تنبيهات التحقق','Validation warnings')+'</strong><br>' + warnings.map(x=>`• ${x}`).join('<br>');
  }else{
    $('validationWarnings').classList.add('hidden');
    $('validationWarnings').innerHTML = '';
  }
}


function updateCalculationModeUI(){
  const mode = $('dataMode')?.value || 'automatic';
  const isAuto = mode === 'automatic';
  const databaseLockedIds = ['rainInput','et0Input','annualEToInput','kcInput','yieldInput','customYieldInput','daysInput','nitrogenInput','cmaxInput','cnatInput'];
  databaseLockedIds.forEach(id => {
    const el = $(id);
    if(el){ el.readOnly = isAuto; el.style.background = isAuto ? '#f1f5f9' : '#fff'; el.title = isAuto ? 'Automatic mode: value comes from the embedded database' : 'Manual mode: edit this value and it will be used in calculations'; }
  });
  ['manualETc','manualETBlue','manualAppliedWater','manualProduction','dataReferenceNote'].forEach(id => {
    const el = $(id);
    if(el){ el.disabled = isAuto; el.style.background = isAuto ? '#f1f5f9' : '#fff'; }
  });
  if($('dataSourceType')){ $('dataSourceType').disabled = isAuto; $('dataSourceType').value = isAuto ? 'database' : $('dataSourceType').value; }
  if($('calculationModeNote')){
    const isCountryManual = localStorage.getItem('countryCalculationScope') === 'country_manual';
    $('calculationModeNote').innerHTML = isCountryManual
      ? T('🌍 <strong>Country manual mode:</strong> الحاسبة تعمل للدولة المختارة بنفس معادلات المحافظات المصرية، لكن كل قيم المناخ والمحصول والإنتاجية والري والحدود البيئية يجب إدخالها يدويًا.','🌍 <strong>Country manual mode:</strong> calculations run for the selected country using the same equations as the Egyptian-governorate calculator. All climate, crop, productivity, irrigation and environmental inputs must be entered manually from documented local, FAO/governmental or published-study data.')
      : isAuto
      ? T('✅ <strong>Automatic:</strong> الوضع المختار من الشريط العلوي. يتم استخدام بيانات المحافظة والمحصول والمنتج من قاعدة البيانات الداخلية، وتُحدّث القيم تلقائيًا.','✅ <strong>Automatic:</strong> mode selected from the top bar. Governorate, crop and product data are taken from the internal database and values update automatically.')
      : T('✍️ <strong>Manual:</strong> الوضع المختار من الشريط العلوي. يتم الحساب من القيم التي تدخلها أو تعدلها يدويًا، مع إمكانية إدخال ETc أو ETblue أو مياه الري التطبيقية مباشرة.','✍️ <strong>Manual:</strong> mode selected from the top bar. Calculations use the values you enter or edit manually, with the option to enter ETc, ETblue or applied irrigation water directly.');
  }
}

function syncCropDefaultInputs(){
  const crop = selectedCrop();
  updateProductOptions($('productSelect')?.value);
  const product = selectedProduct(crop);
  if($('customYieldInput')) $('customYieldInput').value = product.yield || crop.yield;
  if($('yieldInput')) $('yieldInput').value = product.yield || crop.yield;
  if($('nitrogenInput')) $('nitrogenInput').value = crop.ar;
  if($('cmaxInput')) $('cmaxInput').value = crop.cmax;
  if($('cnatInput')) $('cnatInput').value = crop.cnat;
}

function update(){
  const g = selectedGov(), crop = selectedCrop();
  const isCountryManualScope = localStorage.getItem('countryCalculationScope') === 'country_manual';
  if($('etoGovSelect') && !isCountryManualScope) { $('etoGovSelect').value = g.governorate; updateEToMonthlyPanel(); }
  const mode = $('dataMode')?.value || 'automatic';
  const isAutoMode = mode === 'automatic';
  if(isAutoMode || !$('rainInput').value){ $('rainInput').value = g.rain; }
  if(isAutoMode || !$('et0Input').value){ $('et0Input').value = g.et0; }
  if(isAutoMode || !$('annualEToInput').value){ $('annualEToInput').value = g.annualETo; }
  const product = selectedProduct(crop);
  if(isAutoMode || !$('kcInput').value){ $('kcInput').value = crop.kc; }
  if(isAutoMode || !$('yieldInput').value){ $('yieldInput').value = product.yield || crop.yield; }
  if(isAutoMode || !$('customYieldInput').value){ $('customYieldInput').value = product.yield || crop.yield; }
  if(isAutoMode || !$('daysInput').value){ $('daysInput').value = crop.days; }
  if($('govNote')) $('govNote').innerHTML = isCountryManualScope ? `<strong>Country manual mode: ${displayGov(g)}</strong><br>Region/continent: ${g.region}<br>All climate, crop, productivity, irrigation and pollution values are manual user inputs for the selected country.<br><span style="color:var(--muted)">Data source: ${g.arableSource || 'Manual user input'}.</span>` : `<strong>${displayGov(g)}</strong><br>${tr('noteRegion')}: ${g.region}<br>${tr('noteArable')}: <strong>${fmt(g.arableTotalFeddan,0)}</strong> ${tr('unitFeddan')}<br>${currentLang === 'ar' ? g.note : `${tr('notePeak')}: ${g.peakMonth}. ETo calibrated from the uploaded 10-year file; rainfall remains regionalized and editable.`}<br><span style="color:var(--muted)">${tr('arableSource')}: ${g.arableSource || '-'}.</span>`;
  $('manualPeffBox').classList.toggle('hidden', $('peffMode').value !== 'Manual');
  updateCalculationModeUI();
  if($('productInfoText')){
    $('productInfoText').innerHTML = currentLang === 'ar'
      ? `المحصول: <strong>${crop.arabic}</strong> — المنتج المحسوب: <strong>${product.name}</strong> (${product.unit || crop.yieldUnit}). متوسط قاعدة البيانات: <strong>${fmt(product.yieldNative !== undefined ? product.yieldNative : (product.yieldFeddan || crop.yieldFeddan),2)}</strong> ${product.nativeUnit || product.unit || crop.yieldUnit}، والقيمة المستخدمة في البصمة = <strong>${fmt(product.yield || crop.yield,2)}</strong> طن/هكتار.<br>منتجات إضافية: ${crop.additionalProducts || '-'}<br>المحافظات الأنسب: ${crop.bestGovernorates || '-'}<br>نوع البيانات: ${crop.dataType || '-'} — المصدر: ${crop.source || '-'}`
      : `Crop: <strong>${crop.crop}</strong> — product basis: <strong>${enC(product.name)}</strong> (${enC(product.unit || crop.yieldUnit)}). Database average: <strong>${fmt(product.yieldNative !== undefined ? product.yieldNative : (product.yieldFeddan || crop.yieldFeddan),2)}</strong> ${enC(product.nativeUnit || product.unit || crop.yieldUnit)}; calculation yield = <strong>${fmt(product.yield || crop.yield,2)}</strong> ton/ha.<br>Additional products: ${enC(crop.additionalProducts) || '-'}<br>Best governorates: ${crop.bestGovernorates || '-'}<br>Data type: ${enC(crop.dataType) || '-'} — source: ${crop.source || '-'}`;
  }

  const baseInputForRender = getInput();
  const r = compute(baseInputForRender);
  renderDataQuality(baseInputForRender, r);
  renderDemandPlanning(baseInputForRender, r);
  $('greenWF').textContent = fmt(r.greenWF);
  $('netBlueWF').textContent = fmt(r.netBlueWF);
  $('blueWF').textContent = fmt(r.blueWF);
  $('greyWF').textContent = fmt(r.greyWF);
  $('totalWF').textContent = fmt(r.totalWF);
  $('waterSaving').textContent = fmt(r.waterSaving,1);

  const rows = [
    ['Crop / product basis', `${currentLang==='ar'?(baseInputForRender.cropArabic || crop.arabic):crop.crop} — ${enC(baseInputForRender.productName || product.name)} (${enC(baseInputForRender.productUnit || product.unit || crop.yieldUnit)})`],
    ['Database yield', `${fmt(baseInputForRender.productYieldNative || product.yieldNative || product.yieldFeddan || crop.yieldFeddan,2)} ${enC(baseInputForRender.productNativeUnit || product.nativeUnit || product.unit || crop.yieldUnit)}; calculation = ${fmt(baseInputForRender.yield,2)} ton/ha`],
    ['Data source', `${enC(crop.dataType) || '-'} — ${crop.source || '-'}`],
    ['ETc seasonal', `${fmt(r.etc)} mm`],
    ['Effective rainfall Peff', `${fmt(r.peff)} mm`],
    ['ETgreen', `${fmt(r.etGreen)} mm`],
    ['ETblue', `${fmt(r.etBlue)} mm`],
    ['CWUgreen', `${fmt(r.cwuGreen)} m³/ha`],
    ['CWUblue net', `${fmt(r.cwuBlueNet)} m³/ha`],
    ['CWUblue gross (affected by Ea)', `${fmt(r.cwuBlue)} m³/ha`],
    ['NIR', `${fmt(r.nir)} mm`],
    ['GIR', `${fmt(r.gir)} mm`],
    ['GIR volume', `${fmt(r.girVol)} m³/ha`],
    ['Water saving vs flood', `${fmt(r.waterSaving,1)}%`],
    ['Effective yield used', `${fmt(r.effectiveYield || baseInput.yield,2)} ton/ha`],
    ['Estimated production', `${fmt(r.productionTon,1)} ton`],
    ['Gross irrigation volume for selected area', `${fmt(r.grossIrrigationVolume,0)} m³`]
  ];
  $('calcRows').innerHTML = rows.map(([k,v]) => `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`).join('');

  const baseInput = baseInputForRender;
  renderDecision(r, baseInput);
  updateAdvancedAnalytics(r, baseInput);
  updatePie(r);
  updateComparison();
}

function renderDecision(r, base){
  const g = selectedGov(), crop = selectedCrop();
  const totalClass = classifyTotalWF(r.totalWF);
  const savingClass = classifySaving(r.waterSaving);
  const method = methods.find(m => m.name === $('methodSelect').value) || methods[0];
  $('classificationBox').innerHTML = `
    <span class="badge ${totalClass.cls}">${currentLang === 'ar' ? 'تصنيف البصمة' : 'WF class'}: ${totalClass.text}</span>
    <span class="badge ${savingClass.cls}">${savingClass.text}: ${fmt(r.waterSaving,1)}%</span>
    <span class="badge">Ea = ${fmt(base.ea,2)}</span>
    <span class="badge good-badge">Suitability = ${fmt(calculateSuitabilityFor(g, base).score,0)}/100</span>`;
  $('farmScaleBox').innerHTML = `
    ${currentLang === 'ar' ? 'المساحة' : 'Area'}: <strong>${fmt(base.areaFeddan,1)}</strong> ${tr('unitFeddan')}<br>
    ${currentLang === 'ar' ? 'أساس المنتج' : 'Product basis'}: <strong>${enC(base.productName || crop.mainProduct || '-')}</strong><br>
    ${currentLang === 'ar' ? 'الإنتاج المتوقع للمنتج المختار' : 'Estimated selected-product production'}: <strong>${fmt(r.productionTon,1)}</strong> ton<br>
    ${currentLang === 'ar' ? 'مياه الري الإجمالية' : 'Gross irrigation water'}: <strong>${fmt(r.grossIrrigationVolume,0)}</strong> m³<br>
    ${currentLang === 'ar' ? 'مياه الري الصافية' : 'Net irrigation water'}: <strong>${fmt(r.netIrrigationVolume,0)}</strong> m³`;
  const bestMethod = buildIrrigationComparison(base).sort((a,b)=>a.totalWF-b.totalWF)[0];
  const betterText = bestMethod ? `${bestMethod.method} (${fmt(bestMethod.totalWF,1)} m³/ton)` : '-';
  $('recommendationBox').innerHTML = currentLang === 'ar'
    ? `للمحصول <strong>${crop.arabic}</strong>، وبناءً على المنتج <strong>${base.productName || crop.mainProduct}</strong> في <strong>${g.arabic}</strong>، أقل بصمة مائية بين طرق الري الحالية تتحقق مع: <strong>${betterText}</strong>. الطريقة المختارة حاليًا: <strong>${methodLabel(method)}</strong>.`
    : `For <strong>${crop.crop}</strong>, using product basis <strong>${enC(base.productName || crop.mainProduct)}</strong> in <strong>${g.governorate}</strong>, the lowest current irrigation-method WF is: <strong>${betterText}</strong>. Current selected method: <strong>${methodLabel(method)}</strong>.`;
  $('decisionSummary').innerHTML = currentLang === 'ar'
    ? `الأداة تعرض الآن البصمة الزرقاء الصافية والبصمة الزرقاء المعدلة بكفاءة الري، لذلك تغيير طريقة الري يغيّر إجمالي البصمة المائية وكمية المياه المطلوبة فعليًا.`
    : `The tool now displays both net blue WF and irrigation-efficiency-adjusted blue WF, so changing the irrigation method changes total WF and applied irrigation water.`;
  $('irrigationRows').innerHTML = latestIrrigationComparison.map(x => `
    <tr>
      <td><strong>${x.method}</strong></td>
      <td>${fmt(x.ea,2)}</td>
      <td>${fmt(x.grossBlueWF)}</td>
      <td><strong>${fmt(x.totalWF)}</strong></td>
      <td>${fmt(x.gir)} mm</td>
      <td>${fmt(x.waterSaving,1)}%</td>
    </tr>`).join('');
}

function updatePie(r){
  const data = [r.greenWF, r.blueWF, r.greyWF];
  if(pieChart){
    pieChart.data.labels = [tr('greenWF'),tr('grossBlueWF'),tr('greyWF')];
    pieChart.data.datasets[0].data = data;
    pieChart.update();
  }else{
    pieChart = new Chart($('pieChart'), {
      type:'doughnut',
      data:{labels:[tr('greenWF'),tr('grossBlueWF'),tr('greyWF')], datasets:[{data}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }
}

function updateOptimalDistribution(){
  const targetArea = Math.max(0, Number($('targetAreaInput')?.value) || 0);
  const requestedTopN = Math.max(1, Math.min(governorates.length, Math.round(Number($('topNGovInput')?.value) || 3)));
  const ranked = latestComparison
    .filter(r => Number.isFinite(r.totalWF) && r.totalWF > 0)
    .sort((a,b) => a.totalWF - b.totalWF)
    .slice(0, requestedTopN);

  const bestWF = ranked.length ? ranked[0].totalWF : 0;
  const capacitySum = ranked.reduce((s,r) => s + (Number(r.arableTotalFeddan) || 0), 0);
  const allocatableTarget = Math.min(targetArea, capacitySum);
  const uncoveredArea = Math.max(0, targetArea - capacitySum);

  latestOptimal = ranked.map((r,i) => {
    const capacity = Number(r.arableTotalFeddan) || 0;
    const capacityShare = capacitySum > 0 ? capacity / capacitySum * 100 : 0;
    const allocatedArea = capacitySum > 0 ? allocatableTarget * capacity / capacitySum : 0;
    return {
      ...r,
      rank:i+1,
      waterProductivityIndex:bestWF / r.totalWF * 100,
      capacityShare,
      distribution:targetArea > 0 ? allocatedArea / targetArea * 100 : 0,
      allocatedArea,
      targetArea,
      selectedCapacity:capacitySum,
      uncoveredArea,
      arableStatus: capacity > 0 ? tr('available') : tr('noPublished')
    };
  });

  if(latestOptimal.length){
    $('bestGov').textContent = displayGov(latestOptimal[0]);
    $('bestShare').textContent = fmt(latestOptimal[0].allocatedArea,0);
    $('bestWF').textContent = fmt(capacitySum,0);
    $('suggestedCount').textContent = fmt(uncoveredArea,0);
  }else{
    $('bestGov').textContent = '-';
    $('bestShare').textContent = '-';
    $('bestWF').textContent = '-';
    $('suggestedCount').textContent = '-';
  }

  $('optimalRows').innerHTML = latestOptimal.map(r => `
    <tr>
      <td><strong>${r.rank}</strong></td>
      <td><strong>${displayGov(r)}</strong></td>
      <td>${r.region}</td>
      <td>${fmt(r.totalWF,1)}</td>
      <td>${fmt(r.waterProductivityIndex,1)}%</td>
      <td><strong>${fmt(r.arableTotalFeddan,0)}</strong><br><span style="color:var(--muted);font-size:12px">${r.arableSource || ''}</span></td>
      <td>${fmt(r.capacityShare,1)}%</td>
      <td><strong>${fmt(r.allocatedArea,0)}</strong> ${tr('unitFeddan')}</td>
      <td><strong>${fmt(r.distribution,1)}%</strong></td>
      <td style="min-width:180px"><div class="progress"><span style="width:${Math.max(3,r.distribution)}%"></span></div></td>
    </tr>
  `).join('');
}

function scoreColor(score){
  if(score >= 75) return '#16a34a';
  if(score >= 55) return '#f59e0b';
  return '#dc2626';
}
function scoreClass(score){
  if(score >= 75) return currentLang === 'ar' ? 'ملاءمة مرتفعة' : 'Highly suitable';
  if(score >= 55) return currentLang === 'ar' ? 'ملاءمة متوسطة' : 'Moderately suitable';
  return currentLang === 'ar' ? 'ملاءمة منخفضة' : 'Low suitability';
}
function normalizeScore(value, best, worst, reverse=true){
  if(!Number.isFinite(value) || best === worst) return 50;
  let s = reverse ? (worst - value) / (worst - best) * 100 : (value - worst) / (best - worst) * 100;
  return Math.max(0, Math.min(100, s));
}
function getMCDAWeights(){
  const raw = {
    wf: Number($('wWF')?.value) || 35,
    gir: Number($('wGIR')?.value) || 25,
    ea: Number($('wEA')?.value) || 20,
    area: Number($('wAREA')?.value) || 10,
    grey: Number($('wGREY')?.value) || 10
  };
  const sum = Object.values(raw).reduce((a,b)=>a+Math.max(0,b),0) || 1;
  if($('mcdaWeightNote')) $('mcdaWeightNote').textContent = `${currentLang==='ar'?'مجموع الأوزان الخام':'Raw weight sum'} = ${fmt(sum,0)} | ${currentLang==='ar'?'بعد التطبيع':'Normalized'} = 100%`;
  return Object.fromEntries(Object.entries(raw).map(([k,v]) => [k, Math.max(0,v)/sum]));
}

function calculateSuitabilityFor(gov, baseInput){
  const all = governorates.map(g => ({g, r:compute({...baseInput, et0:g.et0, rain:g.rain, peffFraction:g.peffFraction, alpha:g.alpha})}));
  const totals = all.map(x=>x.r.totalWF).filter(Number.isFinite);
  const girs = all.map(x=>x.r.gir).filter(Number.isFinite);
  const grey = all.map(x=>x.r.greyWF).filter(Number.isFinite);
  const areas = governorates.map(g=>Number(g.arableTotalFeddan)||0);
  const current = all.find(x=>x.g.governorate === gov.governorate) || all[0];
  const wfScore = normalizeScore(current.r.totalWF, Math.min(...totals), Math.max(...totals), true);
  const girScore = normalizeScore(current.r.gir, Math.min(...girs), Math.max(...girs), true);
  const greyScore = normalizeScore(current.r.greyWF, Math.min(...grey), Math.max(...grey), true);
  const areaScore = normalizeScore(Number(gov.arableTotalFeddan)||0, Math.max(...areas), Math.min(...areas), false);
  const irrigationScore = Math.max(0, Math.min(100, ((baseInput.ea || 0.5) - 0.5) / (0.9 - 0.5) * 100));
  const w = getMCDAWeights();
  const components = [
    {name: currentLang === 'ar' ? 'إجمالي البصمة المائية' : 'Total water footprint', score:wfScore, weight:w.wf},
    {name: currentLang === 'ar' ? 'احتياجات الري الإجمالية' : 'Gross irrigation requirement', score:girScore, weight:w.gir},
    {name: currentLang === 'ar' ? 'كفاءة طريقة الري' : 'Irrigation efficiency', score:irrigationScore, weight:w.ea},
    {name: currentLang === 'ar' ? 'المساحة القابلة للزراعة' : 'Arable land availability', score:areaScore, weight:w.area},
    {name: currentLang === 'ar' ? 'البصمة الرمادية' : 'Grey water footprint', score:greyScore, weight:w.grey}
  ];
  const score = components.reduce((sum,c)=>sum + c.score*c.weight,0);
  return {score, components, result:current.r};
}
function renderSuitability(base){
  if(!$('suitabilityScoreValue')) return;
  const g = selectedGov(), crop = selectedCrop();
  const s = calculateSuitabilityFor(g, base);
  $('suitabilityScoreValue').textContent = fmt(s.score,0);
  $('suitabilityRing').style.setProperty('--score', `${Math.max(0,Math.min(100,s.score))}%`);
  $('suitabilityDetails').innerHTML = `${currentLang === 'ar' ? 'المحصول' : 'Crop'}: <strong>${displayCrop(crop)}</strong><br>${currentLang === 'ar' ? 'المحافظة' : 'Governorate'}: <strong>${displayGov(g)}</strong><br>${currentLang === 'ar' ? 'التصنيف' : 'Class'}: <span class="badge ${s.score>=75?'good-badge':s.score>=55?'warn-badge':'danger-badge'}">${scoreClass(s.score)}</span>`;
  $('suitabilityRows').innerHTML = s.components.map(c => `<tr><td><strong>${c.name}</strong></td><td>${fmt(c.score,1)}</td><td>${fmt(c.weight*100,0)}%</td><td>${fmt(c.score*c.weight,1)}</td></tr>`).join('');
  return s;
}
function renderSuitabilityMap(base){
  if(!$('egyptSuitabilityMap')) return;
  const svg = $('egyptSuitabilityMap');
  const validLons = governorates.map(g=>g.lon).filter(Number.isFinite), validLats = governorates.map(g=>g.lat).filter(Number.isFinite);
  const minLon = Math.min(...validLons), maxLon = Math.max(...validLons), minLat = Math.min(...validLats), maxLat = Math.max(...validLats);
  const xOf = lon => 70 + (lon - minLon) / (maxLon - minLon) * 580;
  const yOf = lat => 430 - (lat - minLat) / (maxLat - minLat) * 360;
  const points = governorates.map(g => {
    const sc = calculateSuitabilityFor(g, base).score;
    const selected = g.governorate === selectedGov().governorate;
    const label = currentLang === 'ar' ? g.arabic : g.governorate;
    return `<g tabindex="0" role="button" aria-label="${label}" onclick="document.getElementById('govSelect').value='${g.governorate}'; update();"><circle class="map-point" cx="${xOf(g.lon).toFixed(1)}" cy="${yOf(g.lat).toFixed(1)}" r="${selected?9:6}" fill="${scoreColor(sc)}" ${selected?'stroke-width="3"':''}><title>${label}: ${fmt(sc,0)}/100</title></circle><text class="map-label" x="${(xOf(g.lon)+8).toFixed(1)}" y="${(yOf(g.lat)+4).toFixed(1)}">${label}</text></g>`;
  }).join('');
  svg.innerHTML = `<rect x="20" y="20" width="680" height="460" rx="28" fill="rgba(255,255,255,.65)" stroke="#cbd5e1"/><path d="M430 42 C510 120 545 235 510 340 C480 430 390 470 305 438 C220 405 160 325 170 230 C180 125 275 50 430 42 Z" fill="rgba(204,251,241,.55)" stroke="#94a3b8" stroke-width="2"/><text x="38" y="48" font-size="13" font-weight="900" fill="#334155">Suitability map - schematic by governorate coordinates</text>${points}`;
  $('mapLegend').innerHTML = `<span class="badge good-badge">≥75 ${currentLang==='ar'?'مرتفع':'High'}</span><span class="badge warn-badge">55–74 ${currentLang==='ar'?'متوسط':'Moderate'}</span><span class="badge danger-badge">&lt;55 ${currentLang==='ar'?'منخفض':'Low'}</span>`;
}
function buildClimateScenarios(base, currentResult){
  return [
    {name:currentLang==='ar'?'الوضع الحالي':'Current', eto:1, rain:1},
    {name:currentLang==='ar'?'سنة جافة - أمطار أقل 25%':'Dry year: rainfall -25%', eto:1, rain:0.75},
    {name:currentLang==='ar'?'سنة رطبة + أمطار 25%':'Wet year: rainfall +25%', eto:1, rain:1.25},
    {name:currentLang==='ar'?'حرارة أعلى: ETo +10%':'Hot year: ETo +10%', eto:1.10, rain:1},
    {name:currentLang==='ar'?'تغير مناخي متوسط: ETo +20% وأمطار -10%':'Climate stress: ETo +20%, rain -10%', eto:1.20, rain:0.90},
    {name:currentLang==='ar'?'سيناريو متفائل: ETo -5% وأمطار +10%':'Favorable: ETo -5%, rain +10%', eto:0.95, rain:1.10}
  ].map(sc => {
    const r = compute({...base, et0:base.et0*sc.eto, rain:base.rain*sc.rain, rainScenario:1});
    return {...sc, totalWF:r.totalWF, gir:r.gir, change: currentResult.totalWF ? (r.totalWF-currentResult.totalWF)/currentResult.totalWF*100 : 0};
  });
}
function renderScenarioAnalysis(base, r){
  if(!$('scenarioRows')) return;
  const rows = buildClimateScenarios(base, r);
  $('scenarioRows').innerHTML = rows.map(x => `<tr><td><strong>${x.name}</strong></td><td>${fmt((x.eto-1)*100,0)}%</td><td>${fmt((x.rain-1)*100,0)}%</td><td><strong>${fmt(x.totalWF,1)}</strong></td><td>${fmt(x.gir,1)} mm</td><td>${fmt(x.change,1)}%</td></tr>`).join('');
  return rows;
}
function buildSensitivity(base, r){
  const tests = [
    {name:'ETo', key:'et0', note:'direct'},
    {name:'Kc', key:'kc', note:'direct'},
    {name:'Yield', key:'yield', note:'inverse'},
    {name:'Ea', key:'ea', note:'direct'},
    {name:'Effective rainfall', custom:'rain', note:'direct'},
    {name:'N fertilizer / AR', key:'ar', note:'grey'}
  ];
  return tests.map(t => {
    const lowBase = {...base}, highBase = {...base};
    if(t.key){ lowBase[t.key] = base[t.key]*0.90; highBase[t.key] = base[t.key]*1.10; }
    if(t.custom === 'rain'){ lowBase.rain = base.rain*0.90; highBase.rain = base.rain*1.10; }
    const low = compute(lowBase).totalWF;
    const high = compute(highBase).totalWF;
    const lowChange = r.totalWF ? (low-r.totalWF)/r.totalWF*100 : 0;
    const highChange = r.totalWF ? (high-r.totalWF)/r.totalWF*100 : 0;
    const impact = Math.abs(high-low) / (r.totalWF || 1) * 100;
    return {parameter:t.name, low, high, lowChange, highChange, impact, sensitivity: impact>=15?'High':impact>=5?'Medium':'Low'};
  }).sort((a,b)=>b.impact-a.impact);
}
function renderSensitivity(base, r){
  if(!$('sensitivityRows')) return;
  const rows = buildSensitivity(base, r);
  $('sensitivityRows').innerHTML = rows.map(x => `<tr><td><strong>${x.parameter}</strong></td><td>${fmt(x.low,1)} (${fmt(x.lowChange,1)}%)</td><td>${fmt(x.high,1)} (${fmt(x.highChange,1)}%)</td><td>${fmt(x.impact,1)}%</td><td>${x.sensitivity}</td></tr>`).join('');
  const labels = rows.map(x=>x.parameter), values = rows.map(x=>x.impact);
  if($('sensitivityChart')){
    if(sensitivityChart){ sensitivityChart.data.labels = labels; sensitivityChart.data.datasets[0].data = values; sensitivityChart.update(); }
    else { sensitivityChart = new Chart($('sensitivityChart'), {type:'bar', data:{labels, datasets:[{label:'Impact range (%)', data:values}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{ticks:{maxRotation:35,minRotation:20}}}}}); }
  }
  return rows;
}
function renderScientificReportPreview(base, r, suitability){
  if(!$('scientificReportPreview')) return;
  const g = selectedGov(), crop = selectedCrop();
  $('scientificReportPreview').innerHTML = `
    <h2 style="margin-top:0">Water Footprint Decision Tool — Scientific Report</h2>
    <p><strong>${currentLang==='ar'?'المحافظة':'Governorate'}:</strong> ${displayGov(g)} | <strong>${currentLang==='ar'?'المحصول':'Crop'}:</strong> ${displayCrop(crop)} | <strong>${currentLang==='ar'?'طريقة الري':'Irrigation'}:</strong> ${methodLabel(methods.find(m=>m.name===$('methodSelect').value)||methods[0])}</p>
    <p><strong>Key results:</strong> Green WF = ${fmt(r.greenWF,1)} m³/ton; Net Blue WF = ${fmt(r.netBlueWF,1)} m³/ton; Gross Blue WF = ${fmt(r.blueWF,1)} m³/ton; Grey WF = ${fmt(r.greyWF,1)} m³/ton; Total applied WF = ${fmt(r.totalWF,1)} m³/ton.</p>
    <p><strong>Suitability Score:</strong> ${fmt(suitability.score,0)}/100 (${scoreClass(suitability.score)}). <strong>Water saving vs flood:</strong> ${fmt(r.waterSaving,1)}%.</p>
    <p><strong>Data mode:</strong> ${base.dataMode || 'automatic'} | <strong>Data source:</strong> ${base.dataSourceType || 'database'} | <strong>Data Quality Score:</strong> ${fmt(calculateDataQuality(base),0)}/100.</p>
    <p><strong>Methodological note:</strong> Total applied water footprint is an additional field-application indicator using irrigation-efficiency-adjusted gross blue water: Gross Blue WF = (ETblue / Ea × 10) / Yield. It does not replace the standard WFN component definition. The score combines water footprint, irrigation requirement, irrigation efficiency, arable land availability, and grey water footprint.</p>`;
}
function openScientificReport(){
  const base = getInput();
  const r = compute(base);
  const suitability = calculateSuitabilityFor(selectedGov(), base);
  const scenarios = buildClimateScenarios(base, r);
  const sensitivity = buildSensitivity(base, r);
  const g = selectedGov(), crop = selectedCrop();
  const rows = (arr, cols) => arr.map(x=>`<tr>${cols.map(c=>`<td>${x[c] ?? ''}</td>`).join('')}</tr>`).join('');
  const reportHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Scientific Report</title><style>body{font-family:Arial,Tahoma,sans-serif;line-height:1.65;padding:28px;color:#0f172a}h1,h2{color:#0f766e}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#0f766e;color:white}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.box{border:1px solid #cbd5e1;border-radius:12px;padding:10px;background:#f8fafc}@media print{button{display:none}}</style></head><body>
  <button onclick="window.print()">Print / Save as PDF</button>
  <h1>Water Footprint Decision Tool</h1>
  <h2>Scientific Decision Report</h2>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp; <strong>Governorate:</strong> ${displayGov(g)} &nbsp; <strong>Crop:</strong> ${displayCrop(crop)} &nbsp; <strong>Irrigation:</strong> ${methodLabel(methods.find(m=>m.name===$('methodSelect').value)||methods[0])}</p>
  <div class="kpi"><div class="box"><strong>Total applied WF</strong><br>${fmt(r.totalWF,1)} m³/ton</div><div class="box"><strong>Gross Blue WF</strong><br>${fmt(r.blueWF,1)} m³/ton</div><div class="box"><strong>Water saving</strong><br>${fmt(r.waterSaving,1)}%</div><div class="box"><strong>Suitability</strong><br>${fmt(suitability.score,0)}/100</div></div>
  <h2>Input Data</h2><table><tr><th>Parameter</th><th>Value</th></tr><tr><td>Data mode</td><td>${base.dataMode || 'automatic'}</td></tr><tr><td>Data source</td><td>${base.dataSourceType || 'database'}</td></tr><tr><td>Reference / notes</td><td>${base.dataReferenceNote || '-'}</td></tr><tr><td>Data Quality Score</td><td>${fmt(calculateDataQuality(base),0)}/100</td></tr><tr><td>ETo</td><td>${fmt(base.et0,3)} mm/day</td></tr><tr><td>Kc</td><td>${fmt(base.kc,2)}</td></tr><tr><td>Yield</td><td>${fmt(base.yield,2)} ton/ha</td></tr><tr><td>Growing period</td><td>${fmt(base.days,0)} days</td></tr><tr><td>Ea</td><td>${fmt(base.ea,2)}</td></tr><tr><td>Area</td><td>${fmt(base.areaFeddan,1)} feddan</td></tr></table>
  <h2>Water Footprint Results</h2><table><tr><th>Indicator</th><th>Value</th></tr><tr><td>Green WF</td><td>${fmt(r.greenWF,1)} m³/ton</td></tr><tr><td>Net Blue WF</td><td>${fmt(r.netBlueWF,1)} m³/ton</td></tr><tr><td>Gross Blue WF</td><td>${fmt(r.blueWF,1)} m³/ton</td></tr><tr><td>Grey WF</td><td>${fmt(r.greyWF,1)} m³/ton</td></tr><tr><td>Total Applied WF</td><td>${fmt(r.totalWF,1)} m³/ton</td></tr><tr><td>GIR</td><td>${fmt(r.gir,1)} mm</td></tr></table>
  <h2>Suitability Score Components</h2><table><tr><th>Component</th><th>Score</th><th>Weight</th><th>Contribution</th></tr>${suitability.components.map(c=>`<tr><td>${c.name}</td><td>${fmt(c.score,1)}</td><td>${fmt(c.weight*100,0)}%</td><td>${fmt(c.score*c.weight,1)}</td></tr>`).join('')}</table>
  <h2>Climate Scenarios</h2><table><tr><th>Scenario</th><th>Total applied WF</th><th>GIR</th><th>Change</th></tr>${scenarios.map(x=>`<tr><td>${x.name}</td><td>${fmt(x.totalWF,1)}</td><td>${fmt(x.gir,1)} mm</td><td>${fmt(x.change,1)}%</td></tr>`).join('')}</table>
  <h2>Sensitivity Analysis</h2><table><tr><th>Parameter</th><th>-10%</th><th>+10%</th><th>Impact</th><th>Sensitivity</th></tr>${sensitivity.map(x=>`<tr><td>${x.parameter}</td><td>${fmt(x.low,1)}</td><td>${fmt(x.high,1)}</td><td>${fmt(x.impact,1)}%</td><td>${x.sensitivity}</td></tr>`).join('')}</table>
  <h2>Validation Warnings</h2><ul>${validateInput(base,r).map(x=>`<li>${x}</li>`).join('') || '<li>No critical validation warnings.</li>'}</ul><h2>Methodological Notes</h2><p>ETc = ETo × Kc × growing days. Green water use is limited by effective rainfall. Net Blue WF is based on crop blue water demand. Gross Blue WF adjusts blue water demand by irrigation efficiency: (ETblue / Ea × 10) / Yield. Grey WF uses the nitrogen leaching-load approach with alpha, AR, Cmax and Cnat.</p>
  </body></html>`;
  const w = window.open('', '_blank');
  if(!w){ alert('Please allow pop-ups to open the scientific report.'); return; }
  w.document.write(reportHtml); w.document.close();
}

function seededRandomFactory(seed){
  let s = seed || 123456789;
  return function(){ s = (1664525 * s + 1013904223) % 4294967296; return s / 4294967296; };
}
function percentile(sorted, p){
  if(!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi]-sorted[lo])*(idx-lo);
}
function runMonteCarlo(base){
  const n = Math.max(100, Math.min(3000, Number($('mcRuns')?.value)||500));
  const range = Math.max(0.01, Math.min(0.40, (Number($('mcRange')?.value)||10)/100));
  const rnd = seededRandomFactory(20260524);
  const values = [];
  for(let i=0;i<n;i++){
    const u = () => 1 + (rnd()*2-1)*range;
    const eaFactor = 1 + (rnd()*2-1)*(range*0.75);
    const simInput = {...base,
      et0: base.et0*u(),
      kc: base.kc*u(),
      yield: Math.max(0.01, base.yield*u()),
      ea: Math.max(0.30, Math.min(0.95, base.ea*eaFactor)),
      ar: Math.max(0, base.ar*u())
    };
    const res = compute(simInput);
    values.push({totalWF:res.totalWF, gir:res.gir, blueWF:res.blueWF, greyWF:res.greyWF});
  }
  const summarize = key => {
    const arr = values.map(v=>v[key]).sort((a,b)=>a-b);
    return {p5:percentile(arr,.05), p50:percentile(arr,.50), p95:percentile(arr,.95), range:percentile(arr,.95)-percentile(arr,.05)};
  };
  return {n, range:range*100, values, stats:{totalWF:summarize('totalWF'), gir:summarize('gir'), blueWF:summarize('blueWF'), greyWF:summarize('greyWF')}};
}
function renderMonteCarlo(base){
  if(!$('monteCarloRows')) return null;
  const mc = runMonteCarlo(base);
  const labels = ['Total applied WF','GIR','Gross Blue WF','Grey WF'];
  const keys = ['totalWF','gir','blueWF','greyWF'];
  $('monteCarloRows').innerHTML = keys.map((k,i)=>`<tr><td><strong>${labels[i]}</strong></td><td>${fmt(mc.stats[k].p5,1)}</td><td>${fmt(mc.stats[k].p50,1)}</td><td>${fmt(mc.stats[k].p95,1)}</td><td>${fmt(mc.stats[k].range,1)}</td></tr>`).join('');
  const data = keys.map(k=>mc.stats[k].range);
  if($('monteCarloChart')){
    if(monteCarloChart){ monteCarloChart.data.labels = labels; monteCarloChart.data.datasets[0].data = data; monteCarloChart.update(); }
    else { monteCarloChart = new Chart($('monteCarloChart'), {type:'bar', data:{labels, datasets:[{label:'P95-P5 uncertainty range', data}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}}}); }
  }
  return mc;
}
function renderCustomScenario(base, currentResult){
  if(!$('customScenarioBox')) return null;
  const etoPct = Number($('customEtoPct')?.value)||0;
  const rainPct = Number($('customRainPct')?.value)||0;
  const yieldPct = Number($('customYieldPct')?.value)||0;
  const eaPct = Number($('customEaPct')?.value)||0;
  const scInput = {...base,
    et0: base.et0*(1+etoPct/100),
    rain: base.rain*(1+rainPct/100),
    yield: Math.max(0.01, base.yield*(1+yieldPct/100)),
    ea: Math.max(0.30, Math.min(0.95, base.ea*(1+eaPct/100))),
    rainScenario:1
  };
  const rr = compute(scInput);
  const change = currentResult.totalWF ? (rr.totalWF-currentResult.totalWF)/currentResult.totalWF*100 : 0;
  $('customScenarioBox').innerHTML = `<strong>${currentLang==='ar'?'نتيجة السيناريو المخصص':'Custom scenario result'}</strong><br>
    Total applied WF = <strong>${fmt(rr.totalWF,1)}</strong> m³/ton (${fmt(change,1)}% vs current)<br>
    GIR = <strong>${fmt(rr.gir,1)}</strong> mm | Gross Blue WF = <strong>${fmt(rr.blueWF,1)}</strong> m³/ton<br>
    <span class="mono">ETo ${etoPct>=0?'+':''}${etoPct}%, Rain ${rainPct>=0?'+':''}${rainPct}%, Yield ${yieldPct>=0?'+':''}${yieldPct}%, Ea ${eaPct>=0?'+':''}${eaPct}%</span>`;
  return {input:scInput, result:rr, change};
}
function renderCropRanking(base){
  if(!$('cropRankingRows')) return [];
  const g = selectedGov();
  const ranked = crops.map(c=>{
    const input = {...base, days:c.days, kc:c.kc, yield:c.yield, ar:c.ar, cmax:c.cmax, cnat:c.cnat};
    const r = compute(input);
    const s = calculateSuitabilityFor(g, input).score;
    return {crop:c.crop, arabic:c.arabic, totalWF:r.totalWF, gir:r.gir, score:s};
  }).sort((a,b)=>b.score-a.score);
  $('cropRankingRows').innerHTML = ranked.slice(0,12).map((x,i)=>`<tr><td><strong>${i+1}</strong></td><td>${currentLang==='ar'?(x.arabic||x.crop):(x.crop||x.arabic)}</td><td>${fmt(x.totalWF,1)}</td><td>${fmt(x.gir,1)} mm</td><td><strong>${fmt(x.score,0)}/100</strong></td><td><span class="badge ${x.score>=75?'good-badge':x.score>=55?'warn-badge':'danger-badge'}">${scoreClass(x.score)}</span></td></tr>`).join('');
  return ranked;
}
function renderGovernorateRanking(base){
  if(!$('govRankingRows')) return [];
  const ranked = governorates.map(g=>{
    const input = {...base, et0:g.et0, rain:g.rain, peffFraction:g.peffFraction, alpha:g.alpha};
    const r = compute(input);
    const s = calculateSuitabilityFor(g, input).score;
    return {governorate:g.governorate, arabic:g.arabic, arableTotalFeddan:g.arableTotalFeddan||0, totalWF:r.totalWF, score:s};
  }).sort((a,b)=>b.score-a.score);
  $('govRankingRows').innerHTML = ranked.slice(0,15).map((x,i)=>`<tr><td><strong>${i+1}</strong></td><td>${displayGov(x)}</td><td><strong>${fmt(x.score,0)}/100</strong></td><td>${fmt(x.totalWF,1)}</td><td>${fmt(x.arableTotalFeddan,0)}</td></tr>`).join('');
  const labels = ranked.slice(0,10).map(x=>currentLang==='ar'?x.arabic:x.governorate);
  const data = ranked.slice(0,10).map(x=>x.score);
  if($('govScoreChart')){
    if(govScoreChart){ govScoreChart.data.labels = labels; govScoreChart.data.datasets[0].data = data; govScoreChart.update(); }
    else { govScoreChart = new Chart($('govScoreChart'), {type:'bar', data:{labels, datasets:[{label:'Suitability score', data}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{min:0,max:100}}}}); }
  }
  return ranked;
}
function collectAdvancedExport(base, r){
  const mc = runMonteCarlo(base);
  return {
    timestamp:new Date().toISOString(),
    governorate:selectedGov().governorate,
    crop:selectedCrop().crop,
    product:selectedProduct(selectedCrop()).name,
    productUnit:selectedProduct(selectedCrop()).unit,
    method:$('methodSelect').value,
    input:base,
    result:r,
    weights:getMCDAWeights(),
    suitability:calculateSuitabilityFor(selectedGov(), base),
    climateScenarios:buildClimateScenarios(base, r),
    sensitivity:buildSensitivity(base, r),
    monteCarloStats:mc.stats,
    cropRanking:renderCropRanking(base).slice(0,25),
    governorateRanking:renderGovernorateRanking(base).slice(0,27)
  };
}
function exportAdvancedJSON(){
  const base = getInput(), r = compute(base);
  const data = collectAdvancedExport(base, r);
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'research_grade_water_footprint_results.json'; a.click(); URL.revokeObjectURL(a.href);
}
function exportAdvancedCSV(){
  const base = getInput(), r = compute(base);
  const govRows = renderGovernorateRanking(base).map((x,i)=>({rank:i+1, governorate:x.governorate, arabic:x.arabic, score:fmt(x.score,2), totalWF:fmt(x.totalWF,2), arableFeddan:x.arableTotalFeddan}));
  downloadCSV(govRows, 'research_grade_governorate_ranking.csv');
}

function updateAdvancedAnalytics(r, base){
  if(!$('advancedAnalytics')) return;
  const suitability = renderSuitability(base);
  renderSuitabilityMap(base);
  renderScenarioAnalysis(base, r);
  renderSensitivity(base, r);
  renderMonteCarlo(base);
  renderCustomScenario(base, r);
  renderCropRanking(base);
  renderGovernorateRanking(base);
  if(suitability) renderScientificReportPreview(base, r, suitability);
}

function updateComparison(){
  const base = getInput();
  latestComparison = governorates.map(g => {
    const r = compute({...base, et0:g.et0, rain:g.rain, peffFraction:g.peffFraction, alpha:g.alpha});
    return {governorate:g.governorate, arabic:g.arabic, crop:base.cropName, cropArabic:base.cropArabic, product:base.productName, productUnit:base.productUnit, productYieldFeddan:base.productYieldFeddan, region:g.region, station:g.station, years:g.years, et0:g.et0, annualETo:g.annualETo, maxMonthlyETo:g.maxMonthlyETo, minMonthlyETo:g.minMonthlyETo, peakMonth:g.peakMonth, rain:g.rain, arableTotalFeddan:g.arableTotalFeddan, arablePrivateFeddan:g.arablePrivateFeddan, arableGovernmentFeddan:g.arableGovernmentFeddan, arableSource:g.arableSource, arableNote:g.arableNote, arableReferenceUrl:g.arableReferenceUrl, greenWF:r.greenWF, netBlueWF:r.netBlueWF, blueWF:r.blueWF, greyWF:r.greyWF, totalWF:r.totalWF, waterSaving:r.waterSaving};
  }).sort((a,b) => a.totalWF - b.totalWF);

  updateOptimalDistribution();
  renderCropAreaAllocation();

  $('comparisonTitle').textContent = `${tr('comparisonTitle')} — ${displayCrop(selectedCrop())}`;
  $('comparisonRows').innerHTML = latestComparison.map(r => `
    <tr>
      <td><strong>${displayGov(r)}</strong></td>
      <td>${r.region}</td>
      <td>${fmt(r.arableTotalFeddan,0)}</td>
      <td>${fmt(r.et0,3)}</td>
      <td>${fmt(r.annualETo,1)}</td>
      <td>${fmt(r.rain)}</td>
      <td>${fmt(r.greenWF)}</td>
      <td>${fmt(r.netBlueWF)}</td>
      <td>${fmt(r.blueWF)}</td>
      <td>${fmt(r.greyWF)}</td>
      <td><strong>${fmt(r.totalWF)}</strong></td>
    </tr>
  `).join('');

  const labels = latestComparison.map(x => currentLang === 'ar' ? x.arabic : x.governorate);
  const values = latestComparison.map(x => x.totalWF);
  if(barChart){
    barChart.data.labels = labels;
    barChart.data.datasets[0].label = `${tr('totalWF')} m³/ton`;
    barChart.data.datasets[0].data = values;
    barChart.update();
  }else{
    barChart = new Chart($('barChart'), {
      type:'bar',
      data:{labels, datasets:[{label:`${tr('totalWF')} m³/ton`, data:values}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{maxRotation:55,minRotation:45}}}}
    });
  }
}

function buildTable(id, rows){
  if(!rows || !rows.length){ $(id).innerHTML = ''; return; }
  const cropKeys = ['crop','arabic','group','mainProduct','yieldFeddan','yieldMinFeddan','yieldMaxFeddan','yieldUnit','additionalProducts','bestGovernorates','dataType','source','days','kc','yield','ar'];
  const keys = id === 'cropsTable' ? cropKeys : Object.keys(rows[0]);
  const cell = (v) => {
    if(Array.isArray(v)) return v.map(p => p && p.name ? `${p.name}: ${p.yieldFeddan || ''} ${p.unit || ''}` : JSON.stringify(p)).join('<br>');
    if(v && typeof v === 'object') return JSON.stringify(v);
    return v ?? '';
  };
  $(id).innerHTML = `<thead><tr>${keys.map(k=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${keys.map(k => `<td>${cell(r[k])}</td>`).join('')}</tr>`).join('')
  }</tbody>`;
}


function buildEToAnnualTable(){
  const sorted = [...governorates].sort((a,b) => a.et0 - b.et0);
  $('etoAnnualRows').innerHTML = sorted.map(g => `
    <tr>
      <td><strong>${displayGov(g)}</strong></td>
      <td>${g.station}</td>
      <td>${g.region}</td>
      <td>${g.years}</td>
      <td><strong>${fmt(g.et0,3)}</strong></td>
      <td>${fmt(g.annualETo,1)}</td>
      <td>${fmt(g.maxMonthlyETo,1)}</td>
      <td>${fmt(g.minMonthlyETo,1)}</td>
      <td>${g.peakMonth}</td>
    </tr>
  `).join('');
}

function updateEToMonthlyPanel(){
  const gov = $('etoGovSelect').value || governorates[0].governorate;
  const rows = monthlyEToAverages.filter(r => r.governorate === gov).sort((a,b) => a.monthNo - b.monthNo);
  $('etoMonthlyRows').innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.monthAR}</strong></td>
      <td>${fmt(r.etoDay,3)}</td>
      <td>${fmt(r.etoMonth,1)}</td>
      <td>${fmt(r.tmin,1)}</td>
      <td>${fmt(r.tmax,1)}</td>
      <td>${fmt(r.rh,1)}</td>
      <td>${fmt(r.wind,2)}</td>
      <td>${fmt(r.sunshine,1)}</td>
    </tr>
  `).join('');
  const labels = rows.map(r => r.monthAR);
  const values = rows.map(r => r.etoMonth);
  if(etoMonthlyChart){
    etoMonthlyChart.data.labels = labels;
    etoMonthlyChart.data.datasets[0].data = values;
    etoMonthlyChart.update();
  }else{
    etoMonthlyChart = new Chart($('etoMonthlyChart'), {
      type:'line',
      data:{labels, datasets:[{label:'Monthly ETo mm', data:values, tension:.25}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}
    });
  }
}

function buildEToSelectors(){
  $('etoGovSelect').innerHTML = governorates.map(g => `<option value="${g.governorate}">${displayGov(g)}</option>`).join('');
  $('etoGovSelect').value = $('govSelect').value || governorates[0].governorate;
  $('etoGovSelect').addEventListener('input', updateEToMonthlyPanel);
  buildEToAnnualTable();
  updateEToMonthlyPanel();
}


function downloadCSV(rows, filename){
  if(!rows || !rows.length){ alert(currentLang === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export'); return; }
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => `"${String(r[k] ?? '').replaceAll('"','""')}"`).join(','))).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function updatePremiumUI(){
  try{
    const g = selectedGov(), crop = selectedCrop();
    const base = getInput();
    const r = compute(base);
    const s = calculateSuitabilityFor(g, base);
    const method = methods.find(m => m.name === $('methodSelect').value) || methods[0];
    if($('liveScore')) $('liveScore').textContent = fmt(s.score,0);
    if($('liveScoreClass')) $('liveScoreClass').textContent = scoreClass(s.score);
    if($('liveTotalWF')) $('liveTotalWF').textContent = fmt(r.totalWF,0);
    if($('liveSaving')) $('liveSaving').textContent = fmt(r.waterSaving,1);
    if($('liveRecommendation')){
      $('liveRecommendation').innerHTML = currentLang === 'ar'
        ? `الاختيار الحالي: <strong>${displayCrop(crop)}</strong> في <strong>${displayGov(g)}</strong> باستخدام <strong>${methodLabel(method)}</strong>. درجة الملاءمة ${fmt(s.score,0)}/100.`
        : `Current case: <strong>${displayCrop(crop)}</strong> in <strong>${displayGov(g)}</strong> using <strong>${methodLabel(method)}</strong>. Suitability score ${fmt(s.score,0)}/100.`;
    }
    document.documentElement.style.setProperty('--live-score', `${Math.max(0,Math.min(100,s.score))}%`);
  }catch(e){ console.warn('Premium UI update skipped', e); }
}

const __coreUpdate = update;
update = function(){
  __coreUpdate();
  updatePremiumUI();
};

function init(){
  updateSelectLabels();
  $('govSelect').value = 'Aswan';
  $('cropSelect').value = 'Wheat';
  updateProductOptions();
  if($('productSelect')) $('productSelect').value = '0';
  if($('dataMode')) $('dataMode').value = localStorage.getItem('calculationMode') || 'automatic';
  $('methodSelect').value = 'Sprinkler irrigation';
  $('eaInput').value = '0.75';
  syncCropDefaultInputs();

  document.querySelectorAll('select,input').forEach(el => el.addEventListener('input', update));
  $('cropSelect').addEventListener('change', () => { updateProductOptions(); syncCropDefaultInputs(); update(); });
  if($('productSelect')) $('productSelect').addEventListener('change', () => { syncCropDefaultInputs(); update(); });
  $('methodSelect').addEventListener('change', () => {
    const m = methods.find(x => x.name === $('methodSelect').value);
    $('eaInput').value = m.ea;
    update();
  });

  $('resetBtn').addEventListener('click', () => {
    $('govSelect').value = 'Aswan';
    $('cropSelect').value = 'Wheat';
    updateProductOptions();
    if($('productSelect')) $('productSelect').value = '0';
    $('methodSelect').value = 'Sprinkler irrigation';
    $('eaInput').value = '0.75';
    $('peffMode').value = 'Auto';
    $('manualPeff').value = '10';
    if($('areaInput')) $('areaInput').value = '100';
    if($('targetProductionDemand')) $('targetProductionDemand').value = '1000';
    if($('availableWaterDemand')) $('availableWaterDemand').value = '0';
    if($('planningSafetyMargin')) $('planningSafetyMargin').value = '10';
    if($('demandTargetType')) $('demandTargetType').value = 'production';
    if($('rainScenario')) $('rainScenario').value = '1';
    if($('dataMode')) { $('dataMode').value = 'automatic'; localStorage.setItem('calculationMode','automatic'); }
    ['manualETc','manualETBlue','manualAppliedWater','manualProduction','dataReferenceNote'].forEach(id => { if($(id)) $(id).value = ''; });
    if($('dataSourceType')) $('dataSourceType').value = 'database';
    syncCropDefaultInputs();
    if($('targetAreaInput')) $('targetAreaInput').value = '1000000';
    if($('topNGovInput')) $('topNGovInput').value = '3';
    update();
  });

  if($('languageSelect')) $('languageSelect').addEventListener('change', () => {
    const savedGov = $('govSelect').value, savedCrop = $('cropSelect').value, savedMethod = $('methodSelect').value, savedEtoGov = $('etoGovSelect')?.value;
    currentLang = $('languageSelect').value;
    localStorage.setItem('programLang', currentLang);
    const savedProduct = $('productSelect')?.value;
    applyLanguage();
    $('govSelect').value = savedGov; $('cropSelect').value = savedCrop; updateProductOptions(savedProduct); $('methodSelect').value = savedMethod; if($('etoGovSelect') && savedEtoGov) $('etoGovSelect').value = savedEtoGov;
    update(); buildEToAnnualTable(); updateEToMonthlyPanel(); buildTable('govTable', governorates); buildTable('cropsTable', crops);
  });

  if($('dataMode')) $('dataMode').addEventListener('change', () => {
    localStorage.setItem('calculationMode', $('dataMode').value);
    updateCalculationModeUI();
    update();
  });

  $('exportComparison').addEventListener('click', () => downloadCSV(latestComparison, 'egypt_governorates_comparison.csv'));
  $('exportOptimal').addEventListener('click', () => downloadCSV(latestOptimal, 'egypt_governorates_optimal_distribution.csv'));
  if($('exportIrrigationCSV')) $('exportIrrigationCSV').addEventListener('click', () => downloadCSV(latestIrrigationComparison, 'irrigation_methods_comparison.csv'));
  if($('printReportBtn')) $('printReportBtn').addEventListener('click', openScientificReport);
  if($('exportScientificReportBtn')) $('exportScientificReportBtn').addEventListener('click', openScientificReport);
  if($('openScientificReportBtn')) $('openScientificReportBtn').addEventListener('click', openScientificReport);
  if($('exportAdvancedJSONBtn')) $('exportAdvancedJSONBtn').addEventListener('click', exportAdvancedJSON);
  if($('exportAdvancedCSVBtn')) $('exportAdvancedCSVBtn').addEventListener('click', exportAdvancedCSV);
  document.querySelectorAll('.mcdaWeight,#mcRuns,#mcRange,#customEtoPct,#customRainPct,#customYieldPct,#customEaPct').forEach(el => el.addEventListener('input', update));
  $('exportEToMonthly').addEventListener('click', () => downloadCSV(monthlyEToAverages, 'eto_monthly_10_year_averages.csv'));

  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    if(!requireDeveloperAccess(btn.dataset.tab)) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
    $(btn.dataset.tab).classList.remove('hidden');
    setTimeout(() => { if(barChart) barChart.resize(); if(pieChart) pieChart.resize(); if(etoMonthlyChart) etoMonthlyChart.resize(); if(sensitivityChart) sensitivityChart.resize(); if(monteCarloChart) monteCarloChart.resize(); if(govScoreChart) govScoreChart.resize(); }, 50);
  }));

  applyLanguage();
  $('govSelect').value = 'Aswan';
  $('cropSelect').value = 'Wheat';
  $('methodSelect').value = 'Sprinkler irrigation';
  syncCropDefaultInputs();
  buildTable('govTable', governorates);
  buildTable('cropsTable', crops);
  buildEToSelectors();
  update();
}
init();


// ===== countries-page-script =====
(function(){
  const countriesData = [{"no":1,"continent":"Asia","country":"Bangladesh","priority":"Core","crops":"Rice, jute, vegetables, tea","wf":"Useful for rice WF under humid/delta conditions","use":"Rice benchmark"},{"no":2,"continent":"Asia","country":"China","priority":"Core","crops":"Rice, wheat, maize, vegetables, fruits, cotton","wf":"High national production; useful for cereal, cotton and vegetable WF benchmarking","use":"Core benchmark"},{"no":3,"continent":"Asia","country":"India","priority":"Core","crops":"Rice, wheat, pulses, cotton, sugarcane, spices","wf":"High blue-water relevance for rice, wheat, cotton and sugarcane","use":"Core benchmark"},{"no":4,"continent":"Asia","country":"Indonesia","priority":"Core","crops":"Rice, oil palm, rubber, coffee, cocoa","wf":"Strong green-water/tropical crop comparison for oil palm and rice","use":"Tropical benchmark"},{"no":5,"continent":"Asia","country":"Iran","priority":"Core","crops":"Wheat, barley, pistachio, dates, saffron","wf":"Strong water-scarcity and blue-WF relevance","use":"Dryland/irrigation benchmark"},{"no":6,"continent":"Asia","country":"Pakistan","priority":"Core","crops":"Wheat, rice, cotton, sugarcane","wf":"High blue-water relevance for cotton, rice and wheat","use":"Irrigated-arid benchmark"},{"no":7,"continent":"Asia","country":"Thailand","priority":"Core","crops":"Rice, sugarcane, cassava, rubber","wf":"WF comparison for rice/sugarcane/cassava systems","use":"Export crop benchmark"},{"no":8,"continent":"Asia","country":"Turkey","priority":"Core","crops":"Wheat, barley, cotton, fruits, vegetables","wf":"Relevant to wheat, barley, cotton and fruit WF","use":"Mediterranean benchmark"},{"no":9,"continent":"Asia","country":"Vietnam","priority":"Core","crops":"Rice, coffee, pepper, rubber, fruits","wf":"Good comparison for rice and tropical perennial crops","use":"Export crop benchmark"},{"no":10,"continent":"Asia","country":"Cambodia","priority":"Secondary","crops":"Rice, cassava, maize, rubber","wf":"Useful for regional rice and cassava comparison","use":"Emerging benchmark"},{"no":11,"continent":"Asia","country":"Iraq","priority":"Secondary","crops":"Wheat, barley, dates, rice","wf":"Blue-water and salinity relevance","use":"Arid irrigation benchmark"},{"no":12,"continent":"Asia","country":"Japan","priority":"Secondary","crops":"Rice, vegetables, fruits","wf":"Useful for efficient rice and horticulture comparison","use":"High-tech benchmark"},{"no":13,"continent":"Asia","country":"Jordan","priority":"Secondary","crops":"Olives, vegetables, wheat, barley, dates","wf":"Important arid/semi-arid benchmark for blue-water efficiency and deficit irrigation","use":"Arid benchmark"},{"no":14,"continent":"Asia","country":"Kazakhstan","priority":"Secondary","crops":"Wheat, barley, oilseeds","wf":"Useful for rainfed wheat/barley comparison","use":"Cereal benchmark"},{"no":15,"continent":"Asia","country":"Malaysia","priority":"Secondary","crops":"Oil palm, rubber, rice, fruits","wf":"High green-water relevance for tropical perennials","use":"Perennial crop benchmark"},{"no":16,"continent":"Asia","country":"Palestine","priority":"Secondary","crops":"Olives, vegetables, grapes, wheat, barley","wf":"Relevant for olive, vegetable and water-scarcity WF comparison","use":"Mediterranean/arid benchmark"},{"no":17,"continent":"Asia","country":"Philippines","priority":"Secondary","crops":"Rice, coconut, banana, sugarcane","wf":"Good comparison for coconut, banana and rice WF","use":"Tropical benchmark"},{"no":18,"continent":"Asia","country":"Saudi Arabia","priority":"Secondary","crops":"Dates, wheat, fodder, vegetables","wf":"Strong groundwater/blue-water relevance","use":"Arid benchmark"},{"no":19,"continent":"Asia","country":"South Korea","priority":"Secondary","crops":"Rice, vegetables, fruits","wf":"Useful for high-yield rice/vegetable comparisons","use":"Efficiency benchmark"},{"no":20,"continent":"Asia","country":"Sri Lanka","priority":"Secondary","crops":"Rice, tea, coconut, rubber","wf":"Useful for rice, tea and perennial WF comparison","use":"Tropical benchmark"},{"no":21,"continent":"Asia","country":"Uzbekistan","priority":"Secondary","crops":"Cotton, wheat, fruits, vegetables","wf":"High relevance for cotton blue water and salinity issues","use":"Cotton benchmark"},{"no":22,"continent":"Asia","country":"Yemen","priority":"Secondary","crops":"Sorghum, wheat, coffee, qat, dates, vegetables","wf":"High relevance for blue-water scarcity and traditional dryland crops","use":"Water-scarcity benchmark"},{"no":23,"continent":"Africa","country":"Egypt","priority":"Core","crops":"Wheat, rice, maize, cotton, sugarcane, vegetables, fruits","wf":"Very high blue-water relevance; central to Egypt WF analysis","use":"Main target country"},{"no":24,"continent":"Africa","country":"Ethiopia","priority":"Core","crops":"Maize, wheat, teff, coffee, pulses","wf":"Good comparison for coffee, cereals and pulses","use":"Highland benchmark"},{"no":25,"continent":"Africa","country":"Kenya","priority":"Core","crops":"Tea, coffee, maize, horticulture","wf":"Useful for tea, coffee and vegetable WF","use":"Export horticulture benchmark"},{"no":26,"continent":"Africa","country":"Morocco","priority":"Core","crops":"Wheat, barley, olives, citrus, vegetables","wf":"Useful for wheat/barley/olive WF in water-scarce zones","use":"Mediterranean benchmark"},{"no":27,"continent":"Africa","country":"Nigeria","priority":"Core","crops":"Cassava, yam, maize, rice, sorghum, cocoa","wf":"Useful for rainfed/tropical staples WF comparison","use":"Tropical staple benchmark"},{"no":28,"continent":"Africa","country":"South Africa","priority":"Core","crops":"Maize, grapes, citrus, sugarcane, wheat","wf":"Relevant for irrigated fruits, maize and export crops","use":"Commercial benchmark"},{"no":29,"continent":"Africa","country":"Sudan","priority":"Core","crops":"Sorghum, millet, sesame, cotton, groundnut","wf":"Relevant for sesame, cotton and Nile Basin comparisons","use":"Nile Basin benchmark"},{"no":30,"continent":"Africa","country":"Algeria","priority":"Secondary","crops":"Wheat, barley, dates, olives","wf":"Useful for wheat/barley/dates comparison","use":"Semi-arid benchmark"},{"no":31,"continent":"Africa","country":"Cameroon","priority":"Secondary","crops":"Cocoa, coffee, banana, cassava, maize","wf":"Useful for cocoa/banana/root crops","use":"Tropical benchmark"},{"no":32,"continent":"Africa","country":"Côte d'Ivoire","priority":"Secondary","crops":"Cocoa, coffee, oil palm, rubber, cassava","wf":"High relevance for cocoa/perennial WF","use":"Cocoa benchmark"},{"no":33,"continent":"Africa","country":"Ghana","priority":"Secondary","crops":"Cocoa, cassava, maize, yam, oil palm","wf":"Useful for cocoa and root crops WF","use":"Cocoa/root benchmark"},{"no":34,"continent":"Africa","country":"Libya","priority":"Secondary","crops":"Olives, dates, wheat, barley, vegetables","wf":"Useful for arid agriculture, dates, olives and blue-water WF comparison","use":"Arid North Africa benchmark"},{"no":35,"continent":"Africa","country":"Mali","priority":"Secondary","crops":"Cotton, millet, rice, sorghum","wf":"Cotton/rice blue-water relevance","use":"Sahel benchmark"},{"no":36,"continent":"Africa","country":"Senegal","priority":"Secondary","crops":"Groundnut, rice, millet, vegetables","wf":"Useful for rice/groundnut under dry climates","use":"Sahel benchmark"},{"no":37,"continent":"Africa","country":"Tanzania","priority":"Secondary","crops":"Maize, rice, cassava, coffee, cotton","wf":"Rainfed staple crop comparison","use":"Staple benchmark"},{"no":38,"continent":"Africa","country":"Tunisia","priority":"Secondary","crops":"Olives, wheat, barley, dates, citrus","wf":"Good olive and cereal WF comparison","use":"Mediterranean benchmark"},{"no":39,"continent":"Africa","country":"Uganda","priority":"Secondary","crops":"Coffee, banana, maize, beans","wf":"Useful for banana/coffee WF comparisons","use":"Tropical benchmark"},{"no":40,"continent":"Africa","country":"Zambia","priority":"Secondary","crops":"Maize, sugarcane, tobacco, soybean","wf":"Staple/irrigated crop comparison","use":"Southern Africa benchmark"},{"no":41,"continent":"Europe","country":"France","priority":"Core","crops":"Wheat, barley, maize, grapes, sugar beet","wf":"Useful for temperate cereal and grape WF benchmarks","use":"EU benchmark"},{"no":42,"continent":"Europe","country":"Germany","priority":"Core","crops":"Wheat, barley, potatoes, sugar beet, rapeseed","wf":"Useful for efficient temperate crop comparisons","use":"EU benchmark"},{"no":43,"continent":"Europe","country":"Italy","priority":"Core","crops":"Grapes, olives, wheat, tomatoes, citrus","wf":"Useful for grapes, olives and tomato WF","use":"Mediterranean benchmark"},{"no":44,"continent":"Europe","country":"Russia","priority":"Core","crops":"Wheat, barley, sunflower, potatoes","wf":"Useful for rainfed cereal and sunflower WF comparisons","use":"Cereal benchmark"},{"no":45,"continent":"Europe","country":"Spain","priority":"Core","crops":"Olives, grapes, citrus, vegetables, barley","wf":"High water-scarcity relevance for fruit/vegetables/olive","use":"Mediterranean benchmark"},{"no":46,"continent":"Europe","country":"Ukraine","priority":"Core","crops":"Wheat, maize, sunflower, barley","wf":"Important for wheat/maize/sunflower WF benchmarking","use":"Cereal/oilseed benchmark"},{"no":47,"continent":"Europe","country":"Greece","priority":"Secondary","crops":"Olives, grapes, cotton, fruits, vegetables","wf":"Useful for olive, cotton and horticulture WF","use":"Mediterranean benchmark"},{"no":48,"continent":"Europe","country":"Hungary","priority":"Secondary","crops":"Maize, wheat, sunflower, barley","wf":"Useful for maize/wheat/sunflower WF","use":"Cereal benchmark"},{"no":49,"continent":"Europe","country":"Netherlands","priority":"Secondary","crops":"Greenhouse vegetables, potatoes, flowers, dairy","wf":"Useful for greenhouse efficiency comparison","use":"High-tech benchmark"},{"no":50,"continent":"Europe","country":"Poland","priority":"Secondary","crops":"Wheat, potatoes, rye, rapeseed, apples","wf":"Useful for potatoes and temperate crops","use":"Temperate benchmark"},{"no":51,"continent":"Europe","country":"Portugal","priority":"Secondary","crops":"Olives, grapes, maize, tomatoes","wf":"Useful for olive/grape and tomato WF","use":"Mediterranean benchmark"},{"no":52,"continent":"Europe","country":"Romania","priority":"Secondary","crops":"Maize, wheat, sunflower, barley","wf":"Useful for maize/sunflower WF comparison","use":"Cereal/oilseed benchmark"},{"no":53,"continent":"Europe","country":"Serbia","priority":"Secondary","crops":"Maize, wheat, sunflower, fruit","wf":"Useful for cereals and fruit comparisons","use":"Balkan benchmark"},{"no":54,"continent":"Europe","country":"United Kingdom","priority":"Secondary","crops":"Wheat, barley, rapeseed, potatoes","wf":"Rainfed wheat/barley comparison","use":"Temperate benchmark"},{"no":55,"continent":"North America","country":"Canada","priority":"Core","crops":"Wheat, canola, barley, pulses","wf":"Rainfed cereal/oilseed WF benchmark","use":"Cereal/oilseed benchmark"},{"no":56,"continent":"North America","country":"Mexico","priority":"Core","crops":"Maize, avocado, sugarcane, vegetables, berries","wf":"Relevant to maize, avocado, vegetables and water scarcity","use":"Mixed benchmark"},{"no":57,"continent":"North America","country":"United States","priority":"Core","crops":"Maize, soybean, wheat, cotton, almonds, vegetables","wf":"Strong benchmark for maize/soy/wheat/cotton and irrigation hotspots","use":"Core benchmark"},{"no":58,"continent":"North America","country":"Costa Rica","priority":"Secondary","crops":"Banana, pineapple, coffee, sugarcane","wf":"Useful for banana/pineapple WF","use":"Export crop benchmark"},{"no":59,"continent":"North America","country":"Cuba","priority":"Secondary","crops":"Sugarcane, tobacco, rice, citrus","wf":"Useful for sugarcane WF comparison","use":"Island benchmark"},{"no":60,"continent":"North America","country":"Dominican Republic","priority":"Secondary","crops":"Sugarcane, banana, cocoa, coffee","wf":"Useful for sugarcane/cocoa/banana WF","use":"Caribbean benchmark"},{"no":61,"continent":"North America","country":"El Salvador","priority":"Secondary","crops":"Coffee, sugarcane, maize, beans","wf":"Useful for coffee/sugarcane WF","use":"Tropical benchmark"},{"no":62,"continent":"North America","country":"Guatemala","priority":"Secondary","crops":"Coffee, sugarcane, banana, maize","wf":"Useful for coffee/banana/sugarcane WF","use":"Tropical benchmark"},{"no":63,"continent":"North America","country":"Haiti","priority":"Secondary","crops":"Maize, rice, sorghum, coffee","wf":"Useful for low-input crop WF comparisons","use":"Smallholder benchmark"},{"no":64,"continent":"North America","country":"Honduras","priority":"Secondary","crops":"Coffee, banana, maize, palm oil","wf":"Tropical perennial crop comparison","use":"Tropical benchmark"},{"no":65,"continent":"North America","country":"Nicaragua","priority":"Secondary","crops":"Coffee, sugarcane, maize, beans","wf":"Useful for coffee/beans/sugarcane WF","use":"Tropical benchmark"},{"no":66,"continent":"North America","country":"Panama","priority":"Secondary","crops":"Banana, rice, maize, sugarcane","wf":"Useful for rice/banana WF comparison","use":"Tropical benchmark"},{"no":67,"continent":"South America","country":"Argentina","priority":"Core","crops":"Soybean, maize, wheat, sunflower, grapes","wf":"Useful for soybean/maize/wheat WF comparison","use":"Pampas benchmark"},{"no":68,"continent":"South America","country":"Brazil","priority":"Core","crops":"Soybean, maize, sugarcane, coffee, cotton, oranges","wf":"Key benchmark for rainfed/green WF and tropical export crops","use":"Core benchmark"},{"no":69,"continent":"South America","country":"Chile","priority":"Core","crops":"Grapes, apples, cherries, wheat, berries","wf":"High relevance for fruit WF under water scarcity","use":"Fruit export benchmark"},{"no":70,"continent":"South America","country":"Colombia","priority":"Core","crops":"Coffee, banana, sugarcane, rice, flowers","wf":"Useful for coffee/banana/sugarcane WF","use":"Tropical benchmark"},{"no":71,"continent":"South America","country":"Peru","priority":"Core","crops":"Potato, rice, coffee, asparagus, grapes","wf":"Relevant for potato and irrigated horticulture","use":"Andean/coastal benchmark"},{"no":72,"continent":"South America","country":"Bolivia","priority":"Secondary","crops":"Soybean, quinoa, maize, potato","wf":"Useful for quinoa/potato/soy comparison","use":"Andean benchmark"},{"no":73,"continent":"South America","country":"Ecuador","priority":"Secondary","crops":"Banana, cocoa, coffee, rice","wf":"Useful for banana/cocoa WF","use":"Banana/cocoa benchmark"},{"no":74,"continent":"South America","country":"Paraguay","priority":"Secondary","crops":"Soybean, maize, wheat, cassava","wf":"Soybean WF comparison","use":"Soybean benchmark"},{"no":75,"continent":"South America","country":"Uruguay","priority":"Secondary","crops":"Rice, soybean, wheat, barley","wf":"Rice and cereal WF comparison","use":"Temperate benchmark"},{"no":76,"continent":"South America","country":"Venezuela","priority":"Secondary","crops":"Maize, rice, sugarcane, coffee, cocoa","wf":"Useful for cocoa/coffee/rice comparison","use":"Tropical benchmark"},{"no":77,"continent":"Oceania","country":"Australia","priority":"Core","crops":"Wheat, barley, cotton, sugarcane, grapes","wf":"Strong water-scarcity and blue-WF relevance","use":"Dryland/irrigation benchmark"},{"no":78,"continent":"Oceania","country":"New Zealand","priority":"Core","crops":"Dairy, kiwifruit, apples, wine grapes, barley","wf":"Useful for high-yield pasture/fruit comparisons","use":"High productivity benchmark"},{"no":79,"continent":"Oceania","country":"Fiji","priority":"Secondary","crops":"Sugarcane, taro, cassava, coconut","wf":"Island crop WF comparison","use":"Island benchmark"},{"no":80,"continent":"Oceania","country":"Papua New Guinea","priority":"Secondary","crops":"Oil palm, coffee, cocoa, sweet potato","wf":"Useful for cocoa/coffee/root crops WF","use":"Pacific tropical benchmark"}];
  window.countriesData80 = countriesData;
  const $id = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let selectedCountryName = localStorage.getItem('selectedCountryName') || 'Egypt';

  function getSelectedCountry(){
    const select = $id('countrySelect');
    const name = select ? select.value : selectedCountryName;
    return countriesData.find(c => c.country === name) || countriesData.find(c => c.country === 'Egypt') || countriesData[0];
  }

  function fillContinentFilter(){
    const sel = $id('continentFilter'); if(!sel) return;
    const continents = [...new Set(countriesData.map(c=>c.continent))].sort();
    sel.innerHTML = '<option value="All">كل القارات / All continents</option>' + continents.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }

  function fillCountrySelect(){
    const filter = $id('continentFilter')?.value || 'All';
    const sel = $id('countrySelect'); if(!sel) return;
    const filtered = filter === 'All' ? countriesData : countriesData.filter(c=>c.continent === filter);
    sel.innerHTML = filtered.map(c=>`<option value="${esc(c.country)}">${esc(c.country)} — ${esc(c.continent)}</option>`).join('');
    if(filtered.some(c=>c.country === selectedCountryName)) sel.value = selectedCountryName;
    else if(filtered.length) sel.value = filtered[0].country;
    renderCountryInfo();
    renderCountriesRows();
  }

  function parseCountryCrops(c){
    return String(c?.crops || '')
      .split(/,|؛|;|\/| and /i)
      .map(x => x.trim())
      .filter(Boolean);
  }

  function fillCountryCropSelect(){
    const sel = $id('countryCropSelect'); if(!sel) return;
    const c = getSelectedCountry();
    const cropsList = parseCountryCrops(c);
    const opts = cropsList.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
    sel.innerHTML = `<option value="">اختر محصولًا من أهم محاصيل الدولة / Select crop</option>${opts}<option value="__manual__">محصول آخر — إدخال يدوي / Other manual crop</option>`;
    const saved = localStorage.getItem('selectedCountryCrop') || '';
    if(saved && [...sel.options].some(o=>o.value===saved)) sel.value = saved;
  }

  function selectedCountryCropName(){
    const sel = $id('countryCropSelect');
    const manual = ($id('countryCropManualInput')?.value || '').trim();
    if(sel && sel.value === '__manual__') return manual || 'Manual crop';
    if(sel && sel.value) return sel.value;
    return manual || 'Manual crop';
  }

  function ensureCustomCropInMainCalculator(cropName){
    const name = (cropName || 'Manual crop').trim();
    if(!name) return;
    try{
      if(typeof crops === 'undefined' || !Array.isArray(crops)) return;
      let existing = crops.find(c => String(c.crop).toLowerCase() === name.toLowerCase() || String(c.arabic||'').toLowerCase() === name.toLowerCase());
      if(!existing){
        existing = {
          crop: name,
          arabic: name,
          group: 'Manual country crop',
          groupAr: 'محصول دولة — إدخال يدوي',
          days: Number($id('countryDaysInput')?.value) || 120,
          kc: Number($id('countryKcInput')?.value) || 1,
          yield: Number($id('countryYieldInput')?.value) || 1,
          yieldFeddan: (Number($id('countryYieldInput')?.value) || 1) / 2.38095,
          yieldUnit: 'ton/ha',
          mainProduct: ($id('countryCropProductInput')?.value || 'Manual product'),
          dataType: 'Manual country input',
          source: 'User-entered country/crop data',
          ar: Number($id('countryNitrogenInput')?.value) || 0,
          cmax: Number($id('countryCmaxInput')?.value) || 0.05,
          cnat: Number($id('countryCnatInput')?.value) || 0,
          products: [{name:($id('countryCropProductInput')?.value || 'Manual product'), unit:'ton/ha', yield:Number($id('countryYieldInput')?.value) || 1, kind:'manual', yieldNative:Number($id('countryYieldInput')?.value) || 1, nativeUnit:'ton/ha', calcNote:'Manual country crop product'}]
        };
        crops.push(existing);
        if(window.refreshAllSelects) window.refreshAllSelects();
        else if($id('cropSelect')){
          const opt = document.createElement('option'); opt.value = existing.crop; opt.textContent = existing.crop; $id('cropSelect').appendChild(opt);
        }
      }
      if($id('cropSelect')) $id('cropSelect').value = existing.crop;
      if(window.updateProductOptions) window.updateProductOptions('0');
    }catch(e){ console.warn('Custom country crop setup failed', e); }
  }

  function renderCountryInfo(){
    const c = getSelectedCountry();
    selectedCountryName = c.country;
    localStorage.setItem('selectedCountryName', c.country);
    fillCountryCropSelect();
    const box = $id('countryInfoBox'); if(!box) return;
    const route = T('سيتم فتح الحاسبة الكاملة في وضع الإدخال اليدوي لهذه الدولة، بنفس معادلات المحافظات المصرية دون استخدام أرقام محفوظة؛ أدخل بيانات منشورة أو رسمية أو قياسات محلية موثقة.','The full calculator will open in manual-input mode for this country, using the same equations as the Egypt governorate workflow without stored country defaults. Enter published, official, or locally verified data.');
    box.innerHTML = `
      <span class="country-chip">${T('الدولة','Country')}: <strong>${esc(c.country)}</strong></span>
      <span class="country-chip">${T('القارة','Continent')}: <strong>${esc(c.continent)}</strong></span>
      <span class="country-chip">${T('الأولوية','Priority')}: <strong>${esc(c.priority)}</strong></span>
      <div style="margin-top:10px"><strong>${T('أهم المحاصيل','Main crops')}:</strong> ${esc(c.crops)}</div>
      <div><strong>${T('صلة البصمة المائية','WF relevance')}:</strong> ${esc(c.wf)}</div>
      <div><strong>${T('مسار الدخول','Access route')}:</strong> ${route}</div>
    `;
  }

  function renderCountriesRows(){
    const tbody = $id('countriesRows'); if(!tbody) return;
    const filter = $id('continentFilter')?.value || 'All';
    const filtered = filter === 'All' ? countriesData : countriesData.filter(c=>c.continent === filter);
    tbody.innerHTML = filtered.map(c => `
      <tr data-country="${esc(c.country)}">
        <td>${esc(c.no)}</td><td>${esc(c.continent)}</td><td><strong>${esc(c.country)}</strong></td>
        <td>${esc(c.priority)}</td><td>${esc(c.crops)}</td><td>${esc(c.wf)}</td>
      </tr>
    `).join('');
    tbody.querySelectorAll('tr').forEach(tr => tr.addEventListener('click', () => {
      const sel = $id('countrySelect');
      if(sel){ sel.value = tr.dataset.country; selectedCountryName = tr.dataset.country; }
      renderCountryInfo();
    }));
  }

  function activateTab(tabId){
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
    const sec = $id(tabId); if(sec) sec.classList.remove('hidden');
  }

  function copyManualCountryInputs(){
    const map = [
      ['countryRainInput','rainInput'],
      ['countryEt0Input','et0Input'],
      ['countryAnnualEToInput','annualEToInput'],
      ['countryKcInput','kcInput'],
      ['countryDaysInput','daysInput'],
      ['countryYieldInput','yieldInput'],
      ['countryYieldInput','customYieldInput'],
      ['countryNitrogenInput','nitrogenInput'],
      ['countryCmaxInput','cmaxInput'],
      ['countryCnatInput','cnatInput'],
      ['countryAppliedWaterInput','manualAppliedWater'],
      ['countryAreaInput','areaInput']
    ];
    map.forEach(([from,to]) => {
      const src=$id(from), dst=$id(to);
      if(dst) dst.value = src && src.value !== '' ? src.value : '0';
    });
    const eaSrc = $id('countryEaInput'), eaDst = $id('eaInput');
    if(eaDst) eaDst.value = eaSrc && eaSrc.value !== '' ? eaSrc.value : '0.75';
    const mode = $id('dataMode'); if(mode){ mode.value='manual'; localStorage.setItem('calculationMode','manual'); }
    localStorage.setItem('countryCalculationScope','country_manual');
    const cropName = selectedCountryCropName();
    ensureCustomCropInMainCalculator(cropName);
    const source = $id('dataSourceType'); if(source) source.value = 'assumption';
    const ref = $id('dataReferenceNote');
    const country = getSelectedCountry();
    const cropNotes = $id('countryCropNotesInput')?.value || '';
    const productName = $id('countryCropProductInput')?.value || 'Manual product';
    if(ref) ref.value = `Country-level manual data entry — ${country.country} (${country.continent}); crop: ${cropName}; product: ${productName}. ${cropNotes} All calculation inputs should be user-entered.`;
    const peff = $id('peffMode'); if(peff) peff.value = 'Manual';
    const manualPeff = $id('manualPeff'); if(manualPeff) manualPeff.value = '0';
  }

  function updateCountryCalculatorHeader(){
    const c = getSelectedCountry();
    const isEgypt = String(c.country || '').toLowerCase() === 'egypt';
    const note = $id('selectedCountryNote');
    if(note){
      note.innerHTML = isEgypt
        ? `<strong>${T('وضع حساب مصر','Egypt calculation mode')}:</strong> ${esc(c.country)} — <strong>${T('القارة','Continent')}:</strong> ${esc(c.continent)} — <strong>${T('المحصول','Crop')}:</strong> ${esc(selectedCountryCropName())}. ${T('يمكنك اختيار المحافظة المصرية من خانة المحافظات، مع بقاء بيانات الحساب اليدوية قابلة للتعديل.','You can choose the Egyptian governorate from the governorate field, while manual calculation inputs remain editable.')}`
        : `<strong>${T('وضع حساب دولة','Country calculation mode')}:</strong> ${esc(c.country)} — <strong>${T('القارة','Continent')}:</strong> ${esc(c.continent)} — <strong>${T('المحصول','Crop')}:</strong> ${esc(selectedCountryCropName())}. ${T('خانة المحافظات ظاهرة للمقارنة فقط وغير مستخدمة في حسابات الدول غير مصر، وكل بيانات الدولة والمحصول إدخال يدوي فقط.','The governorate field is shown only for comparison and is not used for non-Egypt country calculations; all country and crop data are manual inputs only.')}`;
    }
    const govSel = $id('govSelect');
    if(govSel){
      govSel.disabled = !isEgypt;
      govSel.title = isEgypt ? T('وضع مصر: اختر محافظة مصرية','Egypt mode: choose an Egyptian governorate') : T('وضع الدول اليدوي: قاعدة المحافظات غير مستخدمة للدول غير مصر','Country manual mode: governorate database is not used for non-Egypt countries');
    }
    const govLabel = $id('governorateInputLabel');
    if(govLabel){
      govLabel.style.display = '';
      const sp = govLabel.querySelector('span');
      if(sp) sp.textContent = isEgypt ? T('المحافظة المصرية','Egyptian governorate') : T('المحافظة المصرية — غير مستخدمة للدول غير مصر','Egyptian governorate — not used for non-Egypt countries');
    }
    const calcTitle = document.querySelector('#calculator .section-title');
    if(calcTitle) calcTitle.textContent = isEgypt ? T('حسابات مصر والمحافظات','Egypt Governorate Calculations') : T('حسابات الدولة المختارة','Selected Country Calculations');
  }

  function renderCountryResults(){
    const c = getSelectedCountry();
    let base = null, r = null;
    try{
      base = window.getInput ? window.getInput() : null;
      r = base && window.compute ? window.compute(base) : null;
    }catch(e){ console.warn('Country result render failed', e); }
    const cropName = selectedCountryCropName();
    const productName = $id('countryCropProductInput')?.value || (base && base.productName) || 'Manual product';
    const title = $id('countryScenarioTitle');
    if(title){
      title.innerHTML = `<strong>${T('الدولة','Country')}:</strong> ${esc(c.country)} — <strong>${T('القارة','Continent')}:</strong> ${esc(c.continent)} — <strong>${T('المحصول','Crop')}:</strong> ${esc(cropName)} — <strong>${T('المنتج','Product')}:</strong> ${esc(productName)}<br><span style="color:#64748b">${T('كل القيم المستخدمة في هذا الحساب مدخلة يدويًا من المستخدم، ولا توجد أرقام محفوظة للدولة؛ يجب توثيق مصدر البيانات عند استخدام النتائج علميًا.','All values used in this calculation are manually entered by the user. No stored country defaults are used; data sources should be documented when using results scientifically.')}</span>`;
    }
    if(!r || !base) return;
    const put = (id, value, d=1) => { const el=$id(id); if(el) el.textContent = (window.fmt ? window.fmt(value,d) : Number(value||0).toFixed(d)); };
    put('countryGreenWF', r.greenWF);
    put('countryBlueWF', r.blueWF);
    put('countryGreyWF', r.greyWF);
    put('countryTotalWF', r.totalWF);
    put('countryETc', r.etc);
    put('countryGIR', r.gir);
    put('countryProduction', r.productionTon);
    put('countryIrrigationVolume', r.grossIrrigationVolume,0);
    const rows = [
      [T('الدولة','Country'), c.country],
      [T('القارة','Continent'), c.continent],
      [T('المحصول / المنتج','Crop / product'), `${cropName} — ${productName}`],
      ['ETo', `${base.et0} ${T('مم/يوم','mm/day')}`],
      [T('الأمطار','Rain'), `${base.rain} ${T('مم/موسم','mm/season')}`],
      ['Kc', base.kc],
      [T('مدة النمو','Growing days'), base.days],
      [T('الإنتاجية','Yield'), `${base.yield} ${T('طن/هكتار','ton/ha')}`],
      [T('كفاءة الري Ea','Irrigation efficiency Ea'), base.ea],
      [T('المساحة','Area'), `${base.areaFeddan} ${T('فدان','feddan')}`],
      ['ETgreen', `${window.fmt ? window.fmt(r.etGreen,1) : r.etGreen} mm`],
      ['ETblue', `${window.fmt ? window.fmt(r.etBlue,1) : r.etBlue} mm`],
      [T('حجم الري الصافي','Net irrigation volume'), `${window.fmt ? window.fmt(r.netIrrigationVolume,0) : r.netIrrigationVolume} m³`],
      [T('حجم الري الإجمالي','Gross irrigation volume'), `${window.fmt ? window.fmt(r.grossIrrigationVolume,0) : r.grossIrrigationVolume} m³`],
      [T('إجمالي البصمة التطبيقية','Total applied WF'), `${window.fmt ? window.fmt(r.totalWF,1) : r.totalWF} m³/ton`],
      [T('مصدر البيانات','Data source'), T('إدخال يدوي من المستخدم للدولة المختارة','Manual user input for selected country')]
    ];
    const body = $id('countryDetailedRows');
    if(body) body.innerHTML = rows.map(([k,v])=>`<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`).join('');
  }

  function prepareCountryCalculation(){
    const c = getSelectedCountry();
    localStorage.setItem('selectedCountryName', c.country);
    localStorage.setItem('countryCalculationScope','country_manual');
    copyManualCountryInputs();
    updateCountryCalculatorHeader();
    try{ if(window.update) window.update(); }catch(e){}
  }

  function openCountry(){
    prepareCountryCalculation();
    activateTab('calculator');
    setTimeout(() => {
      const target = document.getElementById('calculator');
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 80);
  }

  function calculateCountryNow(){
    prepareCountryCalculation();
    renderCountryResults();
    activateTab('countries');
    setTimeout(() => {
      const target = document.getElementById('countryCalculationPanel');
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 80);
  }

  function calculateManualNow(){
    try{ if(window.update) window.update(); }catch(e){}
    const target = document.getElementById('greenWF') || document.getElementById('totalWF');
    if(target) target.scrollIntoView({behavior:'smooth', block:'center'});
  }

  function resetCountryInputs(){
    ['countryCropManualInput','countryCropProductInput','countryCropNotesInput','countryEt0Input','countryAnnualEToInput','countryRainInput','countryEaInput','countryKcInput','countryDaysInput','countryYieldInput','countryAreaInput','countryNitrogenInput','countryCmaxInput','countryCnatInput','countryAppliedWaterInput'].forEach(id => { const el=$id(id); if(el) el.value=''; });
  }

  function initCountriesPage(){
    if(!$id('countries')) return;
    fillContinentFilter();
    fillCountrySelect();
    const cs=$id('countrySelect'); if(cs) cs.addEventListener('change', renderCountryInfo);
    const ccs=$id('countryCropSelect'); if(ccs) ccs.addEventListener('change', () => { localStorage.setItem('selectedCountryCrop', ccs.value); const manual=$id('countryCropManualInput'); if(manual) manual.style.display = ccs.value === '__manual__' ? '' : ''; });
    const cf=$id('continentFilter'); if(cf) cf.addEventListener('change', fillCountrySelect);
    const open=$id('openCountryBtn'); if(open) open.addEventListener('click', openCountry);
    const calcCountry=$id('calculateCountryNowBtn'); if(calcCountry) calcCountry.addEventListener('click', calculateCountryNow);
    const calcManual=$id('calculateManualBtn'); if(calcManual) calcManual.addEventListener('click', calculateManualNow);
    const openDetailed=$id('openCountryCalculationPageBtn'); if(openDetailed) openDetailed.addEventListener('click', openCountry);
    const reset=$id('resetCountryInputsBtn'); if(reset) reset.addEventListener('click', resetCountryInputs);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCountriesPage);
  else initCountriesPage();
})();


// ===== inline-script-6 =====
(function(){
  // ===== Research-grade enhancement layer =====
  const oldCompute = window.compute;
  const oldGetInput = window.getInput;
  const oldUpdate = window.update;
  const oldOpenScientificReport = window.openScientificReport;

  function n(id, fallback=0){ const el=document.getElementById(id); const v=Number(el && el.value); return Number.isFinite(v) ? v : fallback; }
  function v(id, fallback=''){ const el=document.getElementById(id); return el ? el.value : fallback; }
  function safeFmt(x,d=1){ return (window.fmt ? window.fmt(x,d) : Number(x||0).toFixed(d)); }
  function currentCrop(){ try{return window.selectedCrop ? selectedCrop() : (window.crops||[])[0];}catch(e){return (window.crops||[])[0];} }

  function stageInputs(){
    const enabled = !!document.getElementById('useStageKc')?.checked;
    const stages = [
      {stage:'Initial', kc:n('kcIniInput',0.4), days:n('daysIniInput',25)},
      {stage:'Development', kc:n('kcDevInput',0.8), days:n('daysDevInput',35)},
      {stage:'Mid-season', kc:n('kcMidInput',1.1), days:n('daysMidInput',45)},
      {stage:'Late-season', kc:n('kcLateInput',0.75), days:n('daysLateInput',25)}
    ];
    const totalDays = stages.reduce((s,x)=>s + Math.max(0,x.days),0);
    const weightedKc = totalDays ? stages.reduce((s,x)=>s + x.kc*Math.max(0,x.days),0)/totalDays : 0;
    return {enabled, stages, totalDays, weightedKc, etcMultiplierDays: stages.reduce((s,x)=>s + x.kc*Math.max(0,x.days),0)};
  }

  function yieldAdjustment(input){
    const crop = currentCrop() || {};
    const ece = Number(input.soilECe ?? n('soilECeInput',2));
    const ecw = Number(input.waterECw ?? n('waterECInput',0.8));
    const ph = Number(input.soilPH ?? n('soilPHInput',7.5));
    const drainage = input.drainage || v('drainageSelect','good');
    const management = input.management || v('managementSelect','medium');
    const texture = input.soilTexture || v('soilTextureSelect','loam');
    const saltTol = crop.saltTolerance || (crop.group && String(crop.group).includes('فاكه') ? 3.0 : crop.group && String(crop.group).includes('طبي') ? 4.0 : 5.0);
    const salinityPenalty = Math.max(0.55, 1 - Math.max(0, ece - saltTol)*0.06 - Math.max(0, ecw - 1.5)*0.04);
    const phPenalty = (ph>=6 && ph<=8.2) ? 1 : Math.max(0.75, 1 - Math.min(0.25, Math.abs(ph-7.2)*0.045));
    const drainageFactor = {good:1, moderate:0.93, poor:0.78}[drainage] || 0.93;
    const managementFactor = {high:1.08, medium:1, low:0.84}[management] || 1;
    const textureFactor = {loam:1, clay:0.96, sandy:0.92}[texture] || 1;
    const factor = Math.max(0.35, Math.min(1.15, salinityPenalty * phPenalty * drainageFactor * managementFactor * textureFactor));
    const soilScore = Math.max(0, Math.min(100, factor*88 + (management==='high'?8:0) - (drainage==='poor'?14:0)));
    return {factor, soilScore, salinityPenalty, phPenalty, drainageFactor, managementFactor, textureFactor, saltTol};
  }

  window.getInput = function(){
    const base = oldGetInput ? oldGetInput() : {};
    const st = stageInputs();
    return Object.assign(base, {
      useStageKc: st.enabled,
      kcStages: st.stages,
      stageKcWeighted: st.weightedKc || base.kc,
      stageDaysTotal: st.totalDays || base.days,
      soilTexture: v('soilTextureSelect','loam'),
      soilECe: n('soilECeInput',2),
      waterECw: n('waterECInput',0.8),
      soilPH: n('soilPHInput',7.5),
      drainage: v('drainageSelect','good'),
      management: v('managementSelect','medium'),
      price: n('priceInput',12000),
      costFeddan: n('costFeddanInput',22000),
      waterCost: n('waterCostInput',0),
      marketRisk: n('marketRiskInput',25)
    });
  };

  window.compute = function(input){
    const x = Object.assign({}, input || {});
    const st = x.kcStages && x.kcStages.length ? {enabled:x.useStageKc, stages:x.kcStages, etcMultiplierDays:x.kcStages.reduce((s,a)=>s + Number(a.kc||0)*Number(a.days||0),0), totalDays:x.kcStages.reduce((s,a)=>s + Number(a.days||0),0)} : stageInputs();
    if(x.useStageKc && !(Number(x.manualETc)>0)){
      x.days = st.totalDays || x.days;
      x.kc = st.totalDays ? st.etcMultiplierDays / st.totalDays : x.kc;
      x.manualETc = (Number(x.et0)||0) * st.etcMultiplierDays;
    }
    const adj = yieldAdjustment(x);
    const originalYield = Number(x.yield)||0;
    x.yield = Math.max(0.0001, originalYield * adj.factor);
    const r = oldCompute ? oldCompute(x) : {};
    const area = Number(x.areaFeddan)||0;
    const waterVolume = Number(r.grossIrrigationVolume)||0;
    const production = Number(r.productionTon)||0;
    const revenue = production * (Number(x.price)||0);
    const baseCost = area * (Number(x.costFeddan)||0);
    const waterCostTotal = waterVolume * (Number(x.waterCost)||0);
    const totalCost = baseCost + waterCostTotal;
    const netProfit = revenue - totalCost;
    return Object.assign(r, {
      originalYield, adjustedYield:x.yield,
      yieldAdjustmentFactor:adj.factor,
      soilScore:adj.soilScore,
      yieldAdjustmentDetails:adj,
      stageKcUsed:!!x.useStageKc,
      stageETc: x.useStageKc ? x.manualETc : null,
      revenue,totalCost,baseCost,waterCostTotal,netProfit,
      revenuePerM3: waterVolume>0 ? revenue/waterVolume : 0,
      profitPerM3: waterVolume>0 ? netProfit/waterVolume : 0,
      costPerTon: production>0 ? totalCost/production : 0,
      waterCostPerTon: production>0 ? waterCostTotal/production : 0
    });
  };

  function calculateRisk(base, r){
    const waterRisk = Math.max(0, Math.min(100, (Number(r.totalWF)||0)/25)); // high WF pushes risk upward
    const climateRisk = Math.max(0, Math.min(100, ((Number(base.et0)||0)-3.2)*18 + (Number(base.rain)<10?12:0)));
    const soilAdj = yieldAdjustment(base);
    const salinityRisk = Math.max(0, Math.min(100, (1-soilAdj.salinityPenalty)*180 + (base.drainage==='poor'?20:0)));
    const marketRisk = Math.max(0, Math.min(100, Number(base.marketRisk)||0));
    const dataRisk = 100 - (window.calculateDataQuality ? calculateDataQuality(base) : 80);
    const overall = 0.25*waterRisk + 0.20*climateRisk + 0.25*salinityRisk + 0.20*marketRisk + 0.10*dataRisk;
    return {overall, waterRisk, climateRisk, salinityRisk, marketRisk, dataRisk};
  }
  window.calculateRisk = calculateRisk;

  const oldCalculateSuitabilityFor = window.calculateSuitabilityFor;
  window.calculateSuitabilityFor = function(gov, baseInput){
    const base = Object.assign({}, baseInput || getInput(), {et0:gov.et0, rain:gov.rain, peffFraction:gov.peffFraction, alpha:gov.alpha});
    const r = compute(base);
    const legacy = oldCalculateSuitabilityFor ? oldCalculateSuitabilityFor(gov, baseInput) : {score:70, components:[]};
    const risk = calculateRisk(base, r);
    const econScore = Math.max(0, Math.min(100, 50 + (r.profitPerM3||0)/2));
    const soilScore = r.soilScore || 70;
    const riskScore = Math.max(0, 100-risk.overall);
    const legacyScore = Number(legacy.score)||70;
    const score = legacyScore*0.55 + econScore*0.15 + soilScore*0.15 + riskScore*0.15;
    const components = [
      {name: currentLang === 'ar' ? 'الملاءمة المائية الأساسية' : 'Core water suitability', score:legacyScore, weight:0.55},
      {name: currentLang === 'ar' ? 'العائد الاقتصادي لكل م³' : 'Economic return per m³', score:econScore, weight:0.15},
      {name: currentLang === 'ar' ? 'ملاءمة التربة والملوحة' : 'Soil & salinity suitability', score:soilScore, weight:0.15},
      {name: currentLang === 'ar' ? 'انخفاض المخاطر' : 'Low risk score', score:riskScore, weight:0.15}
    ];
    return {score, components, result:r, risk};
  };

  function renderEconomicRisk(){
    const base = getInput(); const r = compute(base); const risk = calculateRisk(base,r);
    const card = (label,val,unit='') => `<div class="metric-card"><div class="m-label">${label}</div><div class="m-value">${safeFmt(val, val>1000?0:2)}</div><div class="overview-hint">${unit}</div></div>`;
    const economicCards = document.getElementById('economicCards');
    if(economicCards){ economicCards.innerHTML = [
      card(T('إجمالي العائد','Revenue'), r.revenue, 'EGP'),
      card(T('صافي الربح','Net profit'), r.netProfit, 'EGP'),
      card(T('الربح لكل م³','Profit per m³'), r.profitPerM3, 'EGP/m³'),
      card(T('العائد لكل م³','Revenue per m³'), r.revenuePerM3, 'EGP/m³'),
      card(T('تكلفة الطن','Cost per ton'), r.costPerTon, 'EGP/ton'),
      card('Water cost per ton', r.waterCostPerTon, 'EGP/ton')
    ].join(''); }
    const economicRows = document.getElementById('economicRows');
    if(economicRows){ economicRows.innerHTML = [
      ['Expected production', `${safeFmt(r.productionTon,2)} ton`],['Gross irrigation volume', `${safeFmt(r.grossIrrigationVolume,0)} m³`],['Base cost', `${safeFmt(r.baseCost,0)} EGP`],['Water cost', `${safeFmt(r.waterCostTotal,0)} EGP`],['Total cost', `${safeFmt(r.totalCost,0)} EGP`],['Economic water productivity', `${safeFmt(r.revenuePerM3,2)} EGP/m³`]
    ].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td></tr>`).join(''); }
    const riskCards = document.getElementById('riskCards');
    if(riskCards){ riskCards.innerHTML = [card(T('المخاطر الكلية','Overall risk'), risk.overall, '/100'), card(T('ملاءمة التربة','Soil score'), r.soilScore, '/100'), card(T('تعديل الإنتاجية','Yield adjustment'), (r.yieldAdjustmentFactor||1)*100, '%')].join(''); }
    const riskRows = document.getElementById('riskRows');
    if(riskRows){
      const interp = x => x>=70?T('مرتفع','High'):x>=40?T('متوسط','Moderate'):T('منخفض','Low');
      riskRows.innerHTML = [
        ['Water risk', risk.waterRisk], ['Climate risk', risk.climateRisk], ['Salinity/drainage risk', risk.salinityRisk], ['Market risk', risk.marketRisk], ['Data uncertainty risk', risk.dataRisk]
      ].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${safeFmt(x[1],1)}</td><td>${interp(x[1])}</td></tr>`).join('');
    }
    const rec = document.getElementById('enhancedRecommendation');
    if(rec){
      rec.innerHTML = risk.overall<35 && r.profitPerM3>0 ? T('✅ توصية متقدمة: السيناريو جيد مائيًا واقتصاديًا ومخاطره منخفضة نسبيًا.','✅ Advanced recommendation: the scenario is good in water and economic terms with relatively low risk.') : risk.overall<60 ? T('⚠️ توصية متقدمة: السيناريو متوسط؛ راجع الملوحة/التكاليف/طريقة الري قبل القرار النهائي.','⚠️ Advanced recommendation: the scenario is moderate; review salinity, costs and irrigation method before the final decision.') : T('🚫 توصية متقدمة: المخاطر مرتفعة؛ يفضل تعديل المحصول أو المحافظة أو طريقة الري أو تحسين التربة والإدارة.','🚫 Advanced recommendation: risk is high; consider changing the crop, governorate or irrigation method, or improving soil and management.');
    }
    const ybar = document.getElementById('yieldAdjustmentBar'); if(ybar){ ybar.style.width = `${Math.max(0,Math.min(115,(r.yieldAdjustmentFactor||1)*100))}%`; }
    const ynote = document.getElementById('yieldAdjustmentNote'); if(ynote){ ynote.innerHTML = `Adjusted yield factor = <strong>${safeFmt((r.yieldAdjustmentFactor||1)*100,1)}%</strong>. Original yield = <strong>${safeFmt(r.originalYield,2)}</strong> ton/ha; adjusted yield = <strong>${safeFmt(r.adjustedYield,2)}</strong> ton/ha. Soil score = <strong>${safeFmt(r.soilScore,1)}/100</strong>.`; }
    renderSourceConfidenceAndLimitations();
    const audit = document.getElementById('methodologyAuditRows');
    if(audit){
      audit.innerHTML = [
        ['Calculation mode', base.dataMode], ['Governorate', (currentLang==='ar'?(selectedGov().arabic||selectedGov().governorate):selectedGov().governorate)], ['Crop/product', `${currentLang==='ar'?(base.cropArabic||base.cropName):base.cropName} — ${enC(base.productName)}`], ['Kc method', base.useStageKc ? `Stage-based, weighted Kc = ${safeFmt(base.stageKcWeighted,2)}, days = ${safeFmt(base.stageDaysTotal,0)}` : `Single Kc = ${safeFmt(base.kc,2)}`], ['Yield adjustment', `${safeFmt((r.yieldAdjustmentFactor||1)*100,1)}%`], ['Data quality score', `${safeFmt(calculateDataQuality(base),0)}/100`], ['Risk score', `${safeFmt(risk.overall,1)}/100`], ['Source', `${enC(currentCrop().dataType)||'-'} — ${currentCrop().source||'-'}`]
      ].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td></tr>`).join('');
    }
  }
  window.renderEconomicRisk = renderEconomicRisk;

  window.exportFullScenarioJSON = function(){
    const base=getInput(), r=compute(base), risk=calculateRisk(base,r), suitability=calculateSuitabilityFor(selectedGov(),base);
    const payload={createdAt:new Date().toISOString(), tool:'Water Footprint Decision Tool — Enhanced Validation and Scenario Edition', input:base, result:r, risk, suitability, governorate:selectedGov(), crop:currentCrop()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='water_footprint_full_scenario.json'; a.click(); URL.revokeObjectURL(url);
  };

  window.openScientificReport = function(){
    const base=getInput(), r=compute(base), risk=calculateRisk(base,r), suitability=calculateSuitabilityFor(selectedGov(),base);
    const g=selectedGov(), crop=currentCrop();
    const reportHtml=`<!doctype html><html><head><meta charset="utf-8"><title>Enhanced Scientific Report</title><style>body{font-family:Arial,Tahoma,sans-serif;line-height:1.65;padding:28px;color:#0f172a}h1,h2{color:#0f766e}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#0f766e;color:white}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.box{border:1px solid #cbd5e1;border-radius:12px;padding:10px;background:#f8fafc}@media print{button{display:none}.grid{grid-template-columns:repeat(3,1fr)}}</style>
<style id="advanced-geo-map-style-v2">
  .map-wrap.advanced-geo-ready{position:relative;min-height:620px;background:linear-gradient(180deg,#f8fbff 0%,#eefbf7 100%);}
  .egypt-map.geo-map-upgraded{height:590px;background:radial-gradient(circle at 50% 12%,rgba(191,219,254,.55),transparent 35%),linear-gradient(180deg,#f9fdff,#f0fff9);border-radius:20px;touch-action:none;}
  .geo-map-ui{position:absolute;inset:26px 26px auto auto;display:flex;flex-direction:column;gap:8px;z-index:7}
  .geo-btn{width:42px;height:42px;border:none;border-radius:14px;background:rgba(255,255,255,.94);box-shadow:0 10px 30px rgba(2,8,23,.13);font-size:22px;font-weight:950;color:#0f172a;cursor:pointer;backdrop-filter:blur(8px)}
  .geo-btn:hover{transform:translateY(-1px);box-shadow:0 12px 34px rgba(2,8,23,.18)}
  .geo-reset{font-size:12px;height:auto;padding:10px 8px;line-height:1.1}
  .geo-map-tooltip{position:absolute;z-index:12;min-width:230px;max-width:310px;background:rgba(255,255,255,.97);border:1px solid rgba(148,163,184,.48);border-radius:17px;box-shadow:0 20px 52px rgba(15,23,42,.19);padding:12px 14px;pointer-events:none;opacity:0;transform:translateY(6px);transition:opacity .14s ease,transform .14s ease;backdrop-filter:blur(9px)}
  .geo-map-tooltip.show{opacity:1;transform:translateY(0)}
  .geo-map-tooltip .tt-title{font-weight:950;font-size:15px;color:#0f172a;margin-bottom:5px}
  .geo-map-tooltip .tt-sub{font-size:12px;color:#475569;margin-bottom:8px}
  .geo-map-tooltip .tt-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;padding:3px 0;color:#1e293b}
  .geo-map-tooltip .tt-row span:last-child{font-weight:850}
  .geo-map-tooltip .tt-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:950;color:#fff}
  .geo-map-tooltip .tt-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.95)}
  .geo-map-upgraded .map-sea{fill:#d9f1ff}
  .geo-map-upgraded .map-land-bg{fill:#f0fdf4;stroke:#94a3b8;stroke-width:2.4}
  .geo-map-upgraded .map-country-stroke{fill:none;stroke:#ffffff;stroke-width:1.5;opacity:.9}
  .geo-map-upgraded .map-waterway{fill:none;stroke:#38bdf8;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:.7;pointer-events:none}
  .geo-map-upgraded .map-waterway.branch{stroke:#7dd3fc;stroke-width:4.8;opacity:.85}
  .geo-map-upgraded .map-lake{fill:#93c5fd;opacity:.95;pointer-events:none}
  .geo-map-upgraded .gov-feature{cursor:pointer;stroke:#fff;stroke-width:1.7;vector-effect:non-scaling-stroke;transition:filter .15s ease,opacity .15s ease}
  .geo-map-upgraded .gov-feature:hover{filter:brightness(1.06) drop-shadow(0 5px 18px rgba(2,6,23,.18))}
  .geo-map-upgraded .gov-feature.selected{stroke:#082f49;stroke-width:3.1}
  .geo-map-upgraded .gov-label{font-size:10px;font-weight:950;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round;pointer-events:none}
  .geo-map-upgraded .gov-label.small{font-size:8px}
  .geo-map-upgraded .map-heading{font-size:18px;font-weight:950;fill:#0f172a}
  .geo-map-upgraded .map-subheading{font-size:11px;font-weight:750;fill:#64748b}
  .geo-map-upgraded .water-label{font-size:12px;font-weight:950;fill:#0369a1;opacity:.95;pointer-events:none}
  .geo-map-upgraded .zoom-indicator{font-size:11px;font-weight:850;fill:#334155}
</style>
</head><body><button onclick="window.print()">Print / Save PDF</button><h1>Nature Water-Ready Water Footprint Scientific Report</h1><p><strong>Scope note:</strong> Egypt governorate outputs use the embedded Egypt dataset; international country outputs are optional manual-input scenarios and require external documentation before publication.</p><p><strong>Governorate:</strong> ${g.arabic||g.governorate} | <strong>Crop:</strong> ${crop.arabic||crop.crop} | <strong>Product:</strong> ${base.productName}</p><div class="grid"><div class="box"><strong>Total applied WF</strong><br>${safeFmt(r.totalWF,1)} m³/ton</div><div class="box"><strong>Suitability</strong><br>${safeFmt(suitability.score,0)}/100</div><div class="box"><strong>Risk</strong><br>${safeFmt(risk.overall,1)}/100</div><div class="box"><strong>Profit/m³</strong><br>${safeFmt(r.profitPerM3,2)} EGP/m³</div><div class="box"><strong>Adjusted yield</strong><br>${safeFmt(r.adjustedYield,2)} ton/ha</div><div class="box"><strong>GIR</strong><br>${safeFmt(r.gir,1)} mm</div></div><h2>Water footprint</h2><table><tr><th>Metric</th><th>Value</th></tr>${[['Green WF',r.greenWF],['Net Blue WF',r.netBlueWF],['Gross Blue WF',r.blueWF],['Grey WF',r.greyWF],['Total applied WF',r.totalWF]].map(x=>`<tr><td>${x[0]}</td><td>${safeFmt(x[1],1)} m³/ton</td></tr>`).join('')}</table><h2>Economic analysis</h2><table><tr><th>Metric</th><th>Value</th></tr>${[['Revenue',r.revenue],['Total cost',r.totalCost],['Net profit',r.netProfit],['Revenue per m³',r.revenuePerM3],['Profit per m³',r.profitPerM3],['Cost per ton',r.costPerTon]].map(x=>`<tr><td>${x[0]}</td><td>${safeFmt(x[1],2)}</td></tr>`).join('')}</table><h2>Risk analysis</h2><table><tr><th>Risk factor</th><th>Score</th></tr>${[['Water',risk.waterRisk],['Climate',risk.climateRisk],['Salinity/drainage',risk.salinityRisk],['Market',risk.marketRisk],['Data uncertainty',risk.dataRisk],['Overall',risk.overall]].map(x=>`<tr><td>${x[0]}</td><td>${safeFmt(x[1],1)}/100</td></tr>`).join('')}</table><h2>Methodology</h2><p>ETc is calculated either by a single Kc or by stage-based Kc. Yield is adjusted by soil texture, salinity, water salinity, pH, drainage, and management. Total applied WF is an additional field-application indicator based on irrigation-efficiency-adjusted gross blue water; it is not a replacement for the standard WFN green-blue-grey WF definition. Economic water productivity links revenue and profit to gross irrigation water volume.</p><h2>Source confidence</h2><table><tr><th>Layer</th><th>Source</th><th>Confidence</th></tr>${sourceConfidenceMatrix().map(x=>`<tr><td>${x.layer}</td><td>${x.source}</td><td>${x.confidence}</td></tr>`).join('')}</table><h2>Limitations</h2><p>This report is a decision-support estimate prepared for transparent screening and reproducible scenario comparison. Final recommendations require local validation of ETo, rainfall, yield, Kc, soil salinity, water salinity, costs, and market prices. Non-administrative agricultural zones are planning-screening units only. The 80-country page is an optional manual-input extension, not a validated global country database.</p></body></html>`;
    const w=window.open('','_blank'); w.document.write(reportHtml); w.document.close();
  };

  window.update = function(){
    if(oldUpdate) oldUpdate();
    renderEconomicRisk();
  };



  function sourceConfidenceMatrix(){
    const crop = currentCrop() || {};
    return [
      {layer:'Governorate ETo', source:'Embedded 10-year ETo governorate dataset', period:'2016–2025', confidence:'High', use:'ETc and climate ranking'},
      {layer:'Rainfall / Peff', source:'Regional default or manual station value', period:'Editable', confidence:'Medium/Low', use:'Green/blue split'},
      {layer:'Crop/product yield', source:(crop.source||'Crop-product database'), period:(crop.dataType||'Official / indicative mix'), confidence:(String(crop.dataType||'').includes('رسمي')||String(crop.dataType||'').toLowerCase().includes('official'))?'High':'Medium', use:'Water footprint denominator'},
      {layer:'Kc', source:'Single Kc or user-defined stage Kc', period:'User/model assumption', confidence:document.getElementById('useStageKc')?.checked?'Medium/High':'Medium', use:'ETc calculation'},
      {layer:'Soil & salinity factors', source:'Rule-based agronomic penalty model', period:'Field input required', confidence:'Medium', use:'Yield adjustment and risk'},
      {layer:'Economic prices/costs', source:'User input', period:'Current market dependent', confidence:'Low/Medium', use:'Profit and EGP/m³'},
      {layer:'Arable land capacity', source:'CAPMAS table embedded where available', period:'2015 table basis', confidence:'Medium', use:'Optimal allocation capacity'}
    ];
  }

  function renderSourceConfidenceAndLimitations(){
    const sc=document.getElementById('sourceConfidenceRows');
    if(sc){ sc.innerHTML = sourceConfidenceMatrix().map(r=>`<tr><td><strong>${r.layer}</strong></td><td>${r.source}</td><td>${r.period}</td><td>${r.confidence}</td><td>${r.use}</td></tr>`).join(''); }
    const vc=document.getElementById('validationChecklistRows');
    if(vc){
      const rows=[
        ['ETo validation','Compare selected governorate ETo with nearest agrometeorological station or FAO/CROPWAT input','Required before final planning'],
        ['Rainfall validation','Replace regional rainfall with local station or farm rain gauge','Strongly recommended'],
        ['Yield validation','Compare selected product yield with MALR/CAPMAS/local farm records','Required for publication'],
        ['Kc validation','Use FAO-56 or local crop-stage Kc values for the same crop and season','Recommended'],
        ['Soil/water quality','Use laboratory ECe, ECw, pH and drainage observations','Required for farm decision'],
        ['Economic validation','Update market price, production cost, and water cost at analysis date','Required for investment decisions'],
        ['Model validation','Compare outputs with at least 3–5 field cases or CROPWAT/AquaCrop outputs','Required for scientific publication'],
        ['Open reproducibility','Archived code, input data, exported scenarios and figure data with persistent DOI: https://doi.org/10.5281/zenodo.20574912','Required for Nature Portfolio submission']
      ];
      vc.innerHTML=rows.map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
    }
  }

  function scenarioPayload(){
    const base=getInput(), r=compute(base), risk=calculateRisk(base,r), suitability=calculateSuitabilityFor(selectedGov(),base);
    let advanced={};
    try{ advanced = window.collectAdvancedExport ? collectAdvancedExport(base,r) : {}; }catch(e){ advanced={}; }
    return {
      createdAt:new Date().toISOString(),
      tool:'Water Footprint Decision Tool — Enhanced Validation and Scenario Edition Plus',
      version:'2026-05-25-plus',
      selections:{
        language:document.getElementById('languageSelect')?.value,
        governorate:document.getElementById('govSelect')?.value,
        crop:document.getElementById('cropSelect')?.value,
        productIndex:document.getElementById('productSelect')?.value,
        method:document.getElementById('methodSelect')?.value,
        calculationMode:document.getElementById('dataMode')?.value
      },
      input:base,
      result:r,
      risk,
      suitability,
      governorate:selectedGov(),
      crop:currentCrop(),
      sourceConfidence:sourceConfidenceMatrix(),
      advanced
    };
  }

  function setScenarioStatus(msg){ const el=document.getElementById('scenarioStatusBox'); if(el) el.innerHTML = msg; }

  function applyScenarioPayload(payload){
    if(!payload) return;
    const sel=payload.selections||{}; const input=payload.input||{};
    const set=(id,val)=>{ const el=document.getElementById(id); if(el && val!==undefined && val!==null){ el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); }};
    if(sel.language) set('languageSelect', sel.language);
    if(sel.governorate) set('govSelect', sel.governorate);
    if(sel.crop){ set('cropSelect', sel.crop); if(window.updateProductOptions) updateProductOptions(sel.productIndex ?? '0'); }
    if(sel.productIndex!==undefined) set('productSelect', sel.productIndex);
    if(sel.method) set('methodSelect', sel.method);
    if(sel.calculationMode) set('dataMode', sel.calculationMode);
    const numericMap={rain:'rainInput', ea:'eaInput', et0:'et0Input', annualETo:'annualEToInput', kc:'kcInput', yield:'yieldInput', days:'daysInput', manualPeff:'manualPeff', manualETc:'manualETc', manualETBlue:'manualETBlue', manualAppliedWater:'manualAppliedWater', manualProduction:'manualProduction', areaFeddan:'areaInput', targetProductionDemand:'targetProductionDemand', availableWaterDemand:'availableWaterDemand', planningSafetyMargin:'planningSafetyMargin', nitrogen:'nitrogenInput', cmax:'cmaxInput', cnat:'cnatInput', price:'priceInput', costFeddan:'costFeddanInput', waterCost:'waterCostInput', marketRisk:'marketRiskInput', multiCropTargetArea:'multiCropTargetArea', multiCropAvailableWater:'multiCropAvailableWater', minSuitabilityAllocation:'minSuitabilityAllocation', maxAllocationOptions:'maxAllocationOptions', soilECe:'soilECeInput', waterECw:'waterECInput', soilPH:'soilPHInput'};
    Object.entries(numericMap).forEach(([k,id])=>{ if(input[k]!==undefined) set(id,input[k]); });
    if(input.peffMode) set('peffMode',input.peffMode);
    if(input.rainScenario) set('rainScenario',input.rainScenario);
    if(input.demandTargetType) set('demandTargetType',input.demandTargetType);
    if(input.dataSourceType) set('dataSourceType',input.dataSourceType);
    if(input.soilTexture) set('soilTextureSelect',input.soilTexture);
    if(input.drainage) set('drainageSelect',input.drainage);
    if(input.management) set('managementSelect',input.management);
    if(input.useStageKc!==undefined){ const el=document.getElementById('useStageKc'); if(el) el.checked=!!input.useStageKc; }
    if(Array.isArray(input.kcStages)){
      const ids=[['kcIniInput','daysIniInput'],['kcDevInput','daysDevInput'],['kcMidInput','daysMidInput'],['kcLateInput','daysLateInput']];
      input.kcStages.slice(0,4).forEach((s,i)=>{ set(ids[i][0],s.kc); set(ids[i][1],s.days); });
    }
    try{ if(window.updateCalculationModeUI) updateCalculationModeUI(); if(window.syncCropDefaultInputs && !sel.calculationMode?.includes('manual')) syncCropDefaultInputs(); }catch(e){}
    try{ window.update(); }catch(e){ console.warn(e); }
    setScenarioStatus(`✅ Scenario loaded: <strong>${payload.createdAt||'unknown date'}</strong>`);
  }

  window.exportFullScenarioJSON = function(){
    const payload=scenarioPayload();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='water_footprint_full_scenario_plus.json'; a.click(); URL.revokeObjectURL(url);
    setScenarioStatus('✅ JSON scenario exported.');
  };

  window.saveScenarioToBrowser = function(){
    localStorage.setItem('wf_plus_last_scenario', JSON.stringify(scenarioPayload()));
    setScenarioStatus('✅ Scenario saved in this browser.');
  };
  window.loadScenarioFromBrowser = function(){
    const raw=localStorage.getItem('wf_plus_last_scenario');
    if(!raw){ setScenarioStatus('⚠️ No saved scenario found in this browser.'); return; }
    try{ applyScenarioPayload(JSON.parse(raw)); }catch(e){ setScenarioStatus('⚠️ Saved scenario could not be loaded.'); }
  };
  window.importScenarioJSON = function(){ document.getElementById('scenarioImportInput')?.click(); };
  function handleScenarioFile(evt){
    const file=evt.target.files && evt.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ try{ applyScenarioPayload(JSON.parse(reader.result)); }catch(e){ setScenarioStatus('⚠️ Invalid JSON scenario file.'); } };
    reader.readAsText(file,'utf-8');
    evt.target.value='';
  }

  function objectRows(obj){ return Object.entries(obj||{}).filter(([k,v])=>typeof v!=='object' || v===null).map(([key,value])=>({key,value})); }
  function exportExcelWorkbook(){
    const payload=scenarioPayload();
    const base=payload.input, r=payload.result, risk=payload.risk;
    const wb = (window.XLSX && XLSX.utils && XLSX.utils.book_new) ? XLSX.utils.book_new() : null;
    if(!wb){
      const rows=[...objectRows(base),...objectRows(r),...objectRows(risk)];
      downloadCSV(rows,'water_footprint_enhanced_plus_export.csv');
      setScenarioStatus('⚠️ XLSX library unavailable; exported CSV fallback.'); return;
    }
    const add=(name, rows)=>{ const ws=XLSX.utils.json_to_sheet(rows && rows.length?rows:[{note:'No data'}]); XLSX.utils.book_append_sheet(wb,ws,name.substring(0,31)); };
    add('Summary',[{
      createdAt:payload.createdAt, governorate:payload.selections.governorate, crop:payload.selections.crop, productIndex:payload.selections.productIndex, method:payload.selections.method,
      totalWF:r.totalWF, greenWF:r.greenWF, grossBlueWF:r.blueWF, greyWF:r.greyWF, suitability:payload.suitability.score, risk:risk.overall, adjustedYield:r.adjustedYield, productionTon:r.productionTon, profitPerM3:r.profitPerM3, revenuePerM3:r.revenuePerM3
    }]);
    add('Inputs', objectRows(base));
    add('Results', objectRows(r));
    add('Risk', objectRows(risk));
    add('SourceConfidence', payload.sourceConfidence);
    try{ add('CropRanking', renderCropRanking(base).slice(0,60)); }catch(e){ add('CropRanking',[]); }
    try{ add('GovRanking', renderGovernorateRanking(base).slice(0,27)); }catch(e){ add('GovRanking',[]); }
    try{ add('CropAllocation', renderCropAreaAllocation().slice(0,80)); }catch(e){ add('CropAllocation',[]); }
    try{ add('ClimateScenarios', buildClimateScenarios(base,r)); }catch(e){ add('ClimateScenarios',[]); }
    try{ add('Sensitivity', buildSensitivity(base,r)); }catch(e){ add('Sensitivity',[]); }
    XLSX.writeFile(wb,'water_footprint_research_grade_plus.xlsx');
    setScenarioStatus('✅ Excel workbook exported.');
  }
  window.exportExcelWorkbook = exportExcelWorkbook;

  function attachEnhancementEvents(){
    document.querySelectorAll('#kcStagesPanel input,#soilPanel input,#soilPanel select,#economicsRisk input,#demandPlannerPanel input,#demandPlannerPanel select,#cropAllocationPanel input,#cropAllocationPanel select').forEach(el=>el.addEventListener('input',()=>window.update()));
    const applyDemandArea=document.getElementById('applyDemandAreaBtn');
    if(applyDemandArea && !applyDemandArea.dataset.bound){
      applyDemandArea.dataset.bound='1';
      applyDemandArea.addEventListener('click',()=>{
        const base=getInput(), r=compute(base), d=computeDemandPlanning(base,r);
        const areaEl=document.getElementById('areaInput');
        if(areaEl){ areaEl.value = Math.max(0,d.selectedArea || d.areaForProduction || 0).toFixed(2); window.update(); }
      });
    }
    ['exportFullJSONBtn','exportFullJSONBtn2'].forEach(id=>{ const exp=document.getElementById(id); if(exp) exp.addEventListener('click', window.exportFullScenarioJSON); });
    ['exportExcelWorkbookBtn','exportExcelWorkbookBtn2','exportExcelWorkbookBtn3'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click', window.exportExcelWorkbook); });
    ['saveScenarioBrowserBtn','saveScenarioBrowserBtn2','saveScenarioBrowserBtn3'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click', window.saveScenarioToBrowser); });
    ['loadScenarioBrowserBtn','loadScenarioBrowserBtn2','loadScenarioBrowserBtn3'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click', window.loadScenarioFromBrowser); });
    ['importScenarioBtn','importScenarioBtn2'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click', window.importScenarioJSON); });
    const imp=document.getElementById('scenarioImportInput'); if(imp) imp.addEventListener('change', handleScenarioFile);

    const exportCropAllocationBtn=document.getElementById('exportCropAllocation');
    if(exportCropAllocationBtn && !exportCropAllocationBtn.dataset.bound){
      exportCropAllocationBtn.dataset.bound='1';
      exportCropAllocationBtn.addEventListener('click', exportCropAllocationCSV);
    }

    // Attach tab switching to newly inserted tabs as a safety net
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if(btn.dataset.enhancedBound) return;
      btn.dataset.enhancedBound='1';
      btn.addEventListener('click', () => {
        if(window.requireDeveloperAccess && !requireDeveloperAccess(btn.dataset.tab)) return;
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-section').forEach(s=>s.classList.add('hidden'));
        const sec=document.getElementById(btn.dataset.tab); if(sec) sec.classList.remove('hidden');
        setTimeout(()=>{ try{ if(window.barChart) barChart.resize(); }catch(e){} },50);
      });
    });
  }

  attachEnhancementEvents();
  try{ window.update(); }catch(e){ console.warn('Enhanced update failed', e); }
})();


// ===== advanced-geo-map-script-v2 =====
(function(){
  const MAP_NS = 'http://www.w3.org/2000/svg';
  const GEO_VIEW = {w:1000,h:700};
  const geoFeatures = [
    {name:'Matrouh', arabic:'مطروح', coords:[[24.7,31.6],[28.5,31.6],[29.4,31.15],[28.85,29.5],[26.4,29.35],[24.85,29.9]]},
    {name:'Alexandria', arabic:'الإسكندرية', coords:[[29.55,31.36],[30.12,31.36],[30.12,31.02],[29.55,31.02]]},
    {name:'Beheira', arabic:'البحيرة', coords:[[29.25,31.28],[30.72,31.28],[31.05,30.52],[30.48,30.02],[29.55,30.02],[29.18,30.48]]},
    {name:'Kafr El Sheikh', arabic:'كفر الشيخ', coords:[[30.22,31.58],[31.1,31.58],[31.2,31.08],[30.32,31.0]]},
    {name:'Gharbia', arabic:'الغربية', coords:[[30.52,31.05],[31.36,31.05],[31.42,30.62],[30.6,30.58]]},
    {name:'Menofia', arabic:'المنوفية', coords:[[30.25,30.95],[30.96,30.95],[31.0,30.42],[30.18,30.38]]},
    {name:'Dakahlia', arabic:'الدقهلية', coords:[[31.08,31.48],[31.95,31.48],[32.18,31.03],[31.28,30.84]]},
    {name:'Damietta', arabic:'دمياط', coords:[[31.65,31.6],[32.28,31.6],[32.25,31.2],[31.7,31.2]]},
    {name:'Port Said', arabic:'بورسعيد', coords:[[32.15,31.38],[32.58,31.38],[32.58,31.02],[32.15,31.02]]},
    {name:'Sharkia', arabic:'الشرقية', coords:[[31.06,30.98],[32.03,30.98],[32.1,30.35],[31.18,30.28]]},
    {name:'Qaliubiya', arabic:'القليوبية', coords:[[30.9,30.62],[31.43,30.62],[31.48,30.12],[30.95,30.08]]},
    {name:'Cairo', arabic:'القاهرة', coords:[[31.14,30.2],[31.4,30.2],[31.39,29.98],[31.16,29.98]]},
    {name:'Giza', arabic:'الجيزة', coords:[[30.72,30.24],[31.16,30.24],[31.12,29.72],[30.68,29.72],[30.55,30.0]]},
    {name:'Fayoum', arabic:'الفيوم', coords:[[30.34,29.72],[30.96,29.72],[30.96,29.18],[30.3,29.18]]},
    {name:'Beni Suef', arabic:'بني سويف', coords:[[30.8,29.72],[31.35,29.72],[31.31,29.08],[30.84,29.08]]},
    {name:'Minya', arabic:'المنيا', coords:[[30.72,29.1],[31.48,29.1],[31.38,27.95],[30.76,27.95]]},
    {name:'Assiut', arabic:'أسيوط', coords:[[30.82,27.95],[31.58,27.95],[31.46,27.12],[30.92,27.12]]},
    {name:'Sohag', arabic:'سوهاج', coords:[[30.96,27.12],[31.74,27.12],[31.62,26.42],[31.02,26.42]]},
    {name:'Qena', arabic:'قنا', coords:[[31.1,26.42],[32.06,26.42],[32.16,25.82],[31.2,25.82]]},
    {name:'Luxor', arabic:'الأقصر', coords:[[31.34,25.82],[32.2,25.82],[32.16,25.32],[31.42,25.32]]},
    {name:'Aswan', arabic:'أسوان', coords:[[31.0,25.32],[33.08,25.32],[33.2,22.1],[31.18,22.1]]},
    {name:'Ismailia', arabic:'الإسماعيلية', coords:[[32.0,30.95],[32.66,30.95],[32.72,30.16],[32.1,30.12]]},
    {name:'Suez', arabic:'السويس', coords:[[32.38,30.28],[32.9,30.28],[32.92,29.68],[32.44,29.68]]},
    {name:'North Sinai', arabic:'شمال سيناء', coords:[[32.5,31.36],[34.9,31.36],[34.86,30.1],[32.88,30.02],[32.54,30.48]]},
    {name:'South Sinai', arabic:'جنوب سيناء', coords:[[32.72,30.12],[34.72,29.42],[34.88,27.8],[34.38,26.98],[34.15,26.15],[33.55,26.08],[32.92,27.28],[32.52,28.28],[32.56,29.55]]},
    {name:'New Valley', arabic:'الوادي الجديد', coords:[[24.8,28.82],[30.8,28.82],[30.64,27.12],[30.88,25.18],[30.8,23.32],[29.38,21.9],[26.02,21.95],[24.82,23.96],[24.54,26.75]]},
    {name:'Red Sea', arabic:'البحر الأحمر', coords:[[33.0,29.86],[34.6,29.62],[35.42,27.82],[36.1,24.96],[36.46,23.02],[36.18,22.02],[34.02,22.02],[33.12,23.92],[32.92,26.04],[32.82,28.4]]}
  ];
  window.egyptGovernoratesGeoJSON = {type:'FeatureCollection', features: geoFeatures.map(f=>({type:'Feature', properties:{name_en:f.name,name_ar:f.arabic}, geometry:{type:'Polygon', coordinates:[[...f.coords, f.coords[0]]]}}))};
  let zoomState={scale:1,tx:0,ty:0}, dragState=null;
  function $(id){return document.getElementById(id);}
  function getGov(name){ return (window.governorates||[]).find(g=>g.governorate===name); }
  const allPts=[]; geoFeatures.forEach(f=>f.coords.forEach(p=>allPts.push(p)));
  const xs=allPts.map(p=>p[0]), ys=allPts.map(p=>p[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const scale=Math.min((GEO_VIEW.w-92)/(maxX-minX),(GEO_VIEW.h-92)/(maxY-minY));
  const extraX=(GEO_VIEW.w-(maxX-minX)*scale)/2, extraY=(GEO_VIEW.h-(maxY-minY)*scale)/2;
  function project(p){return [extraX+(p[0]-minX)*scale, GEO_VIEW.h-(extraY+(p[1]-minY)*scale)];}
  function pathFromCoords(coords){return coords.map((p,i)=>{const q=project(p);return (i?'L':'M')+' '+q[0].toFixed(2)+' '+q[1].toFixed(2);}).join(' ')+' Z';}
  function centroid(coords){const pts=coords.map(project);let x=0,y=0;pts.forEach(p=>{x+=p[0];y+=p[1];});return [x/pts.length,y/pts.length];}
  function lang(){return window.currentLang || 'ar';}
  function fnum(x,d){return window.fmt?window.fmt(x,d):Number(x||0).toFixed(d||0);}
  function getCropLabel(){try{const c=window.selectedCrop?window.selectedCrop():null;return c?(lang()==='ar'&&(c.arabic||c.crop_ar)?(c.arabic||c.crop_ar):c.crop):'—';}catch(e){return '—';}}
  function scoreColorSafe(s){return window.scoreColor?window.scoreColor(s):(s>=75?'#16a34a':s>=55?'#f59e0b':'#dc2626');}
  function scoreClassLocal(s){return s>=75?(lang()==='ar'?'مرتفعة':'High'):s>=55?(lang()==='ar'?'متوسطة':'Moderate'):(lang()==='ar'?'منخفضة':'Low');}
  function ensureUI(){const wrap=document.querySelector('.map-wrap');if(!wrap)return null;wrap.classList.add('advanced-geo-ready');let ui=wrap.querySelector('.geo-map-ui');if(!ui){ui=document.createElement('div');ui.className='geo-map-ui';ui.innerHTML='<button type="button" class="geo-btn" data-map-zoom="in">+</button><button type="button" class="geo-btn" data-map-zoom="out">−</button><button type="button" class="geo-btn geo-reset" data-map-zoom="reset">100%</button>';wrap.appendChild(ui);ui.addEventListener('click',e=>{const b=e.target.closest('[data-map-zoom]');if(!b)return;const a=b.getAttribute('data-map-zoom');if(a==='in')setZoom(Math.min(6,zoomState.scale*1.25));else if(a==='out')setZoom(Math.max(1,zoomState.scale/1.25));else resetZoom();});}let tt=wrap.querySelector('.geo-map-tooltip');if(!tt){tt=document.createElement('div');tt.className='geo-map-tooltip';wrap.appendChild(tt);}return {wrap,tt};}
  function tooltipHTML(g,metric){const arable=Number(g&&g.arableTotalFeddan||0);const color=scoreColorSafe(metric.score);return '<div class="tt-title">'+(lang()==='ar'?(g.arabic||g.governorate):g.governorate)+'</div><div class="tt-sub">'+(lang()==='ar'?'المحصول المختار':'Selected crop')+': <strong>'+getCropLabel()+'</strong></div><div style="margin-bottom:8px"><span class="tt-badge" style="background:'+color+'"><span class="tt-dot"></span>'+scoreClassLocal(metric.score)+'</span></div><div class="tt-row"><span>'+(lang()==='ar'?'درجة الملاءمة':'Suitability score')+'</span><span>'+fnum(metric.score,1)+'/100</span></div><div class="tt-row"><span>'+(lang()==='ar'?'إجمالي البصمة':'Total applied WF')+'</span><span>'+fnum(metric.result.totalWF,1)+' m³/ton</span></div><div class="tt-row"><span>'+(lang()==='ar'?'احتياج الري الإجمالي':'GIR')+'</span><span>'+fnum(metric.result.gir,1)+' mm</span></div><div class="tt-row"><span>'+(lang()==='ar'?'المساحة القابلة للزراعة':'Arable land')+'</span><span>'+fnum(arable,0)+' '+(lang()==='ar'?'فدان':'fed')+'</span></div>';}
  function showTooltip(evt,name,base){const ui=ensureUI();if(!ui)return;const g=getGov(name);if(!g)return;const metric=window.calculateSuitabilityFor?window.calculateSuitabilityFor(g,base):{score:0,result:{totalWF:0,gir:0}};ui.tt.innerHTML=tooltipHTML(g,metric);const r=ui.wrap.getBoundingClientRect();ui.tt.style.left=Math.min(r.width-320,Math.max(12,evt.clientX-r.left+14))+'px';ui.tt.style.top=Math.min(r.height-180,Math.max(12,evt.clientY-r.top+14))+'px';ui.tt.classList.add('show');}
  function hideTooltip(){const ui=ensureUI();if(ui)ui.tt.classList.remove('show');}
  function applyViewport(){const vp=$('geoMapViewport'),zi=$('geoZoomIndicator');if(vp)vp.setAttribute('transform','translate('+zoomState.tx+' '+zoomState.ty+') scale('+zoomState.scale+')');if(zi)zi.textContent=Math.round(zoomState.scale*100)+'%';}
  function resetZoom(){zoomState={scale:1,tx:0,ty:0};applyViewport();}
  function setZoom(ns,cx=GEO_VIEW.w/2,cy=GEO_VIEW.h/2){ns=Math.max(1,Math.min(6,ns));const factor=ns/zoomState.scale;zoomState.tx=cx-factor*(cx-zoomState.tx);zoomState.ty=cy-factor*(cy-zoomState.ty);zoomState.scale=ns;applyViewport();}
  function bindPanZoom(svg){if(svg.dataset.geoBound==='1')return;svg.dataset.geoBound='1';svg.addEventListener('wheel',e=>{e.preventDefault();const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const local=pt.matrixTransform(ctm.inverse());setZoom(zoomState.scale*(e.deltaY<0?1.15:1/1.15),local.x,local.y);},{passive:false});svg.addEventListener('pointerdown',e=>{if(!e.target.closest('#geoMapViewport'))return;dragState={x:e.clientX,y:e.clientY,tx:zoomState.tx,ty:zoomState.ty};svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing';});svg.addEventListener('pointermove',e=>{if(dragState){zoomState.tx=dragState.tx+(e.clientX-dragState.x);zoomState.ty=dragState.ty+(e.clientY-dragState.y);applyViewport();}});const end=()=>{dragState=null;svg.style.cursor='default';};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('pointerleave',()=>{if(!dragState)hideTooltip();});svg.addEventListener('dblclick',e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const local=pt.matrixTransform(ctm.inverse());setZoom(zoomState.scale*1.35,local.x,local.y);});}
  function labelClass(name){return ['Cairo','Qaliubiya','Port Said','Damietta','Suez','Alexandria','Luxor'].includes(name)?'gov-label small':'gov-label';}
  function geoRender(base){const svg=$('egyptSuitabilityMap');if(!svg)return;ensureUI();svg.classList.add('geo-map-upgraded');svg.setAttribute('viewBox','0 0 '+GEO_VIEW.w+' '+GEO_VIEW.h);svg.innerHTML='<defs><filter id="geoShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.08"/></filter></defs><rect class="map-sea" x="0" y="0" width="1000" height="700" rx="24"></rect><path class="map-land-bg" filter="url(#geoShadow)" d="M 120 92 L 305 70 L 458 75 L 560 102 L 618 146 L 720 168 L 786 165 L 868 184 L 905 231 L 885 298 L 862 366 L 842 451 L 804 610 L 756 640 L 670 630 L 612 600 L 480 648 L 280 642 L 195 584 L 160 500 L 116 442 L 101 333 L 110 225 Z"></path><path class="map-country-stroke" d="M 120 92 L 305 70 L 458 75 L 560 102 L 618 146 L 720 168 L 786 165 L 868 184 L 905 231 L 885 298 L 862 366 L 842 451 L 804 610 L 756 640 L 670 630 L 612 600 L 480 648 L 280 642 L 195 584 L 160 500 L 116 442 L 101 333 L 110 225 Z"></path><path class="map-waterway" d="M 525 614 C 523 560, 523 508, 522 462 C 522 414, 523 365, 525 318 C 527 270, 530 223, 534 175"></path><path class="map-waterway branch" d="M 534 175 C 508 154, 474 142, 436 136"></path><path class="map-waterway branch" d="M 534 175 C 562 151, 598 142, 632 140"></path><ellipse class="map-lake" cx="526" cy="618" rx="32" ry="20"></ellipse><text class="map-heading" x="34" y="40">'+(lang()==='ar'?'خريطة ملاءمة المحافظات — SVG/GeoJSON تفاعلية':'Governorate Suitability Map — Interactive SVG/GeoJSON')+'</text><text class="map-subheading" x="34" y="58">'+(lang()==='ar'?'حدود أقرب للواقع، Tooltip احترافي، تكبير/تصغير وسحب':'More realistic boundaries, professional tooltip, zoom and pan')+'</text><text class="water-label" x="34" y="95">'+(lang()==='ar'?'البحر المتوسط':'Mediterranean Sea')+'</text><text class="water-label" x="830" y="415">'+(lang()==='ar'?'البحر الأحمر':'Red Sea')+'</text><text class="water-label" x="462" y="154">'+(lang()==='ar'?'دلتا النيل':'Nile Delta')+'</text><text class="water-label" x="550" y="338">'+(lang()==='ar'?'وادي النيل':'Nile Valley')+'</text><text class="zoom-indicator" x="930" y="38" id="geoZoomIndicator">100%</text><g id="geoMapViewport"></g>';const vp=$('geoMapViewport');geoFeatures.forEach(feat=>{const gov=getGov(feat.name);const metric=gov&&window.calculateSuitabilityFor?window.calculateSuitabilityFor(gov,base):{score:0,result:{totalWF:0,gir:0}};const path=document.createElementNS(MAP_NS,'path');path.setAttribute('d',pathFromCoords(feat.coords));path.setAttribute('fill',scoreColorSafe(metric.score));path.setAttribute('class','gov-feature '+((window.selectedGov&&window.selectedGov().governorate===feat.name)?'selected':''));path.addEventListener('mouseenter',e=>showTooltip(e,feat.name,base));path.addEventListener('mousemove',e=>showTooltip(e,feat.name,base));path.addEventListener('mouseleave',hideTooltip);path.addEventListener('click',()=>{const sel=$('govSelect');if(sel){sel.value=feat.name;if(window.update)window.update();}});vp.appendChild(path);const c=centroid(feat.coords);const t=document.createElementNS(MAP_NS,'text');t.setAttribute('x',c[0]);t.setAttribute('y',c[1]);t.setAttribute('text-anchor','middle');t.setAttribute('class',labelClass(feat.name));t.textContent=lang()==='ar'?feat.arabic:feat.name;vp.appendChild(t);});bindPanZoom(svg);applyViewport();const lg=$('mapLegend');if(lg)lg.innerHTML='<span class="badge good-badge">≥75 '+(lang()==='ar'?'ملاءمة مرتفعة':'High suitability')+'</span><span class="badge warn-badge">55–74 '+(lang()==='ar'?'ملاءمة متوسطة':'Moderate suitability')+'</span><span class="badge danger-badge">&lt;55 '+(lang()==='ar'?'ملاءمة منخفضة':'Low suitability')+'</span><span class="badge">'+(lang()==='ar'?'مرر المؤشر للتفاصيل':'Hover for details')+'</span><span class="badge">'+(lang()==='ar'?'اسحب أو استخدم عجلة الفأرة للتكبير':'Drag or wheel to zoom')+'</span>';}
  window.renderSuitabilityMap = geoRender;
  try{renderSuitabilityMap = geoRender;}catch(e){}
  setTimeout(()=>{try{resetZoom(); if(window.update)window.update();}catch(e){console.error(e);}},80);
})();


// ===== political-map-update-script =====
(function(){
  const SVG_NS='http://www.w3.org/2000/svg';
  const VIEW={w:1000,h:700};
  const politicalFeatures=[
    {name:'Matrouh',ar:'مطروح',label:[27.1,30.8],poly:[[24.7,31.55],[28.6,31.55],[29.55,31.22],[29.2,30.65],[28.65,29.65],[26.5,29.3],[24.75,29.82]]},
    {name:'Alexandria',ar:'الإسكندرية',label:[29.9,31.22],poly:[[29.45,31.42],[30.25,31.42],[30.25,31.05],[29.45,31.05]]},
    {name:'Beheira',ar:'البحيرة',label:[30.05,30.62],poly:[[29.25,31.15],[30.25,31.18],[30.7,30.92],[30.85,30.22],[30.15,30.02],[29.45,30.1],[29.16,30.55]]},
    {name:'Kafr El Sheikh',ar:'كفر الشيخ',label:[30.75,31.18],poly:[[30.22,31.55],[31.2,31.58],[31.32,31.06],[30.62,30.96],[30.24,31.08]]},
    {name:'Gharbia',ar:'الغربية',label:[30.95,30.78],poly:[[30.58,31.02],[31.28,31.04],[31.34,30.56],[30.66,30.5]]},
    {name:'Menofia',ar:'المنوفية',label:[30.55,30.42],poly:[[30.25,30.78],[30.95,30.78],[31.0,30.28],[30.25,30.20]]},
    {name:'Dakahlia',ar:'الدقهلية',label:[31.55,31.15],poly:[[31.12,31.50],[32.02,31.50],[32.20,31.00],[31.45,30.80],[31.18,30.92]]},
    {name:'Damietta',ar:'دمياط',label:[31.95,31.38],poly:[[31.74,31.63],[32.33,31.58],[32.20,31.17],[31.74,31.18]]},
    {name:'Port Said',ar:'بورسعيد',label:[32.35,31.16],poly:[[32.16,31.38],[32.64,31.38],[32.64,30.92],[32.14,30.96]]},
    {name:'Sharkia',ar:'الشرقية',label:[31.55,30.55],poly:[[31.02,30.92],[31.98,30.96],[32.15,30.25],[31.40,30.16],[31.02,30.28]]},
    {name:'Qaliubiya',ar:'القليوبية',label:[31.23,30.28],poly:[[30.92,30.50],[31.48,30.54],[31.52,30.08],[30.95,30.02]]},
    {name:'Cairo',ar:'القاهرة',label:[31.30,30.02],poly:[[31.12,30.20],[31.48,30.20],[31.45,29.86],[31.13,29.88]]},
    {name:'Giza',ar:'الجيزة',label:[30.85,29.82],poly:[[30.55,30.18],[31.15,30.18],[31.10,29.44],[30.60,29.34],[30.40,29.82]]},
    {name:'Fayoum',ar:'الفيوم',label:[30.55,29.32],poly:[[30.18,29.62],[30.95,29.62],[30.92,28.98],[30.18,29.00]]},
    {name:'Beni Suef',ar:'بني سويف',label:[31.05,29.04],poly:[[30.78,29.50],[31.42,29.50],[31.36,28.70],[30.78,28.72]]},
    {name:'Minya',ar:'المنيا',label:[30.95,28.20],poly:[[30.62,28.72],[31.62,28.72],[31.50,27.62],[30.72,27.62]]},
    {name:'Assiut',ar:'أسيوط',label:[31.12,27.25],poly:[[30.78,27.62],[31.70,27.62],[31.58,26.84],[30.82,26.84]]},
    {name:'Sohag',ar:'سوهاج',label:[31.28,26.55],poly:[[30.92,26.84],[31.90,26.84],[31.72,26.18],[30.96,26.18]]},
    {name:'Qena',ar:'قنا',label:[31.68,25.92],poly:[[31.02,26.18],[32.34,26.18],[32.32,25.48],[31.18,25.48]]},
    {name:'Luxor',ar:'الأقصر',label:[32.00,25.32],poly:[[31.44,25.50],[32.38,25.50],[32.32,24.98],[31.48,24.98]]},
    {name:'Aswan',ar:'أسوان',label:[32.40,23.80],poly:[[31.10,24.98],[33.65,24.98],[33.82,22.00],[31.18,22.00]]},
    {name:'Ismailia',ar:'الإسماعيلية',label:[32.34,30.58],poly:[[32.00,30.90],[32.72,30.90],[32.78,30.06],[32.08,30.10]]},
    {name:'Suez',ar:'السويس',label:[32.62,29.82],poly:[[32.35,30.15],[32.98,30.12],[32.92,29.38],[32.42,29.42]]},
    {name:'North Sinai',ar:'شمال سيناء',label:[33.65,30.80],poly:[[32.48,31.35],[34.95,31.35],[34.90,30.05],[33.38,29.98],[32.75,30.20],[32.55,30.78]]},
    {name:'South Sinai',ar:'جنوب سيناء',label:[33.80,28.30],poly:[[32.70,30.10],[33.55,29.86],[34.70,29.28],[34.96,27.92],[34.36,26.90],[33.74,26.10],[33.12,27.35],[32.60,28.70]]},
    {name:'New Valley',ar:'الوادي الجديد',label:[28.05,25.75],poly:[[24.65,28.80],[30.80,28.80],[30.72,26.90],[30.98,25.00],[30.78,22.00],[26.25,22.00],[24.62,24.15],[24.45,26.90]]},
    {name:'Red Sea',ar:'البحر الأحمر',label:[34.55,25.75],poly:[[33.05,29.45],[34.18,29.18],[35.20,27.55],[36.12,24.80],[36.55,22.00],[33.65,22.00],[33.10,24.15],[32.88,26.78],[32.90,28.45]]}
  ];
  const politicalGeoJSON={type:'FeatureCollection',features:politicalFeatures.map(f=>({type:'Feature',properties:{name_en:f.name,name_ar:f.ar},geometry:{type:'Polygon',coordinates:[[...f.poly,f.poly[0]]]}}))};
  window.egyptPoliticalSuitabilityGeoJSON=politicalGeoJSON;
  let z={scale:1,tx:0,ty:0}; let drag=null;
  function isAr(){const el=document.getElementById('languageSelect');return (el&&el.value==='ar')||document.documentElement.dir==='rtl';}
  function fmtSafe(x,d=1){return typeof fmt==='function'?fmt(x,d):(Number(x)||0).toFixed(d)}
  function govObj(name){return governorates.find(g=>g.governorate===name)}
  function cropLabel(){try{const c=selectedCrop();return isAr()&&c.arabic?c.arabic:c.crop}catch(e){return '-'}}
  function projectFactory(){let xs=[],ys=[];politicalFeatures.forEach(f=>f.poly.forEach(p=>{xs.push(p[0]);ys.push(p[1])}));const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const pad=54;const sc=Math.min((VIEW.w-pad*2)/(maxX-minX),(VIEW.h-pad*2)/(maxY-minY));const ox=(VIEW.w-(maxX-minX)*sc)/2,oy=(VIEW.h-(maxY-minY)*sc)/2;return p=>[ox+(p[0]-minX)*sc,VIEW.h-(oy+(p[1]-minY)*sc)]}
  const P=projectFactory();
  function path(poly){return poly.map((p,i)=>{const q=P(p);return (i?'L':'M')+' '+q[0].toFixed(1)+' '+q[1].toFixed(1)}).join(' ')+' Z'}
  function centroid(poly){const pts=poly.map(P);return [pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length]}
  function tooltipHtml(g,metric){const sc=metric.score||0;const color=scoreColor(sc);return '<div class="t-title">'+(isAr()?g.arabic:g.governorate)+'</div><div class="t-sub">'+(isAr()?'المحصول':'Crop')+': <strong>'+cropLabel()+'</strong></div><div style="margin:7px 0"><span class="t-badge" style="background:'+color+'"><span class="t-dot"></span>'+(sc>=75?(isAr()?'مرتفعة':'High'):sc>=55?(isAr()?'متوسطة':'Moderate'):(isAr()?'منخفضة':'Low'))+'</span></div><div class="t-row"><span>'+(isAr()?'درجة الملاءمة':'Suitability')+'</span><span>'+fmtSafe(sc,1)+'/100</span></div><div class="t-row"><span>'+(isAr()?'إجمالي البصمة':'Total applied WF')+'</span><span>'+fmtSafe(metric.result.totalWF,1)+' m³/ton</span></div><div class="t-row"><span>'+(isAr()?'الاحتياج الكلي للري':'GIR')+'</span><span>'+fmtSafe(metric.result.gir,1)+' mm</span></div><div class="t-row"><span>'+(isAr()?'المساحة القابلة للزراعة':'Arable land')+'</span><span>'+fmtSafe(Number(g.arableTotalFeddan)||0,0)+' '+(isAr()?'فدان':'fed')+'</span></div>'}
  function ensureUI(){const wrap=document.querySelector('.map-wrap');if(!wrap)return null;wrap.classList.add('political-map-wrap');let panel=wrap.querySelector('.pol-zoom-panel');if(!panel){panel=document.createElement('div');panel.className='pol-zoom-panel';panel.innerHTML='<button type="button" data-pol="in">+</button><button type="button" data-pol="out">−</button><button type="button" class="reset-map" data-pol="reset">100%</button>';wrap.appendChild(panel);panel.addEventListener('click',e=>{const b=e.target.closest('[data-pol]');if(!b)return;if(b.dataset.pol==='in')setZoom(Math.min(5,z.scale*1.25));else if(b.dataset.pol==='out')setZoom(Math.max(1,z.scale/1.25));else resetZoom()})}let tt=wrap.querySelector('.pol-tooltip');if(!tt){tt=document.createElement('div');tt.className='pol-tooltip';wrap.appendChild(tt)}return {wrap,tt}}
  function showTT(e,name,base){const ui=ensureUI();if(!ui)return;const g=govObj(name);if(!g)return;const metric=calculateSuitabilityFor(g,base);ui.tt.innerHTML=tooltipHtml(g,metric);const r=ui.wrap.getBoundingClientRect();ui.tt.style.left=Math.min(r.width-330,Math.max(12,e.clientX-r.left+16))+'px';ui.tt.style.top=Math.min(r.height-210,Math.max(12,e.clientY-r.top+16))+'px';ui.tt.classList.add('show')}
  function hideTT(){const ui=ensureUI();if(ui)ui.tt.classList.remove('show')}
  function applyZoom(){const vp=document.getElementById('politicalViewport');const zi=document.getElementById('politicalZoom');if(vp)vp.setAttribute('transform','translate('+z.tx+' '+z.ty+') scale('+z.scale+')');if(zi)zi.textContent=Math.round(z.scale*100)+'%'}
  function setZoom(s,cx=VIEW.w/2,cy=VIEW.h/2){const f=s/z.scale;z.tx=cx-f*(cx-z.tx);z.ty=cy-f*(cy-z.ty);z.scale=s;applyZoom()}
  function resetZoom(){z={scale:1,tx:0,ty:0};applyZoom()}
  function bind(svg){if(svg.dataset.polBound==='1')return;svg.dataset.polBound='1';svg.addEventListener('wheel',e=>{e.preventDefault();const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const ctm=svg.getScreenCTM();if(!ctm)return;const p=pt.matrixTransform(ctm.inverse());setZoom(Math.max(1,Math.min(5,z.scale*(e.deltaY<0?1.15:1/1.15))),p.x,p.y)},{passive:false});svg.addEventListener('pointerdown',e=>{if(!e.target.closest('#politicalViewport'))return;drag={x:e.clientX,y:e.clientY,tx:z.tx,ty:z.ty};svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing'});svg.addEventListener('pointermove',e=>{if(drag){z.tx=drag.tx+(e.clientX-drag.x);z.ty=drag.ty+(e.clientY-drag.y);applyZoom()}});svg.addEventListener('pointerup',()=>{drag=null;svg.style.cursor='default'});svg.addEventListener('pointercancel',()=>{drag=null;svg.style.cursor='default'});svg.addEventListener('mouseleave',()=>{if(!drag)hideTT()})}
  function labelClass(name){return ['Cairo','Qaliubiya','Damietta','Port Said','Suez','Alexandria','Luxor'].includes(name)?'pol-label tiny':['Gharbia','Menofia','Fayoum','Beni Suef'].includes(name)?'pol-label small':'pol-label'}
  renderSuitabilityMap=function(base){const svg=document.getElementById('egyptSuitabilityMap');if(!svg)return;ensureUI();svg.classList.add('political-map');svg.setAttribute('viewBox','0 0 '+VIEW.w+' '+VIEW.h);svg.innerHTML='<rect class="pol-frame" x="12" y="12" width="976" height="676" rx="24"></rect><rect class="pol-sea" x="12" y="12" width="976" height="120" rx="24"></rect><path class="pol-neighbor" d="M 775 145 L 970 150 L 970 520 L 870 490 L 820 360 Z"></path><path class="pol-neighbor" d="M 20 385 L 185 390 L 170 655 L 20 655 Z"></path><path class="pol-neighbor" d="M 290 650 L 730 648 L 720 690 L 270 690 Z"></path><text class="pol-title" x="48" y="48">'+(isAr()?'مصر — خريطة ملاءمة المحافظات':'Egypt — Governorate Suitability Map')+'</text><text class="pol-subtitle" x="48" y="68">'+(isAr()?'محدثة بصريًا بناءً على الخريطة السياسية المرفقة':'Updated visually based on the attached political map')+'</text><text class="pol-water-label" x="420" y="108">'+(isAr()?'البحر الأبيض المتوسط':'Mediterranean Sea')+'</text><text class="pol-water-label" x="850" y="455">'+(isAr()?'البحر الأحمر':'Red Sea')+'</text><text class="pol-country-label" x="40" y="455">'+(isAr()?'ليبيا':'Libya')+'</text><text class="pol-country-label" x="520" y="675">'+(isAr()?'السودان':'Sudan')+'</text><text class="pol-country-label" x="855" y="205">'+(isAr()?'فلسطين / الأردن':'Palestine / Jordan')+'</text><path class="pol-nile" d="M 520 635 C 522 590 523 545 522 505 C 521 452 523 405 526 360 C 528 300 530 246 535 180"></path><path class="pol-nile-branch" d="M 535 180 C 500 150 455 140 410 132"></path><path class="pol-nile-branch" d="M 535 180 C 570 150 615 140 660 132"></path><path class="pol-canal" d="M 665 220 C 675 260 680 310 682 355"></path><ellipse class="pol-lake" cx="520" cy="636" rx="38" ry="18"></ellipse><text class="pol-water-label" x="465" y="155">'+(isAr()?'الدلتا':'Delta')+'</text><text class="pol-water-label" x="548" y="380">'+(isAr()?'نهر النيل':'Nile River')+'</text><text class="pol-subtitle" x="915" y="42" id="politicalZoom">100%</text><g id="politicalViewport"></g><g class="pol-scale"><line x1="760" y1="650" x2="880" y2="650" stroke="#0f172a" stroke-width="3"></line><line x1="760" y1="645" x2="760" y2="655" stroke="#0f172a" stroke-width="2"></line><line x1="880" y1="645" x2="880" y2="655" stroke="#0f172a" stroke-width="2"></line><text x="760" y="668">0</text><text x="850" y="668">160 km</text><path d="M 930 82 L 942 48 L 954 82 L 942 76 Z" fill="#0f172a"></path><text x="935" y="96">N</text></g>';const vp=document.getElementById('politicalViewport');politicalFeatures.forEach(f=>{const g=govObj(f.name);const metric=g?calculateSuitabilityFor(g,base):{score:0,result:{totalWF:0,gir:0}};const pa=document.createElementNS(SVG_NS,'path');pa.setAttribute('d',path(f.poly));pa.setAttribute('class','pol-gov '+(selectedGov().governorate===f.name?'selected':''));pa.setAttribute('fill',scoreColor(metric.score));pa.dataset.gov=f.name;pa.addEventListener('mouseenter',e=>showTT(e,f.name,base));pa.addEventListener('mousemove',e=>showTT(e,f.name,base));pa.addEventListener('mouseleave',hideTT);pa.addEventListener('click',()=>{const sel=document.getElementById('govSelect');if(sel){sel.value=f.name;update()}});vp.appendChild(pa);const c=centroid(f.poly);const t=document.createElementNS(SVG_NS,'text');t.setAttribute('x',c[0]);t.setAttribute('y',c[1]);t.setAttribute('text-anchor','middle');t.setAttribute('class',labelClass(f.name));t.textContent=isAr()?f.ar:f.name;vp.appendChild(t)});bind(svg);applyZoom();const legend=document.getElementById('mapLegend');if(legend)legend.innerHTML='<span class="badge good-badge">≥75 '+(isAr()?'ملاءمة مرتفعة':'High suitability')+'</span><span class="badge warn-badge">55–74 '+(isAr()?'ملاءمة متوسطة':'Moderate suitability')+'</span><span class="badge danger-badge">&lt;55 '+(isAr()?'ملاءمة منخفضة':'Low suitability')+'</span><span class="badge">'+(isAr()?'مرر المؤشر للتفاصيل':'Hover for details')+'</span><span class="badge">'+(isAr()?'استخدم العجلة أو الأزرار للتكبير':'Wheel/buttons to zoom')+'</span>'}
  setTimeout(()=>{try{update()}catch(e){console.warn('Political map update warning',e)}},80);
})();


// ===== fullscreen-map-mode-script =====
(function(){
  const $id = id => document.getElementById(id); let fsState = {scale:1,tx:0,ty:0,dragging:false,sx:0,sy:0,ox:0,oy:0,rankings:[]};
  function lang(){return window.currentLang || document.documentElement.lang || 'ar';} function isAr(){return lang()==='ar';} function tr(ar,en){return isAr()?ar:en;} function format(x,d){return window.fmt ? window.fmt(x,d) : (Number(x)||0).toFixed(d||0);} function govLabel(g){return isAr()?(g.arabic||g.governorate):g.governorate;} function cropLabel(){try{const c=window.selectedCrop?window.selectedCrop():null;return c?(isAr()&&c.arabic?c.arabic:c.crop):'-';}catch(e){return '-';}}
  function baseInput(){try{return window.getInput?window.getInput():{};}catch(e){return {};}} function scoreForGov(g,b){try{return window.calculateSuitabilityFor?window.calculateSuitabilityFor(g,b):{score:0,result:{totalWF:0,gir:0}};}catch(e){return {score:0,result:{totalWF:0,gir:0}};}}
  function buildRankings(){const b=baseInput();return (window.governorates||[]).map(g=>{const s=scoreForGov(g,b);return {g,score:Number(s.score)||0,result:s.result||{}};}).sort((a,b)=>b.score-a.score);} function rankItem(item,idx,type){const div=document.createElement('div');div.className='fs-rank-item '+(type==='good'?'good':'bad');div.innerHTML='<div class="rank">'+(idx+1)+'</div><div><div class="name">'+govLabel(item.g)+'</div><div class="meta">WF '+format(item.result.totalWF,1)+' m³/ton · GIR '+format(item.result.gir,1)+' mm</div></div><div class="score">'+format(item.score,0)+'</div>';div.onclick=()=>{const sel=$id('govSelect');if(sel){sel.value=item.g.governorate;if(window.update)window.update();refreshFullscreen();}};return div;}
  function renderSidebar(){const rows=buildRankings();fsState.rankings=rows;const avg=rows.length?rows.reduce((s,x)=>s+x.score,0)/rows.length:0;const best=rows[0];$id('fsSideTitle').textContent=tr('ترتيب المحافظات','Governorate ranking');$id('fsSideSubtitle').textContent=tr('حسب Suitability Score للحالة الحالية','By Suitability Score for the current scenario');$id('fsBestLabel').textContent=tr('أفضل محافظة','Best governorate');$id('fsAvgLabel').textContent=tr('متوسط الملاءمة','Average score');$id('fsBestGov').textContent=best?govLabel(best.g):'-';$id('fsAvgScore').textContent=format(avg,0)+'/100';$id('fsTopTitle').textContent=tr('🏆 أفضل المحافظات','🏆 Best governorates');$id('fsBottomTitle').textContent=tr('⚠️ أقل المحافظات ملاءمة','⚠️ Lowest suitability');const top=$id('fsTopGovs'),bot=$id('fsBottomGovs');top.innerHTML='';bot.innerHTML='';rows.slice(0,8).forEach((x,i)=>top.appendChild(rankItem(x,i,'good')));rows.slice(-8).reverse().forEach((x,i)=>bot.appendChild(rankItem(x,i,'bad')));}
  function applyFsTransform(){const svg=$id('fsMapCanvas')?.querySelector('svg');if(!svg)return;const vp=svg.querySelector('#politicalViewport,#geoMapViewport');if(vp)vp.setAttribute('transform','translate('+fsState.tx+' '+fsState.ty+') scale('+fsState.scale+')');$id('fsMapZoomReset').textContent=Math.round(fsState.scale*100)+'%';} function resetFsZoom(){fsState.scale=1;fsState.tx=0;fsState.ty=0;applyFsTransform();} function zoomFs(f,cx,cy){const old=fsState.scale,next=Math.max(1,Math.min(6,old*f)),k=next/old;fsState.tx=(cx||500)-k*((cx||500)-fsState.tx);fsState.ty=(cy||350)-k*((cy||350)-fsState.ty);fsState.scale=next;applyFsTransform();}
  function showTip(e,n){const tip=$id('fsMapTooltip'),it=(fsState.rankings||[]).find(x=>x.g.governorate===n);if(!it)return;tip.innerHTML='<div class="t">'+govLabel(it.g)+'</div><div class="r"><span>'+tr('درجة الملاءمة','Suitability')+'</span><b>'+format(it.score,1)+'/100</b></div><div class="r"><span>Total applied WF</span><b>'+format(it.result.totalWF,1)+'</b></div><div class="r"><span>GIR</span><b>'+format(it.result.gir,1)+' mm</b></div>';tip.style.left=Math.min(window.innerWidth-260,e.clientX+14)+'px';tip.style.top=Math.min(window.innerHeight-150,e.clientY+14)+'px';tip.classList.add('show');} function hideTip(){const t=$id('fsMapTooltip');if(t)t.classList.remove('show');}
  function bindClone(svg){svg.onclick=e=>{const p=e.target.closest('[data-gov]');if(!p)return;const sel=$id('govSelect');if(sel){sel.value=p.dataset.gov;if(window.update)window.update();refreshFullscreen();}};svg.onmousemove=e=>{const p=e.target.closest('[data-gov]');if(!p){hideTip();return;}showTip(e,p.dataset.gov);};svg.onmouseleave=hideTip;svg.onwheel=e=>{e.preventDefault();const r=svg.getBoundingClientRect();zoomFs(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top);};svg.onpointerdown=e=>{fsState.dragging=true;fsState.sx=e.clientX;fsState.sy=e.clientY;fsState.ox=fsState.tx;fsState.oy=fsState.ty;try{svg.setPointerCapture(e.pointerId);}catch(err){}svg.style.cursor='grabbing';};svg.onpointermove=e=>{if(!fsState.dragging)return;fsState.tx=fsState.ox+(e.clientX-fsState.sx);fsState.ty=fsState.oy+(e.clientY-fsState.sy);applyFsTransform();};svg.onpointerup=svg.onpointercancel=()=>{fsState.dragging=false;svg.style.cursor='default';};}
  function refreshFullscreen(){renderSidebar();const src=$id('egyptSuitabilityMap'),canvas=$id('fsMapCanvas');if(src&&canvas){canvas.innerHTML='';const clone=src.cloneNode(true);clone.id='fullscreenSuitabilityMapSvg';canvas.appendChild(clone);bindClone(clone);resetFsZoom();}}
  function openFullscreen(){if(window.update)window.update();const ov=$id('fullscreenMapOverlay');if(!ov)return;$id('fsMapTitle').textContent=tr('خريطة ملاءمة المحافظات بملء الشاشة','Full-screen Governorate Suitability Map');$id('fsMapSubtitle').textContent=tr('المحصول الحالي: ','Current crop: ')+cropLabel();$id('fsMapHelp').textContent=tr('اسحب الخريطة واستخدم عجلة الفأرة للتكبير، واضغط على المحافظة لاختيارها','Drag, mouse-wheel to zoom, and click a governorate to select it');$id('fsMapExportCsv').textContent=tr('تصدير CSV','Export CSV');$id('fsMapClose').textContent=tr('إغلاق Esc','Close Esc');ov.classList.add('open');ov.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';refreshFullscreen();} function closeFullscreen(){const ov=$id('fullscreenMapOverlay');if(!ov)return;ov.classList.remove('open');ov.setAttribute('aria-hidden','true');document.body.style.overflow='';hideTip();}
  function exportCsv(){const rows=fsState.rankings&&fsState.rankings.length?fsState.rankings:buildRankings();const lines=[['Rank','Governorate','Arabic','Suitability Score','Total applied WF','GIR'].join(',')].concat(rows.map((x,i)=>[i+1,x.g.governorate,x.g.arabic,format(x.score,2),format(x.result.totalWF,2),format(x.result.gir,2)].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')));const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='governorate_suitability_fullscreen_map.csv';document.body.appendChild(a);a.click();a.remove();}
  function ensureButton(){const anchor=$id('exportScientificReportBtn');if(!anchor||$id('openFullscreenMapBtn'))return;const btn=document.createElement('button');btn.type='button';btn.id='openFullscreenMapBtn';btn.className='fullscreen-map-btn';btn.textContent=tr('عرض الخريطة بملء الشاشة','Full-screen map');btn.onclick=openFullscreen;anchor.parentElement.insertBefore(btn,anchor);} function bind(){ensureButton();$id('fsMapClose')?.addEventListener('click',closeFullscreen);$id('fsMapZoomIn')?.addEventListener('click',()=>zoomFs(1.2));$id('fsMapZoomOut')?.addEventListener('click',()=>zoomFs(1/1.2));$id('fsMapZoomReset')?.addEventListener('click',resetFsZoom);$id('fsMapExportCsv')?.addEventListener('click',exportCsv);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFullscreen();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,300));else setTimeout(bind,300);
})();


// ===== interactive-agri-map-script =====
(function(){
  const $ = id => document.getElementById(id);
  const fmt = n => Number(n||0).toLocaleString('en-US');
  const cropLayer = {
    "Matrouh": {x:24,y:30,crops:"Olives, figs, barley", herbs:"Wild herbs"},
    "Alexandria": {x:34,y:27,crops:"Vegetables, citrus, wheat", herbs:"Mint, basil"},
    "Beheira": {x:39,y:30,crops:"Wheat, rice, cotton, potatoes", herbs:"Mint, basil"},
    "Gharbia": {x:50,y:28,crops:"Cotton, wheat, rice, potatoes", herbs:"Mint, aromatic herbs"},
    "Kafr El Sheikh": {x:53,y:25,crops:"Rice, cotton, sugar beet, wheat", herbs:"Mint, basil"},
    "Dakahlia": {x:58,y:27,crops:"Rice, wheat, cotton, vegetables", herbs:"Mint, basil"},
    "Damietta": {x:65,y:27,crops:"Rice, wheat, vegetables", herbs:"Mint, basil"},
    "Sharkia": {x:60,y:34,crops:"Wheat, rice, cotton, maize", herbs:"Mint, basil"},
    "Ismailia": {x:69,y:39,crops:"Citrus, mango, peanuts", herbs:"Wild herbs"},
    "Port Said": {x:70,y:31,crops:"Rice, wheat, vegetables", herbs:"Mint, basil"},
    "Suez": {x:69,y:48,crops:"Olives, vegetables", herbs:"Wild herbs"},
    "Menoufia": {x:47,y:31,crops:"Vegetables, maize, wheat, potatoes", herbs:"Mint, basil"},
    "Qalyoubia": {x:53,y:33,crops:"Vegetables, citrus, maize", herbs:"Basil, aromatic herbs"},
    "Cairo": {x:53,y:38,crops:"Limited agriculture, vegetables, nurseries", herbs:"Mint, basil"},
    "Giza": {x:45,y:41,crops:"Wheat, maize, vegetables, dates", herbs:"Wild herbs"},
    "Fayoum": {x:40,y:49,crops:"Wheat, maize, grapes, olives", herbs:"Chamomile, mint, marjoram"},
    "Beni Suef": {x:46,y:55,crops:"Wheat, maize, garlic", herbs:"Chamomile, mint"},
    "Minya": {x:38,y:64,crops:"Wheat, maize, sugar beet, onions", herbs:"Anise, cumin, fennel"},
    "Assiut": {x:45,y:69,crops:"Wheat, maize, pomegranate", herbs:"Basil, anise"},
    "Sohag": {x:51,y:72,crops:"Wheat, maize, onions", herbs:"Fennel, anise"},
    "Qena": {x:57,y:73,crops:"Sugar cane, wheat, banana", herbs:"Hibiscus, fennel"},
    "Luxor": {x:56,y:79,crops:"Sugar cane, wheat, tomatoes", herbs:"Medicinal herbs"},
    "Aswan": {x:58,y:85,crops:"Sugar cane, dates, wheat", herbs:"Hibiscus, medicinal herbs"},
    "New Valley": {x:30,y:63,crops:"Dates, wheat, olives", herbs:"Medicinal herbs"},
    "Red Sea": {x:67,y:63,crops:"Limited agriculture, dates, vegetables", herbs:"Medicinal herbs"},
    "North Sinai": {x:75,y:38,crops:"Olives, dates, barley", herbs:"Medicinal herbs"},
    "South Sinai": {x:73,y:58,crops:"Dates, olives", herbs:"Medicinal herbs"}
  };
  const clusters = [
    {id:'nubaria',label:'Nubaria Agricultural Cluster',x:35,y:33,area:'998,526 fed.',location:'West of the old Delta / northwest desert fringe',note:'Official cultivated-area listing, not a standard governorate.'}
  ];
  const projects = [
    {id:'p1',label:'New Delta Project',marker:'1',x:31,y:36,area:'2.2 million fed.',location:'Western Desert, west of the old Delta, along and south of El Dabaa axis.'},
    {id:'p2',label:'Future of Egypt Project',marker:'2',x:43,y:36,area:'1,050,000 fed. target area',location:'Along Rod El Farag–El Dabaa axis, northwest of Cairo; first project within New Delta.'},
    {id:'p3',label:'Toshka Al-Khair Project',marker:'3',x:56,y:67,area:'1.1 million fed.',location:'Toshka / South Valley, south of Aswan near Lake Nasser.'},
    {id:'p4',label:'North & Central Sinai Development Project',marker:'4',x:74,y:39,area:'456,000 fed.',location:'North and Central Sinai, linked to treated-water development.'},
    {id:'p5',label:'Future of Egypt – East Owainat',marker:'5',x:31,y:65,area:'230,000 fed. target area',location:'Southwestern New Valley near East Owainat.'}
  ];
  let activeFilter='all', activeId=null, zoom=1;
  function isAr(){return (window.currentLang||document.documentElement.lang||'ar')==='ar';}
  function govName(g){return isAr() && g.arabic ? g.arabic : g.governorate;}
  function govByName(name){return (window.governorates||[]).find(g=>g.governorate===name) || null;}
  function allItems(){
    const govItems=(window.governorates||[]).filter(g=>cropLayer[g.governorate]).map(g=>({type:'gov',id:g.governorate,label:g.governorate,arabic:g.arabic,x:cropLayer[g.governorate].x,y:cropLayer[g.governorate].y,area:(g.arableTotalFeddan?fmt(g.arableTotalFeddan)+' fed.':'-'),crops:cropLayer[g.governorate].crops,herbs:cropLayer[g.governorate].herbs,region:g.region}));
    return govItems.concat(clusters.map(c=>({...c,type:'cluster'})), projects.map(p=>({...p,type:'project'})));
  }
  function itemVisible(item,q){
    const f=activeFilter;
    if(f!=='all' && item.type!==f) return false;
    if(!q) return true;
    const hay=[item.label,item.arabic,item.crops,item.herbs,item.location,item.area,item.region].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  }
  function renderMarkers(){
    const box=$('agriMapMarkers'); if(!box) return; box.innerHTML='';
    const q=($('agriMapSearch')?.value||'').trim();
    allItems().filter(i=>itemVisible(i,q)).forEach(item=>{
      const btn=document.createElement('button');
      btn.type='button'; btn.className='agri-map-marker '+item.type+(activeId===item.id?' selected':'');
      btn.style.left=item.x+'%'; btn.style.top=item.y+'%';
      btn.dataset.id=item.id; btn.dataset.type=item.type; btn.setAttribute('aria-label',item.label);
      btn.textContent=item.type==='gov'?'':(item.type==='cluster'?'C':item.marker);
      btn.addEventListener('click',()=>selectItem(item));
      btn.addEventListener('mousemove',e=>showTip(e,item)); btn.addEventListener('mouseleave',hideTip);
      box.appendChild(btn);
    });
  }
  function renderList(){
    const list=$('agriMapList'); if(!list) return; list.innerHTML='';
    const q=($('agriMapSearch')?.value||'').trim();
    allItems().filter(i=>itemVisible(i,q)).forEach(item=>{
      const div=document.createElement('div'); div.className='agri-map-list-item';
      const typeLabel=item.type==='gov'?'Governorate':item.type==='project'?'Project':'Cluster';
      div.innerHTML='<div><b>'+item.label+'</b><br><small>'+typeLabel+(item.area?' · '+item.area:'')+'</small></div><small>'+ (item.type==='project'?'#'+item.marker:item.type==='cluster'?'C':'●') +'</small>';
      div.addEventListener('click',()=>selectItem(item)); list.appendChild(div);
    });
  }
  function selectItem(item){
    activeId=item.id;
    const detail=$('agriMapDetail'); if(!detail) return;
    if(item.type==='gov'){
      const g=govByName(item.id); const label=g?govName(g):item.label;
      detail.className='agri-map-detail';
      detail.innerHTML='<h3>'+label+' / '+item.label+'</h3>'+
        '<div class="meta-row"><span>Governorate</span><span>'+item.region+'</span><span>Official cultivated area: '+item.area+'</span></div>'+
        '<p><b>Main crops:</b> '+item.crops+'<br><b>Medicinal/aromatic:</b> '+item.herbs+'</p>'+
        '<p><b>Interaction:</b> this governorate is now selected in the main calculator.</p>';
      const sel=$('govSelect'); if(sel){sel.value=item.id; if(window.update) window.update();}
    } else if(item.type==='cluster'){
      detail.className='agri-map-detail cluster-detail';
      detail.innerHTML='<h3>'+item.label+'</h3><div class="meta-row"><span>Agricultural cluster</span><span>'+item.area+'</span></div><p><b>Location:</b> '+item.location+'<br><b>Note:</b> '+item.note+'</p>';
    } else {
      detail.className='agri-map-detail project-detail';
      detail.innerHTML='<h3>'+item.marker+'. '+item.label+'</h3><div class="meta-row"><span>Major new agricultural project</span><span>'+item.area+'</span></div><p><b>Location:</b> '+item.location+'</p>';
    }
    renderMarkers();
  }
  function showTip(e,item){
    let tip=$('agriMapTooltip');
    if(!tip){tip=document.createElement('div');tip.id='agriMapTooltip';tip.className='agri-map-tooltip';document.body.appendChild(tip);}
    tip.innerHTML='<b>'+item.label+'</b><br>'+ (item.type==='gov'?'Area: '+item.area:(item.type==='project'?'Project area: '+item.area:'Cluster area: '+item.area));
    tip.style.left=Math.min(window.innerWidth-230,e.clientX+14)+'px'; tip.style.top=Math.min(window.innerHeight-95,e.clientY+14)+'px'; tip.classList.add('show');
  }
  function hideTip(){const tip=$('agriMapTooltip'); if(tip) tip.classList.remove('show');}
  function setZoom(z){zoom=Math.max(0.85,Math.min(1.8,z)); const sh=$('interactiveAgriMapShell'); if(sh) sh.style.transform='scale('+zoom+')'; const zr=$('agriMapZoomReset'); if(zr) zr.textContent=Math.round(zoom*100)+'%';}
  function init(){
    if(!$('agriMapMarkers')) return;
    document.querySelectorAll('[data-map-filter]').forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.mapFilter;document.querySelectorAll('[data-map-filter]').forEach(b=>b.classList.toggle('active',b===btn));renderMarkers();renderList();}));
    $('agriMapSearch')?.addEventListener('input',()=>{renderMarkers();renderList();});
    $('agriMapZoomIn')?.addEventListener('click',()=>setZoom(zoom+0.1)); $('agriMapZoomOut')?.addEventListener('click',()=>setZoom(zoom-0.1)); $('agriMapZoomReset')?.addEventListener('click',()=>setZoom(1));
    renderMarkers(); renderList();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500)); else setTimeout(init,500);
})();


// ===== old-map-agri-clusters-projects-layer =====
(function(){
  const clusters = [
    {type:'cluster', key:'nubaria', symbol:'C', name:'Nubaria Agricultural Cluster', nameAr:'تجمع النوبارية الزراعي', area:'998,526 fed.', x:382, y:143, location:'West of the old Delta / northwest desert fringe', note:'Official cultivated-area listing in the Ministry of Agriculture bulletin; not a standard governorate.', source:'MALR Economic Affairs Sector, Agricultural Statistics Bulletin 2020/2021, Table 17'}
  ];
  const projects = [
    {type:'project', key:'newDelta', symbol:'1', name:'New Delta Project', nameAr:'مشروع الدلتا الجديدة', area:'2.2 million fed.', x:318, y:254, location:'Western Desert, west of the old Delta, along and south of El Dabaa axis', source:'Official Presidency / SIS project pages'},
    {type:'project', key:'futureEgypt', symbol:'2', name:'Future of Egypt Project', nameAr:'مشروع مستقبل مصر', area:'1,050,000 fed. target area', x:445, y:252, location:'Along Rod El Farag–El Dabaa axis, northwest of Cairo; first project within the New Delta scheme', source:'Official Presidency / SIS project pages'},
    {type:'project', key:'toshka', symbol:'3', name:'Toshka Al-Khair Project', nameAr:'مشروع توشكى الخير', area:'1.1 million fed.', x:523, y:592, location:'Toshka / South Valley, south of Aswan near Lake Nasser', source:'State Information Service agriculture sector / strategy pages'},
    {type:'project', key:'sinaiDev', symbol:'4', name:'North & Central Sinai Development Project', nameAr:'مشروع تنمية شمال ووسط سيناء', area:'456,000 fed.', x:754, y:256, location:'North and Central Sinai; linked to treated-water development', source:'Official Presidency / SIS pages'},
    {type:'project', key:'eastOwainat', symbol:'5', name:'Future of Egypt – East Owainat', nameAr:'مستقبل مصر – شرق العوينات', area:'230,000 fed. target area', x:257, y:548, location:'Southwestern New Valley near East Owainat / Al-Dakhla–Owainat axis', source:'Official Presidency national projects page'}
  ];
  window.AGRICULTURAL_CLUSTERS = clusters;
  window.MAJOR_NEW_AGRICULTURAL_PROJECTS = projects;

  function ar(){return (document.documentElement.getAttribute('lang')||'').toLowerCase().startsWith('ar') || (window.lang&&window.lang()==='ar');}
  function safe(s){return String(s||'').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
  function markerDetails(item){
    const title = ar() ? (item.nameAr||item.name) : item.name;
    const locLabel = ar() ? 'الموقع' : 'Location';
    const areaLabel = ar() ? 'المساحة' : 'Area';
    const sourceLabel = ar() ? 'المصدر' : 'Source';
    const note = item.note ? `<div><strong>${ar()?'ملاحظة':'Note'}:</strong> ${safe(item.note)}</div>` : '';
    return `<h3>${safe(title)}</h3><div class="meta-row"><span>${item.type==='cluster'?(ar()?'تجمع زراعي غير محافظاتي':'Agricultural cluster'):(ar()?'مشروع زراعي قومي':'Major agricultural project')}</span><span>${safe(areaLabel)}: ${safe(item.area)}</span></div><div><strong>${safe(locLabel)}:</strong> ${safe(item.location)}</div>${note}<div><strong>${safe(sourceLabel)}:</strong> ${safe(item.source)}</div>`;
  }
  function selectAgriItem(item){
    const detail=document.getElementById('oldMapAgriDetail') || document.getElementById('agriMapDetail');
    if(detail){
      detail.className='old-map-box '+(item.type==='cluster'?'cluster':'project');
      detail.innerHTML=markerDetails(item);
    }
    document.querySelectorAll('.extra-agri-marker').forEach(g=>g.classList.remove('selected'));
    const node=document.querySelector(`.extra-agri-marker[data-key="${item.key}"]`);
    if(node) node.classList.add('selected');
  }
  window.selectOldMapAgriItem = selectAgriItem;

  function addMapMarkers(){
    const vp=document.getElementById('politicalViewport') || document.getElementById('geoMapViewport');
    if(!vp) return;
    vp.querySelectorAll('.extra-agri-marker').forEach(n=>n.remove());
    clusters.concat(projects).forEach(item=>{
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','extra-agri-marker '+item.type);
      g.setAttribute('data-key',item.key);
      g.setAttribute('transform',`translate(${item.x},${item.y})`);
      g.setAttribute('tabindex','0');
      g.setAttribute('role','button');
      const title=document.createElementNS('http://www.w3.org/2000/svg','title');
      title.textContent=`${item.name} — ${item.area}`;
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('r', item.type==='cluster'?'16':'15');
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('class','marker-symbol');
      t.setAttribute('x','0'); t.setAttribute('y','1');
      t.textContent=item.symbol;
      const cap=document.createElementNS('http://www.w3.org/2000/svg','text');
      cap.setAttribute('class','marker-caption');
      cap.setAttribute('x','20'); cap.setAttribute('y','5');
      cap.textContent=item.type==='cluster'?'Nubaria':item.symbol;
      g.appendChild(title); g.appendChild(c); g.appendChild(t); g.appendChild(cap);
      g.addEventListener('click',()=>selectAgriItem(item));
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectAgriItem(item);}});
      vp.appendChild(g);
    });
  }

  function renderPanel(){
    const advanced=document.getElementById('advancedAnalytics');
    if(!advanced || document.getElementById('oldMapAgriDataPanel')) return;
    const firstGrid=advanced.querySelector('.grid.chart-grid');
    const panel=document.createElement('div');
    panel.id='oldMapAgriDataPanel';
    panel.className='old-map-data-panel';
    panel.innerHTML = `
      <h2>${ar()?'المناطق والتجمعات الزراعية والمشروعات الجديدة — مضافة على الخريطة القديمة':'Agricultural clusters and new projects — added to the original map'}</h2>
      <div class="note">${ar()?'تم إلغاء استخدام صورة الخريطة الجديدة والاكتفاء بخريطة البرنامج القديمة، مع إدراج النوبارية والمشروعات الجديدة أيضًا داخل قائمة المحافظات كمناطق تخطيط واضحة وليست محافظات قياسية.':'The generated new map image is no longer used. The original program map remains active, and Nubaria plus major national projects are now also available in the governorate selector as flagged planning zones.'}</div>
      <div class="old-map-grid">
        <div id="oldMapAgriDetail" class="old-map-box cluster"><h3>${ar()?'اختر علامة من الخريطة':'Select a marker on the map'}</h3><div>${ar()?'اضغط على C للنوبارية أو الأرقام البرتقالية للمشروعات.':'Click C for Nubaria or the orange numbers for projects.'}</div></div>
        <div class="old-map-data-list">
          ${clusters.concat(projects).map(item=>`<div class="old-map-item ${item.type}" onclick="selectOldMapAgriItem(window.${item.type==='cluster'?'AGRICULTURAL_CLUSTERS':'MAJOR_NEW_AGRICULTURAL_PROJECTS'}.find(x=>x.key==='${item.key}'))"><span class="tag">${item.type==='cluster'?'C':'#'+item.symbol}</span><br><b>${safe(ar()?(item.nameAr||item.name):item.name)}</b><br>${safe(item.area)}<br><small>${safe(item.location)}</small></div>`).join('')}
        </div>
      </div>`;
    if(firstGrid) firstGrid.insertAdjacentElement('afterend', panel); else advanced.prepend(panel);
  }

  function patchRender(){
    const current = window.renderSuitabilityMap || (typeof renderSuitabilityMap!=='undefined' ? renderSuitabilityMap : null);
    if(!current || current.__oldMapAgriPatched) return;
    const patched=function(base){
      current(base);
      setTimeout(()=>{addMapMarkers();renderPanel();},0);
    };
    patched.__oldMapAgriPatched=true;
    window.renderSuitabilityMap=patched;
    try{renderSuitabilityMap=patched;}catch(e){}
  }

  function removeGeneratedMapTab(){
    document.querySelectorAll('[data-tab="egyptAgriMap"], #egyptAgriMap').forEach(n=>n.remove());
  }
  document.addEventListener('DOMContentLoaded',()=>{
    removeGeneratedMapTab();
    renderPanel();
    patchRender();
    setTimeout(()=>{addMapMarkers();},400);
  });
  window.addEventListener('load',()=>{patchRender();setTimeout(()=>{addMapMarkers();renderPanel();},700);});
})();


// ===== irrigation-calendar-module =====
(function(){
  const $ = id => document.getElementById(id);
  const lang = () => (document.documentElement.lang || 'ar');
  const isAr = () => lang()==='ar';
  const T = (ar,en) => isAr()?ar:en;
  const f = (x,d=1) => { try{ return (typeof fmt==='function') ? fmt(x,d) : Number(x||0).toFixed(d);}catch(e){ return Number(x||0).toFixed(d);} };
  const MON_AR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const MON_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
  const STAGE_AR={Initial:'مرحلة التأسيس',Development:'النمو الخضري',['Mid-season']:'منتصف الموسم',['Late-season']:'نهاية الموسم'};
  const STAGE_EN={Initial:'Initial',Development:'Development',['Mid-season']:'Mid-season',['Late-season']:'Late-season'};
  const monName = m => isAr()?MON_AR[m]:MON_EN[m];
  let chart=null, monthSelectReady=false, latest=null;

  function monthlyEtoFor(govName){
    const arr=new Array(12).fill(null);
    try{ (monthlyEToAverages||[]).forEach(r=>{ if(r.governorate===govName && r.monthNo>=1 && r.monthNo<=12) arr[r.monthNo-1]=Number(r.etoDay); }); }catch(e){}
    return arr;
  }
  function stageInputsLocal(){
    const n=(id,fb)=>{const el=$(id);const v=el?parseFloat(el.value):NaN;return Number.isFinite(v)?v:fb;};
    return [
      {key:'Initial',kc:n('kcIniInput',0.40),days:Math.max(0,Math.round(n('daysIniInput',25)))},
      {key:'Development',kc:n('kcDevInput',0.80),days:Math.max(0,Math.round(n('daysDevInput',35)))},
      {key:'Mid-season',kc:n('kcMidInput',1.10),days:Math.max(0,Math.round(n('daysMidInput',45)))},
      {key:'Late-season',kc:n('kcLateInput',0.75),days:Math.max(0,Math.round(n('daysLateInput',25)))}
    ];
  }
  const perFeddan = mm => mm*10*0.42; // 1 mm/ha = 10 m³; 1 feddan = 0.42 ha

  function build(){
    const base = (typeof getInput==='function')?getInput():{};
    const gov = (typeof selectedGov==='function')?selectedGov():null;
    const eto = monthlyEtoFor(gov?gov.governorate:'');
    const fallbackEto = Number(base.et0) || (gov?Number(gov.et0):0) || 0;
    const st = stageInputsLocal();
    const totalDays = st.reduce((s,x)=>s+x.days,0);
    const ea = Math.max(0.01, Number(base.ea)||0.6);
    const area = Math.max(0, Number(base.areaFeddan)||0);
    const startMonth = Math.max(1,Math.min(12, parseInt(($('calStartMonth')||{}).value||String(new Date().getMonth()+1),10)))-1;
    const netDepth = Math.max(5, Number(($('calNetDepth')||{}).value)||50);

    const cum=[]; let acc=0; st.forEach(s=>{acc+=s.days; cum.push(acc);});
    const stageAgg = st.map(s=>({...s, etc:0}));
    const monthAgg = {};
    let mon=startMonth, domLeft=DAYS[startMonth];
    for(let d=0; d<totalDays; d++){
      let si=0; while(si<cum.length-1 && d>=cum[si]) si++;
      const s=stageAgg[si];
      const etoDay = (eto[mon]!=null?eto[mon]:fallbackEto);
      const etcDay = etoDay * s.kc;
      s.etc += etcDay;
      if(!monthAgg[mon]) monthAgg[mon]={etc:0,days:0};
      monthAgg[mon].etc += etcDay; monthAgg[mon].days++;
      domLeft--; if(domLeft<=0){ mon=(mon+1)%12; domLeft=DAYS[mon]; }
    }
    function offDate(off){ let m=startMonth, day=1; for(let i=0;i<off;i++){ day++; if(day>DAYS[m]){day=1; m=(m+1)%12;} } return {m,day}; }
    const totalEtc = stageAgg.reduce((s,x)=>s+x.etc,0);
    const scenario = Number(base.rainScenario)||1;
    const seasonalPeff = Math.max(0, Math.min(totalEtc, (Number(base.rain)||0)*scenario*(Number(base.peffFraction)||0)));
    const peffShare = totalEtc>0 ? seasonalPeff/totalEtc : 0;

    let startOff=0;
    const stageRows = stageAgg.map((s)=>{
      const sd=startOff, ed=Math.max(startOff, startOff+s.days-1); startOff+=s.days;
      const peff=s.etc*peffShare, nir=Math.max(0,s.etc-peff), gir=nir/ea;
      const irr = s.days>0 ? Math.max(1, Math.ceil(nir/netDepth)) : 0;
      return {key:s.key, kc:s.kc, days:s.days, etc:s.etc, peff, nir, gir, m3f:perFeddan(gir), m3t:perFeddan(gir)*area, irr, interval: irr>0?s.days/irr:0, from:offDate(sd), to:offDate(ed)};
    });
    const seen=new Set(), monthOrder=[]; let mc=startMonth, left=DAYS[startMonth];
    for(let d=0; d<totalDays; d++){ if(!seen.has(mc)){seen.add(mc); monthOrder.push(mc);} left--; if(left<=0){mc=(mc+1)%12; left=DAYS[mc];} }
    const monthRows = monthOrder.map(mi=>{ const a=monthAgg[mi]||{etc:0,days:0}; const peff=a.etc*peffShare, nir=Math.max(0,a.etc-peff), gir=nir/ea; return {mi, days:a.days, etc:a.etc, nir, gir, m3f:perFeddan(gir), m3t:perFeddan(gir)*area}; });

    return {stageRows, monthRows, totalDays, totalEtc, ea, area,
      totalGir: stageRows.reduce((s,x)=>s+x.gir,0),
      totalNir: stageRows.reduce((s,x)=>s+x.nir,0),
      totalIrr: stageRows.reduce((s,x)=>s+x.irr,0),
      totalM3t: stageRows.reduce((s,x)=>s+x.m3t,0),
      totalPeff: seasonalPeff };
  }

  function fillMonthSelect(){
    const sel=$('calStartMonth'); if(!sel) return;
    const keep = sel.value || String(new Date().getMonth()+1);
    sel.innerHTML = MON_AR.map((_,i)=>`<option value="${i+1}">${monName(i)}</option>`).join('');
    sel.value = keep; monthSelectReady=true;
  }

  function render(){
    const card=$('irrigationCalendarCard'); if(!card) return;
    if(!monthSelectReady) fillMonthSelect(); else { const sel=$('calStartMonth'); if(sel){ const v=sel.value; sel.innerHTML=MON_AR.map((_,i)=>`<option value="${i+1}">${monName(i)}</option>`).join(''); sel.value=v; } }
    if($('calTitle')) $('calTitle').textContent = T('🗓️ جدول الري الزمني','🗓️ Irrigation Calendar');
    if($('calIntro')) $('calIntro').innerHTML = T('جدول ري تقديري مبني على مراحل النمو (Kc المرحلي) وبيانات ETo الشهرية للمحافظة المختارة. يوزّع الاحتياج المائي على المراحل والشهور، ويقدّر صافي/إجمالي الري وعدد الريّات. عدّل أيام كل مرحلة من قسم «معاملات Kc المرحلية» لضبط الجدول.','Indicative irrigation schedule based on growth stages (stage Kc) and the selected governorate\u2019s monthly ETo. It distributes crop water demand across stages and months and estimates net/gross irrigation and the number of irrigations. Edit each stage\u2019s days in the \u201cStage-based Kc\u201d panel to tune the schedule.');
    if($('calStartLabel')) $('calStartLabel').textContent = T('شهر الزراعة','Planting month');
    if($('calNetDepthLabel')) $('calNetDepthLabel').textContent = T('صافي عمق الرية (مم)','Net depth per irrigation (mm)');
    if($('calExportCsv')) $('calExportCsv').textContent = T('تصدير الجدول CSV','Export calendar CSV');
    if($('calMonthTitle')) $('calMonthTitle').textContent = T('التوزيع الشهري للري','Monthly irrigation distribution');

    const d = build(); latest=d;
    if(!d.totalDays){
      $('calStageHead').innerHTML=''; $('calStageRows').innerHTML=`<tr><td>${T('أدخل أيام مراحل النمو لعرض الجدول.','Enter growth-stage days to display the schedule.')}</td></tr>`;
      $('calMonthHead').innerHTML=''; $('calMonthRows').innerHTML=''; $('calKpis').innerHTML=''; if(chart){chart.destroy();chart=null;} return;
    }
    const kpi=(label,val,unit)=>`<div class="recommend-card"><div class="small">${label}</div><div class="big">${val}</div>${unit?`<div class="small">${unit}</div>`:''}</div>`;
    $('calKpis').innerHTML = [
      kpi(T('طول الموسم','Season length'), f(d.totalDays,0), T('يوم','days')),
      kpi(T('إجمالي ETc','Total ETc'), f(d.totalEtc,0), 'mm'),
      kpi(T('إجمالي الري GIR','Total GIR'), f(d.totalGir,0), 'mm'),
      kpi(T('إجمالي حجم الري','Total irrigation volume'), f(d.totalM3t,0), T('م³ للمساحة','m³ for area')),
      kpi(T('عدد الريّات','Number of irrigations'), f(d.totalIrr,0), ''),
      kpi(T('المطر الفعّال','Effective rainfall'), f(d.totalPeff,0), 'mm')
    ].join('');

    $('calStageHead').innerHTML = `<tr>
      <th>${T('المرحلة','Stage')}</th><th>${T('الفترة','Period')}</th><th>${T('أيام','Days')}</th><th>Kc</th>
      <th>ETc (mm)</th><th>${T('مطر فعّال','Peff')} (mm)</th><th>${T('صافي الري NIR','NIR')} (mm)</th><th>${T('إجمالي الري GIR','GIR')} (mm)</th>
      <th>${T('م³/فدان','m³/feddan')}</th><th>${T('ريّات (الفاصل)','Irrigations (interval)')}</th></tr>`;
    $('calStageRows').innerHTML = d.stageRows.map(s=>`<tr>
      <td><strong>${isAr()?STAGE_AR[s.key]:STAGE_EN[s.key]}</strong></td>
      <td>${s.from.day} ${monName(s.from.m)} → ${s.to.day} ${monName(s.to.m)}</td>
      <td>${f(s.days,0)}</td><td>${f(s.kc,2)}</td>
      <td>${f(s.etc,1)}</td><td>${f(s.peff,1)}</td><td>${f(s.nir,1)}</td><td><strong>${f(s.gir,1)}</strong></td>
      <td>${f(s.m3f,1)}</td><td>${f(s.irr,0)} ${s.irr?`(${T('كل','every')} ${f(s.interval,0)} ${T('يوم','d')})`:''}</td></tr>`).join('');

    $('calMonthHead').innerHTML = `<tr><th>${T('الشهر','Month')}</th><th>${T('أيام في الموسم','Days in crop')}</th><th>ETc (mm)</th><th>${T('صافي الري NIR','NIR')} (mm)</th><th>${T('إجمالي الري GIR','GIR')} (mm)</th><th>${T('م³/فدان','m³/feddan')}</th><th>${T('م³ للمساحة','m³ total')}</th></tr>`;
    $('calMonthRows').innerHTML = d.monthRows.map(m=>`<tr><td><strong>${monName(m.mi)}</strong></td><td>${f(m.days,0)}</td><td>${f(m.etc,1)}</td><td>${f(m.nir,1)}</td><td><strong>${f(m.gir,1)}</strong></td><td>${f(m.m3f,1)}</td><td>${f(m.m3t,0)}</td></tr>`).join('');

    drawChart(d);
  }

  function drawChart(d){
    const cv=$('calChart'); if(!cv || typeof Chart==='undefined') return;
    if(chart){ chart.destroy(); chart=null; }
    const labels = d.monthRows.map(m=>monName(m.mi));
    chart = new Chart(cv.getContext('2d'), {
      type:'bar',
      data:{ labels, datasets:[
        {label:T('إجمالي الري GIR (mm)','GIR (mm)'), data:d.monthRows.map(m=>+m.gir.toFixed(1)), backgroundColor:'#0e7490'},
        {label:'ETc (mm)', data:d.monthRows.map(m=>+m.etc.toFixed(1)), backgroundColor:'#f59e0b'}
      ]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top'}}, scales:{y:{beginAtZero:true, title:{display:true, text:'mm'}}} }
    });
  }

  function exportCsv(){
    if(!latest){ render(); }
    const d=latest; if(!d) return;
    const head=['Stage','From','To','Days','Kc','ETc_mm','Peff_mm','NIR_mm','GIR_mm','m3_per_feddan','m3_total','Irrigations'];
    const rows=d.stageRows.map(s=>[STAGE_EN[s.key], `${s.from.day} ${MON_EN[s.from.m]}`, `${s.to.day} ${MON_EN[s.to.m]}`, s.days, s.kc.toFixed(2), s.etc.toFixed(1), s.peff.toFixed(1), s.nir.toFixed(1), s.gir.toFixed(1), s.m3f.toFixed(1), s.m3t.toFixed(0), s.irr]);
    const mhead=['Month','Days_in_crop','ETc_mm','NIR_mm','GIR_mm','m3_per_feddan','m3_total'];
    const mrows=d.monthRows.map(m=>[MON_EN[m.mi], m.days, m.etc.toFixed(1), m.nir.toFixed(1), m.gir.toFixed(1), m.m3f.toFixed(1), m.m3t.toFixed(0)]);
    const esc=v=>'"'+String(v).replace(/"/g,'""')+'"';
    const lines=[]; lines.push('# Irrigation calendar by stage'); lines.push(head.join(','));
    rows.forEach(r=>lines.push(r.map(esc).join(',')));
    lines.push(''); lines.push('# Monthly distribution'); lines.push(mhead.join(','));
    mrows.forEach(r=>lines.push(r.map(esc).join(',')));
    const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='irrigation_calendar.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function bind(){
    fillMonthSelect();
    $('calStartMonth')?.addEventListener('change', render);
    $('calNetDepth')?.addEventListener('input', render);
    $('calExportCsv')?.addEventListener('click', exportCsv);
    const prev = window.update;
    window.update = function(){ let rv; if(typeof prev==='function') rv=prev.apply(this,arguments); try{ render(); }catch(e){ console.warn('Irrigation calendar:', e); } return rv; };
    try{ render(); }catch(e){ console.warn('Irrigation calendar init:', e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>setTimeout(bind,350));
  else setTimeout(bind,350);
})();


// ===== inline-script-13 =====
(function(){
  'use strict';
  const STORE_LIST='wf_plus_named_scenarios_v2';
  const TEST_STORE='wf_plus_last_test_checklist';
  function $(id){return document.getElementById(id)}
  function fmt(x,d=1){x=Number(x);return Number.isFinite(x)?x.toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d}):'-'}
  function langAr(){return (localStorage.getItem('programLang')||document.documentElement.lang||'ar').startsWith('ar')}
  function t(ar,en){return langAr()?ar:en}
  function readList(){try{return JSON.parse(localStorage.getItem(STORE_LIST)||'[]')}catch(e){return[]}}
  function writeList(a){localStorage.setItem(STORE_LIST,JSON.stringify(a||[]))}
  function payload(){
    if(typeof window.scenarioPayload==='function') return window.scenarioPayload();
    const base=typeof window.getInput==='function'?getInput():{};
    const result=typeof window.compute==='function'?compute(base):{};
    return {createdAt:new Date().toISOString(),input:base,result};
  }
  function standardApplied(base,r){
    const green=Number(r.greenWF)||0, net=Number(r.netBlueWF)||0, gross=Number(r.blueWF)||0, grey=Number(r.greyWF)||0;
    const standard=green+net+grey;
    const applied=green+gross+grey;
    return {green,net,gross,grey,standard,applied,irrigationLossWF:Math.max(0,gross-net),ea:Number(base.ea)||0};
  }
  function ensureAfter(anchorId, html){
    if($(anchorId)) return $(anchorId);
    const tmp=document.createElement('div');tmp.innerHTML=html.trim();const node=tmp.firstElementChild;
    const anchor=document.querySelector('.kpi-grid')||$('decisionSummary')||document.querySelector('main');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(node, anchor.nextSibling); else document.querySelector('.container')?.appendChild(node);
    return node;
  }
  function ensureMethodologyBlock(id, title, bodyHtml){
    if($(id)) return $(id);
    const sec=$('methodologySources')?.querySelector('.card-body') || $('methodologySources') || document.querySelector('.container');
    const div=document.createElement('div'); div.id=id; div.className='wf-enhanced-box'; div.innerHTML=`<h2 class="section-title">${title}</h2>${bodyHtml}`;
    sec?.appendChild(div); return div;
  }
  function renderStandardApplied(){
    if(typeof window.getInput!=='function'||typeof window.compute!=='function') return;
    const base=getInput(), r=compute(base), x=standardApplied(base,r);
    ensureAfter('standardAppliedWFBox', `<div id="standardAppliedWFBox" class="wf-enhanced-box">
      <h2>${t('فصل البصمة القياسية عن البصمة التطبيقية','Standard WF vs Applied WF separation')}</h2>
      <div class="note">${t('هذا الفصل يمنع الخلط بين تعريف WFN القياسي وبين مؤشر المياه التطبيقية المعدل بكفاءة الري.','This separation avoids mixing the standard WFN definition with the irrigation-efficiency-adjusted applied-water indicator.')}</div>
      <div class="wf-metric-row">
        <div class="wf-metric"><div class="k">Standard WF = Green + Net Blue + Grey</div><div class="v" id="stdWFVal">-</div><small>m³/ton</small></div>
        <div class="wf-metric"><div class="k">Applied WF = Green + Gross Blue + Grey</div><div class="v" id="appWFVal">-</div><small>m³/ton</small></div>
        <div class="wf-metric"><div class="k">Irrigation loss component</div><div class="v" id="lossWFVal">-</div><small>m³/ton</small></div>
        <div class="wf-metric"><div class="k">Irrigation efficiency Ea</div><div class="v" id="eaWFVal">-</div><small>fraction</small></div>
      </div>
      <div id="stdAppliedExplain" class="formula" style="margin-top:12px"></div>
    </div>`);
    $('stdWFVal').textContent=fmt(x.standard,1); $('appWFVal').textContent=fmt(x.applied,1); $('lossWFVal').textContent=fmt(x.irrigationLossWF,1); $('eaWFVal').textContent=fmt(x.ea,2);
    $('stdAppliedExplain').innerHTML = `<strong>Standard WF:</strong> ${fmt(x.green,1)} + ${fmt(x.net,1)} + ${fmt(x.grey,1)} = ${fmt(x.standard,1)} m³/ton.<br><strong>Applied WF:</strong> ${fmt(x.green,1)} + ${fmt(x.gross,1)} + ${fmt(x.grey,1)} = ${fmt(x.applied,1)} m³/ton.<br><strong>${t('ملاحظة','Note')}:</strong> Total applied WF is a field-application indicator, not a replacement for the WFN green–blue–grey WF definition.`;
    const totalTitle=document.querySelector('[data-i18n="totalWF"]'); if(totalTitle) totalTitle.textContent=t('إجمالي البصمة التطبيقية','Total applied WF');
  }
  function soilDetails(base,r){
    const d=r.yieldAdjustmentDetails||{};
    return [
      ['Soil texture',base.soilTexture||'-','Texture factor',d.textureFactor],
      ['Soil salinity ECe',base.soilECe,'Salinity penalty',d.salinityPenalty],
      ['Water ECw',base.waterECw,'Salt tolerance threshold',d.saltTol],
      ['Soil pH',base.soilPH,'pH penalty',d.phPenalty],
      ['Drainage',base.drainage,'Drainage factor',d.drainageFactor],
      ['Management',base.management,'Management factor',d.managementFactor],
      ['Original yield',r.originalYield,'Adjusted yield',r.adjustedYield],
      ['Overall yield adjustment',(Number(r.yieldAdjustmentFactor)||1)*100,'Soil score',r.soilScore]
    ];
  }
  function renderSoilImpact(){
    if(typeof window.getInput!=='function'||typeof window.compute!=='function') return;
    const base=getInput(), r=compute(base);
    ensureMethodologyBlock('soilWaterQualityImpactBlock', t('تأثير جودة المياه والتربة على الإنتاجية والمخاطر','Soil and water quality impact on yield and risk'), `<div class="note">${t('تمت إضافة ملخص واضح يربط ECe وECw وpH والصرف والإدارة بتعديل الإنتاجية ودرجة المخاطر.','A clear summary links ECe, ECw, pH, drainage and management to yield adjustment and risk score.')}</div><div class="table-wrap"><table><thead><tr><th>Input</th><th>Value</th><th>Model factor</th><th>Value</th></tr></thead><tbody id="soilWaterQualityRows"></tbody></table></div>`);
    const tb=$('soilWaterQualityRows'); if(tb) tb.innerHTML=soilDetails(base,r).map(row=>`<tr><td><strong>${row[0]}</strong></td><td>${fmt(row[1],2)}</td><td>${row[2]}</td><td>${fmt(row[3],2)}</td></tr>`).join('');
  }
  function renderValidationBenchmark(){
    if(typeof window.getInput!=='function'||typeof window.compute!=='function') return;
    const base=getInput(), r=compute(base), x=standardApplied(base,r);
    ensureMethodologyBlock('externalValidationBenchmarkBlock', t('Validation خارجي: مقارنة البرنامج مع CROPWAT/AquaCrop/دراسات منشورة','External validation: compare tool outputs with CROPWAT/AquaCrop/published studies'), `<div class="note">${t('أدخل قيم مرجعية من CROPWAT أو AquaCrop أو ورقة منشورة، وسيحسب البرنامج نسبة الاختلاف تلقائيًا للحالة الحالية.','Enter benchmark values from CROPWAT, AquaCrop or a published paper; the tool calculates agreement/difference automatically for the current scenario.')}</div>
      <div class="mini-grid"><label><span>Benchmark source</span><input id="benchSourceInput" placeholder="CROPWAT 8.0 / AquaCrop / Published WF study"></label><label><span>Reference ETc (mm)</span><input id="benchETcInput" type="number" step="0.1"></label><label><span>Reference Standard WF (m³/ton)</span><input id="benchStandardWFInput" type="number" step="0.1"></label><label><span>Reference Applied/Gross WF (m³/ton)</span><input id="benchAppliedWFInput" type="number" step="0.1"></label></div>
      <div class="wf-enhanced-actions"><button type="button" class="primary" id="saveBenchmarkBtn">Save benchmark</button><button type="button" id="clearBenchmarkBtn">Clear</button></div>
      <div class="table-wrap"><table><thead><tr><th>Metric</th><th>Tool value</th><th>Benchmark</th><th>Difference %</th><th>Interpretation</th></tr></thead><tbody id="validationBenchmarkRows"></tbody></table></div>`);
    const saved=JSON.parse(localStorage.getItem('wf_plus_validation_benchmark')||'{}');
    ['benchSourceInput','benchETcInput','benchStandardWFInput','benchAppliedWFInput'].forEach(id=>{const el=$(id); if(el && !el.dataset.loaded){const key=id.replace('bench','').replace('Input',''); if(saved[key]!==undefined) el.value=saved[key]; el.dataset.loaded='1';}});
    function val(id){return Number($(id)?.value)}
    const rows=[['ETc',r.etc,'benchETcInput'],['Standard WF',x.standard,'benchStandardWFInput'],['Applied/Gross WF',x.applied,'benchAppliedWFInput']].map(a=>{const b=val(a[2]); const diff=Number.isFinite(b)&&b>0?((Number(a[1])-b)/b*100):null; const interp=diff===null?'No benchmark entered':Math.abs(diff)<=10?'Good agreement':Math.abs(diff)<=25?'Moderate difference - check assumptions':'High difference - revise yield/Kc/Ea/rainfall'; return `<tr><td><strong>${a[0]}</strong></td><td>${fmt(a[1],1)}</td><td>${Number.isFinite(b)?fmt(b,1):'-'}</td><td>${diff===null?'-':fmt(diff,1)+'%'}</td><td>${interp}</td></tr>`}).join('');
    const tb=$('validationBenchmarkRows'); if(tb) tb.innerHTML=rows;
    const save=$('saveBenchmarkBtn'); if(save&&!save.dataset.bound){save.dataset.bound='1';save.onclick=()=>{localStorage.setItem('wf_plus_validation_benchmark',JSON.stringify({Source:$('benchSourceInput')?.value||'',ETc:$('benchETcInput')?.value||'',StandardWF:$('benchStandardWFInput')?.value||'',AppliedWF:$('benchAppliedWFInput')?.value||''})); renderValidationBenchmark();};}
    const clear=$('clearBenchmarkBtn'); if(clear&&!clear.dataset.bound){clear.dataset.bound='1';clear.onclick=()=>{localStorage.removeItem('wf_plus_validation_benchmark');['benchSourceInput','benchETcInput','benchStandardWFInput','benchAppliedWFInput'].forEach(id=>{if($(id)){$(id).value='';$(id).dataset.loaded='';}});renderValidationBenchmark();};}
    ['benchETcInput','benchStandardWFInput','benchAppliedWFInput'].forEach(id=>{const el=$(id); if(el&&!el.dataset.live){el.dataset.live='1'; el.addEventListener('input',renderValidationBenchmark);}});
  }
  function runChecklist(){
    const items=['Core calculation executed','Standard vs applied WF displayed','Soil/water quality inputs linked to yield adjustment','Scientific report button exists','JSON scenario export exists','Browser scenario save exists','Validation benchmark panel exists','CSV/Excel export buttons detected','Mobile viewport meta detected'];
    const checks=[typeof window.compute==='function'&&typeof window.getInput==='function',!!$('standardAppliedWFBox'),!!$('soilWaterQualityImpactBlock'),!!$('openScientificReportBtn')||!!$('exportScientificReportBtn'),!!$('exportFullJSONBtn2'),!!$('saveScenarioBrowserBtn3'),!!$('externalValidationBenchmarkBlock'),!!$('exportComparison')||!!$('exportExcelWorkbookBtn3'),!!document.querySelector('meta[name="viewport"]')];
    const data=items.map((name,i)=>({name,status:checks[i]?'PASS':'CHECK',date:new Date().toISOString()})); localStorage.setItem(TEST_STORE,JSON.stringify(data)); renderTestChecklist();
  }
  function renderTestChecklist(){
    ensureMethodologyBlock('programTestChecklistBlock', t('اختبار جاهزية البرنامج / Test checklist','Program readiness test checklist'), `<div class="note">${t('هذا الاختبار لا يغني عن تجربة المتصفح يدويًا، لكنه يؤكد وجود الوحدات الأساسية بعد التعديل.','This automated check does not replace manual browser testing, but confirms core modules after modification.')}</div><div class="wf-enhanced-actions"><button type="button" class="primary" id="runProgramChecklistBtn">Run checklist</button><button type="button" id="exportChecklistCSVBtn">Export checklist CSV</button></div><div class="table-wrap"><table><thead><tr><th>Test item</th><th>Status</th><th>Date</th></tr></thead><tbody id="programChecklistRows"></tbody></table></div>`);
    const data=JSON.parse(localStorage.getItem(TEST_STORE)||'[]'); const tb=$('programChecklistRows'); if(tb) tb.innerHTML=(data.length?data:[{name:'Press Run checklist after opening the program',status:'Waiting',date:'-'}]).map(x=>`<tr><td><strong>${x.name}</strong></td><td>${x.status}</td><td>${x.date}</td></tr>`).join('');
    const run=$('runProgramChecklistBtn'); if(run&&!run.dataset.bound){run.dataset.bound='1';run.onclick=runChecklist;}
    const exp=$('exportChecklistCSVBtn'); if(exp&&!exp.dataset.bound){exp.dataset.bound='1';exp.onclick=()=>{const rows=JSON.parse(localStorage.getItem(TEST_STORE)||'[]'); const csv='Test item,Status,Date\n'+rows.map(r=>[r.name,r.status,r.date].map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n'); const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='program_test_checklist.csv';document.body.appendChild(a);a.click();a.remove();};}
  }
  function saveNamedScenario(){
    const name=($('scenarioNameInput')?.value||'Scenario '+new Date().toLocaleString()).trim();
    const arr=readList(); const p=payload(); p.scenarioName=name; arr.unshift(p); writeList(arr.slice(0,20)); renderScenarioManager();
  }
  function renderScenarioManager(){
    ensureMethodologyBlock('namedScenarioManagerBlock', t('حفظ ومقارنة السيناريوهات باسم واضح','Named scenario saving and comparison'), `<div class="note">${t('يمكن حفظ أكثر من سيناريو ومقارنتهم في جدول واحد بدل حفظ آخر سيناريو فقط.','Save and compare multiple named scenarios rather than only the last browser scenario.')}</div><div class="mini-grid"><label><span>Scenario name</span><input id="scenarioNameInput" placeholder="Drip wheat - Beheira - baseline"></label><label><span>Compare basis</span><select id="scenarioCompareBasis"><option value="applied">Applied WF</option><option value="standard">Standard WF</option><option value="profit">Profit per m³</option><option value="risk">Risk</option></select></label></div><div class="wf-enhanced-actions"><button type="button" class="primary" id="saveNamedScenarioBtn">Save named scenario</button><button type="button" id="clearNamedScenariosBtn">Clear saved scenarios</button><button type="button" id="exportNamedScenariosCSVBtn">Export comparison CSV</button></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Date</th><th>Governorate</th><th>Crop</th><th>Standard WF</th><th>Applied WF</th><th>Profit/m³</th><th>Risk</th><th>Action</th></tr></thead><tbody id="namedScenarioRows"></tbody></table></div>`);
    const arr=readList(); const tb=$('namedScenarioRows');
    if(tb) tb.innerHTML=arr.length?arr.map((p,i)=>{const r=p.result||{}, base=p.input||{}, x=standardApplied(base,r), sel=p.selections||{}; return `<tr><td><strong>${p.scenarioName||'-'}</strong></td><td>${(p.createdAt||'').slice(0,19).replace('T',' ')}</td><td>${sel.governorate||'-'}</td><td>${sel.crop||base.cropName||'-'}</td><td>${fmt(x.standard,1)}</td><td>${fmt(x.applied,1)}</td><td>${fmt(r.profitPerM3,2)}</td><td>${fmt((p.risk||{}).overall,1)}</td><td><button type="button" data-load-scenario-index="${i}">Load</button></td></tr>`}).join(''):`<tr><td colspan="9">${t('لا توجد سيناريوهات محفوظة بعد.','No saved named scenarios yet.')}</td></tr>`;
    const save=$('saveNamedScenarioBtn'); if(save&&!save.dataset.bound){save.dataset.bound='1';save.onclick=saveNamedScenario;}
    const clear=$('clearNamedScenariosBtn'); if(clear&&!clear.dataset.bound){clear.dataset.bound='1';clear.onclick=()=>{writeList([]);renderScenarioManager();};}
    const exp=$('exportNamedScenariosCSVBtn'); if(exp&&!exp.dataset.bound){exp.dataset.bound='1';exp.onclick=()=>{const rows=readList(); const head=['Name','Date','Governorate','Crop','Standard_WF','Applied_WF','Profit_per_m3','Risk']; const csv=[head.join(',')].concat(rows.map(p=>{const r=p.result||{},x=standardApplied(p.input||{},r),sel=p.selections||{};return [p.scenarioName,p.createdAt,sel.governorate,sel.crop,fmt(x.standard,1),fmt(x.applied,1),fmt(r.profitPerM3,2),fmt((p.risk||{}).overall,1)].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')})).join('\n'); const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='named_scenario_comparison.csv';document.body.appendChild(a);a.click();a.remove();};}
    tb?.querySelectorAll('[data-load-scenario-index]').forEach(btn=>{btn.onclick=()=>{const p=readList()[Number(btn.dataset.loadScenarioIndex)]; if(p&&typeof window.applyScenarioPayload==='function') window.applyScenarioPayload(p);};});
  }
  function enhanceReport(){
    const old=window.openScientificReport;
    if(typeof old!=='function'||old.__enhanced_v2) return;
    window.openScientificReport=function(){
      const base=typeof getInput==='function'?getInput():{}, r=typeof compute==='function'?compute(base):{}, x=standardApplied(base,r);
      const version='v1.1-enhanced — 2026-06-07';
      const doi='https://doi.org/10.5281/zenodo.20574912';
      const risk=typeof window.calculateRisk==='function'?calculateRisk(base,r):{};
      const rows=[['Standard WF',x.standard],['Applied WF',x.applied],['Irrigation loss WF',x.irrigationLossWF],['Adjusted yield',r.adjustedYield],['Yield adjustment factor',(r.yieldAdjustmentFactor||1)*100],['Risk score',risk.overall]];
      const html=`<!doctype html><html><head><meta charset="utf-8"><title>Scientific WF Report ${version}</title><style>body{font-family:Arial,sans-serif;margin:28px;line-height:1.65;color:#0f172a}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}.box{background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:12px;margin:12px 0}button{padding:9px 14px;border-radius:10px;border:1px solid #94a3b8}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Print / Save PDF</button><h1>Water Footprint Decision Tool — Scientific Report</h1><div class="box"><strong>Version:</strong> ${version}<br><strong>DOI:</strong> ${doi}<br><strong>Generated:</strong> ${new Date().toISOString()}<br><strong>Author:</strong> Mahmoud, M. / Mohamed M. Mahmoud</div><h2>Standard vs Applied Water Footprint</h2><table><tr><th>Metric</th><th>Value</th><th>Unit</th></tr>${rows.map(a=>`<tr><td>${a[0]}</td><td>${fmt(a[1],2)}</td><td>${a[0].includes('factor')?'%':a[0].includes('yield')?'ton/ha':a[0].includes('Risk')?'/100':'m³/ton'}</td></tr>`).join('')}</table><h2>Methodological definition</h2><p><strong>Standard WF</strong> = Green WF + Net Blue WF + Grey WF. <strong>Applied WF</strong> = Green WF + Gross Blue WF + Grey WF. Applied WF is an irrigation-efficiency-adjusted decision indicator and does not replace the standard WFN definition.</p><h2>Validation requirement</h2><p>For publication, compare ETc and WF outputs against CROPWAT 8.0, AquaCrop, field records, or published water-footprint benchmarks after aligning crop, season, yield denominator, rainfall, and irrigation method.</p><h2>Soil and water quality effect</h2><table><tr><th>Input</th><th>Value</th><th>Factor</th><th>Value</th></tr>${soilDetails(base,r).map(row=>`<tr><td>${row[0]}</td><td>${fmt(row[1],2)}</td><td>${row[2]}</td><td>${fmt(row[3],2)}</td></tr>`).join('')}</table><h2>References and data notes</h2><ol><li>FAO-56 crop evapotranspiration framework for ETo, Kc and crop water requirements.</li><li>Water Footprint Network green, blue and grey WF component definitions.</li><li>Embedded Egypt governorate ETo dataset, crop/product database, and user-entered field/economic inputs.</li><li>Zenodo archived release DOI: ${doi}</li></ol><h2>Limitations</h2><p>Outputs are screening-level decision-support estimates. Final agronomic or investment decisions require local validation of ETo, rainfall, Kc, yield, soil salinity, water salinity, pH, drainage, costs and market prices.</p></body></html>`;
      const w=window.open('','_blank'); if(w){w.document.write(html);w.document.close();} else old();
    }; window.openScientificReport.__enhanced_v2=true;
  }
  function renderAll(){try{renderStandardApplied();renderSoilImpact();renderValidationBenchmark();renderTestChecklist();renderScenarioManager();enhanceReport();}catch(e){console.warn('Enhancement layer:',e)}}
  const prevUpdate=window.update;
  window.update=function(){let rv; if(typeof prevUpdate==='function') rv=prevUpdate.apply(this,arguments); renderAll(); return rv;};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{renderAll(); try{window.update&&window.update()}catch(e){}},700)); else setTimeout(()=>{renderAll(); try{window.update&&window.update()}catch(e){}},700);
})();


// ===== strictBilingualLanguageLayer =====
(function(){
  // Strict bilingual UI layer: every visible label follows the selected language.
  const hasAr = s => /[\u0600-\u06FF]/.test(s||'');
  const hasLatin = s => /[A-Za-z]/.test(s||'');
  const lang = () => (window.currentLang || localStorage.getItem('programLang') || document.documentElement.lang || 'ar').startsWith('en') ? 'en' : 'ar';
  const isAr = () => lang()==='ar';
  const pairMap = new Map();
  function add(ar,en){ pairMap.set(ar,en); pairMap.set(en,ar); }
  [
    ['اسم المستخدم','Username'],['كلمة المرور','Password'],['دخول','Login'],['المطور','Developer'],['مستخدم عادي','User'],['مدير','Admin'],['حذف','Delete'],['خروج','Logout'],['المستخدمين','Users'],
    ['أداة قرار البصمة المائية','Water Footprint Decision Tool'],['البصمة المائية','Water Footprint'],['أداة القرار','Decision Tool'],
    ['نمط الحساب','Calculation Mode'],['قاعدة البيانات','Database'],['قاعدة البيانات المدمجة','Embedded database'],['إدخال يدوي','Manual input'],['إدخال يدوي — المستخدم','Manual — User Input'],['قاعدة البيانات التلقائية','Automatic — Database'],
    ['اختر القارة','Select continent'],['كل القارات','All continents'],['القارة','Continent'],['الدولة','Country'],['الدول','Countries'],['اختر الدولة','Select country'],['فتح الدولة','Open country'],
    ['الحاسبة الرئيسية','Main calculator'],['مقارنة المحافظات','Governorate comparison'],['التحليل العلمي المتقدم','Advanced scientific analysis'],['اقتصاديات المياه والمخاطر','Water economics and risk'],['المنهجية والمصادر','Methodology and sources'],
    ['بيانات البخر-نتح لعشر سنوات','ETo 10 years'],['درجة الملاءمة','Suitability score'],['إجمالي البصمة التطبيقية','Total applied WF'],['توفير المياه مقارنة بالغمر','Water saving vs flood'],['أثر كفاءة الري','Irrigation efficiency impact'],['توصية القرار','Decision recommendation'],
    ['المدخلات','Inputs'],['إعادة ضبط','Reset'],['المحافظة','Governorate'],['المحصول','Crop'],['طريقة الري','Irrigation method'],['الأمطار الموسمية','Seasonal rainfall'],['كفاءة الري','Irrigation efficiency'],['متوسط البخر-نتح لعشر سنوات','10-year average ETo'],['البخر-نتح السنوي','Annual ETo'],['معامل المحصول','Crop coefficient'],['الإنتاجية','Yield'],['مدة النمو','Growing period'],['طريقة المطر الفعال','Effective rainfall method'],['المطر الفعال اليدوي','Manual effective rainfall'],['تلقائي من أمطار المحافظة','Automatic from governorate rainfall'],['إدخال يدوي','Manual input'],
    ['المنتج المستخدم في الحساب','Product basis'],['إعدادات الإدخال اليدوي الذكي','Smart manual input settings'],['مصدر البيانات','Data source'],['بيانات حقلية مقاسة','Measured field data'],['مصدر منشور','Published source'],['قيمة تقديرية','Estimated value'],['افتراض المستخدم','User assumption'],['ملاحظات مرجعية','Reference / notes'],
    ['معاملات مراحل النمو','Stage-based crop coefficients'],['استخدم معاملات مراحل النمو بدل معامل متوسط واحد','Use stage-based Kc instead of one average Kc'],['حساب المساحة المطلوبة حسب الاحتياج','Demand-based area planner'],['نوع الاحتياج','Planning target'],['احتياج إنتاجي','Required production'],['مياه متاحة','Available irrigation water'],['إنتاج مطلوب + مياه متاحة','Production + water check'],['الاحتياج الإنتاجي المطلوب','Required production demand'],['كمية مياه الري المتاحة','Available irrigation water volume'],['هامش أمان تخطيطي','Planning safety margin'],['استخدم المساحة المحسوبة في الحاسبة','Use calculated area in calculator'],['إدخال احتياج يدوي','Manual demand input'],['بناءً على سيناريو البصمة الحالي','Based on current WF scenario'],
    ['التربة والملوحة والإدارة','Soil and water quality'],['قوام التربة','Soil texture'],['طميية','Loam'],['طينية','Clay'],['رملية','Sandy'],['الصرف','Drainage'],['جيد','Good'],['متوسط','Moderate'],['ضعيف','Poor'],['مستوى الإدارة','Management level'],['مرتفع','High'],['منخفض','Low'],
    ['المعادلات الأساسية','Core formulas'],['الحسابات التفصيلية','Detailed calculations'],['مكونات البصمة المائية','Water footprint components'],['البصمة الخضراء','Green WF'],['البصمة الزرقاء الصافية','Net blue WF'],['البصمة الزرقاء المعدلة بكفاءة الري','Gross blue WF'],['البصمة الرمادية','Grey WF'],['إجمالي البصمة المائية','Total WF'],['البصمة القياسية','Standard WF'],['البصمة التطبيقية','Applied WF'],['فاقد الري','Irrigation loss'],
    ['ملخص القرار والتوصية','Decision summary and recommendation'],['طباعة / حفظ تقرير','Print / Save report'],['تصدير مقارنة الري','Export irrigation comparison'],['التصنيف','Classification'],['تقدير على مستوى المساحة','Farm-scale estimate'],['توصية مختصرة','Brief recommendation'],['جدول الري الزمني','Irrigation calendar'],
    ['تصدير ملف بيانات','Export data file'],['تقرير علمي','Scientific report'],['تقرير علمي كامل','Full scientific report'],['خريطة ملاءمة المحافظات','Governorate suitability map'],['توزيع المحاصيل على المساحات المختلفة','Multi-crop area allocation'],
    ['تصدير التوزيع','Export allocation'],['منطق التوزيع','Allocation logic'],['أفضل محافظة','Best governorate'],['المساحة المخصصة لأفضل محافظة','Allocated area for best governorate'],['إجمالي المساحة المتاحة المختارة','Selected available capacity'],['المساحة غير المغطاة','Uncovered area'],['فدان','feddan'],
    ['حفظ السيناريو','Save scenario'],['استرجاع السيناريو','Load scenario'],['إدارة السيناريوهات','Scenario management'],['اسم السيناريو','Scenario name'],['أساس المقارنة','Compare basis'],['حفظ سيناريو باسم','Save named scenario'],['مسح السيناريوهات المحفوظة','Clear saved scenarios'],['تصدير مقارنة السيناريوهات','Export scenario comparison'],['لا توجد سيناريوهات محفوظة بعد.','No saved named scenarios yet.'],['تحميل','Load'],
    ['اختبار جاهزية البرنامج','Program readiness test checklist'],['تشغيل الاختبار','Run checklist'],['تصدير الاختبار','Export checklist'],['عنصر الاختبار','Test item'],['الحالة','Status'],['التاريخ','Date'],['في انتظار إدخال البيانات والحساب.','Waiting for inputs and calculation.'],['لم يتم الحساب بعد. اختر الدولة والمحصول وأدخل القيم اليدوية ثم اضغط زر الحساب.','No calculation yet. Select a country and crop, enter manual values, then calculate.'],
    ['مقارنة البرنامج مع القيم المرجعية الخارجية','External validation against benchmark values'],['مصدر القيمة المرجعية','Benchmark source'],['القيمة المرجعية','Benchmark'],['نسبة الاختلاف','Difference %'],['التفسير','Interpretation'],['حفظ القيمة المرجعية','Save benchmark'],['مسح','Clear'],
    ['مصر','Egypt'],['اختر المحافظة المصرية من القائمة التالية.','Select the Egyptian governorate from the list below.'],['بيانات الجودة','Data quality'],['وضع مختلط','Hybrid mode'],['رابط قاعدة بيانات المحصول والمنتج','Crop-product database link'],
    ['م³/طن = لتر/كجم','m³/ton = L/kg'],['م³/طن','m³/ton'],['لتر/كجم','L/kg'],['طن/هكتار','ton/ha'],['طن','ton'],['كجم/م³','kg/m³'],['مم/موسم','mm/season'],['مم/يوم','mm/day'],['م³/هكتار','m³/ha'],['م³','m³'],['مم','mm']
  ].forEach(x=>add(x[0],x[1]));
  const arFragments = [
    [/Water Footprint Decision Tool/g,'أداة قرار البصمة المائية'],[/Water Footprint/g,'البصمة المائية'],[/Decision Tool/g,'أداة القرار'],[/Main calculator/g,'الحاسبة الرئيسية'],[/Countries/g,'الدول'],[/Country/g,'الدولة'],[/Governorate/g,'المحافظة'],[/Crop/g,'المحصول'],[/Product basis/g,'المنتج المستخدم في الحساب'],[/Manual input/g,'إدخال يدوي'],[/Manual — User Input/g,'إدخال يدوي — المستخدم'],[/Automatic — Database/g,'قاعدة البيانات التلقائية'],[/Embedded database/g,'قاعدة البيانات المدمجة'],[/Measured field data/g,'بيانات حقلية مقاسة'],[/Published source/g,'مصدر منشور'],[/Estimated value/g,'قيمة تقديرية'],[/User assumption/g,'افتراض المستخدم'],[/Reference \/ Notes/g,'ملاحظات مرجعية'],[/Data source/g,'مصدر البيانات'],
    [/Green WF/g,'البصمة الخضراء'],[/Net Blue WF/gi,'البصمة الزرقاء الصافية'],[/Gross Blue WF/gi,'البصمة الزرقاء المعدلة بكفاءة الري'],[/Grey WF/g,'البصمة الرمادية'],[/Total applied WF/gi,'إجمالي البصمة التطبيقية'],[/Standard WF/g,'البصمة القياسية'],[/Applied WF/g,'البصمة التطبيقية'],[/Water saving/gi,'توفير المياه'],[/Decision Recommendation/g,'توصية القرار'],[/Irrigation efficiency impact/g,'أثر كفاءة الري'],[/Suitability Score/gi,'درجة الملاءمة'],[/Scientific report/g,'تقرير علمي'],[/Print \/ Save PDF/g,'طباعة / حفظ تقرير'],[/Export/gi,'تصدير'],[/CSV/g,'ملف بيانات'],[/PDF/g,'تقرير'],[/Excel/g,'جدول بيانات'],
    [/Soil and water quality/gi,'التربة والملوحة والإدارة'],[/Soil texture/g,'قوام التربة'],[/Loam/g,'طميية'],[/Clay/g,'طينية'],[/Sandy/g,'رملية'],[/Drainage/g,'الصرف'],[/Management level/g,'مستوى الإدارة'],[/High/g,'مرتفع'],[/Medium/g,'متوسط'],[/Low/g,'منخفض'],[/Good/g,'جيد'],[/Moderate/g,'متوسط'],[/Poor/g,'ضعيف'],
    [/Irrigation Calendar/g,'جدول الري الزمني'],[/Governorate Suitability Map/g,'خريطة ملاءمة المحافظات'],[/Multi-Crop Area Allocation/g,'توزيع المحاصيل على المساحات المختلفة'],[/Demand-Based Area Planner/g,'حساب المساحة المطلوبة حسب الاحتياج'],[/Planning target/g,'نوع الاحتياج'],[/Required production/g,'احتياج إنتاجي'],[/Available irrigation water/g,'مياه ري متاحة'],[/Production \+ water check/g,'إنتاج مطلوب + مياه متاحة'],[/Scenario name/g,'اسم السيناريو'],[/Compare basis/g,'أساس المقارنة'],[/Save named scenario/g,'حفظ سيناريو باسم'],[/Clear saved scenarios/g,'مسح السيناريوهات المحفوظة'],[/Export comparison/g,'تصدير المقارنة'],[/Load/g,'تحميل'],[/Name/g,'الاسم'],[/Date/g,'التاريخ'],[/Action/g,'الإجراء'],[/Risk/g,'المخاطر'],[/Profit per m³/g,'الربح لكل م³'],
    [/Core formulas/g,'المعادلات الأساسية'],[/Growing days/g,'مدة النمو'],[/Seasonal rainfall/g,'الأمطار الموسمية'],[/effective rainfall fraction/g,'معامل المطر الفعال'],[/Yield/g,'الإنتاجية'],[/Input/g,'المدخل'],[/Value/g,'القيمة'],[/Model factor/g,'معامل النموذج'],[/Metric/g,'المؤشر'],[/Tool value/g,'قيمة البرنامج'],[/Benchmark/g,'القيمة المرجعية'],[/Difference %/g,'نسبة الاختلاف'],[/Interpretation/g,'التفسير'],[/Save benchmark/g,'حفظ القيمة المرجعية'],[/Clear/g,'مسح'],[/Run checklist/g,'تشغيل الاختبار'],[/Export checklist/g,'تصدير الاختبار'],[/Test item/g,'عنصر الاختبار'],[/Status/g,'الحالة'],[/Waiting/g,'انتظار']
  ];
  const enFragments = [
    [/أداة قرار البصمة المائية/g,'Water Footprint Decision Tool'],[/البصمة المائية/g,'Water Footprint'],[/أداة القرار/g,'Decision Tool'],[/الحاسبة الرئيسية/g,'Main calculator'],[/الدول/g,'Countries'],[/الدولة/g,'Country'],[/المحافظة/g,'Governorate'],[/المحصول/g,'Crop'],[/المنتج المستخدم في الحساب/g,'Product basis'],[/إدخال يدوي/g,'Manual input'],[/قاعدة البيانات التلقائية/g,'Automatic database'],[/قاعدة البيانات المدمجة/g,'Embedded database'],[/بيانات حقلية مقاسة/g,'Measured field data'],[/مصدر منشور/g,'Published source'],[/قيمة تقديرية/g,'Estimated value'],[/افتراض المستخدم/g,'User assumption'],[/ملاحظات مرجعية/g,'Reference notes'],[/مصدر البيانات/g,'Data source'],
    [/البصمة الخضراء/g,'Green WF'],[/البصمة الزرقاء الصافية/g,'Net blue WF'],[/البصمة الزرقاء المعدلة بكفاءة الري/g,'Gross blue WF'],[/البصمة الرمادية/g,'Grey WF'],[/إجمالي البصمة التطبيقية/g,'Total applied WF'],[/إجمالي البصمة المائية/g,'Total WF'],[/البصمة القياسية/g,'Standard WF'],[/البصمة التطبيقية/g,'Applied WF'],[/توفير المياه/g,'Water saving'],[/توصية القرار/g,'Decision recommendation'],[/أثر كفاءة الري/g,'Irrigation efficiency impact'],[/درجة الملاءمة/g,'Suitability score'],[/تقرير علمي/g,'Scientific report'],[/طباعة \/ حفظ تقرير/g,'Print / save report'],[/تصدير ملف بيانات/g,'Export data file'],[/تصدير/g,'Export'],
    [/التربة والملوحة والإدارة/g,'Soil and water quality'],[/قوام التربة/g,'Soil texture'],[/طميية/g,'Loam'],[/طينية/g,'Clay'],[/رملية/g,'Sandy'],[/الصرف/g,'Drainage'],[/مستوى الإدارة/g,'Management level'],[/مرتفع/g,'High'],[/متوسط/g,'Moderate'],[/منخفض/g,'Low'],[/جيد/g,'Good'],[/ضعيف/g,'Poor'],
    [/جدول الري الزمني/g,'Irrigation calendar'],[/خريطة ملاءمة المحافظات/g,'Governorate suitability map'],[/توزيع المحاصيل على المساحات المختلفة/g,'Multi-crop area allocation'],[/حساب المساحة المطلوبة حسب الاحتياج/g,'Demand-based area planner'],[/نوع الاحتياج/g,'Planning target'],[/احتياج إنتاجي/g,'Required production'],[/مياه ري متاحة/g,'Available irrigation water'],[/مياه متاحة/g,'Available water'],[/إنتاج مطلوب \+ مياه متاحة/g,'Production + water check'],[/اسم السيناريو/g,'Scenario name'],[/أساس المقارنة/g,'Compare basis'],[/حفظ سيناريو باسم/g,'Save named scenario'],[/مسح السيناريوهات المحفوظة/g,'Clear saved scenarios'],[/تصدير المقارنة/g,'Export comparison'],[/تحميل/g,'Load'],[/الاسم/g,'Name'],[/التاريخ/g,'Date'],[/الإجراء/g,'Action'],[/المخاطر/g,'Risk'],[/الربح لكل م³/g,'Profit per m³'],
    [/المعادلات الأساسية/g,'Core formulas'],[/مدة النمو/g,'Growing period'],[/الأمطار الموسمية/g,'Seasonal rainfall'],[/معامل المطر الفعال/g,'effective rainfall fraction'],[/الإنتاجية/g,'Yield'],[/المدخل/g,'Input'],[/القيمة/g,'Value'],[/معامل النموذج/g,'Model factor'],[/المؤشر/g,'Metric'],[/قيمة البرنامج/g,'Tool value'],[/القيمة المرجعية/g,'Benchmark'],[/نسبة الاختلاف/g,'Difference %'],[/التفسير/g,'Interpretation'],[/حفظ القيمة المرجعية/g,'Save benchmark'],[/مسح/g,'Clear'],[/تشغيل الاختبار/g,'Run checklist'],[/تصدير الاختبار/g,'Export checklist'],[/عنصر الاختبار/g,'Test item'],[/الحالة/g,'Status'],[/انتظار/g,'Waiting'],
    [/م³\/طن = لتر\/كجم/g,'m³/ton = L/kg'],[/م³\/طن/g,'m³/ton'],[/لتر\/كجم/g,'L/kg'],[/طن\/هكتار/g,'ton/ha'],[/كجم\/م³/g,'kg/m³'],[/مم\/موسم/g,'mm/season'],[/مم\/يوم/g,'mm/day'],[/م³\/هكتار/g,'m³/ha'],[/طن/g,'ton'],[/فدان/g,'feddan']
  ];
  function exactTranslate(s){
    const t = String(s||'').trim();
    if(pairMap.has(t)) return pairMap.get(t);
    return null;
  }
  function chooseSlashPair(s){
    const txt=String(s||'');
    const parts=txt.split(/\s+\/\s+/);
    if(parts.length===2 && hasAr(parts[0])!==hasAr(parts[1])){
      const ar=hasAr(parts[0])?parts[0]:parts[1];
      const en=hasAr(parts[0])?parts[1]:parts[0];
      return isAr()?ar.trim():en.trim();
    }
    return null;
  }
  function applyFragments(s){
    let out=String(s||'');
    const exact=exactTranslate(out); if(exact) return exact;
    const slash=chooseSlashPair(out); if(slash) return slash;
    const list=isAr()?arFragments:enFragments;
    for(const [re,rep] of list) out=out.replace(re,rep);
    if(!isAr()){
      if(typeof window.enC==='function') out=window.enC(out);
      // Final guard: English UI must not show Arabic characters.
      out=out.replace(/[\u0600-\u06FF]+/g,'').replace(/\s{2,}/g,' ').replace(/\s+([,.;:%])/g,'$1').trim();
    }
    return out;
  }
  function shouldSkip(node){
    const p=node.parentElement; if(!p) return true;
    const tag=p.tagName; if(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT','CANVAS'].includes(tag)) return true;
    if(p.closest('#loginOverlay input, script, style')) return true;
    return false;
  }
  let busy=false;
  function strictSanitize(){
    if(busy) return; busy=true;
    try{
      document.documentElement.lang=lang();
      document.documentElement.dir=isAr()?'rtl':'ltr';
      document.title=isAr()?'أداة قرار البصمة المائية — إصدار التحقق والسيناريوهات':'Water Footprint Decision Tool — Validation and Scenario Edition';
      document.querySelectorAll('h1').forEach(h=>{ if(/Water Footprint Decision Tool|أداة قرار البصمة المائية/.test(h.textContent)) h.textContent=isAr()?'أداة قرار البصمة المائية':'Water Footprint Decision Tool'; });
      document.querySelectorAll('.unit').forEach(u=>{ const txt=(u.textContent||'').trim(); if(txt==='m³/ton = L/kg'||txt==='م³/طن = لتر/كجم') u.textContent=isAr()?'م³/طن = لتر/كجم':'m³/ton = L/kg'; });
      // Select options and leaf elements with bilingual slash labels.
      document.querySelectorAll('option,button,span,h2,h3,h4,th,td,div.small,div.k,div.overview-label,div.overview-hint,label.check-row,strong').forEach(el=>{
        if(el.children.length>0 && !['OPTION','BUTTON','TH','TD','STRONG'].includes(el.tagName)) return;
        const old=el.textContent; if(!old || !old.trim()) return;
        const nu=applyFragments(old);
        if(nu && nu!==old) el.textContent=nu;
      });
      // Text-node pass for notes, tables and dynamic report blocks.
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
        if(shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        const s=node.nodeValue; if(!s || !s.trim()) return NodeFilter.FILTER_REJECT;
        if(isAr()){
          return (hasLatin(s) || /\s+\/\s+/.test(s)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
        return hasAr(s) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }});
      const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
      for(const n of nodes){ const old=n.nodeValue; const nu=applyFragments(old); if(nu!==old) n.nodeValue=nu; }
      // Login/admin fixed labels.
      const loginLabels=[['loginUser','اسم المستخدم','Username'],['loginPass','كلمة المرور','Password']];
      loginLabels.forEach(([id,ar,en])=>{const el=document.getElementById(id); if(el) el.placeholder=isAr()?ar:en;});
      const sel=document.getElementById('languageSelect'); if(sel) sel.value=lang();
    }catch(e){console.warn('Strict bilingual layer:',e);} finally{busy=false;}
  }
  let scheduled=false;
  function schedule(){ if(scheduled) return; scheduled=true; setTimeout(()=>{scheduled=false; strictSanitize();},80); }
  const prevApply=window.applyLanguage;
  if(typeof prevApply==='function'){
    window.applyLanguage=function(){ const r=prevApply.apply(this,arguments); schedule(); return r; };
  }
  const prevUpdate=window.update;
  if(typeof prevUpdate==='function' && !prevUpdate.__strictLangWrapped){
    window.update=function(){ const r=prevUpdate.apply(this,arguments); schedule(); return r; };
    window.update.__strictLangWrapped=true;
  }
  document.addEventListener('change',e=>{ if(e.target && e.target.id==='languageSelect') setTimeout(strictSanitize,30); });
  const mo=new MutationObserver(schedule);
  if(document.body) mo.observe(document.body,{childList:true,subtree:true,characterData:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(strictSanitize,300)); else setTimeout(strictSanitize,300);
  window.strictBilingualSanitize=strictSanitize;
})();

