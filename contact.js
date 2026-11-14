window.createPortfolioContact = function (React, icons) {
  const h = React.createElement;
  function link(href, icon, title, detail) {
    return h('a', {className:'contact-action', href}, h('img',{src:icon,alt:''}),
      h('span',null,h('strong',null,title),h('small',null,detail)));
  }
  return function Contact() {
    return h(React.Fragment,null,h('h2',{className:'head-text'},"Let's Talk About It"),
      h('div',{className:'contact-actions'},
        link('https://wa.me/27682250663?text='+encodeURIComponent('Hi Mr Baloyi. Just went through your online resume and I would love to chat about...'),'/career-icons/whatsapp.svg','Chat on WhatsApp','+27 68 225 0663'),
        link('mailto:wisanibaloyi65@gmail.com?subject=Portfolio%20enquiry',icons.email,'Send an email','wisanibaloyi65@gmail.com')));
  };
};
