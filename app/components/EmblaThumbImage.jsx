export function EmblaThumbImage(props) {
  const {selected, imgSrc, onClick} = props;

  return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : '',
      )}
    >
      <button
        onClick={onClick}
        className="embla-thumbs__slide__button w-[70px] min-w-[70px] lg:mb-2 lg:mr-2 last:mr-0"
        type="button"
      >
        <img
          className="embla-thumbs__slide__img w-full h-full"
          src={imgSrc}
          alt="Your alt text"
        />
      </button>
    </div>
  );
}
