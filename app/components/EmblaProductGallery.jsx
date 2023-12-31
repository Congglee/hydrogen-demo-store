import {useState, useEffect, useCallback} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {EmblaThumbImage} from './EmblaThumbImage';
import {EmblaThumbVideo} from './EmblaThumbVideo';
import {PrevButton, NextButton} from './EmblaArrowButtons';
import ReactPlayer from 'react-player/youtube';

export function EmblaProductGallery(props) {
  const {slides, options, media} = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // const images = ['image1', 'image2', 'image3', 'image4'];
  // const imageByIndex = (index) => images[index % images.length];
  const imageUrls = media
    ?.filter((image) => image.mediaContentType === 'IMAGE')
    ?.map((image) => image.image.url);
  const imageByIndex = (index) => imageUrls[index % imageUrls.length];
  const videoMediaContents = media?.filter(
    (video) => video.mediaContentType === 'EXTERNAL_VIDEO',
  );
  const videoByIndex = (index) =>
    videoMediaContents[index % videoMediaContents.length];

  const scrollPrev = useCallback(() => {
    emblaMainApi && emblaMainApi.scrollPrev();
    setIsPlaying(false);
  }, [emblaMainApi]);
  const scrollNext = useCallback(() => {
    emblaMainApi && emblaMainApi.scrollNext();
    setIsPlaying(false);
  }, [emblaMainApi]);

  const onInit = useCallback((emblaMainApi) => {
    setScrollSnaps(emblaMainApi.scrollSnapList());
  }, []);

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
      setIsPlaying(false);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;

    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaMainApi.canScrollPrev());
    setNextBtnDisabled(!emblaMainApi.canScrollNext());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;

    onInit(emblaMainApi);
    onSelect(emblaMainApi);
    emblaMainApi.on('reInit', onInit);
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
  }, [emblaMainApi, onSelect, onInit]);

  const toggleVideo = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="embla grid col-span-2">
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">
          {media.map((mediaItem, index) => {
            if (mediaItem.mediaContentType === 'EXTERNAL_VIDEO') {
              return (
                <div className="embla__slide" key={index}>
                  <ReactPlayer
                    url={mediaItem.embedUrl}
                    controls={true}
                    height={'100%'}
                    width={'100%'}
                    playing={isPlaying}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              );
            }

            return (
              <div className="embla__slide" key={index}>
                <img
                  className="w-full product-image object-cover m-auto flex-grow-0 flex-shrink-0 h-full"
                  src={imageByIndex(index)}
                  alt="Your alt text"
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="embla__buttons">
        <PrevButton onClick={scrollPrev} disabled={prevBtnDisabled} />
        <NextButton onClick={scrollNext} disabled={nextBtnDisabled} />
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {media.map((mediaItem, index) => {
              if (mediaItem.mediaContentType === 'EXTERNAL_VIDEO') {
                return (
                  <EmblaThumbVideo
                    key={index}
                    onClick={() => onThumbClick(index)}
                    selected={index === selectedIndex}
                    index={index}
                    videoSrc={videoByIndex(index)}
                    toggleVideo={toggleVideo}
                    isPlaying={isPlaying}
                  />
                );
              }
              return (
                <EmblaThumbImage
                  key={index}
                  onClick={() => onThumbClick(index)}
                  selected={index === selectedIndex}
                  index={index}
                  imgSrc={imageByIndex(index)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
