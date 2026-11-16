/* Both slides occupy the same grid cell so the card stays the height of its longest quote. */
window.portfolioTestimonials = function (React, records, imageUrl, Previous, Next) {
  const h = React.createElement;
  return function Testimonials() {
    const [slide, setSlide] = React.useState({index: 0, direction: 1});
    function move(direction) {
      setSlide(previous => ({
        index: (previous.index + direction + records.length) % records.length,
        direction
      }));
    }
    if (!records.length) return null;
    function arrow(label, direction, icon) {
      return h('button', {type: 'button', className: 'app__flex', 'aria-label': label,
        onClick: () => move(direction)}, h(icon));
    }
    return h(React.Fragment, null,
      h('div', {className: 'app__testimonial-item app__flex quote-stack', 'aria-live': 'polite',
        'aria-atomic': true, style: {'--quote-shift': slide.direction * 12 + 'px'}},
        records.map((record, index) => h('div', {
          key: record._id, className: 'quote-slide app__flex', 'aria-hidden': index !== slide.index
        },
        h('img', {src: imageUrl(record.imgurl), alt: record.name}),
        h('div', {className: 'app__testimonial-content'},
          h('p', {className: 'p-text'}, record.feedback),
          h('div', null, h('h3', {className: 'bold-text'}, record.name),
            h('h5', {className: 'p-text'}, record.company),
            record.position && h('h5', {className: 'p-text'}, record.position)))))),
      records.length > 1 && h('div', {className: 'app__testimonial-btns app__flex'},
        arrow('Previous testimonial', -1, Previous), arrow('Next testimonial', 1, Next)));
  };
};
