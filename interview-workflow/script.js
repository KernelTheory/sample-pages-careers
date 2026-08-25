(() => {
  const roleProfiles = {
    hr: {
      name: "Asha Menon",
      role: "HR Admin",
      initials: "AM",
      firstScreen: "hr-dashboard",
      access: "You can manage every interview workflow and view consolidated feedback."
    },
    manager: {
      name: "Dr Meera Nair",
      role: "Hiring Manager",
      initials: "MN",
      firstScreen: "manager-dashboard",
      access: "You can view your assigned jobs and candidates, then send recommendations to HR."
    },
    panelist: {
      name: "Prof Arun Kumar",
      role: "Panelist",
      initials: "AK",
      firstScreen: "panel-dashboard",
      access: "You can view assigned candidate profiles and only your own feedback submissions."
    }
  };

  const screenRoles = {
    "hr-dashboard": "hr",
    "hr-workflow": "hr",
    "hr-candidate": "hr",
    "manager-dashboard": "manager",
    "manager-candidate": "manager",
    "panel-dashboard": "panelist",
    "panel-feedback": "panelist"
  };

  const toast = document.querySelector("#toast");
  const toastTitle = document.querySelector("#toast-title");
  const toastCopy = document.querySelector("#toast-copy");
  let toastTimer;

  function showToast(title, copy) {
    window.clearTimeout(toastTimer);
    toastTitle.textContent = title;
    toastCopy.textContent = copy;
    toast.classList.add("visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
  }

  function setRole(role, navigateToDefault = true) {
    const profile = roleProfiles[role];
    if (!profile) return;

    document.querySelectorAll(".role-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.role === role);
    });
    document.querySelectorAll("[data-role-nav]").forEach((nav) => {
      nav.classList.toggle("hidden", nav.dataset.roleNav !== role);
    });

    document.querySelector("#persona-name").textContent = profile.name;
    document.querySelector("#persona-role").textContent = profile.role;
    document.querySelector("#persona-avatar").textContent = profile.initials;
    document.querySelector("#access-copy").textContent = profile.access;

    if (navigateToDefault) navigate(profile.firstScreen);
  }

  function navigate(screenId, updateHash = true) {
    const screen = document.getElementById(screenId);
    if (!screen) return;

    const role = screenRoles[screenId];
    setRole(role, false);
    document.querySelectorAll(".screen").forEach((item) => item.classList.toggle("active", item === screen));
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.target === screenId));

    if (updateHash) history.replaceState(null, "", `#${screenId}`);
    window.scrollTo({ top: 0, behavior: "auto" });
    screen.focus({ preventScroll: true });
  }

  function buildRatingOptions(container) {
    const group = container.dataset.ratingGroup;
    const labels = ["Unsuitable", "Maybe", "Good", "Very good", "Strong match"];
    for (let score = 1; score <= 5; score += 1) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `rating-${group}`;
      input.value = score;
      input.setAttribute("aria-label", `${group}: ${score} out of 5`);
      label.append(input, document.createTextNode(score));
      if (container.dataset.labeled === "true") {
        const text = document.createElement("small");
        text.textContent = labels[score - 1];
        label.append(text);
      }
      container.append(label);
    }
  }

  function updateRatedCount() {
    const groups = document.querySelectorAll(".rating-row .rating-options");
    const rated = [...groups].filter((group) => group.querySelector("input:checked")).length;
    document.querySelector("#rated-count").textContent = rated;
  }

  function renumberRounds() {
    const cards = [...document.querySelectorAll("#round-list .round-card")];
    cards.forEach((card, index) => {
      const number = index + 1;
      card.dataset.round = number;
      card.querySelector(".round-order strong").textContent = number;
      card.querySelector(".round-title-row .eyebrow").textContent = `Round ${number}`;
    });
    document.querySelector("#round-count").textContent = `${cards.length} configured`;
  }

  function addRound() {
    const list = document.querySelector("#round-list");
    const card = document.createElement("article");
    card.className = "round-card";
    card.innerHTML = `
      <div class="round-order">
        <button type="button" aria-label="Move new interview round up" data-move="up">↑</button>
        <strong></strong>
        <button type="button" aria-label="Move new interview round down" data-move="down">↓</button>
      </div>
      <div class="round-body">
        <div class="round-title-row">
          <div><span class="eyebrow"></span><h3 contenteditable="true">Additional Interview</h3></div>
          <label class="toggle-label"><input type="checkbox" class="final-round"> Final round</label>
        </div>
        <div class="field-grid three">
          <label>Interview mode<select><option>Virtual</option><option>In-person</option><option>Decide per candidate</option></select></label>
          <label>Duration<select><option>45 minutes</option><option>30 minutes</option><option>60 minutes</option></select></label>
          <label>Feedback due<select><option>Within 24 hours</option><option>Within 48 hours</option></select></label>
        </div>
        <div class="assignment-line"><span>Panelists</span><button class="chip-add" type="button" data-action="prototype">+ Add panelist</button></div>
      </div>
      <button class="round-menu" type="button" aria-label="Round actions" data-action="prototype">•••</button>`;
    list.append(card);
    renumberRounds();
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast("Round added", "Rename it, choose the mode, and assign panelists.");
  }

  document.querySelectorAll("[data-rating-group]").forEach(buildRatingOptions);
  document.querySelectorAll(".rating-row input").forEach((input) => input.addEventListener("change", updateRatedCount));

  document.addEventListener("click", (event) => {
    const targetButton = event.target.closest("[data-target]");
    if (targetButton) {
      event.preventDefault();
      navigate(targetButton.dataset.target);
      return;
    }

    const roleButton = event.target.closest(".role-button");
    if (roleButton) {
      setRole(roleButton.dataset.role);
      return;
    }

    const moveButton = event.target.closest("[data-move]");
    if (moveButton) {
      const card = moveButton.closest(".round-card");
      if (moveButton.dataset.move === "up" && card.previousElementSibling) {
        card.parentNode.insertBefore(card, card.previousElementSibling);
      }
      if (moveButton.dataset.move === "down" && card.nextElementSibling) {
        card.parentNode.insertBefore(card.nextElementSibling, card);
      }
      renumberRounds();
      return;
    }

    const tab = event.target.closest("[data-feedback-tab]");
    if (tab) {
      document.querySelectorAll("[data-feedback-tab]").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll("[data-feedback-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.feedbackPanel === tab.dataset.feedbackTab));
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;
    event.preventDefault();

    const messages = {
      prototype: ["Prototype interaction", "This control shows where the production action will live."],
      "save-workflow": ["Workflow draft saved", "Changes are kept in this prototype until the page is refreshed."],
      "publish-workflow": ["Workflow published", "Future shortlisted candidates will follow these rounds."],
      "save-feedback": ["Draft saved", "Only you can see this draft until it is submitted."],
      "advance-candidate": ["Candidate progressed", "Nandita is now ready to schedule for the HR Interview."],
      "reject-candidate": ["Rejection checkpoint", "Production will require HR confirmation and a communication choice."],
      "save-schedule": ["Interview scheduled", "The simulated invitation and Google Meet link are ready."],
      "submit-recommendation": ["Recommendation sent", "HR can now review your recommendation with panel feedback."]
    };

    if (action.dataset.action === "open-schedule") {
      document.querySelector("#schedule-dialog").showModal();
      return;
    }

    if (action.dataset.action === "save-feedback") {
      document.querySelector("#draft-status").textContent = `Draft saved locally at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    if (action.dataset.action === "submit-recommendation" && !document.querySelector('input[name="manager-recommendation"]:checked')) {
      showToast("Choose a recommendation", "Select progress, discussion, or do not progress first.");
      return;
    }

    const [title, copy] = messages[action.dataset.action] || messages.prototype;
    showToast(title, copy);
  });

  document.querySelector("#add-round").addEventListener("click", addRound);

  document.querySelector("#round-list").addEventListener("change", (event) => {
    if (!event.target.classList.contains("final-round")) return;
    if (event.target.checked) {
      document.querySelectorAll(".final-round").forEach((input) => {
        if (input !== event.target) input.checked = false;
      });
    }
    document.querySelectorAll(".round-card").forEach((card) => card.classList.toggle("final", card.querySelector(".final-round").checked));
  });

  document.querySelector("#round-list").addEventListener("click", (event) => {
    const remove = event.target.closest(".person-chip button");
    if (remove) {
      remove.closest(".person-chip").remove();
      showToast("Panelist removed", "Their access would be withdrawn for this round.");
    }
  });

  document.querySelector("#evaluation-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const coreRatings = [...document.querySelectorAll(".rating-row .rating-options")].every((group) => group.querySelector("input:checked"));
    const overall = document.querySelector('input[name="rating-overall"]:checked');
    const recommendation = document.querySelector('input[name="panel-recommendation"]:checked');
    if (!coreRatings || !overall || !recommendation) {
      showToast("Complete the assessment", "Rate all six areas, add an overall score, and choose a recommendation.");
      return;
    }
    showToast("Feedback submitted", "Your response is now read-only and visible to HR.");
    event.submitter.disabled = true;
    event.submitter.textContent = "Submitted";
  });

  const initialScreen = window.location.hash.replace("#", "");
  if (screenRoles[initialScreen]) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    navigate(initialScreen, false);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      history.replaceState(null, "", `#${initialScreen}`);
    });
  } else {
    setRole("hr");
  }
})();
