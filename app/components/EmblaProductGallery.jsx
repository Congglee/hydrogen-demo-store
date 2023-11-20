import {useState, useEffect, useCallback} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {EmblaThumb} from './EmblaThumb';
import {PrevButton, NextButton} from './EmblaArrowButtons';

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

  // const images = [image1, image2, image3, image4];
  const imageUrls = media.map((image) => image.image.url);
  const imageByIndex = (index) => imageUrls[index % imageUrls.length];

  const scrollPrev = useCallback(
    () => emblaMainApi && emblaMainApi.scrollPrev(),
    [emblaMainApi],
  );
  const scrollNext = useCallback(
    () => emblaMainApi && emblaMainApi.scrollNext(),
    [emblaMainApi],
  );
  // const scrollTo = useCallback(
  //   (index) => emblaMainApi && emblaMainApi.scrollTo(index),
  //   [emblaMainApi],
  // );

  const onInit = useCallback((emblaMainApi) => {
    setScrollSnaps(emblaMainApi.scrollSnapList());
  }, []);

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
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

  return (
    <div className="embla grid col-span-2">
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">
          {slides.map((index) => (
            <div className="embla__slide" key={index}>
              <img
                className="w-full product-image object-cover m-auto flex-grow-0 flex-shrink-0 h-full"
                src={imageByIndex(index)}
                alt="Your alt text"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="embla__buttons">
        <PrevButton onClick={scrollPrev} disabled={prevBtnDisabled} />
        <NextButton onClick={scrollNext} disabled={nextBtnDisabled} />
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {slides.map((index) => (
              <EmblaThumb
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                index={index}
                imgSrc={imageByIndex(index)}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
