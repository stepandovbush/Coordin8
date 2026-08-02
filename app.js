function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (screen) {
   screen.classList.toggle('active',screen.id === id);
  });
}

// intro splash

var introOverlay = document.getElementById('screen-intro');

setTimeout(function () {
  introOverlay.classList.add('flip-out');
  setTimeout(function() {
    introOverlay.classList.add('hidden');
   }, 750);
}, 1100);

// profile widget stuff

var loggedInEmail = '';
var profileWidget = document.getElementById('profile-widget');
var profileToggle=document.getElementById('profile-toggle');
var profileAvatar = document.getElementById('profile-avatar');
var profileEmail = document.getElementById('profile-email');

function setLoggedInProfile(email) {
  loggedInEmail = email;
 document.body.classList.add('is-authed');
  profileEmail.textContent = email;
  profileAvatar.textContent = email.charAt(0) || '?';
}

profileToggle.addEventListener('click', function () {
  profileWidget.classList.toggle('collapsed');
});

document.getElementById('profile-logout').addEventListener('click', function() {
  document.body.classList.remove('is-authed');
   loggedInEmail = '';
 showScreen('screen-auth');
});

// auth screen

var tabs = document.querySelectorAll('.tab');
var authSubmit = document.getElementById('auth-submit');
var authSubtitle = document.getElementById('auth-subtitle');
var confirmWrap = document.getElementById('confirm-password-wrap');
var confirmInput = document.getElementById('auth-confirm-password');

function setTab(name) {
  tabs.forEach(function (t) {
    t.classList.toggle('active', t.dataset.tab === name);
 });
  if (name === 'signup') {
     authSubmit.textContent = 'Create Account';
    authSubtitle.textContent='Create your account to get started.';
    confirmWrap.classList.remove('hidden');
   confirmInput.setAttribute('required','');
    } else {
   authSubmit.textContent = 'Continue';
    authSubtitle.textContent = 'Welcome back. Log in to continue.';
    confirmWrap.classList.add('hidden');
    confirmInput.removeAttribute('required');
    }
}

tabs.forEach(function (tab) {
  tab.addEventListener('click',function () { setTab(tab.dataset.tab); });
});

var requestedTab = new URLSearchParams(window.location.search).get('tab');
if (requestedTab === 'signup' || requestedTab === 'login') {
  setTab(requestedTab);
}

var authForm = document.getElementById('auth-form');
var authError = document.getElementById('auth-error');
var pendingIsSignup = false;
var pendingEmail = '';

authForm.addEventListener('submit',function (e) {
  e.preventDefault();
  var isSignup = document.querySelector('.tab.active').dataset.tab === 'signup';
   var email = document.getElementById('auth-email').value.trim();
  var password = document.getElementById('auth-password').value;

  if (!email || !password) {
    authError.textContent='Enter an email and password to continue.';
    return;
  }
   if (password.length < 6) {
    authError.textContent = 'Password needs to be at least 6 characters.';
    return;
  }
  if (isSignup && password !== confirmInput.value) {
    authError.textContent = "Passwords don't match.";
     return;
  }

  authError.textContent='';
  pendingIsSignup = isSignup;
  pendingEmail = email;
    newCaptcha();
  showScreen('screen-captcha');
});

//captcha

var captchaCanvas = document.getElementById('captcha-canvas');
var ctx = captchaCanvas.getContext('2d');
var captchaInput = document.getElementById('captcha-input');
var captchaError = document.getElementById('captcha-error');
var currentCode='';

var CAPTCHA_LENGTH = 8;
var MAX_ATTEMPTS = 5;
var LOCKOUT_MS=20000;
var failedAttempts = 0;
var lockedUntil = 0;

function randomCode(length) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 var code = '';
  for (var i = 0; i < length; i++) {
     code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function drawCaptcha(code) {
  var w = captchaCanvas.width;
  var h = captchaCanvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#0e0e12';
  ctx.fillRect(0, 0, w, h);

  // dense crossing noise lines, varied width and curve
  for (var i = 0; i < 14; i++) {
    ctx.strokeStyle = 'rgba(99, 102, 241, ' + (0.12 + Math.random() * 0.3) + ')';
     ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h
    );
     ctx.stroke();
 }

  // background scatter of small arcs to break up OCR edge-detection
  for (var m = 0; m < 18; m++) {
   ctx.strokeStyle = 'rgba(245,245,247,' + (Math.random() * 0.12) + ')';
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 10, 0, Math.PI * 2);
    ctx.stroke();
    }

  var spacing = w / (code.length + 1);
   for (var j = 0; j < code.length; j++) {
    ctx.save();
    // sine-wave baseline offset plus jitter, so characters don't sit on a clean line
    var x = spacing * (j + 1) + (Math.random() * 10 - 5);
      var y = h / 2 + Math.sin(j * 1.7) * (h * 0.18) + (Math.random() * 10 - 5);
    ctx.translate(x, y);
     ctx.rotate((Math.random() * 0.7 - 0.35));
    ctx.scale(0.85 + Math.random() * 0.4, 0.85 + Math.random() * 0.4);
    ctx.fillStyle = j % 2 === 0 ? '#5eead4' : '#f5f5f7';
    var size = 26 + Math.floor(Math.random() * 10);
    ctx.font = '700 ' + size + 'px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
     ctx.fillText(code[j], 0, 0);
    ctx.restore();
  }

  // foreground speckle on top of the characters
  for (var k = 0; k < 90; k++) {
     ctx.fillStyle='rgba(245, 245, 247, ' + (Math.random() * 0.14) + ')';
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

function newCaptcha() {
  currentCode = randomCode(CAPTCHA_LENGTH);
  drawCaptcha(currentCode);
  captchaInput.value = '';
  captchaError.textContent = '';
}

document.getElementById('captcha-refresh').addEventListener('click',newCaptcha);

document.getElementById('captcha-verify').addEventListener('click', function () {
  var now = Date.now();
  if (now < lockedUntil) {
    var secsLeft = Math.ceil((lockedUntil - now) / 1000);
    captchaError.textContent='Too many attempts. Try again in ' + secsLeft + 's.';
     return;
  }

  var attempt = captchaInput.value.trim().toUpperCase();
  if (attempt === currentCode) {
    captchaError.textContent = '';
      failedAttempts = 0;
    if(pendingIsSignup) {
      newVerifyCode();
      showScreen('screen-verify');
    } else {
      setLoggedInProfile(pendingEmail);
       showScreen('screen-slideshow');
       goToSlide(0);
    }
  } else {
   failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_MS;
      failedAttempts = 0;
      captchaError.textContent = 'Too many attempts. Try again in ' + (LOCKOUT_MS / 1000) + 's.';
    } else {
      captchaError.textContent = "That didn't match. Try the new code.";
      }
    newCaptcha();
  }
});

captchaInput.addEventListener('keydown', function (e) {
  if(e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('captcha-verify').click();
  }
});

// email verify

var VERIFY_LENGTH = 8;
var VERIFY_MAX_ATTEMPTS = 5;
var VERIFY_LOCKOUT_MS = 20000;
var verifyCode = '';
var verifyFailedAttempts = 0;
var verifyLockedUntil = 0;
var verifyInput=document.getElementById('verify-input');
var verifyError = document.getElementById('verify-error');
var verifyEmailTarget = document.getElementById('verify-email-target');
var verifyDemoHint = document.getElementById('verify-demo-hint');

function newVerifyCode() {
  verifyCode = randomCode(VERIFY_LENGTH);
  verifyInput.value = '';
  verifyError.textContent = '';
  verifyEmailTarget.textContent = pendingEmail || 'your email';
  verifyDemoHint.textContent = 'Demo mode, no real email sent. Your code: ' + verifyCode;
}

document.getElementById('verify-resend').addEventListener('click', newVerifyCode);

document.getElementById('verify-submit').addEventListener('click', function () {
  var now = Date.now();
  if (now < verifyLockedUntil) {
    var secsLeft=Math.ceil((verifyLockedUntil - now) / 1000);
    verifyError.textContent='Too many attempts. Try again in ' + secsLeft + 's.';
    return;
  }

  var attempt = verifyInput.value.trim().toUpperCase();
  if (attempt === verifyCode) {
    verifyError.textContent='';
    verifyFailedAttempts = 0;
     setLoggedInProfile(pendingEmail);
    showScreen('screen-slideshow');
   goToSlide(0);
  } else {
    verifyFailedAttempts++;
      if (verifyFailedAttempts >= VERIFY_MAX_ATTEMPTS) {
      verifyLockedUntil = Date.now() + VERIFY_LOCKOUT_MS;
      verifyFailedAttempts = 0;
      verifyError.textContent = 'Too many attempts. Try again in ' + (VERIFY_LOCKOUT_MS / 1000) + 's.';
    } else {
       verifyError.textContent = "That code doesn't match. Try again or resend.";
    }
   }
});

verifyInput.addEventListener('keydown', function (e) {
  if(e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('verify-submit').click();
  }
});



var slidesViewport=document.getElementById('slides-viewport');
var slidesTrack = document.getElementById('slides-track');
var slides=document.querySelectorAll('.slide');
var dots = document.querySelectorAll('.dot-nav');
var slideNext = document.getElementById('slide-next');
var slideBack = document.getElementById('slide-back');
var slideSkip = document.getElementById('slide-skip');
var currentSlide = 0;
var slideCount = slides.length;

function goToSlide(index) {
  currentSlide=Math.max(0, Math.min(index, slideCount - 1));
   slidesTrack.style.transform = 'translateX(-' + (currentSlide * slidesViewport.offsetWidth) + 'px)';
  dots.forEach(function (dot, i) {
    dot.classList.toggle('active', i === currentSlide);
    });
  slideBack.disabled=currentSlide === 0;
  slideNext.textContent = currentSlide === slideCount - 1 ? 'Enter Coordin8' : 'Next';
}

slideNext.addEventListener('click', function() {
   if (currentSlide === slideCount - 1) {
    showScreen('screen-choice');
  } else {
    goToSlide(currentSlide + 1);
 }
});

slideBack.addEventListener('click', function () {
  goToSlide(currentSlide - 1);
});

slideSkip.addEventListener('click',function () {
  showScreen('screen-choice');
});

dots.forEach(function (dot) {
  dot.addEventListener('click', function () {
    goToSlide(Number(dot.dataset.index));
  });
});

document.addEventListener('keydown', function (e) {
  if(!document.getElementById('screen-slideshow').classList.contains('active')) return;
  if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
   if(e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
});

/* drag / swipe support */
var dragStartX = 0;
var dragDeltaX = 0;
var isDragging = false;

function dragStart(x) {
  isDragging = true;
  dragStartX = x;
  dragDeltaX = 0;
  slidesTrack.classList.add('no-transition');
 slidesViewport.classList.add('dragging');
}

function dragMove(x) {
  if (!isDragging) return;
  dragDeltaX = x - dragStartX;
  var basePx = currentSlide * slidesViewport.offsetWidth;
  slidesTrack.style.transform = 'translateX(-' + (basePx - dragDeltaX) + 'px)';
}

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  slidesTrack.classList.remove('no-transition');
  slidesViewport.classList.remove('dragging');

  if (Math.abs(dragDeltaX) > 60) {
    goToSlide(currentSlide + (dragDeltaX < 0 ? 1 : -1));
   } else {
      goToSlide(currentSlide);
  }
}

