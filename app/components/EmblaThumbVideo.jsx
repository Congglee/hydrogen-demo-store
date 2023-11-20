export function EmblaThumbVideo(props) {
  const {selected, videoSrc, onClick, toggleVideo, isPlaying} = props;

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
        <div className="shadow relative aspect-square cursor-pointer rounded-lg border">
          <img
            src={videoSrc.previewImage.url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="video-action absolute inset-0 z-10 flex items-center justify-center rounded-lg">
            <div
              className="flex h-[65%] w-[65%] items-center justify-center rounded-full bg-gray-300 text-black"
              onClick={toggleVideo}
            >
              {isPlaying ? (
                <svg
                  className="opacity-50"
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth={0}
                  viewBox="0 0 16 16"
                  height={66}
                  width={66}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z" />
                </svg>
              ) : (
                <svg
                  width={36}
                  height={42}
                  viewBox="0 0 36 42"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="-mr-2 opacity-50"
                >
                  <path
                    d="M36 21L1.8571e-06 41.7846L3.67415e-06 0.21539L36 21Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
