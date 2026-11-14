/* Registered before the portfolio bundle so the form shares its React runtime. */
window.createPortfolioContact = function createPortfolioContact(React, icons) {
  const element = React.createElement;
  return function PortfolioContact() {
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState('');
    const [done, setDone] = React.useState(false);
    const submission = React.useRef(null);
    const locked = React.useRef(false);

    async function submit(event) {
      event.preventDefault();
      if (locked.current) return;
      const form = event.currentTarget;
      const fields = Object.fromEntries(new FormData(form));
      const signature = JSON.stringify(fields);
      if (submission.current?.signature !== signature) {
        submission.current = { signature, id: crypto.randomUUID() };
      }
      locked.current = true;
      setBusy(true);
      setNotice('Sending your message…');
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, id: submission.current.id })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'Please use the email or WhatsApp link above.');
        }
        setNotice('Thank you for getting in touch. Your message has been submitted.');
        setDone(true);
      } catch (error) {
        setNotice(error instanceof SyntaxError || error instanceof TypeError
          ? 'Could not confirm submission. Please try again or use the contact links above.'
          : error.message);
      } finally {
        locked.current = false;
        setBusy(false);
      }
    }

    function contactCard(icon, href, label, accessibleName) {
      return element('div', { className: 'app__footer-card' },
        element('img', { src: icon, alt: '' }),
        element('a', { href, className: 'p-text', 'aria-label': accessibleName }, label));
    }
    function field(tag, name, label, props) {
      return element('div', { className: 'app__flex' },
        element(tag, { name, placeholder: label, 'aria-label': label, required: true, className: 'p-text', ...props }));
    }
    return element(React.Fragment, null,
      element('h2', { className: 'head-text' }, "Let's Talk About It"),
      element('div', { className: 'app__footer-cards' },
        contactCard(icons.email, 'mailto:wisanibaloyi65@gmail.com', 'wisanibaloyi65@gmail.com', 'Email Wisani Baloyi'),
        contactCard(icons.mobile, 'https://wa.me/27682250663?text=Hi%20Mr%20Baloyi.%20Just%20went%20through%20your%20online%20resume%20and%20I%20would%20love%20to%20chat%20about...', '+27 68 225 0663', 'Message Wisani on WhatsApp')),
      !done && element('form', { onSubmit: submit, className: 'app__footer-form app__flex', 'aria-busy': busy },
        field('input', 'name', 'Your name', { type: 'text', autoComplete: 'name', maxLength: 80 }),
        field('input', 'email', 'Your email', { type: 'email', autoComplete: 'email', maxLength: 254 }),
        field('textarea', 'message', 'Your message', { maxLength: 640, 'aria-describedby': 'contact-message-limit' }),
        element('span', { id: 'contact-message-limit', className: 'p-text' }, 'Up to 640 characters'),
        element('button', { type: 'submit', disabled: busy, className: 'p-text' }, busy ? 'Sending…' : 'Send message')),
      element('p', { role: 'status', 'aria-live': 'polite', className: done ? 'bold-text' : 'p-text' }, notice));
  };
};