slidesViewport.addEventListener('mousedown', function(e) { dragStart(e.clientX); });
document.addEventListener('mousemove', function (e) { dragMove(e.clientX); });
document.addEventListener('mouseup', dragEnd);

slidesViewport.addEventListener('touchstart', function(e) { dragStart(e.touches[0].clientX); }, { passive: true });
slidesViewport.addEventListener('touchmove', function (e) { dragMove(e.touches[0].clientX); }, { passive: true });
slidesViewport.addEventListener('touchend', dragEnd);

// choice screen

document.getElementById('choice-host').addEventListener('click', function () {
  showScreen('screen-host');
  initHostMap();
});

document.getElementById('choice-join').addEventListener('click', function () {
   showScreen('screen-join');
});

document.getElementById('choice-browse').addEventListener('click', function () {
  showScreen('screen-browse');
  renderBrowseGrid();
});


var BROWSE_EVENTS = [
 { title: 'Fall Harvest Festival', tag: 'Festival', desc: 'Live music, food trucks, and a pumpkin patch on the main lawn.', time: '2:00 PM', photo: 'https://live.staticflickr.com/3054/2651595508_ecf290cf47_b.jpg', location: 'Main lawn, behind the gym', contact: 'Student Activities Office' },
  { title: 'Weekly Work Meeting', tag: 'Meeting', desc: 'Team sync, bring your laptop.', time: '10:00 AM', photo: 'https://live.staticflickr.com/104/276373742_ac55edbb75_b.jpg', location: 'Conference Room B, 3rd floor', contact: 'Front desk' },
  { title: 'Robotics Workshop', tag: 'Workshop', desc: 'Room 204, build and test until 3.', time: 'Live now', photo: 'https://live.staticflickr.com/188/468781489_3ce14f3050_b.jpg', location: 'Room 204', contact: 'Mr. Alvarez, robotics coach' },
  { title: 'Art Club Open Studio', tag: 'Club', desc: 'Drop in, all supplies provided.', time: '1:30 PM', photo: 'https://live.staticflickr.com/4181/34385421571_cce952674f.jpg', location: 'Art wing, Studio 3', contact: 'Ms. Park' },
    { title: 'Intramural Basketball', tag: 'Sports', desc: 'Gym B, open scrimmage.', time: '4:00 PM', photo: 'https://live.staticflickr.com/26/67699808_a56fdb12dd_b.jpg', location: 'Gym B', contact: 'Coach Ramirez' },
  { title: 'Library Study Hall',tag: 'Study',desc: 'Quiet floor,2nd level.',time: 'All day',photo: 'https://live.staticflickr.com/4/4597085_2a86284727_b.jpg',location: 'Library,2nd floor quiet zone',contact: 'Library front desk' },  { title: 'Downtown Night Market', tag: 'Festival', desc: 'Vendor stalls, street food, and live DJs until close.', time: '6:00 PM', photo: 'https://live.staticflickr.com/7224/27620536835_6893835a66_b.jpg', location: 'Main Street plaza', contact: 'Downtown Events Committee' },
  { title: 'Open Mic Night', tag: 'Social', desc: 'Sign up at the door, 5 min sets.', time: '7:00 PM', photo: 'https://live.staticflickr.com/1200/606799920_e95ce759ec_b.jpg', location: 'Student lounge', contact: 'Sign-up sheet at the door' },
  { title: 'Hackathon Judging', tag: 'Competition', desc: 'Table 12, be ready 10 min early.', time: '4:00 PM', photo: 'https://live.staticflickr.com/6160/6202765137_fc85027f30_b.jpg', location: 'Expo hall, Table 12', contact: 'Event volunteers in orange shirts' },
  { title: 'Lunch Service', tag: 'Dining', desc: 'Cafeteria, today’s special posted inside.', time: '12:00 PM', photo: 'https://live.staticflickr.com/7173/6803434155_385f4b2bf7_b.jpg', location: 'Main cafeteria', contact: 'Dining staff' },
  { title: 'Chemistry Lab Makeup', tag: 'Class', desc: 'Bring goggles, Room 118.', time: '9:30 AM', photo: 'https://live.staticflickr.com/2192/2097753744_184f05d463_b.jpg', location: 'Room 118, chem lab', contact: 'Dr. Whitfield' },
    { title: 'Band Rehearsal', tag: 'Music', desc: 'Auditorium, full ensemble.', time: '3:15 PM', photo: 'https://live.staticflickr.com/5018/5457291346_8aea1ef4d0_b.jpg', location: 'Main auditorium', contact: 'Band director' },
  { title: 'Sunrise Yoga & Stretch',tag: 'Wellness',desc: 'Mats provided,courtyard lawn.',time: '8:00 AM',photo: 'https://live.staticflickr.com/2833/9381966010_e46709c52d_b.jpg',location: 'Courtyard lawn',contact: 'Wellness Center' },  { title: 'Investor Pitch Practice', tag: 'Meeting', desc: 'Conference room A, 5 min slots.', time: '11:00 AM', photo: 'https://live.staticflickr.com/6033/6231225936_38322fbb69_b.jpg', location: 'Conference Room A', contact: 'Sign up on the shared calendar' },
  { title: 'Campus Garden Volunteers', tag: 'Volunteer', desc: 'Meet by the east entrance.', time: '9:00 AM', photo: 'https://live.staticflickr.com/109/311529439_a2c305162d_b.jpg', location: 'East entrance, garden beds', contact: 'Garden club lead' },
  { title: 'Retro Game Night',tag: 'Social',desc: 'Board games and consoles,student lounge.',time: '7:30 PM',photo: 'https://live.staticflickr.com/7086/7180304860_f2d85b90ae_b.jpg',location: 'Student lounge',contact: 'Rec committee' },    { title: 'New Student Orientation', tag: 'Meeting', desc: 'Meet in the main lobby.', time: '9:00 AM', photo: 'https://live.staticflickr.com/3066/2865602649_ec28b802e5_b.jpg', location: 'Main lobby', contact: 'Orientation leaders in blue shirts' },
  { title: 'Drama Club Auditions', tag: 'Club', desc: 'Black box theater, sign-up sheet outside.', time: '4:30 PM', photo: 'https://live.staticflickr.com/5504/14245166633_6726a7be79_b.jpg', location: 'Black box theater', contact: 'Drama club officers' },
 { title: 'Science Fair Setup',tag: 'Competition',desc: 'Gym floor,tables assigned by entry number.',time: '1:00 PM',photo: 'https://live.staticflickr.com/4054/4455483509_919a86f3da_b.jpg',location: 'Main gym floor',contact: 'Science department office' },  { title: 'Coffee & Career Chat', tag: 'Meeting', desc: 'Alumni panel, informal Q&A.', time: '10:30 AM', photo: 'https://live.staticflickr.com/18/24171123_685e298fcd_b.jpg', location: 'Alumni lounge', contact: 'Career Services' },
  { title: 'Spring Music Festival',tag: 'Festival',desc: 'Three stages,doors open at noon,ends at sundown.',time: '12:00 PM',photo: 'https://live.staticflickr.com/4138/4810114020_3d167d3fe9_b.jpg',location: 'Athletic field,three stages',contact: 'Festival info booth' },  { title: 'Trivia Night', tag: 'Social', desc: 'Teams of 4, prizes for top 3.', time: '6:30 PM', photo: 'https://live.staticflickr.com/25/67103477_cd2245e285_b.jpg', location: 'Cafeteria, after hours', contact: 'Student council' },
   { title: 'Maker Space Open Hours', tag: 'Workshop', desc: 'Laser cutter and 3D printers available.', time: '2:00 PM', photo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Makerspace_3d_printers_full_size.jpg', location: 'Maker Space, basement level', contact: 'Maker Space staff' },
  { title: 'Yearbook Photos', tag: 'Service', desc: 'Room 102, walk-ins welcome.', time: '10:00 AM', photo: 'https://live.staticflickr.com/5212/5435607398_a15cc8f590_b.jpg', location: 'Room 102', contact: 'Yearbook committee' },
  { title: 'Podcast Recording', tag: 'Media', desc: 'Quiet please, on-air light means on-air.', time: '3:00 PM', photo: 'https://live.staticflickr.com/7405/12109606803_8b60effc89.jpg', location: 'Media studio, Room 210', contact: 'Media club' },
  { title: 'Street Food Festival', tag: 'Festival', desc: 'Over 30 vendors, live music on the plaza stage.', time: '5:00 PM', photo: 'https://live.staticflickr.com/7185/7088914497_14db0d8728_b.jpg', location: 'Central plaza', contact: 'City Events Office' }
];

var BROWSE_NAMES = ['Jordan', 'Maya', 'Alex', 'Priya', 'Sam', 'Riley', 'Chen', 'Noah', 'Aisha', 'Diego', 'Emma', 'Liam', 'Zoe', 'Marcus', 'Grace'];

function randomPostedMeta() {
   var name = BROWSE_NAMES[Math.floor(Math.random() * BROWSE_NAMES.length)];
  var value = 1 + Math.floor(Math.random() * 59);
  var unit = Math.random() > 0.5 ? 'm' : 'h';
  if (unit === 'h') value = 1 + Math.floor(Math.random() * 5);
   return name + ' &middot; ' + value + unit + ' ago';
}

var browseGridRendered = false;

function renderBrowseGrid() {
  if (browseGridRendered) return;
  var grid = document.getElementById('browse-grid');
  var html='';
   BROWSE_EVENTS.forEach(function (ev, i) {
   ev.postedMeta = randomPostedMeta();
      var tagClass = 'browse-photo--' + ev.tag.toLowerCase();
    html += '<div class="browse-card" data-index="' + i + '">' +
      '<div class="browse-photo ' + tagClass + '">' +
          '<img src="' + ev.photo + '" alt="' + ev.title + '" loading="lazy" ' +
          'onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<div class="browse-body">' +
         '<div class="browse-tags">' +
          '<span class="browse-tag">' + ev.tag + '</span>' +
          '<span class="browse-tag browse-tag--live">&#9679; ' + ev.time + '</span>' +
        '</div>' +
        '<div class="browse-title">' + ev.title + '</div>' +
         '<div class="browse-desc">' + ev.desc + '</div>' +
        '<div class="browse-meta">' +
          '<span class="browse-avatar"></span>' +
          '<span>Posted by ' + ev.postedMeta + '</span>' +
          '</div>' +
      '</div>' +
    '</div>';
    });
  grid.innerHTML=html;
  browseGridRendered = true;
}

document.getElementById('browse-grid').addEventListener('click', function (e) {
  var card = e.target.closest('.browse-card');
  if (!card) return;
  openBrowseDetail(BROWSE_EVENTS[Number(card.dataset.index)]);
});

function openBrowseDetail(ev) {
 var modal=document.getElementById('browse-detail');
  var tagClass = 'browse-photo--' + ev.tag.toLowerCase();

  document.getElementById('browse-detail-body').innerHTML =
    '<div class="browse-photo browse-detail-photo ' + tagClass + '">' +
      '<img src="' + ev.photo + '" alt="' + ev.title + '" onerror="this.style.display=\'none\'">' +
    '</div>' +
    '<div class="browse-tags">' +
      '<span class="browse-tag">' + ev.tag + '</span>' +
      '<span class="browse-tag browse-tag--live">&#9679; ' + ev.time + '</span>' +
    '</div>' +
    '<h2 class="browse-detail-title">' + ev.title + '</h2>' +
   '<p class="browse-detail-desc">' + ev.desc + '</p>' +
    '<div class="browse-detail-fact"><span>Location</span>' + ev.location + '</div>' +
    '<div class="browse-detail-fact"><span>Who can help</span>' + ev.contact + '</div>' +
    '<div class="browse-meta"><span class="browse-avatar"></span><span>Posted by ' + ev.postedMeta + '</span></div>';

  modal.classList.add('open');
}

document.getElementById('browse-detail-close').addEventListener('click', function () {
  document.getElementById('browse-detail').classList.remove('open');
});

document.getElementById('browse-detail').addEventListener('click', function(e) {
  if (e.target.id === 'browse-detail') {
    document.getElementById('browse-detail').classList.remove('open');
  }
});

document.querySelectorAll('.back-link').forEach(function (btn) {
  btn.addEventListener('click', function() {
    showScreen(btn.dataset.back);
  });
});

// join

var joinForm = document.getElementById('join-form');
var joinError = document.getElementById('join-error');

joinForm.addEventListener('submit',function (e) {
  e.preventDefault();
  var code=document.getElementById('join-code').value.trim();

  if (!code) {
    joinError.textContent = 'Enter a code to join an event.';
    return;
 }

  joinError.textContent='';
    dashRole = 'guest';
  showScreen('screen-blank');
  renderDashboard();
});

// host screen stuff

var hostForm = document.getElementById('host-form');
var hostError = document.getElementById('host-error');
var hostMap = null;
var hostMarker = null;
var hostMapHint = document.getElementById('host-map-hint');

function initHostMap() {
 if (hostMap) {
    setTimeout(function () { hostMap.invalidateSize(); }, 0);
     return;
  }

 setTimeout(function() {
    hostMap=L.map('host-map', { attributionControl: false }).setView([40.7128, -74.006], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(hostMap);

    hostMap.on('click', function (e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;

      if(hostMarker) {
        hostMarker.setLatLng(e.latlng);
        } else {
         hostMarker=L.marker(e.latlng).addTo(hostMap);
       }

      document.getElementById('host-lat').value=lat;
      document.getElementById('host-lng').value = lng;
      hostMapHint.textContent = 'Pin dropped at ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
    });

    hostMap.invalidateSize();
  }, 0);
}

//tags

var hostTags = [];
var hostTagInput = document.getElementById('host-tag-input');
var hostTagList = document.getElementById('host-tag-list');
var hostTagsField = document.getElementById('host-tags');

var hostRequirementSelect = document.getElementById('host-requirement');
var hostRequirementCustom = document.getElementById('host-requirement-custom');

hostRequirementSelect.addEventListener('change', function () {
  hostRequirementCustom.classList.toggle('hidden',hostRequirementSelect.value !== 'custom');
  if (hostRequirementSelect.value !== 'custom') hostRequirementCustom.value = '';
});

function renderHostTags() {
   hostTagList.innerHTML = '';
  hostTags.forEach(function (tag) {
    var chip=document.createElement('span');
    chip.className = 'tag-chip';

    var label = document.createElement('span');
    label.textContent = '#' + tag;
    chip.appendChild(label);

    var remove = document.createElement('button');
    remove.type = 'button';
     remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove tag ' + tag);
    remove.addEventListener('click',function () {
      hostTags = hostTags.filter(function (t) { return t !== tag; });
      renderHostTags();
    });
    chip.appendChild(remove);

    hostTagList.appendChild(chip);
   });
   hostTagsField.value = hostTags.join(',');
}

function addHostTag(raw) {
   var tag = raw.trim().replace(/^#+/, '').toLowerCase();
  if (!tag || hostTags.indexOf(tag) !== -1) return;
  hostTags.push(tag);
  renderHostTags();
}

hostTagInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
    addHostTag(hostTagInput.value);
    hostTagInput.value = '';
   } else if (e.key === 'Backspace' && !hostTagInput.value && hostTags.length) {
    hostTags.pop();
    renderHostTags();
  }
});

