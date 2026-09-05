window.initContacts = () => {
  const contactPage = document.querySelector("#page-content .contacts-page");
  if (!contactPage) return;

  const copyButton = contactPage.querySelector(".copy-button");
  const copyToast = contactPage.querySelector(".copy-toast");
  const contactForm = contactPage.querySelector(".contact-form");
  const submitButton = contactForm?.querySelector('button[type="submit"]');
  const formStatus = contactForm?.querySelector(".form-status");
  let toastTimer;
  let isSubmitting = false;

  const showCopyToast = () => {
    copyToast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => copyToast.classList.remove("visible"), 1800);
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const tempInput = document.createElement("textarea");
    tempInput.value = value;
    tempInput.setAttribute("readonly", "");
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    tempInput.style.left = "-9999px";
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(tempInput);

    if (!copied) throw new Error("Clipboard unavailable");
  };

  copyButton?.addEventListener("click", async () => {
    try {
      await copyText(copyButton.dataset.copy || "0994 608 5013");
      showCopyToast();
    } catch {
      copyToast.textContent = "Unable to copy mobile number";
      showCopyToast();
      setTimeout(() => (copyToast.textContent = "Mobile number copied"), 1800);
    }
  });

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const message = formData.get("message").trim();
    const subject = `Portfolio inquiry from ${name}`;

    formStatus.textContent = "Sending your message...";
    formStatus.classList.remove("is-success", "is-error");
    isSubmitting = true;
    submitButton?.setAttribute("aria-busy", "true");
    submitButton.disabled = true;

    try {
      const submission = new FormData();
      submission.append("name", name);
      submission.append("email", email);
      submission.append("message", message);
      submission.append("_subject", subject);
      submission.append("timestamp", new Date().toLocaleString());
      submission.append("_captcha", "false");
      submission.append("_template", "table");

      const response = await fetch(
        "https://formsubmit.co/ajax/quiniano.infotech@gmail.com",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: submission,
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Submission failed");
      }

      contactForm.reset();
      formStatus.textContent = "Message sent successfully.";
      formStatus.classList.add("is-success");
    } catch {
      formStatus.textContent =
        "Unable to send your message right now. Please try again.";
      formStatus.classList.add("is-error");
    } finally {
      isSubmitting = false;
      submitButton?.removeAttribute("aria-busy");
      submitButton.disabled = false;
    }
  });
};
