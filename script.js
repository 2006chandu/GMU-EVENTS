// Initialize EmailJS (Requires keys in line ~680)
// emailjs.init("W72BFDsVHtshcKb2i");

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOCAL STORAGE & DATA INITIALIZATION ---
    let events = JSON.parse(localStorage.getItem("gmu_events"));
    
    // Auto-refresh data if user is still on the old 3-event demo
    if (!events || events.length < 10) {
        events = typeof defaultEventsData !== 'undefined' ? defaultEventsData : [];
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        localStorage.setItem("gmu_events", JSON.stringify(events));
    }
    
    let registrations = JSON.parse(localStorage.getItem("gmu_registrations")) || [];
    let currentUserRole = null; 
    
    // --- 2. DOM ELEMENTS ---
    const loginModal = document.getElementById("loginModal");
    const navLoginBtn = document.getElementById("navLoginBtn");
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    const navLogoutBtn = document.getElementById("navLogoutBtn");
    const closeLoginBtn = document.getElementById("closeLoginBtn");
    const userGreeting = document.getElementById("userGreeting");
    
    const tabStudent = document.getElementById("tabStudent");
    const tabAdmin = document.getElementById("tabAdmin");
    const loginForm = document.getElementById("loginForm");
    
    const publicView = document.querySelectorAll(".public-view");
    const studentDashboardView = document.getElementById("studentDashboardView");
    const adminDashboardView = document.getElementById("adminDashboardView");
    const studentNavLinks = document.querySelectorAll(".student-only");
    
    const studentMainContent = document.getElementById("studentMainContent");
    const studentEventDetailsView = document.getElementById("studentEventDetailsView");
    
    let activeLoginTab = 'student';

    // Navigation Links handling
    document.getElementById("navEventsBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showMainStudentView();
        document.getElementById("events").scrollIntoView({behavior: "smooth"});
    });
    document.getElementById("navCalendarBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showMainStudentView();
        document.getElementById("calendar-section").scrollIntoView({behavior: "smooth"});
    });
    document.getElementById("navRegisterBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        showMainStudentView();
        document.getElementById("register").scrollIntoView({behavior: "smooth"});
    });

    // --- 3. LOGIN LOGIC ---
    function openLoginModal() {
        loginModal.style.display = "flex";
        document.getElementById("loginError").textContent = "";
        loginForm.reset();
    }
    
    navLoginBtn.onclick = (e) => { e.preventDefault(); openLoginModal(); };
    if (heroLoginBtn) heroLoginBtn.onclick = (e) => { e.preventDefault(); openLoginModal(); };
    closeLoginBtn.onclick = () => { loginModal.style.display = "none"; };

    tabStudent.onclick = (e) => {
        e.preventDefault(); activeLoginTab = 'student';
        tabStudent.className = "btn btn-primary"; tabAdmin.className = "btn btn-outline";
    };
    
    tabAdmin.onclick = (e) => {
        e.preventDefault(); activeLoginTab = 'admin';
        tabAdmin.className = "btn btn-primary"; tabStudent.className = "btn btn-outline";
    };

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById("loginUsername").value.trim();
        const pass = document.getElementById("loginPassword").value.trim();
        
        if (activeLoginTab === 'student' && user === 'student' && pass === 'student123') {
            loginSuccess('student');
        } else if (activeLoginTab === 'admin' && user === 'admin' && pass === 'admin123') {
            loginSuccess('admin');
        } else {
            document.getElementById("loginError").textContent = "Invalid username or password.";
        }
    };

    function loginSuccess(role) {
        currentUserRole = role;
        loginModal.style.display = "none";
        updateUIForRole();
    }

    navLogoutBtn.onclick = (e) => {
        e.preventDefault(); currentUserRole = null; updateUIForRole();
    };

    function updateUIForRole() {
        publicView.forEach(el => el.style.display = "none");
        studentDashboardView.style.display = "none";
        adminDashboardView.style.display = "none";
        studentNavLinks.forEach(el => el.style.display = "none");
        navLoginBtn.style.display = "none";
        navLogoutBtn.style.display = "inline-flex";
        userGreeting.style.display = "inline-flex";

        if (currentUserRole === 'student') {
            userGreeting.textContent = "Welcome, Student";
            studentDashboardView.style.display = "flex";
            studentNavLinks.forEach(el => el.style.display = "inline-block");
            showMainStudentView();
            renderStudentEvents();
            renderCalendar();
            document.getElementById("events").scrollIntoView({behavior: "smooth"});
        } else if (currentUserRole === 'admin') {
            userGreeting.textContent = "Welcome, Admin";
            adminDashboardView.style.display = "flex";
            renderAdminEvents();
            renderAdminRegistrations();
        } else {
            publicView.forEach(el => el.style.display = "flex");
            navLoginBtn.style.display = "inline-flex";
            navLogoutBtn.style.display = "none";
            userGreeting.style.display = "none";
        }
    }

    function showMainStudentView() {
        studentMainContent.style.display = "block";
        studentEventDetailsView.style.display = "none";
    }

    // --- 4. ADMIN EVENT MANAGEMENT ---
    const adminEventForm = document.getElementById("adminEventForm");
    const adminEventsList = document.getElementById("adminEventsList");
    
    function renderAdminEvents(searchQuery = "") {
        adminEventsList.innerHTML = "";
        
        // Always populate the registration filter dropdown with all events
        const adminRegFilter = document.getElementById("adminRegFilter");
        if (adminRegFilter && searchQuery === "") {
            adminRegFilter.innerHTML = `<option value="All">All Events</option>`;
            events.forEach(evt => {
                adminRegFilter.innerHTML += `<option value="${evt.name}">${evt.name}</option>`;
            });
        }
        
        // Filter events for display
        let displayEvents = events;
        if (searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase();
            displayEvents = events.filter(evt => 
                evt.name.toLowerCase().includes(q) || 
                evt.type.toLowerCase().includes(q) || 
                evt.date.includes(q)
            );
        }
        
        if (displayEvents.length === 0) { 
            adminEventsList.innerHTML = "<p>No matching events found.</p>"; 
            return; 
        }
        
        displayEvents.forEach(evt => {
            const row = document.createElement("div");
            row.className = "admin-event-row";
            row.innerHTML = `
                <div class="admin-event-info">
                    <h4>${evt.name}</h4>
                    <p><i class="fa-solid fa-calendar"></i> ${evt.date} | <i class="fa-solid fa-tag"></i> ${evt.type}</p>
                </div>
                <div class="admin-event-actions">
                    <button class="admin-btn-edit" data-id="${evt.id}">Edit</button>
                    <button class="admin-btn-delete" data-id="${evt.id}">Delete</button>
                </div>
            `;
            adminEventsList.appendChild(row);
        });

        document.querySelectorAll(".admin-btn-edit").forEach(btn => btn.onclick = function() { loadEventIntoAdminForm(parseInt(this.getAttribute("data-id"))); });
        document.querySelectorAll(".admin-btn-delete").forEach(btn => btn.onclick = function() { deleteEvent(parseInt(this.getAttribute("data-id"))); });
    }

    const adminEventSearch = document.getElementById("adminEventSearch");
    if (adminEventSearch) {
        adminEventSearch.addEventListener("input", function() {
            renderAdminEvents(this.value);
        });
    }

    function loadEventIntoAdminForm(id) {
        const evt = events.find(e => e.id === id);
        if (!evt) return;
        
        document.getElementById("adminEventId").value = evt.id;
        document.getElementById("adminEventName").value = evt.name;
        document.getElementById("adminEventType").value = evt.type;
        document.getElementById("adminEventDate").value = evt.date;
        document.getElementById("adminStartTime").value = evt.startTime || "";
        document.getElementById("adminEndTime").value = evt.endTime || "";
        document.getElementById("adminEventVenue").value = evt.venue;
        document.getElementById("adminOrganizer").value = evt.organizer || "";
        document.getElementById("adminDeadline").value = evt.deadline || "";
        document.getElementById("adminStatus").value = evt.status || "Open";
        document.getElementById("adminParticipation").value = evt.participation || "";
        document.getElementById("adminTeamSize").value = evt.teamSize || "";
        document.getElementById("adminEligibility").value = evt.eligibility || "";
        document.getElementById("adminEventDesc").value = evt.desc || "";
        
        document.getElementById("adminHighlights").value = evt.highlights ? evt.highlights.join("\n") : "";
        document.getElementById("adminRules").value = evt.rules ? evt.rules.join("\n") : "";
        document.getElementById("adminSchedule").value = evt.schedule ? evt.schedule.join("\n") : "";
        document.getElementById("adminRequirements").value = evt.requirements ? evt.requirements.join("\n") : "";
        document.getElementById("adminPrizes").value = evt.prizes ? evt.prizes.join("\n") : "";
        
        document.getElementById("adminFormTitle").textContent = "Edit Event";
        document.getElementById("adminSubmitBtn").textContent = "Update Event";
        document.getElementById("adminCancelBtn").style.display = "inline-block";
        adminDashboardView.scrollIntoView({behavior: "smooth"});
    }

    document.getElementById("adminCancelBtn").onclick = () => {
        adminEventForm.reset();
        document.getElementById("adminEventId").value = "";
        document.getElementById("adminFormTitle").textContent = "Add New Event";
        document.getElementById("adminSubmitBtn").textContent = "Add Event";
        document.getElementById("adminCancelBtn").style.display = "none";
    };

    adminEventForm.onsubmit = (e) => {
        e.preventDefault();
        const idVal = document.getElementById("adminEventId").value;
        
        const parseLines = (str) => str.trim().split("\n").filter(l => l.trim() !== "");

        const newEvent = {
            id: idVal ? parseInt(idVal) : Date.now(),
            name: document.getElementById("adminEventName").value.trim(),
            type: document.getElementById("adminEventType").value,
            date: document.getElementById("adminEventDate").value,
            startTime: document.getElementById("adminStartTime").value,
            endTime: document.getElementById("adminEndTime").value,
            venue: document.getElementById("adminEventVenue").value.trim(),
            organizer: document.getElementById("adminOrganizer").value.trim(),
            deadline: document.getElementById("adminDeadline").value,
            status: document.getElementById("adminStatus").value,
            participation: document.getElementById("adminParticipation").value.trim(),
            teamSize: document.getElementById("adminTeamSize").value.trim(),
            eligibility: document.getElementById("adminEligibility").value.trim(),
            desc: document.getElementById("adminEventDesc").value.trim(),
            highlights: parseLines(document.getElementById("adminHighlights").value),
            rules: parseLines(document.getElementById("adminRules").value),
            schedule: parseLines(document.getElementById("adminSchedule").value),
            requirements: parseLines(document.getElementById("adminRequirements").value),
            prizes: parseLines(document.getElementById("adminPrizes").value)
        };
        
        if (idVal) {
            const index = events.findIndex(e => e.id === parseInt(idVal));
            if (index !== -1) events[index] = newEvent;
        } else {
            events.push(newEvent);
        }
        
        localStorage.setItem("gmu_events", JSON.stringify(events));
        document.getElementById("adminCancelBtn").click(); 
        renderAdminEvents();
    };

    function deleteEvent(id) {
        if (confirm("Are you sure you want to delete this event?")) {
            events = events.filter(e => e.id !== id);
            localStorage.setItem("gmu_events", JSON.stringify(events));
            renderAdminEvents();
        }
    }

    // --- 5. ADMIN REGISTRATIONS TABLE ---
    const adminRegFilter = document.getElementById("adminRegFilter");
    function renderAdminRegistrations() {
        const tbody = document.getElementById("adminRegTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";
        
        const filterVal = adminRegFilter.value;
        let displayRegs = registrations;
        if (filterVal !== "All") displayRegs = registrations.filter(r => r.eventName === filterVal);
        
        if (displayRegs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No registrations found.</td></tr>`;
            return;
        }
        
        displayRegs.forEach(reg => {
            tbody.innerHTML += `
                <tr>
                    <td>${reg.studentName}</td>
                    <td>${reg.regNo}</td>
                    <td>${reg.department}</td>
                    <td>${reg.email}</td>
                    <td><strong>${reg.eventName}</strong></td>
                    <td>${reg.eventDate}</td>
                </tr>`;
        });
    }
    if(adminRegFilter) adminRegFilter.onchange = renderAdminRegistrations;


    // --- 6. STUDENT EVENT CATEGORY FILTERING ---
    const eventsContainer = document.getElementById("events-container");
    const eventSelect = document.getElementById("eventSelect");
    let currentCategoryFilter = "All";

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll(".filter-btn").forEach(b => b.className = "btn btn-outline filter-btn");
            this.className = "btn btn-primary filter-btn";
            currentCategoryFilter = this.getAttribute("data-category");
            renderStudentEvents();
        };
    });
    
    function renderStudentEvents() {
        eventsContainer.innerHTML = "";
        eventSelect.innerHTML = `<option value="" disabled selected>-- Choose an Event --</option>`;
        
        let filteredEvents = events;
        if (currentCategoryFilter !== "All") filteredEvents = events.filter(e => e.type === currentCategoryFilter);
        
        if (filteredEvents.length === 0) {
            eventsContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No events found in this category.</p>`;
        }
        
        // Populate registration dropdown
        events.forEach(evt => {
            const dateStr = new Date(evt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            eventSelect.innerHTML += `<option value="${evt.id}">${evt.name} (${dateStr})</option>`;
        });

        // Render event cards
        filteredEvents.forEach(evt => {
            const dateObj = new Date(evt.date);
            const card = document.createElement("div");
            card.className = "event-card";
            card.innerHTML = `
                <div class="event-date">
                    <h3>${dateObj.getDate()}</h3>
                    <span>${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dateObj.getMonth()]}</span>
                </div>
                <div class="event-details">
                    <h4>${evt.name}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${evt.venue}</p>
                    <p><i class="fa-solid fa-tag"></i> ${evt.type}</p>
                    <p style="font-size: 13px; margin-top: 10px; color: var(--text-muted);">${(evt.desc||"").substring(0, 50)}...</p>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-outline btn-sm view-det-btn" data-id="${evt.id}">View Details</button>
                        <button class="btn btn-primary btn-sm register-now-btn" data-id="${evt.id}">Register Now</button>
                    </div>
                </div>
            `;
            eventsContainer.appendChild(card);
        });

        document.querySelectorAll(".view-det-btn").forEach(btn => btn.onclick = function() { loadDetailedEventView(parseInt(this.getAttribute("data-id"))); });
        document.querySelectorAll(".register-now-btn").forEach(btn => btn.onclick = function() { autoSelectEventAndScroll(parseInt(this.getAttribute("data-id"))); });
    }

    // --- 7. RICH EVENT DETAILS VIEW ---
    document.getElementById("backToEventsBtn").onclick = showMainStudentView;

    function getThemeClass(type) {
        const t = type.toLowerCase();
        if (['technical', 'cultural', 'sports', 'academic', 'workshop'].includes(t)) return `theme-${t}`;
        return 'theme-other';
    }

    function calculateStatus(evt) {
        if(evt.status && evt.status !== 'Open') return evt.status; // Admin override
        if(!evt.deadline) return 'Registration Open';
        const today = new Date();
        const deadline = new Date(evt.deadline);
        const eventDate = new Date(evt.date);
        if (today > eventDate) return 'Event Completed';
        if (today > deadline) return 'Registration Closed';
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) return 'Registration Closing Soon';
        return 'Registration Open';
    }

    function loadDetailedEventView(id) {
        const evt = events.find(e => e.id === id);
        if (!evt) return;

        studentMainContent.style.display = "none";
        studentEventDetailsView.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const themeClass = getThemeClass(evt.type);
        const dateStr = new Date(evt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const deadlineStr = evt.deadline ? new Date(evt.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
        
        const dynamicStatus = calculateStatus(evt);
        let statusColorClass = 'status-open';
        if (dynamicStatus.includes('Closed')) statusColorClass = 'status-closed';
        if (dynamicStatus.includes('Soon')) statusColorClass = 'status-soon';
        if (dynamicStatus.includes('Completed')) statusColorClass = 'status-completed';

        let html = `
            <div class="event-det-header ${themeClass}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h2>${evt.name}</h2>
                        <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 14px;">${evt.type} Event</span>
                    </div>
                    <button id="shareBtn" class="btn btn-outline" style="background:rgba(255,255,255,0.2); color:white; border-color:white;"><i class="fa-solid fa-share-nodes"></i> Share</button>
                </div>
            </div>
            
            <div class="info-cards-grid">
                <div class="info-card">
                    <i class="fa-solid fa-calendar-day"></i>
                    <div class="info-card-text"><h5>Date</h5><p>${dateStr}</p></div>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-clock"></i>
                    <div class="info-card-text"><h5>Time</h5><p>${evt.startTime || 'TBA'} - ${evt.endTime || 'TBA'}</p></div>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-location-dot"></i>
                    <div class="info-card-text"><h5>Venue</h5><p>${evt.venue}</p></div>
                </div>
                <div class="info-card">
                    <i class="fa-solid fa-sitemap"></i>
                    <div class="info-card-text"><h5>Organized By</h5><p>${evt.organizer || 'College Admin'}</p></div>
                </div>
            </div>

            <div class="event-det-body">
                <div class="main-details">
                    <div class="det-section">
                        <h3>About This Event</h3>
                        <p style="line-height: 1.6;">${evt.desc || 'Details will be announced soon.'}</p>
                    </div>
                    
                    ${evt.highlights && evt.highlights.length > 0 ? `
                    <div class="det-section">
                        <h3>Event Highlights</h3>
                        <ul class="det-list">
                            ${evt.highlights.map(h => `<li><i class="fa-solid fa-check-circle"></i> <span>${h}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${evt.schedule && evt.schedule.length > 0 ? `
                    <div class="det-section">
                        <h3>Event Schedule</h3>
                        <ul class="det-list">
                            ${evt.schedule.map(s => `<li><i class="fa-solid fa-clock"></i> <span>${s}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${evt.rules && evt.rules.length > 0 ? `
                    <div class="det-section">
                        <h3>Rules & Guidelines</h3>
                        <ul class="det-list">
                            ${evt.rules.map(r => `<li><i class="fa-solid fa-angle-right"></i> <span>${r}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}
                </div>

                <div class="side-details">
                    <div class="det-section" style="background: #fdfdfd; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h3 style="margin-top:0; font-size:18px;">Registration</h3>
                        <p style="margin-bottom:10px;">Status: <span class="status-badge ${statusColorClass}">${dynamicStatus}</span></p>
                        <p style="margin-bottom:20px; font-size:14px;">Deadline: <strong>${deadlineStr}</strong></p>
                        
                        <button class="btn btn-primary" id="detRegisterBtn" style="width: 100%;" ${dynamicStatus.includes('Closed') || dynamicStatus.includes('Completed') ? 'disabled style="background:#ccc;border-color:#ccc;"' : ''}>
                            ${dynamicStatus.includes('Closed') ? 'Registration Closed' : (dynamicStatus.includes('Completed') ? 'Event Completed' : 'Register Now')}
                        </button>
                    </div>

                    ${(evt.participation || evt.eligibility) ? `
                    <div class="det-section">
                        <h3 style="font-size:18px;">Participation</h3>
                        ${evt.eligibility ? `<p style="font-size:14px; margin-bottom:5px;"><strong>Eligibility:</strong> ${evt.eligibility}</p>` : ''}
                        ${evt.participation ? `<p style="font-size:14px; margin-bottom:5px;"><strong>Format:</strong> ${evt.participation}</p>` : ''}
                        ${evt.teamSize ? `<p style="font-size:14px; margin-bottom:5px;"><strong>Team Size:</strong> ${evt.teamSize}</p>` : ''}
                    </div>` : ''}

                    ${evt.requirements && evt.requirements.length > 0 ? `
                    <div class="det-section">
                        <h3 style="font-size:18px;">Requirements</h3>
                        <ul class="det-list" style="font-size:14px;">
                            ${evt.requirements.map(r => `<li><i class="fa-solid fa-asterisk"></i> <span>${r}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${evt.prizes && evt.prizes.length > 0 ? `
                    <div class="det-section">
                        <h3 style="font-size:18px;">Prizes & Recognition</h3>
                        <ul class="det-list" style="font-size:14px;">
                            ${evt.prizes.map((p, i) => `<li><i class="fa-solid ${i===0?'fa-trophy':'fa-medal'}"></i> <span>${p}</span></li>`).join('')}
                        </ul>
                    </div>` : ''}
                </div>
            </div>
        `;

        document.getElementById("dynamicEventDetails").innerHTML = html;

        // Share API
        document.getElementById("shareBtn").onclick = () => {
            const shareData = { title: evt.name, text: `Check out ${evt.name} at GMU Events!`, url: window.location.href };
            if (navigator.share) {
                navigator.share(shareData).catch(err => console.log('Share error:', err));
            } else {
                navigator.clipboard.writeText(`${evt.name} - ${evt.date}\nVenue: ${evt.venue}`);
                alert("Event details copied to clipboard!");
            }
        };

        // Register Button in details view
        const detRegBtn = document.getElementById("detRegisterBtn");
        if(detRegBtn && !detRegBtn.disabled) {
            detRegBtn.onclick = () => { autoSelectEventAndScroll(evt.id); };
        }

        // Render "You May Also Like"
        const related = events.filter(e => e.type === evt.type && e.id !== evt.id).slice(0, 3);
        const relContainer = document.getElementById("relatedEventsContainer");
        relContainer.innerHTML = "";
        if (related.length > 0) {
            related.forEach(r => {
                relContainer.innerHTML += `
                    <div class="event-card" style="cursor:pointer;" onclick="document.querySelector('.view-det-btn[data-id=\\'${r.id}\\']').click();">
                        <div class="event-details" style="padding: 15px;">
                            <h4 style="margin-top:0;">${r.name}</h4>
                            <p style="font-size:12px;"><i class="fa-solid fa-calendar"></i> ${r.date}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            relContainer.innerHTML = "<p style='font-size:14px; color:var(--text-muted);'>No other similar events right now.</p>";
        }
    }

    function autoSelectEventAndScroll(id) {
        showMainStudentView(); // Go back to main view so form is visible
        const sel = document.getElementById("eventSelect");
        sel.value = id;
        sel.style.borderColor = "var(--maroon-primary)";
        sel.style.borderWidth = "2px";
        setTimeout(() => { sel.style.borderWidth = "1px"; sel.style.borderColor = "#ccc"; }, 1000);
        document.getElementById("register").scrollIntoView({ behavior: "smooth" });
    }

    // --- 8. STUDENT CALENDAR WIDGET ---
    let currentCalDate = new Date(); 
    function renderCalendar() {
        const calDatesGrid = document.getElementById("calDatesGrid");
        if (!calDatesGrid) return;

        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        document.getElementById("calMonthYear").innerText = `${monthNames[month]} ${year}`;
        calDatesGrid.innerHTML = "";

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) calDatesGrid.innerHTML += `<div style="background:transparent;border:none;"></div>`;

        // Gather all events for this month to display in the side panel
        const monthEvents = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement("div");
            // Prevent style.css from stretching it into a huge square
            dayDiv.style.display = "flex";
            dayDiv.style.flexDirection = "column";
            dayDiv.style.alignItems = "center";
            dayDiv.style.justifyContent = "flex-start";
            dayDiv.style.padding = "5px 2px";
            dayDiv.style.aspectRatio = "auto";
            dayDiv.style.minHeight = "40px";
            
            const eventsOnDay = events.filter(e => {
                const eDate = new Date(e.date);
                return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === i;
            });

            if (eventsOnDay.length > 0) {
                eventsOnDay.forEach(e => monthEvents.push(e)); // add to monthly list
                
                dayDiv.className = "has-event";
                dayDiv.style.cursor = "pointer";
                dayDiv.style.border = "1px solid var(--gold-accent)";
                dayDiv.style.background = "#fff9f0";
                dayDiv.style.borderRadius = "4px";
                
                let evtHtml = `<span style="font-weight:bold; margin-bottom:2px;">${i}</span>`;
                
                if (eventsOnDay.length === 1) {
                    const shortName = eventsOnDay[0].name.length > 12 ? eventsOnDay[0].name.substring(0, 10) + '...' : eventsOnDay[0].name;
                    evtHtml += `<div style="font-size:9px; background:var(--maroon-primary); color:var(--gold-metallic); border-radius:2px; padding:2px 4px; line-height:1.1; white-space:nowrap; overflow:hidden; width:90%;">${shortName}</div>`;
                } else {
                    evtHtml += `<div style="font-size:9px; background:var(--maroon-primary); color:var(--gold-metallic); border-radius:2px; padding:2px 4px; line-height:1.1; width:90%;">${eventsOnDay.length} Events</div>`;
                }
                dayDiv.innerHTML = evtHtml;

                // When clicked, show preview for this specific date
                dayDiv.onclick = () => { 
                    const previewPanel = document.getElementById("calEventPreview");
                    
                    const evt = eventsOnDay[0]; 
                    const pDate = new Date(evt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    
                    let multiHtml = "";
                    if (eventsOnDay.length > 1) {
                        multiHtml = `<p style="font-size:11px; color:#ff0000; margin-bottom:10px;">Note: There are ${eventsOnDay.length} events today. Showing first.</p>`;
                    }

                    previewPanel.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div>
                                <h3 style="color: var(--maroon-primary); margin: 0 0 5px 0;">${evt.name}</h3>
                                <span style="font-size:12px; background:#eee; padding:2px 6px; border-radius:4px;">${evt.type}</span>
                            </div>
                            <button class="btn btn-outline" id="backToMonthBtn" style="padding:2px 8px; font-size:11px;"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        ${multiHtml}
                        <p style="font-size:13px; margin-bottom:8px;"><i class="fa-solid fa-calendar"></i> <strong>Date:</strong> ${pDate}</p>
                        <p style="font-size:13px; margin-bottom:8px;"><i class="fa-solid fa-location-dot"></i> <strong>Venue:</strong> ${evt.venue}</p>
                        <p style="font-size:13px; margin-bottom:15px; color:var(--text-muted);">${(evt.desc || "").substring(0, 100)}...</p>
                        
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-outline btn-sm view-det-btn" style="flex:1; padding:8px;" data-id="${evt.id}">View Details</button>
                            <button class="btn btn-primary btn-sm register-now-btn" style="flex:1; padding:8px;" data-id="${evt.id}">Register Now</button>
                        </div>
                    `;

                    previewPanel.querySelector(".view-det-btn").onclick = function() { loadDetailedEventView(parseInt(this.getAttribute("data-id"))); };
                    previewPanel.querySelector(".register-now-btn").onclick = function() { autoSelectEventAndScroll(parseInt(this.getAttribute("data-id"))); };
                    previewPanel.querySelector("#backToMonthBtn").onclick = renderMonthList;
                };
            } else {
                dayDiv.innerHTML = `<span>${i}</span>`;
            }
            calDatesGrid.appendChild(dayDiv);
        }

        // Render the list of all events for this month in the side panel
        function renderMonthList() {
            const previewPanel = document.getElementById("calEventPreview");
            if (monthEvents.length === 0) {
                previewPanel.innerHTML = `<h3 style="color: var(--maroon-primary); margin:0 0 15px 0; border-bottom: 2px solid var(--gold-accent); padding-bottom:10px;">${monthNames[month]} Events</h3>
                <p style="color:var(--text-muted); font-size:14px; text-align:center; margin-top:20px;">No events scheduled for this month.</p>`;
                return;
            }

            let listHtml = `<h3 style="color: var(--maroon-primary); margin:0 0 15px 0; border-bottom: 2px solid var(--gold-accent); padding-bottom:10px;">${monthNames[month]} Events</h3>`;
            listHtml += `<div style="display:flex; flex-direction:column; gap:10px;">`;
            
            monthEvents.forEach(evt => {
                const dateNum = new Date(evt.date).getDate();
                listHtml += `
                    <div style="display:flex; gap:10px; align-items:center; background:#f9f9f9; padding:8px; border-radius:4px; border-left:3px solid var(--maroon-primary); cursor:pointer;" onclick="autoSelectEventAndScroll(${evt.id})">
                        <div style="background:var(--gold-metallic); color:var(--maroon-primary); font-weight:bold; border-radius:4px; width:35px; height:35px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${dateNum}
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:14px; color:var(--text-dark);">${evt.name}</div>
                            <div style="font-size:11px; color:var(--text-muted);">${evt.type} • ${evt.venue}</div>
                        </div>
                    </div>
                `;
            });
            listHtml += `</div>`;
            previewPanel.innerHTML = listHtml;
        }

        renderMonthList(); // Call it immediately upon calendar render
    }
    document.getElementById("calPrevBtn")?.addEventListener("click", () => { currentCalDate.setMonth(currentCalDate.getMonth() - 1); renderCalendar(); });
    document.getElementById("calNextBtn")?.addEventListener("click", () => { currentCalDate.setMonth(currentCalDate.getMonth() + 1); renderCalendar(); });
    document.getElementById("calTodayBtn")?.addEventListener("click", () => { currentCalDate = new Date(); renderCalendar(); });


    // --- 9. REGISTRATION FORM VALIDATION & EMAIL ---
    const regForm = document.getElementById("registration-form");
    if (regForm) {
        regForm.onsubmit = function (e) {
            e.preventDefault();
            document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
            let isValid = true;

            const nameVal = document.getElementById("studentName").value.trim();
            const regNoVal = document.getElementById("regNo").value.trim();
            const deptVal = document.getElementById("department").value.trim();
            const phoneVal = document.getElementById("phoneNumber").value.trim();
            const emailVal = document.getElementById("studentEmail").value.trim();
            const selectedEventId = parseInt(document.getElementById("eventSelect").value);

            if (nameVal.length < 3 || !/^[A-Za-z\s]+$/.test(nameVal)) { document.getElementById("nameError").textContent = "Valid name required."; isValid = false; }
            if (regNoVal === "") { document.getElementById("regError").textContent = "Required."; isValid = false; }
            if (deptVal === "") { document.getElementById("deptError").textContent = "Required."; isValid = false; }
            if (!/^\d{10}$/.test(phoneVal)) { document.getElementById("phoneError").textContent = "10-digit number required."; isValid = false; }
            if (!/^\S+@\S+\.\S+$/.test(emailVal)) { document.getElementById("emailError").textContent = "Valid email required."; isValid = false; }
            if (!selectedEventId) { document.getElementById("eventError").textContent = "Select an event."; isValid = false; }

            if (isValid) {
                const submitBtn = document.getElementById("submitRegBtn");
                submitBtn.textContent = "Processing..."; submitBtn.disabled = true;

                const evt = events.find(e => e.id === selectedEventId);
                const newReg = {
                    studentName: nameVal, regNo: regNoVal, department: deptVal, phone: phoneVal, email: emailVal,
                    eventId: selectedEventId, eventName: evt.name, eventDate: evt.date, timestamp: new Date().toISOString()
                };
                registrations.push(newReg);
                localStorage.setItem("gmu_registrations", JSON.stringify(registrations));

                try {
                    if (typeof emailjs !== 'undefined') {
                        // User's custom keys
                        emailjs.init("W72BFDsVHtshcKb2i");
                        const templateParams = { student_name: nameVal, student_email: emailVal, event_name: evt.name, event_date: evt.date, event_venue: evt.venue, event_type: evt.type };
                        emailjs.send("service_go00yxm", "template_md0j60w", templateParams)
                            .then(() => { showRegistrationSuccess(); })
                            .catch((err) => { alert("EMAIL FAILED: " + JSON.stringify(err)); showRegistrationSuccess(); });
                    } else { showRegistrationSuccess(); }
                } catch (error) { showRegistrationSuccess(); }

                function showRegistrationSuccess() {
                    submitBtn.textContent = "Complete Registration"; submitBtn.disabled = false;
                    const successMsg = document.getElementById("successMessage");
                    successMsg.style.display = "flex";
                    regForm.reset(); document.getElementById("eventSelect").value = "";
                    if (typeof renderAdminRegistrations === "function") renderAdminRegistrations();
                    setTimeout(() => { successMsg.style.display = "none"; }, 4000);
                }
            }
        };

        ["studentName", "regNo", "department", "phoneNumber", "studentEmail"].forEach(id => {
            document.getElementById(id).onkeyup = function() { if (this.value.trim() !== "") this.nextElementSibling.textContent = ""; };
        });
        document.getElementById("eventSelect").onchange = function() { if (this.value !== "") document.getElementById("eventError").textContent = ""; };
    }
    
    function renderUpcomingEventsMarquee() {
        const marquee = document.getElementById("upcomingMarquee");
        if (!marquee || !events.length) return;
        
        // Filter events from today onwards
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let upcoming = events.filter(e => new Date(e.date) >= today);
        // Sort by closest date
        upcoming.sort((a,b) => new Date(a.date) - new Date(b.date));
        // Take top 10 closest events
        upcoming = upcoming.slice(0, 10);
        
        let marqueeHtml = upcoming.map(e => {
            return `<span style="margin-right: 40px;"><i class="fa-solid fa-calendar-day"></i> <strong>${e.date}</strong> - ${e.name} (${e.type}) @ ${e.venue}</span>`;
        }).join("");
        
        marquee.innerHTML = marqueeHtml || "<span>No upcoming events currently scheduled.</span>";
    }

    renderUpcomingEventsMarquee();
    updateUIForRole();
});