hostTagInput.addEventListener('blur', function () {
  if (hostTagInput.value.trim()) {
    addHostTag(hostTagInput.value);
    hostTagInput.value = '';
  }
});

hostForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById('host-name').value.trim();
   var location = document.getElementById('host-location').value.trim();

  if (!name || !location) {
   hostError.textContent = 'Give your event a name and a location.';
    return;
  }

 hostError.textContent = '';

  var lat = parseFloat(document.getElementById('host-lat').value);
  var lng = parseFloat(document.getElementById('host-lng').value);
  var requirement = hostRequirementSelect.value === 'custom'
    ? hostRequirementCustom.value.trim()
    : hostRequirementSelect.value;

 eventData = {
    name: name,
    botName: deriveBotName(name),
    info: document.getElementById('host-info').value.trim(),
   location: location,
      contact: document.getElementById('host-contact').value.trim(),
     extra: document.getElementById('host-extra').value.trim(),
    tags: hostTags.slice(),
     requirement: requirement,
    pastedInfo: '',
    code: generateEventCode(),
    lat: isNaN(lat) ? 40.7128 : lat,    lng: isNaN(lng) ? -74.006 : lng
  };
  dashRole = 'host';
  chatLog = [];
  activityLog = []; // reset per event
  dmThreads = {};
   activeDmPerson=null;
  mapFriends = [];
  window.__youPos = null;

  showScreen('screen-blank');
  renderDashboard();
});

// dashboard

function generateEventCode() {
   return randomCode(3) + '-' + Math.floor(100 + Math.random() * 900);
}

var dashRole = "guest";
var eventData = {
  name: '',
  botName: 'EventBot',
  info: '',
    location: '',
    contact: '',
  extra: '',  tags: [],
  requirement: '',
  pastedInfo: '',  code: '',
   lat: 40.7128,
  lng: -74.006
};
var chatLog = [];
var activityLog = [];
var dmPeople = ['Alex','Jordan','Sam'];
var dmThreads = {};
var activeDmPerson = null;

function deriveBotName(name) {
  var firstWord = (name || '').trim().split(/\s+/)[0] || '';
  var clean=firstWord.replace(/[^a-zA-Z0-9]/g,'');
   if (!clean) return 'EventBot';
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() + 'Bot';
}

function buildKnowledgeText() {
  return [
   eventData.info,
    eventData.location ? ('Location: ' + eventData.location) : '',
    eventData.contact ? ('Who can help: ' + eventData.contact) : '',
     eventData.extra,
    eventData.tags && eventData.tags.length ? ('Tags: ' + eventData.tags.join(', ')) : '',
    eventData.requirement ? ('Who can attend: ' + eventData.requirement) : '',
   eventData.pastedInfo
  ].filter(Boolean).join('\n');
}

function answerQuestion(question) {
  var knowledge=buildKnowledgeText();
  if (!knowledge.trim()) {
     return "The host hasn't added any info yet,try asking again later or reach out directly.";
   }

  var lines = knowledge.split(/\n+/).filter(Boolean);
  var qWords = (question.toLowerCase().match(/[a-z0-9']+/g) || []).filter(function (w) { return w.length > 2; });
  var best = null;
  var bestScore = 0;

   lines.forEach(function(line) {
    var lWords = line.toLowerCase().match(/[a-z0-9']+/g) || [];
    var score = qWords.filter(function (w) { return lWords.indexOf(w) !== -1; }).length;
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
   });

  if (best) return best;
  return "I don't have an answer for that yet, try asking the host or check back once more info's added.";
}

var GROQ_API_KEY = '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';
var GROQ_MODEL = 'llama-3.1-8b-instant';

// real LLM call, falls back to the keyword matcher above if the request fails so chat never dead-ends
function answerQuestionAI(question) {
  var knowledge = buildKnowledgeText();
  if (!knowledge.trim()) {
     return Promise.resolve("The host hasn't added any info yet, try asking again later or reach out directly.");
  }

  var systemPrompt='You are ' + (eventData.botName || 'EventBot') + ', a helpful on-site assistant for the event "' +
    (eventData.name || 'this event') + '". Answer guest questions using ONLY the event info below. Keep answers to ' +
     '1-3 short sentences, friendly and direct. If the info below does not cover the question, say you are not sure ' +
    'and suggest asking the host.\n\nEvent info:\n' + knowledge;

  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
     body: JSON.stringify({
      model: GROQ_MODEL,      messages: [
       { role: 'system',content: systemPrompt },         { role: 'user', content: question }
      ],      temperature: 0.4,
      max_tokens: 200
    })
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Groq request failed: ' + res.status);
      return res.json();
    })
     .then(function (data) {
      var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      return (text && text.trim()) || answerQuestion(question);
     })
    .catch(function () {
      return answerQuestion(question);
    });
}

var dashChatLog = document.getElementById('dash-chat-log');
var dashChatForm=document.getElementById('dash-chat-form');
var dashChatInput = document.getElementById('dash-chat-input');

function appendChatBubble(who,text) {
 var bubble=document.createElement('div');
  bubble.className = 'dash-msg ' + who;
  bubble.textContent = text;
  dashChatLog.appendChild(bubble);
  dashChatLog.scrollTop = dashChatLog.scrollHeight;
}

dashChatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  var question = dashChatInput.value.trim();
  if (!question) return;

  chatLog.push({ who: 'user', text: question });
  appendChatBubble('user',question);
   dashChatInput.value = '';

  var typingBubble = document.createElement('div');
  typingBubble.className = 'dash-msg bot dash-msg--typing';
  typingBubble.textContent = '...';
   dashChatLog.appendChild(typingBubble);
  dashChatLog.scrollTop=dashChatLog.scrollHeight;

  answerQuestionAI(question).then(function (answer) {
    typingBubble.remove();
     chatLog.push({ who: 'bot',text: answer });
    appendChatBubble('bot', answer);
   logActivity(question, answer);
 });
});

function logActivity(question, answer) {
  activityLog.push({ question: question, answer: answer, time: new Date() });
  renderActivityLog();
}

function renderActivityLog() {
  var container=document.getElementById('dash-activity-log');
  if (!activityLog.length) {
    container.innerHTML = '<p class="dash-empty">No questions yet.</p>';
    return;
  }

  container.innerHTML='';
  activityLog.slice().reverse().forEach(function(entry) {
      var card = document.createElement('div');
    card.className = 'dash-activity-entry';

    var q=document.createElement('div');
   q.className = 'q';
    q.textContent = entry.question;

    var a = document.createElement('div');
    a.className = 'a';
    a.textContent=entry.answer;

    var meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = entry.time.toLocaleTimeString();

    card.appendChild(q);
    card.appendChild(a);
    card.appendChild(meta);
   container.appendChild(card);
  });
}

var dashInfoInput = document.getElementById('dash-info-input');
var dashInfoSaved = document.getElementById('dash-info-saved');

document.getElementById('dash-info-save').addEventListener('click', function() {
  eventData.pastedInfo = dashInfoInput.value.trim();
 dashInfoSaved.textContent = 'Saved. ' + (eventData.botName || 'EventBot') + ' now knows this.';
  setTimeout(function() { dashInfoSaved.textContent=''; }, 2500);
});

function renderDmPeople() {
  var list = document.getElementById('dash-dm-people');
  list.innerHTML='';
  dmPeople.forEach(function (name) {
    var li = document.createElement('li');
    li.textContent = name;
    li.className = name === activeDmPerson ? 'active' : '';
    li.addEventListener('click',function () {
      activeDmPerson=name;
      renderDmPeople();
      renderDmThread();
    });
     list.appendChild(li);
  });
}

function renderDmThread() {
  var log = document.getElementById('dash-dm-log');
  log.innerHTML='';

  if (!activeDmPerson) {
    log.innerHTML = '<p class="dash-empty">Pick someone to message.</p>';
     return;
 }

  var thread = dmThreads[activeDmPerson] || [];
  if (!thread.length) {
     log.innerHTML = '<p class="dash-empty">No messages with ' + activeDmPerson + ' yet.</p>';
    return;
  }

   thread.forEach(function(msg) {
    var bubble = document.createElement('div');
    bubble.className='dash-msg ' + (msg.who === 'host' ? 'user' : 'bot');
    bubble.textContent = msg.text;
   log.appendChild(bubble);
  });
  log.scrollTop = log.scrollHeight;
}

document.getElementById('dash-dm-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var input = document.getElementById('dash-dm-input');
 var text=input.value.trim();
  if (!text || !activeDmPerson) return;

  if(!dmThreads[activeDmPerson]) dmThreads[activeDmPerson] = [];
  dmThreads[activeDmPerson].push({ who: 'host', text: text });
  input.value='';
 renderDmThread();
});

// open chat

var openChatLog = document.getElementById('dash-open-log');
var openChatForm = document.getElementById('dash-open-form');
var openChatInput=document.getElementById('dash-open-input');
var openChatMessages = [];

function appendOpenBubble(who, text) {
  var bubble = document.createElement('div');
 bubble.className = 'dash-msg ' + who;
  bubble.textContent = text;
  openChatLog.appendChild(bubble);
  openChatLog.scrollTop = openChatLog.scrollHeight;
}

openChatForm.addEventListener('submit',function(e) {
  e.preventDefault();
  var text = openChatInput.value.trim();
  if (!text) return;

  openChatMessages.push({ who: 'user',text: text });
  appendOpenBubble('user',text);
  openChatInput.value = '';
});

document.querySelectorAll('.dash-nav-item[data-dash-tab]').forEach(function (btn) {
  btn.addEventListener('click',function () {
   document.querySelectorAll('.dash-nav-item').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var tab = btn.dataset.dashTab;
    document.querySelectorAll('.dash-tab').forEach(function (sec) {
      sec.classList.toggle('active', sec.dataset.dashTab === tab);
    });
  });
});

document.getElementById('dash-open-map').addEventListener('click', function () {
   initLiveMap();
});

/* directions tab now uses the 3D scan below (dash-open-journey needs no separate init) */

// 3d area view

var area3dRenderer=null;
var area3dScene = null;
var area3dCamera = null;
var area3dControls=null;
var area3dBuildingGroup = null;
var area3dGround = null;
var area3dAnnotationGroup = null;
var area3dActiveTool = null;
var area3dPendingLineStart = null;
var area3dPendingLineMarker = null;
var area3dRaycaster = null;
var area3dSunLight = null;
var area3dAmbientLight = null;
var area3dSkyDome = null;
var area3dSunMoon = null;
var area3dStars = null;
var area3dWindowMaterial = null;
var area3dTimeOfDay = 'night';

function makeSkyDome(topColor,bottomColor) {
  var radius = 1800;
  var geo = new THREE.SphereGeometry(radius, 24, 16);
  var pos = geo.attributes.position;
  var colors = [];
  var top = new THREE.Color(topColor);
  var bottom = new THREE.Color(bottomColor);
   for (var i = 0; i < pos.count; i++) {
    var t = THREE.MathUtils.clamp((pos.getY(i) / radius + 0.15), 0, 1);
    var c = bottom.clone().lerp(top, t);
    colors.push(c.r, c.g, c.b);
   }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    var mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function makeStarField(count) {
  var positions = [];
  for(var i = 0; i < count; i++) {
      var theta = Math.random() * Math.PI * 2;
     var phi = Math.acos(Math.random() * 0.9);
    var r = 1700;
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      Math.abs(r * Math.cos(phi)) + 60,
     r * Math.sin(phi) * Math.sin(theta)
    );
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  var mat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.6, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.9 });
  return new THREE.Points(geo, mat);
}

function setArea3DTimeOfDay(mode) {
  area3dTimeOfDay = mode;
  if(!area3dScene) return;

  if (area3dSkyDome) area3dScene.remove(area3dSkyDome);

  if (mode === 'day') {
    area3dSkyDome=makeSkyDome(0x2d7fd1, 0xcfeaff);
    area3dScene.background = new THREE.Color(0x8fc6ec);
      area3dScene.fog.color.set(0xbfe0f5);
    area3dScene.fog.near = 500;
    area3dScene.fog.far = 1600;
    if (area3dStars) area3dStars.visible = false;
    if (area3dSunMoon) {
      area3dSunMoon.material.color.set(0xfff2b0);
        area3dSunMoon.position.set(500, 420, -600);
    }
    if(area3dSunLight) {
       area3dSunLight.intensity = 1.05;
      area3dSunLight.color.set(0xfff6e0);
    }
    if (area3dAmbientLight) area3dAmbientLight.intensity = 0.75;
   if (area3dWindowMaterial) area3dWindowMaterial.emissiveIntensity = 0;
  } else {
   area3dSkyDome = makeSkyDome(0x05050c, 0x1c1c2e);
    area3dScene.background = new THREE.Color(0x0a0a12);
    area3dScene.fog.color.set(0x0a0a12);
      area3dScene.fog.near = 400;
    area3dScene.fog.far = 1400;
    if (area3dStars) area3dStars.visible = true;
    if (area3dSunMoon) {
       area3dSunMoon.material.color.set(0xdfe6f0);
        area3dSunMoon.position.set(-500, 380, 500);
    }
    if (area3dSunLight) {
       area3dSunLight.intensity=0.35;
        area3dSunLight.color.set(0x8fa8d8);
    }
    if (area3dAmbientLight) area3dAmbientLight.intensity = 0.4;
    if (area3dWindowMaterial) area3dWindowMaterial.emissiveIntensity = 0.55;
   }

  area3dScene.add(area3dSkyDome);

 var btn = document.getElementById('area3d-sky-toggle');
  if(btn) btn.classList.toggle('is-day',mode === 'day');
}

function initArea3D() {
    if (area3dRenderer) return;

   var container = document.getElementById('area3d-canvas');
  var wrap = document.getElementById('area3d-canvas-wrap');
    var width = wrap.clientWidth || 800;
  var height = wrap.clientHeight || 400;

  area3dScene=new THREE.Scene();
  area3dScene.background=new THREE.Color(0x101014);
  area3dScene.fog = new THREE.Fog(0x101014, 400, 1400);

  area3dCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 3000);
  area3dCamera.position.set(300, 260, 300);

 area3dRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  area3dRenderer.setSize(width, height);
   area3dRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(area3dRenderer.domElement);

  area3dControls = new THREE.OrbitControls(area3dCamera, area3dRenderer.domElement);
  area3dControls.enableDamping = true;
   area3dControls.dampingFactor=0.08;
    area3dControls.maxPolarAngle = Math.PI / 2.1;
  area3dControls.minDistance = 4;
  area3dControls.maxDistance = 1200;
   area3dControls.target.set(0, 0, 0);

  area3dAmbientLight = new THREE.AmbientLight(0xffffff, 0.55);
  area3dScene.add(area3dAmbientLight);
  area3dSunLight = new THREE.DirectionalLight(0xffffff, 0.85);
  area3dSunLight.position.set(400, 600, 200);
   area3dScene.add(area3dSunLight);

  area3dGround = new THREE.Mesh(
    new THREE.CircleGeometry(600, 48),
    new THREE.MeshStandardMaterial({ color: 0x17171c, roughness: 1 })
  );
 area3dGround.rotation.x = -Math.PI / 2;
   area3dScene.add(area3dGround);

  var grid = new THREE.GridHelper(1000, 40, 0x2a2a32, 0x1c1c23);
  area3dScene.add(grid);

  area3dSunMoon = new THREE.Mesh(
    new THREE.SphereGeometry(28, 16, 16),
     new THREE.MeshBasicMaterial({ color: 0xf5f0e0,fog: false })
  );
  area3dScene.add(area3dSunMoon);

   area3dStars = makeStarField(420);
 area3dScene.add(area3dStars);

  setArea3DTimeOfDay(area3dTimeOfDay);

  area3dAnnotationGroup = new THREE.Group();
  area3dScene.add(area3dAnnotationGroup);

  window.addEventListener('resize', resizeArea3D);

 if(window.ResizeObserver) {
    new ResizeObserver(function () { resizeArea3D(); }).observe(wrap);
  }

   setupArea3DTools();

  function animate() {
    requestAnimationFrame(animate);
    area3dControls.update();
    area3dRenderer.render(area3dScene, area3dCamera);
   }
  animate();
}

function resizeArea3D() {
  if (!area3dRenderer) return;
  var wrap = document.getElementById('area3d-canvas-wrap');
  var width = wrap.clientWidth;
   var height = wrap.clientHeight;
  if (!width || !height) return;
  area3dCamera.aspect = width / height;
  area3dCamera.updateProjectionMatrix();
  area3dRenderer.setSize(width, height);
}

// annotation tools, host only

function makeTextSprite(text, bgColor, textColor, scale) {
  var canvas=document.createElement('canvas');
    var ctx=canvas.getContext('2d');
  var fontSize = 30;
  var padding = 16;
  ctx.font = '700 ' + fontSize + 'px "Plus Jakarta Sans", sans-serif';
  var textWidth = ctx.measureText(text).width;
  canvas.width = Math.ceil(textWidth + padding * 2);
  canvas.height = fontSize + padding * 2;

  ctx.font = '700 ' + fontSize + 'px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle=bgColor;
  var r = 10;
  var w = canvas.width, h = canvas.height;
  ctx.beginPath();
    ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
 ctx.closePath();
  ctx.fill();

    ctx.fillStyle=textColor;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padding, canvas.height / 2 + 1);

  var texture = new THREE.CanvasTexture(canvas);
  var material=new THREE.SpriteMaterial({ map: texture, depthTest: false });
    var sprite = new THREE.Sprite(material);
    var s=scale || 0.045;
  sprite.scale.set(canvas.width * s, canvas.height * s, 1);
  return sprite;
}

// pin shape, matches the icon on the landmark btn
function makePinMarker(color) {
 var material=new THREE.MeshStandardMaterial({ color: color, emissive: 0x0f3d2c });
 var marker = new THREE.Group();

   var tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 16), material);
   tip.rotation.x = Math.PI;
  tip.position.y = 0.5;
  marker.add(tip);

  var head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), material);
  head.position.y = 1.7;
   marker.add(head);

  return marker;
}

function placeLandmark(point) {
  var name = prompt("What's this landmark called?");
  if(!name) return;
 var marker = makePinMarker(0x34d399);
  marker.position.set(point.x, point.y, point.z);
  area3dAnnotationGroup.add(marker);

  var label = makeTextSprite(name, 'rgba(52,211,153,0.95)', '#0a0a0d');
  label.position.set(point.x,point.y + 3.2,point.z);
  area3dAnnotationGroup.add(label);

  marker.userData.pairWith = label;
   label.userData.pairWith = marker;
}

function placeStickyNote(point) {
  var text=prompt('Note for this spot?');
  if (!text) return;
  var label = makeTextSprite(text, 'rgba(250,204,21,0.95)', '#0a0a0d', 0.028);
  label.position.set(point.x, point.y + 4, point.z);
  area3dAnnotationGroup.add(label);
}

function deleteAnnotationAt(object) {
  if(!object || !area3dAnnotationGroup) return;
  while (object.parent && object.parent !== area3dAnnotationGroup) {
    object = object.parent;
   }
  var pairWith = object.userData && object.userData.pairWith;
  area3dAnnotationGroup.remove(object);
  if(pairWith) area3dAnnotationGroup.remove(pairWith);
  if (object === area3dPendingLineMarker || pairWith === area3dPendingLineMarker) {
   area3dPendingLineStart = null;
    area3dPendingLineMarker = null;
  }
}

// mesh line so it actually has width (THREE.Line ignores linewidth basically everywhere)
function makeThickLine(p1, p2, color, thickness) {
  var dir = new THREE.Vector3().subVectors(p2, p1);
    var length = dir.length();
 if(length < 1e-6) return null;
  var geometry = new THREE.CylinderGeometry(thickness / 2, thickness / 2, length, 8);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, emissive: 0x332600 }));
  mesh.position.copy(p1).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

function placeLinePoint(point) {
   if (!area3dPendingLineStart) {
    area3dPendingLineStart = point.clone();
    area3dPendingLineMarker = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 12, 12),
       new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x332600 })
    );
    area3dPendingLineMarker.position.copy(point);
    area3dAnnotationGroup.add(area3dPendingLineMarker);
     return;
   }

  var line = makeThickLine(area3dPendingLineStart, point, 0xfacc15, 0.45);
  if(line) area3dAnnotationGroup.add(line);

  if (area3dPendingLineMarker) area3dAnnotationGroup.remove(area3dPendingLineMarker);
  area3dPendingLineStart = null;
  area3dPendingLineMarker = null;
}

function clearArea3DAnnotations() {
  if (!area3dAnnotationGroup) return;
  while (area3dAnnotationGroup.children.length) {
    area3dAnnotationGroup.remove(area3dAnnotationGroup.children[0]);
  }
  area3dPendingLineStart = null;
  area3dPendingLineMarker=null;
}

function setupArea3DTools() {
  area3dRaycaster = new THREE.Raycaster();
  var pointerDownPos = null;

  area3dRenderer.domElement.addEventListener('pointerdown',function (e) {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

   area3dRenderer.domElement.addEventListener('pointerup', function (e) {
    var down = pointerDownPos;
     pointerDownPos = null;
    if (!area3dActiveTool || !down) return;

    var dx = e.clientX - down.x;
    var dy = e.clientY - down.y;
    if (Math.sqrt(dx * dx + dy * dy) > 6) return;

    var rect = area3dRenderer.domElement.getBoundingClientRect();
    var ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    area3dRaycaster.setFromCamera(ndc, area3dCamera);

    if(area3dActiveTool === 'delete') {
      var deleteHits = area3dRaycaster.intersectObjects(area3dAnnotationGroup.children, true);
      if (deleteHits.length) deleteAnnotationAt(deleteHits[0].object);
      return;
    }

    var targets = [];
    if(area3dBuildingGroup) {
      area3dBuildingGroup.children.forEach(function (c) { if (c.type === 'Mesh') targets.push(c); });
     }
    if (area3dGround) targets.push(area3dGround);

    var hits = area3dRaycaster.intersectObjects(targets, false);
    if (!hits.length) return;

     var point = hits[0].point;
    if(area3dActiveTool === 'landmark') placeLandmark(point);
    else if (area3dActiveTool === 'note') placeStickyNote(point);
    else if (area3dActiveTool === 'line') placeLinePoint(point);
  });

   document.querySelectorAll('.area3d-tool-btn').forEach(function (btn) {
   btn.addEventListener('click', function () {
      var tool = btn.dataset.tool;
      area3dActiveTool = area3dActiveTool === tool ? null : tool;
      if (area3dPendingLineMarker) area3dAnnotationGroup.remove(area3dPendingLineMarker);
      area3dPendingLineStart = null;
       area3dPendingLineMarker = null;
     document.querySelectorAll('.area3d-tool-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.tool === area3dActiveTool);
       });
    });
  });
}

function latLngToLocalMeters(lat, lng, centerLat, centerLng) {
  var R=6378137;
  var x = (lng - centerLng) * Math.PI / 180 * R * Math.cos(centerLat * Math.PI / 180);
  var z=(lat - centerLat) * Math.PI / 180 * R;
  return { x: x, z: -z };
}

// polygon helpers - .y here is actually world z, careful

function dedupeRingPoints(pts) {
  var out = [];
  for(var i = 0; i < pts.length; i++) {
    var p = pts[i];
   var prev = out[out.length - 1];
    if (!prev || Math.abs(prev.x - p.x) > 1e-6 || Math.abs(prev.y - p.y) > 1e-6) out.push(p);
  }
  if (out.length > 1) {
    var first = out[0], last = out[out.length - 1];
   if (Math.abs(first.x - last.x) < 1e-6 && Math.abs(first.y - last.y) < 1e-6) out.pop();
  }
  return out;
}

function segmentsIntersect(p1, p2, p3, p4) {
  function ccw(a,b,c) { return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x); }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function isSimplePolygon(poly) {
    var n = poly.length;
  if (n < 4) return true;
  for (var i = 0; i < n; i++) {
      var a1 = poly[i], a2 = poly[(i + 1) % n];
    for (var j=i + 1; j < n; j++) {
      if (j === i || (j + 1) % n === i) continue;
      var b1 = poly[j], b2 = poly[(j + 1) % n];
      if(segmentsIntersect(a1, a2, b1, b2)) return false;
    }
  }
  return true;
}

function convexHullOf(poly) {
   var pts = poly.slice().sort(function (a, b) { return a.x - b.x || a.y - b.y; });
  function cross(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
  var lower = [];
  for (var i = 0; i < pts.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
      lower.push(pts[i]);
   }
   var upper = [];
  for (var j = pts.length - 1; j >= 0; j--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[j]) <= 0) upper.pop();
    upper.push(pts[j]);
  }
  lower.pop();
   upper.pop();
  return lower.concat(upper);
}

// cleans up a footprint ring, hulls it if self-intersecting
function sanitizeFootprint(rawPoints) {
  var poly = dedupeRingPoints(rawPoints);
  if(poly.length < 3) return null;
  if (!isSimplePolygon(poly)) poly = convexHullOf(poly);
  return poly.length >= 3 ? poly : null;
}

function polygonCentroid(poly) {
  var area=0, cx=0, cz=0;
  var n = poly.length;
  for (var i=0; i < n; i++) {
    var p1 = poly[i], p2 = poly[(i + 1) % n];
    var cross = p1.x * p2.y - p2.x * p1.y;
    area += cross;
    cx += (p1.x + p2.x) * cross;
    cz += (p1.y + p2.y) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-6) {
    var sx = 0, sz = 0;
    poly.forEach(function (p) { sx += p.x; sz += p.y; });
   return { x: sx / n, z: sz / n };
  }
   return { x: cx / (6 * area), z: cz / (6 * area) };
}

function pointInPolygon(px, pz, poly) {
  var inside = false;
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i].x, zi = poly[i].y;
      var xj = poly[j].x,zj = poly[j].y;
    var intersect = ((zi > pz) !== (zj > pz)) && (px < (xj - xi) * (pz - zi) / (zj - zi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function footprintFits(cx, cz, halfW, halfD, poly) {
  return pointInPolygon(cx - halfW,cz - halfD,poly) &&
     pointInPolygon(cx + halfW, cz - halfD, poly) &&
   pointInPolygon(cx - halfW, cz + halfD, poly) &&
      pointInPolygon(cx + halfW, cz + halfD, poly);
}

// nudges a point toward centroid til it fits inside, so stuff doesn't poke outside walls
function findInteriorAnchor(px, pz, cx, cz, poly, halfW, halfD) {
   for (var t=0; t <= 1.0001; t += 0.1) {
    var x = px + (cx - px) * t;
    var z=pz + (cz - pz) * t;
    if (footprintFits(x, z, halfW, halfD, poly)) return { x: x, z: z };
  }
    return { x: cx, z: cz };
}

function buildArea3D(elements, centerLat, centerLng) {
 if (area3dBuildingGroup) area3dScene.remove(area3dBuildingGroup);
   area3dBuildingGroup = new THREE.Group();
  clearArea3DAnnotations();

    var buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xd8d8dc,roughness: 0.9 });
  var edgeMaterial = new THREE.LineBasicMaterial({ color: 0x6366f1 });
  var venueFloorMaterial = new THREE.MeshStandardMaterial({ color: 0x6366f1,roughness: 0.7 });
  var venueShellMaterial=new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
  var venueEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  var stairMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
 var mullionMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  var treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4530, roughness: 1 });
  var treeCanopyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f8f52,roughness: 0.85 });
   var roadMaterial = new THREE.MeshStandardMaterial({ color: 0x38383f, roughness: 0.95 });
  var roadDashMaterial=new THREE.MeshStandardMaterial({ color: 0xf5cf4d, roughness: 0.6, emissive: 0x3a2c00, emissiveIntensity: 0.35 });
  var windowMaterial = new THREE.MeshStandardMaterial({
   color: 0xbcd8ec,roughness: 0.2,metalness: 0.15,side: THREE.DoubleSide,    emissive: 0xffdd99, emissiveIntensity: area3dTimeOfDay === 'day' ? 0 : 0.55
  });
 area3dWindowMaterial = windowMaterial;
  var waterMaterial = new THREE.MeshStandardMaterial({ color: 0x2c5a8a, roughness: 0.4, transparent: true, opacity: 0.85 });

  // flight-landing-flight per floor
  function addFloorStaircase(cx, cz, baseY, floorH, stepsPerFlight) {
     var stepRise = floorH / 2 / stepsPerFlight;
    var stepDepth = 0.3;
     var stepWidth = 1.2;
     var flightLen = stepsPerFlight * stepDepth;
     var gap = 1.0;
    var i, step;

     for(i=0; i < stepsPerFlight; i++) {
      step = new THREE.Mesh(new THREE.BoxGeometry(stepDepth * 0.96, stepRise, stepWidth), stairMaterial);
      step.position.set(
          cx - flightLen / 2 + i * stepDepth + stepDepth / 2,
        baseY + i * stepRise + stepRise / 2,
        cz - (stepWidth / 2 + gap / 2)
      );
     area3dBuildingGroup.add(step);
    }

    var landing = new THREE.Mesh(new THREE.BoxGeometry(flightLen,0.18,stepWidth * 2 + gap),stairMaterial);
   landing.position.set(cx, baseY + floorH / 2, cz);
    area3dBuildingGroup.add(landing);

    for(i = 0; i < stepsPerFlight; i++) {
        step = new THREE.Mesh(new THREE.BoxGeometry(stepDepth * 0.96, stepRise, stepWidth), stairMaterial);
      step.position.set(
        cx + flightLen / 2 - i * stepDepth - stepDepth / 2,
        baseY + floorH / 2 + i * stepRise + stepRise / 2,
       cz + (stepWidth / 2 + gap / 2)
      );
       area3dBuildingGroup.add(step);
    }
  }

  function addTree(x, z) {
    var trunkH = 2 + Math.random() * 1.2;
    var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, trunkH, 6), treeTrunkMaterial);
    trunk.position.set(x, trunkH / 2, z);
   area3dBuildingGroup.add(trunk);

     var canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 0.6, 8, 6), treeCanopyMaterial);
    canopy.position.set(x,trunkH + 1.3,z);
    canopy.scale.y = 1.15;
    area3dBuildingGroup.add(canopy);
  }

 var buildings = elements.filter(function (el) { return el.tags && el.tags.building; });
  var roads = elements.filter(function (el) { return el.tags && el.tags.highway; });
  var waterAreas = elements.filter(function(el) { return el.tags && el.tags.natural === 'water'; });
  var waterways=elements.filter(function (el) { return el.tags && el.tags.waterway; });

  var venueEl = null;
  var venueDist = Infinity;
  var venueCenter = { x: 0, z: 0 };
  buildings.forEach(function(el) {
    if (!el.geometry || el.geometry.length < 3) return;
    var cx = 0, cz = 0;
    el.geometry.forEach(function (pt) {
        var m = latLngToLocalMeters(pt.lat, pt.lon, centerLat, centerLng);
       cx += m.x;
     cz += m.z;
     });
   cx /= el.geometry.length;
    cz /= el.geometry.length;
    var d = Math.sqrt(cx * cx + cz * cz);
    if (d < venueDist) {
       venueDist=d;
      venueEl = el;
      venueCenter = { x: cx,z: cz };
     }
  });

    var venueHeight = 9;
  var venueRadius = 12;

  buildings.forEach(function(el) {
    if (!el.geometry || el.geometry.length < 3) return;

    try {
      var rawPoints = el.geometry.map(function (pt) {
        var m = latLngToLocalMeters(pt.lat,pt.lon,centerLat,centerLng);
         return new THREE.Vector2(m.x, m.z);
      });
      var points = sanitizeFootprint(rawPoints);
      if(!points) return;

      // rotateX below flips Y into Z so gotta negate here or the shell ends up mirrored vs everything else
      var shape=new THREE.Shape(points.map(function (p) { return new THREE.Vector2(p.x, -p.y); }));
      var tags = el.tags || {};
      var levels=tags['building:levels'] ? Math.max(1, Math.round(parseFloat(tags['building:levels']) || 3)) : (tags.height ? Math.max(1, Math.round(parseFloat(tags.height) / 3)) : 3);
      var totalHeight = tags.height ? parseFloat(tags.height) : levels * 3;

        if(el === venueEl) {
        venueHeight = totalHeight;
        var floorH = totalHeight / levels;
        // real centroid not just vertex avg, matters for weird shaped buildings
        venueCenter = polygonCentroid(points);
        venueRadius = 12;
        points.forEach(function (p) {
          var r = Math.sqrt(Math.pow(p.x - venueCenter.x, 2) + Math.pow(p.y - venueCenter.z, 2));
          if (r > venueRadius) venueRadius = r;
         });

        // see-through shell
        var shellGeo = new THREE.ExtrudeGeometry(shape, { depth: totalHeight, bevelEnabled: false });
        shellGeo.rotateX(-Math.PI / 2);
         area3dBuildingGroup.add(new THREE.Mesh(shellGeo, venueShellMaterial));
        area3dBuildingGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo),venueEdgeMaterial));

        // floor decks
        var deckThickness = Math.min(0.4, floorH * 0.22);
        for (var lvl = 0; lvl <= levels; lvl++) {
          var deckGeo=new THREE.ExtrudeGeometry(shape, { depth: deckThickness, bevelEnabled: false });
          deckGeo.rotateX(-Math.PI / 2);
          deckGeo.translate(0, Math.min(lvl * floorH, totalHeight - deckThickness), 0);
          area3dBuildingGroup.add(new THREE.Mesh(deckGeo, venueFloorMaterial));
         }

        // mullions on the facade
        var mullionPositions = [];
        var mullionSpacing = 3.2;
         var windowMatrices=[];
        var maxWindows = 650;
        var winFloors = Math.min(levels, 25);
        for (var pi = 0; pi < points.length; pi++) {
         var mp1 = points[pi];
            var mp2 = points[(pi + 1) % points.length];
          var edgeDx=mp2.x - mp1.x, edgeDz=mp2.y - mp1.y;
          var edgeLen=Math.sqrt(edgeDx * edgeDx + edgeDz * edgeDz);
          if (!edgeLen) continue;
           var edgeSteps = Math.max(1, Math.round(edgeLen / mullionSpacing));
          var edgeDirX=edgeDx / edgeLen,edgeDirZ=edgeDz / edgeLen;
          var normalX = edgeDirZ, normalZ = -edgeDirX;
          for(var esi = 1; esi < edgeSteps; esi++) {
            var mt = esi / edgeSteps;
            var mx = mp1.x + edgeDx * mt;
            var mz = mp1.y + edgeDz * mt;
             mullionPositions.push(mx, 0.3, mz, mx, totalHeight - 0.3, mz);
          }
          // window per bay per floor
          for (var bay = 0; bay < edgeSteps && windowMatrices.length < maxWindows; bay++) {
            var bt = (bay + 0.5) / edgeSteps;
            var wx = mp1.x + edgeDx * bt + normalX * 0.06;
            var wz = mp1.y + edgeDz * bt + normalZ * 0.06;
            var quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(normalX, 0, normalZ));
            for (var wl = 0; wl < winFloors && windowMatrices.length < maxWindows; wl++) {
              var wy = wl * floorH + floorH * 0.52;
              var wMat = new THREE.Matrix4();
              wMat.compose(new THREE.Vector3(wx, wy, wz), quat, new THREE.Vector3(Math.min(1.8, mullionSpacing * 0.55), Math.min(1.7, floorH * 0.55), 1));
                windowMatrices.push(wMat);
            }
          }
        }
        if (mullionPositions.length) {
          var mullionGeo = new THREE.BufferGeometry();
         mullionGeo.setAttribute('position',new THREE.Float32BufferAttribute(mullionPositions,3));
         area3dBuildingGroup.add(new THREE.LineSegments(mullionGeo, mullionMaterial));
        }
        if (windowMatrices.length) {
         var windowMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), windowMaterial, windowMatrices.length);
          windowMatrices.forEach(function(m, idx) { windowMesh.setMatrixAt(idx, m); });
           windowMesh.instanceMatrix.needsUpdate = true;
          area3dBuildingGroup.add(windowMesh);
        }

        // roof unit thing
        var roofUnitSize = Math.min(4, Math.max(1.6, venueRadius * 0.3));
        var roofUnit = new THREE.Mesh(new THREE.BoxGeometry(roofUnitSize, 1.4, roofUnitSize), buildingMaterial);
         roofUnit.position.set(venueCenter.x, totalHeight + 0.7, venueCenter.z);
        area3dBuildingGroup.add(roofUnit);

        // 1-3 staircases spread from centroid, clamped so they stay inside
        var stairCount = Math.min(3, Math.max(1, Math.ceil(levels / 3)));
         var stairFloors = Math.min(levels, 40);
          var stepsPerFlight = stairFloors > 20 ? 4 : 6;
        var stairHalfW = (stepsPerFlight * 0.3) / 2 + 0.6;
        var stairHalfD = (1.2 * 2 + 1.0) / 2 + 0.6;
        for(var s = 0; s < stairCount; s++) {
          var stairAngle = (s / stairCount) * Math.PI * 2 + 0.6;
          var seedX = venueCenter.x + Math.cos(stairAngle) * venueRadius * 0.35;
          var seedZ = venueCenter.z + Math.sin(stairAngle) * venueRadius * 0.35;
          var anchor=findInteriorAnchor(seedX, seedZ, venueCenter.x, venueCenter.z, points, stairHalfW, stairHalfD);
          var sx = anchor.x, sz = anchor.z;

          // shaft outline
          var shaftEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(stairHalfW * 2, totalHeight, stairHalfD * 2)),
            venueEdgeMaterial
           );
          shaftEdges.position.set(sx, totalHeight / 2, sz);
          area3dBuildingGroup.add(shaftEdges);

           for (var fl = 0; fl < stairFloors; fl++) {
            addFloorStaircase(sx, sz, fl * floorH, floorH, stepsPerFlight);
          }
        }

        // scatter some trees
        var treeCount = 8;
         for (var tI = 0; tI < treeCount; tI++) {
          var treeAngle = (tI / treeCount) * Math.PI * 2 + 0.3;
          var treeDist = venueRadius + 4 + Math.random() * 3;
          addTree(venueCenter.x + Math.cos(treeAngle) * treeDist,venueCenter.z + Math.sin(treeAngle) * treeDist);
        }
      } else {
        var geometry=new THREE.ExtrudeGeometry(shape,{ depth: totalHeight,bevelEnabled: false });
        geometry.rotateX(-Math.PI / 2);
         area3dBuildingGroup.add(new THREE.Mesh(geometry, buildingMaterial));
        area3dBuildingGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), edgeMaterial));
       }
    } catch (err) {
      // skip malformed building geometry
    }
  });

  function addLineSegments(el,material,width) {
    if (!el.geometry || el.geometry.length < 2) return;
    try {
      for(var i = 0; i < el.geometry.length - 1; i++) {
        var a = latLngToLocalMeters(el.geometry[i].lat, el.geometry[i].lon, centerLat, centerLng);
        var b = latLngToLocalMeters(el.geometry[i + 1].lat, el.geometry[i + 1].lon, centerLat, centerLng);
        var dx = b.x - a.x;
        var dz = b.z - a.z;
        var len = Math.sqrt(dx * dx + dz * dz);
        if (!len) continue;

        var segMesh = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, width), material);
       segMesh.position.set((a.x + b.x) / 2, width === 6 ? 0.15 : 0.1, (a.z + b.z) / 2);
        segMesh.rotation.y = -Math.atan2(dz, dx);
        area3dBuildingGroup.add(segMesh);
      }
    } catch (err) {
      // skip malformed line geometry
     }
    }

   roads.forEach(function(el) { addLineSegments(el, roadMaterial, 6); });
  waterways.forEach(function(el) { addLineSegments(el, waterMaterial, 5); });

  // dashed lines on nearby roads
  var dashGeo=new THREE.BoxGeometry(0.7, 0.06, 0.26);
  var dashMatrices = [];
  var maxDashes = 500;
  var dashRangeSq = 160 * 160;
  roads.forEach(function (el) {
    if (!el.geometry || el.geometry.length < 2 || dashMatrices.length >= maxDashes) return;
    try {
      for (var i = 0; i < el.geometry.length - 1 && dashMatrices.length < maxDashes; i++) {
        var a=latLngToLocalMeters(el.geometry[i].lat, el.geometry[i].lon, centerLat, centerLng);
        var b = latLngToLocalMeters(el.geometry[i + 1].lat, el.geometry[i + 1].lon, centerLat, centerLng);
         if(a.x * a.x + a.z * a.z > dashRangeSq && b.x * b.x + b.z * b.z > dashRangeSq) continue;
        var dx = b.x - a.x, dz = b.z - a.z;
        var len = Math.sqrt(dx * dx + dz * dz);
        if (!len) continue;
         var dashSpacing=3.2;
        var dashCount = Math.min(20, Math.floor(len / dashSpacing));
       var quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.atan2(dz,dx));
        for (var d = 0; d < dashCount && dashMatrices.length < maxDashes; d++) {
          var dt = (d + 0.5) / dashCount;
          var m = new THREE.Matrix4();
          m.compose(new THREE.Vector3(a.x + dx * dt, 0.22, a.z + dz * dt), quat, new THREE.Vector3(1, 1, 1));
          dashMatrices.push(m);
          }
      }
    } catch (err) {
      // skip malformed road geometry
    }
   });
  if (dashMatrices.length) {
    var dashMesh = new THREE.InstancedMesh(dashGeo, roadDashMaterial, dashMatrices.length);
    dashMatrices.forEach(function (m, idx) { dashMesh.setMatrixAt(idx, m); });
    dashMesh.instanceMatrix.needsUpdate = true;
     area3dBuildingGroup.add(dashMesh);
  }

  waterAreas.forEach(function (el) {
    if (!el.geometry || el.geometry.length < 3) return;
    try {
      var points=el.geometry.map(function(pt) {
        var m = latLngToLocalMeters(pt.lat, pt.lon, centerLat, centerLng);
          return new THREE.Vector2(m.x, -m.z);
        });
      var shape = new THREE.Shape(points);
      var waterGeo = new THREE.ShapeGeometry(shape);
      waterGeo.rotateX(-Math.PI / 2);
      var waterMesh=new THREE.Mesh(waterGeo, waterMaterial);
      waterMesh.position.y = 0.08;
      area3dBuildingGroup.add(waterMesh);
      } catch (err) {
      // skip malformed water geometry
     }
  });

  area3dScene.add(area3dBuildingGroup);
  return {
    buildingCount: buildings.length,
    roadCount: roads.length,
    waterCount: waterAreas.length + waterways.length,
    venueCenter: venueCenter,
    venueHeight: venueHeight,
      venueRadius: venueRadius
  };
}

var OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
var OVERPASS_MAX_ATTEMPTS = 3;

function fetchWithTimeout(url, options, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    options=Object.assign({}, options, { signal: controller.signal });
  return fetch(url, options).then(
   function (res) { clearTimeout(timer); return res; },
    function (err) { clearTimeout(timer); throw err; }
  );
}

function fetchOverpass(query, hint, attempt) {
  attempt = attempt || 1;

  if (attempt > 1 && hint) {
    hint.textContent = 'That map data service was busy,retrying (' + attempt + '/' + OVERPASS_MAX_ATTEMPTS + ')...';
  }

  return fetchWithTimeout(OVERPASS_ENDPOINT, { method: 'POST', body: query }, 20000)
    .then(function (res) {
      if (!res.ok) throw new Error('Overpass request failed: ' + res.status);
        return res.json();
    })
    .catch(function(err) {
      if (attempt >= OVERPASS_MAX_ATTEMPTS) throw err;
      return new Promise(function (resolve) { setTimeout(resolve,attempt * 1500); })
        .then(function () { return fetchOverpass(query,hint,attempt + 1); });
    });
}

function focusArea3DOnVenue(center, height, radius) {
  if (!area3dControls) return;
 var dist = Math.max(40, Math.max(height * 2, (radius || 12) * 3));
  area3dControls.target.set(center.x, height / 2, center.z);
   area3dCamera.position.set(center.x + dist * 0.45, height + dist * 0.9, center.z + dist * 0.45);
  area3dControls.update();
}

function loadArea3D() {
  var lat = eventData.lat;
  var lng = eventData.lng;

 var hint = document.getElementById('area3d-hint');
  var empty = document.getElementById('area3d-empty');
  var loadBtn = document.getElementById('area3d-load');
  var tools = document.getElementById('area3d-tools');
  var fullscreenBtn = document.getElementById('area3d-fullscreen-btn');
  var skyToggleBtn = document.getElementById('area3d-sky-toggle');

  loadBtn.disabled = true;
  loadBtn.textContent = 'Scanning...';
  tools.classList.remove('ready');
  fullscreenBtn.classList.remove('ready');
  skyToggleBtn.classList.remove('ready');
   hint.textContent = "Pulling this venue's building, nearby streets, water, and other buildings within 500m from OpenStreetMap...";

  var query = '[out:json][timeout:25];(way["building"](around:500,' + lat + ',' + lng + ');way["highway"](around:500,' + lat + ',' + lng + ');way["natural"="water"](around:500,' + lat + ',' + lng + ');way["waterway"](around:500,' + lat + ',' + lng + '););out geom;';

  fetchOverpass(query,hint)
     .then(function (data) {
      initArea3D();
      var elements = (data.elements || []).filter(function (el) { return el.type === 'way' && el.geometry; });
      var counts = buildArea3D(elements, lat, lng);
        empty.classList.add('hidden');
      hint.textContent = counts.buildingCount
        ? 'Scanned. Showing this venue (indigo, with floors and a stairwell), ' + Math.max(0, counts.buildingCount - 1) + ' nearby building' + (counts.buildingCount - 1 === 1 ? '' : 's') + ', ' + counts.roadCount + ' street' + (counts.roadCount === 1 ? '' : 's') + (counts.waterCount ? ', and ' + counts.waterCount + ' water feature' + (counts.waterCount === 1 ? '' : 's') : '') + ' within 500m. Drag to orbit, scroll to zoom.'
        : 'No mapped buildings found within 500m of this location on OpenStreetMap.';
      loadBtn.disabled = false;
      loadBtn.textContent = 'Rescan Area';
      setTimeout(function () {
         resizeArea3D();
        focusArea3DOnVenue(counts.venueCenter, counts.venueHeight, counts.venueRadius);
       }, 50);
      if (counts.buildingCount) {
         tools.classList.add('ready');
        fullscreenBtn.classList.add('ready');
        skyToggleBtn.classList.add('ready');
        }
      })
    .catch(function () {
      hint.textContent = "OpenStreetMap's map data service is busy right now, even after retrying. Try again in a moment.";
      loadBtn.disabled = false;
      loadBtn.textContent = 'Scan Area';
    });
}

document.getElementById('area3d-load').addEventListener('click', loadArea3D);

document.getElementById('area3d-fullscreen-btn').addEventListener('click', function () {
  var wrap = document.getElementById('area3d-canvas-wrap');
 if (document.fullscreenElement === wrap) {
    document.exitFullscreen();
  } else if (wrap.requestFullscreen) {
    wrap.requestFullscreen();
  }
});

document.addEventListener('fullscreenchange',function () {
  var wrap = document.getElementById('area3d-canvas-wrap');
  var isFull=document.fullscreenElement === wrap;
   document.getElementById('area3d-fullscreen-btn').classList.toggle('active', isFull);
  setTimeout(resizeArea3D, 60);
});

document.getElementById('area3d-sky-toggle').addEventListener('click', function () {
  setArea3DTimeOfDay(area3dTimeOfDay === 'day' ? 'night' : 'day');
});

var dashMoreBtn = document.getElementById('dash-more-btn');
var dashMoreSheet = document.getElementById('dash-more-sheet');
var dashMoreClose = document.getElementById('dash-more-close');

dashMoreBtn.addEventListener("click", function() {
  dashMoreSheet.classList.add('open');
});

dashMoreClose.addEventListener('click', function () {
  dashMoreSheet.classList.remove('open');
});

dashMoreSheet.addEventListener('click', function (e) {
  if (e.target === dashMoreSheet) dashMoreSheet.classList.remove('open');
});

document.querySelectorAll('.dash-more-item').forEach(function (btn) {
  btn.addEventListener('click', function () {
   dashMoreSheet.classList.remove('open');
    });
});

var dashProfileBtn = document.getElementById('dash-profile-btn');
var dashProfileMenu=document.getElementById('dash-profile-menu');

dashProfileBtn.addEventListener('click', function () {
  dashProfileMenu.classList.toggle('open');
});

document.getElementById('dash-profile-logout').addEventListener('click', function () {
  dashProfileMenu.classList.remove('open');
   document.body.classList.remove('is-authed');
  loggedInEmail = '';
  showScreen('screen-auth');
});

document.addEventListener('click', function (e) {
    if (!dashProfileBtn.contains(e.target) && !dashProfileMenu.contains(e.target)) {
    dashProfileMenu.classList.remove('open');
  }
});

var dashCodeCopy = document.getElementById('dash-code-copy');

function flashCopied() {
  var original = dashCodeCopy.textContent;
  dashCodeCopy.textContent = 'Copied!';
    setTimeout(function () { dashCodeCopy.textContent = original; }, 1500);
}

function fallbackCopy(text) {
  var input = document.createElement('textarea');
  input.value=text;
  input.style.position = 'fixed';
    input.style.opacity = '0';
 document.body.appendChild(input);
 input.select();
   try { document.execCommand('copy'); } catch (err) {}
   document.body.removeChild(input);
}

dashCodeCopy.addEventListener('click', function () {
  if (!eventData.code) return;
 if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(eventData.code).then(flashCopied, function () {
      fallbackCopy(eventData.code);
      flashCopied();
      });
  } else {
      fallbackCopy(eventData.code);
    flashCopied();
  }
});

function renderDashboard() {
  var shell = document.querySelector('.dash-shell');
   shell.classList.toggle('role-host', dashRole === 'host');

  var botLabel = eventData.botName || 'EventBot';
  document.getElementById('dash-bot-name').textContent = botLabel;
  document.getElementById('dash-bot-name-2').textContent = botLabel;
  dashChatInput.placeholder='Ask ' + botLabel + ' something...';
  document.getElementById('dash-code-value').textContent = eventData.code || '----';
   var requirementBadge = document.getElementById('dash-requirement-badge');
  requirementBadge.textContent = eventData.requirement || '';
  requirementBadge.classList.toggle('hidden', !eventData.requirement);
  document.getElementById('journey-location-label').textContent =
    "Real buildings, streets, and this venue's floors" + (eventData.location ? (' near ' + eventData.location) : '') + ', generated from where you pinned the event.';

  dashChatLog.innerHTML = '';
  if (!chatLog.length) {
     var greeting = "Hi, I'm " + botLabel + '! Ask me anything about ' + (eventData.name || 'this event') + '.';
    chatLog.push({ who: 'bot', text: greeting });
  }
  chatLog.forEach(function (m) { appendChatBubble(m.who,m.text); });

  dashInfoInput.value = eventData.pastedInfo || '';
  renderActivityLog();

   if (!activeDmPerson) activeDmPerson = dmPeople[0];
   renderDmPeople();
  renderDmThread();

  document.querySelectorAll('.dash-nav-item').forEach(function (b) {
    b.classList.toggle('active', b.dataset.dashTab === 'chat');
  });
  document.querySelectorAll('.dash-tab').forEach(function (sec) {
    sec.classList.toggle('active', sec.dataset.dashTab === 'chat');
  });

  dashMoreSheet.classList.remove('open');
   dashProfileMenu.classList.remove('open');
   document.getElementById('dash-avatar-letter').textContent=(loggedInEmail.charAt(0) || '?').toUpperCase();
  document.getElementById('dash-profile-email').textContent = loggedInEmail || 'you@school.edu';

   initLiveMap();
  initHeadcount();
    renderSchedule();
  renderPhotoGallery();
  renderFeedback();
}

// live map

var FRIEND_NAMES=['Maya','Sam','Priya','Chen'];
var mapFriends = [];
var mapMoveTimer=null;
var youSharing=false;
var venueMapInstance=null;
var youMarker = null;
var friendMarkers = {};

function eventCenter() {
  return [eventData.lat || 40.7128, eventData.lng || -74.006];
}

function randomNearbyLatLng(center) {
   return [
    center[0] + (Math.random() - 0.5) * 0.0025,    center[1] + (Math.random() - 0.5) * 0.0025
  ];
}

function mapPinIcon(label, modifierClass) {
  return L.divIcon({
   className: 'map-pin ' + modifierClass,
    html: '<span class="map-pin-dot"></span><span class="map-pin-label">' + label + '</span>',   iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
}

function initLiveMap() {
  var inviteInput = document.getElementById('invite-code');
  inviteInput.value = 'coordin8.app/join/' + Math.random().toString(36).slice(2, 8).toUpperCase();

  var center = eventCenter();

   if (!venueMapInstance) {
    venueMapInstance = L.map('venue-map-canvas', { attributionControl: false }).setView(center, 18);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
     }).addTo(venueMapInstance);
  } else {
     venueMapInstance.setView(center, 18);
  }
  setTimeout(function () { venueMapInstance.invalidateSize(); }, 0);

   if (!mapFriends.length) {
    mapFriends=FRIEND_NAMES.map(function (name) {
       return { name: name, pos: randomNearbyLatLng(center), online: Math.random() > 0.25 };
    });
  }

  var toggle = document.getElementById('share-location-toggle');
  toggle.checked = youSharing;
  renderMapPins();
  renderFriendsList();

  if (mapMoveTimer) clearInterval(mapMoveTimer);
  mapMoveTimer = setInterval(function () {
    var c = eventCenter();
    mapFriends.forEach(function (f) {
      if (f.online) f.pos = randomNearbyLatLng(c);
    });
     renderMapPins();
  },2500);
}

function renderMapPins() {
  if (!venueMapInstance) return;

  if (youSharing) {
    if (!window.__youPos) window.__youPos = randomNearbyLatLng(eventCenter());
    if(!youMarker) {
        youMarker = L.marker(window.__youPos, { icon: mapPinIcon('You', 'map-pin--you') }).addTo(venueMapInstance);
    } else {
       youMarker.setLatLng(window.__youPos);
    }
  } else if (youMarker) {
   venueMapInstance.removeLayer(youMarker);
      youMarker=null;
  }

  var seen = {};
  mapFriends.forEach(function (f) {
    if(!f.online) return;
    seen[f.name]=true;
      if(!friendMarkers[f.name]) {
      friendMarkers[f.name] = L.marker(f.pos, { icon: mapPinIcon(f.name, 'map-pin--friend') }).addTo(venueMapInstance);
    } else {
      friendMarkers[f.name].setLatLng(f.pos);
    }
  });

  Object.keys(friendMarkers).forEach(function (name) {
    if (!seen[name]) {
      venueMapInstance.removeLayer(friendMarkers[name]);
      delete friendMarkers[name];
     }
  });
}

function renderFriendsList() {
   var list = document.getElementById('friends-list');
  var html='';
  mapFriends.forEach(function(f) {
    html += '<li class="friend-row">' +
      '<span class="friend-dot' + (f.online ? '' : ' offline') + '"></span>' +
      '<span>' + f.name + '</span>' +
      '<span class="friend-status">' + (f.online ? 'Here now' : 'Not sharing') + '</span>' +
    '</li>';
  });
  list.innerHTML = html;
}

document.getElementById('share-location-toggle').addEventListener('change', function(e) {
  youSharing=e.target.checked;
  var hint = document.getElementById('map-side-hint');
  hint.textContent = youSharing
    ? 'On. Friends at this event can see your dot. Turns off automatically when you leave.'
    : 'Off. Nobody can see where you are.';
 if (youSharing) window.__youPos = randomNearbyLatLng(eventCenter());
  renderMapPins();
});

document.getElementById('invite-copy').addEventListener('click', function() {
  var input = document.getElementById('invite-code');
  input.select();
    if(navigator.clipboard) navigator.clipboard.writeText(input.value);
  var btn = document.getElementById('invite-copy');
  var original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(function () { btn.textContent = original; }, 1500);
});



var headcountValue = 0;

function initHeadcount() {
  headcountValue = 12 + Math.floor(Math.random() * 40);
  document.getElementById('headcount-number').textContent=headcountValue;
}

document.getElementById('headcount-simulate').addEventListener('click', function () {
  headcountValue++;
  document.getElementById('headcount-number').textContent = headcountValue;
});


var scheduleItems = [];

function renderSchedule() {
  var list = document.getElementById('schedule-list');
  if (!scheduleItems.length) {
    list.innerHTML = '<p class="dash-empty">Nothing scheduled yet.</p>';
     return;
   }
  var html='';
  scheduleItems.forEach(function(item) {
      html += '<li class="schedule-item">' +
      '<span class="schedule-item-time">' + item.time + '</span>' +
      '<span>' + item.title + '</span>' +
    '</li>';
  });
  list.innerHTML = html;
}

document.getElementById('schedule-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var time = document.getElementById('schedule-time').value.trim();
 var title = document.getElementById('schedule-title').value.trim();
  if (!time || !title) return;
  scheduleItems.push({ time: time, title: title });
  document.getElementById('schedule-time').value='';
 document.getElementById('schedule-title').value = '';
  renderSchedule();
});

// photos

var galleryPhotos = [];

function renderPhotoGallery() {
  var grid = document.getElementById('photo-gallery');
  grid.innerHTML = galleryPhotos.map(function (url) {
    return '<img src="' + url + '" alt="Event photo">';
  }).join('');
}

document.getElementById('photo-upload-input').addEventListener('change',function (e) {
  var file = e.target.files[0];
   if (!file) return;
  galleryPhotos.unshift(URL.createObjectURL(file));
  renderPhotoGallery();
});



var feedbackItems = [];
var selectedStars=0;

document.querySelectorAll('#star-input span').forEach(function (star) {
  star.addEventListener('click', function () {
    selectedStars = Number(star.dataset.star);
    document.querySelectorAll('#star-input span').forEach(function (s) {
      s.classList.toggle('filled', Number(s.dataset.star) <= selectedStars);
   });
   });
});

function renderFeedback() {
  var list = document.getElementById('feedback-list');
  var summary = document.getElementById('feedback-summary');

  if(!feedbackItems.length) {
    summary.textContent = 'No feedback yet.';
    list.innerHTML = '';
    return;
  }

  var total = feedbackItems.reduce(function (sum, f) { return sum + f.stars; }, 0);
  var avg = (total / feedbackItems.length).toFixed(1);
  summary.textContent = avg + ' average from ' + feedbackItems.length + ' ' + (feedbackItems.length === 1 ? 'response' : 'responses');

  list.innerHTML = feedbackItems.map(function(f) {
    return '<li class="feedback-item">' +
      '<div class="feedback-item-stars">' + '&#9733;'.repeat(f.stars) + '</div>' +
      (f.comment ? '<div>' + f.comment + '</div>' : '') +
    '</li>';
  }).join('');
}

document.getElementById('feedback-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if(!selectedStars) return;
   var comment=document.getElementById('feedback-comment').value.trim();
  feedbackItems.unshift({ stars: selectedStars, comment: comment });

  selectedStars = 0;
   document.querySelectorAll('#star-input span').forEach(function (s) { s.classList.remove('filled'); });
  document.getElementById('feedback-comment').value='';

  renderFeedback();
});
